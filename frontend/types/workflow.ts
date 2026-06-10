/**
 * READPOINT WORKFLOW TYPES
 * Complete TypeScript type definitions for all workflows
 */

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'guru' | 'siswa';
  class_name?: string;
  profile_photo_url?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'siswa' | 'guru' | 'admin';
  grade_level?: string;
  class_name?: string;
}

export interface AuthContext {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// ============================================================================
// SISWA WORKFLOW TYPES
// ============================================================================

export interface SiswaStats {
  total_points: number;
  books_read: number;
  pages_read: number;
  quizzes_taken: number;
}

export interface Ebook {
  id: number;
  title: string;
  author: string;
  pages: number;
  poin_per_halaman: number;
  category: string;
  cover_image?: string;
  cover_image_url?: string;
  pdf_file?: string;
  pdf_file_url?: string;
  read_count?: number;
}

export interface Reward {
  id: number;
  name: string;
  description?: string;
  points_required: number;
  stock: number;
  image?: string;
  image_url?: string;
}

export interface Quiz {
  id: number;
  ebook_id?: number;
  ebook_title?: string;
  title?: string;
  total_questions?: number;
  points_reward?: number;
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

export interface QuizSubmission {
  ebook_id: number;
  answers: Record<number, string>;
  score: number;
}

export interface ReadingActivity {
  id: number;
  ebook_id: number;
  status: 'in_progress' | 'completed' | 'validated';
  current_page?: number;
  final_page?: number;
  duration_minutes?: number;
  notes?: string;
}

export interface PointTransaction {
  id: number;
  type: 'earned' | 'spent' | 'bonus' | 'penalty';
  amount: number;
  description: string;
  source: string;
  created_at: string;
  balance_after: number;
}

export interface Redemption {
  id: number;
  reward_id: number;
  user_id: number;
  quantity: number;
  points_spent: number;
  created_at: string;
}

export type SiswaTab = 'overview' | 'ebooks' | 'quizzes' | 'rewards' | 'account';

export interface SiswaWorkflow {
  // Step 1: Authentication
  login: (email: string, password: string) => Promise<LoginResponse>;
  
  // Step 2: Dashboard
  loadStats: () => Promise<SiswaStats>;
  loadEbooks: () => Promise<Ebook[]>;
  loadRewards: () => Promise<Reward[]>;
  
  // Step 3: Browse E-books
  searchEbooks: (query: string) => Ebook[];
  filterByCategory: (category: string) => Ebook[];
  
  // Step 4: Start Reading
  startReading: (ebookId: number) => Promise<ReadingActivity>;
  updateReadingProgress: (activityId: number, currentPage: number) => Promise<void>;
  completeReading: (activityId: number, finalPage: number) => Promise<number>; // returns points earned
  
  // Step 5: Take Quiz
  getQuizzes: (ebookId: number) => Promise<QuizQuestion[]>;
  submitQuiz: (submission: QuizSubmission) => Promise<{ score: number; points: number }>;
  
  // Step 6: Redeem Reward
  redeemReward: (rewardId: number, quantity: number) => Promise<Redemption>;
  
  // Step 7: View History
  getPointHistory: () => Promise<PointTransaction[]>;
  getQuizHistory: () => Promise<Quiz[]>;
  getReadingHistory: () => Promise<ReadingActivity[]>;
  
  // Step 8: Profile
  updateProfile: (data: Partial<User>) => Promise<User>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  
  // Logout
  logout: () => Promise<void>;
}

// ============================================================================
// GURU WORKFLOW TYPES
// ============================================================================

export interface GuruStats {
  total_siswa?: number;
  total_kuis_dibuat?: number;
  validasi_pending?: number;
  siswa_aktif_hari_ini?: number;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  class_name?: string;
  grade_level?: string;
  total_points?: number;
  books_read?: number;
  reading_progress?: number;
  quiz_average_score?: number;
  quizzes_passed?: number;
  profile_photo_url?: string;
}

export interface ValidationActivity {
  id: number;
  user_id?: number;
  ebook_id?: number;
  user?: { id: number; name: string; email?: string; class_name?: string };
  ebook?: { id: number; title: string; author?: string; pages?: number };
  status?: string;
  current_page?: number;
  final_page?: number;
  duration_minutes?: number;
  notes?: string;
}

export interface QuizFormData {
  id?: number;
  ebook_id: number;
  questions: QuestionForm[];
}

export interface QuestionForm {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
}

export interface CreatedQuiz {
  id: number;
  ebook_id: number;
  ebook_title?: string;
  question_count?: number;
  attempt_count?: number;
}

export interface StudentForm {
  name: string;
  email: string;
  password: string;
  grade_level: string;
  class_name: string;
}

export type GuruTab = 'beranda' | 'validasi' | 'kuis' | 'siswa' | 'pengaturan';

export interface GuruWorkflow {
  // Step 1: Authentication
  login: (email: string, password: string) => Promise<LoginResponse>;
  
  // Step 2: Dashboard
  loadStats: () => Promise<GuruStats>;
  
  // Step 3: Validate Student Activities
  getPendingValidations: () => Promise<ValidationActivity[]>;
  approveValidation: (activityId: number) => Promise<void>;
  rejectValidation: (activityId: number, notes: string) => Promise<void>;
  
  // Step 4: Create Quizzes
  loadEbooksForQuiz: () => Promise<Ebook[]>;
  createQuiz: (quizData: QuizFormData) => Promise<CreatedQuiz>;
  getMyQuizzes: () => Promise<CreatedQuiz[]>;
  updateQuiz: (quizId: number, quizData: QuizFormData) => Promise<void>;
  deleteQuiz: (quizId: number) => Promise<void>;
  
