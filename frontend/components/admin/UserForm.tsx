'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Card } from '@/components/shared';

interface FormData {
  name: string;
  email: string;
  role: 'admin' | 'guru' | 'siswa';
  class_name?: string;
  password?: string;
  is_active: boolean;
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: unknown) => Promise<void>;
  editingUser?: unknown;
  loading?: boolean;
}

export default function UserForm({
  isOpen,
  onClose,
  onSubmit,
  editingUser,
  loading = false
}: UserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: 'siswa',
    class_name: '',
    password: '',
    is_active: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (editingUser) {
        setFormData({
          ...(editingUser as Partial<FormData>),
          password: '' // Don't populate password in edit mode
        });
      } else {
        setFormData({
          name: '',
          email: '',
          role: 'siswa',
          class_name: '',
          password: '',
          is_active: true
        });
      }
      setErrors({});
    }, 0);

    return () => window.clearTimeout(t);
  }, [editingUser, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!editingUser && !formData.password) {
      newErrors.password = 'Password harus diisi untuk user baru';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (formData.role === 'siswa' && !formData.class_name?.trim()) {
      newErrors.class_name = 'Kelas harus diisi untuk siswa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof FormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="space-y-6">
        <h3 className="text-xl font-black text-gray-900">
          {editingUser ? '✏️ Edit User' : '➕ Tambah User Baru'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan nama lengkap"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 font-semibold">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="nama@email.com"
              disabled={!!editingUser} // Don't allow email change for existing users
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 font-semibold">{errors.email}</p>
            )}
            {editingUser && (
              <p className="mt-1 text-xs text-gray-500 font-semibold">
                Email tidak dapat diubah untuk user yang sudah ada
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900"
            >
              <option value="siswa">Siswa</option>
              <option value="guru">Guru</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Class Name (for Siswa) */}
          {formData.role === 'siswa' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Kelas
              </label>
              <input
                type="text"
                value={formData.class_name || ''}
                onChange={(e) => handleChange('class_name', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900 ${
                  errors.class_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Contoh: X-A, XI-B, XII-C"
              />
              {errors.class_name && (
                <p className="mt-1 text-sm text-red-600 font-semibold">{errors.class_name}</p>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password {editingUser && '(kosongkan untuk tidak mengubah)'}
            </label>
            <input
              type="password"
              value={formData.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-blue-500 font-semibold text-gray-900 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={editingUser ? 'Kosongkan jika tidak ingin mengubah' : 'Minimal 6 karakter'}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 font-semibold">{errors.password}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm font-bold text-gray-700">
              User Aktif
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : (editingUser ? 'Update' : 'Tambah')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
