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

// Public Routes
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/register', [AuthController::class, 'register']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    
    // E-Books (Siswa: read, Admin: manage)
    Route::get('ebooks', [EbookController::class, 'index']);
    Route::get('ebooks/{id}', [EbookController::class, 'show']);
    Route::get('ebooks/{id}/pdf', [EbookController::class, 'getPDF']);
    Route::get('ebooks/{id}/progress', [EbookController::class, 'getUserProgress']);
    
    // Admin only routes
    Route::middleware('admin')->group(function () {
        Route::post('ebooks', [EbookController::class, 'store']);
        Route::put('ebooks/{id}', [EbookController::class, 'update']);
        Route::delete('ebooks/{id}', [EbookController::class, 'destroy']);
    });
    
    // Reading Activities (Siswa: track reading)
    Route::post('reading-activities/start', [ReadingActivityController::class, 'startReading']);
    Route::put('reading-activities/{id}/progress', [ReadingActivityController::class, 'updateProgress']);
    Route::put('reading-activities/{id}/complete', [ReadingActivityController::class, 'completeReading']);
    Route::get('reading-activities', [ReadingActivityController::class, 'getMyActivities']);
    Route::get('reading-activities/{id}', [ReadingActivityController::class, 'getActivity']);
    Route::get('reading-activities/frequently-read', [ReadingActivityController::class, 'getFrequentlyReadBooks']);
    
    // Quizzes (Siswa: take, Guru: create)
    Route::get('ebooks/{id}/quiz', [QuizController::class, 'getQuizForBook']);
    Route::post('quiz/submit', [QuizController::class, 'submitQuiz']);
    Route::get('quiz/my-attempts', [QuizController::class, 'getMyAttempts']);
    
    Route::middleware('guru')->group(function () {
        Route::post('quiz/create', [QuizController::class, 'createQuiz']);
        Route::put('quiz/{id}', [QuizController::class, 'updateQuiz']);
        Route::delete('quiz/{id}', [QuizController::class, 'deleteQuiz']);
    });
    
    // Validasi Pembacaan (Guru: validate, Admin: view)
    Route::middleware('guru')->group(function () {
        Route::get('validations/pending', [ValidationController::class, 'getPending']);
        Route::get('validations/{id}', [ValidationController::class, 'getDetail']);
        Route::put('validations/{id}/approve', [ValidationController::class, 'approve']);
        Route::put('validations/{id}/reject', [ValidationController::class, 'reject']);
        Route::get('validations/history', [ValidationController::class, 'getHistory']);
        Route::get('validations/stats', [ValidationController::class, 'getStatistics']);
    });
    
    // Rewards (Siswa: view & redeem, Admin: manage)
    Route::get('rewards', [RewardController::class, 'index']);
    Route::get('rewards/{id}', [RewardController::class, 'show']);
    Route::post('rewards/{id}/redeem', [RewardController::class, 'redeem']);
    Route::get('my-redemptions', [RewardController::class, 'getMyRedemptions']);
    Route::get('user-points', [RewardController::class, 'getUserPoints']);
    
    Route::middleware('admin')->group(function () {
        Route::post('rewards', [RewardController::class, 'store']);
        Route::put('rewards/{id}', [RewardController::class, 'update']);
        Route::delete('rewards/{id}', [RewardController::class, 'destroy']);
        Route::post('rewards/verify-claim', [RewardController::class, 'verifyClaim']);
    });
    
    // Books (original)
    Route::apiResource('books', BookController::class);
    
    // Dashboard routes (role-based stats)
    Route::middleware('admin')->group(function () {
        Route::get('dashboard/admin/stats', [DashboardController::class, 'adminStats']);
        Route::get('dashboard/admin/top-students', [DashboardController::class, 'topStudents']);
        Route::get('dashboard/admin/books', [DashboardController::class, 'adminBooks']);
    });
    
    Route::middleware('guru')->group(function () {
        Route::get('dashboard/guru/stats', [DashboardController::class, 'guruStats']);
        Route::get('dashboard/guru/students', [DashboardController::class, 'guruStudents']);
        Route::get('dashboard/guru/class-stats', [DashboardController::class, 'guruClassStats']);
        Route::get('dashboard/guru/quizzes', [DashboardController::class, 'guruQuizzes']);
    });
    
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
    
    // User management (Admin only)
    Route::middleware('admin')->group(function () {
        Route::get('users', [UserController::class, 'index']);
        Route::get('users/{id}', [UserController::class, 'show']);
        Route::put('users/{id}', [UserController::class, 'update']);
        Route::post('users/{id}/reset-password', [UserController::class, 'resetPassword']);
        Route::post('users/create', [UserController::class, 'createUser']);
        Route::get('dashboard/admin/users-stats', [UserController::class, 'getStatistics']);
    });
});



