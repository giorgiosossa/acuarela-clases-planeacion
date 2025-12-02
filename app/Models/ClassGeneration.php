<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassGeneration extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'status',
        'content',
        'error_message'
    ];

    protected $casts = [
        'content' => 'array',
    ];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }
}