<?php

namespace App\Http\Controllers\Api;

use App\Models\Ebook;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Smalot\PdfParser\Parser as PdfParser;
use Illuminate\Support\Facades\Cache;

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

    // Extract text from PDF
    public function extractText($id)
    {
        try {
            $ebook = Ebook::where('is_active', true)
                ->findOrFail($id);

            // Check cache first
            $cacheKey = 'ebook_text_v2_' . $id;
            $text = Cache::get($cacheKey);

            if (!$text && $ebook->file_path) {
                $pdfPath = storage_path('app/public/' . $ebook->file_path);

                if (!file_exists($pdfPath)) {
                    return response()->json(['error' => 'PDF file not found'], 404);
                }

                $text = $this->extractPdfText($pdfPath);

                if ($text) {
                    // Cache for 24 hours
                    Cache::put($cacheKey, $text, 86400);
                }
            }

            return response()->json([
                'data' => [
                    'ebook_id' => $ebook->id,
                    'title'    => $ebook->title,
                    'text'     => $text ?? '',
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Extract and clean text from a PDF file.
     * Handles common encoding issues with Indonesian PDFs.
     */
    private function extractPdfText(string $pdfPath): string
    {
        try {
            $config = new \Smalot\PdfParser\Config();
            // Retain horizontal whitespace so words don't merge
            $config->setRetainImageContent(false);
            $config->setDecodeMemoryLimit(512 * 1024 * 1024); // 512 MB

            $parser = new PdfParser([], $config);
            $pdf    = $parser->parseFile($pdfPath);

            // Try full-document extraction first
            $rawText = $pdf->getText();

            // If result looks garbled, try page-by-page with separator
            if ($this->isGarbled($rawText)) {
                $rawText = '';
                foreach ($pdf->getPages() as $page) {
                    $pageText = $page->getText();
                    if (!$this->isGarbled($pageText)) {
                        $rawText .= $pageText . "\n\n";
                    }
                }
            }

            return $this->cleanText($rawText);

        } catch (\Exception $e) {
            \Log::warning('[EbookController] PDF text extraction failed: ' . $e->getMessage());
            return '';
        }
    }

    /**
     * Detect if extracted text is garbled/corrupted.
     * Garbled text has a high ratio of non-printable or symbol characters.
     */
    private function isGarbled(string $text): bool
    {
        if (empty(trim($text))) {
            return true;
        }

        // Count printable ASCII + common Unicode letters vs total chars
        $total = mb_strlen($text);
        if ($total < 10) {
            return true;
        }

        // Count characters that are normal (letters, digits, spaces, punctuation)
        $normalCount = preg_match_all(
            '/[\p{L}\p{N}\p{Z}\p{P}\n\r\t]/u',
            $text,
            $matches
        );

        $ratio = $normalCount / $total;

        // If less than 50% of chars are "normal", it's garbled
        return $ratio < 0.50;
    }

    /**
     * Clean and normalize extracted PDF text.
     */
    private function cleanText(string $text): string
    {
        if (empty($text)) {
            return '';
        }

        // 1. Fix encoding — try to convert from various encodings to UTF-8
        if (!mb_check_encoding($text, 'UTF-8')) {
            $converted = mb_convert_encoding($text, 'UTF-8', 'Windows-1252, ISO-8859-1, UTF-8');
            if ($converted !== false) {
                $text = $converted;
            }
        }

        // 2. Remove null bytes and control characters (except newlines/tabs)
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text);

        // 3. Remove or replace common garbled symbol patterns
        //    These are typically caused by custom font glyph mappings
        $text = preg_replace('/[^\p{L}\p{N}\p{Z}\p{P}\p{S}\n\r\t]/u', ' ', $text);

        // 4. Collapse multiple spaces into one (but preserve newlines)
        $text = preg_replace('/[ \t]{2,}/', ' ', $text);

        // 5. Collapse more than 2 consecutive newlines into 2
        $text = preg_replace('/\n{3,}/', "\n\n", $text);

        // 6. Trim each line
        $lines = explode("\n", $text);
        $lines = array_map('trim', $lines);
        $text  = implode("\n", $lines);

        // 7. Final trim
        return trim($text);
    }

    // Get file PDF (stream untuk reader)
    public function getPDF($id)
    {
        $ebook = Ebook::where('is_active', true)
            ->findOrFail($id);

        $filePath = storage_path('app/public/' . $ebook->file_path);

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
