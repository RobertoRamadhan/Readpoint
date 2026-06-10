# READPOINT WORKFLOW SYSTEM - COMPLETE TYPESCRIPT GUIDE

## 📋 Overview

This document provides a comprehensive TypeScript-based workflow system for the Readpoint application. It includes complete type definitions and implementations for three distinct workflows: **Siswa (Student)**, **Guru (Teacher)**, and **Admin**.

---

## 📁 File Structure

```
frontend/
├── types/
│   └── workflow.ts                 # All TypeScript type definitions
│
├── lib/
│   └── workflows/
│       ├── index.ts                # Export all workflows
│       ├── siswa-workflow.ts        # Student workflow implementation
│       ├── guru-workflow.ts         # Teacher workflow implementation
│       ├── admin-workflow.ts        # Admin workflow implementation
│       ├── WORKFLOW_GUIDE.md        # Usage guide & examples
│       └── README.md                # This file
```

---

## 🎯 Type Definitions (`types/workflow.ts`)

### Authentication Types
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'guru' | 'siswa';
  class_name?: string;
  profile_photo_url?: string;
}

interface LoginResponse {
  message: string;
  user: User;
  token: string;
}
```

### Siswa (Student) Types
```typescript
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
  cover_image_url?: string;
  pdf_file_url?: string;
}

interface Reward {
  id: number;
  name: string;
  description?: string;
  points_required: number;
  stock: number;
}

interface SiswaWorkflow {
  // Authentication
  login: (email: string, password: string) => Promise<LoginResponse>;
  
  // Dashboard
  loadStats: () => Promise<SiswaStats>;
  loadEbooks: () => Promise<Ebook[]>;
  loadRewards: () => Promise<Reward[]>;
  
  // Reading
  startReading: (ebookId: number) => Promise<ReadingActivity>;
  updateReadingProgress: (activityId: number, currentPage: number) => Promise<void>;
  completeReading: (activityId: number, finalPage: number) => Promise<number>;
  
  // Quiz
  getQuizzes: (ebookId: number) => Promise<QuizQuestion[]>;
  submitQuiz: (submission: QuizSubmission) => Promise<{ score: number; points: number }>;
  
  // Rewards
  redeemReward: (rewardId: number, quantity: number) => Promise<Redemption>;
  
  // History
  getPointHistory: () => Promise<PointTransaction[]>;
  getQuizHistory: () => Promise<Quiz[]>;
  getReadingHistory: () => Promise<ReadingActivity[]>;
  
  // Profile
  updateProfile: (data: Partial<User>) => Promise<User>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  
  // Logout
  logout: () => Promise<void>;
}
```

### Guru (Teacher) Types
```typescript
interface GuruStats {
  total_siswa?: number;
  total_kuis_dibuat?: number;
  validasi_pending?: number;
  siswa_aktif_hari_ini?: number;
}

interface GuruWorkflow {
  // Validation
  getPendingValidations: () => Promise<ValidationActivity[]>;
  approveValidation: (activityId: number) => Promise<void>;
  rejectValidation: (activityId: number, notes: string) => Promise<void>;
  
  // Quiz Management
  loadEbooksForQuiz: () => Promise<Ebook[]>;
  createQuiz: (quizData: QuizFormData) => Promise<CreatedQuiz>;
  getMyQuizzes: () => Promise<CreatedQuiz[]>;
  updateQuiz: (quizId: number, quizData: QuizFormData) => Promise<void>;
  deleteQuiz: (quizId: number) => Promise<void>;
  
  // Student Management
  loadStudents: () => Promise<Student[]>;
  createStudent: (studentData: StudentForm) => Promise<Student>;
  updateStudent: (studentId: number, studentData: Partial<StudentForm>) => Promise<Student>;
  deleteStudent: (studentId: number) => Promise<void>;
  
  // Statistics
  getStudentStats: (studentId: number) => Promise<Student>;
  getClassStats: () => Promise<Student[]>;
  
  // ... Profile & Logout
}
```

### Admin Types
```typescript
interface AdminStats {
  total_siswa?: number;
  total_guru?: number;
  total_ebook?: number;
  total_reward?: number;
  siswa_aktif_hari_ini?: number;
  buku_dibaca_hari_ini?: number;
  kuis_dikerjakan_hari_ini?: number;
  reward_diklaim_hari_ini?: number;
}

interface AdminWorkflow {
  // Dashboard
  loadStats: () => Promise<AdminStats>;
  getTopStudents: () => Promise<TopStudent[]>;
  getDailyAnalytics: () => Promise<AdminStats>;
  
