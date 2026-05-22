'use client';

import Link from 'next/link';

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
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">RP</div>
            <div>
              <p className="text-lg font-black text-slate-900">READPOINT</p>
              <p className="hidden text-xs font-bold uppercase tracking-widest text-emerald-700 sm:block">Literasi Digital</p>
            </div>
          </Link>

          <div className="hidden items-center gap-10 text-sm font-bold text-slate-700 md:flex">
            <a href="#fitur" className="hover:text-emerald-700">Fitur</a>
            <a href="#role" className="hover:text-emerald-700">Role</a>
            <a href="#alur" className="hover:text-emerald-700">Cara Kerja</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-100">Masuk</Link>
            <Link href="/register" className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800">Daftar</Link>
          </div>
        </div>
      </nav>

      <section className="w-full bg-gradient-to-b from-white to-slate-50 px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto w-full max-w-7xl text-center">
          <div className="mb-8 inline-flex rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm">
            Platform literasi digital berbasis poin dan reward
          </div>

          <h1 className="mx-auto max-w-5xl text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Bangun kebiasaan membaca siswa dengan sistem yang rapi.
          </h1>

          <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([title, desc]) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <p className="text-2xl font-black text-emerald-700">{title}</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="fitur" className="w-full px-5 py-24 sm:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <SectionTitle label="Fitur Utama" title="Fitur utama aplikasi literasi" />
          <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([title, desc]) => <InfoCard key={title} title={title} desc={desc} />)}
          </div>
        </div>
      </section>

      <section id="role" className="w-full bg-white px-5 py-24 sm:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <SectionTitle label="Role Pengguna" title="Tampilan berbeda sesuai kebutuhan pengguna" />
          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {roles.map(([title, desc]) => <InfoCard key={title} title={title} desc={desc} />)}
          </div>
        </div>
      </section>

      <section id="alur" className="w-full px-5 py-24 sm:px-8">
        <div className="mx-auto w-full max-w-7xl rounded-[2rem] bg-slate-900 p-8 text-white shadow-xl sm:p-12">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-emerald-300">Cara Kerja</p>
              <h2 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl">Alur membaca yang sederhana</h2>
              <p className="mt-6 leading-8 text-slate-300">Dari memilih buku sampai menukar reward, semua proses dibuat jelas dan mudah dipantau.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {steps.map(([no, title, desc]) => (
                <div key={no} className="rounded-3xl border border-white/10 bg-white/10 p-7">
                  <div className="mb-5 inline-flex rounded-xl bg-white px-3 py-2 text-sm font-black text-slate-900">{no}</div>
                  <h3 className="text-xl font-black text-white">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-slate-200 bg-white px-5 py-10 sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="font-black text-slate-900">READPOINT</p>
          <p className="text-sm font-semibold text-slate-500">© 2026 READPOINT - Platform Literasi Digital</p>
        </div>
      </footer>
    </main>
  );
}

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-black uppercase tracking-widest text-emerald-700">{label}</p>
      <h2 className="mt-5 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">{title}</h2>
    </div>
  );
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <p className="text-xl font-black text-slate-900">{title}</p>
      <p className="mt-5 leading-8 text-slate-600">{desc}</p>
    </div>
  );
}
