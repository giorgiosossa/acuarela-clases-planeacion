<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use App\Models\Level;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SkillController extends Controller
{
    public function index(Level $level)
    {
        $skills = $level->skills()
            ->orderBy('index')
            ->get();

        return Inertia::render('Skills/Index', [
            'level' => $level->load('program'),
            'skills' => $skills
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:skills',
            'level_id' => 'required|exists:levels,id',
            'index' => 'required|integer|min:0'
        ]);

        $skill = Skill::create($validated);

        return response()->json([
            'success' => true,
            'skill' => $skill,
            'message' => 'Habilidad creada exitosamente.'
        ]);
    }

    public function update(Request $request, Skill $skill)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:skills,name,' . $skill->id,
            'index' => 'required|integer|min:0'
        ]);

        $skill->update($validated);

        return response()->json([
            'success' => true,
            'skill' => $skill,
            'message' => 'Habilidad actualizada exitosamente.'
        ]);
    }

    public function destroy(Skill $skill)
    {
        $skill->delete();

        return redirect()->back()
            ->with('success', 'Habilidad eliminada exitosamente.');
    }

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'skills' => 'required|array',
            'skills.*.id' => 'required|exists:skills,id',
            'skills.*.index' => 'required|integer|min:0'
        ]);

        foreach ($validated['skills'] as $skillData) {
            Skill::where('id', $skillData['id'])
                ->update(['index' => $skillData['index']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Orden actualizado exitosamente.'
        ]);
    }
}
