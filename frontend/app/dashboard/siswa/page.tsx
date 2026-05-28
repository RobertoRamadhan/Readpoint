'use client';

// Redesigned Siswa Dashboard - Fully Responsive

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import BookGrid from '@/components/siswa/BookGrid';
import RewardGrid from '@/components/siswa/RewardGrid';
import QuizList from '@/components/siswa/QuizList';
import TabNavigation from '@/components/siswa/TabNavigation';
import FavoriteBooksSlider from '@/components/siswa/FavoriteBooksSlider';
import OverviewTab from '@/components/siswa/OverviewTab';
import SearchBar from '@/components/shared/SearchBar';
import { Loading, PageLoading } from '@/components/shared';

interface SiswaStats {
  total_points: number;
  books_read: number;
  pages_read: number;
  quizzes_taken: number;
}

interface Ebook {
  id: number;
  title: string;
  author: string;
  pages: number;
  poin_per_halaman: number;
  category: string;
  cover_image?: string;
  pdf_file?: string;
  read_count?: number;
}

interface Reward {
  id: number;
  name: string;
  description: string;
  points_required: number;
  stock: number;
  image_url?: string;
}

interface Quiz {
  id: number;
  ebook_id: number;
  ebook_title?: string;
  title?: string;
  total_questions: number;
  difficulty: string;
  points_reward: number;
}

let dashboardCache: {
  stats: SiswaStats | null;
  ebooks: Ebook[];
  rewards: Reward[];
  quizzes: Quiz[];
  cachedAt: number;
} | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000;

