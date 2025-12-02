<?php

namespace App\Http\Controllers;

use App\Models\Swimmer;
use App\Models\Skill;
use Illuminate\Http\Request;

class SwimmerController extends Controller
{
    // Crear swimmer desde modal
    public function storeFromModal(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'skill_id' => 'required|exists:skills,id',
            'group_id' => 'required|exists:groups,id',
            'observations' => 'nullable|string'
        ]);

        $swimmer = Swimmer::create($validated);
        $swimmer->load('currentSkill'); // Cargar la relación para devolverla

        return response()->json([
            'success' => true,
            'message' => 'Nadador agregado correctamente',
            'swimmer' => $swimmer
        ]);
    }

    // Actualizar skill del swimmer
    public function updateSkill(Request $request, Swimmer $swimmer)
    {
        $validated = $request->validate([
            'skill_id' => 'required|exists:skills,id',
        ]);

        $swimmer->update($validated);
        
        // Recargar el modelo completo con la relación actualizada
        $swimmer = $swimmer->fresh('currentSkill');

        return response()->json([
            'success' => true,
            'swimmer' => $swimmer,
            'message' => 'Habilidad actualizada exitosamente.'
        ]);
    }

    // Eliminar swimmer del grupo
    public function destroy(Swimmer $swimmer)
    {
        $swimmer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Nadador eliminado exitosamente.'
        ]);
    }
}
