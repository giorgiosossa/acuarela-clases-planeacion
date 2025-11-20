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

   
}
