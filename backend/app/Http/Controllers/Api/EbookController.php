<?php

namespace App\Http\Controllers\Api;

use App\Models\Ebook;
use App\Models\BookAssignment;
use App\Models\PointTransaction;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\ReadingActivity;
use App\Models\ReadingProgress;
use App\Models\Validation;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\StorageHelper;

class EbookController extends Controller
{
    private function fileUrl(?string $path, string $type = 'cover'): ?string
    {
        if (!$path) return null;
        return StorageHelper::url($path, $type);
    }

    // Get semua e-book aktif
    public function index()
    {
        try {
            $ebooks = Ebook::where('is_active', true)
                ->select('id', 'title', 'author', 'pages', 'poin_per_halaman', 'file_path', 'cover_image', 'category', 'grade_level')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($ebook) {
                    $ebook->cover_image_url = $this->fileUrl($ebook->cover_image, 'cover');
                    $ebook->pdf_file_url    = $this->fileUrl($ebook->file_path, 'ebook');
                    return $ebook;
                });

            return response()->json(['data' => $ebooks]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch ebooks', 'error' => $e->getMessage()], 500);
        }
    }

    // Get e-book by ID
    public function show(Request $request, $id)
    {
        $ebook = Ebook::where('is_active', true)->findOrFail($id);
        if ($request->user()?->role === 'siswa') {
            $hasOngoingActivity = ReadingActivity::where('user_id', $request->user()->id)
                ->where('ebook_id', $ebook->id)
                ->where('status', 'ongoing')
                ->exists();
            $activeBookCount = ReadingActivity::where('user_id', $request->user()->id)
                ->where('status', 'ongoing')
                ->distinct('ebook_id')
                ->count('ebook_id');

            if (!$hasOngoingActivity && $activeBookCount >= ReadingActivity::MAX_ACTIVE_BOOKS) {
                return response()->json([
                    'message' => 'Batas ' . ReadingActivity::MAX_ACTIVE_BOOKS . ' buku yang sedang dibaca sudah tercapai. Selesaikan salah satu buku terlebih dahulu.',
                    'max_active_books' => ReadingActivity::MAX_ACTIVE_BOOKS,
                    'active_books' => $activeBookCount,
                ], 409);
            }
        }

        $ebook->cover_image_url = $this->fileUrl($ebook->cover_image, 'cover');
        $ebook->pdf_file_url    = $this->fileUrl($ebook->file_path, 'ebook');
        return response()->json(['data' => $ebook]);
    }

    // Stream PDF
    public function getPDF($id)
    {
        $ebook = Ebook::where('is_active', true)->findOrFail($id);

        // Kembalikan URL Supabase langsung â€” frontend fetch PDF dari Supabase tanpa credentials
        $url = StorageHelper::url($ebook->file_path, 'ebook');
        if (!$url) {
            return response()->json(['message' => 'File not found'], 404);
        }

        // Return PDF URL with title for frontend viewer
        return response()->json(['url' => $url, 'title' => $ebook->title]);
    }

