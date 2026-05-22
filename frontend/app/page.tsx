'use client';

import Link from 'next/link';

const features = [
  {
    label: 'Untuk Siswa',
    title: 'Baca buku jadi lebih seru',
    desc: 'Siswa dapat memilih e-book, melanjutkan progres membaca, mengerjakan kuis, dan mengumpulkan poin reward.',
    accent: 'bg-[#2E7D32]',
  },
  {
    label: 'Untuk Guru',
    title: 'Pantau perkembangan membaca',
    desc: 'Guru dapat melihat aktivitas siswa, hasil kuis, validasi progres, dan membantu siswa tetap konsisten membaca.',
    accent: 'bg-[#1E3A5F]',
  },
  {
    label: 'Untuk Admin',
    title: 'Kelola sistem dengan rapi',
    desc: 'Admin dapat mengelola user, buku digital, kategori, reward, penukaran poin, dan laporan sistem.',
    accent: 'bg-[#F4B400]',
  },
];

const steps = [
  { no: '01', title: 'Pilih Buku', desc: 'Siswa memilih e-book sesuai kategori dan minat baca.' },
  { no: '02', title: 'Baca & Progres', desc: 'Aktivitas membaca dicatat agar siswa tahu perkembangan mereka.' },
  { no: '03', title: 'Kerjakan Kuis', desc: 'Kuis membantu memastikan siswa memahami isi bacaan.' },
  { no: '04', title: 'Dapat Reward', desc: 'Poin bisa ditukar dengan reward yang disediakan sekolah.' },
];

