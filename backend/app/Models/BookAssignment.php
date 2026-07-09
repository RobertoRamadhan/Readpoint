<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookAssignment extends Model
{
    protected $fillable = [
        'user_id',
        'book_id',
        'ebook_id',
        'assigned_at',
        'deadline',
        'status',
        'teacher_notes',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'deadline' => 'datetime',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function ebook()
    {
        return $this->belongsTo(Ebook::class);
    }
}

