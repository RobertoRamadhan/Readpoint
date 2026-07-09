<?php

namespace App\Http\Controllers\Api;

use App\Models\Ebook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;

class EbookController extends Controller
{
    /**
     * Return a public URL for a stored file path.
     * Works with both local/public disk and S3/cloud disks.
     */
    private function fileUrl(?string $path): ?string
    {
        if (!$path) return null;

        $disk = config('filesystems.default');

        if ($disk === 'public') {
            return asset('storage/' . $path);
        }

        // S3 or any cloud disk — generate a temporary or permanent URL
        if (Storage::disk($disk)->exists($path)) {
            return Storage::disk($disk)->url($path);
        }

        return null;
    }

    // Get semua e-book aktif
    public function index()
    {
        $ebooks = Ebook::where('is_active', true)
            ->select('id', 'title', 'author', 'pages', 'poin_per_halaman', 'file_path', 'cover_image', 'category', 'grade_level')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($ebook) {
                $ebook->cover_image_url = $this->fileUrl($ebook->cover_image);
                $ebook->pdf_file_url    = $this->fileUrl($ebook->file_path);
                return $ebook;
            });

        return response()->json([
            'data' => $ebooks,
        ]);
    }

    // Get e-book by ID (untuk baca)
    public function show($id)
    {
        $ebook = Ebook::where('is_active', true)->findOrFail($id);

        $ebook->cover_image_url = $this->fileUrl($ebook->cover_image);
        $ebook->pdf_file_url    = $this->fileUrl($ebook->file_path);

        return response()->json([
            'data' => $ebook,
        ]);
    }

    // Get file PDF (stream untuk reader)
    public function getPDF($id)
    {
        $ebook = Ebook::where('is_active', true)->findOrFail($id);

        $disk = config('filesystems.default');

        if (!Storage::disk($disk)->exists($ebook->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        // For cloud disks, redirect to the signed/public URL instead of streaming
        if ($disk !== 'local' && $disk !== 'public') {
            $url = Storage::disk($disk)->temporaryUrl($ebook->file_path, now()->addMinutes(60));
            return redirect($url);
        }

        $filePath = Storage::disk($disk)->path($ebook->file_path);

        return response()->file($filePath, [
            'Content-Disposition' => 'inline; filename="' . $ebook->title . '.pdf"',
            'Content-Type' => 'application/pdf',
        ]);
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
            'pdf_file'         => 'required|file|mimes:pdf|max:51200', // max 50 MB
            'cover_image'      => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
        ]);

        try {
            $disk = config('filesystems.default');

            $pdfPath   = $request->file('pdf_file')->store('ebooks/pdfs', $disk);
            $coverPath = null;
            if ($request->hasFile('cover_image')) {
                $coverPath = $request->file('cover_image')->store('ebooks/covers', $disk);
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

            $ebook->cover_image_url = $this->fileUrl($ebook->cover_image);
            $ebook->pdf_file_url    = $this->fileUrl($ebook->file_path);

            return response()->json([
                'message' => 'E-book uploaded successfully',
                'data'    => $ebook,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload e-book',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // Admin: Update e-book metadata
    public function update(Request $request, $id)
    {
        $ebook = Ebook::findOrFail($id);

        $validated = $request->validate([
            'title'            => 'sometimes|string|max:255',
            'author'           => 'sometimes|string|max:255',
            'pages'            => 'sometimes|integer|min:1',
            'poin_per_halaman' => 'sometimes|integer|min:1',
            'category'         => 'sometimes|string',
            'is_active'        => 'sometimes|boolean',
            'pdf_file'         => 'nullable|file|mimes:pdf|max:51200',
            'cover_image'      => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
        ]);

        try {
            $disk = config('filesystems.default');

            if ($request->hasFile('pdf_file')) {
                if ($ebook->file_path) {
                    Storage::disk($disk)->delete($ebook->file_path);
                }
                $ebook->file_path = $request->file('pdf_file')->store('ebooks/pdfs', $disk);
            }

            if ($request->hasFile('cover_image')) {
                if ($ebook->cover_image) {
                    Storage::disk($disk)->delete($ebook->cover_image);
                }
                $ebook->cover_image = $request->file('cover_image')->store('ebooks/covers', $disk);
            }

            $ebook->update([
                'title'            => $validated['title']            ?? $ebook->title,
                'author'           => $validated['author']           ?? $ebook->author,
                'pages'            => $validated['pages']            ?? $ebook->pages,
                'poin_per_halaman' => $validated['poin_per_halaman'] ?? $ebook->poin_per_halaman,
                'category'         => $validated['category']         ?? $ebook->category,
                'is_active'        => $validated['is_active']        ?? $ebook->is_active,
            ]);

            $ebook->refresh();
            $ebook->cover_image_url = $this->fileUrl($ebook->cover_image);
            $ebook->pdf_file_url    = $this->fileUrl($ebook->file_path);

            return response()->json([
                'message' => 'E-book updated',
                'data'    => $ebook,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update e-book',
                'error'   => $e->getMessage(),
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
