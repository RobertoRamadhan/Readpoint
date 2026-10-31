'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BookOpen, Library } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import styles from '../login/login.module.css';

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  grade_level: string;
  class_name: string;
  role: 'siswa';
};

const initialFormData: RegisterFormData = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  grade_level: '',
  class_name: '',
  role: 'siswa',
};

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.grade_level) {
      setError('Semua field harus diisi');
      return;
    }

    if (formData.name.length < 3) {
      setError('Nama minimal 3 karakter');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError('Password tidak sesuai');
      return;
    }

    setLoading(true);

    try {
      const response = await api.register(formData);

      if (response.user && response.token) {
        login(response.user, response.token);
        router.push('/dashboard');
      } else {
        throw new Error('Respons server tidak valid');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Pendaftaran gagal';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputClassName = styles.authInput;

  return (
    <main className={styles.page}>
      <div className={styles.frame}>
        <section className={styles.storyPanel} aria-label="Tentang READPOINT">
          <div className={styles.photo} aria-hidden="true" />
          <div className={styles.storyContent}>
            <Link href="/" className={styles.brand} aria-label="READPOINT beranda">
              <span className={styles.brandMark}>
                <Library size={19} strokeWidth={2.2} aria-hidden="true" />
              </span>
              <span className={styles.brandName}>READPOINT</span>
            </Link>
            <div className={styles.storyCopy}>
              <p className={styles.storyEyebrow}>Ruang baca digital sekolah</p>
              <h1>
                Satu buku.
                <br />
                <em>Satu langkah baru.</em>
              </h1>
              <p className={styles.storyDescription}>
                Mulai perjalanan membaca, ikuti progres, dan temukan bacaan berikutnya.
              </p>
            </div>
            <div className={styles.readingPath}>
              <div className={styles.pathIcon}>
                <BookOpen size={18} aria-hidden="true" />
              </div>
              <div>
                <p className={styles.pathTitle}>Akun siswa</p>
                <p className={styles.pathSteps}>
                  <span>Baca</span>
                  <span className={styles.pathDot} />
                  <span>Pahami</span>
                  <span className={styles.pathDot} />
                  <span>Berkembang</span>
                </p>
              </div>
            </div>
          </div>
          <span className={styles.imageCaption}>PERPUSTAKAAN · READPOINT</span>
        </section>

        <section className={styles.formPanel} aria-labelledby="register-heading">
          <div className={styles.formTopline}>
            <span className={styles.formKicker}>AKUN SISWA</span>
            <Link href="/" className={styles.homeLink}>
              Beranda <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.formContent}>
            <p className={styles.welcome}>Mulai perjalananmu</p>
            <h2 id="register-heading">Buat akun baru.</h2>
            <p className={styles.formDescription}>
              Isi data berikut untuk bergabung di READPOINT.
            </p>

            {error && (
              <div className={styles.error} role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="name">Nama lengkap</label>
                <input
                  className={inputClassName}
                  id="name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama lengkap"
                  disabled={loading}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input
                  className={inputClassName}
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  disabled={loading}
                  required
                />
              </div>

              <div className={styles.registerGrid}>
                <div className={styles.field}>
                  <label htmlFor="grade_level">Tingkat kelas</label>
                  <select
                    className={inputClassName}
                    id="grade_level"
                    name="grade_level"
                    value={formData.grade_level}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  >
                    <option value="">Pilih kelas</option>
                    <option value="1">Kelas X</option>
                    <option value="2">Kelas XI</option>
                    <option value="3">Kelas XII</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label htmlFor="class_name">Nama kelas <span>(opsional)</span></label>
                  <input
                    className={inputClassName}
                    id="class_name"
                    type="text"
                    name="class_name"
                    autoComplete="off"
                    value={formData.class_name}
                    onChange={handleChange}
                    placeholder="Contoh: X-A"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.registerGrid}>
                <div className={styles.field}>
                  <label htmlFor="password">Password</label>
                  <input
                    className={inputClassName}
                    id="password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 8 karakter"
                    disabled={loading}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="password_confirmation">Ulangi password</label>
                  <input
                    className={inputClassName}
                    id="password_confirmation"
                    type="password"
                    name="password_confirmation"
                    autoComplete="new-password"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="Konfirmasi password"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className={styles.submitButton}>
                <span>{loading ? 'Memproses...' : 'Buat akun siswa'}</span>
                {!loading && <ArrowRight size={18} aria-hidden="true" />}
              </button>
            </form>

            <p className={styles.registerPrompt}>
              Sudah punya akun? <Link href="/login">Masuk di sini <ArrowRight size={14} aria-hidden="true" /></Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
