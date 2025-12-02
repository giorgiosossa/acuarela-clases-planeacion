<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgramController extends Controller
{
    /**
     * Display a listing of the programs.
     */
    public function index()
    {
        $programs = Program::with('levels')->latest()->get();

        return Inertia::render('Programs/index', [
            'programs' => $programs
        ]);
    }

    /**
     * Show the form for creating a new program.
     */
    public function create()
    {
        return Inertia::render('Programs/create');
    }

    public function storeFromModal(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $program = Program::create($validated);

        return response()->json([
            'success' => true,
            'program' => $program,
            'message' => 'Programa creado exitosamente.'
        ]);
    }

    /**
     * Store a newly created program in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Program::create($validated);

        return redirect()->route('programs.index')
            ->with('success', 'Programa creado exitosamente');
    }

    /**
     * Display the specified program.
     */
    public function show(Program $program)
    {
        $program->load('levels');

        return Inertia::render('Programs/show', [
            'program' => $program
        ]);
    }

    /**
     * Show the form for editing the specified program.
     */
    public function edit(Program $program)
    {
        return Inertia::render('Programs/edit', [
            'program' => $program
        ]);
    }

    /**
     * Update the specified program in storage.
     */
    public function update(Request $request, Program $program)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $program->update($validated);

        return redirect()->route('programs.index')
            ->with('success', 'Programa actualizado exitosamente');
    }

    /**
     * Remove the specified program from storage.
     */
    public function destroy(Program $program)
    {
        $program->delete();

        return redirect()->route('programs.index')
            ->with('success', 'Programa eliminado exitosamente');
    }
}
