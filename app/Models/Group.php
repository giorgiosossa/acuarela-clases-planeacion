<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'hour_start',
        'level_id',
        'days',
        'note'
    ];



    public function level()
    {
        return $this->belongsTo(Level::class);
    }

    public function swimmers()
    {
        return $this->hasMany(Swimmer::class);
    }

}
