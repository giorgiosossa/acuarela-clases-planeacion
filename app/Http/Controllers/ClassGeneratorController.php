<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ClassGeneratorController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'focus' => 'nullable|string',
            'duration' => 'required|integer|min:15|max:180',
            'materials' => 'nullable|array',
            'materials.*' => 'string'
        ]);

        $generation = \App\Models\ClassGeneration::create([
            'group_id' => $request->group_id,
            'status' => 'pending'
        ]);

        \App\Jobs\GenerateClassJob::dispatch($generation->id, $request->all(), auth()->id());

        return response()->json([
            'success' => true,
            'generationId' => $generation->id,
            'message' => 'Generación iniciada en segundo plano.'
        ]);
    }

    public function checkStatus($id)
    {
        $generation = \App\Models\ClassGeneration::find($id);

        if (!$generation) {
            return response()->json(['success' => false, 'message' => 'Not found'], 404);
        }

        return response()->json([
            'success' => true,
            'status' => $generation->status,
            'plan' => $generation->content,
            'error' => $generation->error_message
        ]);
    }
}
