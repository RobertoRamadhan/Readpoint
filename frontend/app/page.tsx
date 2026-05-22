'use client';

import Link from 'next/link';

const stats = [
  ['3 Role', 'Siswa, Guru, Admin'],
  ['E-Book', 'Bacaan digital'],
  ['Kuis', 'Validasi pemahaman'],
  ['Reward', 'Motivasi literasi'],
];

const roles = [
  ['Siswa', 'Membaca buku, mengerjakan kuis, mengumpulkan poin, dan menukar reward.', 'Dashboard siswa yang mudah dipahami untuk aktivitas membaca harian.'],
  ['Guru', 'Memantau perkembangan siswa, melihat nilai kuis, dan validasi aktivitas membaca.', 'Dashboard guru dibuat untuk monitoring kelas secara rapi.'],
  ['Admin', 'Mengelola user, e-book, reward, laporan, dan pengaturan sistem.', 'Dashboard admin membantu pengelolaan data literasi sekolah.'],
];

const steps = [
  ['01', 'Pilih Buku', 'Siswa memilih e-book yang tersedia berdasarkan kategori.'],
  ['02', 'Baca & Progres', 'Progress membaca dicatat agar siswa tahu perkembangan.'],
  ['03', 'Kerjakan Kuis', 'Kuis membantu mengecek pemahaman isi bacaan.'],
  ['04', 'Tukar Reward', 'Poin yang terkumpul dapat ditukar dengan reward.'],
];

export default function Home() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">RP</div>
            <div>
              <p className="text-lg font-black tracking-tight text-slate-900">READPOINT</p>
              <p className="hidden text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 sm:block">Literasi Digital</p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-bold text-slate-700 md:flex">
            <a href="#fitur" className="hover:text-emerald-700">Fitur</a>
            <a href="#alur" className="hover:text-emerald-700">Cara Kerja</a>
            <a href="#role" className="hover:text-emerald-700">Role</a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-900 hover:bg-slate-100">Masuk</Link>
            <Link href="/register" className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800">Daftar</Link>
          </div>
        </div>
      </nav>

      <section className="relative w-full px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(30,58,95,0.10),transparent_30%)]" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="mx-auto w-full max-w-3xl text-center lg:mx-0 lg:text-left">
            <div className="mb-5 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
              Platform literasi digital berbasis poin dan reward
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Bangun kebiasaan membaca siswa dengan sistem yang rapi.
            </h1>

            <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
              READPOINT membantu sekolah mengelola e-book, kuis, poin, reward, dan laporan literasi dalam satu platform yang mudah digunakan oleh siswa, guru, dan admin.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href="/login" className="rounded-xl bg-slate-900 px-6 py-3 text-center text-sm font-black text-white hover:bg-slate-800">Masuk Dashboard</Link>
              <a href="#fitur" className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-black text-slate-900 hover:bg-slate-100">Lihat Fitur</a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map(([title, desc]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xl font-black text-emerald-700">{title}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-xl">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/80">
              <div className="rounded-2xl bg-slate-900 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-emerald-300">Preview Dashboard Siswa</p>
                    <h2 className="mt-2 text-2xl font-black text-white">Halo, Pembaca Hebat</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">Pantau progress membaca, kuis, poin, dan reward secara ringkas.</p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-2 text-sm font-black text-white">850 Poin</div>
                </div>

                <div className="mt-6 rounded-2xl bg-white p-5 text-slate-800">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                    <span>Progress membaca</span>
                    <span>72%</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[72%] rounded-full bg-emerald-700" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-black text-white">12</p>
                    <p className="text-sm font-semibold text-slate-300">Buku dibaca</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-black text-white">9</p>
                    <p className="text-sm font-semibold text-slate-300">Kuis selesai</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {['E-Book', 'Kuis', 'Reward'].map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-sm font-black text-slate-900">{item}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">Aktif</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="w-full px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Fitur Utama</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">Satu sistem untuk seluruh aktivitas literasi</h2>
            <p className="mt-4 leading-7 text-slate-600">Tampilan dibuat profesional, bersih, dan responsive untuk kebutuhan sekolah.</p>
          </div>

          <div id="role" className="mt-10 grid gap-5 md:grid-cols-3">
            {roles.map(([label, title, desc]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-emerald-700">{label}</p>
                <h3 className="mt-3 text-xl font-black text-slate-900">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="alur" className="w-full px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl rounded-3xl bg-slate-900 p-6 text-white sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">Cara Kerja</p>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Alur membaca yang sederhana</h2>
              <p className="mt-4 leading-7 text-slate-300">Dari memilih buku sampai menukar reward, semua proses dibuat jelas dan mudah dipantau.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map(([no, title, desc]) => (
                <div key={no} className="rounded-2xl border border-white/10 bg-white/10 p-5">
                  <div className="mb-4 inline-flex rounded-xl bg-white px-3 py-2 text-sm font-black text-slate-900">{no}</div>
                  <h3 className="text-lg font-black text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Siap Digunakan</p>
              <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">Kelola literasi siswa dari satu dashboard.</h2>
              <p className="mt-4 leading-7 text-slate-600">Masuk sesuai role akun untuk mengakses fitur siswa, guru, atau admin.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="rounded-xl bg-emerald-700 px-6 py-3 text-center text-sm font-black text-white hover:bg-emerald-800">Masuk Sekarang</Link>
              <Link href="/register" className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center text-sm font-black text-slate-900 hover:bg-slate-100">Buat Akun</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="font-black text-slate-900">READPOINT</p>
          <p className="text-sm font-semibold text-slate-500">© 2026 READPOINT - Platform Literasi Digital</p>
        </div>
      </footer>
    </main>
  );
}
