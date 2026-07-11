<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReadingProgress;
use Illuminate\Http\Request;

class ReadingProgressController extends Controller
{
    /**
     * Get reading progress for the authenticated user
     * Returns all ebooks and the user's progress on each.
     */
    public function index(Request $request)
    {
        $progress = ReadingProgress::where('user_id', $request->user()->id)
            ->with('ebook:id,title,author,pages,cover_image')
            ->orderBy('last_read_at', 'desc')
            ->get();

        return response()->json(['data' => $progress]);
    }

    /**
     * Upsert reading progress for a specific ebook.
     * Creates a new record if none exists, or updates the existing one.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ebook_id'    => 'required|exists:ebooks,id',
            'current_page' => 'required|integer|min:0',
            'total_pages'  => 'required|integer|min:1',
        ]);

        $percentage = $validated['total_pages'] > 0
            ? (int) round(($validated['current_page'] / $validated['total_pages']) * 100)
            : 0;

        $progress = ReadingProgress::updateOrCreate(
            [
                'user_id'  => $request->user()->id,
                'ebook_id' => $validated['ebook_id'],
            ],
            [
                'current_page'        => $validated['current_page'],
                'total_pages'         => $validated['total_pages'],
                'progress_percentage' => $percentage,
                'last_read_at'        => now(),
            ]
        );

        return response()->json([
            'message' => 'Progress saved',
            'data'    => $progress,
        ], 201);
    }

    /**
     * Get reading progress for a specific ebook.
     */
    public function show(Request $request, string $ebookId)
    {
        $progress = ReadingProgress::where('user_id', $request->user()->id)
            ->where('ebook_id', $ebookId)
            ->with('ebook:id,title,author,pages')
            ->first();

        if (!$progress) {
            return response()->json(['data' => null]);
        }

        return response()->json(['data' => $progress]);
    }

    /**
     * Update reading progress for a specific ebook (by progress record ID).
     */
    public function update(Request $request, string $id)
    {
        $progress = ReadingProgress::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $validated = $request->validate([
            'current_page' => 'required|integer|min:0',
            'total_pages'  => 'sometimes|integer|min:1',
        ]);

        $totalPages = $validated['total_pages'] ?? $progress->total_pages;
        $percentage = $totalPages > 0
            ? (int) round(($validated['current_page'] / $totalPages) * 100)
            : 0;

        $progress->update([
            'current_page'        => $validated['current_page'],
            'total_pages'         => $totalPages,
            'progress_percentage' => $percentage,
            'last_read_at'        => now(),
        ]);

        return response()->json([
            'message' => 'Progress updated',
            'data'    => $progress,
        ]);
    }

    /**
     * Delete reading progress record.
     */
    public function destroy(Request $request, string $id)
    {
        $progress = ReadingProgress::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $progress->delete();

        return response()->json(['message' => 'Progress deleted']);
    }
}
