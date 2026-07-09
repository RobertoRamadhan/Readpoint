'use client';

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker — use CDN so Vercel/Next.js doesn't need to bundle the worker file
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  pdfUrl: string;
  onPageChange?: (page: number, total: number) => void;
  className?: string;
}

export default function PdfViewer({ pdfUrl, onPageChange, className = '' }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    onPageChange?.(1, numPages);
  }, [onPageChange]);

  const onDocumentLoadError = useCallback((err: any) => {
    console.error('PDF load error:', err);
    setError('Gagal memuat PDF');
    setLoading(false);
  }, []);

  const handleZoom = useCallback((newScale: number) => {
    const clamped = Math.min(3, Math.max(0.5, newScale));
    setScale(clamped);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 bg-slate-700 text-center h-full">
        <div className="text-5xl">⚠️</div>
        <p className="text-red-300 font-semibold text-lg">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
          }}
          className="px-6 py-2 bg-slate-600 text-white rounded-lg text-base font-bold hover:bg-slate-500 transition-colors"
        >
          🔄 Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-slate-700 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 text-white text-sm flex-shrink-0 gap-4 shadow-md">
        <span className="font-semibold whitespace-nowrap">
          {loading
            ? '⏳ Memuat PDF...'
            : `📄 Total ${numPages || 0} halaman`}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom(scale - 0.2)}
            disabled={loading || scale <= 0.5}
            className="w-8 h-8 flex items-center justify-center bg-slate-600 hover:bg-slate-500 disabled:opacity-40 rounded font-bold transition-colors text-base"
            title="Perkecil"
          >
            −
          </button>
          <span className="font-mono w-14 text-center text-base">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => handleZoom(scale + 0.2)}
            disabled={loading || scale >= 3}
            className="w-8 h-8 flex items-center justify-center bg-slate-600 hover:bg-slate-500 disabled:opacity-40 rounded font-bold transition-colors text-base"
            title="Perbesar"
          >
            +
          </button>
          <button
            onClick={() => handleZoom(1.3)}
            disabled={loading}
            className="px-3 h-8 flex items-center justify-center bg-slate-600 hover:bg-slate-500 disabled:opacity-40 rounded font-bold transition-colors text-base"
            title="Reset zoom"
          >
            ↺
          </button>
        </div>
      </div>

      {/* PDF Viewer - All Pages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-700">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 border-4 border-slate-400 border-t-white rounded-full animate-spin" />
            <p className="text-slate-200 text-base font-semibold">Memuat file PDF...</p>
            <p className="text-slate-400 text-sm">Mohon tunggu sebentar</p>
          </div>
        )}

        {!loading && (
          <div className="flex flex-col items-center gap-3">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div className="text-slate-200">Memuat...</div>}
            >
              {numPages && Array.from(new Array(numPages), (el, index) => (
                <div key={`page_${index + 1}`} className="mb-3">
                  <Page
                    pageNumber={index + 1}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </div>
              ))}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}
