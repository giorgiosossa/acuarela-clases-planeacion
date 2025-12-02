<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromptController extends Controller
{
    /**
     * Show the user's custom prompt settings.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/prompt', [
            'status' => session('status'),
            'currentPrompt' => $request->user()->custom_prompt,
        ]);
    }

    /**
     * Update the user's custom prompt.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'custom_prompt' => ['nullable', 'string', 'max:2000'],
        ]);

        $request->user()->update([
            'custom_prompt' => $validated['custom_prompt'],
        ]);

        return back();
    }
}