export default function SiswaDashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<SiswaStats | null>(dashboardCache?.stats ?? null);
  const [ebooks, setEbooks] = useState<Ebook[]>(dashboardCache?.ebooks ?? []);
  const [favoriteBooks, setFavoriteBooks] = useState<Ebook[]>(dashboardCache?.ebooks ?? []);
  const [rewards, setRewards] = useState<Reward[]>(dashboardCache?.rewards ?? []);
  const [quizzes, setQuizzes] = useState<Quiz[]>(dashboardCache?.quizzes ?? []);
  const [activeTab, setActiveTab] = useState<'overview' | 'ebooks' | 'rewards' | 'quizzes'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const isCacheFresh = dashboardCache && (Date.now() - dashboardCache.cachedAt) < CACHE_TTL_MS;
  const [loadingData, setLoadingData] = useState(!isCacheFresh);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => { 
    setMounted(true);
    // Clear cache on mount to force fresh data fetch
    dashboardCache = null;
  }, []);

  useEffect(() => {
    if (!mounted || loading || !isAuthenticated) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }

    if (isCacheFresh) {
      setStats(dashboardCache!.stats);
      setEbooks(dashboardCache!.ebooks);
      setFavoriteBooks(dashboardCache!.ebooks);
      setRewards(dashboardCache!.rewards);
      setQuizzes(dashboardCache!.quizzes);
      setLoadingData(false);
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    loadDashboardData();
  }, [mounted, loading, isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      const [statsRes, ebooksRes, rewardsRes, quizzesRes] = await Promise.allSettled([
        api.dashboard.siswaStats(),
        api.ebooks.list(),
        api.rewards.list(),
        api.getAllQuizzes(),
      ]);

      const newStats = statsRes.status === 'fulfilled'
        ? (statsRes.value as any) as SiswaStats
        : null;
      setStats(newStats);

      let newEbooks: Ebook[] = [];
      if (ebooksRes.status === 'fulfilled' && ebooksRes.value?.data) {
        const d = ebooksRes.value.data;
        newEbooks = Array.isArray(d) ? d as Ebook[]
          : Array.isArray((d as any)?.data) ? (d as any).data as Ebook[]
          : [];
      }
      setEbooks(newEbooks);
      setFavoriteBooks(newEbooks);

      let newRewards: Reward[] = [];
      if (rewardsRes.status === 'fulfilled' && rewardsRes.value?.data) {
        const d = rewardsRes.value.data;
        newRewards = Array.isArray(d) ? d as Reward[]
          : Array.isArray((d as any)?.data) ? (d as any).data as Reward[]
          : [];
      }
      setRewards(newRewards);

      let newQuizzes: Quiz[] = [];
      if (quizzesRes.status === 'fulfilled' && quizzesRes.value?.data) {
        const d = quizzesRes.value.data;
        newQuizzes = Array.isArray(d) ? d as Quiz[] : [];
      }
      setQuizzes(newQuizzes);

      dashboardCache = {
        stats: newStats,
        ebooks: newEbooks,
        rewards: newRewards,
        quizzes: newQuizzes,
        cachedAt: Date.now(),
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat data dashboard';
      setError(errorMsg);
    } finally {
      setLoadingData(false);
    }
  };

  const handleRedeemReward = async (rewardId: number) => {
    try {
      await api.rewards.redeem(rewardId);
      dashboardCache = null;
      fetchedRef.current = false;
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to redeem reward:', error);
    }
  };

  if (!mounted || loading) {
    return <PageLoading />;
  }

  if (!isAuthenticated || !user || user.role !== 'siswa') {
    return null;
  }

  const statCards = [
    { label: 'Buku Dibaca', value: stats?.books_read ?? 0, helper: 'Jumlah buku selesai dibaca' },
    { label: 'Halaman Dibaca', value: stats?.pages_read ?? 0, helper: 'Total halaman yang dibaca' },
    { label: 'Kuis Selesai', value: stats?.quizzes_taken ?? 0, helper: 'Kuis yang sudah dikerjakan' },
  ];

  const weeklyTargetProgress = Math.min(((stats?.books_read ?? 0) / 5) * 100, 100);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {error && (
          <div className="rounded-lg sm:rounded-xl border border-red-200 bg-red-50 p-4 sm:p-5 text-xs sm:text-sm font-semibold text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {/* Welcome Section */}
        <section className="rounded-lg sm:rounded-xl border border-slate-200 bg-white shadow-sm sm:shadow-md">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-4 sm:p-6 lg:p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 sm:text-sm">Selamat Datang</p>
              <h1 className="mt-2 sm:mt-3 lg:mt-4 text-xl sm:text-2xl lg:text-4xl font-black leading-tight text-slate-900">
                Halo, {user.name}! 👋
              </h1>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base font-medium text-slate-600">Siap lanjut membaca hari ini?</p>
            </div>

            <div className="bg-slate-900 p-4 sm:p-6 lg:p-8 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300 sm:text-sm">Poin Kamu</p>
              <p className="mt-2 sm:mt-3 lg:mt-4 text-3xl sm:text-4xl lg:text-5xl font-black text-white">{stats?.total_points ?? 0}</p>
              <p className="mt-1 sm:mt-2 text-xs leading-5 sm:leading-6 text-slate-300 lg:text-sm">Poin dapat digunakan untuk menukar reward.</p>

              <div className="mt-4 sm:mt-5 lg:mt-6 rounded-lg border border-white/10 bg-white/10 p-3 sm:p-4 lg:p-5">
                <div className="flex items-center justify-between gap-2 sm:gap-3 text-xs font-bold text-slate-200 sm:text-sm">
                  <span>Target membaca mingguan</span>
                  <span>{Math.min(stats?.books_read ?? 0, 5)}/5 buku</span>
                </div>
                <div className="mt-2 sm:mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${weeklyTargetProgress}%` }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-6">
          {statCards.map((item) => (
            <div key={item.label} className="rounded-lg sm:rounded-xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6 shadow-sm transition hover:shadow-md">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 sm:text-sm">{item.label}</p>
              <p className="mt-2 sm:mt-3 lg:mt-4 text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">{item.value}</p>
              <p className="mt-1 sm:mt-2 lg:mt-3 text-xs font-medium text-slate-600 sm:text-sm">{item.helper}</p>
            </div>
          ))}
        </section>

        {!loadingData && ebooks.length > 0 && (
          <section className="rounded-lg sm:rounded-xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-8 shadow-sm">
            <div className="mb-4 sm:mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 sm:text-sm">Rekomendasi</p>
              <h2 className="mt-2 text-lg sm:text-xl lg:text-2xl font-black text-slate-900">Buku yang Direkomendasikan</h2>
            </div>
            <FavoriteBooksSlider 
              books={ebooks} 
              onBookClick={(bookId) => {
                const book = ebooks.find(b => b.id === bookId);
                if (book?.pdf_file) {
                  window.open(book.pdf_file, '_blank');
                }
              }}
            />
          </section>
        )}

        <section className="rounded-lg sm:rounded-xl border border-slate-200 bg-white p-3 sm:p-4 lg:p-6 shadow-sm">
          <SearchBar
            onSearch={setSearchQuery}
            onBookClick={(book) => {
              if (book.pdf_file) {
                window.open(book.pdf_file, '_blank');
              }
            }}
            ebooks={ebooks}
            placeholder="Cari buku berdasarkan judul, penulis, atau kategori..."
          />
        </section>

        <section>
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            ebooksCount={ebooks.length}
            rewardsCount={rewards.length}
            quizzesCount={quizzes.length}
          />
        </section>

        <section className="rounded-lg sm:rounded-xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-8 shadow-sm">
          {loadingData ? (
            <div className="py-12 sm:py-16 lg:py-20 text-center">
              <Loading size="lg" text="Memuat data..." />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab />}

              {activeTab === 'ebooks' && (
                <div>
                  <div className="mb-4 sm:mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 sm:text-sm">Koleksi</p>
                    <h2 className="mt-2 text-lg sm:text-xl lg:text-2xl font-black text-slate-900">Daftar E-Books</h2>
                  </div>
                  <BookGrid
                    ebooks={ebooks}
                    loading={loadingData}
                    searchQuery={searchQuery}
                  />
                </div>
              )}

              {activeTab === 'rewards' && (
                <div>
                  <div className="mb-4 sm:mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 sm:text-sm">Hadiah</p>
                    <h2 className="mt-2 text-lg sm:text-xl lg:text-2xl font-black text-slate-900">Daftar Rewards</h2>
                  </div>
                  <RewardGrid
                    rewards={rewards}
                    userPoints={stats?.total_points || 0}
                    loading={loadingData}
                    onRedeem={handleRedeemReward}
                  />
                </div>
              )}

              {activeTab === 'quizzes' && (
                <div>
                  <div className="mb-4 sm:mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 sm:text-sm">Evaluasi</p>
                    <h2 className="mt-2 text-lg sm:text-xl lg:text-2xl font-black text-slate-900">Daftar Kuis</h2>
                  </div>
                  <QuizList
                    quizzes={quizzes}
                    loading={loadingData}
                    onStartQuiz={(quizId: number) => {
                      router.push(`/dashboard/siswa/quiz/${quizId}`);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
