'use client';

import { useEffect, useState } from 'react';
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

interface SiswaStats {
  total_points: number;
  books_read: number;
  pages_read: number;
  quizzes_taken: number;
}

export default function SiswaDashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<SiswaStats | null>(null);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<Ebook[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'ebooks' | 'rewards' | 'quizzes'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading || !isAuthenticated) return;

    if (!user || user.role !== 'siswa') {
      router.push('/login');
      return;
    }

    loadDashboardData();
  }, [mounted, loading, isAuthenticated, user, router]);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Load stats
      const statsRes = await api.dashboard.siswaStats();
      setStats((statsRes as any) as SiswaStats | null);

      // Load ebooks
      const ebooksRes = await api.ebooks.list();
      if (ebooksRes?.data) {
        const ebooksArray = Array.isArray(ebooksRes.data) 
          ? ebooksRes.data 
          : (ebooksRes.data as Record<string, unknown>)?.data && Array.isArray((ebooksRes.data as Record<string, unknown>).data)
            ? (ebooksRes.data as Record<string, unknown>).data as Ebook[]
            : [];
        setEbooks(ebooksArray as Ebook[]);
        // Show all ebooks in slider (most popular/read books)
        setFavoriteBooks(ebooksArray as Ebook[]);
      }

      // Load rewards
      const rewardsRes = await api.rewards.list();
      if (rewardsRes?.data) {
        const rewardsArray = Array.isArray(rewardsRes.data) 
          ? rewardsRes.data 
          : (rewardsRes.data as Record<string, unknown>)?.data && Array.isArray((rewardsRes.data as Record<string, unknown>).data)
            ? (rewardsRes.data as Record<string, unknown>).data as Reward[]
            : [];
        setRewards(rewardsArray as Reward[]);
      }

      // Load quizzes from API
      const quizzesRes = await api.getQuizzes(0); // Get all quizzes
      if (quizzesRes?.data) {
        const quizzesArray = Array.isArray(quizzesRes.data) 
          ? quizzesRes.data 
          : [];
        setQuizzes(quizzesArray as Quiz[]);
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMsg);
      console.error('[Dashboard] Error:', errorMsg);
    } finally {
      setLoadingData(false);
    }
  };

  const handleRedeemReward = async (rewardId: number) => {
    try {
      await api.rewards.redeem(rewardId);
      // Refresh data after redemption
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to redeem reward:', error);
    }
  };

  const handleStartQuiz = (quizId: number) => {
    router.push(`/dashboard/siswa/quiz/${quizId}`);
  };

  if (!mounted || loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 via-orange-50 to-amber-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-amber-700 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'siswa') {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-amber-50 via-amber-100 to-amber-50 relative overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="w-full">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-700 text-sm shadow-sm">
              <p className="font-semibold flex items-center gap-2">
                <span>⚠️</span> Terjadi Kesalahan
              </p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {/* Search Bar - Always visible */}
          <div className="mb-6">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Cari buku berdasarkan judul, penulis, atau kategori..."
            />
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              ebooksCount={ebooks.length}
              rewardsCount={rewards.length}
              quizzesCount={quizzes.length}
            />
          </div>

          {/* Frequently Read Books Slider - Always show below navigation */}
          {favoriteBooks.length > 0 && (
            <div className="mb-8 bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100">
              <FavoriteBooksSlider
                books={favoriteBooks}
                onBookClick={(bookId) => {
                  // Open PDF directly
                  const book = favoriteBooks.find(b => b.id === bookId);
                  if (book?.pdf_file) {
                    window.open(book.pdf_file, '_blank');
                  }
                }}
              />
            </div>
          )}

          {/* Decorative Separator */}
          <div className="w-full h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 mb-8 rounded-full shadow-md shadow-amber-500/20"></div>

          {/* Content Sections */}
          <div className="bg-white/80 backdrop-blur-sm w-full p-6 rounded-2xl border border-amber-200 shadow-lg">
            {loadingData ? (
              <div className="text-center py-16">
                <div className="inline-flex flex-col items-center gap-4">
                  <div className="w-14 h-14 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
                  <p className="text-amber-700 font-medium">Memuat data...</p>
                </div>
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
