/**
 * SISWA WORKFLOW IMPLEMENTATION
 * Complete step-by-step implementation for student flow
 */

import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type {
  SiswaWorkflow,
  LoginResponse,
  SiswaStats,
  Ebook,
  Reward,
  Quiz,
  QuizQuestion,
  ReadingActivity,
  QuizSubmission,
  PointTransaction,
  Redemption,
  User,
} from '@/types/workflow';

/**
 * SISWA WORKFLOW:
 * Step 1: Login/Register
 * Step 2: Dashboard (view stats, ebooks, quizzes, rewards)
 * Step 3: Browse E-books (search, filter, select)
 * Step 4: Read E-book (start activity, update progress, complete)
 * Step 5: Take Quiz (get questions, answer, submit)
 * Step 6: Earn Points (calculated from reading + quiz)
 * Step 7: Redeem Rewards (select reward, spend points)
 * Step 8: View History (points, quiz attempts, reading activities)
 * Step 9: Profile Management (edit info, change password)
 */

export function useSiswaWorkflow(): SiswaWorkflow {
  const { login, logout } = useAuth();
  const router = useRouter();
  const [readingActivityId, setReadingActivityId] = useState<number | null>(null);
  const [loadedEbooks, setLoadedEbooks] = useState<Ebook[]>([]);

  // =========================================================================
  // STEP 1: Authentication
  // =========================================================================
  const handleLogin = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.login({ email, password });
    
    if (response.user && response.token) {
      login(response.user, response.token);
      router.push('/dashboard/siswa');
      return response as LoginResponse;
    }
    
    throw new Error('Login gagal');
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
    gradeLevel: string
  ): Promise<LoginResponse> => {
    const response = await api.register({
      name,
      email,
      password,
      password_confirmation: password,
      role: 'siswa',
      grade_level: gradeLevel,
    });

    if (response.user && response.token) {
      login(response.user, response.token);
      router.push('/dashboard/siswa');
      return response as LoginResponse;
    }

    throw new Error('Registrasi gagal');
  };

  // =========================================================================
  // STEP 2: Load Dashboard Data
  // =========================================================================
  const loadDashboardStats = async (): Promise<SiswaStats> => {
    const response = await api.dashboard.siswaStats();
    return (response?.data as SiswaStats) || {
      total_points: 0,
      books_read: 0,
      pages_read: 0,
      quizzes_taken: 0,
    };
  };

  const loadAllEbooks = async (): Promise<Ebook[]> => {
    const response = await api.ebooks.list();
    const ebooks = (response?.data as Ebook[]) || [];
    setLoadedEbooks(ebooks);
    return ebooks;
  };

  const loadAllRewards = async (): Promise<Reward[]> => {
    const response = await api.rewards.list();
    return (response?.data as Reward[]) || [];
  };

  // =========================================================================
  // STEP 3: Browse & Search E-books
  // =========================================================================
  const searchEbooks = (query: string): Ebook[] => {
    if (!query.trim()) return loadedEbooks;
    
    const lowerQuery = query.toLowerCase();
    return loadedEbooks.filter((book) =>
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.category.toLowerCase().includes(lowerQuery)
    );
  };

  const filterByCategory = (category: string): Ebook[] => {
    if (!category) return loadedEbooks;
    return loadedEbooks.filter((book) => book.category === category);
  };

  // =========================================================================
  // STEP 4: Reading E-book Workflow
  // =========================================================================

  /**
   * Start reading an ebook
   * 1. Initialize reading activity
   * 2. Track start time
   * 3. Return activity ID for tracking
   */
  const startReadingEbook = async (ebookId: number): Promise<ReadingActivity> => {
    const response = await api.startReading(ebookId);
    const activity = response?.data as ReadingActivity;
    setReadingActivityId(activity?.id || null);
    return activity;
  };

  /**
   * Update reading progress while reading
   * Called every time user scrolls/navigates to new page
   */
  const updateReadingProgress = async (
    activityId: number,
    currentPage: number
  ): Promise<void> => {
    await api.updateActivityProgress(activityId, {
      current_page: currentPage,
      final_page: currentPage,
    });
  };

  /**
   * Complete reading session
   * 1. Submit final page reached
   * 2. Calculate points earned
   * 3. Return points for display
   */
  const completeReadingEbook = async (
    activityId: number,
    finalPage: number
  ): Promise<number> => {
    const response = await api.completeReading(activityId, {
      final_page: finalPage,
      duration_minutes: 0, // Default, can be calculated from activity tracking
    });

    const points = finalPage * 10; // Example: 10 points per page
    return points;
  };

  // =========================================================================
  // STEP 5: Quiz Workflow
  // =========================================================================

  /**
   * Get quiz questions for an ebook
   * Each ebook can have multiple quizzes
   */
  const getQuizForEbook = async (ebookId: number): Promise<QuizQuestion[]> => {
    const response = await api.getQuizzes(ebookId);
    return (response?.data as QuizQuestion[]) || [];
  };

  /**
   * Submit quiz answers
   * 1. Send user answers
   * 2. Get calculated score
   * 3. Earn points based on score
   */
  const submitQuizAnswers = async (submission: QuizSubmission): Promise<{ score: number; points: number }> => {
    const response = await api.submitQuiz({
      ebook_id: submission.ebook_id,
      answers: submission.answers,
      score: submission.score,
    });

    const score = submission.score;
    const points = score >= 60 ? 50 : 0; // Example: only earn points if >= 60%

    return { score, points };
  };

  // =========================================================================
  // STEP 6 & 7: Points & Rewards
  // =========================================================================

  /**
   * Redeem a reward with points
   * 1. Check if user has enough points
   * 2. Deduct points from user
   * 3. Create redemption record
   */
  const redeemReward = async (rewardId: number, quantity: number = 1): Promise<Redemption> => {
    const response = await api.rewards.redeem(rewardId, { quantity });
    return response?.data as Redemption;
  };

  // =========================================================================
  // STEP 8: View History
  // =========================================================================

  const getPointHistory = async (): Promise<PointTransaction[]> => {
    const response = await api.dashboard.siswaPointsHistory();
    return (response?.data as PointTransaction[]) || [];
  };

  const getQuizHistory = async (): Promise<Quiz[]> => {
    const response = await api.dashboard.siswaQuizAttempts();
    return (response?.data as Quiz[]) || [];
  };

  const getReadingHistory = async (): Promise<ReadingActivity[]> => {
    const response = await api.dashboard.siswaReadingActivities();
    return (response?.data as ReadingActivity[]) || [];
  };

  // =========================================================================
  // STEP 9: Profile Management
  // =========================================================================

  const updateUserProfile = async (data: Partial<User>): Promise<User> => {
    const response = await api.me.updateProfile(data);
    return (response as any)?.user || (data as User);
  };

  const changeUserPassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    await api.me.updateProfile({
      current_password: oldPassword,
      password: newPassword,
      password_confirmation: newPassword,
    });
  };

  // =========================================================================
  // Logout
  // =========================================================================

  const handleLogout = async (): Promise<void> => {
    await logout();
    router.push('/login');
  };

  return {
    login: handleLogin,
    logout: handleLogout,
    loadStats: loadDashboardStats,
    loadEbooks: loadAllEbooks,
    loadRewards: loadAllRewards,
    searchEbooks,
    filterByCategory,
    startReading: startReadingEbook,
    updateReadingProgress,
    completeReading: completeReadingEbook,
    getQuizzes: getQuizForEbook,
    submitQuiz: submitQuizAnswers,
    redeemReward,
    getPointHistory,
    getQuizHistory: async () => getQuizHistory(),
    getReadingHistory,
    updateProfile: updateUserProfile,
    changePassword: changeUserPassword,
  };
}

