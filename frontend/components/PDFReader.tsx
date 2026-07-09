'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker — use CDN so Vercel/Next.js doesn't need to bundle the worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFReaderProps {
  ebookId: number;
  title: string;
  pdfUrl: string;
  onProgress?: (page: number) => void;
}

export default function PDFReader({ ebookId, title, pdfUrl, onProgress }: PDFReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [scale, setScale] = useState(1.5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<any>(null);

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
        pdfDocRef.current = pdfDoc;
        setTotalPages(pdfDoc.numPages);
        setCurrentPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat PDF');
        console.error('PDF loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (pdfUrl) {
      loadPdf();
    }
  }, [pdfUrl]);

  // Render page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDocRef.current || !canvasRef.current) return;

      try {
        const page = await pdfDocRef.current.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context!,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        if (onProgress) {
          onProgress(currentPage);
        }
      } catch (err) {
        console.error('Page render error:', err);
      }
    };

    if (!isLoading && totalPages > 0) {
      renderPage();
    }
  }, [currentPage, scale, totalPages, isLoading, onProgress]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleBookmark = () => {
    setBookmarks(prev =>
      prev.includes(currentPage)
        ? prev.filter(p => p !== currentPage)
        : [...prev, currentPage]
    );
  };

  const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;
  const isBookmarked = bookmarks.includes(currentPage);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b-2 border-black bg-white px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-black truncate">{title}</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 font-bold">
              Halaman <span className="border-2 border-black px-2 py-0.5 bg-black text-white font-bold">{currentPage}</span> dari <span className="border-2 border-black px-2 py-0.5">{totalPages}</span>
            </p>
          </div>
          <button
            onClick={toggleBookmark}
            className={`px-4 py-2 border-2 font-bold transition-all ${
              isBookmarked
                ? 'border-black bg-black text-white'
                : 'border-black bg-white text-black hover:bg-black hover:text-white'
            }`}
            title={isBookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
          >
            {isBookmarked ? '⭐ Bookmark' : '☆ Bookmark'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex flex-col items-center justify-start p-2 sm:p-4 bg-gray-100">
        {error && (
          <div className="w-full max-w-4xl mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p className="font-semibold">Gagal memuat PDF:</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
              <p className="text-gray-600 font-bold text-lg">Memuat halaman {currentPage}...</p>
            </div>
          </div>
        ) : totalPages === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-gray-600 font-bold text-lg">PDF tidak tersedia</p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-lg">
            <canvas
              ref={canvasRef}
              className="mx-auto"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <footer className="border-t-2 border-black bg-white px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full border-2 border-black h-4 overflow-hidden bg-white">
              <div
                className="bg-black h-4 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs sm:text-sm text-gray-600 font-bold">{progress}% Selesai</p>
              <p className="text-xs sm:text-sm text-gray-700 font-bold">
                {currentPage === totalPages ? 'Buku Selesai! 🎉' : ''}
              </p>
            </div>
          </div>

          {/* Scale Controls */}
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={() => setScale(Math.max(0.5, scale - 0.25))}
              className="px-3 py-2 border-2 border-black bg-white text-black font-bold hover:bg-black hover:text-white transition-all"
            >
              −
            </button>
            <span className="text-sm font-bold text-gray-600">{(scale * 100).toFixed(0)}%</span>
            <button
              onClick={() => setScale(Math.min(3, scale + 0.25))}
              className="px-3 py-2 border-2 border-black bg-white text-black font-bold hover:bg-black hover:text-white transition-all"
            >
              +
            </button>
          </div>

          {/* Page Input */}
          <div className="flex items-center gap-2 sm:gap-3 justify-center">
            <label className="text-sm font-bold text-gray-700 hidden sm:block">Ke halaman:</label>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={handlePageChange}
              className="w-20 sm:w-24 px-3 py-2 border-2 border-black focus:outline-none text-center font-bold text-black bg-white"
            />
            <span className="text-sm font-bold text-gray-600">/ {totalPages}</span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2 sm:gap-3 justify-between items-center">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex-1 sm:flex-none border-2 border-black bg-white text-black font-bold px-3 sm:px-6 py-3 hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">← Sebelumnya</span>
              <span className="sm:hidden">Prev</span>
            </button>

            {/* Quick page navigation */}
            <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, currentPage - 2) + i;
                if (page > totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 border-2 font-bold transition-all ${
                      page === currentPage
                        ? 'bg-black text-white border-black'
                        : 'border-black bg-white text-black hover:bg-black hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex-1 sm:flex-none border-2 border-black bg-white text-black font-bold px-3 sm:px-6 py-3 hover:bg-black hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Selanjutnya →</span>
              <span className="sm:hidden">Next</span>
            </button>
          </div>

          {/* Bookmarks Section */}
          {bookmarks.length > 0 && (
            <div className="border-2 border-black p-3 sm:p-4 bg-white rounded">
              <p className="text-xs sm:text-sm font-bold text-black mb-2">Bookmark Anda ({bookmarks.length}):</p>
              <div className="flex flex-wrap gap-2">
                {bookmarks.map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 border-2 border-black text-black text-xs sm:text-sm font-bold hover:bg-black hover:text-white transition-all"
                  >
                    Hal. {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
