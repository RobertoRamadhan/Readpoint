'use client';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Student {
  id: number;
  name: string;
  email: string;
  class_name?: string;
  total_points?: number;
  points?: number;
  books_read?: number;
  reading_progress?: number;
  quiz_average_score?: number;
  quizzes_passed?: number;
  quizzes_taken?: number;
}

interface StudentProductivity {
  id: number;
  name: string;
  email: string;
  className: string;
  totalPoints: number;
  booksRead: number;
  quizzesCompleted: number;
  quizAverageScore: number;
  readingProgress: number;
  status: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Pendampingan';
  statusClass: string;
  note: string;
}

function getStudentPoints(student: Student) {
  return Number(student.total_points ?? student.points ?? 0);
}

function getProductivityStatus(points: number, booksRead: number, quizAverageScore: number) {
  const score = points + booksRead * 50 + quizAverageScore * 5;

  if (score >= 1400) {
    return {
      status: 'Sangat Baik' as const,
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      note: 'Siswa sangat aktif membaca dan mengikuti aktivitas literasi.',
    };
  }

  if (score >= 700) {
    return {
      status: 'Baik' as const,
      statusClass: 'bg-green-100 text-green-800 border-green-200',
      note: 'Produktivitas siswa baik dan perlu dipertahankan.',
    };
  }

  if (score >= 300) {
    return {
      status: 'Cukup' as const,
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      note: 'Siswa mulai aktif, tetapi masih perlu ditingkatkan.',
    };
  }

  return {
    status: 'Perlu Pendampingan' as const,
    statusClass: 'bg-red-100 text-red-800 border-red-200',
    note: 'Aktivitas siswa masih rendah dan perlu arahan guru.',
  };
}

export default function GuruLaporanPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== 'guru' && user?.role !== 'admin'))) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, user?.role, router]);

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'guru' || user?.role === 'admin')) {
      const fetchStudents = async () => {
        try {
          setDataLoading(true);
          setError('');
          const response = await api.dashboard.guruStudents();
          const data = ((response as any)?.data || response || []) as Student[];
          setStudents(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Error fetching student productivity report:', err);
          setError('Gagal memuat laporan produktivitas siswa');
        } finally {
          setDataLoading(false);
        }
      };

      fetchStudents();
    }
  }, [isAuthenticated, user?.role]);

  const reportData = useMemo(() => {
    return students.map((student) => {
      const totalPoints = getStudentPoints(student);
      const booksRead = Number(student.books_read ?? 0);
      const quizzesCompleted = Number(student.quizzes_passed ?? student.quizzes_taken ?? 0);
      const quizAverageScore = Number(student.quiz_average_score ?? 0);
      const readingProgress = Number(student.reading_progress ?? 0);
      const productivity = getProductivityStatus(totalPoints, booksRead, quizAverageScore);

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        className: student.class_name || '-',
        totalPoints,
        booksRead,
        quizzesCompleted,
        quizAverageScore,
        readingProgress,
        status: productivity.status,
        statusClass: productivity.statusClass,
        note: productivity.note,
      } satisfies StudentProductivity;
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [students]);

  const summary = useMemo(() => {
    const totalStudents = reportData.length;
    const totalPoints = reportData.reduce((sum, item) => sum + item.totalPoints, 0);
    const totalBooksRead = reportData.reduce((sum, item) => sum + item.booksRead, 0);
    const productiveStudents = reportData.filter((item) => item.status === 'Baik' || item.status === 'Sangat Baik').length;

    return { totalStudents, totalPoints, totalBooksRead, productiveStudents };
  }, [reportData]);

  if (loading || !mounted || (user?.role !== 'guru' && user?.role !== 'admin')) {
    return null;
  }

  return (
    <div className="flex w-full min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)] bg-slate-50">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-16 left-4 z-40 rounded-lg bg-emerald-900 p-2 text-white transition hover:bg-emerald-800 md:hidden"
        aria-label="Buka menu guru"
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
        role="guru"
        user={user}
      />

      <main className="min-w-0 flex-1 bg-slate-50">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Laporan Produktivitas Siswa</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">Pantau perkembangan literasi siswa</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
              Laporan ini membantu guru melihat siswa yang produktif, siswa yang perlu pendampingan, total poin, buku dibaca, dan perkembangan kuis.
            </p>
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 shadow-sm">
              {error}
            </div>
          )}

          {dataLoading ? (
            <div className="rounded-2xl border border-emerald-200 bg-white py-20 text-center shadow-sm">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
              <p className="mt-4 text-sm font-bold text-slate-600">Memuat laporan produktivitas siswa...</p>
            </div>
          ) : (
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Total Siswa</p>
                  <p className="mt-3 text-4xl font-black text-emerald-900">{summary.totalStudents}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Siswa pada kelas guru</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Total Poin</p>
                  <p className="mt-3 text-4xl font-black text-emerald-900">{summary.totalPoints}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Akumulasi poin siswa</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Buku Dibaca</p>
                  <p className="mt-3 text-4xl font-black text-emerald-900">{summary.totalBooksRead}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Total buku selesai dibaca</p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Siswa Produktif</p>
                  <p className="mt-3 text-4xl font-black text-emerald-700">{summary.productiveStudents}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Status Baik/Sangat Baik</p>
                </div>
              </section>

              <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Grafik Produktivitas</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900">Total poin per siswa</h2>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dcfce7" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="totalPoints" fill="#059669" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Tabel Evaluasi</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900">Produktivitas siswa</h2>
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Penilaian dihitung dari poin, jumlah buku dibaca, dan rata-rata nilai kuis jika tersedia dari API.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1040px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-emerald-200 bg-emerald-50 text-xs uppercase tracking-wider text-emerald-800">
                        <th className="px-4 py-3 font-black">Siswa</th>
                        <th className="px-4 py-3 font-black">Kelas</th>
                        <th className="px-4 py-3 font-black">Poin</th>
                        <th className="px-4 py-3 font-black">Buku Dibaca</th>
                        <th className="px-4 py-3 font-black">Kuis Selesai</th>
                        <th className="px-4 py-3 font-black">Rata-rata Kuis</th>
                        <th className="px-4 py-3 font-black">Status</th>
                        <th className="px-4 py-3 font-black">Kesimpulan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100">
                      {reportData.length > 0 ? (
                        reportData.map((item) => (
                          <tr key={item.id} className="align-top">
                            <td className="px-4 py-4">
                              <p className="font-black text-slate-900">{item.name}</p>
                              <p className="text-xs font-medium text-slate-500">{item.email}</p>
                            </td>
                            <td className="px-4 py-4 font-bold text-slate-700">{item.className}</td>
                            <td className="px-4 py-4 font-black text-emerald-700">{item.totalPoints}</td>
                            <td className="px-4 py-4 font-bold text-slate-700">{item.booksRead}</td>
                            <td className="px-4 py-4 font-bold text-slate-700">{item.quizzesCompleted}</td>
                            <td className="px-4 py-4 font-bold text-slate-700">{item.quizAverageScore}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${item.statusClass}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-600">{item.note}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-4 py-10 text-center font-bold text-slate-500">
                            Belum ada data siswa untuk dibuat laporan.
                          </td>
                        </tr>
                      )}
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
