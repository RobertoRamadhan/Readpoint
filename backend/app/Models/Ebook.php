<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Services\StorageHelper;

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

    /**
     * Kembalikan URL publik cover dari Supabase Storage.
     * Accessor ini menggunakan StorageHelper agar konsisten dengan controller.
     */
    public function getCoverUrlAttribute(): ?string
    {
        return $this->cover_image ? StorageHelper::url($this->cover_image, 'cover') : null;
    }

    /**
     * Kembalikan URL publik file PDF dari Supabase Storage.
     */
    public function getPdfUrlAttribute(): ?string
    {
        return $this->file_path ? StorageHelper::url($this->file_path, 'ebook') : null;
    }

    // Catatan: relasi book() tidak diaktifkan karena tabel ebooks tidak memiliki
    // FK book_id. Tambahkan migrasi terlebih dahulu jika diperlukan.

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

    public function readingProgress()
    {
        return $this->hasMany(ReadingProgress::class);
    }
}
