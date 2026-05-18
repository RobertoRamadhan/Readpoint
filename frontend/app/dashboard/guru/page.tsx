'use client';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GuruStats {
  total_siswa?: number;
  total_kuis_dibuat?: number;
  validasi_pending?: number;
  siswa_aktif_hari_ini?: number;
  monthly_stats?: {
    month: string;
    students_active: number;
    books_read: number;
    quizzes_completed: number;
  }[];
}

interface ReadingActivity {
  id: number;
  user_id: number;
  ebook_id: number;
  status: string;
  current_page: number;
  final_page?: number;
  duration_minutes: number;
  notes?: string;
  user?: { id: number; name: string; email: string; class_name?: string };
  ebook?: { id: number; title: string; author: string; pages: number; poin_per_halaman?: number };
}

interface Student {
  id: number;
  name: string;
  email: string;
  class_name?: string;
  total_points?: number;
  books_read?: number;
  reading_progress?: number;
  quiz_average_score?: number;
  quizzes_passed?: number;
}

interface QuestionForm {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
}

export default function GuruDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('beranda');
  const [stats, setStats] = useState<GuruStats>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== 'guru' && user?.role !== 'admin'))) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, user?.role, router]);

  // Fetch guru stats
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'guru' || user?.role === 'admin')) {
      const fetchData = async () => {
        try {
          setDataLoading(true);
          const statsRes = await api.dashboard.guruStats();
          setStats((statsRes?.data as any) || statsRes || {});
        } catch (err) {
          console.error('Error fetching stats:', err);
          setError('Gagal memuat data');
        } finally {
          setDataLoading(false);
        }
      };
      fetchData();
    }
  }, [isAuthenticated, user?.role]);

  if (loading || !mounted || (user?.role !== 'guru' && user?.role !== 'admin')) {
    return null;
  }

  return (
    <div className="flex w-full">
      {/* Hamburger Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-16 left-4 z-40 p-2 bg-amber-800 text-white rounded-lg hover:bg-amber-700 transition-all md:hidden"
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
          onTabChange={setActiveTab}
          onCloseSidebar={() => setSidebarOpen(false)}
          role="guru"
          user={user}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-amber-50 via-amber-50 to-orange-50">
          <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8">
            {error && (
              <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl shadow-sm">
                <p className="font-bold flex items-center gap-2"><span>⚠️</span> Kesalahan: {error}</p>
              </div>
            )}

            {/* Beranda Tab */}
            {activeTab === 'beranda' && (
              <BerandaTab stats={stats} dataLoading={dataLoading} />
            )}

            {/* Validasi Tab */}
            {activeTab === 'validasi' && <ValidasiTab />}

            {/* Kuis Tab */}
            {activeTab === 'kuis' && <QuizTab />}

            {/* Siswa Tab */}
            {activeTab === 'siswa' && <StudentListTab />}

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
          <p className="font-semibold flex items-center gap-2"><span>⚠️</span> Terjadi Kesalahan</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-xl text-amber-800 text-sm shadow-sm">
          <p className="font-semibold flex items-center gap-2"><span>✅</span> Berhasil</p>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-all disabled:opacity-50"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password Baru</label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
              minLength={6}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-all disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============== BERANDA TAB ==============
function BerandaTab({ stats, dataLoading }: { stats: GuruStats; dataLoading: boolean }) {
  if (dataLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block">
          <div className="w-14 h-14 border-4 border-amber-400 border-t-amber-700 rounded-full animate-spin"></div>
        </div>
        <p className="text-amber-700 font-bold mt-4 text-lg">Memuat data...</p>
      </div>
    );
  }

  // Prepare data for bar chart (Monthly Stats)
  const barChartData = stats.monthly_stats?.map(stat => ({
    month: stat.month,
    siswaAktif: stat.students_active,
    bukuDibaca: stat.books_read,
    kuisSelesai: stat.quizzes_completed,
  })) || [];

  // Prepare data for pie chart (Quiz Distribution)
  const pieChartData = [
    { name: 'Kuis Selesai', value: stats.total_kuis_dibuat || 0 },
    { name: 'Validasi Pending', value: stats.validasi_pending || 0 },
  ];

  const COLORS = ['#b45309', '#f59e0b'];

  return (
    <div className="p-8 lg:p-12 space-y-10 w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl lg:text-4xl font-bold text-amber-900">Dashboard Guru</h2>
        <p className="text-amber-700 font-semibold mt-2">Kelola pembelajaran siswa Anda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <StatCard
          title="Total Siswa"
          value={stats.total_siswa || 0}
          color="border-amber-600"
          delay="0.1s"
        />
        <StatCard
          title="Kuis Dibuat"
          value={stats.total_kuis_dibuat || 0}
          color="border-amber-500"
          delay="0.15s"
        />
        <StatCard
          title="Validasi Pending"
          value={stats.validasi_pending || 0}
          color="border-orange-500"
          delay="0.2s"
        />
        <StatCard
          title="Siswa Aktif Hari Ini"
          value={stats.siswa_aktif_hari_ini || 0}
          color="border-amber-400"
          delay="0.25s"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-amber-200 animate-scale-up hover:shadow-2xl hover:border-amber-300 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-amber-900 mb-2">📊 Statistik Bulanan</h3>
            <p className="text-amber-700 text-sm font-semibold">Aktivitas siswa per bulan</p>
            <div className="flex justify-center mt-3">
              <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#b45309" />
              <YAxis stroke="#b45309" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #b45309' }} />
              <Legend />
              <Bar dataKey="siswaAktif" fill="#b45309" name="Siswa Aktif" radius={[8, 8, 0, 0]} />
              <Bar dataKey="bukuDibaca" fill="#f59e0b" name="Buku Dibaca" radius={[8, 8, 0, 0]} />
              <Bar dataKey="kuisSelesai" fill="#d97706" name="Kuis Selesai" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-amber-200 animate-scale-up hover:shadow-2xl hover:border-amber-300 transition-all duration-300" style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-amber-900 mb-2">📈 Status Kuis</h3>
            <p className="text-amber-700 text-sm font-semibold">Distribusi kuis</p>
            <div className="flex justify-center mt-3">
              <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-amber-200 animate-scale-up hover:shadow-2xl hover:border-amber-300 transition-all duration-300" style={{ animationDelay: '0.4s' }}>
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-amber-900 mb-2">📅 Detail Bulanan</h3>
          <p className="text-amber-700 text-sm font-semibold">Ringkasan aktivitas bulanan</p>
          <div className="flex justify-center mt-3">
            <div className="h-1 w-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"></div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-amber-200 bg-amber-50">
                <th className="px-4 py-3 text-left font-bold text-amber-900">Bulan</th>
                <th className="px-4 py-3 text-center font-bold text-amber-900">Siswa Aktif</th>
                <th className="px-4 py-3 text-center font-bold text-amber-900">Buku Dibaca</th>
                <th className="px-4 py-3 text-center font-bold text-amber-900">Kuis Selesai</th>
              </tr>
            </thead>
            <tbody>
              {barChartData.length > 0 ? (
                barChartData.map((stat, index) => (
                  <tr key={index} className="border-b border-amber-100 hover:bg-amber-50 transition-all">
                    <td className="px-4 py-3 font-semibold text-amber-900">{stat.month}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-lg text-amber-600">{stat.siswaAktif}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-amber-700">{stat.bukuDibaca}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-amber-700">{stat.kuisSelesai}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-amber-600">
                    Belum ada data bulanan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color = 'border-amber-600', delay = '0s' }: { title: string; value: number; color?: string; delay?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border-l-4 ${color} hover:shadow-2xl hover:shadow-amber-400/20 transition-all p-8 transform hover:scale-105 animate-scale-up border-b-2 border-r-2 border-b-gray-100 border-r-gray-100`}
      style={{ animationDelay: delay }}
    >
      <p className="text-amber-700 text-sm font-bold mb-3 uppercase tracking-wide">{title}</p>
      <p className="text-5xl font-bold text-amber-900">{value}</p>
    </div>
  );
}

// ============== VALIDASI PEMBACAAN TAB ==============
function ValidasiTab() {
  const [data, setData] = useState<ReadingActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ReadingActivity | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingActivities();
  }, []);

  const fetchPendingActivities = async () => {
    try {
      setLoading(true);
      const response = (await api.validations?.getPending?.()) as any;
      setData(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (activityId: number) => {
    try {
      setProcessingId(activityId);
      await api.validations?.approve?.(activityId);
      setSelectedActivity(null);
      setApprovalNotes('');
      fetchPendingActivities();
    } catch (err) {
      setError('Gagal approve aktivitas');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (activityId: number) => {
    if (!rejectionNotes.trim()) {
      setError('Alasan penolakan harus diisi');
      return;
    }
    try {
      setProcessingId(activityId);
      await api.validations?.reject?.(activityId, rejectionNotes.trim());
      setSelectedActivity(null);
      setRejectionNotes('');
      fetchPendingActivities();
    } catch (err) {
      setError('Gagal reject aktivitas');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="card border border-slate-200 shadow-lg overflow-hidden bg-white">
        <div className="bg-white px-6 py-4 flex items-center gap-3 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Validasi Pembacaan Siswa</h2>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <p className="text-lg font-semibold">Semua aktivitas sudah divalidasi!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((activity) => (
                <div
                  key={activity.id}
                  className="card border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all cursor-pointer bg-white"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div>
                          <p className="font-bold text-slate-900">{activity.ebook?.title}</p>
                          <p className="text-sm text-slate-600">
                            {activity.user?.name} ({activity.user?.class_name || 'No Class'})
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">
                        Pages {activity.current_page} / {activity.ebook?.pages || '?'} • {activity.duration_minutes} minutes
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                      Pending
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detail Modal */}
          {selectedActivity && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 max-h-screen overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Detail Validasi</h3>
                  <button onClick={() => setSelectedActivity(null)} className="text-2xl">✕</button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600">Book</p>
                    <p className="font-bold text-slate-900">{selectedActivity.ebook?.title}</p>
                  </div>

                  <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600">Student</p>
                    <p className="font-bold text-slate-900">{selectedActivity.user?.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-600">Pages</p>
                      <p className="font-bold text-slate-900">{selectedActivity.final_page || selectedActivity.current_page} / {selectedActivity.ebook?.pages}</p>
                    </div>
                    <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-600">⏱️ Durasi</p>
                      <p className="font-bold text-slate-900">{selectedActivity.duration_minutes} menit</p>
                    </div>
                  </div>

                  <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600">💭 Catatan Siswa</p>
                    <p className="font-semibold text-slate-900">{selectedActivity.notes || '-'}</p>
                  </div>
                </div>

                {/* Approval Section */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-bold text-lg">Keputusan Validasi</h4>

                  <textarea
                    placeholder="Catatan approval (opsional)"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="w-full border border-emerald-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={2}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(selectedActivity.id)}
                      disabled={processingId === selectedActivity.id}
                      className="flex-1 bg-sky-600 text-white py-2 rounded-lg font-bold hover:bg-sky-700 transition-all disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedActivity(null)}
                      className="flex-1 bg-slate-300 text-slate-700 py-2 rounded-lg font-bold hover:bg-slate-400 transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </div>

                {/* Rejection Section */}
                <div className="space-y-4 border-t pt-4 mt-4">
                  <textarea
                    placeholder="Alasan penolakan (wajib diisi jika reject)"
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    className="w-full border border-red-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={2}
                  />

                  <button
                    onClick={() => handleReject(selectedActivity.id)}
                    disabled={processingId === selectedActivity.id}
                    className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    ✕ Tolak
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Placeholder for other tabs
function MonitoringTab() {
  return (
    <div className="card border-2 border-amber-200 shadow-lg p-8 text-center animate-slide-up">
      <p className="text-2xl font-bold text-slate-900">Monitoring tab coming soon</p>
    </div>
  );
}

function QuizTab() {
  const [selectedEbook, setSelectedEbook] = useState<any>(null);
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' },
    { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' },
    { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' },
    { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' },
    { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEbooks();
    fetchQuizzes();
  }, []);

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const response = (await api.getEbooks?.()) as any;
      setEbooks(response?.data || []);
    } catch (err) {
      setError('Gagal memuat e-book');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await api.dashboard.guruQuizzes();
      setQuizzes(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error('Failed to fetch quizzes:', err);
    }
  };

  const handleQuestionChange = (idx: number, field: string, value: string) => {
    const newQuestions = [...questions];
    newQuestions[idx] = { ...newQuestions[idx], [field]: value };
    setQuestions(newQuestions);
  };

  const handleSubmitQuiz = async () => {
    if (!selectedEbook) {
      setError('Pilih e-book terlebih dahulu');
      return;
    }

    const allFilled = questions.every(q => q.question && q.option_a && q.option_b && q.option_c && q.option_d);
    if (!allFilled) {
      setError('Semua pertanyaan dan pilihan harus diisi');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.quiz?.create?.({
        ebook_id: selectedEbook.id,
        questions: questions,
      });
      setSuccess('✓ Kuis berhasil disimpan!');
      setSelectedEbook(null);
      setShowCreateForm(false);
      setQuestions(Array(5).fill(null).map(() => ({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'a' })));
      fetchQuizzes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal menyimpan kuis');
    } finally {
      setSubmitting(false);
    }
  };

  const getFilledCount = () => questions.filter(q => q.question.trim()).length;
  const filledCount = getFilledCount();

  return (
    <div className="space-y-6 animate-slide-up">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700 font-semibold">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-lg text-emerald-700 font-semibold">
          {success}
        </div>
      )}

      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Kuis</h2>
          <p className="text-gray-600">Buat dan kelola kuis untuk e-book</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-all"
        >
          {showCreateForm ? '← Lihat Daftar Kuis' : '+ Buat Kuis Baru'}
        </button>
      </div>

      {/* Quiz List */}
      {!showCreateForm && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Kuis yang Dibuat</h3>
            {quizzes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada kuis yang dibuat</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <div key={quiz.ebook_id} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div>
                      <h4 className="font-bold text-gray-900">{quiz.ebook_title}</h4>
                      <p className="text-sm text-gray-600">{quiz.question_count} pertanyaan</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-600">{quiz.attempt_count}</p>
                      <p className="text-xs text-gray-600">siswa menjawab</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Quiz Form */}
      {showCreateForm && (
        <div className="card border-2 border-purple-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-800 to-amber-900 px-6 py-6 flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">Buat Kuis</h2>
              <p className="text-purple-100 text-sm">Buat kuis dengan 5 pertanyaan pilihan ganda</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {!selectedEbook ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-8 text-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Pilih E-Book</h3>
                  <p className="text-slate-600 mb-6">Pilih buku untuk membuat kuis baru</p>

                  {loading ? (
                    <p className="text-slate-600">Memuat e-books...</p>
                  ) : (
                    <select
                      value=""
                      onChange={(e) => {
                        const ebook = ebooks.find(b => b.id == parseInt(e.target.value));
                        setSelectedEbook(ebook);
                      }}
                      className="w-full border-2 border-amber-300 rounded-lg px-6 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900 bg-white hover:border-amber-500 transition-all"
                    >
                      <option value="">Pilih e-book...</option>
                      {ebooks.map(b => (
                        <option key={b.id} value={b.id}>{b.title} • {b.author}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Selected Book Info */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-purple-600">📚 E-Book Terpilih</p>
                      <h3 className="text-2xl font-bold text-slate-900">{selectedEbook.title}</h3>
                      <p className="text-slate-600 mt-1">✍️ {selectedEbook.author}</p>
                    </div>
                    <button
                      onClick={() => setSelectedEbook(null)}
                      className="px-4 py-2 bg-white border-2 border-amber-300 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-all"
                    >
                      Ubah
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-slate-900">Progres Pertanyaan</p>
                    <p className="text-lg font-bold text-amber-600">{filledCount}/5</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-amber-600 h-full transition-all duration-300"
                      style={{ width: `${(filledCount / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Questions Form */}
                <div className="space-y-6">
                  {questions.map((q, idx) => (
                    <div key={idx} className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6 hover:border-gray-400 hover:shadow-lg transition-all">
                      {/* Question Number and Status */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-10 h-10 bg-amber-600 text-white rounded-full font-bold text-lg">
                            {idx + 1}
                          </span>
                          <h4 className="font-bold text-lg text-slate-900">Pertanyaan {idx + 1}</h4>
                        </div>
                        {q.question.trim() && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                            Selesai
                          </span>
                        )}
                      </div>

                      {/* Question Input */}
                      <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          Pertanyaan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          placeholder={`Buat pertanyaan yang jelas dan menarik untuk nomor ${idx + 1}`}
                          value={q.question}
                          onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                          className="w-full border-2 border-purple-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white placeholder-slate-400 text-slate-900 font-medium"
                          rows={2}
                        />
                      </div>

                      {/* Options Input */}
                      <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                          Opsi Jawaban <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { key: 'option_a', label: 'A' },
                            { key: 'option_b', label: 'B' },
                            { key: 'option_c', label: 'C' },
                            { key: 'option_d', label: 'D' },
                          ].map(({ key, label }) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-700 rounded-lg font-bold text-sm">
                                {label}
                              </span>
                              <input
                                type="text"
                                placeholder={`Opsi ${label}`}
                                value={q[key as keyof QuestionForm] as string}
                                onChange={(e) => handleQuestionChange(idx, key, e.target.value)}
                                className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-900"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Correct Answer */}
                      <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                          Jawaban Benar <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {['a', 'b', 'c', 'd'].map((option) => (
                            <button
                              key={option}
                              onClick={() => handleQuestionChange(idx, 'correct_answer', option)}
                              className={`py-2 px-3 rounded-lg font-bold transition-all ${
                                q.correct_answer === option
                                  ? 'bg-amber-600 text-white shadow-lg scale-105'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {option.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t-2 border-gray-300">
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting || filledCount < 5}
                    className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all ${
                      submitting || filledCount < 5
                        ? 'bg-slate-300 text-slate-600 cursor-not-allowed opacity-60'
                        : 'bg-amber-600 text-white hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Kuis'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEbook(null);
                      setError('');
                    }}
                    className="flex-1 bg-slate-200 text-slate-700 py-4 rounded-lg font-bold hover:bg-slate-300 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentListTab() {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = (await api.dashboard.guruStudents()) as any;
      setData(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="card border-2 border-cyan-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 px-6 py-4 flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Student List</h2>
        </div>

        <div className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Search student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-2 border-amber-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-amber-200 bg-amber-50">
                    <th className="px-4 py-2 text-left font-bold">Nama</th>
                    <th className="px-4 py-2 text-center font-bold">Poin</th>
                    <th className="px-4 py-2 text-center font-bold">Buku</th>
                    <th className="px-4 py-2 text-center font-bold">Progress Baca</th>
                    <th className="px-4 py-2 text-center font-bold">Kuis Avg</th>
                    <th className="px-4 py-2 text-center font-bold">Lulus</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(student => (
                    <tr key={student.id} className="border-b border-amber-100 hover:bg-amber-50 transition-all">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-600">{student.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-lg text-amber-600">{student.total_points || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold">{student.books_read || 0}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-amber-600 h-2 rounded-full"
                              style={{ width: `${student.reading_progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-amber-700">{Math.round(student.reading_progress || 0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold">{(student.quiz_average_score || 0).toFixed(1)}%</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold">{student.quizzes_passed || 0}</span>
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
