<?php

namespace App\Http\Controllers\Api;

use App\Models\Ebook;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class EbookController extends Controller
{
    // Get semua e-book aktif
    public function index()
    {
        $ebooks = Ebook::where('is_active', true)
            ->select('id', 'title', 'author', 'pages', 'poin_per_halaman', 'file_path', 'cover_image', 'category', 'grade_level')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($ebook) {
                // Convert storage paths to full URLs
                if ($ebook->cover_image) {
                    $ebook->cover_image = asset('storage/' . $ebook->cover_image);
                }
                if ($ebook->file_path) {
                    $ebook->pdf_file = asset('storage/' . $ebook->file_path);
                }
                return $ebook;
            });

        return response()->json([
            'data' => $ebooks,
        ]);
    }

    // Get e-book by ID (untuk baca)
    public function show($id)
    {
        $ebook = Ebook::where('is_active', true)
            ->findOrFail($id);

        return response()->json([
            'data' => $ebook,
        ]);
    }

    // Get file PDF (stream untuk reader)
    public function getPDF($id)
    {
        $ebook = Ebook::where('is_active', true)
            ->findOrFail($id);

        $filePath = storage_path('app/' . $ebook->file_path);

        if (!file_exists($filePath)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return response()->file($filePath, [
            'Content-Disposition' => 'inline; filename="' . $ebook->title . '.pdf"',
            'Content-Type' => 'application/pdf',
        ]);
    }

    // Admin: Upload e-book baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'pages' => 'required|integer|min:1',
            'poin_per_halaman' => 'required|integer|min:1',
            'category' => 'required|string',
            'grade_level' => 'required|in:1,2,3,all',
            'pdf_file' => 'required|file|mimes:pdf|max:50000', // max 50MB
            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png|max:5000',
        ]);

        try {
            // Store PDF to storage/app/public (accessible via /storage route)
            $pdfPath = $request->file('pdf_file')->store('ebooks/pdfs', 'public');

            // Store cover image jika ada
            $coverPath = null;
            if ($request->hasFile('cover_image')) {
                $coverPath = $request->file('cover_image')->store('ebooks/covers', 'public');
            }

            $ebook = Ebook::create([
                'title' => $validated['title'],
                'author' => $validated['author'],
                'pages' => $validated['pages'],
                'poin_per_halaman' => $validated['poin_per_halaman'],
                'category' => $validated['category'],
                'grade_level' => $validated['grade_level'],
                'file_path' => $pdfPath,
                'cover_image' => $coverPath,
                'is_active' => true,
            ]);

            return response()->json([
                'message' => 'E-book uploaded successfully',
                'data' => $ebook,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload e-book',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Admin: Update e-book metadata
    public function update(Request $request, $id)
    {
        $ebook = Ebook::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'author' => 'sometimes|string|max:255',
            'pages' => 'sometimes|integer|min:1',
            'poin_per_halaman' => 'sometimes|integer|min:1',
            'category' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'pdf_file' => 'nullable|file|mimes:pdf|max:50000',
            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png|max:5000',
        ]);

        try {
            // Update PDF if provided
            if ($request->hasFile('pdf_file')) {
                // Delete old PDF
                if ($ebook->file_path && file_exists(storage_path('app/public/' . $ebook->file_path))) {
                    unlink(storage_path('app/public/' . $ebook->file_path));
                }
                $pdfPath = $request->file('pdf_file')->store('ebooks/pdfs', 'public');
                $ebook->file_path = $pdfPath;
            }

            // Update cover image if provided
            if ($request->hasFile('cover_image')) {
                // Delete old cover
                if ($ebook->cover_image && file_exists(storage_path('app/public/' . $ebook->cover_image))) {
                    unlink(storage_path('app/public/' . $ebook->cover_image));
                }
                $coverPath = $request->file('cover_image')->store('ebooks/covers', 'public');
                $ebook->cover_image = $coverPath;
            }

            // Update other fields
            $ebook->update([
                'title' => $validated['title'] ?? $ebook->title,
                'author' => $validated['author'] ?? $ebook->author,
                'pages' => $validated['pages'] ?? $ebook->pages,
                'poin_per_halaman' => $validated['poin_per_halaman'] ?? $ebook->poin_per_halaman,
                'category' => $validated['category'] ?? $ebook->category,
                'is_active' => $validated['is_active'] ?? $ebook->is_active,
            ]);

            // Refresh the model to get updated values
            $ebook->refresh();

            // Add full URLs to response
            $ebook->cover_image = $ebook->cover_image ? asset('storage/' . $ebook->cover_image) : null;
            $ebook->pdf_file = $ebook->file_path ? asset('storage/' . $ebook->file_path) : null;

            return response()->json([
                'message' => 'E-book updated',
                'data' => $ebook,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update e-book',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // Admin: Soft delete e-book
    public function destroy($id)
    {
        $ebook = Ebook::findOrFail($id);
        $ebook->update(['is_active' => false]);

        return response()->json([
            'message' => 'E-book deactivated',
        ]);
    }

    // Get user's reading progress for specific e-book
    public function getUserProgress(Request $request, $ebookId)
    {
        $activity = \App\Models\ReadingActivity::where('user_id', $request->user()->id)
            ->where('ebook_id', $ebookId)
            ->latest()
            ->first();

        return response()->json([
            'data' => $activity,
        ]);
    }
}
