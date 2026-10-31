import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  GraduationCap,
  Library,
  ShieldCheck,
} from 'lucide-react';
import styles from './landing.module.css';

const readingSteps = [
  {
    number: '01',
    title: 'Pilih bacaan',
    description: 'Temukan e-book dari koleksi digital sekolah.',
  },
  {
    number: '02',
    title: 'Baca dengan ritmemu',
    description: 'Progres halaman dan aktivitas membaca tersimpan di akun siswa.',
  },
  {
    number: '03',
    title: 'Uji pemahaman',
    description: 'Kerjakan kuis yang tersedia setelah membaca.',
  },
  {
    number: '04',
    title: 'Guru meninjau',
    description: 'Poin membaca tercatat setelah aktivitas disetujui guru.',
  },
];

const roles = [
  {
    number: '01',
    icon: GraduationCap,
    title: 'Siswa',
    description: 'Baca e-book, kerjakan kuis, pantau progres, dan tukarkan poin dengan reward.',
  },
  {
    number: '02',
    icon: ClipboardCheck,
    title: 'Guru',
    description: 'Tinjau aktivitas membaca, buat kuis, dan ikuti perkembangan siswa di kelas.',
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'Admin',
    description: 'Kelola koleksi e-book, reward, akun, kelas, dan laporan sekolah.',
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <nav className={styles.navigation} aria-label="Navigasi utama">
          <Link href="/" className={styles.brand} aria-label="READPOINT beranda">
            <span className={styles.brandMark}>
              <Library size={19} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <span>READPOINT</span>
          </Link>

          <div className={styles.navLinks}>
            <Link href="#alur">Cara kerja</Link>
            <Link href="#peran">Untuk siapa</Link>
          </div>

          <div className={styles.navActions}>
            <Link href="/login" className={styles.loginLink}>
              Masuk
            </Link>
            <Link href="/register" className={styles.registerLink}>
              Daftar siswa <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" />
              Literasi digital untuk sekolah
            </p>
            <h1 id="hero-heading">
              Baca buku.
              <br />
              <em>Lihat sejauh mana kamu tumbuh.</em>
            </h1>
            <p className={styles.heroDescription}>
              READPOINT menghubungkan e-book, kuis pemahaman, dan progres membaca. Guru tetap
              meninjau aktivitas sebelum poin membaca diberikan.
            </p>

            <div className={styles.heroActions}>
              <Link href="/register" className={styles.heroPrimary}>
                Mulai membaca <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/login" className={styles.heroSecondary}>
                Saya sudah punya akun
              </Link>
            </div>

            <div className={styles.platformNote}>
              <span>DI DALAM READPOINT</span>
              <ul>
                <li>E-book</li>
                <li>Kuis</li>
                <li>Progres</li>
                <li>Reward</li>
              </ul>
            </div>
          </div>

          <figure className={styles.heroVisual}>
            <Image
              src="/perpus.jpg"
              alt="Rak buku di ruang perpustakaan"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 48vw"
              className={styles.heroImage}
            />
            <div className={styles.visualNote}>
              <BookOpen size={17} aria-hidden="true" />
              <span>Ruang baca digital sekolah</span>
            </div>
            <figcaption className={styles.visualCaption}>Buka halaman berikutnya.</figcaption>
          </figure>
        </section>

        <section className={styles.journey} id="alur" aria-labelledby="journey-heading">
          <div className={styles.journeyIntro}>
            <p className={styles.sectionLabel}>CARA KERJA</p>
            <h2 id="journey-heading">Membaca, lalu memahami.</h2>
            <p>
              Bukan sekadar menyelesaikan halaman. READPOINT membantu sekolah melihat proses
              membaca dari awal sampai ditinjau guru.
            </p>
          </div>

          <ol className={styles.stepList}>
            {readingSteps.map((step) => (
              <li className={styles.step} key={step.number}>
                <span className={styles.stepNumber}>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <Check className={styles.stepCheck} size={17} aria-hidden="true" />
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.rolesSection} id="peran" aria-labelledby="roles-heading">
          <div className={styles.rolesIntro}>
            <p className={styles.sectionLabel}>SATU PLATFORM, TIGA PERAN</p>
            <h2 id="roles-heading">Kebiasaan membaca dibangun bersama.</h2>
            <p>
              Setiap orang punya peran yang berbeda—dan ruang kerja yang sesuai di READPOINT.
            </p>
          </div>

          <div className={styles.roleList}>
            {roles.map((role) => {
              const Icon = role.icon;

              return (
                <article className={styles.role} key={role.number}>
                  <span className={styles.roleNumber}>{role.number}</span>
                  <Icon className={styles.roleIcon} size={21} strokeWidth={1.8} aria-hidden="true" />
                  <div className={styles.roleCopy}>
                    <h3>{role.title}</h3>
                    <p>{role.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.callout}>
          <div className={styles.calloutCopy}>
            <p className={styles.sectionLabel}>MULAI DARI SATU BUKU</p>
            <h2>Halaman pertama bisa dimulai hari ini.</h2>
          </div>
          <Link href="/register" className={styles.calloutLink}>
            Buat akun siswa <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <Link href="/" className={styles.footerBrand}>
          <Library size={17} aria-hidden="true" />
          READPOINT
        </Link>
        <p>Platform literasi digital untuk sekolah Indonesia.</p>
        <div className={styles.footerLinks}>
          <Link href="#alur">Cara kerja</Link>
          <Link href="#peran">Untuk siapa</Link>
          <Link href="/login">Masuk</Link>
        </div>
      </footer>
    </div>
  );
}
