'use client';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageLoading } from '@/components/shared';
import HistoryTabs from '@/components/siswa/HistoryTabs';
import PointHistoryCard from '@/components/siswa/PointHistoryCard';
import QuizHistoryCard from '@/components/siswa/QuizHistoryCard';
import ActivityHistoryCard from '@/components/siswa/ActivityHistoryCard';

interface PointTransaction {
  id: number;
  type: 'earned' | 'spent' | 'bonus' | 'penalty';
  amount: number;
  description: string;
  source: string;
  created_at: string;
  balance_after: number;
}

interface QuizAttempt {
  id: number;
  quiz_id: number;
  quiz_title: string;
  ebook_title: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken_minutes: number;
  passed: boolean;
  points_earned: number;
  created_at: string;
}

interface ReadingActivity {
  id: number;
  ebook_id: number;
  ebook_title: string;
  ebook_author: string;
  pages_read: number;
  total_pages: number;
  reading_time_minutes: number;
  points_earned: number;
  status: 'in_progress' | 'completed' | 'validated';
  started_at: string;
  completed_at?: string;
  validated_at?: string;
}

export default function HistoryPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'points' | 'quiz' | 'activity'>('points');
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizAttempt[]>([]);
  const [activityHistory, setActivityHistory] = useState<ReadingActivity[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!mounted || loading || !isAuthenticated) return;

    if (!user || user.role !== 'siswa') {
      router.push('/login');
      return;
    }

    loadHistoryData();
  }, [mounted, loading, isAuthenticated, user, router]);

  async function loadHistoryData() {
    try {
      setLoadingData(true);
      setError(null);

      // Load points history
      try {
        const pointsRes = await api.dashboard.siswaPointsHistory();
        if (pointsRes?.data) {
          setPointHistory(pointsRes.data as PointTransaction[]);
        }
      } catch (err) {
        console.warn('Points history not available:', err);
        setPointHistory([]);
      }

      // Load quiz history
      try {
        const quizRes = await api.dashboard.siswaQuizAttempts();
        if (quizRes?.data) {
          setQuizHistory(quizRes.data as QuizAttempt[]);
        }
      } catch (err) {
        console.warn('Quiz history not available:', err);
        setQuizHistory([]);
      }

      // Load reading activities
      try {
        const activityRes = await api.dashboard.siswaReadingActivities();
        if (activityRes?.data) {
          setActivityHistory(activityRes.data as ReadingActivity[]);
        }
      } catch (err) {
        console.warn('Activity history not available:', err);
        setActivityHistory([]);
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load history data';
      setError(errorMsg);
      console.error('[History] Error:', errorMsg);
    } finally {
      setLoadingData(false);
    }
  };

  const handleViewQuizDetails = (attemptId: number) => {
    router.push(`/dashboard/siswa/quiz/${attemptId}/result`);
  };

  const handleRetakeQuiz = (quizId: number) => {
    router.push(`/dashboard/siswa/quiz/${quizId}`);
  };

  const handleViewActivityDetails = (activityId: number) => {
    router.push(`/dashboard/siswa/activity/${activityId}`);
  };

  const handleContinueReading = (ebookId: number) => {
    router.push(`/dashboard/siswa/read/${ebookId}`);
  };

  if (!mounted || loading) {
    return <PageLoading />;
  }

  if (!isAuthenticated || !user || user.role !== 'siswa') {
    return null;
  }

  const counts = {
    points: pointHistory.length,
    quiz: quizHistory.length,
    activity: activityHistory.length
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Tabs */}
          <HistoryTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />

          {/* Content */}
          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Points History */}
              {activeTab === 'points' && (
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-6">💰 Points History</h2>
                  {pointHistory.length === 0 ? (
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                      <p className="text-gray-800 font-black text-lg">💰 No points history yet</p>
                      <p className="text-gray-600 font-semibold mt-2">Start reading and taking quizzes to earn points!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pointHistory.map((transaction) => (
                        <PointHistoryCard key={transaction.id} transaction={transaction} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Quiz History */}
              {activeTab === 'quiz' && (
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-6">📝 Quiz History</h2>
                  {quizHistory.length === 0 ? (
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                      <p className="text-gray-800 font-black text-lg">📝 No quiz attempts yet</p>
                      <p className="text-gray-600 font-semibold mt-2">Complete reading activities to unlock quizzes!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {quizHistory.map((attempt) => (
                        <QuizHistoryCard
                          key={attempt.id}
                          attempt={attempt}
                          onViewDetails={handleViewQuizDetails}
                          onRetakeQuiz={handleRetakeQuiz}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Activity History */}
              {activeTab === 'activity' && (
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-6">📚 Reading Activity</h2>
                  {activityHistory.length === 0 ? (
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                      <p className="text-gray-800 font-black text-lg">📚 No reading activities yet</p>
                      <p className="text-gray-600 font-semibold mt-2">Start your reading journey today!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activityHistory.map((activity) => (
                        <ActivityHistoryCard
                          key={activity.id}
                          activity={activity}
                          onViewDetails={handleViewActivityDetails}
                          onContinueReading={handleContinueReading}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
