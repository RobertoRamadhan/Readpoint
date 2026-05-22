'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-slate-50 text-slate-900">
      <nav className="w-full border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">RP</div>
            <div>
              <p className="text-lg font-black text-slate-900">READPOINT</p>
              <p className="hidden text-xs font-bold uppercase tracking-widest text-emerald-700 sm:block">Literasi Digital</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-100">Masuk</Link>
            <Link href="/register" className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800">Daftar</Link>
          </div>
        </div>
      </nav>

      <section className="w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div className="mx-auto w-full max-w-2xl text-center lg:mx-0 lg:text-left">
            <p className="mb-4 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">Platform literasi digital</p>
            <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">Kelola aktivitas membaca siswa dengan lebih mudah.</h1>
            <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">READPOINT membantu sekolah mengelola e-book, kuis, poin, reward, dan laporan literasi dalam satu dashboard.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href="/login" className="rounded-xl bg-slate-900 px-6 py-3 text-center text-sm font-black text-white hover:bg-slate-800">Masuk Dashboard</Link>
              <Link href="/register" className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-black text-slate-900 hover:bg-slate-100">Buat Akun</Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
            <div className="rounded-2xl bg-slate-900 p-6 text-white">
              <p className="text-sm font-bold text-emerald-300">Preview Dashboard</p>
              <h2 className="mt-2 text-2xl font-black text-white">Ringkasan Literasi</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">Progress membaca, kuis, poin, dan reward tampil dalam satu tempat.</p>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[72%] rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
