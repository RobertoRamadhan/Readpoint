'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-amber-900/95 backdrop-blur-md border-b border-amber-800/50">
        <div className="w-full px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-3xl font-bold text-white">
                READPOINT
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#fitur" className="text-base font-medium text-white hover:text-amber-100 transition-colors duration-300">
                Fitur
              </a>
              <a href="#alur" className="text-base font-medium text-white hover:text-amber-100 transition-colors duration-300">
                Cara Kerja
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-base font-semibold text-white hover:text-amber-100 transition-colors duration-300 px-4 py-2">
                Masuk
              </Link>
              <Link href="/register" className="text-base font-semibold text-white hover:text-amber-100 transition-colors duration-300 px-4 py-2">
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen py-40 lg:py-80 flex items-center justify-center mb-48 lg:mb-64 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50" style={{ backgroundImage: 'url(/smk-batam.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', backgroundRepeat: 'no-repeat' }}>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative w-full max-w-5xl px-6 lg:px-8 text-center flex flex-col items-center z-10">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-3 bg-white/95 backdrop-blur px-4 py-2 rounded-full border border-amber-200 shadow-sm hover-lift">
            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
            <span className="text-sm font-semibold text-amber-900">Platform Literasi Digital Terpadu</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up drop-shadow-lg">
            Kelola Program Baca Siswa dengan
            <span className="block bg-gradient-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent drop-shadow-lg">
              Sistem Terpadu & Terukur
            </span>
          </h1>

          {/* Subtitle */}
          <p className="bg-white/90 backdrop-blur-md text-slate-900 px-10 py-3.5 rounded-xl font-bold text-base lg:text-lg border-2 border-white hover:bg-white transition-all duration-300 hover:shadow-2xl shadow-xl hover:scale-105 mb-12 animate-slide-up animation-delay-200">
            Platform all-in-one untuk mengelola perpustakaan digital, membuat kuis, tracking progress membaca siswa, dan sistem reward. Semua terintegrasi dalam satu dashboard yang mudah digunakan.
          </p>
          </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="bg-gradient-to-b from-amber-50 via-orange-50 to-amber-50 py-32 lg:py-56 flex justify-center mb-32 lg:mb-48">
        <div className="w-full max-w-6xl px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-32 animate-slide-up flex flex-col items-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-amber-900 mb-6">
              Fitur Lengkap Platform
            </h2>
            <p className="text-lg text-amber-700 max-w-2xl">
              Semua yang Anda butuhkan untuk program literasi digital
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full">
            {[
              {
                title: 'Perpustakaan E-Book',
                desc: 'Upload PDF, kelola akses per kelas, tracking halaman otomatis'
              },
              {
                title: 'Sistem Kuis Interaktif',
                desc: '5 soal per buku, score ≥70% untuk dapat poin reward'
              },
              {
                title: 'Sistem Poin & Reward',
                desc: 'Poin otomatis, tukar dengan hadiah, kelola catalog reward'
              },
              {
                title: 'Validasi Guru',
                desc: 'Guru approve/reject, poin masuk otomatis, history lengkap'
              },
              {
                title: 'Dashboard Real-Time',
                desc: 'Monitor aktivitas, progress siswa, tracking poin & achievement'
              },
              {
                title: 'Leaderboard & Analytics',
                desc: 'Ranking per kelas, statistik membaca, progress tracking'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="group p-8 border border-amber-200 rounded-2xl bg-gradient-to-br from-white to-amber-50 hover:shadow-xl transition-all duration-300 hover-lift text-center animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Top Accent Bar */}
                <div className="w-12 h-1.5 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full mx-auto mb-6 group-hover:w-16 transition-all duration-300"></div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alur */}
      <section id="alur" className="bg-gradient-to-b from-amber-100 via-orange-50 to-amber-50 border-y border-amber-200 pt-48 pb-32 lg:py-56 flex justify-center mb-32 lg:mb-48 mt-32 lg:mt-48">
        <div className="w-full max-w-6xl px-6 lg:px-8">
          <div className="text-center mb-24 animate-fade-in flex flex-col items-center">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-amber-900 mb-6">
              Alur Sistem
            </h2>
            <p className="text-xl text-amber-700 max-w-2xl">
              Dari siswa baca buku sampai klaim reward, semua tercatat otomatis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
            {[
              { no: '01', title: 'Siswa Baca', desc: 'Pilih buku dan catat progres' },
              { no: '02', title: 'Kerjakan Kuis', desc: 'Jawab 5 soal tentang isi buku' },
              { no: '03', title: 'Guru Validasi', desc: 'Guru approve, poin masuk otomatis' },
              { no: '04', title: 'Tukar Reward', desc: 'Klaim hadiah dari sekolah' }
            ].map((item, idx) => (
              <div
                key={item.no}
                className="bg-white border-2 border-amber-200 rounded-2xl p-8 hover:shadow-xl transition-all transform hover:scale-105 hover:border-amber-400 animate-scale-up text-center"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="text-5xl font-bold text-amber-300 mb-6">{item.no}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 border-t-2 border-amber-700">
        <div className="w-full px-6 lg:px-8 py-24">
          {/* Footer Content */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mb-16 text-center md:text-left">
            <div>
              <h4 className="text-sm font-black text-white mb-8 uppercase tracking-widest">Produk</h4>
              <ul className="space-y-4 text-sm text-white">
                <li><a href="#" className="hover:text-amber-100 transition-colors duration-300 font-semibold">Dashboard Admin</a></li>
                <li><a href="#" className="hover:text-amber-100 transition-colors duration-300 font-semibold">Dashboard Guru</a></li>
                <li><a href="#" className="hover:text-amber-100 transition-colors duration-300 font-semibold">App Siswa</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-white mb-8 uppercase tracking-widest">Panduan</h4>
              <ul className="space-y-4 text-sm text-white">
                <li><a href="#" className="hover:text-amber-100 transition-colors duration-300 font-semibold">Untuk Admin</a></li>
                <li><a href="#" className="hover:text-amber-100 transition-colors duration-300 font-semibold">Untuk Guru</a></li>
                <li><a href="#" className="hover:text-amber-100 transition-colors duration-300 font-semibold">Untuk Siswa</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-white mb-8 uppercase tracking-widest">Perusahaan</h4>
              <ul className="space-y-4 text-sm text-white">
                <li><a href="#" className="hover:text-amber-100 transition-colors duration-300 font-semibold">Tentang</a></li>
                <li><a href="#" className="hover:text-amber-100 transition-colors duration-300 font-semibold">Kontak</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-white mb-8 uppercase tracking-widest">Legal</h4>
              <ul className="space-y-4 text-sm text-white">
                <li><a href="#" className="hover:text-amber-100 transition-colors duration-300 font-semibold">Privasi</a></li>
                <li><a href="#" className="hover:text-amber-100 transition-colors duration-300 font-semibold">Syarat</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-amber-700/50 pt-12">
            {/* Footer Bottom */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col sm:flex-row items-center text-sm text-white gap-6 font-semibold">
                <p>© 2026 READPOINT - Platform Literasi Digital</p>
                <p className="hidden sm:block text-white">•</p>
                <p>Batam, Indonesia</p>
              </div>
              
              {/* Footer Logo */}
              <div className="text-center md:text-right">
                <span className="text-2xl font-black text-white">
                  READPOINT
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}