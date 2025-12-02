<?php

namespace App\Jobs;

use App\Models\ClassGeneration;
use App\Models\Group;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GenerateClassJob implements ShouldQueue
{
    use Queueable;

    public $generationId;
    public $requestData;
    public $userId;

    /**
     * Create a new job instance.
     */
    public function __construct($generationId, $requestData, $userId)
    {
        $this->generationId = $generationId;
        $this->requestData = $requestData;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $generation = ClassGeneration::find($this->generationId);
        if (!$generation) return;

        $generation->update(['status' => 'processing']);

        try {
            $group = Group::with(['level.program', 'level.skills', 'swimmers.currentSkill'])->find($this->requestData['group_id']);

            if (!$group) {
                throw new \Exception('Group not found');
            }

            // 1. Contexto Rico de los Alumnos
            $swimmersBySkill = $group->swimmers->groupBy('skill_id');
            $swimmersContext = "";

            foreach ($swimmersBySkill as $skillId => $swimmers) {
                $skill = $swimmers->first()->currentSkill;
                $names = $swimmers->pluck('name')->join(', ');

                $skillInfo = $skill ?
                    "Habilidad: '{$skill->name}'\n   - Objetivo: {$skill->objective}\n   - Descripción Técnica: {$skill->description}\n   - Ejercicios Recomendados (Drills): {$skill->drills}" :
                    "Habilidad: Sin asignar (Principiante)";

                $swimmersContext .= "- Alumnos: {$names}\n   {$skillInfo}\n   Observaciones: " . $swimmers->pluck('observations')->filter()->join('; ') . "\n\n";
            }

            // 2. Contexto del Nivel
            $levelContext = $group->level->skills->map(function ($skill) {
                return "{$skill->index}. {$skill->name}: {$skill->description}";
            })->join("\n");

            // Fetch user via ID manually since Auth facade isn't available in Job
            $user = \App\Models\User::find($this->userId);
            $customInstructions = ($user && $user->custom_prompt) ? "INSTRUCCIONES PERSONALES DEL PROFESOR:\n" . $user->custom_prompt : "";

            $focus = $this->requestData['focus'] ?? 'Equilibrado';
            $duration = $this->requestData['duration'];
            $materials = isset($this->requestData['materials']) ? implode(", ", $this->requestData['materials']) : "Ninguno específico (usar estándar)";

            $prompt = <<<EOT
Actúa como un COORDINADOR ACUÁTICO EXPERTO. Tu objetivo es crear una clase altamente personalizada y técnica.

CONTEXTO INSTITUCIONAL (METODOLOGÍA):
- Programa: {$group->level->program->name}
- Descripción del Programa: {$group->level->program->description}
- Nivel Actual: {$group->level->name}
- Objetivo del Nivel: {$group->level->objective}
- Descripción del Nivel: {$group->level->description}

PERFIL DE LA CLASE (ALUMNOS Y SUS NECESIDADES ESPECÍFICAS):
{$swimmersContext}

CONFIGURACIÓN DE LA SESIÓN:
- Duración: {$duration} minutos (CRÍTICO: La suma de etapas debe ser exacta).
- Enfoque: {$focus}
- Material Disponible: {$materials}

CONTEXTO DE PROGRESIÓN (Skills del nivel):
{$levelContext}

{$customInstructions}

INSTRUCCIONES DE GENERACIÓN:
Genera una clase donde CADA ejercicio esté diseñado específicamente para las habilidades actuales de los alumnos mencionados.
- Si hay alumnos en la misma habilidad, agrúpalos en la misma estación o carril.
- Si hay alumnos en habilidades diferentes, sugiere ejercicios diferenciados o circuitos donde cada uno trabaje su objetivo.
- Usa los "Ejercicios Recomendados (Drills)" provistos en el perfil del alumno siempre que sea posible.

ESTRUCTURA DE RESPUESTA (JSON):
{
  "stages": [
    {
      "etapa": "...",
      "descripcion": "...",
      "organizacion": "...",
      "material": "...",
      "tiempo_minutos": 0,
      "intensidad": "..."
    }
  ]
}
Responde SOLO con el JSON.
EOT;

            $apiKey = env('GEMINI_API_KEY');
            if (!$apiKey) {
                throw new \Exception('API Key not configured');
            }

            $response = Http::timeout(120)->withHeaders([
                'Content-Type' => 'application/json',
                'x-goog-api-key' => $apiKey
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'responseMimeType' => 'application/json',
                ]
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $generatedText = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
                $generatedText = preg_replace('/^```json\s*|\s*```$/', '', $generatedText);
                $plan = json_decode($generatedText, true);

                if (is_array($plan) && !isset($plan['stages']) && isset($plan[0])) {
                    $plan = ['stages' => $plan];
                }

                $generation->update([
                    'status' => 'completed',
                    'content' => $plan
                ]);
            } else {
                Log::error('Gemini API Error', ['response' => $response->body()]);
                throw new \Exception('Gemini API Error: ' . $response->status());
            }

        } catch (\Exception $e) {
            Log::error('Class Generation Job Failed', ['error' => $e->getMessage()]);
            $generation->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()
            ]);
        }
    }
}