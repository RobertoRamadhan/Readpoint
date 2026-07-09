<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReadingActivity extends Model
{
    protected $fillable = [
        'user_id',
        'ebook_id',
        'started_at',
        'completed_at',
        'current_page',
        'final_page',
        'duration_minutes',
        'notes',
        'status',
        'points_earned',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ebook()
    {
        return $this->belongsTo(Ebook::class);
    }

    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function validation()
    {
        return $this->hasOne(Validation::class);
    }

    public function pointTransactions()
    {
        return $this->hasMany(PointTransaction::class);
    }
}