/**
 * SISWA WORKFLOW USAGE EXAMPLE:
 * 
 * const workflow = useSiswaWorkflow();
 * 
 * // Step 1: Login
 * await workflow.login('siswa@email.com', 'password');
 * 
 * // Step 2: Load Dashboard
 * const stats = await workflow.loadStats();
 * const ebooks = await workflow.loadEbooks();
 * const rewards = await workflow.loadRewards();
 * 
 * // Step 3: Search Books
 * const filtered = workflow.searchEbooks(ebooks, 'harry');
 * 
 * // Step 4: Read Book
 * const activity = await workflow.startReading(ebookId);
 * await workflow.updateReadingProgress(activity.id, 25); // page 25
 * const points = await workflow.completeReading(activity.id, 150, 45); // 150 pages, 45 minutes
 * 
 * // Step 5: Take Quiz
 * const questions = await workflow.getQuizzes(ebookId);
 * const quizResult = await workflow.submitQuiz({
 *   ebook_id: ebookId,
 *   answers: { 1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'a' },
 *   score: 80
 * });
 * 
 * // Step 6: Redeem Reward
 * await workflow.redeemReward(rewardId, 1);
 * 
 * // Step 7: View History
 * const pointHistory = await workflow.getPointHistory();
 * const quizHistory = await workflow.getQuizHistory();
 * const readingHistory = await workflow.getReadingHistory();
 * 
 * // Step 8: Update Profile
 * const formData = new FormData();
 * formData.append('name', 'New Name');
 * await workflow.updateProfile(formData);
 * 
 * // Logout
 * await workflow.logout();
 */
