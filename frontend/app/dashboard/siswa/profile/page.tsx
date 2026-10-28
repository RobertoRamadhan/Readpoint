'use client';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './profile.module.css';

export default function SiswaProfilePage() {
  const { user, loading, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    current_password: '',
    new_password: '',
    password_confirmation: '',
    avatar: null as File | null,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;

    if (!isAuthenticated || !user || user.role !== 'siswa') {
      router.replace('/login');
      return;
    }

    setFormData({
      name: user.name,
      email: user.email,
      current_password: '',
      new_password: '',
      password_confirmation: '',
      avatar: null,
    });
  }, [mounted, loading, isAuthenticated, user, router]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, avatar: file }));

    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.email) {
      setError('Nama dan email harus diisi');
      return;
    }

    try {
      setSubmitting(true);

      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('email', formData.email);

      if (formData.avatar) {
        payload.append('avatar', formData.avatar);
      }

      await api.me.updateProfile(payload);
      setSuccess('Profil berhasil diperbarui');
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui profil');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.current_password || !formData.new_password || !formData.password_confirmation) {
      setError('Semua field password harus diisi');
      return;
    }

    if (formData.new_password !== formData.password_confirmation) {
      setError('Password baru tidak cocok');
      return;
    }

    try {
      setSubmitting(true);

      await api.me.updateProfile({
        current_password: formData.current_password,
        password: formData.new_password,
        password_confirmation: formData.password_confirmation,
      });

      setSuccess('Password berhasil diperbarui');
      setFormData((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        password_confirmation: '',
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui password');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'siswa') return null;

  const avatar = avatarPreview || (user as any).profile_photo_url || undefined;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button
            onClick={() => router.push('/dashboard/siswa')}
            className={styles.brand}
          >
            <div>
              <p className={styles.brandName}>READPOINT</p>
              <p className={styles.brandLabel}>Profil Siswa</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/siswa')}
            className={styles.backButton}
          >
            Kembali
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.pageHeading}>
          <h1 className={styles.pageTitle}>Profil Siswa</h1>
          <p className={styles.pageDescription}>
            Kelola data akun, foto profil, dan password.
          </p>
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <div className={styles.contentGrid}>
          <aside className={styles.profileCard}>
            <div className={styles.profileCover} aria-hidden="true" />

            <div className={styles.avatar}>
              {avatar ? (
                <img
                  src={avatar}
                  alt={user.name}
                  className={styles.avatarImage}
                />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>

            <h2 className={styles.userName}>{user.name}</h2>

            <p className={styles.roleBadge}>
              Siswa
            </p>

            <button
              type="button"
              onClick={() => document.getElementById('avatar-input')?.click()}
              className={styles.avatarButton}
            >
              Edit Foto
            </button>

            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <p className={styles.avatarHelp}>
              Klik tombol di atas untuk mengganti foto profil.
            </p>

            <div className={styles.profileInfo}>
              <ProfileInfo label="Email" value={user.email} />
              <ProfileInfo label="Role" value="Siswa" />
              <ProfileInfo label="Kelas" value={(user as any).grade_level ? `Kelas ${(user as any).grade_level}` : '-'} />
              <ProfileInfo label="Nama Kelas" value={(user as any).class_name || '-'} />
            </div>
          </aside>

          <section className={styles.forms}>
            <CardShell title="Informasi Profil">
              <form onSubmit={handleProfileUpdate} className={styles.fieldGrid}>
                <Field label="Nama Lengkap">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    className={styles.input}
                    required
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    className={styles.input}
                    required
                  />
                </Field>

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={styles.actionButton}
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Profil'}
                  </button>
                </div>
              </form>
            </CardShell>

            <CardShell title="Ubah Password">
              <form onSubmit={handlePasswordUpdate} className={styles.fieldGrid}>
                <Field label="Password Saat Ini">
                  <input
                    type="password"
                    value={formData.current_password}
                    onChange={(event) => setFormData({ ...formData, current_password: event.target.value })}
                    className={styles.input}
                    required
                  />
                </Field>

                <Field label="Password Baru">
                  <input
                    type="password"
                    value={formData.new_password}
                    onChange={(event) => setFormData({ ...formData, new_password: event.target.value })}
                    className={styles.input}
                    required
                    minLength={6}
                  />
                </Field>

                <Field label="Konfirmasi Password Baru" full>
                  <input
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(event) => setFormData({ ...formData, password_confirmation: event.target.value })}
                    className={styles.input}
                    required
                    minLength={6}
                  />
                </Field>

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`${styles.actionButton} ${styles.dangerButton}`}
                  >
                    {submitting ? 'Menyimpan...' : 'Ubah Password'}
                  </button>
                </div>
              </form>
            </CardShell>
          </section>
        </div>
      </main>
    </div>
  );
}

function Alert({
  type,
  message,
}: {
  type: 'error' | 'success';
  message: string;
}) {
  return (
    <div className={`${styles.alert} ${type === 'error' ? styles.alertError : styles.alertSuccess}`}>
      {message}
    </div>
  );
}

function ProfileInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}

function CardShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.formCard}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`${styles.field} ${full ? styles.fieldFull : ''}`}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}
