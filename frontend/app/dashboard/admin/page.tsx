'use client';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import { normalizeFileUrl } from '@/lib/file-url';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  ClipboardList,
  Gift,
  GraduationCap,
  Library,
  ListChecks,
  PackageCheck,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';

interface AdminStats {
  total_siswa?: number;
  total_guru?: number;
  total_ebook?: number;
  total_reward?: number;
  siswa_aktif_hari_ini?: number;
  buku_dibaca_hari_ini?: number;
  kuis_dikerjakan_hari_ini?: number;
  reward_diklaim_hari_ini?: number;
}

interface Ebook {
  id: number;
  title: string;
  author: string;
  pages: number;
  category: string;
  is_active: boolean;
  poin_per_halaman?: number;
  cover_image?: string;
  pdf_file?: string;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  stock: number;
  is_active: boolean;
  image?: string;
  icon?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  class_name?: string;
}

interface TopStudent {
  id: number;
  name: string;
  email: string;
  total_points?: number;
}

const adminTabs = new Set(['beranda', 'ebooks', 'rewards', 'users', 'pengaturan']);

function normalizeAdminTab(tab: string | null) {
  return tab && adminTabs.has(tab) ? tab : 'beranda';
}

export default function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [mounted, setMounted] = useState(false);
  const activeTab = normalizeAdminTab(tabParam);
  const [stats, setStats] = useState<AdminStats>({});
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, user?.role, router]);

  // Fetch admin stats
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      const fetchStats = async () => {
        try {
          setDataLoading(true);
          const [statsRes, topStudentsRes] = await Promise.all([
            api.dashboard.adminStats(),
            api.dashboard.adminTopStudents(),
          ]);
          // adminStats returns flat JSON, not wrapped in {data: ...}
          setStats((statsRes?.data as any) || statsRes || {});
          // adminTopStudents returns array directly at top level
          const topStudentsData = (topStudentsRes as any)?.data || topStudentsRes;
          setTopStudents((Array.isArray(topStudentsData) ? topStudentsData : []) as TopStudent[]);
        } catch (err) {
          console.error('Error fetching stats:', err);
          setError('Gagal memuat data');
        } finally {
          setDataLoading(false);
        }
      };
      fetchStats();
    }
  }, [isAuthenticated, user?.role]);

  if (loading || !mounted || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="flex w-full">
      {/* Hamburger Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-16 left-4 z-40 p-2 bg-emerald-900 text-white rounded-lg hover:bg-emerald-800 transition-all md:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Backdrop - Mobile Only */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden top-14"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* New Sidebar Component with Dropdown */}
        <AdminSidebar
          activeTab={activeTab}
          sidebarOpen={sidebarOpen}
          onTabChange={() => {}}
          onCloseSidebar={() => setSidebarOpen(false)}
          role="admin"
          user={user}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8">
            {error && (
              <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl shadow-sm">
                <p className="font-bold">Kesalahan: {error}</p>
              </div>
            )}

            {/* Beranda Tab */}
            {activeTab === 'beranda' && (
              <AdminOverviewDashboard stats={stats} topStudents={topStudents} dataLoading={dataLoading} />
            )}

            {/* E-Books Tab */}
            {activeTab === 'ebooks' && <EbookManagementTab />}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && <RewardManagementTab />}

            {/* Users Tab */}
            {activeTab === 'users' && <UserManagementTab />}

            {/* Settings Tab */}
            {activeTab === 'pengaturan' && (
              <div className="p-8">
                <ProfileSettings />
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

// ============== PROFILE SETTINGS ==============
function ProfileSettings() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    current_password: '',
    new_password: '',
    password_confirmation: '',
    avatar: null as File | null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        current_password: '',
        new_password: '',
        password_confirmation: '',
        avatar: null,
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email) {
      setError('Nama dan email harus diisi');
      return;
    }

    try {
      setSubmitting(true);
      
      const uploadFormData = new FormData();
      uploadFormData.append('name', formData.name);
      uploadFormData.append('email', formData.email);
      if (formData.avatar) {
        uploadFormData.append('avatar', formData.avatar);
      }
      
      await api.users.update(user!.id, uploadFormData);
      setSuccess('Profil berhasil diperbarui');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui profil');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.current_password || !formData.new_password) {
      setError('Password saat ini dan password baru harus diisi');
      return;
    }

    if (formData.new_password !== formData.password_confirmation) {
      setError('Password baru tidak cocok dengan konfirmasi');
      return;
    }

    try {
      setSubmitting(true);
      await api.users.update(user!.id, {
        current_password: formData.current_password,
        password: formData.new_password,
        password_confirmation: formData.password_confirmation,
      });
      setSuccess('Password berhasil diperbarui');
      setFormData({
        ...formData,
        current_password: '',
        new_password: '',
        password_confirmation: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Pengaturan Profil</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm shadow-sm">
          <p className="font-semibold flex items-center gap-2">
            <span>⚠️</span> Terjadi Kesalahan
          </p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl text-emerald-800 text-sm shadow-sm">
          <p className="font-semibold flex items-center gap-2">
            <span>✅</span> Berhasil
          </p>
          <p className="mt-1">{success}</p>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Informasi Profil</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {formData.avatar ? (
                <img
                  src={URL.createObjectURL(formData.avatar)}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : user?.profile_photo_url ? (
                <img
                  src={user.profile_photo_url}
                  alt="Current Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                  👤
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Foto Profil</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, avatar: e.target.files?.[0] || null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG. Maksimal 5MB</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Ubah Password</h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password Saat Ini</label>
            <input
              type="password"
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password Baru</label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={formData.password_confirmation}
              onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
              minLength={6}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminOverviewDashboard({ stats, topStudents, dataLoading }: { stats: AdminStats; topStudents: TopStudent[]; dataLoading: boolean }) {
  if (dataLoading) {
    return (
      <div className="grid min-h-[420px] place-items-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-700" />
          <p className="mt-4 text-sm font-black text-emerald-700">Memuat dashboard admin...</p>
        </div>
      </div>
    );
  }

  const totalUsers = (stats.total_siswa || 0) + (stats.total_guru || 0);
  const todayTotal =
    (stats.siswa_aktif_hari_ini || 0) +
    (stats.buku_dibaca_hari_ini || 0) +
    (stats.kuis_dikerjakan_hari_ini || 0) +
    (stats.reward_diklaim_hari_ini || 0);

  const metricCards = [
    { title: 'Total Siswa', value: stats.total_siswa || 0, helper: 'Akun siswa yang sudah terdaftar dan siap dipantau dari dashboard admin.', Icon: GraduationCap, tone: 'emerald' as const },
    { title: 'Total Guru', value: stats.total_guru || 0, helper: 'Pengajar aktif yang mengelola kelas, validasi, dan aktivitas literasi.', Icon: Users, tone: 'blue' as const },
    { title: 'E-Book', value: stats.total_ebook || 0, helper: 'Koleksi bacaan yang sudah tersedia untuk dibaca oleh siswa.', Icon: BookOpen, tone: 'violet' as const },
    { title: 'Reward', value: stats.total_reward || 0, helper: 'Hadiah yang bisa ditukar siswa berdasarkan poin yang mereka kumpulkan.', Icon: Gift, tone: 'amber' as const },
  ];

  const todayCards = [
    { title: 'Siswa Aktif', value: stats.siswa_aktif_hari_ini || 0, Icon: Activity, helper: 'Akun siswa yang aktif membaca atau berinteraksi hari ini.' },
    { title: 'Buku Dibaca', value: stats.buku_dibaca_hari_ini || 0, Icon: Library, helper: 'E-book yang dibuka dan diproses pada hari ini.' },
    { title: 'Kuis Dikerjakan', value: stats.kuis_dikerjakan_hari_ini || 0, Icon: ListChecks, helper: 'Attempt kuis yang masuk sepanjang hari ini.' },
    { title: 'Reward Diklaim', value: stats.reward_diklaim_hari_ini || 0, Icon: PackageCheck, helper: 'Penukaran hadiah yang berhasil diproses hari ini.' },
  ];

  return (
    <div className="w-full space-y-6 lg:space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-black uppercase text-emerald-100">
              <Sparkles size={16} aria-hidden="true" />
              Dashboard Admin
            </p>
            <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight text-white lg:text-5xl">
              Kontrol literasi sekolah dalam satu panel.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 lg:text-base">
              Pantau siswa, guru, e-book, reward, dan aktivitas harian READPOINT tanpa perlu pindah halaman. Ringkasan di bawah membantu admin melihat kondisi sistem dengan cepat.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Aktivitas Hari Ini</p>
                <p className="mt-2 text-4xl font-black leading-none text-white">{todayTotal.toLocaleString('id-ID')}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-right">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">Total akun</p>
                <p className="mt-1 text-lg font-black text-white">{totalUsers.toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {todayCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="whitespace-nowrap text-[11px] font-black uppercase tracking-[0.16em] text-slate-300">
                      {card.title}
                    </p>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-emerald-200">
                      <card.Icon size={16} aria-hidden="true" />
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-black leading-none text-white">{card.value.toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-[72%] rounded-full bg-emerald-400" />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {totalUsers.toLocaleString('id-ID')} total akun terkelola aktif di sistem.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <AdminMetricCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase text-emerald-700">Monitoring</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">Aktivitas hari ini</h2>
            </div>
            <Activity className="h-8 w-8 text-emerald-700" aria-hidden="true" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {todayCards.map((card) => (
              <AdminTodayCard key={card.title} {...card} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase text-emerald-700">Leaderboard</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">Siswa teratas</h2>
            </div>
            <Trophy className="h-8 w-8 text-amber-500" aria-hidden="true" />
          </div>

          <div className="mt-5 space-y-3">
            {topStudents.length > 0 ? (
              topStudents.slice(0, 5).map((student, index) => (
                <div key={student.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">{student.name}</p>
                      <p className="truncate text-xs font-semibold text-slate-500">{student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-700">{(student.total_points || 0).toLocaleString('id-ID')}</p>
                    <p className="text-[11px] font-bold text-slate-500">poin</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm font-bold text-slate-500">Belum ada data siswa</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <AdminPriorityCard Icon={BookOpen} title="Koleksi Buku" description="Pastikan cover, PDF, dan poin baca sudah lengkap sebelum buku dipublikasikan ke siswa." />
        <AdminPriorityCard Icon={Gift} title="Reward Sekolah" description="Pantau stok hadiah agar penukaran siswa tetap lancar setiap hari." />
        <AdminPriorityCard Icon={ClipboardList} title="Data Pengguna" description="Rapikan akun siswa, guru, dan admin sesuai kelas, peran, dan kebutuhan operasional." />
      </section>
    </div>
  );
}

function AdminMetricCard({
  title,
  value,
  helper,
  Icon,
  tone,
}: {
  title: string;
  value: number;
  helper: string;
  Icon: LucideIcon;
  tone: 'emerald' | 'blue' | 'violet' | 'amber';
}) {
  const toneClass = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    violet: 'bg-violet-50 text-violet-700',
    amber: 'bg-amber-50 text-amber-700',
  }[tone];

  return (
    <article className="relative min-h-[210px] overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <div className={`absolute right-5 top-5 grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${toneClass}`}>
        <Icon size={22} aria-hidden="true" />
      </div>
      <div className="min-w-0 pr-16">
        <p className="whitespace-nowrap text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{title}</p>
        <p className="mt-3 text-4xl font-black leading-none text-slate-950 lg:text-[2.9rem]">
          {value.toLocaleString('id-ID')}
        </p>
      </div>
      <p className="mt-5 max-w-[18rem] text-sm leading-6 text-slate-500">{helper}</p>
      <div className="mt-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Terupdate real-time
      </div>
    </article>
  );
}

function AdminTodayCard({ title, value, Icon, helper }: { title: string; value: number; Icon: LucideIcon; helper: string }) {
  return (
    <div className="min-h-[160px] rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="whitespace-nowrap text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-black leading-none text-slate-950">{value.toLocaleString('id-ID')}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{helper}</p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm">
          <Icon size={20} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function AdminPriorityCard({ Icon, title, description }: { Icon: LucideIcon; title: string; description: string }) {
  return (
    <article className="group min-h-[180px] rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-emerald-200">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <Icon size={22} aria-hidden="true" />
        </div>
        <ArrowUpRight size={18} className="text-slate-300 transition group-hover:text-emerald-700" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{description}</p>
    </article>
  );
}

// ============== OVERVIEW TAB ==============
function OverviewTab({ stats, topStudents, dataLoading }: { stats: AdminStats; topStudents: TopStudent[]; dataLoading: boolean }) {
  if (dataLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block">
          <div className="w-14 h-14 border-4 border-blue-400 border-t-blue-700 rounded-full animate-spin"></div>
        </div>
        <p className="text-blue-700 font-bold mt-4 text-lg">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 w-full">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Siswa */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-bold mb-1">Total Siswa</p>
              <p className="text-4xl font-black text-blue-900">{stats.total_siswa || 0}</p>
            </div>
            <div className="text-5xl opacity-30">👨‍🎓</div>
          </div>
        </div>

        {/* Total Guru */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-700 text-sm font-bold mb-1">Total Guru</p>
              <p className="text-4xl font-black text-emerald-900">{stats.total_guru || 0}</p>
            </div>
            <div className="text-5xl opacity-30">👨‍🏫</div>
          </div>
        </div>

        {/* Total Buku */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-700 text-sm font-bold mb-1">Total Buku</p>
              <p className="text-4xl font-black text-amber-900">{stats.total_ebook || 0}</p>
            </div>
            <div className="text-5xl opacity-30">📚</div>
          </div>
        </div>

        {/* Total Kuis */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 text-sm font-bold mb-1">Total Kuis</p>
              <p className="text-4xl font-black text-purple-900">0</p>
            </div>
            <div className="text-5xl opacity-30">✅</div>
          </div>
        </div>

        {/* Total Reward */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 border-2 border-pink-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-700 text-sm font-bold mb-1">Total Hadiah</p>
              <p className="text-4xl font-black text-pink-900">{stats.total_reward || 0}</p>
            </div>
            <div className="text-5xl opacity-30">🎁</div>
          </div>
        </div>

        {/* Penukaran Reward Pending */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-bold mb-1">Penukaran Pending</p>
              <p className="text-4xl font-black text-red-900">0</p>
            </div>
            <div className="text-5xl opacity-30">⏳</div>
          </div>
        </div>
      </div>

      {/* Activity Today Section */}
      <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
          <span>📊</span> Aktivitas Hari Ini
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-blue-700 text-xs font-bold mb-1">Siswa Aktif</p>
            <p className="text-3xl font-bold text-blue-900">{stats.siswa_aktif_hari_ini || 0}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <p className="text-emerald-700 text-xs font-bold mb-1">Buku Dibaca</p>
            <p className="text-3xl font-bold text-emerald-900">{stats.buku_dibaca_hari_ini || 0}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <p className="text-amber-700 text-xs font-bold mb-1">Kuis Dikerjakan</p>
            <p className="text-3xl font-bold text-amber-900">{stats.kuis_dikerjakan_hari_ini || 0}</p>
          </div>
          <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
            <p className="text-pink-700 text-xs font-bold mb-1">Reward Diklaim</p>
            <p className="text-3xl font-bold text-pink-900">{stats.reward_diklaim_hari_ini || 0}</p>
          </div>
        </div>
      </div>

      {/* Top Students Section */}
      <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
          <span>🏆</span> Siswa Terbaik
        </h3>
        {topStudents.length > 0 ? (
          <div className="space-y-3">
            {topStudents.slice(0, 5).map((student, index) => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-600">{student.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-blue-900">{student.total_points || 0}</p>
                  <p className="text-xs text-slate-600">poin</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-600">
            <p>Belum ada data siswa</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
        <h3 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <span>⚡</span> Akses Cepat
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button className="bg-white border-2 border-blue-200 rounded-xl p-4 hover:bg-blue-50 transition-all text-left font-bold text-blue-900">
            📚 Kelola Buku
          </button>
          <button className="bg-white border-2 border-emerald-200 rounded-xl p-4 hover:bg-emerald-50 transition-all text-left font-bold text-emerald-900">
            🎁 Kelola Reward
          </button>
          <button className="bg-white border-2 border-amber-200 rounded-xl p-4 hover:bg-amber-50 transition-all text-left font-bold text-amber-900">
            👥 Kelola User
          </button>
          <button className="bg-white border-2 border-purple-200 rounded-xl p-4 hover:bg-purple-50 transition-all text-left font-bold text-purple-900">
            📋 Lihat Laporan
          </button>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, delay = '0s' }: { title: string; value: number; delay?: string }) {
  return (
    <div
      className="bg-white rounded-xl shadow-md p-8 border border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/20 transition-all hover:border-emerald-300 flex justify-between items-center transform hover:scale-105 animate-scale-up"
      style={{ animationDelay: delay }}
    >
      <div>
        <p className="text-emerald-700 text-sm font-medium mb-2">{title}</p>
        <p className="text-4xl font-bold text-emerald-900">{value}</p>
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ label, value, delay = '0s' }: { label: string; value: number; delay?: string }) {
  const getIcon = (label: string) => {
    if (label.includes('Siswa') || label.includes('Active')) return '👥';
    if (label.includes('Buku') || label.includes('Books')) return '📖';
    if (label.includes('Quiz') || label.includes('Quizzes')) return '✅';
    if (label.includes('Reward') || label.includes('Rewards')) return '🎁';
    return '📊';
  };

  return (
    <div
      className="bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-100 rounded-2xl p-8 text-center text-emerald-900 hover:shadow-2xl hover:from-emerald-50 hover:to-emerald-100 transition-all transform hover:scale-105 animate-scale-up relative overflow-hidden group border-2 border-emerald-200"
      style={{ animationDelay: delay }}
    >
      {/* Icon */}
      <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
        {getIcon(label)}
      </div>
      
      {/* Label */}
      <p className="text-xs font-bold mb-3 uppercase tracking-widest opacity-80">{label}</p>
      
      {/* Value */}
      <p className="text-5xl font-black drop-shadow-lg text-emerald-900">{value}</p>
    </div>
  );
}

// ============== EBOOK MANAGEMENT TAB ==============
function EbookManagementTab() {
  const [data, setData] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null);

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      console.log('[EbookManagementTab] Fetching ebooks...');
      const response = await api.dashboard.adminBooks();
      console.log('[EbookManagementTab] Response:', response);
      const ebookList = (response.data || []) as Ebook[];
      console.log('[EbookManagementTab] Ebooks loaded:', ebookList.length);
      setData(ebookList);
    } catch (err) {
      console.error('[EbookManagementTab] Error fetching ebooks:', err);
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin?')) return;
    try {
      console.log(`[EbookDelete] Deleting ebook ${id}...`);
      const result = await api.ebooks.delete?.(id);
      console.log('[EbookDelete] Delete result:', result);
      setError('');
      // Wait 1 second to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchEbooks();
    } catch (err) {
      console.error('[EbookDelete] Error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Gagal menghapus e-book';
      console.error('[EbookDelete] Error message:', errorMsg);
      setError(errorMsg);
    }
  };

  const handleEdit = (ebook: Ebook) => {
    console.log('[EbookManagementTab] Editing ebook:', ebook);
    setEditingEbook(ebook);
    setShowForm(true);
    // Scroll to top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  const handleFormSuccess = async () => {
    console.log('[EbookManagementTab] Form success, refreshing ebooks...');
    setShowForm(false);
    setEditingEbook(null);
    // Add delay untuk memastikan data tersimpan di database
    await new Promise(resolve => setTimeout(resolve, 1000));
    await fetchEbooks();
  };

  const filteredData = data.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-4">
          {/* Form Section */}
          {showForm && (
            <div className="mb-8 p-6 bg-emerald-50 border-2 border-emerald-200 rounded-lg max-h-[80vh] overflow-y-auto relative z-50">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-emerald-50 pb-4 z-50">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingEbook ? 'Edit E-Book' : 'Tambah E-Book Baru'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingEbook(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold flex-shrink-0"
                >
                  ✕
                </button>
              </div>
              <EbookForm 
                onSuccess={handleFormSuccess}
                editingEbook={editingEbook}
                onCancel={() => { setShowForm(false); setEditingEbook(null); }}
              />
            </div>
          )}

          {/* Search and Add Button */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Cari e-book..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {!showForm && (
              <button
                onClick={() => {
                  setEditingEbook(null);
                  setShowForm(true);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-bold hover:shadow-lg transition-all"
              >
                + Tambah E-Book
              </button>
            )}
          </div>

          {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map(ebook => (
                <div key={ebook.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
                  <div className="flex gap-4">
                    {/* Left side: Image and PDF */}
                    <div className="flex-shrink-0">
                      {ebook.cover_image ? (
                        <img
                          src={normalizeFileUrl(ebook.cover_image)}
                          alt={ebook.title}
                          className="w-24 h-32 object-cover rounded-lg"
                          onError={(e) => {
                            console.error('[EbookDisplay] Image failed to load:', ebook.cover_image);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-24 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                          📚
                        </div>
                      )}
                      {ebook.pdf_file && (
                        <a
                          href={normalizeFileUrl(ebook.pdf_file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 block w-full text-center px-2 py-1 bg-green-100 text-green-600 rounded text-xs font-bold hover:bg-green-200 transition-all"
                        >
                          📄 PDF
                        </a>
                      )}
                    </div>

                    {/* Right side: Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{ebook.title}</h3>
                          <p className="text-xs text-gray-600 truncate">{ebook.author}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-emerald-700 ml-2`}>
                          {ebook.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1 mb-3">
                        <p>{ebook.pages} halaman</p>
                        <p>🏷️ {ebook.category}</p>
                        <p>⭐ {ebook.poin_per_halaman} poin/halaman</p>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(ebook)}
                          className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded text-xs font-bold hover:bg-emerald-200 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ebook.id)}
                          className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold hover:bg-red-200 transition-all"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EbookForm({ onSuccess, editingEbook, onCancel }: { onSuccess: () => void; editingEbook: Ebook | null; onCancel?: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    pages: 100,
    category: '',
    poin_per_halaman: 5,
    grade_level: '1',
    pdf_file: null as File | null,
    cover_image: null as File | null,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingEbook) {
      setFormData({
        title: editingEbook.title,
        author: editingEbook.author,
        pages: editingEbook.pages,
        category: editingEbook.category,
        poin_per_halaman: editingEbook.poin_per_halaman || 5,
        grade_level: '1',
        pdf_file: null,
        cover_image: null,
      });
    }
  }, [editingEbook]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.author || !formData.category) {
      setError('Semua field teks harus diisi');
      return;
    }

    if (!editingEbook && !formData.pdf_file) {
      setError('PDF file harus diupload');
      return;
    }

    try {
      setSubmitting(true);
      
      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('author', formData.author);
      uploadFormData.append('pages', formData.pages.toString());
      uploadFormData.append('category', formData.category);
      uploadFormData.append('poin_per_halaman', formData.poin_per_halaman.toString());
      uploadFormData.append('grade_level', formData.grade_level);
      if (formData.pdf_file) {
        uploadFormData.append('pdf_file', formData.pdf_file);
      }
      if (formData.cover_image) {
        uploadFormData.append('cover_image', formData.cover_image);
      }

      // Log FormData for debugging
      console.log('[EbookForm] FormData entries:');
      for (let [key, value] of uploadFormData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File "${value.name}" (${value.size} bytes, type: ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      if (editingEbook) {
        console.log(`[EbookForm] Updating ebook ${editingEbook.id}...`);
        const result = await api.ebooks.update?.(editingEbook.id, uploadFormData);
        console.log('[EbookForm] Update result:', result);
        setError('');
        onSuccess();
      } else {
        console.log('[EbookForm] Creating new ebook...');
        const result = await api.ebooks.create(uploadFormData);
        console.log('[EbookForm] Create result:', result);
        setError('');
        onSuccess();
      }
    } catch (err) {
      console.error('[EbookForm] Error uploading ebook:', err);
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold">{error}</div>}
      
      {/* Row 1: Judul & Pengarang */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="w-full">
          <label className="block text-sm font-bold text-gray-700 mb-2">Judul Buku *</label>
          <input
            type="text"
            placeholder="Masukkan judul buku"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-bold text-gray-700 mb-2">Pengarang *</label>
          <input
            type="text"
            placeholder="Masukkan nama pengarang"
            value={formData.author}
            onChange={(e) => setFormData({...formData, author: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Row 2: Halaman & Kategori */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="w-full">
          <label className="block text-sm font-bold text-gray-700 mb-2">Total Halaman *</label>
          <input
            type="number"
            placeholder="Masukkan jumlah halaman"
            value={formData.pages}
            onChange={(e) => setFormData({...formData, pages: parseInt(e.target.value) || 1})}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            min="1"
            required
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-bold text-gray-700 mb-2">Kategori *</label>
          <input
            type="text"
            placeholder="Masukkan kategori buku"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Row 3: Poin per Halaman & Grade Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="w-full">
          <label className="block text-sm font-bold text-gray-700 mb-2">Poin per Halaman *</label>
          <input
            type="number"
            placeholder="Masukkan poin per halaman"
            value={formData.poin_per_halaman}
            onChange={(e) => setFormData({...formData, poin_per_halaman: parseInt(e.target.value) || 1})}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            min="1"
            required
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-bold text-gray-700 mb-2">Grade Level *</label>
          <select
            value={formData.grade_level}
            onChange={(e) => setFormData({...formData, grade_level: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          >
            <option value="1">Grade 1</option>
            <option value="2">Grade 2</option>
            <option value="3">Grade 3</option>
            <option value="all">Semua Grade</option>
          </select>
        </div>
      </div>

      {/* Row 4: PDF File & Gambar Sampul */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="w-full">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            📄 PDF File {editingEbook ? '(Opsional)' : '*'}
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFormData({...formData, pdf_file: e.target.files?.[0] || null})}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required={!editingEbook}
          />
          {formData.pdf_file && (
            <p className="text-xs text-green-600 mt-1 font-semibold">✓ {formData.pdf_file.name}</p>
          )}
        </div>
        <div className="w-full">
          <label className="block text-sm font-bold text-gray-700 mb-2">🖼️ Gambar Sampul</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({...formData, cover_image: e.target.files?.[0] || null})}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {formData.cover_image && (
            <p className="text-xs text-green-600 mt-1 font-semibold">✓ {formData.cover_image.name}</p>
          )}
        </div>
      </div>

      {/* Preview Section */}
      {(formData.cover_image || formData.pdf_file) && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-bold text-gray-700">Preview File:</p>
          {formData.pdf_file && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-2xl">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-blue-700">PDF File</p>
                <p className="text-xs text-blue-600 truncate">{formData.pdf_file.name}</p>
              </div>
            </div>
          )}
          {formData.cover_image && (
            <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
              <div className="w-16 h-20 bg-gray-300 rounded overflow-hidden flex-shrink-0">
                <img 
                  src={URL.createObjectURL(formData.cover_image)} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-700">Gambar Sampul</p>
                <p className="text-xs text-gray-600 truncate">{formData.cover_image.name}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-all"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}

// ============== REWARD MANAGEMENT TAB ==============
function RewardManagementTab() {
  const [data, setData] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      console.log('[RewardManagementTab] Fetching rewards...');
      const response = await api.rewards.list();
      console.log('[RewardManagementTab] Response:', response);
      const rewardList = (response?.data || []) as Reward[];
      console.log('[RewardManagementTab] Rewards loaded:', rewardList.length);
      setData(rewardList);
    } catch (err) {
      console.error('[RewardManagementTab] Error fetching rewards:', err);
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin?')) return;
    try {
      console.log(`[RewardDelete] Deleting reward ${id}...`);
      const result = await api.rewards.delete?.(id);
      console.log('[RewardDelete] Delete result:', result);
      setError('');
      // Wait 1 second to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchRewards();
    } catch (err) {
      console.error('[RewardDelete] Error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Gagal menghapus reward';
      setError(errorMsg);
    }
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setShowForm(true);
    // Scroll to top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  const handleFormSuccess = async () => {
    console.log('[RewardManagementTab] Form success, refreshing rewards...');
    setShowForm(false);
    setEditingReward(null);
    // Add delay untuk memastikan data tersimpan di database
    await new Promise(resolve => setTimeout(resolve, 1000));
    await fetchRewards();
  };

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-4">
          {/* Form Section */}
          {showForm && (
            <div className="mb-8 p-6 bg-emerald-50 border-2 border-emerald-200 rounded-lg max-h-[80vh] overflow-y-auto relative z-50">
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-emerald-50 pb-4 z-50">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingReward ? 'Edit Reward' : 'Tambah Reward Baru'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingReward(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold flex-shrink-0"
                >
                  ✕
                </button>
              </div>
              <RewardForm 
                onSuccess={handleFormSuccess} 
                editingReward={editingReward}
                onCancel={() => { setShowForm(false); setEditingReward(null); }}
              />
            </div>
          )}

          {/* Search and Add Button */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Cari reward..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {!showForm && (
              <button
                onClick={() => {
                  setEditingReward(null);
                  setShowForm(true);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-bold hover:shadow-lg transition-all"
              >
                + Tambah Reward
              </button>
            )}
          </div>

          {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map(reward => (
                <div key={reward.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
                  <div className="flex gap-4">
                    {/* Left side: Image */}
                    <div className="flex-shrink-0">
                      {reward.image ? (
                        <img
                          src={normalizeFileUrl(reward.image)}
                          alt={reward.name}
                          className="w-24 h-32 object-cover rounded-lg"
                          onError={(e) => {
                            console.error('[RewardDisplay] Image failed to load:', reward.image);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : reward.icon ? (
                        <div className="w-24 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                          {reward.icon}
                        </div>
                      ) : (
                        <div className="w-24 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                          🎁
                        </div>
                      )}
                    </div>

                    {/* Right side: Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{reward.name}</h3>
                          <p className="text-xs text-gray-600 line-clamp-2">{reward.description}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-emerald-700 ml-2`}>
                          {reward.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1 mb-3">
                        <p>{reward.points_required} poin</p>
                        <p>{reward.stock} tersedia</p>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(reward)}
                          className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded text-xs font-bold hover:bg-emerald-200 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(reward.id)}
                          className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold hover:bg-red-200 transition-all"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RewardForm({ onSuccess, editingReward, onCancel }: { onSuccess: () => void; editingReward: Reward | null; onCancel?: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: 100,
    stock: 10,
    image: null as File | null,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingReward) {
      setFormData({
        name: editingReward.name,
        description: editingReward.description,
        points_required: editingReward.points_required,
        stock: editingReward.stock,
        image: null,
      });
    }
  }, [editingReward]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.description) {
      setError('Semua field harus diisi');
      return;
    }

    try {
      setSubmitting(true);
      
      const uploadFormData = new FormData();
      uploadFormData.append('name', formData.name);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('points_required', formData.points_required.toString());
      uploadFormData.append('stock', formData.stock.toString());
      if (formData.image) {
        uploadFormData.append('image', formData.image);
      }

      // Log FormData for debugging
      console.log('[RewardForm] FormData entries:');
      for (let [key, value] of uploadFormData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File "${value.name}" (${value.size} bytes, type: ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      if (editingReward) {
        console.log(`[RewardForm] Updating reward ${editingReward.id}...`);
        const result = await api.rewards.update(editingReward.id, uploadFormData);
        console.log('[RewardForm] Update result:', result);
        setError('');
        onSuccess();
      } else {
        console.log('[RewardForm] Creating new reward...');
        const result = await api.rewards.create(uploadFormData);
        console.log('[RewardForm] Create result:', result);
        setError('');
        onSuccess();
      }
    } catch (err) {
      console.error('[RewardForm] Error uploading reward:', err);
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold">{error}</div>}
      
      {/* Row 1: Nama */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Nama Reward *</label>
        <input
          type="text"
          placeholder="Masukkan nama reward"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          required
        />
      </div>

      {/* Row 2: Deskripsi */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi *</label>
        <textarea
          placeholder="Masukkan deskripsi reward"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          required
        />
      </div>

      {/* Row 3: Poin & Stok */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Poin Diperlukan *</label>
          <input
            type="number"
            placeholder="Masukkan poin yang diperlukan"
            value={formData.points_required}
            onChange={(e) => setFormData({...formData, points_required: parseInt(e.target.value) || 1})}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Stok Tersedia *</label>
          <input
            type="number"
            placeholder="Masukkan stok reward"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 1})}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            min="0"
            required
          />
        </div>
      </div>

      {/* Row 4: Gambar */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">🖼️ Gambar Reward</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFormData({...formData, image: e.target.files?.[0] || null})}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        {formData.image && (
          <p className="text-xs text-gray-600 mt-1">✓ {formData.image.name}</p>
        )}
      </div>

      {/* Preview */}
      {formData.image && (
        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
          <div className="w-16 h-20 bg-gray-300 rounded overflow-hidden flex-shrink-0">
            <img 
              src={URL.createObjectURL(formData.image)} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">Preview Gambar</p>
            <p className="text-xs text-gray-600">{formData.image.name}</p>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-all"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}

// ============== USER MANAGEMENT TAB ==============
function UserManagementTab() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.users.list();
      setData((response?.data || []) as User[]);
    } catch (err) {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin akan menghapus user ini?')) return;
    try {
      await api.users.delete(id);
      fetchUsers();
    } catch (err) {
      setError('Gagal menghapus user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || item.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-4">
          {showForm && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                }}
                className="absolute top-0 right-0 text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
              <UserForm 
                onSuccess={() => { setShowForm(false); setEditingUser(null); fetchUsers(); }} 
                editingUser={editingUser}
                onCancel={() => { setShowForm(false); setEditingUser(null); }}
              />
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <input
                type="text"
                placeholder="Cari user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="guru">Guru</option>
                <option value="siswa">Siswa</option>
              </select>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-bold hover:shadow-lg transition-all"
              >
                + Tambah User
              </button>
            )}
          </div>

          {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left font-bold text-gray-800">Nama</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-800">Email</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-800">Role</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-800">Kelas</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-800">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(user => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition-all">
                      <td className="px-4 py-3 font-semibold text-gray-900">{user.name}</td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${'bg-blue-100 text-emerald-700'}`}>
                          {user.role === 'admin' ? 'Admin' : user.role === 'guru' ? 'Guru' : 'Siswa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{user.class_name || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(user)}
                            className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200 transition-all"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserForm({ onSuccess, editingUser, onCancel }: { onSuccess: () => void; editingUser: User | null; onCancel?: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'siswa',
    class_name: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        password: '',
        password_confirmation: '',
        role: editingUser.role,
        class_name: editingUser.class_name || '',
      });
    }
  }, [editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email) {
      setError('Nama dan email harus diisi');
      return;
    }

    if (!editingUser && (!formData.password || !formData.password_confirmation)) {
      setError('Password harus diisi untuk user baru');
      return;
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      setError('Password tidak cocok');
      return;
    }

    try {
      setSubmitting(true);
      if (editingUser) {
        console.log(`[UserForm] Updating user ${editingUser.id}...`);
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          class_name: formData.class_name,
          ...(formData.password && {
            password: formData.password,
            password_confirmation: formData.password_confirmation,
          }),
        };
        console.log('[UserForm] Update data:', updateData);
        const result = await api.users.update(editingUser.id, updateData);
        console.log('[UserForm] Update result:', result);
      } else {
        console.log('[UserForm] Creating new user...');
        const createData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          role: formData.role,
          grade_level: formData.role === 'siswa' ? '1' : undefined,
          class_name: formData.class_name || undefined,
        };
        console.log('[UserForm] Create data:', createData);
        const result = await api.users.create(createData);
        console.log('[UserForm] Create result:', result);
      }
      onSuccess();
    } catch (err) {
      console.error('[UserForm] Error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-bold text-gray-900">
        {editingUser ? 'Edit User' : 'Tambah User Baru'}
      </h3>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nama Lengkap"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({...formData, role: e.target.value})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        >
          <option value="siswa">Siswa</option>
          <option value="guru">Guru</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="text"
          placeholder="Kelas/Divisi (opsional)"
          value={formData.class_name}
          onChange={(e) => setFormData({...formData, class_name: e.target.value})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required={!editingUser}
        />
        <input
          type="password"
          placeholder="Konfirmasi Password"
          value={formData.password_confirmation}
          onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required={!editingUser}
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-all"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}


