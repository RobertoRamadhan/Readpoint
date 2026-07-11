'use client';

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { normalizeFileUrl } from '@/lib/file-url';

interface Ebook {
  id: number;
  title: string;
  author: string;
  pages: number;
  poin_per_halaman?: number;
  pdf_file?: string;
  pdf_file_url?: string;
  cover_image?: string;
  cover_image_url?: string;
}

export default function ReadEbookPage({ params }: { params: Promise<{ ebookId: string }> }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const ebookId = Number(resolvedParams.ebookId);

  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loadingEbook, setLoadingEbook] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [fitWidth, setFitWidth] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [readingActivityId, setReadingActivityId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const fetchedRef = useRef(false);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        api.updateActivityProgress(readingActivityId, {
          current_page: pagesRead,
          final_page: pagesRead,
          reading_time: readingTime,
        }).catch(() => {});
      }
    }, 1500);
  }, [readingActivityId, readingProgress, ebook, readingTime]);

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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const pdfUrl = useMemo(() => normalizeFileUrl(ebook?.pdf_file_url || ebook?.pdf_file), [ebook]);
  const coverUrl = useMemo(() => normalizeFileUrl(ebook?.cover_image_url || ebook?.cover_image), [ebook]);
  const pagesRead = Math.max(1, Math.round((readingProgress / 100) * (ebook?.pages || 10)));

  const completeReading = async () => {
    const totalPages = ebook?.pages || 10;
    // Gunakan progress nyata, bukan paksa 100%
    const finalPagesRead = Math.max(1, Math.round((readingProgress / 100) * totalPages));
    const points = finalPagesRead * (ebook?.poin_per_halaman || 10);
    setEarnedPoints(points);

    if (readingActivityId) {
      try {
        await api.completeReading(readingActivityId, {
          final_page: finalPagesRead,
          notes: `Reading time: ${readingTime}s, Progress: ${readingProgress}%, Pages: ${finalPagesRead}/${totalPages}`,
        });
      } catch {
        // Tetap tampilkan modal selesai walau sinkronisasi gagal.
      }
    }

    setShowPointsModal(true);
    setTimeout(() => {
      setShowPointsModal(false);
      const goToQuiz = window.confirm(`Selesai membaca "${ebook?.title}"! 🎉\n\nPoin menunggu validasi guru.\n\nMau kerjakan kuis untuk poin tambahan?`);
      router.push(goToQuiz ? `/dashboard/siswa/quiz/${ebookId}` : '/dashboard/siswa');
    }, 1800);
  };

  if (loading || loadingEbook) return <LoadingScreen text={loading ? 'Memeriksa sesi...' : 'Memuat buku...'} />;

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

  return (
    <div className="flex h-screen min-h-screen flex-col overflow-hidden bg-slate-100 text-slate-900">
      <style>{`.pdf-viewer-container::-webkit-scrollbar{display:none}.pdf-viewer-container{-ms-overflow-style:none;scrollbar-width:none}`}</style>

      <header className="shrink-0 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-2 px-3 sm:px-4 lg:px-8">
          <button onClick={() => router.push('/dashboard/siswa')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 font-black text-slate-700 hover:bg-slate-100 lg:w-auto lg:px-4">←<span className="ml-2 hidden lg:inline">Kembali</span></button>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="truncate text-xl font-black text-slate-950 sm:text-2xl lg:text-3xl">{ebook.title}</h1>
            <p className="truncate text-xs font-semibold text-slate-500 sm:text-sm">{ebook.author}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button onClick={() => router.push(`/dashboard/siswa/quiz/${ebookId}`)} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-black text-red-500 hover:bg-emerald-100" aria-label="Kuis">?</button>
            <button onClick={handleLogout} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-lg font-black text-red-500 hover:bg-red-100" aria-label="Logout">↪</button>
            <button onClick={completeReading} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-black text-white hover:bg-emerald-700" aria-label="Selesai">✓</button>
          </div>
        </div>
      </header>

      <section className="shrink-0 border-b border-slate-200 bg-white px-3 py-2 sm:px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${Math.max(readingProgress, 2)}%` }} /></div>
            <span className="w-12 text-right text-xs font-black text-emerald-700">{readingProgress}%</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-slate-500 sm:text-xs"><span>Waktu: {formatTime(readingTime)}</span><span>Halaman {pagesRead}/{ebook.pages || 10}</span></div>
        </div>
      </section>

      {!isMobile && (
        <section className="shrink-0 border-b border-slate-200 bg-white px-4 py-2 lg:py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 overflow-x-auto">
            <button onClick={() => { setFitWidth(false); setZoom(Math.max(50, zoom - 10)); }} className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-200 lg:px-4">− Perkecil</button>
            <span className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700">{fitWidth ? 'Fit' : `${zoom}%`}</span>
            <button onClick={() => { setFitWidth(false); setZoom(Math.min(300, zoom + 10)); }} className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-200 lg:px-4">+ Perbesar</button>
            <button onClick={() => { setFitWidth(false); setZoom(100); }} className="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-200 lg:px-4">Reset</button>
            <button onClick={() => setFitWidth(!fitWidth)} className="shrink-0 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 hover:bg-emerald-100 lg:px-4">Fit Width</button>
          </div>
        </section>
      )}

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white p-6 lg:block">
          <div className="overflow-hidden rounded-2xl bg-slate-100">{coverUrl ? <img src={coverUrl} alt={ebook.title} className="h-64 w-full object-cover" /> : <div className="flex h-64 items-center justify-center text-5xl">📚</div>}</div>
          <h2 className="mt-5 line-clamp-2 text-lg font-black text-slate-950">{ebook.title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{ebook.author}</p>
          <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"><InfoRow label="Halaman sekarang" value={String(pagesRead)} /><InfoRow label="Total halaman" value={String(ebook.pages || 10)} /><InfoRow label="Progress" value={`${readingProgress}%`} /><InfoRow label="Estimasi poin" value={String(pagesRead * (ebook.poin_per_halaman || 10))} /></div>
        </aside>

        <div className="pdf-viewer-container relative min-h-0 overflow-auto bg-slate-900">
          {showPointsModal && <PointsModal earnedPoints={earnedPoints} readingProgress={readingProgress} pagesRead={pagesRead} totalPages={ebook.pages || 10} />}
          {pdfUrl ? (
            <PdfCanvasViewer src={pdfUrl} title={ebook.title} isMobile={isMobile} zoom={zoom} fitWidth={fitWidth} onProgressChange={setReadingProgress} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-white"><div className="text-6xl">📚</div><p className="font-semibold">PDF tidak tersedia</p><p className="text-sm text-slate-300">Hubungi guru untuk informasi lebih lanjut.</p></div>
          )}
        </div>
      </main>
    </div>
  );
}

function PdfCanvasViewer({ src, title, isMobile, zoom, fitWidth, onProgressChange }: { src: string; title: string; isMobile: boolean; zoom: number; fitWidth: boolean; onProgressChange: (progress: number) => void }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError('');
        const pdfjsLib = await loadPdfJs();
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const loadingTask = pdfjsLib.getDocument({ url: src, withCredentials: false });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setTotalPages(pdf.numPages || 1);
        setPageNumber(1);
        onProgressChange(Math.max(1, Math.round((1 / Math.max(pdf.numPages || 1, 1)) * 100)));
      } catch {
        if (!cancelled) setError('PDF belum bisa ditampilkan di aplikasi. Gunakan tombol buka langsung.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPdf();
    return () => {
      cancelled = true;
      if (renderTaskRef.current) renderTaskRef.current.cancel?.();
      pdfRef.current?.destroy?.();
      pdfRef.current = null;
    };
  }, [src, onProgressChange]);

  useEffect(() => {
    let cancelled = false;

    const renderPage = async () => {
      const pdf = pdfRef.current;
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;
      if (!pdf || !canvas || !wrapper) return;

      try {
        setRendering(true);
        if (renderTaskRef.current) {
          try { renderTaskRef.current.cancel?.(); } catch {}
        }

        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(280, wrapper.clientWidth - (isMobile ? 24 : 48));
        const fitScale = availableWidth / baseViewport.width;
        const requestedScale = fitWidth ? fitScale : fitScale * (zoom / 100);
        const scale = Math.min(isMobile ? 2.2 : 3.2, Math.max(isMobile ? 0.75 : 0.85, requestedScale));
        const viewport = page.getViewport({ scale });
        const dpr = window.devicePixelRatio || 1;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas tidak tersedia');

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, viewport.width, viewport.height);

        const renderTask = page.render({ canvasContext: context, viewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (!cancelled) {
          const progress = Math.max(1, Math.min(100, Math.round((pageNumber / Math.max(totalPages, 1)) * 100)));
          onProgressChange(progress);
        }
      } catch (err) {
        if (!cancelled && !(err instanceof Error && err.name === 'RenderingCancelledException')) {
          setError('Halaman PDF gagal dirender. Coba buka langsung.');
        }
      } finally {
        if (!cancelled) setRendering(false);
      }
    };

    renderPage();
    return () => {
      cancelled = true;
      if (renderTaskRef.current) renderTaskRef.current.cancel?.();
    };
  }, [pageNumber, totalPages, isMobile, zoom, fitWidth, onProgressChange]);

  return (
    <div ref={wrapperRef} className="flex min-h-full flex-col bg-slate-900 text-white">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-white/10 bg-slate-950/95 px-3 py-2 backdrop-blur">
        <button onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))} disabled={pageNumber <= 1 || loading || rendering} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-white disabled:opacity-40">Sebelumnya</button>
        <div className="min-w-0 text-center">
          <p className="truncate text-xs font-black">{title}</p>
          <p className="text-[11px] font-semibold text-slate-300">Halaman {pageNumber}/{totalPages || '-'}</p>
        </div>
        <button onClick={() => setPageNumber((prev) => Math.min(totalPages || prev, prev + 1))} disabled={!totalPages || pageNumber >= totalPages || loading || rendering} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white disabled:opacity-40">Lanjut</button>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-auto p-3 lg:p-6">
        {loading ? (
          <div className="mt-20 text-center"><div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-emerald-500" /><p className="text-sm font-bold">Menyiapkan PDF...</p></div>
        ) : error ? (
          <div className="mt-20 max-w-xs rounded-3xl bg-white p-6 text-center text-slate-900 shadow-xl"><div className="mb-3 text-5xl">📄</div><p className="text-sm font-black">{error}</p><a href={src} target="_blank" rel="noreferrer" className="mt-4 block rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white">Buka PDF langsung</a></div>
        ) : (
          <div className="relative rounded-xl bg-white p-1 shadow-2xl">
            {rendering && <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 text-sm font-black text-slate-700">Memuat halaman...</div>}
            <canvas ref={canvasRef} className="block max-w-full rounded-lg bg-white" />
          </div>
        )}
      </div>

      <div className="border-t border-white/10 bg-slate-950 px-3 py-2">
        <a href={src} target="_blank" rel="noreferrer" className="block rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-black text-white">Buka PDF langsung</a>
      </div>
    </div>
  );
}

