<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Candidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'position',
        'resume_url',
        'stage',
        'rating',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class)->latest();
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class)->latest();
    }
}
