'use client';

import Link from 'next/link';
import './landing.css';

const stats = [
  ['3 Role', 'Siswa, Guru, Admin'],
  ['E-Book', 'Bacaan digital'],
  ['Kuis', 'Validasi pemahaman'],
  ['Reward', 'Motivasi literasi'],
];

const features = [
  ['E-Book Digital', 'Buku digital dapat dikelola dan dibaca melalui sistem.'],
  ['Kuis Pemahaman', 'Kuis digunakan untuk mengukur pemahaman siswa.'],
  ['Reward Point', 'Poin membaca dapat menjadi motivasi tambahan bagi siswa.'],
  ['Laporan Literasi', 'Aktivitas membaca dapat dipantau secara lebih rapi.'],
];

const roles = [
  ['Siswa', 'Membaca buku, mengerjakan kuis, mengumpulkan poin, dan menukar reward.'],
  ['Guru', 'Memantau perkembangan siswa, melihat nilai kuis, dan validasi aktivitas membaca.'],
  ['Admin', 'Mengelola user, e-book, reward, laporan, dan pengaturan sistem.'],
];

const steps = [
  ['01', 'Pilih Buku', 'Siswa memilih e-book yang tersedia.'],
  ['02', 'Baca & Progres', 'Progress membaca tercatat di sistem.'],
  ['03', 'Kerjakan Kuis', 'Kuis mengecek pemahaman isi bacaan.'],
  ['04', 'Tukar Reward', 'Poin dapat ditukar dengan reward.'],
];

export default function Home() {
  return (
    <div className="landing-page min-h-screen w-full bg-slate-50">
      {/* Navbar - Logo kiri, Menu tengah, Tombol kanan */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo - Kiri */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">RP</div>
            <div>
              <p className="text-lg font-black text-slate-900">READPOINT</p>
              <p className="hidden text-xs font-bold uppercase tracking-widest text-emerald-700 sm:block">Literasi Digital</p>
            </div>
          </Link>

          {/* Menu - Tengah */}
          <div className="hidden items-center gap-10 text-sm font-bold text-slate-700 md:flex">
            <a href="#fitur" className="hover:text-emerald-700">Fitur</a>
            <a href="#role" className="hover:text-emerald-700">Role</a>
            <a href="#alur" className="hover:text-emerald-700">Cara Kerja</a>
          </div>

          {/* Tombol - Kanan */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-100">Masuk</Link>
            <Link href="/register" className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800">Daftar</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-white to-slate-50 py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-10 inline-flex rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm">
              Platform literasi digital berbasis poin dan reward
            </div>

            {/* Heading - Center */}
            <h1 className="mx-auto max-w-4xl text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Bangun kebiasaan membaca siswa dengan sistem yang rapi.
            </h1>

            {/* Stats Cards - Spacing lebih besar */}
            <div className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map(([title, desc]) => (
                <div key={title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                  <p className="text-2xl font-black text-emerald-700">{title}</p>
                  <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Section */}
      <section id="fitur" className="w-full py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Title - Center */}
          <SectionTitle label="Fitur Utama" title="Fitur utama aplikasi literasi" />
          
          {/* Feature Cards - Spacing lebih besar, text rata kiri */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([title, desc]) => <InfoCard key={title} title={title} desc={desc} />)}
          </div>
        </div>
      </section>

      {/* Role Section */}
      <section id="role" className="w-full bg-white py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Title - Center */}
          <SectionTitle label="Role Pengguna" title="Tampilan berbeda sesuai kebutuhan pengguna" />
          
          {/* Role Cards - Spacing lebih besar, text rata kiri */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {roles.map(([title, desc]) => <InfoCard key={title} title={title} desc={desc} />)}
          </div>
        </div>
      </section>

      {/* Alur Section */}
      <section id="alur" className="w-full py-20 lg:py-28">
        <div className="container mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-[2rem] bg-slate-900 p-10 text-white shadow-xl sm:p-14">
            <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
              {/* Left Content - Text rata kiri */}
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-emerald-300">Cara Kerja</p>
                <h2 className="mt-6 text-3xl font-black leading-tight text-white sm:text-4xl">Alur membaca yang sederhana</h2>
                <p className="mt-6 text-base leading-relaxed text-slate-300">Dari memilih buku sampai menukar reward, semua proses dibuat jelas dan mudah dipantau.</p>
              </div>
              
              {/* Right Content - Steps Grid */}
              <div className="grid gap-6 sm:grid-cols-2">
                {steps.map(([no, title, desc]) => (
                  <div key={no} className="rounded-3xl border border-white/10 bg-white/10 p-8">
                    <div className="mb-6 inline-flex rounded-xl bg-white px-3 py-2 text-sm font-black text-slate-900">{no}</div>
                    <h3 className="text-xl font-black text-white">{title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-slate-300">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto flex max-w-7xl flex-col gap-4 px-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-8">
          <p className="text-lg font-black text-slate-900">READPOINT</p>
          <p className="text-sm font-semibold text-slate-500">© 2026 READPOINT - Platform Literasi Digital</p>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-black uppercase tracking-widest text-emerald-700">{label}</p>
      <h2 className="mt-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">{title}</h2>
    </div>
  );
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <p className="text-xl font-black text-slate-900">{title}</p>
      <p className="mt-5 text-base leading-relaxed text-slate-600">{desc}</p>
    </div>
  );
}
