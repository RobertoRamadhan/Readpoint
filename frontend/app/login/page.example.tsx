'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AuthForm } from '@/components/auth';

/**
 * CONTOH LOGIN PAGE MENGGUNAKAN AUTHFORM COMPONENT
 * Dengan style elegan dari Uiverse yang disesuaikan dengan brand READPOINT
 * 
 * Untuk menggunakan: uncomment kode di bawah dan replace LoginPage di page.tsx
 */

export default function LoginPageWithAuthForm() {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
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
    setLoading(true);

    try {
      const response = await api.login({ 
        email: formValues.email, 
        password: formValues.password 
      });
      
      if (response.user && response.token) {
        setSuccess('Login berhasil! Mengalihkan...');
        login(response.user, response.token);
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      name: 'email',
      label: 'Alamat Email',
      type: 'email' as const,
      placeholder: 'nama@email.com',
      icon: '✉️',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password' as const,
      placeholder: '••••••••',
      icon: '🔒',
      required: true,
    },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
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
          title="Masuk ke READPOINT"
          subtitle="Lanjutkan perjalanan literasi digital Anda"
          fields={formFields}
          values={formValues}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitButtonText="Masuk Sekarang"
          loading={loading}
          error={error}
          successMessage={success}
          bottomText={{
            text: 'Belum punya akun?',
            linkText: 'Daftar di sini',
            href: '/register'
          }}
          socialButtons={[
            {
              icon: '👥',
              text: 'Masuk sebagai Guru',
              onClick: () => console.log('Guru login'),
            },
            {
              icon: '🔑',
              text: 'Masuk sebagai Admin',
              onClick: () => console.log('Admin login'),
            },
          ]}
        />

        {/* Footer */}
        <p className="text-center text-amber-700/60 text-xs mt-8 animate-slide-up animation-delay-700">
          © 2026 READPOINT - Platform Literasi Digital
        </p>
      </div>
    </div>
  );
}
