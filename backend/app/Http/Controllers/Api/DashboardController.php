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
    // ─── Helper: ID siswa di kelas guru ───────────────────────────────────────

    /**
     * Kembalikan koleksi ID siswa yang sekelas dengan $guru
     * menggunakan Query Scope User::siswaSeKelas().
     */
    private function siswaDiKelas(User $guru): \Illuminate\Support\Collection
    {
        return User::siswaSeKelas($guru)->pluck('id');
    }

    // ─── Admin Dashboard ──────────────────────────────────────────────────────

    public function adminStats()
    {
        try {
            $today = now()->format('Y-m-d');

            // Cache 5 menit untuk mengurangi beban DB
            $stats = \Cache::remember('admin_stats_' . $today, 300, function () use ($today) {
                return [
                    'total_siswa'              => User::where('role', 'siswa')
                        ->where('email', 'not like', 'deleted_%')
                        ->where('email', 'not like', '%@deleted.local')
                        ->count(),
                    'total_guru'               => User::where('role', 'guru')
                        ->where('email', 'not like', 'deleted_%')
                        ->where('email', 'not like', '%@deleted.local')
                        ->count(),
                    'total_ebook'              => Ebook::where('is_active', true)->count(),
                    'total_reward'             => Reward::where('is_active', true)->count(),
                    'siswa_aktif_hari_ini'     => ReadingActivity::whereDate('created_at', $today)
                        ->distinct('user_id')->count('user_id'),
                    'buku_dibaca_hari_ini'     => ReadingActivity::whereDate('created_at', $today)->count(),
                    'kuis_dikerjakan_hari_ini' => QuizAttempt::whereDate('created_at', $today)->count(),
                    'reward_diklaim_hari_ini'  => DB::table('redemptions')
                        ->whereDate('created_at', $today)->count(),
                ];
            });

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function topStudents()
    {
        try {
            // Cache 10 menit
            $topStudents = \Cache::remember('admin_top_students', 600, function () {
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
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

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
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // ─── Guru Dashboard ───────────────────────────────────────────────────────

    public function guruStats(Request $request)
    {
        try {
            $user  = $request->user();
            $today = now()->format('Y-m-d');

            $guruHasKelas    = $user->grade_level || $user->class_name;
            $siswaDiKelas    = $this->siswaDiKelas($user);

            if ($guruHasKelas) {
                $totalSiswa      = $siswaDiKelas->count();
                $validasiPending = ReadingActivity::where('status', 'pending_validation')
                    ->whereIn('user_id', $siswaDiKelas)->count();
                $siswaAktif      = ReadingActivity::whereDate('created_at', $today)
                    ->whereIn('user_id', $siswaDiKelas)
                    ->distinct('user_id')->count('user_id');
            } else {
                // Guru belum punya kelas — tampilkan global
                $totalSiswa      = User::where('role', 'siswa')->count();
                $validasiPending = ReadingActivity::where('status', 'pending_validation')->count();
                $siswaAktif      = ReadingActivity::whereDate('created_at', $today)
                    ->distinct('user_id')->count('user_id');
            }

            return response()->json([
                'total_siswa'          => $totalSiswa,
                'total_kuis_dibuat'    => QuizQuestion::where('created_by', $user->id)->count(),
                'validasi_pending'     => $validasiPending,
                'siswa_aktif_hari_ini' => $siswaAktif,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function guruStudents(Request $request)
    {
        try {
            $user  = $request->user();

            // Gunakan scope — jika guru belum punya kelas, semua siswa dikembalikan
            $students = User::siswaSeKelas($user)
                ->select('id', 'name', 'email', 'class_name', 'grade_level', 'wali_kelas_id')
                ->orderBy('class_name')
                ->get()
                ->map(function ($student) {
                    $student->total_points = DB::table('point_transactions')
                        ->where('user_id', $student->id)->sum('points') ?? 0;

                    $student->books_read = ReadingActivity::where('user_id', $student->id)
                        ->where('status', 'completed')->count();

                    $quizzes = QuizAttempt::where('user_id', $student->id)->get();
                    $student->quiz_average_score = $quizzes->count() > 0
                        ? round($quizzes->avg('score'), 1) : 0;
                    $student->quizzes_passed = $quizzes->where('passed', true)->count();

                    return $student;
                });

            return response()->json($students);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function guruClassStats(Request $request)
    {
        try {
            $user = $request->user();

            // Scope ke kelas guru jika ada
            $siswaDiKelas = $this->siswaDiKelas($user);
            $guruHasKelas = $user->grade_level || $user->class_name;

            if ($guruHasKelas && $siswaDiKelas->isNotEmpty()) {
                $totalPoints = DB::table('point_transactions')
                    ->whereIn('user_id', $siswaDiKelas)->sum('points') ?? 0;
                $activeCount = $siswaDiKelas->count();
                $booksRead   = ReadingActivity::where('status', 'completed')
                    ->whereIn('user_id', $siswaDiKelas)->count();
                $quizCount   = QuizAttempt::whereIn('user_id', $siswaDiKelas)->count();
                $avgScore    = QuizAttempt::whereIn('user_id', $siswaDiKelas)->avg('score') ?? 0;
            } else {
                $totalPoints = DB::table('point_transactions')->sum('points') ?? 0;
                $activeCount = User::where('role', 'siswa')->count();
                $booksRead   = ReadingActivity::where('status', 'completed')->count();
                $quizCount   = QuizAttempt::count();
                $avgScore    = QuizAttempt::avg('score') ?? 0;
            }

            return response()->json(['data' => [
                'total_siswa'            => $activeCount,
                'total_points_class'     => $totalPoints,
                'avg_points_per_siswa'   => $activeCount > 0 ? round($totalPoints / $activeCount, 2) : 0,
                'books_read_class'       => $booksRead,
                'quizzes_completed_class'=> $quizCount,
                'avg_quiz_score'         => round($avgScore, 2),
            ]]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function guruQuizzes(Request $request)
    {
        try {
            $user   = $request->user();
            $quizzes = QuizQuestion::where('created_by', $user->id)
                ->select('id', 'ebook_id', 'question', 'created_at')
                ->with('ebook:id,title')
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'data'       => $quizzes->items(),
                'pagination' => [
                    'current_page' => $quizzes->currentPage(),
                    'per_page'     => $quizzes->perPage(),
                    'total'        => $quizzes->total(),
                    'last_page'    => $quizzes->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // ─── Siswa Dashboard ──────────────────────────────────────────────────────

    public function siswaStats(Request $request)
    {
        try {
            $user = $request->user();

            return response()->json([
                'total_points'  => DB::table('point_transactions')->where('user_id', $user->id)->sum('points') ?? 0,
                'books_read'    => ReadingActivity::where('user_id', $user->id)->where('status', 'completed')->count(),
                'pages_read'    => ReadingActivity::where('user_id', $user->id)->sum('final_page') ?? 0,
                'quizzes_taken' => QuizAttempt::where('user_id', $user->id)->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function siswaBooks()
    {
        try {
            $books = Ebook::where('is_active', true)
                ->select('id', 'title', 'author', 'pages', 'poin_per_halaman', 'category', 'cover_image')
                ->orderBy('created_at', 'desc')
                ->paginate(12);

            return response()->json($books);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function siswaPointsHistory(Request $request)
    {
        try {
            $user    = $request->user();
            $history = DB::table('point_transactions')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json($history);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function siswaQuizAttempts(Request $request)
    {
        try {
            $user     = $request->user();
            $attempts = QuizAttempt::where('user_id', $user->id)
                ->with('ebook')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($attempts);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function siswaRewards()
    {
        try {
            $rewards = Reward::where('is_active', true)
                ->get(['id', 'name', 'description', 'points_required', 'stock', 'category']);

            return response()->json($rewards);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function siswaReadingActivities(Request $request)
    {
        try {
            $user       = $request->user();
            $activities = ReadingActivity::where('user_id', $user->id)
                ->with('ebook:id,title,author,poin_per_halaman')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json(['data' => $activities]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function siswaWeeklyProgress(Request $request)
    {
        try {
            $user        = $request->user();
            $weeklyData  = [];
            $today       = now();

            for ($i = 6; $i >= 0; $i--) {
                $date    = $today->clone()->subDays($i);
                $dateStr = $date->format('Y-m-d');

                $activities  = ReadingActivity::where('user_id', $user->id)
                    ->whereDate('created_at', $dateStr)->get();

                $weeklyData[] = [
                    'date'              => $dateStr,
                    'day'               => $date->format('l'),
                    'activities_count'  => $activities->count(),
                    'points_earned'     => DB::table('point_transactions')
                        ->where('user_id', $user->id)
                        ->whereDate('created_at', $dateStr)
                        ->sum('points') ?? 0,
                    'pages_read'        => $activities->sum('final_page') ?? 0,
                ];
            }

            return response()->json(['data' => $weeklyData]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function siswaCompletedBooks(Request $request)
    {
        try {
            $user           = $request->user();
            $completedBooks = ReadingActivity::where('user_id', $user->id)
                ->where('status', 'completed')
                ->with('ebook:id,title,author,pages,poin_per_halaman')
                ->orderBy('completed_at', 'desc')
                ->get();

            return response()->json([
                'data'            => $completedBooks,
                'total_completed' => $completedBooks->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    // ─── Histori Endpoints ────────────────────────────────────────────────────

    public function siswaHistory(Request $request)
    {
        try {
            $user = $request->user();

            $readingHistory = ReadingActivity::where('user_id', $user->id)
                ->with([
                    'ebook:id,title,author,pages,cover_image',
                    'validation:id,reading_activity_id,status,validated_at,notes',
                ])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn ($a) => [
                    'id'               => $a->id,
                    'type'             => 'reading',
                    'ebook'            => $a->ebook,
                    'status'           => $a->status,
                    'current_page'     => $a->current_page,
                    'final_page'       => $a->final_page,
                    'duration_minutes' => $a->duration_minutes,
                    'started_at'       => $a->started_at,
                    'completed_at'     => $a->completed_at,
                    'created_at'       => $a->created_at,
                    'validation'       => $a->validation,
                ]);

            $quizHistory = \App\Models\QuizAttempt::where('user_id', $user->id)
                ->with('ebook:id,title,author')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn ($q) => [
                    'id'              => $q->id,
                    'type'            => 'quiz',
                    'ebook'           => $q->ebook,
                    'score'           => $q->score,
                    'correct_answers' => $q->correct_answers,
                    'total_questions' => $q->total_questions,
                    'passed'          => $q->passed,
                    'created_at'      => $q->created_at,
                ]);

            $pointHistory      = \App\Models\PointTransaction::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')->get();
            $redemptionHistory = \App\Models\Redemption::where('user_id', $user->id)
                ->with('reward:id,name,description,points_required,image')
                ->orderBy('created_at', 'desc')->get();

            return response()->json([
                'data' => [
                    'reading_history'    => $readingHistory,
                    'quiz_history'       => $quizHistory,
                    'point_history'      => $pointHistory,
                    'redemption_history' => $redemptionHistory,
                    'summary'            => [
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
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function guruHistory(Request $request)
    {
        try {
            $guru        = $request->user();
            $validations = \App\Models\Validation::where('validated_by', $guru->id)
                ->with([
                    'readingActivity' => fn ($q) => $q->with([
                        'user:id,name,email,class_name,grade_level',
                        'ebook:id,title,author,pages,poin_per_halaman',
                    ]),
                ])
                ->orderBy('validated_at', 'desc')
                ->paginate(20);

            $stats = [
                'total_approved'       => \App\Models\Validation::where('validated_by', $guru->id)
                    ->where('status', 'approved')->count(),
                'total_rejected'       => \App\Models\Validation::where('validated_by', $guru->id)
                    ->where('status', 'rejected')->count(),
                'this_month'           => \App\Models\Validation::where('validated_by', $guru->id)
                    ->whereMonth('validated_at', now()->month)
                    ->whereYear('validated_at', now()->year)->count(),
                'total_points_awarded' => \App\Models\PointTransaction::where('type', 'reading_validation')
                    ->whereIn(
                        'reading_activity_id',
                        \App\Models\Validation::where('validated_by', $guru->id)
                            ->where('status', 'approved')->pluck('reading_activity_id')
                    )->sum('points'),
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
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function adminHistory(Request $request)
    {
        try {
            $period = (int) $request->input('period', 30);
            $since  = now()->subDays($period);

            $newUsers = User::where('created_at', '>=', $since)
                ->where('email', 'not like', 'deleted_%')
                ->where('email', 'not like', '%@deleted.local')
                ->select('id', 'name', 'email', 'role', 'grade_level', 'class_name', 'created_at')
                ->orderBy('created_at', 'desc')->limit(50)->get();

            $recentPoints = \App\Models\PointTransaction::where('created_at', '>=', $since)
                ->with('user:id,name,email')
                ->orderBy('created_at', 'desc')->limit(100)->get();

            $recentRedemptions = \App\Models\Redemption::where('created_at', '>=', $since)
                ->with(['user:id,name,email', 'reward:id,name,points_required'])
                ->orderBy('created_at', 'desc')->limit(50)->get();

            $recentReading = ReadingActivity::where('created_at', '>=', $since)
                ->with(['user:id,name,email', 'ebook:id,title,author'])
                ->orderBy('created_at', 'desc')->limit(50)->get();

            return response()->json([
                'data' => [
                    'new_users'          => $newUsers,
                    'recent_points'      => $recentPoints,
                    'recent_redemptions' => $recentRedemptions,
                    'recent_reading'     => $recentReading,
                ],
                'summary' => [
                    'period_days'          => $period,
                    'new_users'            => $newUsers->count(),
                    'new_siswa'            => $newUsers->where('role', 'siswa')->count(),
                    'new_guru'             => $newUsers->where('role', 'guru')->count(),
                    'total_points_awarded' => $recentPoints->where('points', '>', 0)->sum('points'),
                    'total_points_used'    => abs($recentPoints->where('points', '<', 0)->sum('points')),
                    'total_redemptions'    => $recentRedemptions->count(),
                    'reading_sessions'     => $recentReading->count(),
                    'completed_readings'   => $recentReading->where('status', 'completed')->count(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
