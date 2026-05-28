'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    grade_level: '',
    class_name: '',
    role: 'siswa',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
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
      const response = await api.register(formData as any);

      if (response.user && response.token) {
        login(response.user, response.token);
        router.push('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Pendaftaran gagal';
      setError(errorMsg);
      console.error('[Register Error]', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-6 py-6 text-slate-900 sm:px-10 sm:py-8 lg:px-12 lg:py-12">
      <div
        className="mx-auto grid w-full overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-xl sm:rounded-3xl sm:shadow-2xl lg:grid-cols-[0.85fr_1.15fr]"
        style={{ maxWidth: '1480px' }}
      >
        {/* Image Section - Top on mobile, left on desktop */}
        <section
          className="relative flex min-h-[180px] flex-col justify-between overflow-hidden bg-cover bg-center text-white sm:min-h-[220px] lg:min-h-[600px]"
          style={{ backgroundImage: 'url("/perpus.jpg")' }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-emerald-800/60 to-emerald-900/70"></div>

          <div className="relative z-10 p-5 sm:p-7 lg:p-8">
            <Link href="/" className="inline-flex items-center gap-2 lg:gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-black text-emerald-700 shadow-lg lg:h-11 lg:w-11">RP</div>
              <div>
                <p className="text-base font-black text-white lg:text-lg">READPOINT</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 sm:text-xs">Literasi Digital</p>
              </div>
            </Link>
          </div>

          {/* Bottom decoration - desktop only */}
          <div className="relative z-10 hidden p-8 lg:block">
            <p className="text-sm text-emerald-100">Bergabunglah dengan ribuan siswa yang sudah membaca</p>
          </div>
        </section>

        {/* Form Section */}
        <section className="flex min-h-0 items-center justify-center px-6 py-8 sm:px-8 sm:py-10 lg:min-h-[600px] lg:px-16 lg:py-12 xl:px-20">
          <div className="mx-auto w-full" style={{ maxWidth: '540px' }}>
            {/* Mobile Header */}
            <div className="mb-7 text-center lg:hidden">
              <p className="text-sm font-black uppercase tracking-widest text-emerald-600">Akun Siswa</p>
              <h2 className="mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">Daftar akun baru</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Lengkapi data berikut untuk membuat akun READPOINT.</p>
            </div>

            {/* Desktop Header */}
            <div className="mb-7 hidden text-center lg:block lg:text-left">
              <p className="text-base font-black uppercase tracking-widest text-emerald-600">Akun Siswa</p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-slate-900">Daftar akun baru</h2>
              <p className="mt-3 leading-7 text-base text-slate-600">Lengkapi data berikut untuk membuat akun READPOINT.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 sm:rounded-xl sm:p-4 sm:text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" style={{ width: '100%', maxWidth: '540px' }}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nama Lengkap">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 sm:h-12 sm:rounded-xl sm:px-4 sm:text-base"
                    placeholder="Nama lengkap"
                    disabled={loading}
                    required
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 sm:h-12 sm:rounded-xl sm:px-4 sm:text-base"
                    placeholder="nama@email.com"
                    disabled={loading}
                    required
                  />
                </Field>
              </div>

              <Field label="Kelas">
                <select
                  name="grade_level"
                  value={formData.grade_level}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 sm:h-12 sm:rounded-xl sm:px-4 sm:text-base"
                  disabled={loading}
                  required
                >
                  <option value="">Pilih kelas</option>
                  <option value="1">Kelas X</option>
                  <option value="2">Kelas XI</option>
                  <option value="3">Kelas XII</option>
                </select>
              </Field>

              <Field label="Nama Kelas (Opsional)">
                <input
                  type="text"
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 sm:h-12 sm:rounded-xl sm:px-4 sm:text-base"
                  placeholder="Contoh: X-A, X-B, dll"
                  disabled={loading}
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Password">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 sm:h-12 sm:rounded-xl sm:px-4 sm:text-base"
                    placeholder="Masukkan password"
                    disabled={loading}
                    required
                  />
                </Field>

                <Field label="Konfirmasi Password">
                  <input
                    type="password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 sm:h-12 sm:rounded-xl sm:px-4 sm:text-base"
                    placeholder="Ulangi password"
                    disabled={loading}
                    required
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-lg bg-emerald-700 px-4 text-sm font-black text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:rounded-xl sm:px-6 sm:text-base sm:shadow-lg"
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </form>

            <div className="my-6 h-px w-full bg-slate-200" />

            <p className="text-center text-sm font-semibold text-slate-600 sm:text-base">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-black text-emerald-700 hover:text-emerald-800">
                Masuk di sini
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-800 sm:text-base">{label}</label>
      {children}
    </div>
  );
}
