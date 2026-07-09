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
