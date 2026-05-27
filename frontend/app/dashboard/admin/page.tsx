'use client';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  category: string;
  is_active: boolean;
  image?: string;
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

export default function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('beranda');
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
          onTabChange={setActiveTab}
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
              <OverviewTab stats={stats} topStudents={topStudents} dataLoading={dataLoading} />
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

// ============== OVERVIEW TAB ==============
function OverviewTab({ stats, topStudents, dataLoading }: { stats: AdminStats; topStudents: TopStudent[]; dataLoading: boolean }) {
  if (dataLoading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block">
          <div className="w-14 h-14 border-4 border-emerald-400 border-t-emerald-700 rounded-full animate-spin"></div>
        </div>
        <p className="text-emerald-700 font-bold mt-4 text-lg">Memuat data...</p>
      </div>
    );
  }

  // Prepare data for bar chart
  const barChartData = [
    { name: 'Siswa', value: stats.total_siswa || 0 },
    { name: 'Guru', value: stats.total_guru || 0 },
    { name: 'Buku', value: stats.total_ebook || 0 },
    { name: 'Reward', value: stats.total_reward || 0 },
  ];

  // Prepare data for pie chart (Reward)
  const pieChartData = [
    { name: 'Reward Diklaim', value: stats.reward_diklaim_hari_ini || 0 },
    { name: 'Reward Tersisa', value: Math.max(0, (stats.total_reward || 0) - (stats.reward_diklaim_hari_ini || 0)) },
  ];

  const COLORS = ['#b45309', '#f59e0b'];

  return (
    <div className="p-8 space-y-8 w-full">
      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <ActivityItem label="Siswa Aktif" value={stats.siswa_aktif_hari_ini || 0} delay="0.1s" />
        <ActivityItem label="Buku Dibaca" value={stats.buku_dibaca_hari_ini || 0} delay="0.15s" />
        <ActivityItem label="Quiz Dikerjakan" value={stats.kuis_dikerjakan_hari_ini || 0} delay="0.2s" />
        <ActivityItem label="Reward Diklaim" value={stats.reward_diklaim_hari_ini || 0} delay="0.25s" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-emerald-200 animate-scale-up hover:shadow-2xl hover:border-emerald-300 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-emerald-900 mb-2">Statistik Sistem</h3>
            <p className="text-emerald-700 text-sm font-semibold">Total pengguna dan konten aktif</p>
            <div className="flex justify-center mt-3">
              <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#b45309" />
              <YAxis stroke="#b45309" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #b45309' }} />
              <Bar dataKey="value" fill="#b45309" radius={[16, 16, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-emerald-200 animate-scale-up hover:shadow-2xl hover:border-emerald-300 transition-all duration-300" style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-emerald-900 mb-2">Status Reward Hari Ini</h3>
            <p className="text-emerald-700 text-sm font-semibold">Distribusi reward yang diklaim</p>
            <div className="flex justify-center mt-3">
              <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
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
      const response = await api.dashboard.adminBooks();
      setData((response.data || []) as Ebook[]);
    } catch (err) {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin?')) return;
    try {
      await api.ebooks.delete?.(id);
      fetchEbooks();
    } catch (err) {
      setError('Gagal menghapus e-book');
    }
  };

  const handleEdit = (ebook: Ebook) => {
    setEditingEbook(ebook);
    setShowForm(true);
  };

  const filteredData = data.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-4">
          {showForm && <EbookForm onSuccess={() => { setShowForm(false); setEditingEbook(null); fetchEbooks(); }} editingEbook={editingEbook} />}

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Cari e-book..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-bold hover:shadow-lg transition-all"
            >
              + Tambah E-Book
            </button>
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
                          src={ebook.cover_image}
                          alt={ebook.title}
                          className="w-24 h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                          📚
                        </div>
                      )}
                      {ebook.pdf_file && (
                        <a
                          href={ebook.pdf_file}
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

function EbookForm({ onSuccess, editingEbook }: { onSuccess: () => void; editingEbook: Ebook | null }) {
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
      console.log('FormData entries:');
      for (let [key, value] of uploadFormData.entries()) {
        console.log(`${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
      }

      if (editingEbook) {
        await api.ebooks.update?.(editingEbook.id, uploadFormData);
      } else {
        await api.ebooks.create(uploadFormData);
      }
      onSuccess();
    } catch (err) {
      console.error('Error uploading ebook:', err);
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-bold text-gray-900">
        {editingEbook ? 'Edit E-Book' : 'Tambah E-Book Baru'}
      </h3>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Judul Buku"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          required
        />
        <input
          type="text"
          placeholder="Pengarang"
          value={formData.author}
          onChange={(e) => setFormData({...formData, author: e.target.value})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="number"
          placeholder="Total Halaman"
          value={formData.pages}
          onChange={(e) => setFormData({...formData, pages: parseInt(e.target.value) || 1})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          min="1"
          required
        />
        <input
          type="text"
          placeholder="Kategori"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">📄 PDF File {editingEbook ? '(Opsional - kosongkan jika tidak ingin mengubah)' : '*'}</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFormData({...formData, pdf_file: e.target.files?.[0] || null})}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
            required={!editingEbook}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">🖼️ Gambar Sampul</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({...formData, cover_image: e.target.files?.[0] || null})}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
          />
        </div>
      </div>

      {formData.cover_image && (
        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
          <div className="w-16 h-20 bg-gray-300 rounded overflow-hidden">
            <img 
              src={URL.createObjectURL(formData.cover_image)} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm text-gray-700 font-medium">{formData.cover_image.name}</span>
        </div>
      )}

      <div className="flex gap-2 justify-end">
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
      const response = await api.rewards.list();
      setData((Array.isArray(response) ? response : response?.data || []) as Reward[]);
    } catch (err) {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin?')) return;
    try {
      await api.rewards.delete?.(id);
      fetchRewards();
    } catch (err) {
      setError('Gagal menghapus reward');
    }
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setShowForm(true);
  };

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-8 space-y-4">
          {showForm && <RewardForm onSuccess={() => { setShowForm(false); setEditingReward(null); fetchRewards(); }} editingReward={editingReward} />}

        <div className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Cari reward..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              onClick={() => {
                setEditingReward(null);
                setShowForm(!showForm);
              }}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all"
            >
              {showForm ? 'Tutup' : '+ Tambah'}
            </button>
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
                          src={reward.image}
                          alt={reward.name}
                          className="w-24 h-32 object-cover rounded-lg"
                        />
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
                        <p>🏷️ {reward.category}</p>
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

function RewardForm({ onSuccess, editingReward }: { onSuccess: () => void; editingReward: Reward | null }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: 100,
    stock: 10,
    category: '',
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
        category: editingReward.category,
        image: null,
      });
    }
  }, [editingReward]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.description || !formData.category) {
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
      uploadFormData.append('category', formData.category);
      if (formData.image) {
        uploadFormData.append('image', formData.image);
      }

      if (editingReward) {
        await api.rewards.update(editingReward.id, uploadFormData);
      } else {
        await api.rewards.create(uploadFormData);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 space-y-4">
      <h3 className="text-xl font-bold text-gray-900">
        {editingReward ? 'Edit Reward' : 'Tambah Reward Baru'}
      </h3>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-bold">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nama Reward"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
        <input
          type="text"
          placeholder="Kategori"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <textarea
        placeholder="Deskripsi Reward"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        rows={3}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Poin Diperlukan"
          value={formData.points_required}
          onChange={(e) => setFormData({...formData, points_required: parseInt(e.target.value) || 1})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          min="1"
          required
        />
        <input
          type="number"
          placeholder="Stok Tersedia"
          value={formData.stock}
          onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 1})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          min="0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">🖼️ Gambar Reward</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFormData({...formData, image: e.target.files?.[0] || null})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
        />
      </div>

      {formData.image && (
        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
          <div className="w-16 h-20 bg-gray-300 rounded overflow-hidden">
            <img 
              src={URL.createObjectURL(formData.image)} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm text-gray-700 font-medium">{formData.image.name}</span>
        </div>
      )}

      <div className="flex gap-2 justify-end">
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
          {showForm && <UserForm onSuccess={() => { setShowForm(false); setEditingUser(null); fetchUsers(); }} editingUser={editingUser} />}

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

function UserForm({ onSuccess, editingUser }: { onSuccess: () => void; editingUser: User | null }) {
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
        await api.users.update(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          class_name: formData.class_name,
          ...(formData.password && {
            password: formData.password,
            password_confirmation: formData.password_confirmation,
          }),
        });
      } else {
        await api.users.create(formData as any);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan');
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
          required
        />
        <input
          type="password"
          placeholder="Konfirmasi Password"
          value={formData.password_confirmation}
          onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <div className="flex gap-2 justify-end">
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


