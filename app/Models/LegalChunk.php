<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegalChunk extends Model
{
    protected $fillable = [
        'content',
        'embedding',
        'source',
    ];

    protected $casts = [
        'embedding' => 'array',
    ];
}
