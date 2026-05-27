'use client';

import Link from 'next/link';
import './landing.css';

export default function Home() {
  return (
    <div className="landing-page min-h-screen w-full flex flex-col bg-slate-50">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-emerald-100 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-base font-black text-white shadow-md">RP</div>
            <div className="hidden sm:block">
              <p className="text-xl font-black text-emerald-700">READPOINT</p>
              <p className="text-xs font-bold text-emerald-600">Literasi Digital</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login" className="rounded-lg px-8 py-3 text-lg font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all">Masuk</Link>
            <Link href="/register" className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-lg font-bold text-white hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl">Daftar</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-b from-white to-emerald-50 py-24 lg:py-40">
          <div className="container mx-auto max-w-5xl px-6 lg:px-8">
            <div className="text-center">
              <span className="mb-5 inline-block rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-700">Platform Literasi Digital</span>
              <h1 className="mb-6 text-5xl font-black leading-tight text-slate-900 lg:text-6xl">Tingkatkan Minat Baca Siswa dengan Sistem Reward Digital</h1>
              <p className="mb-10 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">Platform membaca digital yang membuat siswa termotivasi untuk membaca, menyelesaikan kuis, dan mengumpulkan reward.</p>
              <div className="flex justify-center gap-4">
                <Link href="/register" className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-lg font-bold text-white hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg">Mulai Sekarang</Link>
                <Link href="/login" className="rounded-lg border border-emerald-200 bg-white px-8 py-3 text-lg font-bold text-emerald-700 hover:bg-emerald-50 transition-all">Masuk</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full bg-slate-50 py-24 lg:py-32">
          <div className="container mx-auto max-w-5xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 lg:text-5xl">Fitur Utama</h2>
              <p className="mt-4 text-slate-600">Fitur yang membantu siswa membaca dengan lebih aktif dan menyenangkan.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                { title: 'E-Books Digital', desc: 'Akses berbagai buku digital yang dapat dibaca kapan saja.' },
                { title: 'Kuis Interaktif', desc: 'Uji pemahaman siswa dengan kuis yang edukatif.' },
                { title: 'Sistem Reward', desc: 'Kumpulkan poin dan tukarkan dengan hadiah menarik.' },
              ].map((feature, idx) => (
                <div key={idx} className="rounded-xl border border-emerald-100 bg-white p-8 text-center hover:shadow-lg transition-all">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 mb-4 mx-auto"></div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full bg-white py-24 lg:py-32">
          <div className="container mx-auto max-w-5xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 lg:text-5xl">Cara Kerja</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { number: '1', title: 'Pilih Buku', desc: 'Pilih buku favorit Anda' },
                { number: '2', title: 'Baca', desc: 'Baca dengan santai' },
                { number: '3', title: 'Kuis', desc: 'Selesaikan kuis' },
                { number: '4', title: 'Reward', desc: 'Dapatkan poin dan hadiah' },
              ].map((step, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-md">{step.number}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 py-20 lg:py-24">
          <div className="container mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-black text-white mb-6 lg:text-5xl">Siap Memulai?</h2>
            <p className="text-lg text-emerald-50 mb-8">Bergabunglah dengan siswa lain yang sudah merasakan manfaatnya.</p>
            <Link href="/register" className="inline-block rounded-lg bg-white px-8 py-3 font-bold text-emerald-700 hover:bg-slate-100 transition-all shadow-lg">Daftar Gratis</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-950 py-12 border-t border-slate-800">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-black text-white">READPOINT</h3>
              <p className="mt-2 text-sm text-slate-400">Platform literasi digital untuk siswa.</p>
            </div>
            <div className="text-sm text-slate-400">© 2026 READPOINT. Semua hak dilindungi.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
