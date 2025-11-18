<?php

namespace App\Http\Controllers;

use App\Models\Level;
use App\Models\Program;
use App\Models\Skill;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LevelController extends Controller
{
    public function index()
    {
        $levels = Level::with('program')
            ->latest()
            ->paginate(10);



        return Inertia::render('Levels/index', [
            'levels' => $levels,


        ]);
    }

    public function create()
    {
        $programs = Program::all();


        return Inertia::render('Levels/Create', [
            'programs' => $programs,

            'canCreateProgram' => true
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'program_id' => 'required|exists:programs,id',
            'swimmer_paraments' => 'nullable|string'
        ]);

        $level = Level::create($validated);

        // ✅ Redirigir a Edit en lugar de Index
        return redirect("/levels/{$level->id}/edit")
            ->with('success', 'Nivel creado exitosamente. Ahora puedes agregar habilidades.');
    }

    public function edit(Level $level)
    {
        $programs = Program::all();
        $skills = $level->skills()->orderBy('index')->get();

        return Inertia::render('Levels/Edit', [
            'level' => $level->load('program'),
            'programs' => $programs,
            'skills' => $skills,
            'canCreateProgram' => true
        ]);
    }

    public function update(Request $request, Level $level)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'program_id' => 'required|exists:programs,id',
            'swimmer_paraments' => 'nullable|string'
        ]);

        $level->update($validated);

        return redirect('/levels')
            ->with('success', 'Nivel actualizado exitosamente.');
    }

    public function destroy(Level $level)
    {
        $level->delete();

        return redirect('/levels')
            ->with('success', 'Nivel eliminado exitosamente.');
    }
}
