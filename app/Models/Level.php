<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Level extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'program_id',
        'swimmer_paraments'
    ];

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function skills()
    {
        return $this->hasMany(Skill::class)->orderBy('index');
    }

    public function groups()
    {
        return $this->hasMany(Group::class);
    }

    // Evento para manejar la cascada al eliminar
    protected static function booted()
    {
        static::deleting(function ($level) {
            // Al eliminar un level, también eliminar todas sus skills y subskills
            $level->skills()->each(function ($skill) {
                $skill->subSkills()->delete();
                $skill->delete();
            });
        });
    }
}
