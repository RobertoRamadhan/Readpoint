'use client';

import Link from 'next/link';
import { useState } from 'react';
import './landing.css';

const features = [
  {
    title: 'E-Book Digital',
    desc: 'Siswa dapat membaca koleksi buku digital yang sudah disiapkan sekolah.',
  },
  {
    title: 'Kuis Pemahaman',
    desc: 'Guru dapat mengukur pemahaman siswa setelah menyelesaikan bacaan.',
  },
  {
    title: 'Sistem Reward',
    desc: 'Poin membaca dapat dikumpulkan dan ditukar dengan reward yang tersedia.',
  },
];

const steps = [
  { number: '01', title: 'Daftar Akun', desc: 'Siswa membuat akun dan masuk ke dashboard READPOINT.' },
  { number: '02', title: 'Pilih Buku', desc: 'Siswa memilih e-book yang tersedia sesuai kebutuhan membaca.' },
  { number: '03', title: 'Baca dan Kuis', desc: 'Siswa membaca buku lalu mengerjakan kuis pemahaman.' },
  { number: '04', title: 'Tukar Reward', desc: 'Poin yang terkumpul dapat ditukar dengan reward sekolah.' },
];

const stats = [
  { number: '2.345+', label: 'Siswa Aktif' },
  { number: '480+', label: 'Buku Digital' },
  { number: '826+', label: 'Kuis Selesai' },
  { number: '190+', label: 'Reward Diberikan' },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
      {children}
    </p>
  );
}

function TimelineDot() {
  return (
    <div className="hidden lg:flex justify-center">
      <div className="relative flex h-full w-16 justify-center">
        <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-4 border-white bg-emerald-600 shadow-md" />
      </div>
    </div>
  );
}

function TimelineSection({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <section className="relative grid items-center gap-8 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)] lg:gap-10 lg:py-24">
      <div>{left}</div>
      <TimelineDot />
      <div>{right}</div>
    </section>
  );
}

function PreviewCard() {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Dashboard</p>
          <h3 className="mt-2 text-xl font-black text-slate-900">Ringkasan Literasi</h3>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">RP</div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Buku Dibaca</p>
          <p className="mt-3 text-3xl font-black text-slate-900">24</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Kuis Selesai</p>
          <p className="mt-3 text-3xl font-black text-slate-900">18</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between text-sm font-bold text-slate-700">
          <span>Target Mingguan</span>
          <span className="text-emerald-700">80%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-4/5 rounded-full bg-emerald-600" />
        </div>
      </div>
    </div>
  );
}

