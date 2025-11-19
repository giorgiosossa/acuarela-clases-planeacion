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

    protected $casts = [
        'index' => 'integer'
    ];

    public function level()
    {
        return $this->belongsTo(Level::class);
    }



    public function currentSwimmers()
    {
        return $this->hasMany(Swimmer::class, 'skill_id');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('index');
    }

    protected static function booted()
    {
        static::deleting(function ($skill) {

            // Poner en null los swimmers que tenían esta skill
            $skill->currentSwimmers()->update(['skill_id' => null]);
        });
    }
}
