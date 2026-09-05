<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

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
    * Akses guru hanya berdasarkan assignment eksplisit wali_kelas_id.
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

        if ($guru->role === 'admin') {
            return;
        }

        $hasKelas = $guru->grade_level || $guru->class_name;
        if (!$hasKelas) {
            $query->whereRaw('1 = 0');
            return;
        }

        $query->where('wali_kelas_id', $guru->id);
    }
}
