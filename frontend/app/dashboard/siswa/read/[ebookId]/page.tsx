'use client';

import { useEffect, useState, useRef, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { normalizeFileUrl } from '@/lib/file-url';

interface Ebook {
  id: number;
  title: string;
  author: string;
  pages: number;
  pdf_file?: string;
  pdf_file_url?: string;
  cover_image?: string;
  cover_image_url?: string;
}

export default function ReadEbookPage({ params }: { params: Promise<{ ebookId: string }> }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const ebookId = parseInt(resolvedParams.ebookId);

  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loadingEbook, setLoadingEbook] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [readingActivityId, setReadingActivityId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCoverModal, setShowCoverModal] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fetchedRef = useRef(false);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !user || user.role !== 'siswa') {
      router.push('/login');
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    loadEbook();
  }, [loading, isAuthenticated, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEbook = async () => {
    try {
      setLoadingEbook(true);
      setError(null);
      const ebookRes = await api.ebooks.get(ebookId);
      if (ebookRes?.data) {
        const data = ebookRes.data as Ebook;
        setEbook({
          ...data,
          cover_image: normalizeFileUrl(data.cover_image_url || data.cover_image),
          cover_image_url: normalizeFileUrl(data.cover_image_url || data.cover_image),
          pdf_file: normalizeFileUrl(data.pdf_file_url || data.pdf_file),
          pdf_file_url: normalizeFileUrl(data.pdf_file_url || data.pdf_file),
        });
      } else {
        throw new Error('Gagal memuat data e-book');
      }
      setTimeout(() => setShowCoverModal(false), 2000);
      startReadingActivity();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat e-book');
    } finally {
      setLoadingEbook(false);
    }
  };

  const startReadingActivity = async () => {
    try {
      const response = await api.startReading(ebookId);
      const data = response as any;
      setReadingActivityId(data?.data?.id || null);
    } catch {
      // Non-fatal
    }
  };

  const updateProgress = useCallback(() => {
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    scrollDebounceRef.current = setTimeout(() => {
      if (readingActivityId && ebook) {
        const pagesRead = Math.round((readingProgress / 100) * ebook.pages);
        api.updateActivityProgress(readingActivityId, {
          current_page: 1,
          final_page: pagesRead,
        }).catch(() => {});
      }
    }, 2000);
  }, [readingActivityId, readingProgress, ebook]);

  useEffect(() => {
    updateProgress();
    return () => {
      if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    };
  }, [updateProgress, readingProgress]);

  useEffect(() => {
    const readingTimer = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(readingTimer);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let pollInterval: NodeJS.Timeout | null = null;
    let lastProgress = 0;

    const checkIframeScroll = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) return;

        const scrollTop = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop;
        const clientHeight = iframeDoc.documentElement.clientHeight || iframeDoc.body.clientHeight;
        const scrollHeight = iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight;

        if (scrollHeight > 0) {
          const progress = Math.round(((scrollTop + clientHeight) / scrollHeight) * 100);
          const finalProgress = Math.min(100, Math.max(0, progress));
          if (finalProgress !== lastProgress) {
            setReadingProgress(finalProgress);
            lastProgress = finalProgress;
          }
        }
      } catch {
        if (contentRef.current) {
          const scrollTop = contentRef.current.scrollTop;
          const clientHeight = contentRef.current.clientHeight;
          const scrollHeight = contentRef.current.scrollHeight;
          if (scrollHeight > 0) {
            const progress = Math.round(((scrollTop + clientHeight) / scrollHeight) * 100);
            const finalProgress = Math.min(100, Math.max(0, progress));
            if (finalProgress !== lastProgress) {
              setReadingProgress(finalProgress);
              lastProgress = finalProgress;
            }
          }
        }
      }
    };

    const handleIframeLoad = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) iframeDoc.addEventListener('scroll', checkIframeScroll, { passive: true });
      } catch {}
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(checkIframeScroll, 500);
    };

    iframe.addEventListener('load', handleIframeLoad);
    const container = contentRef.current;
    if (container) container.addEventListener('scroll', checkIframeScroll, { passive: true });

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
      if (pollInterval) clearInterval(pollInterval);
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) iframeDoc.removeEventListener('scroll', checkIframeScroll);
      } catch {}
      if (container) container.removeEventListener('scroll', checkIframeScroll);
    };
  }, []);

  const completeReading = async () => {
    const pagesRead = Math.round((readingProgress / 100) * (ebook?.pages || 10));
    const points = pagesRead * 10;
    setEarnedPoints(points);

    const estimatedReadingTimeNeeded = pagesRead * 30;
    if (readingTime < estimatedReadingTimeNeeded && readingProgress < 100) {
      const confirmed = window.confirm(
        `⚠️ Waktu membaca Anda terlalu singkat (${Math.round(readingTime / 60)} menit).\n\n` +
        `Estimasi waktu yang diperlukan: ${Math.round(estimatedReadingTimeNeeded / 60)} menit.\n\n` +
        `Progress: ${readingProgress}% | Halaman: ${pagesRead}/${ebook?.pages || 10}\n\n` +
        `Apakah Anda yakin sudah membaca sampai sini?`
      );
      if (!confirmed) return;
    }

    if (readingActivityId) {
      try {
        await api.completeReading(readingActivityId, {
          final_page: pagesRead,
          notes: `Reading time: ${readingTime}s, Progress: ${readingProgress}%, Pages: ${pagesRead}/${ebook?.pages || 10}`,
        });
      } catch {}
    }

    setShowPointsModal(true);
    setTimeout(() => {
      setShowPointsModal(false);
      const goToQuiz = window.confirm(
        `Selesai membaca "${ebook?.title}"! 🎉\n\n` +
        `Progress: ${readingProgress}% | Poin: ${points}\n\n` +
        `Mau kerjakan quiz untuk mendapatkan poin tambahan?`
      );
      if (goToQuiz) router.push(`/dashboard/siswa/quiz/${ebookId}`);
      else router.push('/dashboard/siswa');
    }, 3000);
  };

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

  const pdfUrl = normalizeFileUrl(ebook.pdf_file_url || ebook.pdf_file);
  const coverUrl = normalizeFileUrl(ebook.cover_image_url || ebook.cover_image);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <style>{`
        .pdf-viewer-container::-webkit-scrollbar { display: none; }
        .pdf-viewer-container { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="bg-white border-b border-slate-200 p-4 shadow-sm flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => router.push('/dashboard/siswa')}
            className="flex items-center gap-1.5 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors text-sm font-semibold flex-shrink-0 text-slate-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <div className="text-center flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-bold truncate text-slate-900">{ebook.title}</h1>
            <p className="text-xs text-slate-600 truncate">{ebook.author}</p>
          </div>
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

      <div className="bg-white border-b border-slate-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600 flex-shrink-0">Progress Baca</span>
          <div className="flex-1 bg-slate-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${readingProgress}%` }}
            >
              {readingProgress > 10 && <span className="text-xs font-bold text-white">{readingProgress}%</span>}
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 flex-shrink-0 w-12 text-right">{readingProgress}%</span>
        </div>
        <div className="max-w-6xl mx-auto mt-2 flex items-center gap-4 text-xs text-slate-600">
          <span>⏱️ Waktu: {Math.floor(readingTime / 60)}m {readingTime % 60}s</span>
          <span>📊 Kecepatan: {Math.round(scrollSpeed)} px/s</span>
          {scrollSpeed > 500 && <span className="text-red-600 font-bold">⚠️ Scroll terlalu cepat!</span>}
        </div>
      </div>

      <div className="bg-white border-b border-slate-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold text-slate-700 transition-colors">− Perkecil</button>
            <span className="text-sm font-bold text-slate-700 w-16 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(300, zoom + 10))} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold text-slate-700 transition-colors">+ Perbesar</button>
            <button onClick={() => setZoom(100)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold text-slate-700 transition-colors">↺ Reset</button>
          </div>
        </div>
      </div>

      <div ref={contentRef} className="flex-1 overflow-auto bg-slate-100 w-full pdf-viewer-container">
        {showPointsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-in fade-in duration-300">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-black text-emerald-600 mb-2">Selamat!</h2>
              <p className="text-slate-600 mb-6">Anda telah menyelesaikan membaca</p>
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 mb-6 border-2 border-emerald-200">
                <p className="text-sm text-slate-600 mb-2">Poin yang Anda Dapatkan</p>
                <p className="text-5xl font-black text-emerald-600">{earnedPoints}</p>
                <p className="text-xs text-slate-500 mt-2">Progress: {readingProgress}% | {Math.round((readingProgress / 100) * (ebook?.pages || 10))}/{ebook?.pages || 10} halaman</p>
              </div>
              <p className="text-sm text-slate-600">Tunggu sebentar...</p>
            </div>
          </div>
        )}

        {showCoverModal && ebook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 p-8 max-w-sm animate-in fade-in duration-300">
              {coverUrl ? (
                <img src={coverUrl} alt={ebook.title} className="w-56 h-80 object-cover rounded-lg shadow-2xl" />
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

        {pdfUrl ? (
          <iframe
            ref={iframeRef}
            src={`${pdfUrl}#zoom=${zoom}&toolbar=0&navpanes=0`}
            className="w-full h-full border-0"
            title={ebook.title}
            loading="eager"
            allowFullScreen
            style={{ height: '100%', minHeight: '100vh' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 h-full">
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