  // E-book Management
  loadEbooks: () => Promise<Ebook[]>;
  createEbook: (ebookData: EbookCreate) => Promise<Ebook>;
  updateEbook: (ebookId: number, ebookData: EbookUpdate) => Promise<Ebook>;
  deleteEbook: (ebookId: number) => Promise<void>;
  toggleEbookStatus: (ebookId: number, active: boolean) => Promise<void>;
  
  // Reward Management
  loadRewards: () => Promise<Reward[]>;
  createReward: (rewardData: RewardCreate) => Promise<Reward>;
  updateReward: (rewardId: number, rewardData: RewardUpdate) => Promise<Reward>;
  deleteReward: (rewardId: number) => Promise<void>;
  toggleRewardStatus: (rewardId: number, active: boolean) => Promise<void>;
  
  // User Management
  loadUsers: () => Promise<UserAccount[]>;
  loadUsersByRole: (role: 'siswa' | 'guru' | 'admin') => Promise<UserAccount[]>;
  createUser: (userData: Partial<UserAccount> & { password: string }) => Promise<UserAccount>;
  updateUser: (userId: number, userData: Partial<UserAccount>) => Promise<UserAccount>;
  deleteUser: (userId: number) => Promise<void>;
  resetUserPassword: (userId: number) => Promise<void>;
  
  // Reports
  getUserStats: () => Promise<AdminStats>;
  getActivityReport: (startDate: string, endDate: string) => Promise<any>;
  getRevenueReport: () => Promise<any>;
  
  // ... Profile & Logout
}
```

---

## 🚀 Usage Examples

### Using Siswa Workflow

```typescript
import { useSiswaWorkflow } from '@/lib/workflows';

