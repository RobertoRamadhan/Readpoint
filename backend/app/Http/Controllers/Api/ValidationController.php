<?php

namespace App\Http\Controllers\Api;

use App\Models\ReadingActivity;
use App\Models\Validation;
use App\Models\PointTransaction;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ValidationController extends Controller
{
    /**
     * Get all pending reading activities untuk validasi guru
     * Guru hanya bisa lihat reading activities dari siswa yg dia ajar
     */
    public function getPending(Request $request)
    {
        try {
            $guru = $request->user();
            
            // Get pending reading activities
            $pendingActivities = ReadingActivity::where('status', 'pending_validation')
                ->with([
                    'user' => function ($query) {
                        $query->select('id', 'name', 'email', 'class_name');
                    },
                    'ebook' => function ($query) {
                        $query->select('id', 'title', 'author', 'pages', 'poin_per_halaman');
                    },
                ])
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'data' => $pendingActivities->items(),
                'pagination' => [
                    'current_page' => $pendingActivities->currentPage(),
                    'per_page' => $pendingActivities->perPage(),
                    'total' => $pendingActivities->total(),
                    'last_page' => $pendingActivities->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get detail single reading activity untuk validasi
     */
    public function getDetail($activityId)
    {
        try {
            $activity = ReadingActivity::findOrFail($activityId);
            
            // Get related data
            $activity->load([
                'user:id,name,email,grade_level,class_name',
                'ebook:id,title,author,pages,poin_per_halaman',
                'quizAttempts:id,user_id,ebook_id,score,correct_answers,passed',
            ]);

            // Get quiz score jika ada
            $quizAttempt = $activity->quizAttempts()->latest()->first();
            $quizScore = $quizAttempt ? $quizAttempt->score : null;

            // Calculate estimated points
            $pagesRead = $activity->final_page ?? $activity->current_page;
            $pointsFromReading = $pagesRead * ($activity->ebook->poin_per_halaman ?? 5);
            $pointsFromQuiz = $quizAttempt ? ($quizAttempt->correct_answers * 10) : 0;
            $totalEstimatedPoints = $pointsFromReading + $pointsFromQuiz;

            return response()->json([
                'data' => [
                    'activity' => $activity,
                    'quiz_score' => $quizScore,
                    'estimated_points' => [
                        'reading_points' => $pointsFromReading,
                        'quiz_points' => $pointsFromQuiz,
                        'total' => $totalEstimatedPoints,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    /**
     * Approve reading activity dan award points
     */
    public function approve(Request $request, $activityId)
    {
        try {
            $validated = $request->validate([
                'notes' => 'nullable|string|max:500',
            ]);

            $activity = ReadingActivity::findOrFail($activityId);
            
            // Ensure status is pending_validation
            if ($activity->status !== 'pending_validation') {
                return response()->json([
                    'message' => 'Activity is not pending validation',
                ], 400);
            }

            // Update activity status
            $activity->update([
                'status' => 'completed',
            ]);

            // Record validation
            Validation::updateOrCreate(
                ['reading_activity_id' => $activityId],
                [
                    'validated_by' => $request->user()->id,
                    'status' => 'approved',
                    'validated_at' => now(),
                    'notes' => $validated['notes'] ?? null,
                ]
            );

            // Award reading points
            $pagesRead = $activity->final_page ?? $activity->current_page;
            $pointsToAward = $pagesRead * ($activity->ebook->poin_per_halaman ?? 5);

            PointTransaction::create([
                'user_id' => $activity->user_id,
                'reading_activity_id' => $activityId,
                'points' => $pointsToAward,
                'type' => 'reading_validation',
                'description' => "Poin dari selesai membaca '{$activity->ebook->title}' ({$pagesRead} halaman)",
            ]);

            return response()->json([
                'message' => 'Reading activity approved and points awarded',
                'data' => [
                    'activity' => $activity,
                    'points_awarded' => $pointsToAward,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Reject reading activity tanpa award points
     */
    public function reject(Request $request, $activityId)
    {
        try {
            $validated = $request->validate([
                'notes' => 'required|string|max:500',
            ]);

            $activity = ReadingActivity::findOrFail($activityId);

            // Ensure status is pending_validation
            if ($activity->status !== 'pending_validation') {
                return response()->json([
                    'message' => 'Activity is not pending validation',
                ], 400);
            }

            // Update activity status
            $activity->update([
                'status' => 'rejected',
            ]);

            // Record validation
            Validation::updateOrCreate(
                ['reading_activity_id' => $activityId],
                [
                    'validated_by' => $request->user()->id,
                    'status' => 'rejected',
                    'validated_at' => now(),
                    'notes' => $validated['notes'],
                ]
            );

            return response()->json([
                'message' => 'Reading activity rejected',
                'data' => [
                    'activity' => $activity,
                    'reason' => $validated['notes'],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get validation history (all validations)
     */
    public function getHistory(Request $request)
    {
        try {
            $guru = $request->user();

            // Get all validations created by this guru
            $validations = Validation::where('validated_by', $guru->id)
                ->with(['readingActivity:id,user_id,ebook_id,status', 'readingActivity.user:id,name'])
                ->orderBy('validated_at', 'desc')
                ->paginate(20);

            return response()->json([
                'data' => $validations->items(),
                'pagination' => [
                    'current_page' => $validations->currentPage(),
                    'per_page' => $validations->perPage(),
                    'total' => $validations->total(),
                    'last_page' => $validations->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get statistics untuk guru validation
     */
    public function getStatistics(Request $request)
    {
        try {
            $guru = $request->user();

            $stats = [
                'pending_count' => ReadingActivity::where('status', 'pending_validation')->count(),
                'approved_count' => Validation::where('validated_by', $guru->id)
                    ->where('status', 'approved')
                    ->count(),
                'rejected_count' => Validation::where('validated_by', $guru->id)
                    ->where('status', 'rejected')
                    ->count(),
                'total_validated' => Validation::where('validated_by', $guru->id)->count(),
                'today_pending' => ReadingActivity::whereDate('created_at', today())
                    ->where('status', 'pending_validation')
                    ->count(),
            ];

            return response()->json(['data' => $stats]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
