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

// Module-level cache — survives navigation, cleared on logout
let dashboardCache: {
  stats: SiswaStats | null;
  ebooks: Ebook[];
  rewards: Reward[];
  quizzes: Quiz[];
  cachedAt: number;
} | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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
  // If cache is fresh, start with loadingData = false so page renders instantly
  const isCacheFresh = dashboardCache && (Date.now() - dashboardCache.cachedAt) < CACHE_TTL_MS;
  const [loadingData, setLoadingData] = useState(!isCacheFresh);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || loading || !isAuthenticated) return;
    if (!user || user.role !== 'siswa') { router.push('/login'); return; }

    // If cache is fresh, skip fetching — render instantly
    if (isCacheFresh) {
      setStats(dashboardCache!.stats);
      setEbooks(dashboardCache!.ebooks);
      setFavoriteBooks(dashboardCache!.ebooks);
      setRewards(dashboardCache!.rewards);
      setQuizzes(dashboardCache!.quizzes);
      setLoadingData(false);
      return;
    }

    // Prevent double-fetch in StrictMode
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    loadDashboardData();
  }, [mounted, loading, isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Run all requests in parallel — much faster than sequential
      const [statsRes, ebooksRes, rewardsRes, quizzesRes] = await Promise.allSettled([
        api.dashboard.siswaStats(),
        api.ebooks.list(),
        api.rewards.list(),
        api.getAllQuizzes(),
      ]);

      // Stats
      const newStats = statsRes.status === 'fulfilled'
        ? (statsRes.value as any) as SiswaStats
        : null;
      setStats(newStats);

      // Ebooks
      let newEbooks: Ebook[] = [];
      if (ebooksRes.status === 'fulfilled' && ebooksRes.value?.data) {
        const d = ebooksRes.value.data;
        newEbooks = Array.isArray(d) ? d as Ebook[]
          : Array.isArray((d as any)?.data) ? (d as any).data as Ebook[]
          : [];
      }
      setEbooks(newEbooks);
      setFavoriteBooks(newEbooks);

      // Rewards
      let newRewards: Reward[] = [];
      if (rewardsRes.status === 'fulfilled' && rewardsRes.value?.data) {
        const d = rewardsRes.value.data;
        newRewards = Array.isArray(d) ? d as Reward[]
          : Array.isArray((d as any)?.data) ? (d as any).data as Reward[]
          : [];
      }
      setRewards(newRewards);

      // Quizzes
      let newQuizzes: Quiz[] = [];
      if (quizzesRes.status === 'fulfilled' && quizzesRes.value?.data) {
        const d = quizzesRes.value.data;
        newQuizzes = Array.isArray(d) ? d as Quiz[] : [];
      }
      setQuizzes(newQuizzes);

      // Save to cache
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
      // Invalidate cache and reload
      dashboardCache = null;
      fetchedRef.current = false;
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to redeem reward:', error);
    }
  };

  const handleStartQuiz = (quizId: number) => {
    router.push(`/dashboard/siswa/quiz/${quizId}`);
  };

  // Only show full-screen spinner on very first load (no cache at all)
  if (!mounted || loading) {
    return <PageLoading />;
  }

  if (!isAuthenticated || !user || user.role !== 'siswa') {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-amber-50 via-amber-50 to-orange-50 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
        <div className="absolute top-10 right-20 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="w-full">
          {error && (
            <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm shadow-sm animate-slide-up">
              <p className="font-semibold flex items-center gap-2">
                <span>⚠️</span> Terjadi Kesalahan
              </p>
              <p className="mt-2">{error}</p>
            </div>
          )}

          {/* Search Bar Section */}
          <div className="mb-10">
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
          </div>

          {/* Tab Navigation Section */}
          <div className="mb-10">
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              ebooksCount={ebooks.length}
              rewardsCount={rewards.length}
              quizzesCount={quizzes.length}
            />
          </div>

          {/* Featured Books Slider */}
          {favoriteBooks.length > 0 && (
            <div className="mb-12">
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-8 shadow-lg border-2 border-amber-200">
                <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">📚 Buku Populer</h2>
                <FavoriteBooksSlider
                  books={favoriteBooks}
                  onBookClick={(bookId) => {
                    const book = favoriteBooks.find(b => b.id === bookId);
                    if (book?.pdf_file) {
                      window.open(book.pdf_file, '_blank');
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Decorative Separator */}
          <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-12 rounded-full shadow-md shadow-amber-300/30"></div>

          {/* Content Section */}
          <div className="bg-white/85 backdrop-blur-sm w-full p-8 lg:p-10 rounded-2xl border-2 border-amber-200 shadow-xl">
            {loadingData ? (
              <div className="text-center py-20">
                <Loading size="lg" text="Memuat data..." />
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <OverviewTab />
                )}

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
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimatedBackground() {
  return (
    <>
      <style>{`
        @keyframes bubble {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(1);
            opacity: 0;
          }
        }
        
        @keyframes drift {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(30px); }
        }
        
        .bubble {
          position: fixed;
          bottom: -100px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(99,102,241,0.2));
          border: 2px solid rgba(99,102,241,0.3);
          pointer-events: none;
          filter: blur(1px);
        }
        
        .bubble:nth-child(1) { 
          width: 80px; 
          height: 80px; 
          left: 10%; 
          animation: bubble 15s infinite, drift 6s ease-in-out infinite;
          animation-delay: 0s, 0s;
        }
        
        .bubble:nth-child(2) { 
          width: 60px; 
          height: 60px; 
          left: 20%; 
          animation: bubble 17s infinite, drift 7s ease-in-out infinite;
          animation-delay: 2s, 1s;
        }
        
        .bubble:nth-child(3) { 
          width: 100px; 
          height: 100px; 
          left: 30%; 
          animation: bubble 18s infinite, drift 8s ease-in-out infinite;
          animation-delay: 4s, 2s;
        }
        
        .bubble:nth-child(4) { 
          width: 50px; 
          height: 50px; 
          left: 45%; 
          animation: bubble 16s infinite, drift 5s ease-in-out infinite;
          animation-delay: 1s, 0.5s;
        }
        
        .bubble:nth-child(5) { 
          width: 70px; 
          height: 70px; 
          left: 60%; 
          animation: bubble 19s infinite, drift 9s ease-in-out infinite;
          animation-delay: 3s, 1.5s;
        }
        
        .bubble:nth-child(6) { 
          width: 90px; 
          height: 90px; 
          left: 75%; 
          animation: bubble 17s infinite, drift 6s ease-in-out infinite;
          animation-delay: 2.5s, 2s;
        }
        
        .bubble:nth-child(7) { 
          width: 55px; 
          height: 55px; 
          left: 85%; 
          animation: bubble 16s infinite, drift 7s ease-in-out infinite;
          animation-delay: 4.5s, 1s;
        }
        
        .bubble:nth-child(8) { 
          width: 75px; 
          height: 75px; 
          left: 50%; 
          animation: bubble 18s infinite, drift 8s ease-in-out infinite;
          animation-delay: 5s, 2.5s;
        }
      `}</style>

      {/* Bubble Background */}
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
    </>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-2 h-12 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
      <h3 className="text-3xl md:text-4xl font-black text-gray-900">{title}</h3>
    </div>
  );
}
