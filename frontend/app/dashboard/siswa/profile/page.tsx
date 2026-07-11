'use client';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SiswaProfilePage() {
  const { user, loading, isAuthenticated, refreshUser, logout } = useAuth();
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
  const [guruList] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingGuru] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || loading || !isAuthenticated) return;

    if (!user || user.role !== 'siswa') {
      router.push('/login');
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

  // guruList tidak digunakan — wali_kelas tidak ada di skema DB

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur lg:px-8">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4">
          <button
            onClick={() => router.push('/dashboard/siswa')}
            className="flex items-center gap-3 text-left"
          >
            <div>
              <h1 className="text-lg font-black leading-none text-slate-950">
                READPOINT
              </h1>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                Profil Siswa
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => router.push('/dashboard/siswa')}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 sm:px-4 sm:text-sm"
            >
              Kembali
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
            Profil Siswa
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Kelola data akun, wali kelas, foto profil, dan password.
          </p>
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="-mx-6 -mt-6 h-32 rounded-t-3xl border-b border-emerald-100 bg-emerald-50" />

            <div className="relative -mt-16 flex justify-center">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-emerald-600 text-4xl font-black text-white shadow-md">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.name?.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-950">
              {user.name}
            </h2>

            <p className="mt-2 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-black text-emerald-700">
              Siswa
            </p>

            <button
              onClick={() => document.getElementById('avatar-input')?.click()}
              className="mt-6 w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700"
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

            <p className="mt-3 text-xs font-semibold text-slate-500">
              Klik tombol di atas untuk mengganti foto profil.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
              <ProfileInfo label="Email" value={user.email} />
              <ProfileInfo label="Role" value="Siswa" />
              <ProfileInfo label="Kelas" value={(user as any).grade_level ? `Kelas ${(user as any).grade_level}` : '-'} />
              <ProfileInfo label="Nama Kelas" value={(user as any).class_name || '-'} />
            </div>
          </aside>

          <section className="space-y-6">
            <CardShell title="Informasi Profil">
              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Nama Lengkap">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    className={inputClass}
                    required
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    className={inputClass}
                    required
                  />
                </Field>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Profil'}
                  </button>
                </div>
              </form>
            </CardShell>

            <CardShell title="Ubah Password">
              <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Password Saat Ini">
                  <input
                    type="password"
                    value={formData.current_password}
                    onChange={(event) => setFormData({ ...formData, current_password: event.target.value })}
                    className={inputClass}
                    required
                  />
                </Field>

                <Field label="Password Baru">
                  <input
                    type="password"
                    value={formData.new_password}
                    onChange={(event) => setFormData({ ...formData, new_password: event.target.value })}
                    className={inputClass}
                    required
                    minLength={6}
                  />
                </Field>

                <Field label="Konfirmasi Password Baru" full>
                  <input
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(event) => setFormData({ ...formData, password_confirmation: event.target.value })}
                    className={inputClass}
                    required
                    minLength={6}
                  />
                </Field>

                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white hover:bg-red-700 disabled:opacity-60 sm:w-auto"
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

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60';

function Alert({
  type,
  message,
}: {
  type: 'error' | 'success';
  message: string;
}) {
  const style =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return (
    <div className={`mb-5 rounded-2xl border p-4 text-sm font-semibold ${style}`}>
      {message}
    </div>
  );
}

function ProfileInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      <span className="truncate text-sm font-black text-slate-900">{value}</span>
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
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-xl font-black text-slate-950">{title}</h2>
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
    <label className={`block ${full ? 'md:col-span-2' : ''}`}>
      <span className="mb-1.5 block text-sm font-black text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
