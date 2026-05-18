'use client';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageLoading } from '@/components/shared';
import StatsCard from '@/components/shared/StatsCard';
import AnalyticsChart from '@/components/shared/AnalyticsChart';

interface AdminStats {
  total_users: number;
  total_books: number;
  total_quizzes: number;
  total_rewards: number;
  active_users_today: number;
  books_read_today: number;
  quizzes_completed_today: number;
  rewards_redeemed_today: number;
}

interface TopStudent {
  id: number;
  name: string;
  email: string;
  total_points: number;
  books_read: number;
  quiz_average_score: number;
}

interface BookStats {
  id: number;
  title: string;
  total_reads: number;
  average_completion_rate: number;
  total_points_distributed: number;
}

export default function AdminAnalyticsPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [bookStats, setBookStats] = useState<BookStats[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading || !isAuthenticated) return;

    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    loadAnalyticsData();
  }, [mounted, loading, isAuthenticated, user, router, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Load admin stats
      const statsRes = await api.dashboard.adminStats();
      if (statsRes) {
        setStats(statsRes as unknown as AdminStats);
      }

      // Load top students
      const studentsRes = await api.dashboard.adminTopStudents();
      if (studentsRes?.data) {
        setTopStudents(studentsRes.data as unknown as TopStudent[]);
      }

      // Load book stats
      const booksRes = await api.dashboard.adminBooks();
      if (booksRes?.data) {
        setBookStats(booksRes.data as unknown as BookStats[]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load analytics data';
      setError(errorMsg);
      console.error('[Analytics] Error:', errorMsg);
    } finally {
      setLoadingData(false);
    }
  };

  if (!mounted || loading) {
    return <PageLoading />;
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  // Mock data for demonstration
  const mockStats: AdminStats = {
    total_users: 245,
    total_books: 48,
    total_quizzes: 156,
    total_rewards: 23,
    active_users_today: 89,
    books_read_today: 34,
    quizzes_completed_today: 67,
    rewards_redeemed_today: 12
  };

  const mockTopStudents: TopStudent[] = [
    { id: 1, name: 'Ahmad Rizki', email: 'ahmad@email.com', total_points: 1250, books_read: 12, quiz_average_score: 85 },
    { id: 2, name: 'Siti Nurhaliza', email: 'siti@email.com', total_points: 1180, books_read: 11, quiz_average_score: 82 },
    { id: 3, name: 'Budi Santoso', email: 'budi@email.com', total_points: 980, books_read: 9, quiz_average_score: 78 },
    { id: 4, name: 'Dewi Lestari', email: 'dewi@email.com', total_points: 920, books_read: 10, quiz_average_score: 80 },
    { id: 5, name: 'Eko Prasetyo', email: 'eko@email.com', total_points: 850, books_read: 8, quiz_average_score: 75 }
  ];

  const currentStats = stats || mockStats;
  const currentTopStudents = topStudents.length > 0 ? topStudents : mockTopStudents;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full">
          {/* Time Range Selector */}
          <div className="mb-6">
            <div className="flex gap-2">
              {[
                { key: '7d', label: 'Last 7 Days' },
                { key: '30d', label: 'Last 30 Days' },
                { key: '90d', label: 'Last 90 Days' }
              ].map((range) => (
                <button
                  key={range.key}
                  onClick={() => setTimeRange(range.key as '7d' | '30d' | '90d')}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    timeRange === range.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Pengguna"
              value={currentStats.total_users}
              icon="👥"
              change={{ value: 12, type: 'increase', period: 'vs last month' }}
              color="blue"
              loading={loadingData}
            />
            <StatsCard
              title="Total Buku"
              value={currentStats.total_books}
              icon="📚"
              change={{ value: 8, type: 'increase', period: 'vs last month' }}
              color="green"
              loading={loadingData}
            />
            <StatsCard
              title="Total Kuis"
              value={currentStats.total_quizzes}
              icon="📝"
              change={{ value: 15, type: 'increase', period: 'vs last month' }}
              color="purple"
              loading={loadingData}
            />
            <StatsCard
              title="Total Reward"
              value={currentStats.total_rewards}
              icon="🎁"
              change={{ value: 5, type: 'increase', period: 'vs last month' }}
              color="yellow"
              loading={loadingData}
            />
          </div>

          {/* Activity Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <AnalyticsChart
              title="Tren Aktivitas Pengguna"
              type="line"
              data={[]}
              loading={loadingData}
            />
            <AnalyticsChart
              title="Progres Membaca"
              type="area"
              data={[]}
              loading={loadingData}
            />
          </div>

          {/* Today's Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Pengguna Aktif Hari Ini"
              value={currentStats.active_users_today}
              icon="🟢"
              change={{ value: 23, type: 'increase', period: 'vs yesterday' }}
              color="green"
              loading={loadingData}
            />
            <StatsCard
              title="Buku Dibaca Hari Ini"
              value={currentStats.books_read_today}
              icon="📖"
              change={{ value: 8, type: 'increase', period: 'vs yesterday' }}
              color="blue"
              loading={loadingData}
            />
            <StatsCard
              title="Kuis Selesai Hari Ini"
              value={currentStats.quizzes_completed_today}
              icon="✅"
              change={{ value: 12, type: 'decrease', period: 'vs yesterday' }}
              color="purple"
              loading={loadingData}
            />
            <StatsCard
              title="Reward Ditukar Hari Ini"
              value={currentStats.rewards_redeemed_today}
              icon="🎉"
              change={{ value: 3, type: 'increase', period: 'vs yesterday' }}
              color="yellow"
              loading={loadingData}
            />
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Students */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h3 className="text-xl font-black text-gray-900 mb-6">🏆 Top Students</h3>
              <div className="space-y-4">
                {currentTopStudents.map((student, index) => (
                  <div key={student.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-blue-600">{student.total_points} pts</p>
                      <p className="text-xs text-gray-500">{student.books_read} books</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Books */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h3 className="text-xl font-black text-gray-900 mb-6">📈 Popular Books</h3>
              <div className="space-y-4">
                {bookStats.slice(0, 5).map((book, index) => (
                  <div key={book.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-gray-900 line-clamp-1">{book.title}</p>
                      <p className="text-sm text-gray-600">{book.total_reads} reads</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-green-600">{book.average_completion_rate}%</p>
                      <p className="text-xs text-gray-500">completion</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <AnalyticsChart
              title="Quiz Performance Distribution"
              type="pie"
              data={[]}
              height={250}
              loading={loadingData}
            />
            <AnalyticsChart
              title="Reward Categories"
              type="bar"
              data={[]}
              height={250}
              loading={loadingData}
            />
            <AnalyticsChart
              title="User Growth"
              type="area"
              data={[]}
              height={250}
              loading={loadingData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
