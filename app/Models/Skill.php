<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'index',
        'level_id'
    ];

    // Cast para asegurar que index sea siempre un entero
    protected $casts = [
        'index' => 'integer'
    ];

    public function level()
    {
        return $this->belongsTo(Level::class);
    }

    public function subSkills()
    {
        return $this->hasMany(SubSkill::class);
    }

    public function swimmerProgress()
    {
        return $this->hasMany(SwimmerProgress::class);
    }

    // Swimmers que tienen esta skill como habilidad actual
    public function currentSwimmers()
    {
        return $this->hasMany(Swimmer::class, 'skill_id');
    }

    // Scope para ordenar por index
    public function scopeOrdered($query)
    {
        return $query->orderBy('index');
    }

    // Evento para manejar la cascada al eliminar
    protected static function booted()
    {
        static::deleting(function ($skill) {
            // Al eliminar una skill, también eliminar todas sus subskills
            $skill->subSkills()->delete();
        });
    }
}
