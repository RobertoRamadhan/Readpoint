'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
          <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-700">READPOINT</p>
            <h1 className="mt-4 text-2xl font-black">Terjadi Kesalahan</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              Aplikasi mengalami kendala saat memuat halaman. Silakan coba muat ulang halaman.
            </p>
            {error?.digest && (
              <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-bold text-slate-500">
                Kode error: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="mt-6 h-12 w-full rounded-2xl bg-emerald-700 px-5 text-sm font-black text-white hover:bg-emerald-800"
            >
              Coba Lagi
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
