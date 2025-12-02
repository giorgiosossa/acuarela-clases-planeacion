<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Level;
use App\Models\Skill;
use App\Models\Swimmer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class GroupController extends Controller
{
    // Lista de grupos agrupados por día
    public function index()
    {
        $groups = Group::with(['level', 'swimmers.currentSkill'])
            ->withCount('swimmers')
            ->orderBy('hour_start')
            ->get();

        $groupsByDay = $groups->groupBy('days');
        $availableDays = $groups->pluck('days')->unique()->values();
        $levels = Level::all();

        return Inertia::render('Groups/Index', [
            'groupsByDay' => $groupsByDay,
            'availableDays' => $availableDays,
            'levels' => $levels,
        ]);
    }

    // Ver grupos de un día específico
    public function showDay($day)
    {
        $groups = Group::with(['level', 'swimmers.currentSkill'])
            ->where('days', $day)
            ->orderBy('hour_start')
            ->get();

        $levels = Level::all();

        return Inertia::render('Groups/Day', [
            'day' => $day,
            'groups' => $groups,
            'levels' => $levels,
        ]);
    }

    // Crear grupo desde modal
    public function storeFromModal(Request $request)
    {
        $validated = $request->validate([
            'hour_start' => 'required|date_format:H:i',
            'days' => 'required|string|max:255',
            'note' => 'nullable|string',
            'level_id' => 'required|exists:levels,id',
        ]);

        $group = Group::create($validated);
        $group->load(['level', 'swimmers.currentSkill']);

        return response()->json([
            'success' => true,
            'group' => $group,
            'message' => 'Grupo creado exitosamente.'
        ]);
    }

    // Actualizar nota del grupo
    public function updateNote(Request $request, Group $group)
    {
        $validated = $request->validate([
            'note' => 'nullable|string',
        ]);

        $group->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Nota actualizada exitosamente.'
        ]);
    }

    // Eliminar grupo
    public function destroy(Group $group)
    {

        $group->delete();

        return response()->json([

        ]);
    }

    // Obtener skills de un level específico
    public function getLevelSkills($levelId)
    {
        $skills = Skill::where('level_id', $levelId)
            ->orderBy('index')
            ->get();

        return response()->json([
            'success' => true,
            'skills' => $skills
        ]);
    }

    //  Método para la página de reporte
    public function report()
    {
        // Orden de días para ordenar los grupos
        $daysOrder = [
            'Lunes' => 1,
            'Martes' => 2,
            'Miércoles' => 3,
            'Jueves' => 4,
            'Viernes' => 5,
            'Sábado' => 6,
            'Domingo' => 7,
            'Especial' => 8,
        ];

        $groups = Group::with('level', 'swimmers.currentSkill')
            ->get()
            ->sortBy(function ($group) use ($daysOrder) {
                // Obtener el primer día del grupo
                $firstDay = trim(explode(',', $group->days)[0]);
                return $daysOrder[$firstDay] ?? 999;
            })
            ->values();

        // Mapear los días en español a inglés para Carbon
        $daysMap = [
            'Lunes' => 'Monday',
            'Martes' => 'Tuesday',
            'Miércoles' => 'Wednesday',
            'Jueves' => 'Thursday',
            'Viernes' => 'Friday',
            'Sábado' => 'Saturday',
            'Domingo' => 'Sunday',
        ];

        // Procesar cada grupo para agregar información del mes
        $groupsWithCalendar = $groups->map(function ($group) use ($daysMap) {
            // Obtener el mes actual
            $currentMonth = Carbon::now();
            $monthStart = $currentMonth->copy()->startOfMonth();
            $monthEnd = $currentMonth->copy()->endOfMonth();

            // Convertir los días del grupo a un array
            $groupDays = array_map('trim', explode(',', $group->days));

            // Obtener todas las fechas del mes que coincidan con los días del grupo
            $datesInMonth = [];
            for ($date = $monthStart->copy(); $date->lte($monthEnd); $date->addDay()) {
                $dayNameInSpanish = array_search($date->format('l'), $daysMap);

                if ($dayNameInSpanish && in_array($dayNameInSpanish, $groupDays)) {
                    $datesInMonth[] = [
                        'day' => $dayNameInSpanish,
                        'date' => $date->format('Y-m-d'),
                        'day_number' => $date->day,
                        'formatted' => $date->format('d/m'),
                    ];
                }
            }

            // Obtener los índices únicos de skills de los nadadores
            $uniqueSkillIndexes = $group->swimmers
                ->pluck('currentSkill.index')
                ->unique()
                ->sort()
                ->values()
                ->toArray();


            $totalSkillsInLevel = Skill::where('level_id', $group->level_id)->max('index') ?? 0;

            return [
                'id' => $group->id,
                'hour_start' => $group->hour_start,
                'days' => $group->days,
                'note' => $group->note,
                'level' => $group->level,
                'swimmers' => $group->swimmers,
                'created_at' => $group->created_at,
                'month_name' => $currentMonth->locale('es')->translatedFormat('F Y'),
                'month_year' => $currentMonth->format('Y-m'),
                'dates_in_month' => $datesInMonth,
                'unique_skill_indexes' => $uniqueSkillIndexes,
                'max_skill_index' => $totalSkillsInLevel, // NUEVO
            ];
        });

        return Inertia::render('Groups/Report', [
            'groups' => $groupsWithCalendar
        ]);
    }

