<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\EbookController;
use App\Http\Controllers\Api\ReadingActivityController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\RewardController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ValidationController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
| Route di sini bisa diakses tanpa login/token
*/

// Test API
Route::get('/test', function () {
    return response()->json([
        'status' => true,
        'message' => 'API Laravel Cloud berhasil'
    ]);
});

// Auth public
Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:3,1');

// E-Books public
Route::get('ebooks', [EbookController::class, 'index']);
Route::get('ebooks/{id}', [EbookController::class, 'show']);
Route::get('ebooks/{id}/pdf', [EbookController::class, 'getPDF']);
Route::get('ebooks/{id}/text', [EbookController::class, 'extractText']);


/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
| Route di sini wajib login dan menggunakan token Sanctum
*/

Route::middleware('auth:sanctum', 'throttle:100,1')->group(function () {

    // Auth logout
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // E-Books progress user
    Route::get('ebooks/{id}/progress', [EbookController::class, 'getUserProgress']);

    // Admin only routes - Ebooks
    Route::middleware('admin')->group(function () {
        Route::post('ebooks', [EbookController::class, 'store']);
        Route::put('ebooks/{id}', [EbookController::class, 'update']);
        Route::delete('ebooks/{id}', [EbookController::class, 'destroy']);
    });

    // Reading Activities
    Route::post('reading-activities/start', [ReadingActivityController::class, 'startReading']);
    Route::get('reading-activities/frequently-read', [ReadingActivityController::class, 'getFrequentlyReadBooks']);
    Route::get('reading-activities', [ReadingActivityController::class, 'getMyActivities']);
    Route::get('reading-activities/{id}', [ReadingActivityController::class, 'getActivity']);
    Route::put('reading-activities/{id}/progress', [ReadingActivityController::class, 'updateProgress']);
    Route::put('reading-activities/{id}/complete', [ReadingActivityController::class, 'completeReading']);

    // Quizzes
    Route::get('ebooks/{id}/quiz', [QuizController::class, 'getQuizForBook']);
    Route::post('quiz/submit', [QuizController::class, 'submitQuiz']);
    Route::get('quiz/my-attempts', [QuizController::class, 'getMyAttempts']);
    Route::get('quizzes', [QuizController::class, 'getAllQuizzes']);

    // Guru only - Quiz
    Route::middleware('guru')->group(function () {
        Route::post('quiz/create', [QuizController::class, 'createQuiz']);
        Route::get('quiz/my-quizzes', [QuizController::class, 'getMyQuizzes']);
        Route::put('quiz/{id}', [QuizController::class, 'updateQuiz']);
        Route::delete('quiz/{id}', [QuizController::class, 'deleteQuiz']);
    });

    // Validasi Pembacaan - Guru
    Route::middleware('guru')->group(function () {
        Route::get('validations/pending', [ValidationController::class, 'getPending']);
        Route::get('validations/history', [ValidationController::class, 'getHistory']);
        Route::get('validations/stats', [ValidationController::class, 'getStatistics']);
        Route::get('validations/{id}', [ValidationController::class, 'getDetail']);
        Route::put('validations/{id}/approve', [ValidationController::class, 'approve']);
        Route::put('validations/{id}/reject', [ValidationController::class, 'reject']);
    });

    // Rewards
    Route::get('rewards', [RewardController::class, 'index']);
    Route::get('rewards/{id}', [RewardController::class, 'show']);
    Route::post('rewards/{id}/redeem', [RewardController::class, 'redeem']);
    Route::get('my-redemptions', [RewardController::class, 'getMyRedemptions']);
    Route::get('user-points', [RewardController::class, 'getUserPoints']);

    // Admin only - Rewards
    Route::middleware('admin')->group(function () {
        Route::post('rewards', [RewardController::class, 'store']);
        Route::put('rewards/{id}', [RewardController::class, 'update']);
        Route::delete('rewards/{id}', [RewardController::class, 'destroy']);
        Route::post('rewards/verify-claim', [RewardController::class, 'verifyClaim']);
    });

    // Books
    Route::apiResource('books', BookController::class);

    // Dashboard Admin
    Route::middleware('admin')->group(function () {
        Route::get('dashboard/admin/stats', [DashboardController::class, 'adminStats']);
        Route::get('dashboard/admin/top-students', [DashboardController::class, 'topStudents']);
        Route::get('dashboard/admin/books', [DashboardController::class, 'adminBooks']);
    });

    // Dashboard Guru
    Route::middleware('guru')->group(function () {
        Route::get('dashboard/guru/stats', [DashboardController::class, 'guruStats']);
        Route::get('dashboard/guru/students', [DashboardController::class, 'guruStudents']);
        Route::get('dashboard/guru/class-stats', [DashboardController::class, 'guruClassStats']);
        Route::get('dashboard/guru/quizzes', [DashboardController::class, 'guruQuizzes']);
    });

    // Dashboard Siswa
    Route::middleware('siswa')->group(function () {
        Route::get('dashboard/siswa/stats', [DashboardController::class, 'siswaStats']);
        Route::get('dashboard/siswa/books', [DashboardController::class, 'siswaBooks']);
        Route::get('dashboard/siswa/points-history', [DashboardController::class, 'siswaPointsHistory']);
        Route::get('dashboard/siswa/quiz-attempts', [DashboardController::class, 'siswaQuizAttempts']);
        Route::get('dashboard/siswa/rewards', [DashboardController::class, 'siswaRewards']);
        Route::get('dashboard/siswa/reading-activities', [DashboardController::class, 'siswaReadingActivities']);
        Route::get('dashboard/siswa/weekly-progress', [DashboardController::class, 'siswaWeeklyProgress']);
        Route::get('dashboard/siswa/completed-books', [DashboardController::class, 'siswaCompletedBooks']);
    });

    // User profile
    Route::get('user/profile', [UserController::class, 'getProfile']);
    Route::put('user/profile', [UserController::class, 'updateProfile']);

    // User profile update by ID
    Route::put('users/{id}', [UserController::class, 'update']);

    // User management - Admin only
    Route::middleware('admin')->group(function () {
        Route::get('users', [UserController::class, 'index']);
        Route::get('users/{id}', [UserController::class, 'show']);
        Route::post('users/{id}/reset-password', [UserController::class, 'resetPassword']);
        Route::post('users/create', [UserController::class, 'createUser']);
        Route::delete('users/{id}', [UserController::class, 'destroy']);
        Route::get('dashboard/admin/users-stats', [UserController::class, 'getStatistics']);
    });
});