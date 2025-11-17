<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\LevelController;
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
    Route::get('/levels/{level}/skills', [SkillController::class, 'index'])->name('skills.index');
    Route::post('/skills', [SkillController::class, 'store'])->name('skills.store');
    Route::put('/skills/{skill}', [SkillController::class, 'update'])->name('skills.update');
    Route::delete('/skills/{skill}', [SkillController::class, 'destroy'])->name('skills.destroy');
    Route::post('/skills/reorder', [SkillController::class, 'reorder'])->name('skills.reorder');
});

require __DIR__.'/settings.php';
