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

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  class_name?: string;
  total_points?: number;
  points?: number;
  books_read?: number;
  quizzes_passed?: number;
  quizzes_taken?: number;
}

interface TeacherProductivity {
  id: number;
  teacherName: string;
  teacherEmail: string;
  className: string;
  totalStudents: number;
  totalPoints: number;
  averagePoints: number;
  booksRead: number;
  quizzesCompleted: number;
  status: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Pendampingan' | 'Belum Ada Siswa';
  statusClass: string;
  note: string;
}

function getStudentPoints(student: UserRecord) {
  return Number(student.total_points ?? student.points ?? 0);
}

function getProductivityStatus(averagePoints: number, totalStudents: number) {
  if (totalStudents === 0) {
    return {
      status: 'Belum Ada Siswa' as const,
      statusClass: 'bg-slate-100 text-slate-700 border-slate-200',
      note: 'Guru belum memiliki siswa pada kelas ini.',
    };
  }

  if (averagePoints >= 1000) {
    return {
      status: 'Sangat Baik' as const,
      statusClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      note: 'Kelas sangat aktif dan produktivitas guru sangat baik.',
    };
  }

  if (averagePoints >= 500) {
    return {
      status: 'Baik' as const,
      statusClass: 'bg-blue-100 text-blue-800 border-blue-200',
      note: 'Kelas aktif dan produktivitas guru baik.',
    };
  }

  if (averagePoints >= 200) {
    return {
      status: 'Cukup' as const,
      statusClass: 'bg-amber-100 text-amber-800 border-amber-200',
      note: 'Kelas mulai aktif, tetapi masih perlu peningkatan.',
    };
  }

  return {
    status: 'Perlu Pendampingan' as const,
    statusClass: 'bg-red-100 text-red-800 border-red-200',
    note: 'Aktivitas kelas masih rendah dan perlu evaluasi.',
  };
}

