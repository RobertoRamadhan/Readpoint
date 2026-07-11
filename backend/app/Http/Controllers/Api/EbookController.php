<?php

namespace App\Http\Controllers\Api;

use App\Models\Ebook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\StorageHelper;

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
    public function show($id)
    {
        $ebook = Ebook::where('is_active', true)->findOrFail($id);
        $ebook->cover_image_url = $this->fileUrl($ebook->cover_image, 'cover');
        $ebook->pdf_file_url    = $this->fileUrl($ebook->file_path, 'ebook');
        return response()->json(['data' => $ebook]);
    }

    // Stream PDF
    public function getPDF($id)
    {
        $ebook = Ebook::where('is_active', true)->findOrFail($id);

        // Kembalikan URL Supabase langsung — frontend fetch PDF dari Supabase tanpa credentials
        $url = StorageHelper::url($ebook->file_path, 'ebook');
        if (!$url) {
            return response()->json(['message' => 'File not found'], 404);
        }

        // Return URL supaya frontend bisa fetch langsung ke Supabase (tanpa CORS issue)
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

        try {
            if ($request->hasFile('pdf_file')) {
                StorageHelper::delete($ebook->file_path, 'ebook');
                $ebook->file_path = StorageHelper::upload($request->file('pdf_file'), 'ebook');
            }

            if ($request->hasFile('cover_image')) {
                StorageHelper::delete($ebook->cover_image, 'cover');
                $ebook->cover_image = StorageHelper::upload($request->file('cover_image'), 'cover');
            }

            $ebook->update(array_filter([
                'title'            => $request->title,
                'author'           => $request->author,
                'pages'            => $request->pages,
                'poin_per_halaman' => $request->poin_per_halaman,
                'category'         => $request->category,
                'grade_level'      => $request->grade_level,
                'is_active'        => $request->is_active,
            ], fn($v) => $v !== null));

            $ebook->save();
            $ebook->refresh();

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
            return response()->json(['message' => 'Failed to update e-book', 'error' => $e->getMessage()], 500);
        }
    }

    // Admin: Deactivate e-book
    public function destroy($id)
    {
        $ebook = Ebook::findOrFail($id);
        $ebook->update(['is_active' => false]);
        return response()->json(['message' => 'E-book deactivated']);
    }

    // Get user's reading progress for specific e-book
    public function getUserProgress(Request $request, $ebookId)
    {
        $activity = \App\Models\ReadingActivity::where('user_id', $request->user()->id)
            ->where('ebook_id', $ebookId)
            ->latest()
            ->first();
        return response()->json(['data' => $activity]);
    }
}
