'use client';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageLoading, ProfileCard, Card, RippleButton } from '@/components/shared';

export default function GuruProfilePage() {
  const { user, loading, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    current_password: '',
    new_password: '',
    password_confirmation: '',
    avatar: null as File | null,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || loading || !isAuthenticated) return;
    if (!user || user.role !== 'guru') { router.push('/login'); return; }
    setFormData({ name: user.name, email: user.email, current_password: '', new_password: '', password_confirmation: '', avatar: null });
  }, [mounted, loading, isAuthenticated, user, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, avatar: file });
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!formData.name || !formData.email) { setError('Nama dan email harus diisi'); return; }
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      if (formData.avatar) fd.append('avatar', formData.avatar);
      await api.users.update(user!.id, fd);
      setSuccess('Profil berhasil diperbarui');
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui profil');
    } finally { setSubmitting(false); }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!formData.current_password || !formData.new_password) { setError('Semua field password harus diisi'); return; }
    if (formData.new_password !== formData.password_confirmation) { setError('Password baru tidak cocok'); return; }
    try {
      setSubmitting(true);
      await api.users.update(user!.id, {
        current_password: formData.current_password,
        password: formData.new_password,
        password_confirmation: formData.password_confirmation,
      });
      setSuccess('Password berhasil diperbarui');
      setFormData({ ...formData, current_password: '', new_password: '', password_confirmation: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui password');
    } finally { setSubmitting(false); }
  };

  if (!mounted || loading) return <PageLoading />;
  if (!isAuthenticated || !user || user.role !== 'guru') return null;

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-amber-50 border-2 border-amber-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition text-sm disabled:opacity-60';

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-black text-amber-900 mb-6 flex items-center gap-2">
          <span>⚙️</span> Pengaturan Profil
        </h1>

        {error && (
          <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm font-medium">
            <span className="text-lg">⚠️</span><span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-5 flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-xl text-green-700 text-sm font-medium">
            <span className="text-lg">✅</span><span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ProfileCard */}
          <div className="lg:col-span-1 flex flex-col items-center gap-4">
            <ProfileCard
              name={user.name}
              role="Guru"
              avatar={avatarPreview || (user as any).profile_photo_url || undefined}
              variant="guru"
              buttonText="Ganti Foto"
              onButtonClick={() => document.getElementById('guru-avatar-input')?.click()}
            />
            <input id="guru-avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <p className="text-xs text-amber-600 text-center">Klik "Ganti Foto" untuk mengubah foto profil</p>
          </div>

          {/* Forms */}
          <div className="lg:col-span-2 space-y-6">
            <Card padding="lg" shadow="md">
              <h2 className="text-xl font-black text-amber-900 mb-5 flex items-center gap-2">
                <span>👤</span> Informasi Profil
              </h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-amber-900 mb-1.5">Nama Lengkap</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-amber-900 mb-1.5">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} required />
                </div>
                <div className="flex justify-end pt-2">
                  <RippleButton type="submit" variant="primary" loading={submitting} disabled={submitting}>
                    {submitting ? 'Menyimpan...' : '💾 Simpan Profil'}
                  </RippleButton>
                </div>
              </form>
            </Card>

            <Card padding="lg" shadow="md">
              <h2 className="text-xl font-black text-amber-900 mb-5 flex items-center gap-2">
                <span>🔐</span> Ubah Password
              </h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-amber-900 mb-1.5">Password Saat Ini</label>
                  <input type="password" value={formData.current_password} onChange={(e) => setFormData({ ...formData, current_password: e.target.value })} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-amber-900 mb-1.5">Password Baru</label>
                  <input type="password" value={formData.new_password} onChange={(e) => setFormData({ ...formData, new_password: e.target.value })} className={inputClass} required minLength={6} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-amber-900 mb-1.5">Konfirmasi Password Baru</label>
                  <input type="password" value={formData.password_confirmation} onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })} className={inputClass} required minLength={6} />
                </div>
                <div className="flex justify-end pt-2">
                  <RippleButton type="submit" variant="danger" loading={submitting} disabled={submitting}>
                    {submitting ? 'Menyimpan...' : '🔑 Ubah Password'}
                  </RippleButton>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
