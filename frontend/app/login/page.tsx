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
        throw new Error('Respons server tidak valid');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login gagal';
      setError(errorMsg);
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
        <section
          className="relative flex min-h-[180px] flex-col justify-between overflow-hidden bg-cover bg-center text-white sm:min-h-[220px] lg:min-h-[600px]"
          style={{ backgroundImage: 'url("/perpus.jpg")' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/70 via-emerald-800/60 to-emerald-900/70" />

          <div className="relative z-10 p-5 sm:p-7 lg:p-8">
            <Link href="/" className="inline-flex items-center gap-2 lg:gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-black text-emerald-700 shadow-lg lg:h-11 lg:w-11">
                RP
              </div>
              <div>
                <p className="text-base font-black text-white lg:text-lg">READPOINT</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 sm:text-xs">
                  Literasi Digital
                </p>
              </div>
            </Link>
          </div>

          <div className="relative z-10 hidden p-8 lg:block">
            <p className="text-sm text-emerald-100">Tingkatkan minat baca dengan sistem reward digital</p>
          </div>
        </section>

        <section className="flex min-h-0 items-center justify-center px-6 py-8 sm:px-8 sm:py-10 lg:min-h-[600px] lg:px-16 lg:py-12 xl:px-20">
          <div className="mx-auto w-full" style={{ maxWidth: '540px' }}>
            <div className="mb-7 text-center lg:hidden">
              <p className="text-sm font-black uppercase tracking-widest text-emerald-600">Selamat Datang</p>
              <h2 className="mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">Masuk ke akun</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                Masukkan email dan password untuk membuka dashboard READPOINT.
              </p>
            </div>

            <div className="mb-8 hidden text-center lg:block lg:text-left">
              <p className="text-base font-black uppercase tracking-widest text-emerald-600">Selamat Datang</p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-slate-900">Masuk ke akun</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Masukkan email dan password untuk membuka dashboard READPOINT.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 sm:rounded-xl sm:p-4 sm:text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" style={{ width: '100%', maxWidth: '540px' }}>
              <div>
                <label className="mb-2 block text-sm font-black text-slate-800 sm:text-base">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 sm:h-14 sm:rounded-xl sm:px-4 sm:text-base"
                  placeholder="nama@email.com"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-slate-800 sm:text-base">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 sm:h-14 sm:rounded-xl sm:px-4 sm:text-base"
                  placeholder="Masukkan password"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-lg bg-emerald-700 px-4 text-sm font-black text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:rounded-xl sm:px-6 sm:text-base sm:shadow-lg"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <div className="my-6 h-px w-full bg-slate-200" />

            <p className="text-center text-sm font-semibold text-slate-600 sm:text-base">
              Belum punya akun?{' '}
              <Link href="/register" className="font-black text-emerald-700 hover:text-emerald-800">
                Daftar di sini
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
