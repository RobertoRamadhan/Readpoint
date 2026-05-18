'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { RippleButton } from '@/components/shared';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'siswa',
    grade_level: '',
    wali_kelas: '',
  });
  const [guruList, setGuruList] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingGuru, setLoadingGuru] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const fetchGuruList = async () => {
      try {
        setLoadingGuru(true);
        const response = await api.users.list();
        const users = Array.isArray(response.data) ? response.data : [];
        const guruUsers = users
          .filter((u: any) => u.role === 'guru')
          .map((u: any) => ({ id: u.id, name: u.name }));
        setGuruList(guruUsers);
      } catch {
        // silently fail — wali kelas list optional
      } finally {
        setLoadingGuru(false);
      }
    };
    fetchGuruList();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      const response = await api.register(formData as any);
      const authData = response.data || response as any;
      if (authData.user && authData.token) {
        login(authData.user, authData.token);
        router.push('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Pendaftaran gagal';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-amber-50 border-2 border-amber-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition text-sm disabled:opacity-60';

  return (
    <div className="w-full max-w-md mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-7">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-300/40">
            <span className="text-3xl">📚</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black text-amber-900 tracking-tight">READPOINT</h1>
            <p className="text-xs text-amber-600 font-semibold">Platform Literasi Digital Siswa</p>
          </div>
        </div>
        <h2 className="text-xl font-black text-slate-800 mt-2">Buat Akun Baru</h2>
        <p className="text-sm text-slate-500 mt-1">Mulai petualangan literasi digital Anda</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-amber-100/60 p-7 border border-amber-100">

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm font-medium">
            <span className="text-lg mt-0.5">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div>
            <label className="block text-sm font-bold text-amber-900 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Nama lengkap Anda"
              disabled={loading}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-amber-900 mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="nama@email.com"
              disabled={loading}
              required
            />
          </div>

          {/* Kelas */}
          <div>
            <label className="block text-sm font-bold text-amber-900 mb-1.5">Kelas</label>
            <select
              name="grade_level"
              value={formData.grade_level}
              onChange={handleChange}
              className={inputClass}
              disabled={loading}
              required
            >
              <option value="">Pilih Kelas</option>
              <option value="1">Kelas X</option>
              <option value="2">Kelas XI</option>
              <option value="3">Kelas XII</option>
            </select>
          </div>

          {/* Wali Kelas */}
          <div>
            <label className="block text-sm font-bold text-amber-900 mb-1.5">
              Wali Kelas
              {loadingGuru && (
                <span className="ml-2 text-xs text-amber-500 font-normal">Memuat...</span>
              )}
            </label>
            <select
              name="wali_kelas"
              value={formData.wali_kelas}
              onChange={handleChange}
              className={inputClass}
              disabled={loadingGuru || loading}
            >
              <option value="">Pilih Wali Kelas (opsional)</option>
              {guruList.map((guru) => (
                <option key={guru.id} value={guru.id.toString()}>
                  {guru.name}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-amber-900 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={inputClass}
              placeholder="Minimal 6 karakter"
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-sm font-bold text-amber-900 mb-1.5">Konfirmasi Password</label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              className={inputClass}
              placeholder="Ulangi password"
              disabled={loading}
              required
              minLength={6}
            />
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
              {loading ? 'Mendaftarkan...' : '✨ Daftar Sekarang'}
            </RippleButton>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-amber-100"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-amber-500 text-xs font-bold">ATAU</span>
          </div>
        </div>

        <p className="text-center text-slate-600 text-sm mb-3">Sudah punya akun?</p>
        <RippleButton
          type="button"
          variant="secondary"
          size="large"
          fullWidth
          onClick={() => router.push('/login')}
        >
          🚀 Masuk Sekarang
        </RippleButton>
      </div>
    </div>
  );
}
