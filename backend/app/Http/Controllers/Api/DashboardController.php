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
            
            $stats = [
                'total_siswa' => User::where('role', 'siswa')->count(),
                'total_guru' => User::where('role', 'guru')->count(),
                'total_ebook' => Ebook::count(),
                'total_reward' => Reward::count(),
                'siswa_aktif_hari_ini' => ReadingActivity::whereDate('created_at', $today)
                    ->pluck('user_id')
                    ->unique()
                    ->count(),
                'buku_dibaca_hari_ini' => ReadingActivity::whereDate('created_at', $today)->count(),
                'kuis_dikerjakan_hari_ini' => QuizAttempt::whereDate('created_at', $today)->count(),
                'reward_diklaim_hari_ini' => DB::table('redemptions')->whereDate('created_at', $today)->count(),
            ];
            
            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // Admin - Top Students
    public function topStudents()
    {
        try {
            $topStudents = User::where('role', 'siswa')
                ->select('id', 'name', 'email')
                ->get()
                ->map(function ($user) {
                    $user->total_points = DB::table('point_transactions')
                        ->where('user_id', $user->id)
                        ->sum('points') ?? 0;
                    return $user;
                })
                ->sortByDesc('total_points')
                ->take(10)
                ->values();

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
                    // Convert storage paths to full URLs
                    if ($book->cover_image) {
                        $book->cover_image = asset('storage/' . $book->cover_image);
                    }
                    if ($book->file_path) {
                        $book->pdf_file = asset('storage/' . $book->file_path);
                    }
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
            
            // For now, using all students since BookAssignment table is incomplete
            $allStudents = User::where('role', 'siswa')->get();
            
            $stats = [
                'total_siswa' => $allStudents->count(),
                'total_kuis_dibuat' => QuizQuestion::where('created_by', $user->id)->count(),
                'validasi_pending' => Validation::whereNull('validated_by')->count(),
                'siswa_aktif_hari_ini' => ReadingActivity::whereDate('created_at', $today)
                    ->pluck('user_id')
                    ->unique()
                    ->count(),
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

            // For now, return all students since BookAssignment table is incomplete
            $students = User::where('role', 'siswa')
                ->select('id', 'name', 'email', 'class_name', 'grade_level')
                ->orderBy('class_name')
                ->get()
                ->map(function ($student) {
                    $student->total_points = DB::table('point_transactions')
                        ->where('user_id', $student->id)
                        ->sum('points') ?? 0;
                    
                    $student->books_read = ReadingActivity::where('user_id', $student->id)
                        ->where('status', 'completed')
                        ->count();
                    
                    // Calculate reading progress (average progress across all reading activities)
                    $readingActivities = ReadingActivity::where('user_id', $student->id)->get();
                    if ($readingActivities->count() > 0) {
                        $totalProgress = 0;
                        foreach ($readingActivities as $activity) {
                            $ebook = Ebook::find($activity->ebook_id);
                            if ($ebook && $ebook->pages > 0) {
                                $progress = ($activity->final_page / $ebook->pages) * 100;
                                $totalProgress += $progress;
                            }
                        }
                        $student->reading_progress = $totalProgress / $readingActivities->count();
                    } else {
                        $student->reading_progress = 0;
                    }
                    
                    $quizzes = QuizAttempt::where('user_id', $student->id)->get();
                    $student->quiz_average_score = $quizzes->count() > 0 
                        ? $quizzes->avg('score') 
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

            // Get all quizzes created by this guru, grouped by ebook
            $quizzes = QuizQuestion::where('created_by', $user->id)
                ->select('ebook_id', DB::raw('COUNT(*) as question_count'), DB::raw('MIN(created_at) as created_at'))
                ->with('ebook:id,title')
                ->groupBy('ebook_id')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($quiz) {
                    // Count attempts for this ebook's quiz
                    $attemptCount = QuizAttempt::where('ebook_id', $quiz->ebook_id)->count();
                    
                    return [
                        'ebook_id' => $quiz->ebook_id,
                        'ebook_title' => $quiz->ebook->title ?? 'Unknown',
                        'question_count' => $quiz->question_count,
                        'attempt_count' => $attemptCount,
                        'created_at' => $quiz->created_at,
                    ];
                });

            return response()->json([
                'data' => $quizzes,
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
                ->with('ebook:id,title,author,pages,poin_per_halaman')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($activity) {
                    // Transform data to match frontend expectations
                    return [
                        'id' => $activity->id,
                        'ebook_id' => $activity->ebook_id,
                        'ebook_title' => $activity->ebook->title ?? 'Unknown',
                        'ebook_author' => $activity->ebook->author ?? 'Unknown',
                        'pages_read' => $activity->final_page ?? 0,
                        'total_pages' => $activity->ebook->pages ?? 0,
                        'reading_time_minutes' => $activity->duration_minutes ?? 0,
                        'points_earned' => $activity->points_earned ?? 0,
                        'status' => $activity->status,
                        'started_at' => $activity->started_at,
                        'completed_at' => $activity->completed_at,
                        'validated_at' => $activity->validation?->validated_at ?? null,
                    ];
                });

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
}
