'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AuthForm } from '@/components/auth';

/**
 * CONTOH REGISTER PAGE MENGGUNAKAN AUTHFORM COMPONENT
 * Dengan style elegan dari Uiverse yang disesuaikan dengan brand READPOINT
 * 
 * Untuk menggunakan: uncomment kode di bawah dan replace RegisterPage di page.tsx
 */

export default function RegisterPageWithAuthForm() {
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    grade_level: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formValues.password !== formValues.password_confirmation) {
      setError('Password tidak sesuai');
      return;
    }

    if (!formValues.grade_level) {
      setError('Kelas harus dipilih');
      return;
    }

    setLoading(true);

    try {
      const response = await api.register({
        ...formValues,
        role: 'siswa',
      } as any);
      
      if (response.user && response.token) {
        setSuccess('Pendaftaran berhasil! Mengalihkan...');
        login(response.user, response.token);
        setTimeout(() => router.push('/dashboard'), 1500);
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

  const formFields = [
    {
      name: 'name',
      label: 'Nama Lengkap',
      type: 'text' as const,
      placeholder: 'Nama Anda',
      icon: '👤',
      required: true,
    },
    {
      name: 'email',
      label: 'Alamat Email',
      type: 'email' as const,
      placeholder: 'nama@email.com',
      icon: '✉️',
      required: true,
    },
    {
      name: 'grade_level',
      label: 'Kelas',
      type: 'select' as const,
      placeholder: 'Pilih Kelas',
      icon: '📚',
      required: true,
      options: [
        { value: '10', label: 'Kelas 10' },
        { value: '11', label: 'Kelas 11' },
        { value: '12', label: 'Kelas 12' },
      ],
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password' as const,
      placeholder: '••••••••',
      icon: '🔒',
      required: true,
    },
    {
      name: 'password_confirmation',
      label: 'Konfirmasi Password',
      type: 'password' as const,
      placeholder: '••••••••',
      icon: '🔐',
      required: true,
    },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header Logo */}
        <div className="flex justify-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl shadow-xl">
            <span className="text-3xl font-bold text-white">R</span>
          </div>
        </div>

        {/* Auth Form Component */}
        <AuthForm
          title="Daftar READPOINT"
          subtitle="Mulai petualangan literasi digital Anda sekarang"
          fields={formFields}
          values={formValues}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitButtonText="Daftar Sekarang"
          loading={loading}
          error={error}
          successMessage={success}
          bottomText={{
            text: 'Sudah punya akun?',
            linkText: 'Masuk di sini',
            href: '/login'
          }}
        />

        {/* Footer */}
        <p className="text-center text-amber-700/60 text-xs mt-8 animate-slide-up animation-delay-700">
          © 2026 READPOINT - Platform Literasi Digital
        </p>
      </div>
    </div>
  );
}
