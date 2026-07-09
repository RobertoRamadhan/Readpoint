<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $fillable = [
        'title',
        'author',
        'isbn',
        'publisher',
        'published_year',
        'pages',
        'genre',
        'grade_level',
        'description',
        'cover_image_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relationships
    public function ebook()
    {
        return $this->hasOne(Ebook::class);
    }

    public function bookAssignments()
    {
        return $this->hasMany(BookAssignment::class);
    }

    public function quizQuestions()
    {
        return $this->hasMany(QuizQuestion::class);
    }
}

