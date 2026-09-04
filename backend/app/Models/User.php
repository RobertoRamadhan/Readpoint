<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'grade_level',
        'class_name',
        'wali_kelas_id',
        'profile_photo_url',
        'google_id',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function readingActivities()
    {
        return $this->hasMany(ReadingActivity::class);
    }

    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function pointTransactions()
    {
        return $this->hasMany(PointTransaction::class);
    }

    public function redemptions()
    {
        return $this->hasMany(Redemption::class);
    }

    public function validatedReadings()
    {
        return $this->hasMany(Validation::class, 'validated_by');
    }

    public function bookAssignments()
    {
        return $this->hasMany(BookAssignment::class);
    }

    // Wali kelas (guru) dari siswa ini
    public function waliKelas()
    {
        return $this->belongsTo(User::class, 'wali_kelas_id');
    }

    // Siswa-siswa yang diwali oleh guru ini
    public function murid()
    {
        return $this->hasMany(User::class, 'wali_kelas_id');
    }

    // Get total points for user
    public function getTotalPoints()
    {
        return $this->pointTransactions()->sum('points');
    }

    /**
     * Scope: kembalikan query siswa yang sekelas dengan $guru.
     *
     * Cara pencocokan (OR):
     *  1. wali_kelas_id === $guru->id  (assignment eksplisit)
     *  2. grade_level + class_name cocok dengan milik guru (fallback)
     *
     * Jika guru belum punya kelas sama sekali, scope tidak menambahkan
     * filter apapun sehingga semua siswa dikembalikan — caller bertanggung
     * jawab untuk menangani kasus ini sesuai kebutuhan bisnis.
     *
     * Contoh pemakaian:
     *   User::siswaSeKelas($guru)->pluck('id')
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  \App\Models\User  $guru
     */
    public function scopeSiswaSeKelas($query, self $guru)
    {
        $query->where('role', 'siswa');

        $hasKelas = $guru->grade_level || $guru->class_name;
        if (!$hasKelas) {
            return; // Tidak ada filter — kembalikan semua siswa
        }

        $query->where(function ($q) use ($guru) {
            // Cara 1: eksplisit via wali_kelas_id
            $q->where('wali_kelas_id', $guru->id);

            // Cara 2: fallback via grade_level + class_name
            if ($guru->grade_level && $guru->class_name) {
                $q->orWhere(function ($q2) use ($guru) {
                    $q2->where('grade_level', $guru->grade_level)
                       ->where('class_name', $guru->class_name);
                });
            } elseif ($guru->class_name) {
                $q->orWhere('class_name', $guru->class_name);
            } elseif ($guru->grade_level) {
                $q->orWhere('grade_level', $guru->grade_level);
            }
        });
    }
}
