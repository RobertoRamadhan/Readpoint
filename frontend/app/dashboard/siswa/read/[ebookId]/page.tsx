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
  const [useTextMode, setUseTextMode] = useState(true); // false = show PDF iframe fallback
  const [scrollProgress, setScrollProgress] = useState(0);
  const [readingActivityId, setReadingActivityId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      // Run ebook info + text extraction in parallel
      const [ebookRes, textRes] = await Promise.allSettled([
        api.ebooks.get(ebookId),
        fetchBookText(ebookId),
      ]);

      if (ebookRes.status === 'fulfilled') {
        setEbook((ebookRes.value?.data as Ebook) || null);
      } else {
        throw new Error('Gagal memuat data e-book');
      }

      if (textRes.status === 'fulfilled') {
        const extracted = textRes.value;
        // Check if text looks garbled on the frontend too
        if (extracted && !isTextGarbled(extracted)) {
          setBookText(extracted);
          setUseTextMode(true);
        } else if (extracted && extracted.length > 0) {
          // Text exists but garbled — switch to PDF viewer
          setUseTextMode(false);
        }
      } else {
        // Text extraction failed — fall back to PDF viewer
        setUseTextMode(false);
      }

      // Start reading activity after ebook is loaded (non-blocking)
      startReadingActivity();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat e-book');
    } finally {
      setLoadingEbook(false);
    }
  };

  // Detect garbled/corrupted text on the frontend
  // Returns true if text has too many non-printable or symbol characters
  const isTextGarbled = (text: string): boolean => {
    if (!text || text.trim().length < 20) return true;
    // Count normal characters: letters, digits, spaces, common punctuation
    const normalChars = (text.match(/[\p{L}\p{N}\s.,!?;:()\-'"]/gu) || []).length;
    const ratio = normalChars / text.length;
    return ratio < 0.50; // less than 50% normal = garbled
  };

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-amber-50">
        <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
        <p className="text-amber-700 font-semibold text-sm">
          {loading ? 'Memeriksa sesi...' : 'Memuat buku...'}
        </p>
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-amber-200 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-black text-amber-900 mb-2">E-book Tidak Ditemukan</h2>
          <p className="text-slate-500 text-sm mb-6">{error || 'E-book tidak tersedia.'}</p>
          <button
            onClick={() => router.push('/dashboard/siswa')}
            className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-all"
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-4 shadow-md flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Back */}
          <button
            onClick={() => router.push('/dashboard/siswa')}
            className="flex items-center gap-1.5 hover:bg-amber-700 px-3 py-2 rounded-lg transition-colors text-sm font-semibold flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Kembali</span>
          </button>

          {/* Title */}
          <div className="text-center flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-bold truncate">{ebook.title}</h1>
            <p className="text-xs text-amber-200 truncate">{ebook.author}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => router.push(`/dashboard/siswa/quiz/${ebookId}`)}
              className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 px-3 py-2 rounded-lg transition-colors text-sm font-bold"
            >
              <span>❓</span>
              <span className="hidden sm:inline">Quiz</span>
            </button>
            <button
              onClick={completeReading}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition-colors text-sm font-bold"
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
      <div className="bg-white border-b border-amber-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-500 flex-shrink-0">Progress</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-amber-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-amber-600 flex-shrink-0 w-10 text-right">
            {Math.round(scrollProgress)}%
          </span>
        </div>
      </div>

      {/* Book Content */}
      <div className="flex-1 overflow-hidden">
        {!useTextMode && ebook.pdf_file ? (
          /* ── PDF Viewer fallback (when text extraction fails/garbled) ── */
          <div className="h-full flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
            <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 flex items-center justify-between">
              <p className="text-xs text-amber-800 font-semibold">
                📄 Menampilkan PDF langsung
              </p>
              <button
                onClick={() => setUseTextMode(true)}
                className="text-xs text-amber-700 underline hover:text-amber-900"
              >
                Coba mode teks
              </button>
            </div>
            <iframe
              src={`${ebook.pdf_file}#toolbar=1&navpanes=0`}
              className="flex-1 w-full border-0"
              title={ebook.title}
            />
          </div>
        ) : (
          /* ── Text mode ── */
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto px-4 py-8"
            style={{ height: 'calc(100vh - 120px)' }}
          >
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-10">
              {bookText ? (
                <>
                  {/* Switch to PDF button */}
                  {ebook.pdf_file && (
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => setUseTextMode(false)}
                        className="text-xs text-amber-600 underline hover:text-amber-800"
                      >
                        Lihat PDF asli
                      </button>
                    </div>
                  )}
                  <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
                    {bookText.split('\n').map((paragraph, index) =>
                      paragraph.trim() ? (
                        <p key={index} className="mb-4">
                          {paragraph}
                        </p>
                      ) : (
                        <br key={index} />
                      )
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">📄</div>
                  <p className="text-gray-500 font-medium mb-4">
                    Teks buku tidak tersedia.
                  </p>
                  {ebook.pdf_file && (
                    <button
                      onClick={() => setUseTextMode(false)}
                      className="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-all"
                    >
                      📖 Buka PDF Viewer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
