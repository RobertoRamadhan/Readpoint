'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpenCheck,
  Eye,
  EyeOff,
  Library,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[minmax(420px,0.92fr)_minmax(0,1.08fr)]">
        <section
          className="relative hidden overflow-hidden bg-slate-950 bg-cover bg-center lg:flex"
          style={{ backgroundImage: 'url("/perpus.jpg")' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/58 to-emerald-950/32" />
          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-10 xl:p-12">
            <Link href="/" className="inline-flex items-center gap-3 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-2xl">
                <Library size={22} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span className="text-lg font-black">READPOINT</span>
            </Link>

            <div className="max-w-lg">
              <p className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-black uppercase text-emerald-100 backdrop-blur">
                <BookOpenCheck size={16} aria-hidden="true" />
                Literasi digital sekolah
              </p>
              <h1 className="text-5xl font-black leading-none text-white xl:text-6xl">
                Masuk dan lanjutkan progres membaca.
              </h1>
              <p className="mt-5 max-w-md text-base leading-8 text-slate-100/85">
                Dashboard READPOINT menyatukan aktivitas baca, kuis, poin, dan laporan kelas dalam
                alur yang mudah dipantau.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-white">
              <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-black">86%</p>
                <p className="mt-1 text-xs font-bold text-slate-200">kuis selesai</p>
              </div>
              <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-black">12K+</p>
                <p className="mt-1 text-xs font-bold text-slate-200">aktivitas baca</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center px-5 py-8 sm:px-8 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-[520px]">
            <Link href="/" className="mb-9 inline-flex items-center gap-3 text-slate-950 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
                <Library size={20} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span className="font-black">READPOINT</span>
            </Link>

            <div className="mb-8">
              <p className="text-xs font-black uppercase text-emerald-700">Selamat datang</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                Masuk ke akun
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Gunakan akun yang sudah terdaftar untuk membuka dashboard READPOINT.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-800">Email</span>
                <span className="flex h-14 items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 transition focus-within:border-emerald-700 focus-within:ring-4 focus-within:ring-emerald-700/10">
                  <Mail size={19} className="shrink-0 text-slate-400" aria-hidden="true" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:ring-0"
                    placeholder="nama@email.com"
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-black text-slate-800">Password</span>
                <span className="flex h-14 items-center gap-3 rounded-lg border border-slate-300 bg-white px-4 transition focus-within:border-emerald-700 focus-within:ring-4 focus-within:ring-emerald-700/10">
                  <LockKeyhole size={19} className="shrink-0 text-slate-400" aria-hidden="true" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:ring-0"
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 text-base font-black text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Memproses...' : 'Masuk'}
                {!loading && <ArrowRight size={18} aria-hidden="true" />}
              </button>
            </form>

            <div className="mt-6 flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
              <p className="m-0 leading-6">Akun terhubung ke dashboard sesuai peran siswa, guru, atau admin.</p>
            </div>

            <p className="mt-7 text-center text-sm font-semibold text-slate-600">
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
