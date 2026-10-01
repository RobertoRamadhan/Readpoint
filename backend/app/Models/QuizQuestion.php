<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizQuestion extends Model
{
    protected $fillable = [
        'ebook_id',
        'created_by',
        'question',
        'option_a',
        'option_b',
        'option_c',
        'option_d',
        'correct_answer',
        'question_type',
        'model_answer',
        'explanation',
        'source_pages',
    ];

    protected $casts = [
        'source_pages' => 'array',
    ];

    public function ebook()
    {
        return $this->belongsTo(Ebook::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
