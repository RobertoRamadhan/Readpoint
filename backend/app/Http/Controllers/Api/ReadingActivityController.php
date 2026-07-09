<?php

namespace App\Http\Controllers\Api;

use App\Models\ReadingActivity;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ReadingActivityController extends Controller
{
    // Mulai membaca buku
    public function startReading(Request $request)
    {
        $validated = $request->validate([
            'ebook_id' => 'required|exists:ebooks,id',
        ]);

        $activity = ReadingActivity::create([
            'user_id' => $request->user()->id,
            'ebook_id' => $validated['ebook_id'],
            'started_at' => now(),
            'current_page' => 1,
            'duration_minutes' => 0,
            'status' => 'ongoing',
        ]);

        return response()->json([
            'message' => 'Reading session started',
            'data' => $activity,
        ], 201);
    }

    // Update progress membaca
    public function updateProgress(Request $request, $activityId)
    {
        $validated = $request->validate([
            'current_page' => 'required|integer|min:1',
            'duration_minutes' => 'required|integer|min:0',
        ]);

        $activity = ReadingActivity::where('id', $activityId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $activity->update([
            'current_page' => $validated['current_page'],
            'duration_minutes' => $validated['duration_minutes'],
        ]);

        return response()->json([
            'message' => 'Progress updated',
            'data' => $activity,
        ]);
    }

    // Selesai membaca (submit untuk validasi)
    public function completeReading(Request $request, $activityId)
    {
        $validated = $request->validate([
            'final_page' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $activity = ReadingActivity::where('id', $activityId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $ebook = $activity->ebook;
        
        // Set status pending validasi
        $activity->update([
            'final_page' => $validated['final_page'],
            'notes' => $validated['notes'] ?? null,
            'completed_at' => now(),
            'status' => 'pending_validation',
        ]);

        return response()->json([
            'message' => 'Reading activity submitted for validation',
            'data' => $activity,
            'required_quiz' => true, // Siswa perlu mengerjakan quiz untuk validasi
        ]);
    }

    // Get aktivitas membaca siswa
    public function getMyActivities(Request $request)
    {
        $activities = ReadingActivity::where('user_id', $request->user()->id)
            ->with('ebook')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $activities,
        ]);
    }

    // Get aktivitas membaca by ID
    public function getActivity(Request $request, $activityId)
    {
        $activity = ReadingActivity::where('id', $activityId)
            ->where('user_id', $request->user()->id)
            ->with('ebook')
            ->firstOrFail();

        return response()->json([
            'data' => $activity,
        ]);
    }

    // Get buku yang sering dibaca siswa
    public function getFrequentlyReadBooks(Request $request)
    {
        // Get ebooks with most reading activities across ALL users
        $frequentlyReadBooks = ReadingActivity::select('ebook_id', \DB::raw('COUNT(*) as read_count'))
            ->groupBy('ebook_id')
            ->orderBy('read_count', 'desc')
            ->limit(5)
            ->with('ebook')
            ->get()
            ->map(function ($activity) {
                $ebook = $activity->ebook;
                if ($ebook) {
                    // Convert storage paths to full URLs
                    if ($ebook->cover_image) {
                        $ebook->cover_image = asset('storage/' . $ebook->cover_image);
                    }
                    if ($ebook->file_path) {
                        $ebook->pdf_file = asset('storage/' . $ebook->file_path);
                    }
                    $ebook->read_count = $activity->read_count;
                }
                return $ebook;
            })
            ->filter(function ($ebook) {
                return $ebook !== null;
            });

        return response()->json([
            'data' => $frequentlyReadBooks,
        ]);
    }
}