function loadPdfJs(): Promise<any> {
  const existingLib = (window as any).pdfjsLib;
  if (existingLib) return Promise.resolve(existingLib);

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-readpoint-pdfjs="true"]') as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve((window as any).pdfjsLib), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Gagal memuat PDF viewer')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.dataset.readpointPdfjs = 'true';
    script.onload = () => resolve((window as any).pdfjsLib);
    script.onerror = () => reject(new Error('Gagal memuat PDF viewer'));
    document.body.appendChild(script);
  });
}

function LoadingScreen({ text }: { text: string }) { return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50"><div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-300 border-t-emerald-600" /><p className="text-sm font-semibold text-emerald-700">{text}</p></div>; }
function InfoRow({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4"><span className="text-xs font-semibold text-slate-500">{label}</span><span className="text-sm font-black text-slate-900">{value}</span></div>; }
function PointsModal({ earnedPoints, readingProgress, pagesRead, totalPages }: { earnedPoints: number; readingProgress: number; pagesRead: number; totalPages: number }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl"><div className="mb-4 text-6xl">🎉</div><h2 className="text-3xl font-black text-emerald-600">Selamat!</h2><p className="mt-2 text-sm font-semibold text-slate-600">Kamu telah menyelesaikan membaca</p><div className="my-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><p className="text-sm text-slate-600">Poin didapatkan</p><p className="text-5xl font-black text-emerald-600">{earnedPoints}</p><p className="mt-2 text-xs text-slate-500">Progress: {readingProgress}% | {pagesRead}/{totalPages} halaman</p></div><p className="text-sm text-slate-600">Tunggu sebentar...</p></div></div>; }
