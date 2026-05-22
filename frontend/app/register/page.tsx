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
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-5 py-12 sm:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-900">RP</div>
                <div>
                  <p className="text-xl font-black text-white">READPOINT</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Literasi Digital</p>
                </div>
              </Link>

              <div className="mt-20 max-w-md">
                <p className="text-sm font-black uppercase tracking-widest text-emerald-300">Register</p>
                <h1 className="mt-5 text-4xl font-black leading-tight text-white">Buat akun READPOINT.</h1>
                <p className="mt-6 leading-8 text-slate-300">Daftar sebagai siswa untuk mulai membaca e-book, mengerjakan kuis, dan mengumpulkan poin.</p>
              </div>
            </div>

            <div className="space-y-4">
              {['Membaca e-book', 'Mengerjakan kuis', 'Mengumpulkan poin'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-sm font-black text-white">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex min-h-[760px] items-center justify-center px-5 py-12 sm:px-8 lg:px-14">
            <div className="w-full max-w-xl">
              <div className="mb-10 text-center lg:text-left">
                <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">RP</div>
                  <div className="text-left">
                    <p className="text-xl font-black text-slate-900">READPOINT</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Literasi Digital</p>
                  </div>
                </Link>

                <p className="text-sm font-black uppercase tracking-widest text-emerald-700">Akun Siswa</p>
                <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">Daftar akun baru</h2>
                <p className="mt-4 leading-7 text-slate-600">Lengkapi data berikut untuk membuat akun READPOINT.</p>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Nama Lengkap">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-professional"
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
                      className="input-professional"
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
                    className="input-professional"
                    disabled={loading}
                    required
                  >
                    <option value="">Pilih kelas</option>
                    <option value="1">Kelas X</option>
                    <option value="2">Kelas XI</option>
                    <option value="3">Kelas XII</option>
                  </select>
                </Field>

                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="Password">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-professional"
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
                      className="input-professional"
                      placeholder="Ulangi password"
                      disabled={loading}
                      required
                    />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-14 w-full rounded-2xl bg-emerald-700 px-6 text-sm font-black text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Memproses...' : 'Daftar'}
                </button>
              </form>

              <div className="my-8 h-px w-full bg-slate-200" />

              <p className="text-center text-sm font-semibold text-slate-600">
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
      <label className="mb-2 block text-sm font-black text-slate-800">{label}</label>
      {children}
    </div>
  );
}
