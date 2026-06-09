'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Library,
  LineChart,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
} from 'lucide-react';

const heroStats = [
  { value: '12K+', label: 'aktivitas baca' },
  { value: '86%', label: 'kuis tuntas' },
  { value: '4.8', label: 'rating siswa' },
];

const roleHighlights = [
  {
    icon: GraduationCap,
    title: 'Siswa',
    description: 'Membaca buku digital, mengerjakan kuis, dan mengumpulkan poin dalam satu alur yang mudah.',
  },
  {
    icon: UserCheck,
    title: 'Guru',
    description: 'Memantau progres, membuat kuis, dan memvalidasi aktivitas literasi tanpa proses manual yang berulang.',
  },
  {
    icon: ShieldCheck,
    title: 'Admin',
    description: 'Mengelola pengguna, laporan, dan koleksi bacaan dengan kontrol yang jelas untuk sekolah.',
  },
];

const features = [
  {
    icon: BookOpen,
    title: 'Koleksi e-book',
    description: 'Rak digital untuk bacaan sekolah, cerita, dan materi pendukung yang mudah dicari siswa.',
  },
  {
    icon: ClipboardCheck,
    title: 'Kuis pemahaman',
    description: 'Pertanyaan setelah membaca membantu guru melihat apakah siswa benar-benar memahami isi buku.',
  },
  {
    icon: Trophy,
    title: 'Reward poin',
    description: 'Poin dan hadiah membuat target baca terasa lebih menyenangkan dan terukur.',
  },
  {
    icon: BarChart3,
    title: 'Laporan progres',
    description: 'Dashboard ringkas untuk melihat aktivitas baca, riwayat kuis, dan performa kelas.',
  },
];

const steps = [
  'Pilih buku dari perpustakaan digital.',
  'Baca dan selesaikan kuis pemahaman.',
  'Poin masuk ke akun siswa secara otomatis.',
  'Guru dan admin memantau perkembangan literasi.',
];

const dashboardRows = [
  { title: 'Novel pilihan minggu ini', progress: '72%', color: 'emerald' },
  { title: 'Kuis Bahasa Indonesia', progress: '9/10', color: 'blue' },
  { title: 'Reward tersedia', progress: '340 pt', color: 'amber' },
];

export default function Home() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-shell landing-nav-inner">
          <Link href="/" className="landing-brand" aria-label="READPOINT beranda">
            <span className="landing-brand-mark">
              <Library size={20} strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span>READPOINT</span>
          </Link>

          <div className="landing-nav-links" aria-label="Navigasi utama">
            <Link href="#fitur">Fitur</Link>
            <Link href="#alur">Alur</Link>
            <Link href="#laporan">Laporan</Link>
          </div>

          <div className="landing-nav-actions">
            <Link href="/login" className="landing-button landing-button-ghost">
              Masuk
            </Link>
            <Link href="/register" className="landing-button landing-button-primary">
              Daftar
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="landing-hero">
          <Image
            src="/perpus.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="landing-hero-image"
          />
          <div className="landing-hero-shade" aria-hidden="true" />

          <div className="landing-shell landing-hero-content">
            <p className="landing-kicker">
              <Sparkles size={16} aria-hidden="true" />
              Platform literasi digital sekolah
            </p>
            <h1>READPOINT</h1>
            <p className="landing-hero-copy">
              Bantu siswa membangun kebiasaan membaca lewat e-book, kuis pemahaman, poin reward,
              dan laporan progres yang mudah dipantau guru.
            </p>

            <div className="landing-hero-actions">
              <Link href="/register" className="landing-button landing-button-light">
                Mulai Sekarang
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/login" className="landing-button landing-button-glass">
                Masuk Dashboard
              </Link>
            </div>

            <div className="landing-hero-stats" aria-label="Ringkasan READPOINT">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-intro">
          <div className="landing-shell landing-intro-grid">
            {roleHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <article className="landing-role-card" key={item.title}>
                  <div className="landing-icon">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="landing-section" id="fitur">
          <div className="landing-shell landing-section-head">
            <p className="landing-eyebrow">Satu ekosistem literasi</p>
            <h2>Lebih rapi untuk siswa, guru, dan admin.</h2>
            <p>
              READPOINT menghubungkan aktivitas membaca, validasi kuis, dan reward dalam tampilan
              yang mudah dipakai setiap hari.
            </p>
          </div>

          <div className="landing-shell landing-feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article className="landing-feature-card" key={feature.title}>
                  <div className="landing-icon landing-icon-soft">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="landing-section landing-dashboard-section" id="laporan">
          <div className="landing-shell landing-dashboard-grid">
            <div className="landing-dashboard-copy">
              <p className="landing-eyebrow">Dashboard sekolah</p>
              <h2>Semua perkembangan literasi terlihat dalam satu layar.</h2>
              <p>
                Guru bisa melihat progres baca, kuis yang selesai, dan reward yang sudah diraih.
                Admin tetap punya kontrol untuk pengguna, data, dan laporan sekolah.
              </p>
              <div className="landing-check-list">
                <span>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  Riwayat aktivitas siswa
                </span>
                <span>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  Validasi kuis guru
                </span>
                <span>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  Ringkasan performa kelas
                </span>
              </div>
            </div>

            <div className="landing-dashboard-preview" aria-label="Cuplikan dashboard READPOINT">
              <div className="landing-preview-top">
                <div>
                  <span>Literasi Mingguan</span>
                  <strong>Aktif dan stabil</strong>
                </div>
                <LineChart size={24} aria-hidden="true" />
              </div>

              <div className="landing-preview-meter">
                <span style={{ width: '76%' }} />
              </div>

              <div className="landing-preview-chart" aria-hidden="true">
                <span style={{ height: '46%' }} />
                <span style={{ height: '64%' }} />
                <span style={{ height: '52%' }} />
                <span style={{ height: '86%' }} />
                <span style={{ height: '70%' }} />
                <span style={{ height: '94%' }} />
              </div>

              <div className="landing-preview-list">
                {dashboardRows.map((row) => (
                  <div className={`landing-preview-row landing-preview-row-${row.color}`} key={row.title}>
                    <span>{row.title}</span>
                    <strong>{row.progress}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-flow-section" id="alur">
          <div className="landing-shell landing-flow-grid">
            <div>
              <p className="landing-eyebrow">Alur pemakaian</p>
              <h2>Dari membaca sampai reward, semuanya tersambung.</h2>
            </div>

            <div className="landing-step-list">
              {steps.map((step, index) => (
                <div className="landing-step" key={step}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-shell landing-cta-inner">
            <div>
              <p className="landing-eyebrow">Mulai literasi digital</p>
              <h2>Bangun kebiasaan membaca yang bisa dilihat progresnya.</h2>
            </div>
            <Link href="/register" className="landing-button landing-button-primary landing-button-large">
              Daftar READPOINT
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-shell landing-footer-inner">
          <div>
            <Link href="/" className="landing-brand landing-brand-footer" aria-label="READPOINT beranda">
              <span className="landing-brand-mark">
                <Library size={18} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span>READPOINT</span>
            </Link>
            <p>Platform literasi digital untuk sekolah Indonesia.</p>
          </div>
          <div className="landing-footer-links">
            <Link href="#fitur">Fitur</Link>
            <Link href="#alur">Alur</Link>
            <Link href="/login">Masuk</Link>
          </div>
          <p className="landing-copyright">&copy; 2026 READPOINT. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
