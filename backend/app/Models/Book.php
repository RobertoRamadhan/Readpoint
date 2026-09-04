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
    public function bookAssignments()
    {
        return $this->hasMany(BookAssignment::class);
    }

    // Catatan: relasi ebook() dan quizQuestions() dihapus karena tabel ebooks
    // dan quiz_questions tidak memiliki FK book_id. Tambahkan migrasi FK terlebih
    // dahulu jika relasi ini diperlukan di masa depan.
}

