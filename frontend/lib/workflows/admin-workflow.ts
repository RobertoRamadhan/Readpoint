/**
 * ADMIN WORKFLOW IMPLEMENTATION
 * Complete step-by-step implementation for admin flow
 */

import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import type {
  AdminWorkflow,
  LoginResponse,
  AdminStats,
  Ebook,
  EbookCreate,
  EbookUpdate,
  Reward,
  RewardCreate,
  RewardUpdate,
  UserAccount,
  TopStudent,
  User,
} from '@/types/workflow';

/**
 * ADMIN WORKFLOW:
 * Step 1: Login
 * Step 2: Dashboard (analytics - stats, top students, activity summary)
 * Step 3: E-books Tab (manage ebook library - add, edit, delete, set grade level)
 * Step 4: Rewards Tab (manage reward system - add, edit, delete, set points)
 * Step 5: Users Tab (manage all users - siswa, guru, admin - CRUD operations)
 * Step 6: Reports (generate analytics & reports for school)
 * Step 7: Profile Management
 */

export function useAdminWorkflow(): AdminWorkflow {
  const { login, logout } = useAuth();
  const router = useRouter();

  // =========================================================================
  // STEP 1: Authentication
  // =========================================================================
  const handleLogin = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.login({ email, password });

    if (response.user && response.token) {
      login(response.user, response.token);
      router.push('/dashboard/admin');
      return response as LoginResponse;
    }

    throw new Error('Login gagal');
  };

  // =========================================================================
  // STEP 2: Dashboard & Analytics
  // =========================================================================

  /**
   * Load admin dashboard statistics
   * Shows:
   * - Total users (siswa, guru, admin)
   * - Total ebooks and rewards in system
   * - Activity today (books read, quizzes done, rewards claimed)
   */
  const loadDashboardStats = async (): Promise<AdminStats> => {
    const response = await api.dashboard.adminStats();
    return response?.data || {
      total_siswa: 0,
      total_guru: 0,
      total_ebook: 0,
      total_reward: 0,
      siswa_aktif_hari_ini: 0,
      buku_dibaca_hari_ini: 0,
      kuis_dikerjakan_hari_ini: 0,
      reward_diklaim_hari_ini: 0,
    };
  };

  /**
   * Get top performing students
   * Useful for leaderboard and reports
   */
  const getTopStudents = async (): Promise<TopStudent[]> => {
    const response = await api.dashboard.adminTopStudents();
    return (response?.data as TopStudent[]) || [];
  };

  /**
   * Get detailed daily analytics
   */
  const getDailyAnalytics = async (): Promise<AdminStats> => {
    const response = await api.dashboard.adminStats();
    return response?.data || {};
  };

  // =========================================================================
  // STEP 3: E-book Management Workflow
  // =========================================================================

  /**
   * Load all ebooks in system
   * Shows title, author, pages, grade level, active status
   */
  const loadAllEbooks = async (): Promise<Ebook[]> => {
    const response = await api.ebooks.list();
    return (response?.data as Ebook[]) || [];
  };

  /**
   * Upload a new ebook to system
   * 1. Upload PDF file
   * 2. Upload cover image
   * 3. Set metadata (title, author, pages, grade level, points per page)
   */
  const createNewEbook = async (ebookData: EbookCreate): Promise<Ebook> => {
    const formData = new FormData();
    formData.append('title', ebookData.title);
    formData.append('author', ebookData.author);
    formData.append('pages', String(ebookData.pages));
    formData.append('poin_per_halaman', String(ebookData.poin_per_halaman));
    formData.append('category', ebookData.category);
    formData.append('grade_level', ebookData.grade_level);
    formData.append('cover_image', ebookData.cover_image);
    formData.append('pdf_file', ebookData.pdf_file);

    const response = await api.ebooks.create(formData);
    return response?.data as Ebook;
  };

  /**
   * Update ebook information
   * Can update title, author, metadata, or replace files
   */
  const updateExistingEbook = async (ebookId: number, ebookData: EbookUpdate): Promise<Ebook> => {
    let data: FormData | Record<string, unknown>;

    if (ebookData.cover_image || ebookData.pdf_file) {
      // If updating files, use FormData
      const formData = new FormData();
      if (ebookData.title) formData.append('title', ebookData.title);
      if (ebookData.author) formData.append('author', ebookData.author);
      if (ebookData.pages) formData.append('pages', String(ebookData.pages));
      if (ebookData.poin_per_halaman) formData.append('poin_per_halaman', String(ebookData.poin_per_halaman));
      if (ebookData.category) formData.append('category', ebookData.category);
      if (ebookData.grade_level) formData.append('grade_level', ebookData.grade_level);
      if (ebookData.is_active !== undefined) formData.append('is_active', String(ebookData.is_active));
      if (ebookData.cover_image) formData.append('cover_image', ebookData.cover_image);
      if (ebookData.pdf_file) formData.append('pdf_file', ebookData.pdf_file);
      data = formData;
    } else {
      // If only updating metadata, use JSON
      data = ebookData as Record<string, unknown>;
    }

    const response = await api.ebooks.update(ebookId, data);
    return response?.data as Ebook;
  };

  /**
   * Delete ebook from system
   * Permanent operation - ebooks with student data should be archived instead
   */
  const deleteEbook = async (ebookId: number): Promise<void> => {
    if (!confirm('Apakah Anda yakin ingin menghapus e-book ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }
    await api.ebooks.delete(ebookId);
  };

  /**
   * Toggle ebook active/inactive status
   * Inactive ebooks won't appear to students
   */
  const toggleEbookStatus = async (ebookId: number, active: boolean): Promise<void> => {
    await api.ebooks.update(ebookId, { is_active: active });
  };

  /**
   * Search ebooks by title, author, or category
   */
  const searchEbooks = (ebooks: Ebook[], query: string): Ebook[] => {
    if (!query.trim()) return ebooks;

    const lowerQuery = query.toLowerCase();
    return ebooks.filter(
      (book) =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery) ||
        book.category.toLowerCase().includes(lowerQuery)
    );
  };

  // =========================================================================
  // STEP 4: Reward Management Workflow
  // =========================================================================

  /**
   * Load all rewards in system
   * Shows reward name, points required, stock available
   */
  const loadAllRewards = async (): Promise<Reward[]> => {
    const response = await api.rewards.list();
    return (response?.data as Reward[]) || [];
  };

  /**
   * Create a new reward
   * 1. Upload reward image
   * 2. Set name, description
   * 3. Set points required to redeem
   * 4. Set initial stock
   */
  const createNewReward = async (rewardData: RewardCreate): Promise<Reward> => {
    const formData = new FormData();
    formData.append('name', rewardData.name);
    formData.append('description', rewardData.description);
    formData.append('points_required', String(rewardData.points_required));
    formData.append('stock', String(rewardData.stock));
    formData.append('image', rewardData.image);

    const response = await api.rewards.create(formData);
    return response?.data as Reward;
  };

  /**
   * Update reward information
   * Can update metadata or image
   */
  const updateExistingReward = async (rewardId: number, rewardData: RewardUpdate): Promise<Reward> => {
    let data: FormData | Record<string, unknown>;

    if (rewardData.image) {
      // If updating image, use FormData
      const formData = new FormData();
      if (rewardData.name) formData.append('name', rewardData.name);
      if (rewardData.description) formData.append('description', rewardData.description);
      if (rewardData.points_required) formData.append('points_required', String(rewardData.points_required));
      if (rewardData.stock !== undefined) formData.append('stock', String(rewardData.stock));
      if (rewardData.is_active !== undefined) formData.append('is_active', String(rewardData.is_active));
      formData.append('image', rewardData.image);
      data = formData;
    } else {
      // If only updating metadata, use JSON
      data = rewardData as Record<string, unknown>;
    }

    const response = await api.rewards.update(rewardId, data);
    return response?.data as Reward;
  };

  /**
   * Delete reward from system
   */
  const deleteReward = async (rewardId: number): Promise<void> => {
    if (!confirm('Apakah Anda yakin ingin menghapus reward ini?')) {
      return;
    }
    await api.rewards.delete(rewardId);
  };

  /**
   * Toggle reward active/inactive status
   */
  const toggleRewardStatus = async (rewardId: number, active: boolean): Promise<void> => {
    await api.rewards.update(rewardId, { is_active: active });
  };

  // =========================================================================
  // STEP 5: User Management Workflow
  // =========================================================================

  /**
   * Load all users (siswa, guru, admin)
   */
  const loadAllUsers = async (): Promise<UserAccount[]> => {
    const response = await api.users.list();
    return (response?.data as UserAccount[]) || [];
  };

  /**
   * Filter users by role
   */
  const loadUsersByRole = async (role: 'siswa' | 'guru' | 'admin'): Promise<UserAccount[]> => {
    const allUsers = await loadAllUsers();
    return allUsers.filter((user) => user.role === role);
  };

  /**
   * Create a new user (siswa, guru, or admin)
   * 1. Provide email, name, password
   * 2. Assign role
   * 3. If siswa: assign grade level & class
   * 4. User can login immediately
   */
  const createNewUser = async (
    userData: Partial<UserAccount> & { password: string }
  ): Promise<UserAccount> => {
    if (!userData.name || !userData.email || !userData.role || !userData.password) {
      throw new Error('Nama, email, role, dan password harus diisi');
    }

    const response = await api.users.create({
      ...userData,
    });

    return response?.data as UserAccount;
  };

  /**
   * Update user information
   */
  const updateExistingUser = async (
    userId: number,
    userData: Partial<UserAccount>
  ): Promise<UserAccount> => {
    let data: FormData | Record<string, unknown>;

    // For now, assume JSON update - could add file upload for profile photo later
    data = userData as Record<string, unknown>;

    const response = await api.users.update(userId, data);
    return response?.data as UserAccount;
  };

  /**
   * Delete user from system
   * Removes user and all their associated data
   */
  const deleteUser = async (userId: number): Promise<void> => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini? Semua data akan dihapus.')) {
      return;
    }
    await api.users.delete(userId);
  };

  /**
   * Reset user password to temporary password
   * User will need to change it on first login
   */
  const resetUserPassword = async (userId: number): Promise<void> => {
    await api.users.resetPassword(userId);
  };

  /**
   * Search users by name, email, or class
   */
  const searchUsers = (users: UserAccount[], query: string): UserAccount[] => {
    if (!query.trim()) return users;

    const lowerQuery = query.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        (user.class_name && user.class_name.toLowerCase().includes(lowerQuery))
    );
  };

  // =========================================================================
  // STEP 6: Reports & Analytics
  // =========================================================================

  /**
   * Get comprehensive user statistics
   */
  const getUserStatistics = async (): Promise<AdminStats> => {
    const response = await api.dashboard.adminUsersStats();
    return response?.data || {};
  };

  /**
   * Get activity report for date range
   * Shows all reading, quiz, and redemption activity
   */
  const getActivityReport = async (startDate: string, endDate: string): Promise<any> => {
    // This would call an API endpoint that filters activities by date
    // Example: GET /api/reports/activity?start_date=2026-06-01&end_date=2026-06-30
    console.log(`Generating report for ${startDate} to ${endDate}`);
    return {};
  };

  /**
   * Get revenue report
   * Shows point redemption value and estimated cost
   */
  const getRevenueReport = async (): Promise<any> => {
    // This would call an API endpoint for revenue analytics
    console.log('Generating revenue report');
    return {};
  };

  // =========================================================================
  // STEP 7: Profile Management
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
    getTopStudents,
    getDailyAnalytics,
    loadEbooks: loadAllEbooks,
    createEbook: createNewEbook,
    updateEbook: updateExistingEbook,
    deleteEbook,
    toggleEbookStatus,
    loadRewards: loadAllRewards,
    createReward: createNewReward,
    updateReward: updateExistingReward,
    deleteReward,
    toggleRewardStatus,
    loadUsers: loadAllUsers,
    loadUsersByRole,
    createUser: createNewUser,
    updateUser: updateExistingUser,
    deleteUser,
    resetUserPassword,
    getUserStats: getUserStatistics,
    getActivityReport,
    getRevenueReport,
    updateProfile: updateUserProfile,
    changePassword: changeUserPassword,
  };
}