  // Step 5: Manage Students
  loadStudents: () => Promise<Student[]>;
  createStudent: (studentData: StudentForm) => Promise<Student>;
  updateStudent: (studentId: number, studentData: Partial<StudentForm>) => Promise<Student>;
  deleteStudent: (studentId: number) => Promise<void>;
  
  // Step 6: View Statistics
  getStudentStats: (studentId: number) => Promise<Student>;
  getClassStats: () => Promise<Student[]>;
  
  // Step 7: Profile
  updateProfile: (data: Partial<User>) => Promise<User>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  
  // Logout
  logout: () => Promise<void>;
}

// ============================================================================
// ADMIN WORKFLOW TYPES
// ============================================================================

export interface AdminStats {
  total_siswa?: number;
  total_guru?: number;
  total_ebook?: number;
  total_ebooks?: number;
  total_books?: number;
  total_reward?: number;
  total_rewards?: number;
  siswa_aktif_hari_ini?: number;
  buku_dibaca_hari_ini?: number;
  kuis_dikerjakan_hari_ini?: number;
  reward_diklaim_hari_ini?: number;
}

export interface EbookCreate {
  title: string;
  author: string;
  pages: number;
  poin_per_halaman: number;
  category: string;
  grade_level: string;
  cover_image: File;
  pdf_file: File;
}

export interface EbookUpdate {
  title?: string;
  author?: string;
  pages?: number;
  poin_per_halaman?: number;
  category?: string;
  grade_level?: string;
  is_active?: boolean;
  cover_image?: File;
  pdf_file?: File;
}

export interface RewardCreate {
  name: string;
  description: string;
  points_required: number;
  stock: number;
  image: File;
}

export interface RewardUpdate {
  name?: string;
  description?: string;
  points_required?: number;
  stock?: number;
  is_active?: boolean;
  image?: File;
}

export interface UserAccount {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'guru' | 'siswa';
  class_name?: string;
  profile_photo_url?: string;
}

export interface TopStudent {
  id: number;
  name: string;
  email: string;
  total_points?: number;
}

export type AdminTab = 'beranda' | 'ebooks' | 'rewards' | 'users' | 'pengaturan';

export interface AdminWorkflow {
  // Step 1: Authentication
  login: (email: string, password: string) => Promise<LoginResponse>;
  
  // Step 2: Dashboard & Analytics
  loadStats: () => Promise<AdminStats>;
  getTopStudents: () => Promise<TopStudent[]>;
  getDailyAnalytics: () => Promise<AdminStats>;
  
  // Step 3: Manage E-Books
  loadEbooks: () => Promise<Ebook[]>;
  createEbook: (ebookData: EbookCreate) => Promise<Ebook>;
  updateEbook: (ebookId: number, ebookData: EbookUpdate) => Promise<Ebook>;
  deleteEbook: (ebookId: number) => Promise<void>;
  toggleEbookStatus: (ebookId: number, active: boolean) => Promise<void>;
  
  // Step 4: Manage Rewards
  loadRewards: () => Promise<Reward[]>;
  createReward: (rewardData: RewardCreate) => Promise<Reward>;
  updateReward: (rewardId: number, rewardData: RewardUpdate) => Promise<Reward>;
  deleteReward: (rewardId: number) => Promise<void>;
  toggleRewardStatus: (rewardId: number, active: boolean) => Promise<void>;
  
  // Step 5: Manage Users
  loadUsers: () => Promise<UserAccount[]>;
  loadUsersByRole: (role: 'siswa' | 'guru' | 'admin') => Promise<UserAccount[]>;
  createUser: (userData: Partial<UserAccount> & { password: string }) => Promise<UserAccount>;
  updateUser: (userId: number, userData: Partial<UserAccount>) => Promise<UserAccount>;
  deleteUser: (userId: number) => Promise<void>;
  resetUserPassword: (userId: number) => Promise<void>;
  
  // Step 6: Generate Reports
  getUserStats: () => Promise<AdminStats>;
  getActivityReport: (startDate: string, endDate: string) => Promise<any>;
  getRevenueReport: () => Promise<any>;
  
  // Step 7: Profile
  updateProfile: (data: Partial<User>) => Promise<User>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  
  // Logout
  logout: () => Promise<void>;
}

// ============================================================================
// GENERAL TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
  error?: string;
  token?: string;
  user?: User;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

// ============================================================================
// WORKFLOW STATE TYPES
// ============================================================================

export interface WorkflowState {
  currentStep: number;
  completed: boolean;
  data: Record<string, any>;
  errors: Record<string, string>;
}

export interface SiswaWorkflowState extends WorkflowState {
  data: {
    user?: User;
    stats?: SiswaStats;
    selectedEbook?: Ebook;
    readingActivity?: ReadingActivity;
    quizAnswers?: Record<number, string>;
    quizScore?: number;
  };
}

export interface GuruWorkflowState extends WorkflowState {
  data: {
    user?: User;
    stats?: GuruStats;
    pendingValidations?: ValidationActivity[];
    selectedStudent?: Student;
    createdQuizzes?: CreatedQuiz[];
  };
}

export interface AdminWorkflowState extends WorkflowState {
  data: {
    user?: User;
    stats?: AdminStats;
    ebooks?: Ebook[];
    rewards?: Reward[];
    users?: UserAccount[];
  };
}