export default function AdminLaporanPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<UserRecord[]>([]);
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
      const fetchReportData = async () => {
        try {
          setDataLoading(true);
          setError('');
          const usersRes = await api.users.list();
          const userData = (usersRes?.data || usersRes || []) as UserRecord[];
          setUsers(Array.isArray(userData) ? userData : []);
        } catch (err) {
          console.error('Error fetching teacher productivity report:', err);
          setError('Gagal memuat laporan produktivitas guru');
        } finally {
          setDataLoading(false);
        }
      };

      fetchReportData();
    }
  }, [isAuthenticated, user?.role]);

  const reportData = useMemo(() => {
    const teachers = users.filter((item) => item.role === 'guru');
    const students = users.filter((item) => item.role === 'siswa');

    return teachers.map((teacher) => {
      const className = teacher.class_name || '-';
      const classStudents = students.filter((student) => student.class_name && student.class_name === className);
      const totalPoints = classStudents.reduce((sum, student) => sum + getStudentPoints(student), 0);
      const booksRead = classStudents.reduce((sum, student) => sum + Number(student.books_read ?? 0), 0);
      const quizzesCompleted = classStudents.reduce((sum, student) => sum + Number(student.quizzes_passed ?? student.quizzes_taken ?? 0), 0);
      const averagePoints = classStudents.length > 0 ? Math.round(totalPoints / classStudents.length) : 0;
      const productivity = getProductivityStatus(averagePoints, classStudents.length);

      return {
        id: teacher.id,
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        className,
        totalStudents: classStudents.length,
        totalPoints,
        averagePoints,
        booksRead,
        quizzesCompleted,
        status: productivity.status,
        statusClass: productivity.statusClass,
        note: productivity.note,
      } satisfies TeacherProductivity;
    }).sort((a, b) => b.averagePoints - a.averagePoints);
  }, [users]);

  const summary = useMemo(() => {
    const totalTeachers = reportData.length;
    const totalClasses = new Set(reportData.map((item) => item.className).filter((item) => item !== '-')).size;
    const totalClassPoints = reportData.reduce((sum, item) => sum + item.totalPoints, 0);
    const goodTeachers = reportData.filter((item) => item.status === 'Baik' || item.status === 'Sangat Baik').length;

    return { totalTeachers, totalClasses, totalClassPoints, goodTeachers };
  }, [reportData]);

  if (loading || !mounted || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-16 z-40 rounded-lg bg-emerald-900 p-2 text-white transition hover:bg-emerald-800 md:hidden"
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
        onTabChange={(tabId) => {
          if (tabId === 'beranda') router.push('/dashboard/admin');
          if (['ebooks', 'rewards', 'users', 'pengaturan'].includes(tabId)) router.push(`/dashboard/admin?tab=${tabId}`);
        }}
        onCloseSidebar={() => setSidebarOpen(false)}
        role="admin"
        user={user}
      />

      <main className="admin-report-main min-h-screen min-w-0 bg-slate-50 md:ml-72 md:w-[calc(100vw-18rem)]">
        <div className="w-full space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Laporan Produktivitas Guru</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">Evaluasi wali kelas berdasarkan poin siswa</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
              Laporan ini menilai produktivitas guru dari kelas yang diampu. Contohnya: wali kelas A memiliki siswa dengan total poin tertentu, lalu sistem memberi status Baik, Cukup, atau Perlu Pendampingan.
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
              <p className="mt-4 text-sm font-bold text-slate-600">Memuat laporan produktivitas guru...</p>
            </div>
          ) : (
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Total Guru</p>
                  <p className="mt-3 text-4xl font-black text-slate-900">{summary.totalTeachers}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Guru yang terdaftar</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Kelas Terpantau</p>
                  <p className="mt-3 text-4xl font-black text-slate-900">{summary.totalClasses}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Berdasarkan kelas wali</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Total Poin Kelas</p>
                  <p className="mt-3 text-4xl font-black text-slate-900">{summary.totalClassPoints}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Akumulasi poin siswa</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Guru Produktif</p>
                  <p className="mt-3 text-4xl font-black text-emerald-700">{summary.goodTeachers}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Status Baik/Sangat Baik</p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Grafik Produktivitas</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900">Total poin siswa per wali kelas</h2>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="className" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="totalPoints" fill="#059669" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Tabel Evaluasi</p>
                  <h2 className="mt-2 text-xl font-black text-slate-900">Produktivitas guru per kelas</h2>
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Penilaian sementara dihitung dari rata-rata poin siswa pada kelas yang sama dengan wali kelas.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                        <th className="px-4 py-3 font-black">Guru / Wali Kelas</th>
                        <th className="px-4 py-3 font-black">Kelas</th>
                        <th className="px-4 py-3 font-black">Jumlah Siswa</th>
                        <th className="px-4 py-3 font-black">Total Poin Kelas</th>
                        <th className="px-4 py-3 font-black">Rata-rata Poin</th>
                        <th className="px-4 py-3 font-black">Status</th>
                        <th className="px-4 py-3 font-black">Kesimpulan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.length > 0 ? (
                        reportData.map((item) => (
                          <tr key={item.id} className="align-top">
                            <td className="px-4 py-4">
                              <p className="font-black text-slate-900">{item.teacherName}</p>
                              <p className="text-xs font-medium text-slate-500">{item.teacherEmail}</p>
                            </td>
                            <td className="px-4 py-4 font-bold text-slate-700">{item.className}</td>
                            <td className="px-4 py-4 font-bold text-slate-700">{item.totalStudents}</td>
                            <td className="px-4 py-4 font-black text-emerald-700">{item.totalPoints}</td>
                            <td className="px-4 py-4 font-black text-slate-900">{item.averagePoints}</td>
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
                          <td colSpan={7} className="px-4 py-10 text-center font-bold text-slate-500">
                            Belum ada data guru untuk dibuat laporan.
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
