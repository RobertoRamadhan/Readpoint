<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Ebook;
use App\Models\Reward;
use App\Models\QuizAttempt;
use App\Models\ReadingActivity;
use App\Models\BookAssignment;
use App\Models\QuizQuestion;
use App\Models\Validation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    // Admin Dashboard Stats
    public function adminStats()
    {
        try {
            $today = now()->format('Y-m-d');
            
            // Use cache for 5 minutes to reduce database load
            $stats = \Cache::remember('admin_stats_' . $today, 300, function () use ($today) {
                return [
                    'total_siswa' => User::where('role', 'siswa')
                        ->where('email', 'not like', 'deleted_%')
                        ->where('email', 'not like', '%@deleted.local')
                        ->count(),
                    'total_guru' => User::where('role', 'guru')
                        ->where('email', 'not like', 'deleted_%')
                        ->where('email', 'not like', '%@deleted.local')
                        ->count(),
                    'total_ebook' => Ebook::where('is_active', true)->count(),
                    'total_reward' => Reward::where('is_active', true)->count(),
                    'siswa_aktif_hari_ini' => ReadingActivity::whereDate('created_at', $today)
                        ->distinct('user_id')
                        ->count('user_id'),
                    'buku_dibaca_hari_ini' => ReadingActivity::whereDate('created_at', $today)->count(),
                    'kuis_dikerjakan_hari_ini' => QuizAttempt::whereDate('created_at', $today)->count(),
                    'reward_diklaim_hari_ini' => DB::table('redemptions')
                        ->whereDate('created_at', $today)
                        ->count(),
                ];
            });
            
            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Admin - Top Students
    public function topStudents()
    {
        try {
            // Cache for 10 minutes
            $topStudents = \Cache::remember('admin_top_students', 600, function () {
                // Optimized query - single JOIN instead of N+1 queries
                return User::where('users.role', 'siswa')
                    ->where('users.email', 'not like', 'deleted_%')
                    ->where('users.email', 'not like', '%@deleted.local')
                    ->select('users.id', 'users.name', 'users.email')
                    ->selectRaw('COALESCE(SUM(point_transactions.points), 0) as total_points')
                    ->leftJoin('point_transactions', 'users.id', '=', 'point_transactions.user_id')
                    ->groupBy('users.id', 'users.name', 'users.email')
                    ->orderByDesc('total_points')
                    ->limit(10)
                    ->get();
            });

            return response()->json($topStudents);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Admin - All EBooks
    public function adminBooks()
    {
        try {
            $books = Ebook::where('is_active', true)
                ->select('id', 'title', 'author', 'pages', 'category', 'is_active', 'poin_per_halaman', 'file_path', 'cover_image')
                ->get()
                ->map(function ($book) {
                    $book->cover_image_url = \App\Http\Controllers\Api\StorageHelper::url($book->cover_image, 'cover');
                    $book->pdf_file_url    = \App\Http\Controllers\Api\StorageHelper::url($book->file_path, 'ebook');
                    return $book;
                });

            return response()->json(['data' => $books]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Guru Dashboard Stats
    public function guruStats(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $today = now()->format('Y-m-d');

            // Siswa di kelas guru ini
            $guruHasKelas = $user->grade_level || $user->class_name;

            if ($guruHasKelas) {
                $siswaDiKelas = User::where('role', 'siswa')
                    ->where(function ($q) use ($user) {
                        $q->where('wali_kelas_id', $user->id);
                        if ($user->grade_level && $user->class_name) {
                            $q->orWhere(function ($q2) use ($user) {
                                $q2->where('grade_level', $user->grade_level)
                                   ->where('class_name', $user->class_name);
                            });
                        } elseif ($user->class_name) {
                            $q->orWhere('class_name', $user->class_name);
                        } elseif ($user->grade_level) {
                            $q->orWhere('grade_level', $user->grade_level);
                        }
                    })
                    ->pluck('id');

                $totalSiswa = $siswaDiKelas->count();

                $validasiPending = ReadingActivity::where('status', 'pending_validation')
                    ->whereIn('user_id', $siswaDiKelas)
                    ->count();

                $siswaAktif = ReadingActivity::whereDate('created_at', $today)
                    ->whereIn('user_id', $siswaDiKelas)
                    ->distinct('user_id')
                    ->count('user_id');
            } else {
                // Guru belum assign ke kelas — tampilkan semua
                $totalSiswa      = User::where('role', 'siswa')->count();
                $validasiPending = ReadingActivity::where('status', 'pending_validation')->count();
                $siswaAktif      = ReadingActivity::whereDate('created_at', $today)
                    ->distinct('user_id')->count('user_id');
            }

            $stats = [
                'total_siswa'         => $totalSiswa,
                'total_kuis_dibuat'   => \App\Models\QuizQuestion::where('created_by', $user->id)->count(),
                'validasi_pending'    => $validasiPending,
                'siswa_aktif_hari_ini' => $siswaAktif,
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Guru - My Students (List with performance)
    public function guruStudents(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Filter siswa berdasarkan kelas guru
            $guruHasKelas = $user->grade_level || $user->class_name;

            $query = User::where('role', 'siswa')
                ->select('id', 'name', 'email', 'class_name', 'grade_level', 'wali_kelas_id')
                ->orderBy('class_name');

            if ($guruHasKelas) {
                $query->where(function ($q) use ($user) {
                    $q->where('wali_kelas_id', $user->id);
                    if ($user->grade_level && $user->class_name) {
                        $q->orWhere(function ($q2) use ($user) {
                            $q2->where('grade_level', $user->grade_level)
                               ->where('class_name', $user->class_name);
                        });
                    } elseif ($user->class_name) {
                        $q->orWhere('class_name', $user->class_name);
                    } elseif ($user->grade_level) {
                        $q->orWhere('grade_level', $user->grade_level);
                    }
                });
            }

            $students = $query->get()->map(function ($student) {
                    $student->total_points = DB::table('point_transactions')
                        ->where('user_id', $student->id)
                        ->sum('points') ?? 0;

                    $student->books_read = ReadingActivity::where('user_id', $student->id)
                        ->where('status', 'completed')
                        ->count();

                    $quizzes = QuizAttempt::where('user_id', $student->id)->get();
                    $student->quiz_average_score = $quizzes->count() > 0
                        ? round($quizzes->avg('score'), 1)
                        : 0;

                    $student->quizzes_passed = $quizzes->where('passed', true)->count();

                    return $student;
                });

            return response()->json($students);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Guru - Class Statistics
    public function guruClassStats(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $allStudents = User::where('role', 'siswa')->get();
            $activeCount = $allStudents->count();
            
            $totalPoints = DB::table('point_transactions')->sum('points') ?? 0;
            $avgPoints = $activeCount > 0 ? $totalPoints / $activeCount : 0;

            $stats = [
                'total_siswa' => $activeCount,
                'total_points_class' => $totalPoints,
                'avg_points_per_siswa' => round($avgPoints, 2),
                'books_read_class' => ReadingActivity::where('status', 'completed')->count(),
                'quizzes_completed_class' => QuizAttempt::count(),
                'avg_quiz_score' => QuizAttempt::avg('score') ?? 0,
            ];

            return response()->json(['data' => $stats]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Guru - Quiz Management
    public function guruQuizzes(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Get all quizzes created by this guru
            $quizzes = QuizQuestion::where('created_by', $user->id)
                ->select('id', 'ebook_id', 'question', 'created_at')
                ->with('ebook:id,title')
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'data' => $quizzes->items(),
                'pagination' => [
                    'current_page' => $quizzes->currentPage(),
                    'per_page' => $quizzes->perPage(),
                    'total' => $quizzes->total(),
                    'last_page' => $quizzes->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Siswa Dashboard Stats
    public function siswaStats(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $totalPoints = DB::table('point_transactions')
                ->where('user_id', $user->id)
                ->sum('points') ?? 0;
            
            $booksRead = ReadingActivity::where('user_id', $user->id)
                ->where('status', 'completed')
                ->count();
            
            $pagesRead = ReadingActivity::where('user_id', $user->id)
                ->sum('final_page') ?? 0;
            
            $quizzesTaken = QuizAttempt::where('user_id', $user->id)->count();

            $stats = [
                'total_points' => $totalPoints,
                'books_read' => $booksRead,
                'pages_read' => $pagesRead,
                'quizzes_taken' => $quizzesTaken,
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Siswa - Available Books
    public function siswaBooks()
    {
        try {
            $books = Ebook::where('is_active', true)
                ->select('id', 'title', 'author', 'pages', 'poin_per_halaman', 'category', 'cover_image')
                ->orderBy('created_at', 'desc')
                ->paginate(12);

            return response()->json($books);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Siswa - My Points History
    public function siswaPointsHistory(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $history = DB::table('point_transactions')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json($history);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Siswa - My Quiz Attempts
    public function siswaQuizAttempts(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $attempts = QuizAttempt::where('user_id', $user->id)
                ->with('ebook')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($attempts);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Siswa - My Rewards
    public function siswaRewards()
    {
        try {
            $rewards = Reward::where('is_active', true)
                ->get(['id', 'name', 'description', 'points_required', 'stock', 'category']);

            return response()->json($rewards);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Siswa - My Reading Activities (Progress)
    public function siswaReadingActivities(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $activities = ReadingActivity::where('user_id', $user->id)
                ->with('ebook:id,title,author,poin_per_halaman')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'data' => $activities,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Siswa - Weekly Progress Summary
    public function siswaWeeklyProgress(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Weekly breakdown (last 7 days)
            $weeklyData = [];
            $today = now();
            
            for ($i = 6; $i >= 0; $i--) {
                $date = $today->clone()->subDays($i);
                $dateStr = $date->format('Y-m-d');
                
                $activities = ReadingActivity::where('user_id', $user->id)
                    ->whereDate('created_at', $dateStr)
                    ->get();
                
                $pointsEarned = DB::table('point_transactions')
                    ->where('user_id', $user->id)
                    ->whereDate('created_at', $dateStr)
                    ->sum('points') ?? 0;
                
                $weeklyData[] = [
                    'date' => $dateStr,
                    'day' => $date->format('l'),
                    'activities_count' => $activities->count(),
                    'points_earned' => $pointsEarned,
                    'pages_read' => $activities->sum('final_page') ?? 0,
                ];
            }

            return response()->json([
                'data' => $weeklyData,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Siswa - My Completed Books
    public function siswaCompletedBooks(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $completedBooks = ReadingActivity::where('user_id', $user->id)
                ->where('status', 'completed')
                ->with('ebook:id,title,author,pages,poin_per_halaman')
                ->orderBy('completed_at', 'desc')
                ->get();

            return response()->json([
                'data' => $completedBooks,
                'total_completed' => $completedBooks->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ─── HISTORI ENDPOINTS ────────────────────────────────────────────────────

    /**
     * Siswa - Riwayat lengkap: baca + kuis + poin + penukaran reward
     */
    public function siswaHistory(Request $request)
    {
        try {
            $user = $request->user();

            // Riwayat membaca (semua status)
            $readingHistory = ReadingActivity::where('user_id', $user->id)
                ->with([
                    'ebook:id,title,author,pages,cover_image',
                    'validation:id,reading_activity_id,status,validated_at,notes',
                ])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($activity) {
                    return [
                        'id'               => $activity->id,
                        'type'             => 'reading',
                        'ebook'            => $activity->ebook,
                        'status'           => $activity->status,
                        'current_page'     => $activity->current_page,
                        'final_page'       => $activity->final_page,
                        'duration_minutes' => $activity->duration_minutes,
                        'started_at'       => $activity->started_at,
                        'completed_at'     => $activity->completed_at,
                        'created_at'       => $activity->created_at,
                        'validation'       => $activity->validation,
                    ];
                });

            // Riwayat kuis
            $quizHistory = \App\Models\QuizAttempt::where('user_id', $user->id)
                ->with('ebook:id,title,author')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($attempt) {
                    return [
                        'id'              => $attempt->id,
                        'type'            => 'quiz',
                        'ebook'           => $attempt->ebook,
                        'score'           => $attempt->score,
                        'correct_answers' => $attempt->correct_answers,
                        'total_questions' => $attempt->total_questions,
                        'passed'          => $attempt->passed,
                        'created_at'      => $attempt->created_at,
                    ];
                });

            // Riwayat poin (transaksi masuk dan keluar)
            $pointHistory = \App\Models\PointTransaction::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            // Riwayat penukaran reward
            $redemptionHistory = \App\Models\Redemption::where('user_id', $user->id)
                ->with('reward:id,name,description,points_required,image')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'data' => [
                    'reading_history'    => $readingHistory,
                    'quiz_history'       => $quizHistory,
                    'point_history'      => $pointHistory,
                    'redemption_history' => $redemptionHistory,
                    'summary' => [
                        'total_reading'       => $readingHistory->count(),
                        'completed_reading'   => $readingHistory->where('status', 'completed')->count(),
                        'total_quiz_attempts' => $quizHistory->count(),
                        'total_points_earned' => $pointHistory->where('points', '>', 0)->sum('points'),
                        'total_points_used'   => abs($pointHistory->where('points', '<', 0)->sum('points')),
                        'total_redemptions'   => $redemptionHistory->count(),
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Guru - Riwayat validasi yang sudah dilakukan guru ini
     */
    public function guruHistory(Request $request)
    {
        try {
            $guru = $request->user();

            $validations = \App\Models\Validation::where('validated_by', $guru->id)
                ->with([
                    'readingActivity' => function ($q) {
                        $q->with([
                            'user:id,name,email,class_name,grade_level',
                            'ebook:id,title,author,pages,poin_per_halaman',
                        ]);
                    },
                ])
                ->orderBy('validated_at', 'desc')
                ->paginate(20);

            $stats = [
                'total_approved'      => \App\Models\Validation::where('validated_by', $guru->id)
                    ->where('status', 'approved')->count(),
                'total_rejected'      => \App\Models\Validation::where('validated_by', $guru->id)
                    ->where('status', 'rejected')->count(),
                'this_month'          => \App\Models\Validation::where('validated_by', $guru->id)
                    ->whereMonth('validated_at', now()->month)
                    ->whereYear('validated_at', now()->year)
                    ->count(),
                'total_points_awarded' => \App\Models\PointTransaction::where('type', 'reading_validation')
                    ->whereIn(
                        'reading_activity_id',
                        \App\Models\Validation::where('validated_by', $guru->id)
                            ->where('status', 'approved')
                            ->pluck('reading_activity_id')
                    )
                    ->sum('points'),
            ];

            return response()->json([
                'data'       => $validations->items(),
                'pagination' => [
                    'current_page' => $validations->currentPage(),
                    'per_page'     => $validations->perPage(),
                    'total'        => $validations->total(),
                    'last_page'    => $validations->lastPage(),
                ],
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Admin - Riwayat aktivitas platform: registrasi user, transaksi poin, klaim reward
     */
    public function adminHistory(Request $request)
    {
        try {
            $period = (int) $request->input('period', 30); // hari
            $since  = now()->subDays($period);

            // Registrasi user terbaru
            $newUsers = User::where('created_at', '>=', $since)
                ->where('email', 'not like', 'deleted_%')
                ->where('email', 'not like', '%@deleted.local')
                ->select('id', 'name', 'email', 'role', 'grade_level', 'class_name', 'created_at')
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            // Transaksi poin terbaru (semua user)
            $recentPoints = \App\Models\PointTransaction::where('created_at', '>=', $since)
                ->with('user:id,name,email')
                ->orderBy('created_at', 'desc')
                ->limit(100)
                ->get();

            // Klaim reward terbaru
            $recentRedemptions = \App\Models\Redemption::where('created_at', '>=', $since)
                ->with([
                    'user:id,name,email',
                    'reward:id,name,points_required',
                ])
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            // Aktivitas membaca terbaru
            $recentReading = ReadingActivity::where('created_at', '>=', $since)
                ->with([
                    'user:id,name,email',
                    'ebook:id,title,author',
                ])
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            // Statistik ringkasan periode
            $summary = [
                'period_days'          => $period,
                'new_users'            => $newUsers->count(),
                'new_siswa'            => $newUsers->where('role', 'siswa')->count(),
                'new_guru'             => $newUsers->where('role', 'guru')->count(),
                'total_points_awarded' => $recentPoints->where('points', '>', 0)->sum('points'),
                'total_points_used'    => abs($recentPoints->where('points', '<', 0)->sum('points')),
                'total_redemptions'    => $recentRedemptions->count(),
                'reading_sessions'     => $recentReading->count(),
                'completed_readings'   => $recentReading->where('status', 'completed')->count(),
            ];

            return response()->json([
                'data' => [
                    'new_users'          => $newUsers,
                    'recent_points'      => $recentPoints,
                    'recent_redemptions' => $recentRedemptions,
                    'recent_reading'     => $recentReading,
                ],
                'summary' => $summary,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