function MyComponent() {
  const workflow = useSiswaWorkflow();
  
  const handleLogin = async () => {
    try {
      const response = await workflow.login('student@email.com', 'password');
      console.log('Logged in as:', response.user.name);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  const handleStartReading = async (ebookId: number) => {
    const activity = await workflow.startReading(ebookId);
    console.log('Started reading, activity ID:', activity.id);
  };
  
  const handleCompleteReading = async (activityId: number, finalPage: number) => {
    const points = await workflow.completeReading(activityId, finalPage, 45);
    console.log(`Reading completed! Earned ${points} points`);
  };
  
  return (
    <button onClick={handleLogin}>
      Login
    </button>
  );
}
```

### Using Guru Workflow

```typescript
import { useGuruWorkflow } from '@/lib/workflows';

function TeacherDashboard() {
  const workflow = useGuruWorkflow();
  const [pendingValidations, setPendingValidations] = useState([]);
  
  useEffect(() => {
    const loadPending = async () => {
      const validations = await workflow.getPendingValidations();
      setPendingValidations(validations);
    };
    loadPending();
  }, []);
  
  const handleApprove = async (activityId: number) => {
    await workflow.approveValidation(activityId);
    // Reload pending validations
  };
  
  const handleReject = async (activityId: number, reason: string) => {
    await workflow.rejectValidation(activityId, reason);
    // Reload pending validations
  };
  
  return (
    <div>
      {pendingValidations.map(validation => (
        <div key={validation.id}>
          <p>{validation.ebook?.title}</p>
          <button onClick={() => handleApprove(validation.id)}>Approve</button>
          <button onClick={() => handleReject(validation.id, 'Invalid activity')}>Reject</button>
        </div>
      ))}
    </div>
  );
}
```

### Using Admin Workflow

```typescript
import { useAdminWorkflow } from '@/lib/workflows';

function AdminPanel() {
  const workflow = useAdminWorkflow();
  const [stats, setStats] = useState<AdminStats | null>(null);
  
  useEffect(() => {
    const loadStats = async () => {
      const data = await workflow.loadStats();
      setStats(data);
    };
    loadStats();
  }, []);
  
  const handleUploadEbook = async (ebookData: EbookCreate) => {
    const newEbook = await workflow.createEbook(ebookData);
    console.log('Ebook uploaded:', newEbook.title);
  };
  
  const handleCreateUser = async (userData) => {
    const newUser = await workflow.createUser(userData);
    console.log('User created:', newUser.name);
  };
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {stats && <p>Total Students: {stats.total_siswa}</p>}
    </div>
  );
}
```

---

## 🔄 Workflow Flows

### SISWA WORKFLOW FLOW

```
1. LOGIN/REGISTER
   ↓
2. DASHBOARD
   - View stats (poin, buku dibaca, kuis)
   - View available ebooks
   - View available rewards
   ↓
3. BROWSE EBOOKS
   - Search/filter ebooks
   - View ebook details
   ↓
4. READ EBOOK
   - Start reading activity
   - Track reading progress (on each page scroll)
   - Complete reading (final page)
   - Earn points
   ↓
5. TAKE QUIZ
   - View quiz questions (5 questions per ebook)
   - Answer questions
   - Submit answers
   - Get score + bonus points
   ↓
6. REDEEM REWARDS
   - View available rewards
   - Check if points sufficient
   - Spend points to get reward
   ↓
7. VIEW HISTORY
   - Point transaction history
   - Quiz attempt history
   - Reading activity history
   ↓
8. PROFILE
   - Edit profile info
   - Change password
   ↓
9. LOGOUT
```

### GURU WORKFLOW FLOW

```
1. LOGIN
   ↓
2. DASHBOARD
   - View stats (total siswa, kuis dibuat, pending validasi, aktif hari ini)
   ↓
3. VALIDATE ACTIVITIES
   - View pending reading activities
   - Check student progress (halaman, durasi)
   - Approve activity → points awarded
   - Reject activity → student can retry
   ↓
4. MANAGE QUIZZES
   - Select ebook for quiz
   - Create 5 multiple-choice questions
   - Save quiz
   - View all created quizzes
   ↓
5. MANAGE STUDENTS
   - View list of students in class
   - Add new student manually
   - Update student info
   - Delete student from class
   ↓
6. VIEW STATISTICS
   - Individual student stats (poin, buku dibaca, quiz score)
   - Class-wide statistics
   ↓
7. SETTINGS
   - Edit profile
   - Change password
   ↓
8. LOGOUT
```

### ADMIN WORKFLOW FLOW

```
1. LOGIN
   ↓
2. DASHBOARD
   - View analytics (total siswa, guru, ebook, reward)
   - View activity summary (books read today, quizzes done, etc.)
   - View top students
   ↓
3. MANAGE EBOOKS
   - Upload new ebook (PDF + cover image)
   - Edit ebook metadata
   - Set grade level & points per page
   - Activate/deactivate ebook
   - Delete ebook
   ↓
4. MANAGE REWARDS
   - Create rewards (upload image)
   - Set points required & stock
   - Edit reward details
   - Activate/deactivate reward
   - Delete reward
   ↓
5. MANAGE USERS
   - View all users (siswa, guru, admin)
   - Create new users
   - Edit user info
   - Delete users
   - Reset passwords
   - Filter by role
   ↓
6. GENERATE REPORTS
   - User statistics
   - Activity reports (date range)
   - Revenue reports
   ↓
7. SETTINGS
   - Edit profile
   - Change password
   ↓
8. LOGOUT
```

---

## 💡 Best Practices

### 1. Error Handling
```typescript
try {
  const result = await workflow.someMethod();
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('401')) {
      // Token expired - redirect to login
      router.push('/login');
    } else {
      // Show error message to user
      setError(error.message);
    }
  }
}
```

### 2. Loading States
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await workflow.someMethod();
  } finally {
    setLoading(false);
  }
};
```

### 3. State Management
```typescript
const [state, setState] = useState({
  currentStep: 1,
  data: {},
  loading: false,
  error: null
});
```

### 4. Type Safety
```typescript
// Always specify types for workflow returns
const stats: SiswaStats = await workflow.loadStats();
const ebooks: Ebook[] = await workflow.loadEbooks();
```

---

## 📝 Integration Checklist

- [ ] Import workflow hooks in components
- [ ] Handle all async operations with try-catch
- [ ] Show loading states during API calls
- [ ] Validate form data before submission
- [ ] Handle 401 errors (redirect to login)
- [ ] Test all workflow steps manually
- [ ] Test error scenarios
- [ ] Verify TypeScript types compile
- [ ] Test responsive design on mobile
- [ ] Check accessibility (a11y)
- [ ] Verify localStorage token persistence
- [ ] Test page refresh doesn't break workflow

---

## 🔗 Related Files

- **Types**: `frontend/types/workflow.ts`
- **Implementations**: `frontend/lib/workflows/`
- **API Methods**: `frontend/lib/api.ts`
- **Auth Context**: `frontend/context/AuthContext.tsx`
- **Usage Examples**: `frontend/lib/workflows/WORKFLOW_GUIDE.md`

---

## 📞 Support

For issues or questions about the workflow system, refer to:
1. `WORKFLOW_GUIDE.md` - Detailed examples
2. `types/workflow.ts` - Type definitions
3. Individual workflow files - Implementation details

---

**Last Updated**: 2026-06-10  
**Status**: Production Ready ✅