const stats = [
  { value: '3 Role', label: 'Siswa, Guru, Admin' },
  { value: 'E-Book', label: 'Bacaan digital terpusat' },
  { value: 'Reward', label: 'Motivasi membaca siswa' },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF3E0] text-[#2D2D2D]">
      <nav className="sticky top-0 z-50 border-b border-[#E6D8B8]/80 bg-[#FAF3E0]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E3A5F] text-lg font-black text-white shadow-lg shadow-[#1E3A5F]/20 transition-transform group-hover:-rotate-3 group-hover:scale-105">
              RP
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-[#1E3A5F]">READPOINT</p>
              <p className="hidden text-xs font-semibold uppercase tracking-[0.25em] text-[#2E7D32] sm:block">Literasi Digital</p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-bold text-[#1E3A5F] md:flex">
            <a href="#fitur" className="transition-colors hover:text-[#2E7D32]">Fitur</a>
            <a href="#alur" className="transition-colors hover:text-[#2E7D32]">Cara Kerja</a>
            <a href="#role" className="transition-colors hover:text-[#2E7D32]">Role</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-bold text-[#1E3A5F] transition-colors hover:bg-white/70 sm:px-5"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#2E7D32] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:-translate-y-0.5 hover:bg-[#256A2A] sm:px-5"
            >
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative isolate px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top_left,#F4B40033,transparent_35%),radial-gradient(circle_at_top_right,#2E7D3230,transparent_35%)]" />
        <div className="absolute left-1/2 top-28 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-white/50 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#E6D8B8] bg-white/75 px-4 py-2 shadow-sm backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-[#F4B400]" />
              <span className="text-sm font-bold text-[#1E3A5F]">Platform membaca, kuis, poin, dan reward</span>
            </div>

            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight text-[#1E3A5F] sm:text-5xl lg:text-7xl">
              Bangun kebiasaan membaca siswa dengan sistem yang menarik.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[#4B4B4B] sm:text-lg">
              READPOINT membantu siswa membaca e-book, mengerjakan kuis, mengumpulkan poin, dan menukar reward. Guru dan admin tetap punya dashboard yang rapi untuk memantau serta mengelola aktivitas literasi.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-[#1E3A5F] px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-[#1E3A5F]/20 transition-all hover:-translate-y-0.5 hover:bg-[#172F4D]"
              >
                Mulai Masuk Dashboard
              </Link>
              <a
                href="#fitur"
                className="inline-flex items-center justify-center rounded-2xl border border-[#E6D8B8] bg-white/80 px-6 py-3.5 text-sm font-black text-[#1E3A5F] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#2E7D32]/40 hover:bg-white"
              >
                Lihat Fitur
              </a>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.value} className="rounded-3xl border border-[#E6D8B8] bg-white/75 p-5 shadow-sm backdrop-blur">
                  <p className="text-2xl font-black text-[#2E7D32]">{item.value}</p>
                  <p className="mt-1 text-sm font-semibold text-[#5A5146]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-[#F4B400]/30 blur-2xl" />
            <div className="absolute -bottom-8 -right-8 h-36 w-36 rounded-full bg-[#2E7D32]/25 blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/80 bg-white/75 p-4 shadow-2xl shadow-[#1E3A5F]/15 backdrop-blur-xl">
              <div className="rounded-[1.5rem] bg-[#1E3A5F] p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#F4B400]">Dashboard Siswa</p>
                    <h2 className="mt-1 text-2xl font-black">Halo, Pembaca Hebat</h2>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-black">850 Poin</div>
                </div>

                <div className="mt-6 rounded-3xl bg-white p-5 text-[#2D2D2D]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2E7D32]">Sedang Dibaca</p>
                      <h3 className="mt-2 text-xl font-black text-[#1E3A5F]">Petualangan Literasi</h3>
                      <p className="mt-2 text-sm leading-6 text-[#5A5146]">Lanjutkan membaca dan selesaikan kuis untuk membuka reward baru.</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF3E0] text-2xl">📚</div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs font-bold text-[#5A5146]">
                      <span>Progress membaca</span>
                      <span>72%</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#E6D8B8]">
                      <div className="h-3 w-[72%] rounded-full bg-[#2E7D32]" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-2xl font-black text-[#F4B400]">12</p>
                    <p className="text-sm font-semibold text-white/80">Buku dibaca</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-2xl font-black text-[#F4B400]">9</p>
                    <p className="text-sm font-semibold text-white/80">Kuis selesai</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#2E7D32]">Fitur utama</p>
            <h2 className="mt-3 text-3xl font-black text-[#1E3A5F] sm:text-5xl">Satu platform untuk literasi sekolah</h2>
            <p className="mt-4 text-base leading-7 text-[#5A5146]">Desain dibuat agar siswa semangat membaca, guru mudah memantau, dan admin mudah mengelola data.</p>
          </div>

          <div id="role" className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((item) => (
              <div key={item.title} className="group rounded-[2rem] border border-[#E6D8B8] bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1E3A5F]/10">
                <div className={`mb-6 h-2 w-16 rounded-full ${item.accent} transition-all group-hover:w-24`} />
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#2E7D32]">{item.label}</p>
                <h3 className="mt-3 text-2xl font-black text-[#1E3A5F]">{item.title}</h3>
                <p className="mt-4 leading-7 text-[#5A5146]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="alur" className="px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-[#1E3A5F] px-6 py-12 text-white shadow-2xl shadow-[#1E3A5F]/20 sm:px-10 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.28em] text-[#F4B400]">Cara kerja</p>
              <h2 className="mt-3 text-3xl font-black sm:text-5xl">Alur membaca yang mudah dipahami</h2>
              <p className="mt-5 leading-8 text-white/75">READPOINT dirancang agar aktivitas membaca punya arah yang jelas dari awal hingga siswa mendapatkan apresiasi.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map((item) => (
                <div key={item.no} className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4B400] text-sm font-black text-[#1E3A5F]">
                    {item.no}
                  </div>
                  <h3 className="text-xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/75">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#E6D8B8] bg-white shadow-xl shadow-[#1E3A5F]/10">
          <div className="grid gap-0 lg:grid-cols-[1fr_0.8fr]">
            <div className="p-8 sm:p-10 lg:p-12">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-[#2E7D32]">Siap digunakan</p>
              <h2 className="mt-3 text-3xl font-black text-[#1E3A5F] sm:text-5xl">Mulai kelola literasi siswa dari satu dashboard.</h2>
              <p className="mt-5 max-w-2xl leading-8 text-[#5A5146]">Masuk sebagai siswa, guru, atau admin sesuai akun yang tersedia. Setiap role memiliki tampilan dan kebutuhan yang berbeda.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className="rounded-2xl bg-[#2E7D32] px-6 py-3.5 text-center text-sm font-black text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:-translate-y-0.5 hover:bg-[#256A2A]">
                  Masuk Sekarang
                </Link>
                <Link href="/register" className="rounded-2xl border border-[#E6D8B8] bg-[#FAF3E0] px-6 py-3.5 text-center text-sm font-black text-[#1E3A5F] transition-all hover:-translate-y-0.5 hover:bg-[#FFF7E6]">
                  Buat Akun
                </Link>
              </div>
            </div>

            <div className="bg-[#FAF3E0] p-8 sm:p-10 lg:p-12">
              <div className="space-y-4">
                {['Dashboard siswa yang ramah dan menarik', 'Monitoring guru lebih rapi', 'Admin mudah mengatur buku dan reward'].map((text) => (
                  <div key={text} className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F4B400] font-black text-[#1E3A5F]">✓</div>
                    <p className="font-bold text-[#1E3A5F]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E6D8B8] bg-[#1E3A5F] px-5 py-10 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <p className="text-xl font-black">READPOINT</p>
            <p className="mt-1 text-sm text-white/70">Platform literasi digital berbasis poin dan reward.</p>
          </div>
          <p className="text-sm font-semibold text-white/70">© 2026 READPOINT - Batam, Indonesia</p>
        </div>
      </footer>
    </main>
  );
}
