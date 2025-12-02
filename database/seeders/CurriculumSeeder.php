<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use App\Models\Program;
use App\Models\Level;
use App\Models\Skill;

class CurriculumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        User::create([
            'name'=> 'Administrador',
            'password' => bcrypt('password'),
            'email'=> 'admin@admin.com',
            'email_verified_at' => now(),
        ]);
        // Create Program
        $program = Program::create([
            'name' => 'Escolar',
            'description' => 'Desarrollar las 4 esferas del estudiante: social, mental, física y lúdica. Este programa es para niños de 7 a 14 años.',
        ]);

        // Create Level
        $level = Level::create([
            'name' => 'Amarillo',
            'program_id' => $program->id,
            'objective' => 'Iniciación en el agua, primeros pasos: respiración, flotación prona y supina, desplazamiento vertical y horizontal (nada de braceo, se trata de ganar confianza en el agua).',
            'description' => 'Nivel enfocado en la adaptación y familiarización del alumno con el medio acuático, fomentando la seguridad y la confianza antes de introducir técnicas de nado formales.',
            'swimmer_paraments' => 'Nuevos, primera vez en la escuela, incluso en el agua.'
        ]);

        // Create Skills for Level 'Amarillo'
        Skill::create([
            'level_id' => $level->id,
            'name' => 'Reconocimiento de la Alberca',
            'index' => 1,
            'objective' => 'Dejar que el alumno vea y sienta el agua, dónde está, reconocer el área, qué puede pisar y qué no, agarrarse del carril, etc.',
            'description' => 'Familiarización inicial con el entorno de la piscina y sus elementos de seguridad. Desarrollo de la percepción espacial en el agua.',
            'drills' => 'Llevar al alumno de la mano a dar una vuelta por el área de la piscina (12 mts). Caminar por el borde, tocar la pared, identificar las escaleras.'
        ]);

        Skill::create([
            'level_id' => $level->id,
            'name' => 'Desplazamiento Vertical',
            'index' => 2,
            'objective' => 'Que el alumno se mueva verticalmente (caminando, saltando) por la piscina con confianza. Checar que el agua no le moleste si le salpica, que no cierre los ojos bruscamente, que no se aguante la respiración, que se sienta como si estuviera en la tierra.',
            'description' => 'Actividades para lograr autonomía y confort en posición vertical dentro del agua, controlando salpicaduras y manteniendo la respiración natural.',
            'drills' => 'Saltar en el lugar (pies juntos, separados), correr en el agua, caminar hacia adelante y hacia atrás, jugar a “gigantes y enanos” adaptado al agua.'
        ]);

        Skill::create([
            'level_id' => $level->id,
            'name' => 'Respiración',
            'index' => 3,
            'objective' => 'Que el alumno pueda sumergir la cara en la alberca, que pueda meter la nariz y sacar burbujas, enseñarle la técnica de respiración y que pueda saltar y correr y si se resbala que no se espante ya que sabe sacar burbujas, que toque el piso con las manos, que abra los ojos debajo del agua sin miedo, que no tenga miedo a sumergirse.',
            'description' => 'Enseñanza y práctica de la exhalación en el agua (burbujas) y la inmersión facial controlada, eliminando el miedo a tener la cara bajo el agua y al ahogo. Fomentar la apertura de ojos bajo el agua.',
            'drills' => 'Saltos de rana metiendo la cara, saludarse debajo del agua (chocar las manos con un compañero), buscar juguetes en el fondo (poca profundidad), contar burbujas bajo el agua.'
        ]);

        // Create Group
        $group = \App\Models\Group::create([
            'hour_start' => '15:00',
            'days' => 'Lunes, Miércoles',
            'note' => 'Todos son nuevos, primera vez en la escuela incluso en el agua.',
            'level_id' => $level->id,
        ]);

        // Create Swimmers (Students)
        $students = [
            [
                'name' => 'Santiago López',
                'age' => 8,
                'observations' => 'TDAH, se distrae fácilmente. Necesita instrucciones cortas y directas.',
                'skill_index' => 1 // Reconocimiento
            ],
            [
                'name' => 'Valentina García',
                'age' => 7,
                'observations' => 'Miedo inicial al agua fría. Le gusta jugar con los aros sumergibles.',
                'skill_index' => 1 // Reconocimiento
            ],
            [
                'name' => 'Matías Rodríguez',
                'age' => 10,
                'observations' => 'Autismo leve. Muy sensible a los ruidos fuertes (silbato).',
                'skill_index' => 2 // Desplazamiento
            ],
            [
                'name' => 'Camila Hernández',
                'age' => 9,
                'observations' => 'Ninguna condición. Muy enérgica y competitiva.',
                'skill_index' => 2 // Desplazamiento
            ],
            [
                'name' => 'Sebastián Martínez',
                'age' => 12,
                'observations' => 'Asma leve. Usa inhalador antes de clase. Se cansa rápido.',
                'skill_index' => 3 // Respiración
            ],
            [
                'name' => 'Isabella González',
                'age' => 11,
                'observations' => 'Usa gafas graduadas. Asegurar que las traiga puestas o use goggles con aumento si tiene.',
                'skill_index' => 3 // Respiración
            ]
        ];

        // Retrieve skills to assign IDs
        $skills = Skill::where('level_id', $level->id)->get();

        foreach ($students as $studentData) {
            // Find the skill ID based on the index we set (1, 2, or 3)
            $skill = $skills->firstWhere('index', $studentData['skill_index']);

            \App\Models\Swimmer::create([
                'name' => $studentData['name'] . ' (' . $studentData['age'] . ' años)', // Append age to name for simplicity or add age column if schema permits
                'group_id' => $group->id,
                'skill_id' => $skill ? $skill->id : $skills->first()->id,
                'observations' => $studentData['observations']
            ]);
        }
    }
}
