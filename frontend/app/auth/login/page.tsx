'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { RippleButton } from '@/components/shared';

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
    setLoading(true);

    try {
      const response = await api.login({ email, password });
      const authData = response.data || response as any;
      if (authData.user && authData.token) {
        login(authData.user, authData.token);
        router.push('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login gagal';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-10">
      {/* Header / Branding */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-300/40">
            <span className="text-3xl">📚</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black text-emerald-900 tracking-tight">READPOINT</h1>
            <p className="text-xs text-emerald-600 font-semibold">Platform Literasi Digital Siswa</p>
          </div>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">
          Masuk dan mulai petualangan membaca bersama ribuan siswa lainnya.
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-100/60 p-8 border border-emerald-100">

        {/* Error Alert */}
        {error && (
          <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm font-medium">
            <span className="text-lg mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-emerald-900 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-amber-200 transition duration-200 text-sm"
                placeholder="nama@email.com"
                disabled={loading}
                required
              />
              <span className="absolute right-4 top-3 text-lg pointer-events-none">✉️</span>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-emerald-900 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-amber-200 transition duration-200 text-sm"
                placeholder="••••••••"
                disabled={loading}
                required
              />
              <span className="absolute right-4 top-3 text-lg pointer-events-none">🔐</span>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-2 border-emerald-300 accent-amber-600"
              />
              <span className="text-slate-700 font-medium">Ingat saya</span>
            </label>
            <a href="#" className="text-emerald-600 hover:text-emerald-800 font-semibold transition">
              Lupa password?
            </a>
          </div>

          {/* Submit — RippleButton */}
          <div className="pt-2">
            <RippleButton
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Sedang Masuk...' : '🚀 Masuk ke Dashboard'}
            </RippleButton>
          </div>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-emerald-500 text-xs font-bold">ATAU</span>
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-slate-600 text-sm font-medium">
            Belum punya akun?
          </p>
          <RippleButton
            type="button"
            variant="secondary"
            size="large"
            fullWidth
            onClick={() => router.push('/register')}
          >
            ✨ Daftar Akun Baru
          </RippleButton>
        </form>

        <p className="text-center text-slate-400 text-xs mt-6">
          Platform aman dengan enkripsi SSL dan perlindungan data terjamin
        </p>
      </div>
    </div>
  );
}
