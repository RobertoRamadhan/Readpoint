'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }

    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    setLoading(true);

    try {
      const response = await api.login({ email, password });

      if (response.user && response.token) {
        login(response.user, response.token);
        router.push('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login gagal';
      setError(errorMsg);
      console.error('[Login Error]', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-start justify-center px-5 py-5 sm:px-8 sm:py-8 lg:items-center lg:px-16 lg:py-12 xl:px-20">
        <div className="grid w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-200 bg-white shadow-xl sm:shadow-2xl lg:grid-cols-[1.2fr_0.8fr] gap-0">
          {/* Image Section - Top on mobile, left on desktop */}
          <section
            className="relative flex min-h-[220px] flex-col justify-between overflow-hidden bg-cover bg-center text-white sm:min-h-[260px] lg:min-h-[680px]"
            style={{ backgroundImage: 'url("/perpus.jpg")' }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-emerald-800/60 to-emerald-900/70"></div>

            <div className="relative z-10 p-6 sm:p-8 lg:p-10">
              <Link href="/" className="inline-flex items-center gap-2 lg:gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-black text-emerald-700 shadow-lg lg:h-12 lg:w-12 lg:text-sm">RP</div>
                <div>
                  <p className="text-lg font-black text-white lg:text-xl">READPOINT</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-100">Literasi Digital</p>
                </div>
              </Link>
            </div>

            {/* Bottom decoration - desktop only */}
            <div className="relative z-10 hidden p-8 lg:block lg:p-10">
              <p className="text-sm text-emerald-100">Tingkatkan minat baca dengan sistem reward digital</p>
            </div>
          </section>

          {/* Form Section */}
          <section className="flex min-h-auto items-center justify-center px-6 py-8 sm:px-8 sm:py-10 lg:min-h-[680px] lg:px-12 lg:py-12 xl:px-14">
            <div className="w-full max-w-sm">
              {/* Mobile Header */}
              <div className="mb-7 text-center lg:hidden">
                <p className="text-sm font-black uppercase tracking-widest text-emerald-600">Selamat Datang</p>
                <h2 className="mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">Masuk ke akun</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Masukkan email dan password untuk membuka dashboard READPOINT.</p>
              </div>

              {/* Desktop Header */}
              <div className="mb-8 sm:mb-10 text-center lg:text-left hidden lg:block">
                <p className="text-lg font-black uppercase tracking-widest text-emerald-600">Selamat Datang</p>
                <h2 className="mt-4 text-4xl lg:text-5xl font-black leading-tight text-slate-900">Masuk ke akun</h2>
                <p className="mt-4 leading-7 text-lg text-slate-600">Masukkan email dan password untuk membuka dashboard READPOINT.</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 rounded-lg sm:rounded-xl border border-red-200 bg-red-50 p-3 sm:p-4 text-xs sm:text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="mb-2 block text-sm sm:text-base font-black text-slate-800">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 sm:h-14 lg:h-16 w-full rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-300 bg-white px-3 sm:px-4 text-sm sm:text-base lg:text-lg text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 transition-all"
                    placeholder="nama@email.com"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm sm:text-base font-black text-slate-800">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 sm:h-14 lg:h-16 w-full rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-300 bg-white px-3 sm:px-4 text-sm sm:text-base lg:text-lg text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 transition-all"
                    placeholder="Masukkan password"
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 sm:h-14 lg:h-16 w-full rounded-lg sm:rounded-xl lg:rounded-2xl bg-emerald-700 px-4 sm:px-6 text-sm sm:text-base lg:text-lg font-black text-white shadow-md sm:shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
              </form>

              <div className="my-6 sm:my-8 h-px w-full bg-slate-200" />

              <p className="text-center text-sm sm:text-base font-semibold text-slate-600">
                Belum punya akun?{' '}
                <Link href="/register" className="font-black text-emerald-700 hover:text-emerald-800">
                  Daftar di sini
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
