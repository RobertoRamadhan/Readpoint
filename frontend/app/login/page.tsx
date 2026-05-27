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
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-5 py-12 sm:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <section className="hidden text-white lg:flex lg:flex-col lg:justify-between relative overflow-hidden" style={{backgroundImage: 'url(/perpus.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
            {/* Overlay - Lebih gelap */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/75 to-slate-900/80"></div>

            <div className="relative z-10 p-10">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-900">RP</div>
                <div>
                  <p className="text-xl font-black text-white">READPOINT</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Literasi Digital</p>
                </div>
              </Link>

              <div className="mt-20 max-w-md">
                <h1 className="mt-5 text-5xl font-black leading-tight text-white lg:text-6xl drop-shadow-lg">Masuk ke dashboard READPOINT.</h1>
                <p className="mt-6 leading-8 text-lg text-slate-300 lg:text-xl drop-shadow-md">Gunakan akun yang sudah terdaftar untuk mengakses dashboard sesuai role pengguna.</p>
              </div>
            </div>

            <div className="relative z-10 p-10 grid grid-cols-3 gap-4">
            </div>
          </section>

          <section className="flex min-h-[680px] items-center justify-center px-5 py-12 sm:px-8 lg:px-8">
            <div className="w-full max-w-sm">
              <div className="mb-10 text-center lg:text-left">
                <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">RP</div>
                  <div className="text-left">
                    <p className="text-xl font-black text-slate-900">READPOINT</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Literasi Digital</p>
                  </div>
                </Link>

                <p className="text-lg font-black uppercase tracking-widest text-emerald-700 sm:text-xl">Selamat Datang</p>
                <h2 className="mt-4 text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">Masuk ke akun</h2>
                <p className="mt-4 leading-7 text-lg text-slate-600 sm:text-xl">Masukkan email dan password untuk membuka dashboard READPOINT.</p>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-base font-black text-slate-800 sm:text-lg">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-16 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 sm:text-xl"
                    placeholder="nama@email.com"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-base font-black text-slate-800 sm:text-lg">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-16 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 sm:text-xl"
                    placeholder="Masukkan password"
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-16 w-full rounded-2xl bg-emerald-700 px-6 text-base font-black text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
              </form>

              <div className="my-8 h-px w-full bg-slate-200" />

              <p className="text-center text-base font-semibold text-slate-600 sm:text-lg">
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
