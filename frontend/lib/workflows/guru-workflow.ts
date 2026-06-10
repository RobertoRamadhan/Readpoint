/**
 * GURU WORKFLOW IMPLEMENTATION
 * Complete step-by-step implementation for teacher flow
 */

import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import type {
  GuruWorkflow,
  LoginResponse,
  GuruStats,
  Ebook,
  ValidationActivity,
  CreatedQuiz,
  QuizFormData,
  Student,
  StudentForm,
  User,
} from '@/types/workflow';

/**
 * GURU WORKFLOW:
 * Step 1: Login
 * Step 2: Dashboard (view stats - siswa, kuis, validasi pending, aktif hari ini)
 * Step 3: Validasi Tab (validate student reading activities - pending, approved, rejected)
 * Step 4: Kuis Tab (create & manage quizzes for ebooks)
 * Step 5: Siswa Tab (manage students - add, edit, delete, view stats)
 * Step 6: View Statistics (class stats, individual student performance)
 * Step 7: Profile Management
 */

export function useGuruWorkflow(): GuruWorkflow {
  const { login, logout } = useAuth();
  const router = useRouter();

  // =========================================================================
  // STEP 1: Authentication
  // =========================================================================
  const handleLogin = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.login({ email, password });

    if (response.user && response.token) {
      login(response.user, response.token);
      router.push('/dashboard/guru');
      return response as LoginResponse;
    }

    throw new Error('Login gagal');
  };

  // =========================================================================
  // STEP 2: Load Dashboard
  // =========================================================================

  /**
   * Load guru dashboard statistics
   * Shows:
   * - Total students in class
   * - Total quizzes created
   * - Pending validations (need approval)
   * - Active students today
   */
  const loadDashboardStats = async (): Promise<GuruStats> => {
    const response = await api.dashboard.guruStats();
    return response?.data || {
      total_siswa: 0,
      total_kuis_dibuat: 0,
      validasi_pending: 0,
      siswa_aktif_hari_ini: 0,
    };
  };

  // =========================================================================
  // STEP 3: Validation Workflow
  // =========================================================================

  /**
   * Get all pending validation activities
   * These are student reading activities waiting for teacher approval
   */
  const getPendingValidations = async (): Promise<ValidationActivity[]> => {
    const response = await api.validations.getPending();
    return (response?.data as ValidationActivity[]) || [];
  };

  /**
   * Approve a student reading activity
   * 1. Teacher confirms the reading activity is valid
   * 2. Points are awarded to student
   * 3. Activity status changes from pending to approved
   */
  const approveValidation = async (activityId: number): Promise<void> => {
    await api.validations.approve(activityId);
  };

  /**
   * Reject a student reading activity with reason
   * 1. Teacher provides reason for rejection
   * 2. Points are NOT awarded
   * 3. Student is notified to resubmit
   */
  const rejectValidation = async (activityId: number, notes: string): Promise<void> => {
    if (!notes.trim()) {
      throw new Error('Alasan penolakan harus diisi');
    }
    await api.validations.reject(activityId, notes);
  };

  /**
   * Get validation statistics
   * Shows approval rate and pending count
   */
  const getValidationStats = async () => {
    const response = await api.validations.getStatistics();
    return response?.data || {};
  };

  // =========================================================================
  // STEP 4: Quiz Management Workflow
  // =========================================================================

  /**
   * Load all ebooks for quiz creation
   * Teacher can create quizzes for any available ebook
   */
  const loadEbooksForQuiz = async (): Promise<Ebook[]> => {
    const response = await api.ebooks.list();
    return (response?.data as Ebook[]) || [];
  };

  /**
   * Create a new quiz for an ebook
   * 1. Select ebook
   * 2. Create 5 quiz questions (multiple choice)
   * 3. For each question: question text + 4 options + correct answer
   */
  const createQuiz = async (quizData: QuizFormData): Promise<CreatedQuiz> => {
    if (!quizData.ebook_id) {
      throw new Error('Pilih e-book terlebih dahulu');
    }

    if (!quizData.questions.every((q) => q.question && q.option_a && q.option_b && q.option_c && q.option_d)) {
      throw new Error('Semua pertanyaan dan opsi wajib diisi');
    }

    const response = await api.quiz.create({
      ebook_id: quizData.ebook_id,
      questions: quizData.questions,
    });

    return response?.data as CreatedQuiz;
  };

  /**
   * Get all quizzes created by this teacher
   * Shows quiz details and number of student attempts
   */
  const getCreatedQuizzes = async (): Promise<CreatedQuiz[]> => {
    const response = await api.dashboard.guruQuizzes();
    return (response?.data as CreatedQuiz[]) || [];
  };

  /**
   * Update an existing quiz
   */
  const updateQuiz = async (quizId: number, quizData: QuizFormData): Promise<void> => {
    await api.quiz.update(quizId, {
      ebook_id: quizData.ebook_id,
      questions: quizData.questions,
    });
  };

  /**
   * Delete a quiz
   * Only possible if no students have attempted it
   */
  const deleteQuiz = async (quizId: number): Promise<void> => {
    if (!confirm('Apakah Anda yakin ingin menghapus quiz ini?')) {
      return;
    }
    await api.quiz.delete(quizId);
  };

  // =========================================================================
  // STEP 5: Student Management Workflow
  // =========================================================================

  /**
   * Load all students in teacher's class
   */
  const loadStudents = async (): Promise<Student[]> => {
    const response = await api.dashboard.guruStudents();
    return (response?.data as Student[]) || [];
  };

  /**
   * Add a new student manually to the class
   * 1. Provide student name, email, password
   * 2. Assign to specific grade level & class
   * 3. Student account is created in system
   */
  const createStudent = async (studentData: StudentForm): Promise<Student> => {
    if (!studentData.name || !studentData.email || !studentData.password) {
      throw new Error('Nama, email, dan password harus diisi');
    }

    const response = await api.users.create({
      ...studentData,
      role: 'siswa',
    });

    return response?.data as Student;
  };

  /**
   * Update student information
   */
  const updateStudent = async (studentId: number, studentData: Partial<StudentForm>): Promise<Student> => {
    const response = await api.users.update(studentId, studentData);
    return response?.data as Student;
  };

  /**
   * Delete a student from the class
   */
  const deleteStudent = async (studentId: number): Promise<void> => {
    if (!confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      return;
    }
    await api.users.delete(studentId);
  };

  /**
   * Reset student password
   * Generate new temporary password
   */
  const resetStudentPassword = async (studentId: number): Promise<void> => {
    await api.users.resetPassword(studentId);
  };

  // =========================================================================
  // STEP 6: Statistics & Monitoring
  // =========================================================================

  /**
   * Get individual student statistics
   * - Total points
   * - Books read
   * - Quiz average score
   * - Reading progress
   */
  const getStudentStatistics = async (studentId: number): Promise<Student> => {
    const response = await api.users.get(studentId);
    return response?.data as Student;
  };

  /**
   * Get class-wide statistics
   * - Individual student stats for all students
   * - Useful for leaderboard or reporting
   */
  const getClassStatistics = async (): Promise<Student[]> => {
    const response = await api.dashboard.guruStudents();
    return (response?.data as Student[]) || [];
  };

  /**
   * Search students in class
   */
  const searchStudents = (students: Student[], query: string): Student[] => {
    if (!query.trim()) return students;

    const lowerQuery = query.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(lowerQuery) ||
        student.email.toLowerCase().includes(lowerQuery) ||
        (student.class_name && student.class_name.toLowerCase().includes(lowerQuery))
    );
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
    getPendingValidations,
    approveValidation,
    rejectValidation,
    loadEbooksForQuiz,
    createQuiz,
    getMyQuizzes: getCreatedQuizzes,
    updateQuiz,
    deleteQuiz,
    loadStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentStats: getStudentStatistics,
    getClassStats: getClassStatistics,
    updateProfile: updateUserProfile,
    changePassword: changeUserPassword,
  };
}

