'use client';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageLoading } from '@/components/shared';
import QuizCard from '@/components/guru/QuizCard';
import QuizForm, { QuizFormData } from '@/components/guru/QuizForm';
import QuizFilters from '@/components/guru/QuizFilters';

interface Quiz {
  id: number;
  ebook_id: number;
  ebook_title?: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points_reward: number;
  time_limit_minutes: number;
  passing_score: number;
  total_questions: number;
  created_at: string;
  is_active: boolean;
}

interface Ebook {
  id: number;
  title: string;
  author: string;
}

export default function QuizManagementPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading || !isAuthenticated) return;

    if (!user || user.role !== 'guru') {
      router.push('/login');
      return;
    }

    loadQuizData();
  }, [mounted, loading, isAuthenticated, user, router]);

  const loadQuizData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Load quizzes
      const quizzesRes = await api.quiz.getMyQuizzes();
      if (quizzesRes?.data) {
        setQuizzes(quizzesRes.data as Quiz[]);
      }

      // Load ebooks for dropdown
      const ebooksRes = await api.ebooks.list();
      if (ebooksRes?.data) {
        setEbooks(ebooksRes.data as Ebook[]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load quiz data';
      setError(errorMsg);
      console.error('[Quiz Management] Error:', errorMsg);
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateQuiz = async (quizData: QuizFormData) => {
    try {
      setActionLoading(true);
      await api.quiz.create(quizData as unknown as Record<string, unknown>);
      
      // Wait 1 second to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh data
      await loadQuizData();
      setShowFormModal(false);
      setEditingQuiz(null);
    } catch (error) {
      console.error('Failed to create quiz:', error);
      throw error; // Re-throw to let form handle it
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateQuiz = async (quizData: QuizFormData) => {
    try {
      setActionLoading(true);
      await api.quiz.update(quizData.id!, quizData as unknown as Record<string, unknown>);
      
      // Wait 1 second to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh data
      await loadQuizData();
      setShowFormModal(false);
      setEditingQuiz(null);
    } catch (error) {
      console.error('Failed to update quiz:', error);
      throw error; // Re-throw to let form handle it
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus quiz ini? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        setActionLoading(true);
        await api.quiz.delete(quizId);
        
        // Wait 1 second to ensure database is updated
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh data
        await loadQuizData();
      } catch (error) {
        console.error('Failed to delete quiz:', error);
        alert('Gagal menghapus quiz. Silakan coba lagi.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleToggleStatus = async (quizId: number, active: boolean) => {
    try {
      setActionLoading(true);
      await api.quiz.update(quizId, { is_active: active });
      
      // Wait 1 second to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh data
      await loadQuizData();
    } catch (error) {
      console.error('Failed to toggle quiz status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewResults = (quizId: number) => {
    router.push(`/dashboard/guru/quiz/${quizId}/results`);
  };

  const handleSubmitQuiz = async (quizData: QuizFormData) => {
    try {
      if (editingQuiz) {
        await handleUpdateQuiz(quizData);
      } else {
        await handleCreateQuiz(quizData);
      }
    } catch (error) {
      // Form will handle the error display
    }
  };

  const getFilteredQuizzes = () => {
    let filtered = quizzes;

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(quiz => 
        activeFilter === 'active' ? quiz.is_active : !quiz.is_active
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(query) ||
        (quiz.ebook_title && quiz.ebook_title.toLowerCase().includes(query)) ||
        quiz.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  if (!mounted || loading) {
    return <PageLoading />;
  }

  if (!isAuthenticated || !user || user.role !== 'guru') {
    return null;
  }

  const filteredQuizzes = getFilteredQuizzes();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Filters */}
          <QuizFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddQuiz={() => {
              setEditingQuiz(null);
              setShowFormModal(true);
            }}
          />

          {/* Quiz Grid */}
          {loadingData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded flex-1"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
              <p className="text-gray-800 font-black text-lg">
                {searchQuery || activeFilter !== 'all' 
                  ? '🔍 Tidak ada quiz yang cocok dengan filter' 
                  : '❓ Belum ada quiz'}
              </p>
              {filteredQuizzes.length === 0 && !searchQuery && activeFilter === 'all' && (
                <p className="text-gray-600 font-semibold mt-2">
                  Klik "Buat Quiz" untuk membuat quiz pertama Anda
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onEdit={(quiz) => {
                    setEditingQuiz(quiz);
                    setShowFormModal(true);
                  }}
                  onDelete={handleDeleteQuiz}
                  onViewResults={handleViewResults}
                  onToggleStatus={handleToggleStatus}
                  loading={actionLoading}
                />
              ))}
            </div>
          )}

          {/* Quiz Form Modal */}
          <QuizForm
            isOpen={showFormModal}
            onClose={() => {
              setShowFormModal(false);
              setEditingQuiz(null);
            }}
            onSubmit={handleSubmitQuiz}
            editingQuiz={editingQuiz as QuizFormData | null}
            ebooks={ebooks}
            loading={actionLoading}
          />
        </div>
      </div>
    </div>
  );
}