// Método para exportar PDF
    public function exportPdf()
    {
        // Orden de días para ordenar los grupos
        $daysOrder = [
            'Lunes' => 1,
            'Martes' => 2,
            'Miércoles' => 3,
            'Jueves' => 4,
            'Viernes' => 5,
            'Sábado' => 6,
            'Domingo' => 7,
            'Especial' => 8,
        ];

        $groups = Group::with('level', 'swimmers.currentSkill')
            ->get()
            ->sortBy(function ($group) use ($daysOrder) {
                $firstDay = trim(explode(',', $group->days)[0]);
                return $daysOrder[$firstDay] ?? 999;
            })
            ->values();

        // Mapear los días en español a inglés para Carbon
        $daysMap = [
            'Lunes' => 'Monday',
            'Martes' => 'Tuesday',
            'Miércoles' => 'Wednesday',
            'Jueves' => 'Thursday',
            'Viernes' => 'Friday',
            'Sábado' => 'Saturday',
            'Domingo' => 'Sunday',
        ];

        // Procesar cada grupo para agregar información del mes
        $groupsWithCalendar = $groups->map(function ($group) use ($daysMap) {
            $currentMonth = Carbon::now();
            $monthStart = $currentMonth->copy()->startOfMonth();
            $monthEnd = $currentMonth->copy()->endOfMonth();

            $groupDays = array_map('trim', explode(',', $group->days));

            $datesInMonth = [];
            for ($date = $monthStart->copy(); $date->lte($monthEnd); $date->addDay()) {
                $dayNameInSpanish = array_search($date->format('l'), $daysMap);

                if ($dayNameInSpanish && in_array($dayNameInSpanish, $groupDays)) {
                    $datesInMonth[] = [
                        'day' => $dayNameInSpanish,
                        'date' => $date->format('Y-m-d'),
                        'day_number' => $date->day,
                        'formatted' => $date->day,
                    ];
                }
            }

            // Obtener los índices únicos de skills de los nadadores
            $uniqueSkillIndexes = $group->swimmers
                ->pluck('currentSkill.index')
                ->unique()
                ->sort()
                ->values()
                ->toArray();


            $totalSkillsInLevel = Skill::where('level_id', $group->level_id)->max('index') ?? 0;

            return [
                'id' => $group->id,
                'hour_start' => $group->hour_start,
                'days' => $group->days,
                'note' => $group->note,
                'level' => $group->level,
                'swimmers' => $group->swimmers,
                'created_at' => $group->created_at,
                'month_name' => $currentMonth->locale('es')->translatedFormat('F Y'),
                'month_year' => $currentMonth->format('Y-m'),
                'dates_in_month' => $datesInMonth,
                'unique_skill_indexes' => $uniqueSkillIndexes,
                'max_skill_index' => $totalSkillsInLevel, // NUEVO
            ];
        });

        $pdf = Pdf::loadView('pdf.groups', [
            'groups' => $groupsWithCalendar,
            'date' => now()->format('d/m/Y H:i'),
            'month' => Carbon::now()->locale('es')->translatedFormat('F Y')
        ]);

        // Configurar orientación horizontal para mejor visualización
        $pdf->setPaper('a4', 'landscape');

        return $pdf->download('reporte-grupos-' . now()->format('Y-m-d') . '.pdf');
    }


    // En GroupController.php
    public function getGroupsWithCalendar()
    {
        $daysOrder = [
            'Lunes' => 1, 'Martes' => 2, 'Miércoles' => 3, 'Jueves' => 4,
            'Viernes' => 5, 'Sábado' => 6, 'Domingo' => 7, 'Especial' => 8,
        ];

        $groups = Group::with('level', 'swimmers.currentSkill')
            ->get()
            ->sortBy(function ($group) use ($daysOrder) {
                $firstDay = trim(explode(',', $group->days)[0]);
                return $daysOrder[$firstDay] ?? 999;
            })
            ->values();

        $daysMap = [
            'Lunes' => 'Monday', 'Martes' => 'Tuesday', 'Miércoles' => 'Wednesday',
            'Jueves' => 'Thursday', 'Viernes' => 'Friday', 'Sábado' => 'Saturday',
            'Domingo' => 'Sunday',
        ];

        return $groups->map(function ($group) use ($daysMap) {
            $currentMonth = Carbon::now();
            $monthStart = $currentMonth->copy()->startOfMonth();
            $monthEnd = $currentMonth->copy()->endOfMonth();
            $groupDays = array_map('trim', explode(',', $group->days));

            $datesInMonth = [];
            for ($date = $monthStart->copy(); $date->lte($monthEnd); $date->addDay()) {
                $dayNameInSpanish = array_search($date->format('l'), $daysMap);
                if ($dayNameInSpanish && in_array($dayNameInSpanish, $groupDays)) {
                    $datesInMonth[] = [
                        'day' => $dayNameInSpanish,
                        'date' => $date->format('Y-m-d'),
                        'day_number' => $date->day,
                        'formatted' => $date->format('d/m'),
                    ];
                }
            }

            $uniqueSkillIndexes = $group->swimmers
                ->pluck('currentSkill.index')
                ->unique()
                ->sort()
                ->values()
                ->toArray();

            $totalSkillsInLevel = Skill::where('level_id', $group->level_id)->max('index') ?? 0;

            return [
                'id' => $group->id,
                'hour_start' => $group->hour_start,
                'days' => $group->days,
                'note' => $group->note,
                'level' => $group->level,
                'swimmers' => $group->swimmers,
                'created_at' => $group->created_at,
                'month_name' => $currentMonth->locale('es')->translatedFormat('F Y'),
                'month_year' => $currentMonth->format('Y-m'),
                'dates_in_month' => $datesInMonth,
                'unique_skill_indexes' => $uniqueSkillIndexes,
                'max_skill_index' => $totalSkillsInLevel,
            ];
        });
    }


}
