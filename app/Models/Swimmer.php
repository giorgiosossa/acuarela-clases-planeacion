<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Swimmer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'skill_id',
        'group_id',
        'review',
        'complement',
        'observations',
    ];

    public function group(){
        return $this->belongsTo(Group::class);
    }

    public function currentSkill()
    {
        return $this->belongsTo(Skill::class, 'skill_id');
    }

}
