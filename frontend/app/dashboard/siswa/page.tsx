'use client';

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

  useEffect(() => { setMounted(true); }, []);

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
    {
      label: 'Total Poin',
      value: stats?.total_points ?? 0,
      helper: 'Siap ditukar reward',
      icon: '⭐',
      color: 'bg-[#F4B400]',
    },
    {
      label: 'Buku Dibaca',
      value: stats?.books_read ?? 0,
      helper: 'Koleksi selesai',
      icon: '📚',
      color: 'bg-[#2E7D32]',
    },
    {
      label: 'Halaman Dibaca',
      value: stats?.pages_read ?? 0,
      helper: 'Progress literasi',
      icon: '📖',
      color: 'bg-[#1E3A5F]',
    },
    {
      label: 'Kuis Selesai',
      value: stats?.quizzes_taken ?? 0,
      helper: 'Pemahaman bacaan',
      icon: '🎯',
      color: 'bg-[#2E7D32]',
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#FAF3E0] text-[#2D2D2D]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-80">
        <div className="absolute -top-24 right-[-5rem] h-80 w-80 rounded-full bg-[#F4B400]/25 blur-3xl" />
        <div className="absolute left-[-5rem] top-80 h-96 w-96 rounded-full bg-[#2E7D32]/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-[#1E3A5F]/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
            <p className="flex items-center gap-2 font-black">
              <span>⚠️</span> Terjadi Kesalahan
            </p>
            <p className="mt-2 font-medium">{error}</p>
          </div>
        )}

        <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white/75 shadow-2xl shadow-[#1E3A5F]/10 backdrop-blur-xl">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[#E6D8B8] bg-[#FAF3E0] px-4 py-2 text-sm font-black text-[#1E3A5F]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2E7D32]" />
                Dashboard Siswa READPOINT
              </div>

              <h1 className="text-3xl font-black leading-tight text-[#1E3A5F] sm:text-4xl lg:text-5xl">
                Halo, {user.name}! Siap lanjut membaca hari ini?
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-8 text-[#5A5146]">
                Pilih buku, selesaikan kuis, kumpulkan poin, lalu tukarkan reward. Semua aktivitas literasi kamu tercatat rapi di dashboard ini.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setActiveTab('ebooks')}
                  className="rounded-2xl bg-[#2E7D32] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#2E7D32]/20 transition-all hover:-translate-y-0.5 hover:bg-[#256A2A]"
                >
                  📚 Lihat E-Book
                </button>
                <button
                  onClick={() => setActiveTab('quizzes')}
                  className="rounded-2xl border border-[#E6D8B8] bg-[#FAF3E0] px-6 py-3.5 text-sm font-black text-[#1E3A5F] transition-all hover:-translate-y-0.5 hover:bg-white"
                >
                  🎯 Kerjakan Kuis
                </button>
              </div>
            </div>

            <div className="bg-[#1E3A5F] p-6 text-white sm:p-8 lg:p-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.25em] text-[#F4B400]">Poin Kamu</p>
                  <p className="mt-2 text-5xl font-black">{stats?.total_points ?? 0}</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-3xl">🏆</div>
              </div>

              <div className="mt-8 rounded-3xl bg-white/10 p-5 backdrop-blur">
                <div className="mb-3 flex items-center justify-between text-sm font-bold text-white/80">
                  <span>Target membaca mingguan</span>
                  <span>{Math.min(stats?.books_read ?? 0, 5)}/5 buku</span>
                </div>
                <div className="h-3 rounded-full bg-white/15">
                  <div
                    className="h-3 rounded-full bg-[#F4B400] transition-all"
                    style={{ width: `${Math.min(((stats?.books_read ?? 0) / 5) * 100, 100)}%` }}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Terus membaca untuk membuka lebih banyak poin dan kesempatan menukar reward.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => (
            <div key={item.label} className="rounded-3xl border border-[#E6D8B8] bg-white/85 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1E3A5F]/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-[#5A5146]">{item.label}</p>
                  <p className="mt-2 text-3xl font-black text-[#1E3A5F]">{item.value}</p>
                  <p className="mt-1 text-sm font-semibold text-[#5A5146]">{item.helper}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.color} text-xl shadow-lg`}>
                  {item.icon}
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mb-8 rounded-[2rem] border border-[#E6D8B8] bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5">
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

        <section className="mb-8">
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            ebooksCount={ebooks.length}
            rewardsCount={rewards.length}
            quizzesCount={quizzes.length}
          />
        </section>

        {favoriteBooks.length > 0 && activeTab === 'overview' && (
          <section className="mb-8 overflow-hidden rounded-[2rem] border border-[#E6D8B8] bg-white/85 p-6 shadow-xl shadow-[#1E3A5F]/10 backdrop-blur sm:p-8">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#2E7D32]">Rekomendasi</p>
                <h2 className="mt-2 text-2xl font-black text-[#1E3A5F] sm:text-3xl">Buku Populer untuk Dibaca</h2>
              </div>
              <button
                onClick={() => setActiveTab('ebooks')}
                className="rounded-2xl bg-[#FAF3E0] px-5 py-3 text-sm font-black text-[#1E3A5F] transition-all hover:bg-[#F4B400]/20"
              >
                Lihat semua buku
              </button>
            </div>
            <FavoriteBooksSlider
              books={favoriteBooks}
              onBookClick={(bookId) => {
                const book = favoriteBooks.find(b => b.id === bookId);
                if (book?.pdf_file) {
                  window.open(book.pdf_file, '_blank');
                }
              }}
            />
          </section>
        )}

        <section className="rounded-[2rem] border border-[#E6D8B8] bg-white/90 p-5 shadow-2xl shadow-[#1E3A5F]/10 backdrop-blur sm:p-7 lg:p-8">
          {loadingData ? (
            <div className="py-20 text-center">
              <Loading size="lg" text="Memuat data..." />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab />}

              {activeTab === 'ebooks' && (
                <BookGrid
                  ebooks={ebooks}
                  loading={loadingData}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === 'rewards' && (
                <RewardGrid
                  rewards={rewards}
                  userPoints={stats?.total_points || 0}
                  loading={loadingData}
                  onRedeem={handleRedeemReward}
                />
              )}

              {activeTab === 'quizzes' && (
                <QuizList
                  quizzes={quizzes}
                  loading={loadingData}
                  onStartQuiz={(quizId: number) => {
                    router.push(`/dashboard/siswa/quiz/${quizId}`);
                  }}
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
