// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginRequest { email: string; password: string; }
interface RegisterRequest { name: string; email: string; password: string; password_confirmation: string; role: 'siswa' | 'guru' | 'admin'; grade_level?: string; class_name?: string; }
interface AuthResponse { message: string; user: { id: number; name: string; email: string; role: string }; token: string; }
interface GoogleLoginRequest { credential: string; }
interface RewardRedeemRequest { quantity?: number; }

export interface ApiResponse<T = unknown> {
  token?: string;
  user?: { id: number; name: string; email: string; role: 'admin' | 'guru' | 'siswa'; class_name?: string; profile_photo_url?: string; [key: string]: unknown };
  message?: string;
  data?: T;
  error?: string;
  pagination?: { current_page: number; per_page: number; total: number; last_page: number };
}

interface ApiCallOptions extends RequestInit { suppressErrorLogging?: boolean; }

// ─── Config ───────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const isDev = process.env.NODE_ENV !== 'production';

// ─── Core fetch helpers ───────────────────────────────────────────────────────

function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** JSON API call — always uses Bearer token, never credentials:include for uploads */
export async function apiCall(endpoint: string, options: ApiCallOptions = {}): Promise<ApiResponse> {
  const { suppressErrorLogging = false, ...requestOptions } = options;
  const url = `${API_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...authHeaders(),
    ...requestOptions.headers,
  };

  try {
    const response = await fetch(url, {
      ...requestOptions,
      credentials: 'include',
      headers,
    });

    let data: ApiResponse;
    try { data = await response.json(); }
    catch { data = { message: `HTTP ${response.status}` }; }

    if (!response.ok) {
      const msg = data?.message ?? `HTTP ${response.status}: API Error`;
      const err = new Error(msg);
      (err as any).status = response.status;
      throw err;
    }

    return data;
  } catch (error) {
    if (!suppressErrorLogging && isDev) console.error('[API]', error);
    throw error instanceof Error ? error : new Error('Network error');
  }
}

/**
 * FormData upload — uses Bearer token but NO credentials:include
 * so Supabase/CDN responses with wildcard CORS don't block the request.
 */
async function uploadFormData(
  method: 'POST',
  endpoint: string,
  data: FormData,
  timeoutMs = 300000, // 5 menit untuk file besar
): Promise<ApiResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: { ...authHeaders(), Accept: 'application/json' },
      // NO credentials:'include' — avoids CORS wildcard conflict
      body: data,
      signal: controller.signal,
    });

    clearTimeout(timer);

    let result: ApiResponse;
    try { result = await response.json(); }
    catch { throw new Error(`HTTP ${response.status}: ${response.statusText}`); }

    if (!response.ok) {
      throw new Error(result?.message ?? `HTTP ${response.status}: Upload failed`);
    }

    return result;
  } catch (e: any) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('Upload timeout — file terlalu besar atau koneksi lambat');
    throw e;
  }
}

// ─── API object ───────────────────────────────────────────────────────────────

export const api = {

  // ── Auth ────────────────────────────────────────────────────────────────────
  login: (data: LoginRequest) => apiCall('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => apiCall('/auth/logout', { method: 'POST' }),
  register: (data: RegisterRequest) => apiCall('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  googleLogin: (data: GoogleLoginRequest) => apiCall('/auth/google-login', { method: 'POST', body: JSON.stringify(data) }),

  // ── E-Books (siswa) ─────────────────────────────────────────────────────────
  getEbooks: () => apiCall('/ebooks'),
  getEbook: (id: number) => apiCall(`/ebooks/${id}`),

  // ── Reading Progress ────────────────────────────────────────────────────────
  getReadingProgress: () => apiCall('/reading-progress'),
  updateReadingProgress: (id: number, data: Record<string, unknown>) =>
    apiCall(`/reading-progress/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // ── Reading Activities ──────────────────────────────────────────────────────
  startReading: (ebookId: number) =>
    apiCall('/reading-activities/start', { method: 'POST', body: JSON.stringify({ ebook_id: ebookId }) }),
  updateActivityProgress: (id: number, data: Record<string, unknown>) =>
    apiCall(`/reading-activities/${id}/progress`, { method: 'PUT', body: JSON.stringify(data) }),
  completeReading: (id: number, data: Record<string, unknown>) =>
    apiCall(`/reading-activities/${id}/complete`, { method: 'PUT', body: JSON.stringify(data) }),
  getMyActivities: () => apiCall('/reading-activities'),
  getFrequentlyReadBooks: () => apiCall('/reading-activities/frequently-read'),

  // ── Quizzes ─────────────────────────────────────────────────────────────────
  getQuizzes: (ebookId: number) => apiCall(`/ebooks/${ebookId}/quiz`),
  getAllQuizzes: () => apiCall('/ebooks-with-quiz'),
  submitQuiz: (data: Record<string, unknown>) =>
    apiCall('/quiz/submit', { method: 'POST', body: JSON.stringify(data) }),
  getMyQuizAttempts: () => apiCall('/quiz/my-attempts'),

  quiz: {
    create: (data: Record<string, unknown>) => apiCall('/quiz/create', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Record<string, unknown>) => apiCall(`/quiz/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => apiCall(`/quiz/${id}`, { method: 'DELETE' }),
    getMyQuizzes: () => apiCall('/dashboard/guru/quizzes'),
  },

  // ── Validations ─────────────────────────────────────────────────────────────
  validations: {
    getPending: () => apiCall('/validations/pending'),
    getDetail: (id: number) => apiCall(`/validations/${id}`),
    approve: (id: number, notes?: string) =>
      apiCall(`/validations/${id}/approve`, { method: 'PUT', body: JSON.stringify({ notes }) }),
    reject: (id: number, notes: string) =>
      apiCall(`/validations/${id}/reject`, { method: 'PUT', body: JSON.stringify({ notes }) }),
    getHistory: () => apiCall('/validations/history'),
    getStatistics: () => apiCall('/validations/stats'),
  },

  // ── Users ───────────────────────────────────────────────────────────────────
  users: {
    list: () => apiCall('/users?per_page=500'),

    classes: async (): Promise<ApiResponse> => {
      const res = await api.users.list();
      const users = Array.isArray(res?.data) ? (res.data as any[]) : [];
      const seen = { t: new Set<string>(), s: new Set<string>() };
      const map: Record<string, any> = {};

      users.forEach((u) => {
        const { role, grade_level: gl, class_name: cn } = u;
        if (!gl || !cn) return;
        const key = `${gl}|${cn}`;
        if (!map[key]) map[key] = { id: key, grade_level: gl, class_name: cn, teacher_name: '', student_count: 0 };
        const uid = u.id ?? `${u.name}|${u.email}`;
        if (role === 'guru' && !seen.t.has(uid)) { map[key].teacher_name = u.name; seen.t.add(uid); }
        if (role === 'siswa' && !seen.s.has(uid)) { map[key].student_count++; seen.s.add(uid); }
      });

      return { data: Object.values(map) } as ApiResponse;
    },

    get: (id: number) => apiCall(`/users/${id}`),
    create: (data: Record<string, unknown>) =>
      apiCall('/users/create', { method: 'POST', body: JSON.stringify(data) }),

    update: async (id: number, data: FormData | Record<string, unknown>): Promise<ApiResponse> => {
      if (data instanceof FormData) {
        data.append('_method', 'PUT');
        return uploadFormData('POST', `/users/${id}`, data);
      }
      return apiCall(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },

    delete: (id: number, options?: { force?: boolean }) =>
      apiCall(`/users/${id}${options?.force ? '?force=true' : ''}`, { method: 'DELETE' }),

    resetPassword: (id: number, password: string) =>
      apiCall(`/users/${id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password, password_confirmation: password }),
      }),
  },

  // classes — derived from users (no real /api/classes endpoint)
  classes: {
    list: () => api.users.classes(),
    get: (_id: number | string): Promise<ApiResponse> => Promise.resolve({ data: null } as ApiResponse),
    create: (data: Record<string, unknown>): Promise<ApiResponse> => Promise.resolve({ data } as ApiResponse),
    update: (_id: number, data: Record<string, unknown>): Promise<ApiResponse> => Promise.resolve({ data } as ApiResponse),
    delete: (_id: number | string): Promise<ApiResponse> => Promise.resolve({ data: null } as ApiResponse),
  },

  teachers: {
    list: async (): Promise<ApiResponse> => {
      const res = await api.users.list();
      const users = Array.isArray(res?.data) ? (res.data as any[]) : [];
      return { data: users.filter((u: any) => u.role === 'guru') } as ApiResponse;
    },
  },

  // ── Current user profile ────────────────────────────────────────────────────
  me: {
    getProfile: () => apiCall('/user/profile'),
    updateProfile: async (data: FormData | Record<string, unknown>): Promise<ApiResponse> => {
      if (data instanceof FormData) {
        data.append('_method', 'PUT');
        return uploadFormData('POST', '/user/profile', data);
      }
      return apiCall('/user/profile', { method: 'PUT', body: JSON.stringify(data) });
    },
  },

  // ── Dashboard ───────────────────────────────────────────────────────────────
  dashboard: {
    adminStats: () => apiCall('/dashboard/admin/stats'),
    adminTopStudents: () => apiCall('/dashboard/admin/top-students'),
    adminBooks: () => apiCall('/dashboard/admin/books'),
    adminUsersStats: () => apiCall('/dashboard/admin/users-stats'),
    adminHistory: (period?: number) => apiCall(`/dashboard/admin/history${period ? `?period=${period}` : ''}`),

    guruStats: () => apiCall('/dashboard/guru/stats'),
    guruStudents: () => apiCall('/dashboard/guru/students'),
    guruQuizzes: () => apiCall('/dashboard/guru/quizzes'),
    guruHistory: () => apiCall('/dashboard/guru/history'),

    siswaStats: () => apiCall('/dashboard/siswa/stats'),
    siswaBooks: () => apiCall('/dashboard/siswa/books'),
    siswaPointsHistory: () => apiCall('/dashboard/siswa/points-history'),
    siswaQuizAttempts: () => apiCall('/dashboard/siswa/quiz-attempts'),
    siswaReadingActivities: () => apiCall('/dashboard/siswa/reading-activities'),
    siswaHistory: () => apiCall('/dashboard/siswa/history'),
  },

  // ── E-Books Admin CRUD ──────────────────────────────────────────────────────
  ebooks: {
    list: () => apiCall('/ebooks'),
    get: (id: number) => apiCall(`/ebooks/${id}`),

    create: async (data: FormData | Record<string, unknown>): Promise<ApiResponse> => {
      if (data instanceof FormData) return uploadFormData('POST', '/ebooks', data);
      return apiCall('/ebooks', { method: 'POST', body: JSON.stringify(data) });
    },

    update: async (id: number, data: FormData | Record<string, unknown>): Promise<ApiResponse> => {
      if (data instanceof FormData) {
        data.append('_method', 'PUT');
        return uploadFormData('POST', `/ebooks/${id}`, data);
      }
      return apiCall(`/ebooks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },

    delete: (id: number) => apiCall(`/ebooks/${id}`, { method: 'DELETE' }),
  },

  // ── Rewards Admin CRUD ──────────────────────────────────────────────────────
  rewards: {
    list: () => apiCall('/rewards'),
    get: (id: number) => apiCall(`/rewards/${id}`),

    create: async (data: FormData | Record<string, unknown>): Promise<ApiResponse> => {
      if (data instanceof FormData) return uploadFormData('POST', '/rewards', data);
      return apiCall('/rewards', { method: 'POST', body: JSON.stringify(data) });
    },

    update: async (id: number, data: FormData | Record<string, unknown>): Promise<ApiResponse> => {
      if (data instanceof FormData) {
        data.append('_method', 'PUT');
        return uploadFormData('POST', `/rewards/${id}`, data);
      }
      return apiCall(`/rewards/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },

    delete: (id: number) => apiCall(`/rewards/${id}`, { method: 'DELETE' }),
    redeem: (id: number, options?: RewardRedeemRequest) =>
      apiCall(`/rewards/${id}/redeem`, { method: 'POST', body: JSON.stringify(options ?? {}) }),
    getMyRedemptions: () => apiCall('/my-redemptions'),
    getUserPoints: () => apiCall('/user-points'),
  },
};
