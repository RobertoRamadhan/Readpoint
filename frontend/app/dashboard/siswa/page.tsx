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
    { label: 'Total Poin', value: stats?.total_points ?? 0, helper: 'Poin yang bisa ditukar reward' },
    { label: 'Buku Dibaca', value: stats?.books_read ?? 0, helper: 'Jumlah buku selesai dibaca' },
    { label: 'Halaman Dibaca', value: stats?.pages_read ?? 0, helper: 'Total halaman yang dibaca' },
    { label: 'Kuis Selesai', value: stats?.quizzes_taken ?? 0, helper: 'Kuis yang sudah dikerjakan' },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      <div className="mx-auto w-full space-y-5 py-6 sm:space-y-6 sm:py-8 lg:space-y-7 lg:py-10">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 shadow-sm sm:rounded-xl sm:p-5 sm:text-sm">
            {error}
          </div>
        )}

        {/* Search Section */}
        <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:rounded-xl sm:p-4 lg:p-5">
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

        {/* Recommended Books Section */}
        {!loadingData && ebooks.length > 0 && (
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:rounded-xl sm:p-5 lg:p-8">
            <div className="mb-4 sm:mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 sm:text-sm">Rekomendasi</p>
              <h2 className="mt-2 text-lg font-black text-slate-900 sm:text-xl lg:text-2xl">Buku yang Direkomendasikan</h2>
            </div>
            <FavoriteBooksSlider
              books={favoriteBooks}
              onBookClick={(bookId) => {
                const book = ebooks.find(b => b.id === bookId);
                if (book?.pdf_file) {
                  window.open(book.pdf_file, '_blank');
                }
              }}
            />
          </section>
        )}

        {/* Stats Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 lg:gap-6">
          {statCards.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:rounded-xl sm:p-5 lg:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 sm:text-sm">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl lg:mt-4 lg:text-4xl">{item.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm lg:mt-3">{item.helper}</p>
            </div>
          ))}
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

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:rounded-xl sm:p-5 lg:p-8">
          {loadingData ? (
            <div className="py-12 text-center sm:py-16 lg:py-20">
              <Loading size="lg" text="Memuat data..." />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab />}

              {activeTab === 'ebooks' && (
                <div>
                  <div className="mb-4 sm:mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 sm:text-sm">Koleksi</p>
                    <h2 className="mt-2 text-lg font-black text-slate-900 sm:text-xl lg:text-2xl">Daftar E-Books</h2>
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
                    <h2 className="mt-2 text-lg font-black text-slate-900 sm:text-xl lg:text-2xl">Daftar Rewards</h2>
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
                    <h2 className="mt-2 text-lg font-black text-slate-900 sm:text-xl lg:text-2xl">Daftar Kuis</h2>
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
