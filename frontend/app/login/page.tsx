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
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-200 bg-white shadow-xl sm:shadow-2xl lg:grid-cols-[1.2fr_0.8fr] gap-0">
          {/* Left Section - Hidden on mobile, visible on lg */}
          <section className="hidden text-white lg:flex lg:flex-col lg:justify-between relative overflow-hidden bg-cover bg-center" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583f20270319?w=800&h=900&fit=crop")', backgroundAttachment: 'fixed'}}>
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
                <h1 className="text-4xl lg:text-5xl font-black leading-tight text-white drop-shadow-lg">Masuk ke dashboard READPOINT.</h1>
                <p className="mt-4 lg:mt-6 leading-7 lg:leading-8 text-base lg:text-lg text-emerald-100 drop-shadow-md">Gunakan akun yang sudah terdaftar untuk mengakses dashboard sesuai role pengguna.</p>
              </div>
            </div>

            {/* Bottom decoration */}
            <div className="relative z-10 p-8 lg:p-10">
              <div className="flex items-center gap-3 text-emerald-100">
                <div className="text-3xl">📚</div>
                <div className="text-sm">Tingkatkan minat baca dengan sistem reward digital</div>
              </div>
            </div>
          </section>

          {/* Right Section - Form */}
          <section className="flex min-h-screen sm:min-h-auto lg:min-h-[680px] items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="w-full max-w-sm">
              {/* Mobile Header */}
              <div className="mb-8 sm:mb-10 text-center lg:text-left lg:hidden">
                <Link href="/" className="mb-6 inline-flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white shadow-md">RP</div>
                  <div className="text-left">
                    <p className="text-lg font-black text-emerald-700">READPOINT</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Literasi Digital</p>
                  </div>
                </Link>

                <p className="text-sm font-black uppercase tracking-widest text-emerald-600 mt-6">Selamat Datang</p>
                <h2 className="mt-3 text-2xl sm:text-3xl font-black leading-tight text-slate-900">Masuk ke akun</h2>
                <p className="mt-3 leading-6 text-sm sm:text-base text-slate-600">Masukkan email dan password untuk membuka dashboard READPOINT.</p>
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