/**
 * GURU WORKFLOW USAGE EXAMPLE:
 * 
 * const workflow = useGuruWorkflow();
 * 
 * // Step 1: Login
 * await workflow.login('guru@email.com', 'password');
 * 
 * // Step 2: Load Dashboard
 * const stats = await workflow.loadStats();
 * console.log(`Siswa: ${stats.total_siswa}, Pending: ${stats.validasi_pending}`);
 * 
 * // Step 3: Validate Student Activities
 * const pending = await workflow.getPendingValidations();
 * 
 * // Approve activity
 * await workflow.approveValidation(pending[0].id);
 * 
 * // Or reject with reason
 * await workflow.rejectValidation(pending[0].id, 'Durasi membaca terlalu singkat');
 * 
 * // Step 4: Create Quiz
 * const ebooks = await workflow.loadEbooksForQuiz();
 * 
 * const quiz = await workflow.createQuiz({
 *   ebook_id: ebooks[0].id,
 *   questions: [
 *     {
 *       question: 'Siapa penulis Harry Potter?',
 *       option_a: 'J.K. Rowling',
 *       option_b: 'Stephen King',
 *       option_c: 'George R.R. Martin',
 *       option_d: 'Suzanne Collins',
 *       correct_answer: 'a'
 *     },
 *     // ... 4 more questions
 *   ]
 * });
 * 
 * // View all quizzes
 * const quizzes = await workflow.getMyQuizzes();
 * 
 * // Step 5: Manage Students
 * const students = await workflow.loadStudents();
 * 
 * // Add new student
 * const newStudent = await workflow.createStudent({
 *   name: 'Budi Santoso',
 *   email: 'budi@school.com',
 *   password: 'TempPassword123',
 *   grade_level: '10',
 *   class_name: 'X-A'
 * });
 * 
 * // Update student
 * await workflow.updateStudent(newStudent.id, {
 *   name: 'Budi Santoso Updated'
 * });
 * 
 * // Step 6: View Statistics
 * const studentStats = await workflow.getStudentStats(newStudent.id);
 * console.log(`${studentStats.name}: ${studentStats.total_points} poin`);
 * 
 * const classStats = await workflow.getClassStats();
 * console.log(`Rata-rata quiz: ${classStats.reduce((sum, s) => sum + (s.quiz_average_score || 0), 0) / classStats.length}`);
 * 
 * // Logout
 * await workflow.logout();
 */
