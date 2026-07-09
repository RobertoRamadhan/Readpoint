<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ebook extends Model
{
    protected $fillable = [
        'title',
        'author',
        'pages',
        'poin_per_halaman',
        'category',
        'grade_level',
        'file_path',
        'cover_image',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Get full URL for file access
    public function getFileUrlAttribute()
    {
        return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }

    public function getCoverUrlAttribute()
    {
        return $this->cover_image ? asset('storage/' . $this->cover_image) : null;
    }

    // Note: book() relationship is currently not used as there's no book_id foreign key
    // This relationship can be added if needed in future with a migration
    // public function book()
    // {
    //     return $this->belongsTo(Book::class);
    // }

    public function readingActivities()
    {
        return $this->hasMany(ReadingActivity::class);
    }

    public function quizQuestions()
    {
        return $this->hasMany(QuizQuestion::class);
    }

    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
