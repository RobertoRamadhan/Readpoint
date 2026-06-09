'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpenCheck,
  Eye,
  EyeOff,
  GraduationCap,
  Library,
  LockKeyhole,
  Mail,
  School,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  grade_level: string;
  class_name: string;
  role: 'siswa';
};

const initialFormData: RegisterFormData = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  grade_level: '',
  class_name: '',
  role: 'siswa',
};

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.grade_level) {
      setError('Semua field wajib harus diisi');
      return;
    }

    if (formData.name.length < 3) {
      setError('Nama minimal 3 karakter');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError('Password tidak sesuai');
      return;
    }

    setLoading(true);

    try {
      const response = await api.register(formData);

      if (response.user && response.token) {
        login(response.user, response.token);
        router.push('/dashboard');
      } else {
        throw new Error('Respons server tidak valid');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Pendaftaran gagal';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-100 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[minmax(360px,0.82fr)_minmax(0,1.18fr)]">
        <section
          className="relative hidden overflow-hidden bg-slate-950 bg-cover bg-center lg:flex"
          style={{ backgroundImage: 'url("/perpus.jpg")' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/92 via-slate-950/68 to-emerald-950/44" />
          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-10 xl:p-12">
            <Link href="/" className="inline-flex items-center gap-3 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-2xl">
                <Library size={22} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span className="text-lg font-black tracking-wide">READPOINT</span>
            </Link>

            <div className="max-w-xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase text-emerald-100 backdrop-blur">
                <BookOpenCheck size={16} aria-hidden="true" />
                Akun siswa
              </p>
              <h1 className="text-5xl font-black leading-none text-white xl:text-6xl">
                Mulai kebiasaan membaca yang terukur.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-slate-100/85">
                Daftar sekali, lalu siswa dapat membaca e-book, mengerjakan kuis, dan mengumpulkan poin reward dari dashboard yang sama.
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur">
              <p className="text-sm font-black uppercase text-emerald-100">Alur cepat</p>
              <div className="mt-3 grid grid-cols-3 gap-3 text-xs font-bold text-slate-200">
                <span>Baca</span>
                <span>Kuis</span>
                <span>Reward</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10 xl:px-14">
          <div className="w-full max-w-[680px]">
            <Link href="/" className="mb-6 inline-flex items-center gap-3 text-slate-950 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-lg shadow-emerald-700/20">
                <Library size={20} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span className="font-black">READPOINT</span>
            </Link>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80 sm:p-8">
              <div className="mb-7">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Pendaftaran</p>
                <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                  Daftar akun siswa
                </h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
                  Lengkapi data berikut agar akun dapat langsung masuk ke dashboard siswa.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    icon={<User size={19} aria-hidden="true" />}
                    label="Nama lengkap"
                    name="name"
                    type="text"
                    value={formData.name}
                    placeholder="Nama lengkap"
                    autoComplete="name"
                    loading={loading}
                    onChange={handleChange}
                  />

                  <TextField
                    icon={<Mail size={19} aria-hidden="true" />}
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    loading={loading}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-slate-800">Tingkat kelas</span>
                    <div className="relative">
                      <GraduationCap
                        size={19}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                      />
                      <select
                        name="grade_level"
                        value={formData.grade_level}
                        onChange={handleChange}
                        className="h-14 w-full appearance-none rounded-2xl border border-slate-300 bg-white px-4 py-3 pl-12 text-base font-semibold text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                        disabled={loading}
                        required
                      >
                        <option value="">Pilih kelas</option>
                        <option value="1">Kelas X</option>
                        <option value="2">Kelas XI</option>
                        <option value="3">Kelas XII</option>
                      </select>
                    </div>
                  </label>

                  <TextField
                    icon={<School size={19} aria-hidden="true" />}
                    label="Nama kelas"
                    name="class_name"
                    type="text"
                    value={formData.class_name}
                    placeholder="Contoh: X-A"
                    autoComplete="off"
                    loading={loading}
                    onChange={handleChange}
                    required={false}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <PasswordField
                    label="Password"
                    name="password"
                    value={formData.password}
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    loading={loading}
                    show={showPassword}
                    onToggle={() => setShowPassword((value) => !value)}
                    onChange={handleChange}
                  />

                  <PasswordField
                    label="Konfirmasi password"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    placeholder="Ulangi password"
                    autoComplete="new-password"
                    loading={loading}
                    show={showConfirmation}
                    onToggle={() => setShowConfirmation((value) => !value)}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-base font-black text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Memproses...' : 'Daftar'}
                  {!loading && <ArrowRight size={18} aria-hidden="true" />}
                </button>
              </form>

              <p className="mt-7 text-center text-sm font-semibold text-slate-600">
                Sudah punya akun?{' '}
                <Link href="/login" className="font-black text-emerald-700 hover:text-emerald-800">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function TextField({
  icon,
  label,
  name,
  type,
  value,
  placeholder,
  autoComplete,
  loading,
  onChange,
  required = true,
}: {
  icon: React.ReactNode;
  label: string;
  name: keyof RegisterFormData;
  type: 'text' | 'email';
  value: string;
  placeholder: string;
  autoComplete: string;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-800">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pl-12 text-base font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={loading}
          required={required}
        />
      </div>
    </label>
  );
}

function PasswordField({
  label,
  name,
  value,
  placeholder,
  autoComplete,
  loading,
  show,
  onToggle,
  onChange,
}: {
  label: string;
  name: 'password' | 'password_confirmation';
  value: string;
  placeholder: string;
  autoComplete: string;
  loading: boolean;
  show: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-800">{label}</span>
      <div className="relative">
        <LockKeyhole
          size={19}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pl-12 pr-12 text-base font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 disabled:cursor-not-allowed disabled:bg-slate-50"
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={loading}
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
        >
          {show ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      </div>
    </label>
  );
}
