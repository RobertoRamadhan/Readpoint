/**
 * READPOINT WORKFLOW DOCUMENTATION & EXAMPLES
 * Complete guide for implementing workflows in components
 */

// ============================================================================
// TABLE OF CONTENTS
// ============================================================================
//
// 1. SISWA WORKFLOW - Student Reading & Quiz System
// 2. GURU WORKFLOW - Teacher Validation & Quiz Management
// 3. ADMIN WORKFLOW - System Management & Analytics
// 4. WORKFLOW HOOKS - How to Use in Components
// 5. ERROR HANDLING - Best Practices
// 6. STATE MANAGEMENT - Managing Workflow State
//

// ============================================================================
// 1. SISWA WORKFLOW EXAMPLE
// ============================================================================

/*
 * COMPLETE SISWA WORKFLOW EXAMPLE
 * Shows entire flow from login to reward redemption
 */

// Component: pages/siswa-complete-workflow.tsx

import { useSiswaWorkflow } from '@/lib/workflows';
import { useState, useEffect } from 'react';
import type { SiswaStats, Ebook, ReadingActivity, Quiz } from '@/types/workflow';

export function SiswaCompleteWorkflow() {
  const workflow = useSiswaWorkflow();
  
  // State for each workflow step
  const [stats, setStats] = useState<SiswaStats | null>(null);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [readingActivity, setReadingActivity] = useState<ReadingActivity | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<Quiz[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Load Dashboard on Mount
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [statsData, ebooksData] = await Promise.all([
          workflow.loadStats(),
          workflow.loadEbooks(),
        ]);
        setStats(statsData);
        setEbooks(ebooksData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Step 2: Search Ebooks
  const handleSearchEbooks = (query: string) => {
    const filtered = workflow.searchEbooks(ebooks, query);
    setEbooks(filtered);
  };

  // Step 3: Select Ebook & Start Reading
  const handleStartReading = async (ebook: Ebook) => {
    try {
      setLoading(true);
      setSelectedEbook(ebook);
      
      // Start reading activity
      const activity = await workflow.startReading(ebook.id);
      setReadingActivity(activity);
      setCurrentStep(3);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start reading');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Update Reading Progress (called by PDF viewer as user scrolls)
  const handleUpdateProgress = async (currentPage: number) => {
    setReadingProgress((currentPage / (selectedEbook?.pages || 1)) * 100);

    if (readingActivity) {
      try {
        await workflow.updateReadingProgress(readingActivity.id, currentPage);
      } catch (err) {
        console.error('Failed to update progress:', err);
        // Don't block UI on progress update failure
      }
    }
  };

  // Step 5: Complete Reading & Earn Points
  const handleCompleteReading = async () => {
    if (!readingActivity) return;

    try {
      setLoading(true);
      const finalPage = Math.round((readingProgress / 100) * (selectedEbook?.pages || 1));
      const pointsEarned = await workflow.completeReading(
        readingActivity.id,
        finalPage,
        45 // reading time in minutes
      );

      alert(`Selesai membaca! Poin earned: ${pointsEarned}`);
      setCurrentStep(4); // Move to quiz
      
      // Load quiz for this ebook
      const questions = await workflow.getQuizzes(selectedEbook!.id);
      setQuizQuestions(questions);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete reading');
    } finally {
      setLoading(false);
    }
  };

  // Step 6: Submit Quiz Answers
  const handleSubmitQuiz = async () => {
    try {
      setLoading(true);
      
      // Calculate score
      const correctCount = Object.keys(quizAnswers).length; // Simplified
      const score = Math.round((correctCount / quizQuestions.length) * 100);

      const result = await workflow.submitQuiz({
        ebook_id: selectedEbook!.id,
        answers: quizAnswers,
        score,
      });

      alert(`Quiz Score: ${result.score}% | Poin: ${result.points}`);
      setCurrentStep(5); // Move to rewards
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  // Step 7: Redeem Reward
  const handleRedeemReward = async (rewardId: number) => {
    try {
      setLoading(true);
      await workflow.redeemReward(rewardId);
      alert('Reward redeemed successfully!');
      
      // Reload stats to show updated points
      const newStats = await workflow.loadStats();
      setStats(newStats);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem reward');
    } finally {
      setLoading(false);
    }
  };

  // Step 8: View History
  const handleViewHistory = async () => {
    try {
      setLoading(true);
      const [pointHistory, quizHistory, readingHistory] = await Promise.all([
        workflow.getPointHistory(),
        workflow.getQuizHistory(),
        workflow.getReadingHistory(),
      ]);

      console.log('Point History:', pointHistory);
      console.log('Quiz History:', quizHistory);
      console.log('Reading History:', readingHistory);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  // Render based on current step
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {error && <div className="bg-red-50 p-4 rounded text-red-700">{error}</div>}

      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep >= step ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {currentStep === 1 && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Poin</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.total_points}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Buku Dibaca</p>
            <p className="text-3xl font-bold text-blue-600">{stats.books_read}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Halaman</p>
            <p className="text-3xl font-bold text-purple-600">{stats.pages_read}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Kuis</p>
            <p className="text-3xl font-bold text-orange-600">{stats.quizzes_taken}</p>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Pilih Buku untuk Dibaca</h2>
          <input
            type="text"
            placeholder="Cari buku..."
            onChange={(e) => handleSearchEbooks(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ebooks.map((ebook) => (
              <div key={ebook.id} className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-lg"
                onClick={() => handleStartReading(ebook)}>
                <h3 className="font-bold text-lg">{ebook.title}</h3>
                <p className="text-sm text-gray-600">{ebook.author}</p>
                <p className="text-xs mt-2">📄 {ebook.pages} pages | ⭐ {ebook.poin_per_halaman}/page</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStep === 3 && selectedEbook && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Membaca: {selectedEbook.title}</h2>
          <div className="bg-gray-100 p-6 rounded-lg h-96 flex items-center justify-center">
            <p className="text-gray-600">PDF Viewer Component Here</p>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleCompleteReading}
              disabled={loading}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg"
            >
              {loading ? 'Loading...' : 'Selesai Membaca'}
            </button>
          </div>
        </div>
      )}

      {currentStep === 4 && quizQuestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Kuis: {selectedEbook?.title}</h2>
          {quizQuestions.map((question, idx) => (
            <div key={question.id} className="bg-white p-4 rounded-lg shadow">
              <p className="font-bold mb-3">{idx + 1}. {question.question_text}</p>
              <div className="space-y-2">
                {['option_a', 'option_b', 'option_c', 'option_d'].map((opt) => (
                  <label key={opt} className="flex items-center p-2 border rounded hover:bg-emerald-50">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={opt[7]}
                      onChange={(e) => setQuizAnswers(prev => ({
                        ...prev,
                        [question.id]: e.target.value
                      }))}
                    />
                    <span className="ml-2">{question[opt as keyof typeof question]}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={handleSubmitQuiz}
            disabled={loading}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg"
          >
            {loading ? 'Loading...' : 'Submit Kuis'}
          </button>
        </div>
      )}

      {currentStep === 5 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Tukar Reward</h2>
          <p>Reward redemption UI here</p>
        </div>
      )}

      <button
        onClick={() => workflow.logout()}
        className="mt-6 bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}

// ============================================================================
// 2. GURU WORKFLOW EXAMPLE
// ============================================================================

/*
 * GURU DASHBOARD WORKFLOW EXAMPLE
 * Shows validation, quiz creation, and student management
 */

import { useGuruWorkflow } from '@/lib/workflows';
import type { GuruStats, ValidationActivity } from '@/types/workflow';

export function GuruDashboardWorkflow() {
  const workflow = useGuruWorkflow();
  const [stats, setStats] = useState<GuruStats | null>(null);
  const [pendingValidations, setPendingValidations] = useState<ValidationActivity[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'validasi' | 'kuis' | 'siswa'>('dashboard');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const statsData = await workflow.loadStats();
        setStats(statsData);

        if (statsData.validasi_pending && statsData.validasi_pending > 0) {
          const validations = await workflow.getPendingValidations();
          setPendingValidations(validations);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      }
    };

    loadDashboard();
  }, []);

  const handleApproveValidation = async (activityId: number) => {
    try {
      await workflow.approveValidation(activityId);
      alert('Aktivitas disetujui!');
      // Reload validations
      const validations = await workflow.getPendingValidations();
      setPendingValidations(validations);
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleRejectValidation = async (activityId: number) => {
    const reason = prompt('Alasan penolakan:');
    if (!reason) return;

    try {
      await workflow.rejectValidation(activityId, reason);
      alert('Aktivitas ditolak!');
      const validations = await workflow.getPendingValidations();
      setPendingValidations(validations);
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Guru</h1>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Siswa</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.total_siswa}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Kuis Dibuat</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total_kuis_dibuat}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Validasi Pending</p>
            <p className="text-3xl font-bold text-red-600">{stats.validasi_pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Aktif Hari Ini</p>
            <p className="text-3xl font-bold text-purple-600">{stats.siswa_aktif_hari_ini}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b">
        {['dashboard', 'validasi', 'kuis', 'siswa'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-semibold ${
              activeTab === tab
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-600'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'validasi' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Validasi Aktivitas Siswa</h2>
          {pendingValidations.map((activity) => (
            <div key={activity.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{activity.ebook?.title}</h3>
                  <p className="text-sm text-gray-600">{activity.user?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.current_page} / {activity.ebook?.pages} halaman • {activity.duration_minutes} menit
                  </p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  Pending
                </span>
              </div>
              {activity.notes && (
                <p className="text-sm text-gray-700 mb-4 p-2 bg-gray-50 rounded">
                  Catatan siswa: {activity.notes}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => handleApproveValidation(activity.id)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRejectValidation(activity.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3. ADMIN WORKFLOW EXAMPLE
// ============================================================================

/*
 * ADMIN PANEL WORKFLOW EXAMPLE
 * Shows ebook and reward management
 */

import { useAdminWorkflow } from '@/lib/workflows';
import type { AdminStats } from '@/types/workflow';

export function AdminPanelWorkflow() {
  const workflow = useAdminWorkflow();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await workflow.loadStats();
        setStats(statsData);
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    };

    loadStats();
  }, []);

  const handleUploadEbook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const ebookData = {
        title: formData.get('title') as string,
        author: formData.get('author') as string,
        pages: Number(formData.get('pages')),
        poin_per_halaman: Number(formData.get('poin_per_halaman')),
        category: formData.get('category') as string,
        grade_level: formData.get('grade_level') as string,
        cover_image: formData.get('cover_image') as File,
        pdf_file: formData.get('pdf_file') as File,
      };

      const newEbook = await workflow.createEbook(ebookData);
      alert(`E-book "${newEbook.title}" berhasil diupload!`);
      e.currentTarget.reset();
    } catch (err) {
      console.error('Failed to upload ebook:', err);
      alert('Gagal upload e-book');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Siswa</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.total_siswa}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Guru</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total_guru}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total E-book</p>
            <p className="text-3xl font-bold text-purple-600">{stats.total_ebook}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Reward</p>
            <p className="text-3xl font-bold text-orange-600">{stats.total_reward}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Upload E-book Baru</h2>
        <form onSubmit={handleUploadEbook} className="space-y-4">
          <input type="text" name="title" placeholder="Judul" required className="w-full p-2 border rounded" />
          <input type="text" name="author" placeholder="Penulis" required className="w-full p-2 border rounded" />
          <input type="number" name="pages" placeholder="Jumlah Halaman" required className="w-full p-2 border rounded" />
          <input type="number" name="poin_per_halaman" placeholder="Poin per Halaman" required className="w-full p-2 border rounded" />
          <input type="text" name="category" placeholder="Kategori" required className="w-full p-2 border rounded" />
          <select name="grade_level" required className="w-full p-2 border rounded">
            <option>Pilih Tingkat Kelas</option>
            <option value="7-8">7-8</option>
            <option value="9-10">9-10</option>
            <option value="10-12">10-12</option>
          </select>
          <input type="file" name="cover_image" accept="image/*" required className="w-full p-2 border rounded" />
          <input type="file" name="pdf_file" accept=".pdf" required className="w-full p-2 border rounded" />
          <button type="submit" className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold">
            Upload E-book
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 4. ERROR HANDLING BEST PRACTICES
// ============================================================================

/*
 * Error handling pattern for workflows
 */

async function exampleErrorHandling() {
  const workflow = useSiswaWorkflow();

  try {
    const stats = await workflow.loadStats();
    // Success path
  } catch (error) {
    // Handle different error types
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        // Token expired - redirect to login
        router.push('/login');
      } else if (error.message.includes('Network')) {
        // Network error
        console.error('Network error:', error);
      } else {
        // Generic error
        console.error('Error:', error.message);
      }
    }
  }
}

// ============================================================================
// 5. STATE MANAGEMENT PATTERN
// ============================================================================

/*
 * Recommended pattern for managing workflow state in components
 */

interface WorkflowState {
  currentStep: number;
  data: Record<string, any>;
  loading: boolean;
  error: string | null;
}

function useWorkflowState(initialStep: number = 1) {
  const [state, setState] = useState<WorkflowState>({
    currentStep: initialStep,
    data: {},
    loading: false,
    error: null,
  });

  const updateData = (key: string, value: any) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, [key]: value }
    }));
  };

  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  return { state, updateData, nextStep, setLoading, setError };
}

// ============================================================================
// 6. INTEGRATION CHECKLIST
// ============================================================================

/*
 * Before deploying workflow features:
 * 
 * [ ] All API endpoints are implemented in backend
 * [ ] Auth token is properly stored in localStorage
 * [ ] Error responses from API are handled correctly
 * [ ] Loading states are shown during API calls
 * [ ] Redirect on 401 (expired token) is implemented
 * [ ] Form validation is in place before submission
 * [ ] Success/error messages are displayed to user
 * [ ] Navigation between workflow steps is smooth
 * [ ] Component re-renders don't cause infinite loops
 * [ ] Sensitive data is not logged to console in production
 * [ ] Page refresh doesn't break workflow state (use useEffect + auth check)
 * [ ] Mobile responsiveness is tested
 * [ ] Accessibility (a11y) standards are met
 * [ ] TypeScript types are properly enforced
 */
