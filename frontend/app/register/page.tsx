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
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-200 bg-white shadow-xl sm:shadow-2xl lg:grid-cols-[1.2fr_0.8fr] gap-0">
          {/* Left Section - Hidden on mobile, visible on lg */}
          <section className="hidden text-white lg:flex lg:flex-col lg:justify-between relative overflow-hidden bg-cover bg-center" style={{backgroundImage: 'url("/perpus.jpg")', backgroundAttachment: 'fixed'}}>
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-emerald-800/60 to-emerald-900/70"></div>

            <div className="relative z-10 p-8 lg:p-10">
              <Link href="/" className="inline-flex items-center gap-2 lg:gap-3">
                <div className="flex h-11 lg:h-12 w-11 lg:w-12 items-center justify-center rounded-xl bg-white text-xs lg:text-sm font-black text-emerald-700 shadow-lg">RP</div>
                <div>
                  <p className="text-lg lg:text-xl font-black text-white">READPOINT</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Literasi Digital</p>
                </div>
              </Link>

              <div className="mt-16 lg:mt-20 max-w-md">
                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-white drop-shadow-lg">Buat akun READPOINT.</h1>
                <p className="mt-4 lg:mt-6 leading-7 lg:leading-8 text-base lg:text-lg text-emerald-100 drop-shadow-md">Daftar untuk mulai petualangan literasi digital Anda.</p>
              </div>
            </div>

            {/* Bottom decoration */}
            <div className="relative z-10 p-8 lg:p-10">
              <div className="flex items-center gap-3 text-emerald-100">
                <div className="text-3xl">🎓</div>
                <div className="text-sm">Bergabunglah dengan ribuan siswa yang sudah membaca</div>
              </div>
            </div>
          </section>

          {/* Right Section - Form */}
          <section className="flex min-h-screen sm:min-h-auto lg:min-h-[760px] items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 overflow-y-auto">
            <div className="w-full max-w-lg">
              {/* Mobile Header */}
              <div className="mb-8 sm:mb-10 text-center lg:text-left lg:hidden">
                <Link href="/" className="mb-6 inline-flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white shadow-md">RP</div>
                  <div className="text-left">
                    <p className="text-lg font-black text-emerald-700">READPOINT</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Literasi Digital</p>
                  </div>
                </Link>

                <p className="text-sm font-black uppercase tracking-widest text-emerald-600 mt-6">Akun Siswa</p>
                <h2 className="mt-3 text-2xl sm:text-3xl font-black leading-tight text-slate-900">Daftar akun baru</h2>
                <p className="mt-3 leading-6 text-sm sm:text-base text-slate-600">Lengkapi data berikut untuk membuat akun READPOINT.</p>
              </div>

              {/* Desktop Header */}
              <div className="mb-8 sm:mb-10 text-center lg:text-left hidden lg:block">
                <p className="text-lg font-black uppercase tracking-widest text-emerald-600">Akun Siswa</p>
                <h2 className="mt-4 text-4xl lg:text-5xl font-black leading-tight text-slate-900">Daftar akun baru</h2>
                <p className="mt-4 leading-7 text-lg text-slate-600">Lengkapi data berikut untuk membuat akun READPOINT.</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 rounded-lg sm:rounded-xl border border-red-200 bg-red-50 p-3 sm:p-4 text-xs sm:text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <Field label="Nama Lengkap">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="h-11 sm:h-12 lg:h-14 w-full rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-300 bg-white px-3 sm:px-4 text-sm sm:text-base lg:text-lg text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 transition-all"
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
                      className="h-11 sm:h-12 lg:h-14 w-full rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-300 bg-white px-3 sm:px-4 text-sm sm:text-base lg:text-lg text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 transition-all"
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
                    className="h-11 sm:h-12 lg:h-14 w-full rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-300 bg-white px-3 sm:px-4 text-sm sm:text-base lg:text-lg text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 transition-all"
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
                    className="h-11 sm:h-12 lg:h-14 w-full rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-300 bg-white px-3 sm:px-4 text-sm sm:text-base lg:text-lg text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 transition-all"
                    placeholder="Contoh: X-A, X-B, dll"
                    disabled={loading}
                  />
                </Field>

                <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                  <Field label="Password">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="h-11 sm:h-12 lg:h-14 w-full rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-300 bg-white px-3 sm:px-4 text-sm sm:text-base lg:text-lg text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 transition-all"
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
                      className="h-11 sm:h-12 lg:h-14 w-full rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-300 bg-white px-3 sm:px-4 text-sm sm:text-base lg:text-lg text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 transition-all"
                      placeholder="Ulangi password"
                      disabled={loading}
                      required
                    />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 sm:h-14 lg:h-16 w-full rounded-lg sm:rounded-xl lg:rounded-2xl bg-emerald-700 px-4 sm:px-6 text-sm sm:text-base lg:text-lg font-black text-white shadow-md sm:shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Memproses...' : 'Daftar'}
                </button>
              </form>

              <div className="my-6 sm:my-8 h-px w-full bg-slate-200" />

              <p className="text-center text-sm sm:text-base font-semibold text-slate-600">
                Sudah punya akun?{' '}
                <Link href="/login" className="font-black text-emerald-700 hover:text-emerald-800">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm sm:text-base font-black text-slate-800">{label}</label>
      {children}
    </div>
  );
}
