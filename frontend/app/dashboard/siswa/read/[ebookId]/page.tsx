'use client';

import { useEffect, useState, useRef, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

interface Ebook {
  id: number;
  title: string;
  author: string;
  pages: number;
  pdf_file?: string;
  cover_image?: string;
}

export default function ReadEbookPage({ params }: { params: Promise<{ ebookId: string }> }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const ebookId = parseInt(resolvedParams.ebookId);

  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loadingEbook, setLoadingEbook] = useState(true);
  const [bookText, setBookText] = useState<string>('');
  const [useTextMode, setUseTextMode] = useState(false); // Use PDF viewer (not text mode)
  const [scrollProgress, setScrollProgress] = useState(0);
  const [readingActivityId, setReadingActivityId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCoverModal, setShowCoverModal] = useState(true); // Show cover image modal on load

  const contentRef = useRef<HTMLDivElement>(null);
  // Prevent loadEbook from running more than once
  const fetchedRef = useRef(false);
  // Debounce scroll updates — only send to backend every 3 seconds
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentProgressRef = useRef(0);

  useEffect(() => {
    // Wait until auth is resolved
    if (loading) return;

    if (!isAuthenticated || !user || user.role !== 'siswa') {
      router.push('/login');
      return;
    }

    // Guard: only fetch once even if deps change
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    loadEbook();
  }, [loading, isAuthenticated, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEbook = async () => {
    try {
      setLoadingEbook(true);
      setError(null);

      // Get ebook info
      const ebookRes = await api.ebooks.get(ebookId);
      
      if (ebookRes?.data) {
        setEbook((ebookRes.data as Ebook) || null);
        setUseTextMode(false); // Use PDF viewer
      } else {
        throw new Error('Gagal memuat data e-book');
      }

      // Show cover modal for 2 seconds on load
      setTimeout(() => {
        setShowCoverModal(false);
      }, 2000);

      // Start reading activity after ebook is loaded (non-blocking)
      startReadingActivity();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat e-book');
    } finally {
      setLoadingEbook(false);
    }
  };

  // Text extraction function (optional, not used now but kept for future)
  const fetchBookText = async (id: number): Promise<string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${apiUrl}/ebooks/${id}/text`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return '';
    const data = await response.json();
    return data?.data?.text || '';
  };


  const startReadingActivity = async () => {
    try {
      const response = await api.startReading(ebookId);
      const data = response as any;
      setReadingActivityId(data?.data?.id || null);
    } catch {
      // Non-fatal — reading activity tracking is optional
    }
  };

  // Debounced scroll handler — only sends to backend every 3s AND only if progress changed >2%
  const handleScroll = useCallback(() => {
    if (!contentRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    setScrollProgress(progress);

    // Debounce backend update
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    scrollDebounceRef.current = setTimeout(() => {
      const delta = Math.abs(progress - lastSentProgressRef.current);
      // Only send if progress changed by more than 2% and we have an activity
      if (readingActivityId && delta >= 2) {
        lastSentProgressRef.current = progress;
        const estimatedPage = Math.max(1, Math.ceil((progress / 100) * (ebook?.pages || 1)));
        api.updateActivityProgress(readingActivityId, {
          current_page: estimatedPage,
          final_page: estimatedPage,
        }).catch(() => {}); // fire-and-forget
      }
    }, 3000); // 3 second debounce
  }, [readingActivityId, ebook?.pages]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    };
  }, []);

  const completeReading = async () => {
    if (readingActivityId) {
      try {
        const estimatedPage = Math.max(1, Math.ceil((scrollProgress / 100) * (ebook?.pages || 1)));
        await api.completeReading(readingActivityId, {
          final_page: estimatedPage,
          notes: '',
        });
      } catch {
        // Non-fatal
      }
    }

    const goToQuiz = window.confirm(
      `Selesai membaca "${ebook?.title}"! 🎉\n\nMau kerjakan quiz untuk mendapatkan poin tambahan?`
    );
    if (goToQuiz) {
      router.push(`/dashboard/siswa/quiz/${ebookId}`);
    } else {
      router.push('/dashboard/siswa');
    }
  };

  // ── Loading states ──────────────────────────────────────────────────────────

  if (loading || loadingEbook) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-emerald-700 font-semibold text-sm">
          {loading ? 'Memeriksa sesi...' : 'Memuat buku...'}
        </p>
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-black text-slate-900 mb-2">E-book Tidak Ditemukan</h2>
          <p className="text-slate-600 text-sm mb-6">{error || 'E-book tidak tersedia.'}</p>
          <button
            onClick={() => router.push('/dashboard/siswa')}
            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Back */}
          <button
            onClick={() => router.push('/dashboard/siswa')}
            className="flex items-center gap-1.5 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors text-sm font-semibold flex-shrink-0 text-slate-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Kembali</span>
          </button>

          {/* Title */}
          <div className="text-center flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-bold truncate text-slate-900">{ebook.title}</h1>
            <p className="text-xs text-slate-600 truncate">{ebook.author}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => router.push(`/dashboard/siswa/quiz/${ebookId}`)}
              className="flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 px-3 py-2 rounded-lg transition-colors text-sm font-bold text-emerald-700"
            >
              <span>❓</span>
              <span className="hidden sm:inline">Quiz</span>
            </button>
            <button
              onClick={completeReading}
              className="flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 px-3 py-2 rounded-lg transition-colors text-sm font-bold text-emerald-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="hidden sm:inline">Selesai</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 flex-shrink-0">Progress</span>
          <div className="flex-1 bg-slate-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-emerald-600 flex-shrink-0 w-10 text-right">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>

      {/* Book Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Cover Image Modal - Show on load */}
        {showCoverModal && ebook && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 p-8 max-w-sm animate-in fade-in duration-300">
              {ebook.cover_image ? (
                <img
                  src={ebook.cover_image}
                  alt={ebook.title}
                  className="w-56 h-80 object-cover rounded-lg shadow-2xl"
                />
              ) : (
                <div className="w-56 h-80 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-2xl flex flex-col items-center justify-center text-white p-6">
                  <div className="text-5xl mb-3">📚</div>
                  <div className="text-center">
                    <h2 className="font-bold text-xl mb-2">{ebook.title}</h2>
                    <p className="text-sm opacity-90">{ebook.author}</p>
                  </div>
                </div>
              )}
              <p className="text-white text-sm font-semibold animate-pulse">Tunggu sebentar...</p>
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        {ebook?.pdf_file ? (
          <div className="h-full flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
            <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between">
              <p className="text-xs text-emerald-800 font-semibold">
                📄 PDF Reader
              </p>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/ebooks/${ebookId}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-700 underline hover:text-emerald-900"
              >
                Buka di tab baru
              </a>
            </div>
            <iframe
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/ebooks/${ebookId}/pdf#toolbar=1&navpanes=0&zoom=page-fit`}
              className="flex-1 w-full border-0"
              title={ebook.title}
              loading="eager"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4 bg-slate-50" style={{ height: 'calc(100vh - 120px)' }}>
            <div className="text-6xl">📚</div>
            <div className="text-center max-w-md">
              <p className="text-slate-600 font-semibold mb-2">PDF tidak tersedia</p>
              <p className="text-slate-500 text-sm">Hubungi guru Anda untuk informasi lebih lanjut</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


