<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Level;
use App\Models\Skill;
use App\Models\Swimmer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GroupController extends Controller
{
    // Lista de grupos agrupados por día
    public function index()
    {
        $groups = Group::with(['level', 'swimmers.currentSkill'])
            ->withCount('swimmers')
            ->latest()
            ->get();

        $groupsByDay = $groups->groupBy('days');
        $availableDays = $groups->pluck('days')->unique()->values();

        // ✅ Agregar levels para el modal de crear
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
            'hour' => 'required|string|max:255',
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
        $groups = Group::with('level', 'swimmers.currentSkill')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Groups/Report', [
            'groups' => $groups
        ]);
    }

    // Método para exportar PDF
    public function exportPdf()
    {
        $groups = Group::orderBy('created_at', 'desc')->get();

        $pdf = Pdf::loadView('pdf.groups', [
            'groups' => $groups,
            'date' => now()->format('d/m/Y H:i')
        ]);

        return $pdf->download('grupos-' . now()->format('Y-m-d') . '.pdf');
    }
}
