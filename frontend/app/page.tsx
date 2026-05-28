'use client';

import Link from 'next/link';
import { useState } from 'react';
import './landing.css';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="landing-page min-h-screen w-full flex flex-col bg-white">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-xs sm:text-sm font-black text-white shadow-md">RP</div>
            <p className="text-base sm:text-lg font-black text-emerald-700">READPOINT</p>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="rounded-lg px-4 sm:px-6 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-all border-2 border-emerald-700 hover:border-emerald-800">Masuk</Link>
            <Link href="/register" className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 sm:px-6 py-2.5 text-sm font-bold text-white hover:shadow-lg transition-all shadow-md hover:from-emerald-700 hover:to-emerald-800">Daftar</Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all border border-emerald-700"
          >
            {mobileMenuOpen ? 'Tutup' : 'Menu'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-3 space-y-2">
              <Link href="/login" className="block rounded-lg px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-all border-2 border-emerald-700 text-center">Masuk</Link>
              <Link href="/register" className="block rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:shadow-lg transition-all text-center shadow-md">Daftar</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        {/* Timeline Container */}
        <div className="relative w-full">
          {/* Vertical Timeline Line - Hidden on mobile */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-emerald-200 via-emerald-400 to-emerald-200"></div>

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 relative z-10">
            {/* Section 1: Hero */}
            <section className="relative py-20 sm:py-28 lg:py-36 flex items-center min-h-[720px]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-28 w-full items-center">
                <div className="order-2 lg:order-1 lg:pr-12">
                  <span className="inline-block rounded-full bg-emerald-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-emerald-700 mb-5 sm:mb-7">Platform Literasi Digital</span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-slate-900 mb-5 sm:mb-7">Tingkatkan Minat Baca Siswa dengan Sistem Reward Digital</h1>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-7 sm:mb-9">Platform membaca digital yang membuat siswa termotivasi untuk membaca, menyelesaikan kuis, dan mengumpulkan reward.</p>
                  <Link href="/register" className="inline-block rounded-lg bg-emerald-600 px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-white hover:bg-emerald-700 transition-all shadow-lg text-sm sm:text-base">Mulai Sekarang</Link>
                </div>
                <div className="flex items-center justify-center order-1 lg:order-2 lg:pl-12">
                  <div className="w-full h-64 sm:h-72 lg:h-80 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center border-2 border-emerald-200">
                    <div className="text-center px-6">
                      <p className="text-2xl sm:text-3xl font-black text-emerald-700 mb-3">READPOINT</p>
                      <p className="text-sm sm:text-base text-slate-600 font-semibold">Ilustrasi Platform</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Timeline dot - Hidden on mobile */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 top-1/2 w-4 h-4 bg-emerald-600 rounded-full border-4 border-white shadow-lg"></div>
            </section>

            {/* Section 2: Our Clients */}
            <section className="relative py-20 sm:py-28 lg:py-36 flex items-center min-h-[640px]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-28 w-full items-center">
                <div className="flex items-center justify-center order-2 lg:order-1 lg:pr-12">
                  <div className="w-full h-64 sm:h-72 lg:h-80 bg-slate-100 rounded-xl flex items-center justify-center">
                    <p className="text-slate-500 font-semibold text-sm sm:text-base">Client Logos</p>
                  </div>
                </div>
                <div className="order-1 lg:order-2 lg:pl-12">
                  <h2 className="text-3xl sm:text-4xl lg:text-4xl font-black text-slate-900 mb-5 sm:mb-6">Dipercaya oleh Sekolah Terkemuka</h2>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-5 sm:mb-7">Ribuan sekolah dan guru telah menggunakan READPOINT untuk meningkatkan minat baca siswa mereka dengan hasil yang luar biasa.</p>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Dari sekolah negeri hingga swasta, READPOINT telah membantu menciptakan budaya membaca yang lebih kuat di kalangan siswa.</p>
                </div>
              </div>
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 top-1/2 w-4 h-4 bg-emerald-600 rounded-full border-4 border-white shadow-lg"></div>
            </section>

            {/* Section 3: Features */}
            <section className="relative py-20 sm:py-28 lg:py-36 flex items-center min-h-[640px]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-28 w-full items-center">
                <div className="order-2 lg:order-1 lg:pr-12">
                  <h2 className="text-3xl sm:text-4xl lg:text-4xl font-black text-slate-900 mb-7 sm:mb-9">Fitur Unggulan</h2>
                  <div className="space-y-5 sm:space-y-7">
                    {[
                      { title: 'E-Books Digital', desc: 'Akses ribuan buku digital berkualitas tinggi dengan berbagai genre.' },
                      { title: 'Kuis Interaktif', desc: 'Uji pemahaman dengan kuis yang menyenangkan dan edukatif.' },
                      { title: 'Sistem Reward', desc: 'Kumpulkan poin dan tukarkan dengan hadiah menarik.' },
                    ].map((feature, idx) => (
                      <div key={idx} className="rounded-lg border border-slate-200 bg-white p-5 sm:p-7 hover:shadow-lg transition-all hover:border-emerald-200">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 sm:mb-3">{feature.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center order-1 lg:order-2 lg:pl-12">
                  <div className="w-full h-64 sm:h-72 lg:h-80 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center border-2 border-emerald-200">
                    <div className="text-center px-6">
                      <p className="text-2xl sm:text-3xl font-black text-emerald-700 mb-3">FITUR</p>
                      <p className="text-sm sm:text-base text-slate-600 font-semibold">Fitur Unggulan</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Timeline dot - Hidden on mobile */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 top-1/2 w-4 h-4 bg-emerald-600 rounded-full border-4 border-white shadow-lg"></div>
            </section>

            {/* Section 4: Statistics */}
            <section className="relative py-20 sm:py-28 lg:py-36 flex items-center min-h-[640px]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-28 w-full items-center">
                <div className="order-2 lg:order-1 lg:pr-12">
                  <h2 className="text-3xl sm:text-4xl lg:text-4xl font-black text-slate-900 mb-7 sm:mb-9">Hasil yang Terbukti</h2>
                  <div className="grid grid-cols-2 gap-5 sm:gap-7">
                    {[
                      { number: '2,345,341', label: 'Siswa Aktif' },
                      { number: '48,328', label: 'Buku Digital' },
                      { number: '826,867', label: 'Kuis Selesai' },
                      { number: '1,934,438', label: 'Reward Diberikan' },
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-emerald-50 rounded-lg p-5 sm:p-7 border border-emerald-200">
                        <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stat.number}</p>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center order-1 lg:order-2 lg:pl-12">
                  <div className="w-full h-64 sm:h-72 lg:h-80 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center border-2 border-emerald-200">
                    <div className="text-center px-6">
                      <p className="text-2xl sm:text-3xl font-black text-emerald-700 mb-3">STATISTIK</p>
                      <p className="text-sm sm:text-base text-slate-600 font-semibold">Statistik Pertumbuhan</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 top-1/2 w-4 h-4 bg-emerald-600 rounded-full border-4 border-white shadow-lg"></div>
            </section>

            {/* Section 5: How It Works */}
            <section className="relative py-20 sm:py-28 lg:py-36 flex items-center min-h-[640px]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-28 w-full items-center">
                <div className="flex items-center justify-center order-2 lg:order-1 lg:pr-12">
                  <div className="w-full h-64 sm:h-72 lg:h-80 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center border-2 border-emerald-200">
                    <div className="text-center px-6">
                      <p className="text-2xl sm:text-3xl font-black text-emerald-700 mb-3">ALUR</p>
                      <p className="text-sm sm:text-base text-slate-600 font-semibold">Cara Kerja</p>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2 lg:pl-12">
                  <h2 className="text-3xl sm:text-4xl lg:text-4xl font-black text-slate-900 mb-7 sm:mb-9">Cara Kerja</h2>
                  <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-7 sm:mb-9">Proses sederhana untuk memulai perjalanan membaca</p>

                  <div className="space-y-5 sm:space-y-7">
                    {[
                      { number: '1', title: 'Daftar', desc: 'Buat akun siswa Anda' },
                      { number: '2', title: 'Pilih Buku', desc: 'Jelajahi koleksi buku' },
                      { number: '3', title: 'Baca & Kuis', desc: 'Baca dan selesaikan kuis' },
                      { number: '4', title: 'Dapatkan Reward', desc: 'Tukarkan poin dengan hadiah' },
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-start gap-4 sm:gap-5">
                        <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center flex-shrink-0 shadow-md">{step.number}</div>
                        <div>
                          <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">{step.title}</h3>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Timeline dot - Hidden on mobile */}
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 top-1/2 w-4 h-4 bg-emerald-600 rounded-full border-4 border-white shadow-lg"></div>
            </section>

            {/* Section 6: Testimonial */}
            <section className="relative py-20 sm:py-28 lg:py-36 flex items-center min-h-[640px]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-28 w-full items-center">
                <div className="flex items-center justify-center order-2 lg:order-1 lg:pr-12">
                  <div className="w-full h-64 sm:h-72 lg:h-80 bg-slate-200 rounded-2xl flex items-center justify-center">
                    <p className="text-slate-500 font-semibold text-sm sm:text-base">Foto Testimonial</p>
                  </div>
                </div>
                <div className="order-1 lg:order-2 lg:pl-12">
                  <h2 className="text-3xl sm:text-4xl lg:text-4xl font-black text-slate-900 mb-7 sm:mb-9">Apa Kata Mereka</h2>
                  <blockquote className="border-l-4 border-emerald-600 pl-4 sm:pl-6 mb-7 sm:mb-9">
                    <p className="text-lg sm:text-xl text-slate-700 font-semibold mb-4 sm:mb-6 leading-relaxed">"READPOINT telah mengubah cara siswa kami belajar. Mereka lebih termotivasi dan antusias dalam membaca. Sistem reward-nya sangat efektif untuk meningkatkan engagement."</p>
                    <footer className="text-slate-600">
                      <p className="font-bold text-base sm:text-lg">Ibu Siti Nurhaliza</p>
                      <p className="text-xs sm:text-sm">Kepala Sekolah, SMP Negeri 1</p>
                    </footer>
                  </blockquote>
                  <Link href="/register" className="inline-block rounded-lg bg-emerald-600 px-6 sm:px-8 py-2.5 sm:py-3 font-bold text-white hover:bg-emerald-700 transition-all shadow-lg text-sm sm:text-base">Coba Sekarang</Link>
                </div>
              </div>
              <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 top-1/2 w-4 h-4 bg-emerald-600 rounded-full border-4 border-white shadow-lg"></div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900 py-12 sm:py-16 border-t border-slate-800">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white mb-3 sm:mb-4">READPOINT</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">Platform literasi digital untuk siswa Indonesia yang membuat membaca menjadi lebih menyenangkan.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Produk</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-400">
                <li><Link href="#" className="hover:text-white transition">Fitur</Link></li>
                <li><Link href="#" className="hover:text-white transition">Harga</Link></li>
                <li><Link href="#" className="hover:text-white transition">Keamanan</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Perusahaan</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-400">
                <li><Link href="#" className="hover:text-white transition">Tentang</Link></li>
                <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition">Kontak</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-400">
                <li><Link href="#" className="hover:text-white transition">Privasi</Link></li>
                <li><Link href="#" className="hover:text-white transition">Syarat</Link></li>
                <li><Link href="#" className="hover:text-white transition">Kebijakan</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-slate-400">© 2026 READPOINT. Semua hak dilindungi.</p>
            <div className="flex gap-4 sm:gap-6">
              <Link href="#" className="text-slate-400 hover:text-white transition text-xs sm:text-sm">Twitter</Link>
              <Link href="#" className="text-slate-400 hover:text-white transition text-xs sm:text-sm">Facebook</Link>
              <Link href="#" className="text-slate-400 hover:text-white transition text-xs sm:text-sm">Instagram</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
