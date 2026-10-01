<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    protected $fillable = [
        'user_id',
        'ebook_id',
        'reading_activity_id',
        'total_questions',
        'correct_answers',
        'score',
        'passed',
        'answers',
        'essay_grades',
        'pending_review',
    ];

    protected $casts = [
        'answers' => 'array',
        'essay_grades' => 'array',
        'pending_review' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ebook()
    {
        return $this->belongsTo(Ebook::class);
    }

    public function readingActivity()
    {
        return $this->belongsTo(ReadingActivity::class);
    }
}
