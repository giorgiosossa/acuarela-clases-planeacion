<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\LevelController;
use App\Http\Controllers\SwimmerController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\SkillController;



Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Rutas de Programs
    Route::resource('programs', ProgramController::class);
    Route::post('/programs/modal', [ProgramController::class, 'storeFromModal'])->name('programs.storeFromModal');

    // Rutas de Levels
    Route::resource('levels', LevelController::class);

    // Rutas de Skills
    Route::post('/skills/modal', [SkillController::class, 'storeFromModal']);
    Route::post('/skills/reorder', [SkillController::class, 'reorder']);
    Route::put('/skills/{skill}', [SkillController::class, 'update']);
    Route::delete('/skills/{skill}', [SkillController::class, 'destroy']);

    // Rutas para Groups
    Route::get('/groups', [GroupController::class, 'index'])->name('groups.index');
    Route::get('/groups/day/{day}', [GroupController::class, 'showDay'])->name('groups.day');
    Route::post('/groups/modal', [GroupController::class, 'storeFromModal']);
    Route::put('/groups/{group}/note', [GroupController::class, 'updateNote']);
    Route::delete('/groups/{group}', [GroupController::class, 'destroy']);
    Route::get('/groups/level/{levelId}/skills', [GroupController::class, 'getLevelSkills']);

    // Rutas para Swimmers
    Route::post('/swimmers/modal', [SwimmerController::class, 'storeFromModal']);
    Route::put('/swimmers/{swimmer}/skill', [SwimmerController::class, 'updateSkill']);
    Route::delete('/swimmers/{swimmer}', [SwimmerController::class, 'destroy']);
});

require __DIR__.'/settings.php';
