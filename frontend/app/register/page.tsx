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
    <main className="relative min-h-screen overflow-hidden bg-[#FAF3E0] px-4 py-8 text-[#2D2D2D] sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#F4B400]/25 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#2E7D32]/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/45 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 shadow-2xl shadow-[#1E3A5F]/15 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-[#1E3A5F] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-black text-[#1E3A5F]">
                  RP
                </div>
                <div>
                  <p className="text-2xl font-black">READPOINT</p>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#F4B400]">Literasi Digital</p>
                </div>
              </Link>

              <div className="mt-16">
                <p className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-black text-[#F4B400]">
                  Akun siswa baru
                </p>
                <h1 className="text-5xl font-black leading-tight">
                  Daftar dan mulai kumpulkan poin membaca.
                </h1>
                <p className="mt-5 max-w-md leading-8 text-white/75">
                  Buat akun siswa untuk membaca e-book, menyelesaikan kuis, memantau progres, dan menukar poin dengan reward.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {['Pilih buku sesuai minat', 'Kerjakan kuis pemahaman', 'Tukar poin dengan reward'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-3xl bg-white/10 p-4 backdrop-blur">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F4B400] text-sm font-black text-[#1E3A5F]">✓</div>
                  <p className="text-sm font-bold text-white/85">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-12">
            <div className="mx-auto w-full max-w-xl">
              <div className="mb-8 text-center lg:text-left">
                <Link href="/" className="mb-6 inline-flex items-center gap-3 lg:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1E3A5F] text-sm font-black text-white">
                    RP
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-black text-[#1E3A5F]">READPOINT</p>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2E7D32]">Literasi Digital</p>
                  </div>
                </Link>

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E6D8B8] bg-[#FAF3E0] px-4 py-2 text-sm font-black text-[#1E3A5F]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2E7D32]" />
                  Daftar akun siswa
                </div>
                <h2 className="text-3xl font-black text-[#1E3A5F] sm:text-4xl">Buat akun READPOINT</h2>
                <p className="mt-3 leading-7 text-[#5A5146]">
                  Lengkapi data berikut untuk masuk ke dashboard siswa dan mulai perjalanan literasi.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
                  <p className="flex items-center gap-2 text-sm font-black">
                    <span>⚠️</span> Terjadi Kesalahan
                  </p>
                  <p className="mt-1 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Nama Lengkap" icon="👤">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-transparent px-4 py-4 text-[#2D2D2D] placeholder:text-[#9B8A72] focus:outline-none"
                      placeholder="Nama Anda"
                      disabled={loading}
                      required
                    />
                  </Field>

                  <Field label="Email" icon="✉️">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-transparent px-4 py-4 text-[#2D2D2D] placeholder:text-[#9B8A72] focus:outline-none"
                      placeholder="nama@email.com"
                      disabled={loading}
                      required
                    />
                  </Field>
                </div>

                <Field label="Kelas" icon="🎓">
                  <div className="relative w-full">
                    <select
                      name="grade_level"
                      value={formData.grade_level}
                      onChange={handleChange}
                      className="w-full cursor-pointer appearance-none bg-transparent px-4 py-4 text-[#2D2D2D] focus:outline-none"
                      disabled={loading}
                      required
                    >
                      <option value="">Pilih Kelas Anda</option>
                      <option value="1">Kelas X</option>
                      <option value="2">Kelas XI</option>
                      <option value="3">Kelas XII</option>
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#2E7D32]">▼</span>
                  </div>
                </Field>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Password" icon="🔒">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-transparent px-4 py-4 text-[#2D2D2D] placeholder:text-[#9B8A72] focus:outline-none"
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                  </Field>

                  <Field label="Konfirmasi Password" icon="🔐">
                    <input
                      type="password"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className="w-full bg-transparent px-4 py-4 text-[#2D2D2D] placeholder:text-[#9B8A72] focus:outline-none"
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#2E7D32] px-6 py-4 text-sm font-black text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:-translate-y-0.5 hover:bg-[#256A2A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Sedang memproses...
                    </span>
                  ) : (
                    'Daftar Sekarang'
                  )}
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#E6D8B8]" />
                <span className="rounded-full bg-[#FAF3E0] px-4 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#5A5146]">sudah punya akun?</span>
                <div className="h-px flex-1 bg-[#E6D8B8]" />
              </div>

              <p className="text-center text-sm font-semibold text-[#5A5146]">
                <Link href="/login" className="font-black text-[#2E7D32] underline decoration-2 underline-offset-4 transition-colors hover:text-[#1E3A5F]">
                  Masuk di sini
                </Link>
              </p>

              <p className="mt-8 text-center text-xs font-semibold text-[#9B8A72]">
                © 2026 READPOINT - Platform Literasi Digital
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-[#1E3A5F]">{label}</label>
      <div className="flex items-center rounded-2xl border border-[#E6D8B8] bg-white transition-all focus-within:border-[#2E7D32] focus-within:ring-4 focus-within:ring-[#2E7D32]/10">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center border-r border-[#E6D8B8] text-xl">{icon}</div>
        {children}
      </div>
    </div>
  );
}
