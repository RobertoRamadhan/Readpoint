'use client';

import { use, useCallback, useEffect, useRef, useState } from 'react';
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
  const ebookId = Number(resolvedParams.ebookId);

  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loadingEbook, setLoadingEbook] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [fitWidth, setFitWidth] = useState(false);
  const [readingActivityId, setReadingActivityId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCoverModal, setShowCoverModal] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
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
    if (!ebookId || Number.isNaN(ebookId)) {
      router.push('/dashboard/siswa');
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    loadEbook();
  }, [loading, isAuthenticated, user, ebookId]); // eslint-disable-line react-hooks/exhaustive-deps

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

      setTimeout(() => setShowCoverModal(false), 1200);
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
      // Aktivitas baca tidak boleh memblokir pembaca.
    }
  };

  const updateActivity = useCallback(() => {
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    scrollDebounceRef.current = setTimeout(() => {
      if (readingActivityId && ebook) {
        const pagesRead = Math.max(1, Math.round((readingProgress / 100) * ebook.pages));
        api
          .updateActivityProgress(readingActivityId, {
            current_page: 1,
            final_page: pagesRead,
          })
          .catch(() => {});
      }
    }, 1500);
  }, [readingActivityId, readingProgress, ebook]);

  useEffect(() => {
    updateActivity();
    return () => {
      if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    };
  }, [updateActivity]);

  useEffect(() => {
    const timer = setInterval(() => setReadingTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    const container = contentRef.current;
    if (!iframe && !container) return;

    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let lastProgress = 0;
    let lastScrollTop = 0;
    let lastScrollAt = Date.now();

    const setProgressFromScroll = (scrollTop: number, clientHeight: number, scrollHeight: number) => {
      if (scrollHeight <= 0) return;
      const progress = Math.round(((scrollTop + clientHeight) / scrollHeight) * 100);
      const finalProgress = Math.min(100, Math.max(0, progress));
      if (finalProgress !== lastProgress) {
        setReadingProgress(finalProgress);
        lastProgress = finalProgress;
      }
      lastScrollTop = scrollTop;
      lastScrollAt = Date.now();
    };

    const checkIframeScroll = () => {
      try {
        const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
        if (iframeDoc) {
          const scrollTop = iframeDoc.documentElement.scrollTop || iframeDoc.body.scrollTop;
          const clientHeight = iframeDoc.documentElement.clientHeight || iframeDoc.body.clientHeight;
          const scrollHeight = iframeDoc.documentElement.scrollHeight || iframeDoc.body.scrollHeight;
          setProgressFromScroll(scrollTop, clientHeight, scrollHeight);
          return;
        }
      } catch {
        // Browser sering membatasi akses scroll iframe PDF. Fallback ke container.
      }

      if (container) {
        const scrollTop = container.scrollTop;
        const clientHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;
        setProgressFromScroll(scrollTop, clientHeight, scrollHeight);
      }
    };

    const handleIframeLoad = () => {
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(checkIframeScroll, 500);
    };

    iframe?.addEventListener('load', handleIframeLoad);
    container?.addEventListener('scroll', checkIframeScroll, { passive: true });
    pollInterval = setInterval(checkIframeScroll, 900);

    return () => {
      iframe?.removeEventListener('load', handleIframeLoad);
      container?.removeEventListener('scroll', checkIframeScroll);
      if (pollInterval) clearInterval(pollInterval);
      void lastScrollTop;
      void lastScrollAt;
    };
  }, [ebook?.id]);

  const completeReading = async () => {
    const pagesRead = Math.max(1, Math.round((readingProgress / 100) * (ebook?.pages || 10)));
    const points = pagesRead * 10;
    setEarnedPoints(points);

    if (readingTime < pagesRead * 30 && readingProgress < 100) {
      const confirmed = window.confirm(
        `⚠️ Waktu membaca kamu masih singkat (${Math.round(readingTime / 60)} menit).\n\n` +
          `Progress: ${readingProgress}% | Halaman: ${pagesRead}/${ebook?.pages || 10}\n\n` +
          'Apakah kamu yakin sudah membaca sampai sini?'
      );
      if (!confirmed) return;
    }

    if (readingActivityId) {
      try {
        await api.completeReading(readingActivityId, {
          final_page: pagesRead,
          notes: `Reading time: ${readingTime}s, Progress: ${readingProgress}%, Pages: ${pagesRead}/${ebook?.pages || 10}`,
        });
      } catch {
        // Tetap tampilkan modal selesai walau sinkronisasi gagal.
      }
    }

    setShowPointsModal(true);
    setTimeout(() => {
      setShowPointsModal(false);
      const goToQuiz = window.confirm(
        `Selesai membaca "${ebook?.title}"! 🎉\n\nProgress: ${readingProgress}% | Poin: ${points}\n\nMau kerjakan kuis untuk poin tambahan?`
      );
      router.push(goToQuiz ? `/dashboard/siswa/quiz/${ebookId}` : '/dashboard/siswa');
    }, 2200);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading || loadingEbook) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-300 border-t-emerald-600" />
        <p className="text-sm font-semibold text-emerald-700">{loading ? 'Memeriksa sesi...' : 'Memuat buku...'}</p>
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">📚</div>
          <h2 className="mb-2 text-xl font-black text-slate-900">E-book Tidak Ditemukan</h2>
          <p className="mb-6 text-sm text-slate-600">{error || 'E-book tidak tersedia.'}</p>
          <button onClick={() => router.push('/dashboard/siswa')} className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700">← Kembali ke Dashboard</button>
        </div>
      </div>
    );
  }

  const pdfUrl = normalizeFileUrl(ebook.pdf_file_url || ebook.pdf_file);
  const coverUrl = normalizeFileUrl(ebook.cover_image_url || ebook.cover_image);
  const pagesRead = Math.max(1, Math.round((readingProgress / 100) * (ebook.pages || 10)));
  const iframeZoom = fitWidth ? 'page-width' : String(zoom);

  return (
    <div className="flex h-screen min-h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <style>{`
        .pdf-viewer-container::-webkit-scrollbar { display: none; }
        .pdf-viewer-container { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <header className="shrink-0 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-3 px-4 lg:px-8">
          <button onClick={() => router.push('/dashboard/siswa')} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 font-black text-slate-700 hover:bg-slate-100 lg:w-auto lg:px-4">
            ← <span className="ml-2 hidden lg:inline">Kembali</span>
          </button>

          <div className="min-w-0 flex-1 text-center lg:text-left">
            <h1 className="truncate text-base font-black text-slate-950 sm:text-xl">{ebook.title}</h1>
            <p className="truncate text-xs font-semibold text-slate-500">{ebook.author}</p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => router.push(`/dashboard/siswa/quiz/${ebookId}`)} className="flex h-10 items-center justify-center rounded-xl bg-emerald-50 px-3 text-sm font-black text-emerald-700 hover:bg-emerald-100">❓<span className="ml-2 hidden sm:inline">Quiz</span></button>
            <button onClick={completeReading} className="flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-3 text-sm font-black text-white hover:bg-emerald-700">✓<span className="ml-2 hidden sm:inline">Selesai</span></button>
          </div>
        </div>
      </header>

      <section className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-black text-slate-600 sm:inline">Progress Baca</span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div className="flex h-3 items-center justify-end rounded-full bg-emerald-600 pr-2 transition-all duration-500" style={{ width: `${readingProgress}%` }}>
                {readingProgress > 12 && <span className="text-[10px] font-black text-white">{readingProgress}%</span>}
              </div>
            </div>
            <span className="w-14 text-right text-xs font-black text-emerald-700">{readingProgress}%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-500 sm:text-xs">
            <span>Waktu: {formatTime(readingTime)}</span>
            <span>Halaman {pagesRead}/{ebook.pages || 10}</span>
          </div>
        </div>
      </section>

      <section className="shrink-0 border-b border-slate-200 bg-white px-4 py-2 lg:py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 overflow-x-auto">
          <button onClick={() => { setFitWidth(false); setZoom(Math.max(50, zoom - 10)); }} className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-200 lg:px-4">−<span className="hidden lg:inline"> Perkecil</span></button>
          <span className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700">{fitWidth ? 'Fit' : `${zoom}%`}</span>
          <button onClick={() => { setFitWidth(false); setZoom(Math.min(300, zoom + 10)); }} className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-200 lg:px-4">+<span className="hidden lg:inline"> Perbesar</span></button>
          <button onClick={() => { setFitWidth(false); setZoom(100); }} className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-200 lg:px-4">Reset</button>
          <button onClick={() => setFitWidth(!fitWidth)} className="shrink-0 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-100 lg:px-4">Fit Width</button>
        </div>
      </section>

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white p-6 lg:block">
          <div className="overflow-hidden rounded-2xl bg-slate-100">
            {coverUrl ? <img src={coverUrl} alt={ebook.title} className="h-64 w-full object-cover" /> : <div className="flex h-64 items-center justify-center text-5xl">📚</div>}
          </div>
          <h2 className="mt-5 line-clamp-2 text-lg font-black text-slate-950">{ebook.title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{ebook.author}</p>
          <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <InfoRow label="Halaman sekarang" value={String(pagesRead)} />
            <InfoRow label="Total halaman" value={String(ebook.pages || 10)} />
            <InfoRow label="Progress" value={`${readingProgress}%`} />
            <InfoRow label="Estimasi poin" value={String(pagesRead * 10)} />
          </div>
        </aside>

        <div ref={contentRef} className="pdf-viewer-container relative min-h-0 overflow-auto bg-slate-300">
          {showPointsModal && <PointsModal earnedPoints={earnedPoints} readingProgress={readingProgress} pagesRead={pagesRead} totalPages={ebook.pages || 10} />}
          {showCoverModal && <CoverModal coverUrl={coverUrl} ebook={ebook} />}

          {pdfUrl ? (
            <iframe ref={iframeRef} src={`${pdfUrl}#zoom=${iframeZoom}&toolbar=0&navpanes=0`} className="h-full min-h-full w-full border-0" title={ebook.title} loading="eager" allowFullScreen />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="text-6xl">📚</div>
              <p className="font-semibold text-slate-600">PDF tidak tersedia</p>
              <p className="text-sm text-slate-500">Hubungi guru untuk informasi lebih lanjut.</p>
            </div>
          )}

          <div className="pointer-events-none fixed bottom-5 right-5 rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white shadow-lg lg:hidden">
            {pagesRead}/{ebook.pages || 10}
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4"><span className="text-xs font-semibold text-slate-500">{label}</span><span className="text-sm font-black text-slate-900">{value}</span></div>;
}

function PointsModal({ earnedPoints, readingProgress, pagesRead, totalPages }: { earnedPoints: number; readingProgress: number; pagesRead: number; totalPages: number }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl"><div className="mb-4 text-6xl">🎉</div><h2 className="text-3xl font-black text-emerald-600">Selamat!</h2><p className="mt-2 text-sm font-semibold text-slate-600">Kamu telah menyelesaikan membaca</p><div className="my-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><p className="text-sm text-slate-600">Poin didapatkan</p><p className="text-5xl font-black text-emerald-600">{earnedPoints}</p><p className="mt-2 text-xs text-slate-500">Progress: {readingProgress}% | {pagesRead}/{totalPages} halaman</p></div><p className="text-sm text-slate-600">Tunggu sebentar...</p></div></div>;
}

function CoverModal({ coverUrl, ebook }: { coverUrl: string; ebook: Ebook }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div className="flex max-w-sm flex-col items-center gap-4">{coverUrl ? <img src={coverUrl} alt={ebook.title} className="h-80 w-56 rounded-xl object-cover shadow-2xl" /> : <div className="flex h-80 w-56 flex-col items-center justify-center rounded-xl bg-emerald-600 p-6 text-center text-white shadow-2xl"><div className="mb-3 text-5xl">📚</div><h2 className="text-xl font-bold">{ebook.title}</h2><p className="mt-2 text-sm opacity-90">{ebook.author}</p></div>}<p className="text-sm font-semibold text-white">Menyiapkan PDF...</p></div></div>;
}