    // Admin: Upload e-book baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'            => 'required|string|max:255',
            'author'           => 'required|string|max:255',
            'pages'            => 'required|integer|min:1',
            'poin_per_halaman' => 'required|integer|min:1',
            'category'         => 'required|string',
            'grade_level'      => 'required|in:1,2,3,all',
            'pdf_file'         => 'required|file|mimes:pdf|max:204800',  // max 200 MB
            'cover_image'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        try {
            $pdfPath   = StorageHelper::upload($request->file('pdf_file'), 'ebook');
            $coverPath = null;
            if ($request->hasFile('cover_image')) {
                $coverPath = StorageHelper::upload($request->file('cover_image'), 'cover');
            }

            $ebook = Ebook::create([
                'title'            => $validated['title'],
                'author'           => $validated['author'],
                'pages'            => $validated['pages'],
                'poin_per_halaman' => $validated['poin_per_halaman'],
                'category'         => $validated['category'],
                'grade_level'      => $validated['grade_level'],
                'file_path'        => $pdfPath,
                'cover_image'      => $coverPath,
                'is_active'        => true,
            ]);

            return response()->json([
                'message' => 'E-book uploaded successfully',
                'data'    => [
                    'id'               => $ebook->id,
                    'title'            => $ebook->title,
                    'author'           => $ebook->author,
                    'pages'            => $ebook->pages,
                    'poin_per_halaman' => $ebook->poin_per_halaman,
                    'category'         => $ebook->category,
                    'grade_level'      => $ebook->grade_level,
                    'is_active'        => $ebook->is_active,
                    'cover_image_url'  => StorageHelper::url($coverPath, 'cover'),
                    'pdf_url'          => StorageHelper::url($pdfPath, 'ebook'),
                    'created_at'       => $ebook->created_at,
                    'updated_at'       => $ebook->updated_at,
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to upload e-book', 'error' => $e->getMessage()], 500);
        }
    }

    // Admin: Update e-book
    public function update(Request $request, $id)
    {
        $ebook = Ebook::findOrFail($id);

        $request->validate([
            'title'            => 'sometimes|string|max:255',
            'author'           => 'sometimes|string|max:255',
            'pages'            => 'sometimes|integer|min:1',
            'poin_per_halaman' => 'sometimes|integer|min:1',
            'category'         => 'sometimes|string',
            'grade_level'      => 'sometimes|in:1,2,3,all',
            'is_active'        => 'sometimes|boolean',
            'pdf_file'         => 'nullable|file|mimes:pdf|max:204800',  // max 200 MB
            'cover_image'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $newFiles = [];
        $oldFiles = [];
        $databaseUpdated = false;

        try {
            if ($request->hasFile('pdf_file')) {
                $newPath = StorageHelper::upload($request->file('pdf_file'), 'ebook');
                $newFiles[] = [$newPath, 'ebook'];
                $oldFiles[] = [$ebook->file_path, 'ebook'];
                $ebook->file_path = $newPath;
            }

            if ($request->hasFile('cover_image')) {
                $newPath = StorageHelper::upload($request->file('cover_image'), 'cover');
                $newFiles[] = [$newPath, 'cover'];
                $oldFiles[] = [$ebook->cover_image, 'cover'];
                $ebook->cover_image = $newPath;
            }

            $ebook->fill(array_filter([
                'title'            => $request->title,
                'author'           => $request->author,
                'pages'            => $request->pages,
                'poin_per_halaman' => $request->poin_per_halaman,
                'category'         => $request->category,
                'grade_level'      => $request->grade_level,
                'is_active'        => $request->is_active,
            // Hanya filter null â€” false/0 tetap diproses sebagai nilai valid
            ], fn($v) => !is_null($v)));

            $ebook->save();
            $databaseUpdated = true;
            $ebook->refresh();

            foreach ($oldFiles as [$path, $type]) {
                StorageHelper::delete($path, $type);
            }

            return response()->json([
                'message' => 'E-book updated',
                'data'    => [
                    'id'               => $ebook->id,
                    'title'            => $ebook->title,
                    'author'           => $ebook->author,
                    'pages'            => $ebook->pages,
                    'poin_per_halaman' => $ebook->poin_per_halaman,
                    'category'         => $ebook->category,
                    'grade_level'      => $ebook->grade_level,
                    'is_active'        => $ebook->is_active,
                    'cover_image_url'  => StorageHelper::url($ebook->cover_image, 'cover'),
                    'pdf_url'          => StorageHelper::url($ebook->file_path, 'ebook'),
                    'created_at'       => $ebook->created_at,
                    'updated_at'       => $ebook->updated_at,
                ],
            ]);
        } catch (\Exception $e) {
            if (!$databaseUpdated) {
                foreach ($newFiles as [$path, $type]) {
                    StorageHelper::delete($path, $type);
                }
            }

            return response()->json(['message' => 'Failed to update e-book', 'error' => $e->getMessage()], 500);
        }
    }

    // Admin: Permanently delete e-book and dependent reading/quiz records.
    public function destroy($id)
    {
        $ebook = Ebook::findOrFail($id);

        [$filePath, $coverImage] = DB::transaction(function () use ($ebook) {
            $readingActivityIds = ReadingActivity::where('ebook_id', $ebook->id)->pluck('id');
            $quizAttemptIds = QuizAttempt::where('ebook_id', $ebook->id)->pluck('id');

            Validation::whereIn('reading_activity_id', $readingActivityIds)->delete();
            PointTransaction::whereIn('reading_activity_id', $readingActivityIds)
                ->update(['reading_activity_id' => null]);
            PointTransaction::whereIn('quiz_attempt_id', $quizAttemptIds)
                ->update(['quiz_attempt_id' => null]);

            ReadingActivity::whereIn('id', $readingActivityIds)->delete();
            ReadingProgress::where('ebook_id', $ebook->id)->delete();
            QuizAttempt::whereIn('id', $quizAttemptIds)->delete();
            QuizQuestion::where('ebook_id', $ebook->id)->delete();
            BookAssignment::where('ebook_id', $ebook->id)->delete();
            $ebook->delete();

            return [$ebook->file_path, $ebook->cover_image];
        });

        StorageHelper::delete($filePath, 'ebook');
        StorageHelper::delete($coverImage, 'cover');

        return response()->json(['message' => 'E-book and its related records permanently deleted']);
    }

    // Get user's reading progress for specific e-book
    public function getUserProgress(Request $request, $ebookId)
    {
        $activity = \App\Models\ReadingActivity::where('user_id', $request->user()->id)
            ->where('ebook_id', $ebookId)
            ->latest('id')
            ->first();
        return response()->json(['data' => $activity]);
    }
}
