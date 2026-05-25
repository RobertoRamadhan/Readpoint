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

        // Convert storage paths to full URLs
        if ($ebook->cover_image) {
            $ebook->cover_image = asset('storage/' . $ebook->cover_image);
        }
        if ($ebook->file_path) {
            $ebook->pdf_file = asset('storage/' . $ebook->file_path);
        }

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
     * Uses smart fallback strategies for PDFs with embedded fonts.
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

            // Try Strategy 1: Full-document extraction
            $rawText = $pdf->getText();
            $cleanedText = $this->cleanText($rawText);

            // If full extraction produces good text (>200 chars), use it
            if (!empty($cleanedText) && mb_strlen($cleanedText) > 200) {
                return $cleanedText;
            }

            // Strategy 2: Page-by-page extraction with quality checking
            $pageContents = [];
            foreach ($pdf->getPages() as $pageNum => $page) {
                try {
                    $pageText = $page->getText();
                    $cleanedPageText = $this->cleanText($pageText);
                    
                    // Only include pages that have substantial content (>50 chars)
                    if (mb_strlen($cleanedPageText) > 50) {
                        $pageContents[] = $cleanedPageText;
                        \Log::debug("[EbookController] Page " . ($pageNum + 1) . " extracted: " . mb_strlen($cleanedPageText) . " chars");
                    } else {
                        \Log::debug("[EbookController] Page " . ($pageNum + 1) . " skipped (too short or corrupted)");
                    }
                } catch (\Exception $e) {
                    \Log::debug('[EbookController] Page extraction error: ' . $e->getMessage());
                }
            }

            if (!empty($pageContents)) {
                return implode("\n\n", $pageContents);
            }

            // Fallback: return whatever we could extract (might be partial)
            return $cleanedText;

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
     * VERY AGGRESSIVE cleaning to fix scattered/corrupted text from PDFs with embedded fonts.
     */
    private function cleanText(string $text): string
    {
        if (empty($text)) {
            return '';
        }

        // 1. Fix encoding first
        if (!mb_check_encoding($text, 'UTF-8')) {
            $converted = mb_convert_encoding($text, 'UTF-8', 'Windows-1252, ISO-8859-1, UTF-8');
            if ($converted !== false) {
                $text = $converted;
            }
        }

        // 2. Remove all control characters
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/u', '', $text);

        // 3. Split into lines and clean each one
        $lines = explode("\n", $text);
        $cleanedLines = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            
            // Skip empty lines (but preserve them as paragraph breaks)
            if (empty($line)) {
                // Add empty line only if the previous line wasn't empty (avoid stacking)
                if (!empty($cleanedLines) && !empty(end($cleanedLines))) {
                    $cleanedLines[] = '';
                }
                continue;
            }
            
            // AGGRESSIVE: Skip lines that look like corrupted/scattered text
            // These have very few normal chars, lots of spacing, or are just single letters
            
            // Count actual word characters vs total
            $wordChars = mb_strlen(preg_replace('/[^\p{L}\p{N}]/u', '', $line));
            $totalChars = mb_strlen($line);
            
            // Skip if line is too short (likely a header or stray char)
            if ($totalChars < 8) {
                continue;
            }
            
            // Skip if mostly spaces/punctuation (scattered text indicator)
            if ($wordChars < ($totalChars * 0.4)) {
                continue;
            }
            
            // Skip if has weird Unicode symbols that indicate corrupted fonts
            $symbolCount = preg_match_all('/[\p{So}\p{Sc}\p{Sk}\p{Cn}]/u', $line);
            if ($symbolCount > ($totalChars * 0.1)) {
                continue;
            }
            
            // Clean: remove extra spaces but keep punctuation
            $line = preg_replace('/[ \t]{2,}/', ' ', $line);
            
            // Only keep valid characters: letters, numbers, basic punctuation, spaces
            $line = preg_replace(
                '/[^\p{L}\p{N}\s.,!?;:\'"()\-]/u',
                '',
                $line
            );
            
            $line = trim($line);
            
            // Final check: line should have some content
            if (!empty($line) && mb_strlen($line) >= 8) {
                $cleanedLines[] = $line;
            }
        }

        // 4. Join lines, ensuring proper spacing between paragraphs
        $text = implode("\n", $cleanedLines);
        
        // 5. Fix multiple consecutive spaces
        $text = preg_replace('/[ \t]{2,}/', ' ', $text);
        
        // 6. Normalize paragraph breaks (max 2 newlines)
        $text = preg_replace('/\n{3,}/', "\n\n", $text);
        
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
