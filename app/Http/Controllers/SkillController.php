<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use App\Models\Level;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SkillController extends Controller
{
    // Crear skill desde modal (sin redirección)
    public function storeFromModal(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:skills,name',
            'level_id' => 'required|exists:levels,id',
            'objective' => 'nullable|string',
            'description' => 'nullable|string',
            'drills' => 'nullable|string',
        ]);

        $maxIndex = Skill::where('level_id', $validated['level_id'])->max('index') ?? 0;

        $skill = Skill::create([
            'name' => $validated['name'],
            'level_id' => $validated['level_id'],
            'index' => $maxIndex + 1,
            'objective' => $validated['objective'] ?? null,
            'description' => $validated['description'] ?? null,
            'drills' => $validated['drills'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'skill' => $skill,
            'message' => 'Habilidad creada exitosamente.'
        ]);
    }

    // Actualizar orden de skills con drag and drop
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'skills' => 'required|array',
            'skills.*.id' => 'required|exists:skills,id',
            'skills.*.index' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['skills'] as $skillData) {
                Skill::where('id', $skillData['id'])
                    ->update(['index' => $skillData['index']]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Orden actualizado exitosamente.'
        ]);
    }

    // Actualizar una skill
    public function update(Request $request, Skill $skill)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:skills,name,' . $skill->id,
            'objective' => 'nullable|string',
            'description' => 'nullable|string',
            'drills' => 'nullable|string',
        ]);

        $skill->update($validated);

        return response()->json([
            'success' => true,
            'skill' => $skill,
            'message' => 'Habilidad actualizada exitosamente.'
        ]);
    }

    // Eliminar una skill
    public function destroy(Skill $skill)
    {
        try {
            Log::info('Eliminando skill ID: ' . $skill->id);

            $skill->delete();

            return response()->json([
                'success' => true,
                'message' => 'Habilidad eliminada exitosamente.'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al eliminar skill: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