/**
 * ADMIN WORKFLOW USAGE EXAMPLE:
 * 
 * const workflow = useAdminWorkflow();
 * 
 * // Step 1: Login
 * await workflow.login('admin@email.com', 'password');
 * 
 * // Step 2: View Dashboard
 * const stats = await workflow.loadStats();
 * console.log(`Siswa: ${stats.total_siswa}, Guru: ${stats.total_guru}, E-book: ${stats.total_ebook}`);
 * 
 * const topStudents = await workflow.getTopStudents();
 * 
 * // Step 3: Manage E-books
 * // Upload new ebook
 * const newEbook = await workflow.createEbook({
 *   title: 'Laskar Pelangi',
 *   author: 'Andrea Hirata',
 *   pages: 534,
 *   poin_per_halaman: 10,
 *   category: 'Novel',
 *   grade_level: '10-12',
 *   cover_image: coverFile,
 *   pdf_file: pdfFile
 * });
 * 
 * // View all ebooks
 * const ebooks = await workflow.loadEbooks();
 * 
 * // Update ebook metadata
 * await workflow.updateEbook(newEbook.id, {
 *   poin_per_halaman: 15
 * });
 * 
 * // Step 4: Manage Rewards
 * // Create reward
 * const reward = await workflow.createReward({
 *   name: 'Voucher Buku Rp 50.000',
 *   description: 'Voucher untuk membeli buku di toko resmi',
 *   points_required: 500,
 *   stock: 50,
 *   image: rewardImage
 * });
 * 
 * // Update reward stock
 * await workflow.updateReward(reward.id, {
 *   stock: 45
 * });
 * 
 * // Step 5: Manage Users
 * // Create new guru
 * const guru = await workflow.createUser({
 *   name: 'Bu Siti',
 *   email: 'siti@school.com',
 *   password: 'TempPassword123',
 *   role: 'guru'
 * });
 * 
 * // Create new siswa
 * const siswa = await workflow.createUser({
 *   name: 'Adi Pratama',
 *   email: 'adi@school.com',
 *   password: 'TempPassword123',
 *   role: 'siswa',
 *   class_name: 'X-A'
 * });
 * 
 * // View all users
 * const allUsers = await workflow.loadUsers();
 * 
 * // Filter users by role
 * const allSiswa = await workflow.loadUsersByRole('siswa');
 * console.log(`Total siswa: ${allSiswa.length}`);
 * 
 * // Step 6: Reports
 * const userStats = await workflow.getUserStats();
 * const activityReport = await workflow.getActivityReport('2026-06-01', '2026-06-30');
 * 
 * // Logout
 * await workflow.logout();
 */