function FeaturePreview() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="space-y-4">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            <p className="text-base font-black text-slate-900">{feature.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepsList() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.number} className="grid grid-cols-[4rem_1fr] gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-700 text-sm font-black text-white">
              {step.number}
            </div>
            <div>
              <h3 className="font-black text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
          <p className="text-2xl font-black text-emerald-700 sm:text-3xl">{stat.number}</p>
          <p className="mt-2 text-sm font-bold text-slate-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="landing-page min-h-screen w-full bg-white text-slate-900">
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-sm font-black text-white shadow-sm">RP</div>
            <div>
              <p className="text-lg font-black leading-none text-emerald-700">READPOINT</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Literasi Digital</p>
            </div>
          </Link>

          <div className="hidden items-center gap-3 sm:flex">
            <Link href="/login" className="rounded-xl border border-emerald-700 bg-white px-5 py-2.5 text-sm font-black text-emerald-700 transition hover:bg-emerald-50">
              Masuk
            </Link>
            <Link href="/register" className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800">
              Daftar
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 sm:hidden"
            aria-label="Buka menu"
          >
            <span className="block h-0.5 w-6 bg-slate-700" />
            <span className="mt-1.5 block h-0.5 w-6 bg-slate-700" />
            <span className="mt-1.5 block h-0.5 w-6 bg-slate-700" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 sm:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3">
              <Link href="/login" className="rounded-xl border border-emerald-700 bg-white px-5 py-3 text-center text-sm font-black text-emerald-700">
                Masuk
              </Link>
              <Link href="/register" className="rounded-xl bg-emerald-700 px-5 py-3 text-center text-sm font-black text-white">
                Daftar
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-emerald-200 lg:block" />

        <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <TimelineSection
            left={
              <div className="max-w-xl">
                <SectionLabel>Platform Literasi Digital</SectionLabel>
                <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  Tingkatkan Minat Baca Siswa dengan Sistem Reward Digital
                </h1>
                <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                  READPOINT membantu siswa membaca e-book, menyelesaikan kuis, mengumpulkan poin, dan menukar reward dalam satu platform yang rapi dan mudah digunakan.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/register" className="rounded-xl bg-emerald-700 px-6 py-3 text-center text-sm font-black text-white shadow-sm transition hover:bg-emerald-800">
                    Mulai Sekarang
                  </Link>
                  <Link href="/login" className="rounded-xl border border-emerald-700 bg-white px-6 py-3 text-center text-sm font-black text-emerald-700 transition hover:bg-emerald-50">
                    Masuk Dashboard
                  </Link>
                </div>
              </div>
            }
            right={<PreviewCard />}
          />

          <TimelineSection
            left={<FeaturePreview />}
            right={
              <div className="max-w-xl lg:ml-auto">
                <SectionLabel>Fitur Utama</SectionLabel>
                <h2 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                  Semua fitur dibuat untuk mendukung aktivitas membaca siswa.
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-600">
                  Guru dan admin dapat mengelola konten, siswa dapat membaca dan mengerjakan kuis, sementara sistem poin membantu menjaga motivasi membaca.
                </p>
              </div>
            }
          />

          <TimelineSection
            left={
              <div className="max-w-xl">
                <SectionLabel>Cara Kerja</SectionLabel>
                <h2 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                  Alur sederhana dari membaca sampai mendapatkan reward.
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-600">
                  Proses dibuat jelas agar siswa tidak bingung, guru mudah memantau, dan sekolah bisa melihat perkembangan literasi secara lebih terarah.
                </p>
              </div>
            }
            right={<StepsList />}
          />

          <TimelineSection
            left={<StatsGrid />}
            right={
              <div className="max-w-xl lg:ml-auto">
                <SectionLabel>Hasil Platform</SectionLabel>
                <h2 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                  Data literasi lebih mudah dipantau oleh sekolah.
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-600">
                  Aktivitas membaca, pengerjaan kuis, dan penukaran reward dapat menjadi gambaran perkembangan siswa dalam membangun kebiasaan membaca.
                </p>
              </div>
            }
          />

          <TimelineSection
            left={
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Testimonial</p>
                <p className="mt-5 text-xl font-bold leading-9 text-slate-900">
                  READPOINT membuat aktivitas membaca siswa lebih terarah dan lebih mudah dipantau oleh guru.
                </p>
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <p className="font-black text-slate-900">Kepala Sekolah</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">SMP Negeri 1</p>
                </div>
              </div>
            }
            right={
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 lg:p-8">
                <SectionLabel>Mulai Sekarang</SectionLabel>
                <h2 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
                  Bangun budaya membaca dengan sistem yang lebih rapi.
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-600">
                  Mulai gunakan READPOINT untuk membantu siswa membaca, memahami, dan mendapatkan apresiasi dari aktivitas literasi mereka.
                </p>
                <Link href="/register" className="mt-8 inline-flex rounded-xl bg-emerald-700 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800">
                  Daftar Sekarang
                </Link>
              </div>
            }
          />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-900">
        <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-black text-white">READPOINT</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Platform literasi digital berbasis reward untuk mendukung kebiasaan membaca siswa.</p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-300">
              <Link href="/login" className="transition hover:text-white">Masuk</Link>
              <Link href="/register" className="transition hover:text-white">Daftar</Link>
              <Link href="#" className="transition hover:text-white">Kontak</Link>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-sm font-semibold text-slate-400">
            © 2026 READPOINT. Semua hak dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
