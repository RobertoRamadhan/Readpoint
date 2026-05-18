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
    
    if (formData.password !== formData.password_confirmation) {
      setError('Password tidak sesuai');
      return;
    }

    if (!formData.grade_level) {
      setError('Kelas harus dipilih');
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100"
    >
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl shadow-xl mb-4">
            <span className="text-3xl font-bold text-white">R</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent mb-2">Daftar</h1>
          <p className="text-lg text-amber-700">Mulai petualangan literasi Anda</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl animate-slide-up shadow-sm">
            <p className="font-semibold text-sm flex items-center gap-2">
              <span>⚠️</span> Terjadi Kesalahan
            </p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Register Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 md:p-10 animate-slide-up animation-delay-200 border border-amber-200 hover:shadow-amber-500/20 transition-all duration-300">
          {/* Decorative Top Border */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-t-2xl"></div>
          
          <form onSubmit={handleSubmit} className="space-y-5.5">
            {/* Name Input */}
            <div className="animate-slide-up animation-delay-300">
              <label className="block text-sm font-semibold text-amber-800 mb-2">
                Nama Lengkap
              </label>
              <div className="flex items-center border-2 border-amber-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition-all duration-200">
                <div className="flex-shrink-0 flex items-center justify-center px-4 py-3.5 border-r border-amber-200">
                  <span className="text-2xl text-amber-500">👤</span>
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-transparent text-stone-800 placeholder-amber-300 focus:outline-none transition-all duration-200"
                  placeholder="Nama Anda"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="animate-slide-up animation-delay-400">
              <label className="block text-sm font-semibold text-amber-800 mb-2">
                Email
              </label>
              <div className="flex items-center border-2 border-amber-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition-all duration-200">
                <div className="flex-shrink-0 flex items-center justify-center px-4 py-3.5 border-r border-amber-200">
                  <span className="text-2xl text-amber-500">✉</span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-transparent text-stone-800 placeholder-amber-300 focus:outline-none transition-all duration-200"
                  placeholder="nama@email.com"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Grade Level Selection */}
            <div className="animate-slide-up animation-delay-500">
              <label className="block text-sm font-semibold text-amber-800 mb-2">
                Kelas
              </label>
              <div className="flex items-center border-2 border-amber-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition-all duration-200">
                <div className="flex-shrink-0 flex items-center justify-center px-4 py-3.5 border-r border-amber-200">
                  <span className="text-2xl text-amber-500">🎓</span>
                </div>
                <div className="relative flex-1">
                  <select
                    name="grade_level"
                    value={formData.grade_level}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 bg-transparent text-stone-800 focus:outline-none appearance-none cursor-pointer transition-all duration-200"
                    disabled={loading}
                    required
                  >
                    <option value="" className="text-stone-500">Pilih Kelas Anda</option>
                    <option value="1">Kelas X</option>
                    <option value="2">Kelas XI</option>
                    <option value="3">Kelas XII</option>
                  </select>
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-500 pointer-events-none text-lg">▼</span>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="animate-slide-up animation-delay-600">
              <label className="block text-sm font-semibold text-amber-800 mb-2">
                Password
              </label>
              <div className="flex items-center border-2 border-amber-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition-all duration-200">
                <div className="flex-shrink-0 flex items-center justify-center px-4 py-3.5 border-r border-amber-200">
                  <span className="text-2xl text-amber-500">🔒</span>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-transparent text-stone-800 placeholder-amber-300 focus:outline-none transition-all duration-200"
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="animate-slide-up animation-delay-700">
              <label className="block text-sm font-semibold text-amber-800 mb-2">
                Konfirmasi Password
              </label>
              <div className="flex items-center border-2 border-amber-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition-all duration-200">
                <div className="flex-shrink-0 flex items-center justify-center px-4 py-3.5 border-r border-amber-200">
                  <span className="text-2xl text-amber-500">🔐</span>
                </div>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-transparent text-stone-800 placeholder-amber-300 focus:outline-none transition-all duration-200"
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-bold py-3.5 rounded-xl hover:from-amber-700 hover:to-amber-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-amber-500/30 animate-slide-up animation-delay-800 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sedang memproses...
                </span>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-amber-600 font-medium rounded-full border border-amber-200">sudah punya akun?</span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-stone-600 text-sm animate-slide-up animation-delay-900">
            <Link href="/login" className="text-amber-700 font-bold hover:text-amber-900 transition-colors duration-200 underline decoration-2 underline-offset-2 hover:decoration-amber-500">
              Masuk di sini
            </Link>
          </p>
        </div>

        {/* Footer Text */}
        <p className="text-center text-amber-700/60 text-xs mt-8 animate-slide-up animation-delay-1000">
          © 2026 READPOINT - Platform Literasi Digital
        </p>
      </div>
    </div>
  );
}
