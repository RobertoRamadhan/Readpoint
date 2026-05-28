'use client';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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

export default function AdminLaporanPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, user?.role, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      const fetchStats = async () => {
        try {
          setDataLoading(true);
          const statsRes = await api.dashboard.adminStats();
          setStats((statsRes?.data as any) || statsRes || {});
        } catch (err) {
          console.error('Error fetching report stats:', err);
          setError('Gagal memuat data laporan');
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

  const summaryData = [
    { name: 'Siswa', value: stats.total_siswa || 0 },
    { name: 'Guru', value: stats.total_guru || 0 },
    { name: 'E-Book', value: stats.total_ebook || 0 },
    { name: 'Reward', value: stats.total_reward || 0 },
  ];

  const activityData = [
    { name: 'Siswa Aktif', value: stats.siswa_aktif_hari_ini || 0 },
    { name: 'Buku Dibaca', value: stats.buku_dibaca_hari_ini || 0 },
    { name: 'Kuis', value: stats.kuis_dikerjakan_hari_ini || 0 },
    { name: 'Reward', value: stats.reward_diklaim_hari_ini || 0 },
  ];

  const pieColors = ['#059669', '#0f172a', '#64748b', '#94a3b8'];

  return (
    <div className="flex w-full min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)] bg-slate-50">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-16 left-4 z-40 rounded-lg bg-emerald-900 p-2 text-white transition hover:bg-emerald-800 md:hidden"
        aria-label="Buka menu admin"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 top-14 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        activeTab="laporan"
        sidebarOpen={sidebarOpen}
        onTabChange={() => {}}
        onCloseSidebar={() => setSidebarOpen(false)}
        role="admin"
        user={user}
      />

      <main className="min-w-0 flex-1 bg-slate-50">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Laporan</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">Analisis aktivitas literasi</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
              Pantau ringkasan data sistem, aktivitas harian, dan performa program READPOINT.
            </p>
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 shadow-sm">
              {error}
            </div>
          )}

          {dataLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center shadow-sm">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
              <p className="mt-4 text-sm font-bold text-slate-600">Memuat laporan...</p>
            </div>
          ) : (
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {summaryData.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">{item.name}</p>
                    <p className="mt-3 text-4xl font-black text-slate-900">{item.value}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-500">Total data saat ini</p>
                  </div>
                ))}
              </section>

              <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-6">
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Grafik Aktivitas</p>
                    <h2 className="mt-2 text-xl font-black text-slate-900">Aktivitas Hari Ini</h2>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#059669" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="mb-6">
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Komposisi Data</p>
                    <h2 className="mt-2 text-xl font-black text-slate-900">Ringkasan Sistem</h2>
                  </div>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summaryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          dataKey="value"
                          nameKey="name"
                          label
                        >
                          {summaryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Tabel Laporan</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900">Detail Aktivitas Hari Ini</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                        <th className="px-4 py-3 font-black">Kategori</th>
                        <th className="px-4 py-3 font-black">Jumlah</th>
                        <th className="px-4 py-3 font-black">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activityData.map((item) => (
                        <tr key={item.name}>
                          <td className="px-4 py-4 font-bold text-slate-900">{item.name}</td>
                          <td className="px-4 py-4 font-black text-emerald-700">{item.value}</td>
                          <td className="px-4 py-4 text-slate-600">Data aktivitas tercatat hari ini.</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
