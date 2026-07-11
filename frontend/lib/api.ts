// Type definitions for API requests and responses

interface LoginRequest {

  email: string;

  password: string;

}



interface RegisterRequest {

  name: string;

  email: string;

  password: string;

  password_confirmation: string;

  role: 'siswa' | 'guru' | 'admin';

  grade_level?: string;

  class_name?: string;

}



interface AuthResponse {

  message: string;

  user: {

    id: number;

    name: string;

    email: string;

    role: string;

  };

  token: string;

}



interface ApiResponse<T = unknown> {

  token: any;

  user: any;

  message?: string;

  data?: T;

  error?: string;

  pagination?: {

    current_page: number;

    per_page: number;

    total: number;

    last_page: number;

  };

}



interface BookCreateRequest {

  title: string;

  author: string;

  description?: string;

  grade_level: string;

}



interface RewardRedeemRequest {

  quantity?: number;

}

interface GoogleLoginRequest {

  credential: string;

}

interface ApiCallOptions extends RequestInit {
  suppressErrorLogging?: boolean;
}


// CSRF token management

async function getCsrfToken(): Promise<string> {

  // For token-based authentication (Bearer tokens), CSRF is not needed
  // CSRF is only needed for cookie-based sessions and form submissions
  // Our API uses Bearer tokens in Authorization header, so return empty string
  return '';

}



const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  console.log('[API] Initialized with URL:', API_URL);
}

/** Only logs in development — safe to call anywhere */
function devLog(...args: unknown[]) {
  if (isDev) console.log(...args);
}

/** Only logs errors in development — in production errors are thrown, not logged */
function devError(...args: unknown[]) {
  if (isDev) console.error(...args);
}

export async function apiCall(endpoint: string, options: ApiCallOptions = {}): Promise<ApiResponse> {

  const { suppressErrorLogging = false, ...requestOptions } = options;

  const url = `${API_URL}${endpoint}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const csrfToken = await getCsrfToken();

  const defaultHeaders: HeadersInit = {

    'Content-Type': 'application/json',

    Accept: 'application/json',

    ...(token && { Authorization: `Bearer ${token}` }),

    ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),

  };

  devLog(`[API] ${options.method || 'GET'} ${url}`);

  try {

    const response = await fetch(url, {

      ...requestOptions,

      // Hanya kirim credentials ke backend kita sendiri, bukan ke Supabase/CDN
      credentials: 'include',

      headers: {

        ...defaultHeaders,

        ...requestOptions.headers,

      },

    });



    let data: ApiResponse;

    try {

      data = await response.json();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars

    } catch (e) {

      if (!suppressErrorLogging) {
        devLog('[API] Failed to parse JSON response');
      }

      data = { message: `HTTP ${response.status}`, token: null, user: null };

    }



    if (!suppressErrorLogging) {
      devLog(`[API] Response (${response.status}):`, data);
    }



    if (!response.ok) {

      const errorMessage = typeof data === 'object' && data.message 

        ? data.message 

        : `HTTP ${response.status}: API Error`;

      

      const error = new Error(errorMessage);

      (error as unknown as Record<string, unknown>).status = response.status;

      throw error;

    }



    return data;

  } catch (error) {

    let errorMessage = 'Network error or server is unreachable';

    

    if (error instanceof Error) {

      errorMessage = error.message;

    }

    

    // Suppress "Failed to fetch" errors - they're usually network timeouts
    if (!suppressErrorLogging) {
      devError('[API] Error:', errorMessage);
    }

    throw new Error(errorMessage);

  }

}



export const api = {

  // Auth

  login: (data: LoginRequest): Promise<ApiResponse<AuthResponse>> =>

    apiCall('/auth/login', {

      method: 'POST',

      body: JSON.stringify(data),

    }) as Promise<ApiResponse<AuthResponse>>,



  logout: (): Promise<ApiResponse> =>

    apiCall('/auth/logout', { method: 'POST' }),



  register: (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> =>

    apiCall('/auth/register', {

      method: 'POST',

      body: JSON.stringify(data),

    }) as Promise<ApiResponse<AuthResponse>>,

  googleLogin: (data: GoogleLoginRequest): Promise<ApiResponse<AuthResponse>> =>

    apiCall('/auth/google-login', {

      method: 'POST',

      body: JSON.stringify(data),

    }) as Promise<ApiResponse<AuthResponse>>,



  // Books

  getBooks: (): Promise<ApiResponse> => apiCall('/books'),

  getBook: (id: number): Promise<ApiResponse> => apiCall(`/books/${id}`),

  createBook: (data: BookCreateRequest): Promise<ApiResponse> =>

    apiCall('/books', {

      method: 'POST',

      body: JSON.stringify(data),

    }),



  // E-Books

  getEbooks: (): Promise<ApiResponse> => apiCall('/ebooks'),

  getEbook: (id: number): Promise<ApiResponse> => apiCall(`/ebooks/${id}`),

  createEbook: async (data: FormData): Promise<ApiResponse> => {

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const csrfToken = await getCsrfToken();

    

    const response = await fetch(`${API_URL}/ebooks`, {

      method: 'POST',

      headers: {

        ...(token && { Authorization: `Bearer ${token}` }),

        ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),

      },

      credentials: 'include',

      body: data,

    });



    const result = await response.json();

    if (!response.ok) {

      throw new Error(result.message || `HTTP ${response.status}: Failed to upload ebook`);

    }

    return result;

  },



  // Reading Progress

  getReadingProgress: (): Promise<ApiResponse> => apiCall('/reading-progress'),

  updateReadingProgress: (id: number, data: Record<string, unknown>): Promise<ApiResponse> =>

    apiCall(`/reading-progress/${id}`, {

      method: 'PUT',

      body: JSON.stringify(data),

    }),



  // Reading Activities

  startReading: (ebookId: number): Promise<ApiResponse> =>

    apiCall('/reading-activities/start', {

      method: 'POST',

      body: JSON.stringify({ ebook_id: ebookId }),

    }),

  updateActivityProgress: (activityId: number, data: Record<string, unknown>): Promise<ApiResponse> =>

    apiCall(`/reading-activities/${activityId}/progress`, {

      method: 'PUT',

      body: JSON.stringify(data),

    }),

  completeReading: (activityId: number, data: Record<string, unknown>): Promise<ApiResponse> =>

    apiCall(`/reading-activities/${activityId}/complete`, {

      method: 'PUT',

      body: JSON.stringify(data),

    }),

  getMyActivities: (): Promise<ApiResponse> => apiCall('/reading-activities'),

  getFrequentlyReadBooks: (): Promise<ApiResponse> => apiCall('/reading-activities/frequently-read'),



  // Quizzes

  getQuizzes: (bookId: number): Promise<ApiResponse> => apiCall(`/ebooks/${bookId}/quiz`),

  /** Returns ebooks that have quiz questions — for the siswa quiz tab */
  getAllQuizzes: (): Promise<ApiResponse> => apiCall('/ebooks-with-quiz'),

  submitQuiz: (data: Record<string, unknown>): Promise<ApiResponse> =>

    apiCall('/quiz/submit', {

      method: 'POST',

      body: JSON.stringify(data),

    }),

  getMyQuizAttempts: (): Promise<ApiResponse> => apiCall('/quiz/my-attempts'),



  quiz: {

    create: (data: Record<string, unknown>): Promise<ApiResponse> =>

      apiCall('/quiz/create', {

        method: 'POST',

        body: JSON.stringify(data),

      }),

    update: (id: number, data: Record<string, unknown>): Promise<ApiResponse> =>

      apiCall(`/quiz/${id}`, {

        method: 'PUT',

        body: JSON.stringify(data),

      }),

    delete: (id: number): Promise<ApiResponse> =>

      apiCall(`/quiz/${id}`, {

        method: 'DELETE',

      }),

    getMyQuizzes: (): Promise<ApiResponse> => apiCall('/quiz/my-quizzes'),

  },



  // Validations

  validations: {

    getPending: (): Promise<ApiResponse> => apiCall('/validations/pending'),

    getDetail: (id: number): Promise<ApiResponse> => apiCall(`/validations/${id}`),

    approve: (id: number): Promise<ApiResponse> =>

      apiCall(`/validations/${id}/approve`, {

        method: 'PUT',

      }),

    reject: (id: number, notes: string): Promise<ApiResponse> =>

      apiCall(`/validations/${id}/reject`, {

        method: 'PUT',

        body: JSON.stringify({ notes }),

      }),

    getHistory: (): Promise<ApiResponse> => apiCall('/validations/history'),

    getStatistics: (): Promise<ApiResponse> => apiCall('/validations/stats'),

  },



  // Users

  users: {

    list: (): Promise<ApiResponse> => apiCall('/users?per_page=500'),

    classes: async (): Promise<ApiResponse> => {
      try {
        const usersResponse = await api.users.list();
        const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];

        const seenStudentKeys = new Set<string>();
        const seenTeacherKeys = new Set<string>();

        const grouped = users.reduce<Record<string, { id: string; grade_level?: string; class_name?: string; teacher_name?: string; student_count?: number }>>((acc, user: any) => {
          const role = user?.role;
          const gradeLevel = user?.grade_level;
          const className = user?.class_name;

          if (!gradeLevel || !className) {
            return acc;
          }

          const key = `${gradeLevel}|${className}`;
          if (!acc[key]) {
            acc[key] = {
              id: key,
              grade_level: gradeLevel,
              class_name: className,
              teacher_name: role === 'guru' ? user?.name : undefined,
              student_count: 0,
            };
          }

          const teacherKey = user?.id ? `teacher:${user.id}` : `teacher:${user?.name ?? ''}|${user?.email ?? ''}`;
          const studentKey = user?.id ? `student:${user.id}` : `student:${user?.name ?? ''}|${user?.email ?? ''}`;

          if (role === 'guru' && !seenTeacherKeys.has(teacherKey)) {
            acc[key].teacher_name = user?.name;
            seenTeacherKeys.add(teacherKey);
          }

          if (role === 'siswa' && !seenStudentKeys.has(studentKey)) {
            acc[key].student_count = (acc[key].student_count || 0) + 1;
            seenStudentKeys.add(studentKey);
          }

          return acc;
        }, {});

        return { data: Object.values(grouped) } as ApiResponse;
      } catch (error) {
        throw error;
      }
    },

    get: (id: number): Promise<ApiResponse> => apiCall(`/users/${id}`),

    create: (data: Record<string, unknown>): Promise<ApiResponse> =>
      apiCall('/users/create', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: async (id: number, data: FormData | Record<string, unknown>): Promise<ApiResponse> => {

      if (data instanceof FormData) {

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const csrfToken = await getCsrfToken();

        

        // Add _method parameter for Laravel to simulate PUT

        data.append('_method', 'PUT');

        

        devLog('[API] Updating user with FormData...');

        const response = await fetch(`${API_URL}/users/${id}`, {

          method: 'POST',

          headers: {

            ...(token && { Authorization: `Bearer ${token}` }),

            ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),

            // DO NOT set Content-Type - browser will set it with boundary

          },

          credentials: 'include',

          body: data,

        });

        

        let result;

        try {

          result = await response.json();

        } catch (e) {

          devError('[API] Failed to parse response:', response.statusText);

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        }

        

        if (!response.ok) {

          devError('[API] User update failed:', result);

          throw new Error(result.message || `HTTP ${response.status}: Failed to update user`);

        }

        

        devLog('[API] User updated successfully:', result);

        return result;

      }

      

      devLog('[API] Updating user with JSON...');

      return apiCall(`/users/${id}`, {

        method: 'PUT',

        body: JSON.stringify(data),

      });

    },

    delete: (id: number, options?: { force?: boolean }): Promise<ApiResponse> => {

      const queryParams = options?.force ? '?force=true' : '';

      return apiCall(`/users/${id}${queryParams}`, {

        method: 'DELETE',

      });

    },

    resetPassword: (id: number, password: string): Promise<ApiResponse> =>

      apiCall(`/users/${id}/reset-password`, {

        method: 'POST',

        body: JSON.stringify({ password, password_confirmation: password }),

      }),

  },



  // NOTE: /api/classes does not exist on the backend.
  // list() is re-routed to api.users.classes() which groups users by grade_level+class_name.
  // create/update/delete fall back to localStorage (handled in admin page).
  classes: {
    list: (): Promise<ApiResponse> => {
      // Delegate to the user-derived class grouping
      return api.users.classes();
    },
    get: (_id: number | string): Promise<ApiResponse> =>
      Promise.resolve({ data: null, message: 'not implemented', token: null, user: null }),
    create: (data: Record<string, unknown>): Promise<ApiResponse> =>
      Promise.resolve({ data, message: 'saved locally', token: null, user: null }),
    update: (_id: number, data: Record<string, unknown>): Promise<ApiResponse> =>
      Promise.resolve({ data, message: 'saved locally', token: null, user: null }),
    delete: (_id: number | string): Promise<ApiResponse> =>
      Promise.resolve({ data: null, message: 'deleted locally', token: null, user: null }),
  },

  teachers: {
    list: (): Promise<ApiResponse> => {
      // Derive teacher list from users endpoint
      return api.users.list().then((res) => {
        const users = Array.isArray(res?.data) ? res.data : [];
        const teachers = (users as any[]).filter((u: any) => u?.role === 'guru');
        return { data: teachers, message: undefined, token: null, user: null };
      });
    },
  },

  // Current User (for profile management - non-admin)

  me: {

    getProfile: (): Promise<ApiResponse> => apiCall('/user/profile'),

    updateProfile: async (data: FormData | Record<string, unknown>): Promise<ApiResponse> => {

      if (data instanceof FormData) {

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const csrfToken = await getCsrfToken();

        

        // Add _method parameter for Laravel to simulate PUT

        data.append('_method', 'PUT');

        

        const response = await fetch(`${API_URL}/user/profile`, {

          method: 'POST',

          headers: {

            ...(token && { Authorization: `Bearer ${token}` }),

            ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),

          },

          credentials: 'include',

          body: data,

        });

        

        const result = await response.json();

        if (!response.ok) {

          throw new Error(result.message || `HTTP ${response.status}: Failed to update profile`);

        }

        return result;

      }

      

      return apiCall('/user/profile', {

        method: 'PUT',

        body: JSON.stringify(data),

      });

    },

  },



  // Dashboard

  dashboard: {

    adminStats: (): Promise<ApiResponse> => apiCall('/dashboard/admin/stats'),

    adminTopStudents: (): Promise<ApiResponse> => apiCall('/dashboard/admin/top-students'),

    adminBooks: (): Promise<ApiResponse> => apiCall('/dashboard/admin/books'),

    adminUsersStats: (): Promise<ApiResponse> => apiCall('/dashboard/admin/users-stats'),

    adminHistory: (period?: number): Promise<ApiResponse> => apiCall(`/dashboard/admin/history${period ? `?period=${period}` : ''}`),

    

    guruStats: (): Promise<ApiResponse> => apiCall('/dashboard/guru/stats'),

    guruStudents: (): Promise<ApiResponse> => apiCall('/dashboard/guru/students'),

    guruQuizzes: (): Promise<ApiResponse> => apiCall('/dashboard/guru/quizzes'),

    guruHistory: (): Promise<ApiResponse> => apiCall('/dashboard/guru/history'),

    

    siswaStats: (): Promise<ApiResponse> => apiCall('/dashboard/siswa/stats'),

    siswaBooks: (): Promise<ApiResponse> => apiCall('/dashboard/siswa/books'),

    siswaPointsHistory: (): Promise<ApiResponse> => apiCall('/dashboard/siswa/points-history'),

    siswaQuizAttempts: (): Promise<ApiResponse> => apiCall('/dashboard/siswa/quiz-attempts'),

    siswaReadingActivities: (): Promise<ApiResponse> => apiCall('/dashboard/siswa/reading-activities'),

    siswaHistory: (): Promise<ApiResponse> => apiCall('/dashboard/siswa/history'),

  },



  // E-Books Admin CRUD

  ebooks: {

    list: (): Promise<ApiResponse> => apiCall('/ebooks'),

    get: (id: number): Promise<ApiResponse> => apiCall(`/ebooks/${id}`),

    create: async (data: FormData | Record<string, unknown>): Promise<ApiResponse> => {

      if (data instanceof FormData) {

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const csrfToken = await getCsrfToken();

        devLog('[API] Creating ebook with FormData...');

        // Timeout 120s untuk upload file besar
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        try {
          const response = await fetch(`${API_URL}/ebooks`, {

            method: 'POST',

            headers: {

              ...(token && { Authorization: `Bearer ${token}` }),

              ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),

            },

            credentials: 'include',

            body: data,

            signal: controller.signal,

          });

          clearTimeout(timeoutId);

          let result;

          try {

            result = await response.json();

          } catch (e) {

            devError('[API] Failed to parse response:', response.statusText);

            throw new Error(`HTTP ${response.status}: ${response.statusText}`);

          }

          if (!response.ok) {

            throw new Error(result.message || `HTTP ${response.status}: Failed to upload ebook`);

          }

          return result;
        } catch (e: any) {
          clearTimeout(timeoutId);
          if (e.name === 'AbortError') throw new Error('Upload timeout - file terlalu besar atau koneksi lambat');
          throw e;
        }

      }

      return apiCall('/ebooks', {

        method: 'POST',

        body: JSON.stringify(data),

      });

    },

    update: async (id: number, data: FormData | Record<string, unknown>): Promise<ApiResponse> => {

      if (data instanceof FormData) {

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const csrfToken = await getCsrfToken();

        

        // Add _method parameter for Laravel to simulate PUT

        data.append('_method', 'PUT');

        

        devLog('[API] Updating ebook with FormData...');

        const response = await fetch(`${API_URL}/ebooks/${id}`, {

          method: 'POST',

          headers: {

            ...(token && { Authorization: `Bearer ${token}` }),

            ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),

            // DO NOT set Content-Type - browser will set it with boundary

          },

          credentials: 'include',

          body: data,

        });

        

        let result;

        try {

          result = await response.json();

        } catch (e) {

          devError('[API] Failed to parse response:', response.statusText);

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        }

        

        if (!response.ok) {

          devError('[API] Ebook update failed:', result);

          throw new Error(result.message || `HTTP ${response.status}: Failed to update ebook`);

        }

        

        devLog('[API] Ebook updated successfully:', result);

        return result;

      }

      

      return apiCall(`/ebooks/${id}`, {

        method: 'PUT',

        body: JSON.stringify(data),

      });

    },

    delete: (id: number): Promise<ApiResponse> =>

      apiCall(`/ebooks/${id}`, {

        method: 'DELETE',

      }),

    getText: (id: number): Promise<ApiResponse> =>

      apiCall(`/ebooks/${id}/text`),

  },



  // Rewards Admin CRUD

  rewards: {

    list: (): Promise<ApiResponse> => apiCall('/rewards'),

    get: (id: number): Promise<ApiResponse> => apiCall(`/rewards/${id}`),

    create: async (data: FormData | Record<string, unknown>): Promise<ApiResponse> => {

      if (data instanceof FormData) {

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const csrfToken = await getCsrfToken();

        

        devLog('[API] Creating reward with FormData...');

        const response = await fetch(`${API_URL}/rewards`, {

          method: 'POST',

          headers: {

            ...(token && { Authorization: `Bearer ${token}` }),

            ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),

            // DO NOT set Content-Type - browser will set it with boundary

          },

          credentials: 'include',

          body: data,

        });

        

        let result;

        try {

          result = await response.json();

        } catch (e) {

          devError('[API] Failed to parse response:', response.statusText);

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        }

        

        if (!response.ok) {

          devError('[API] Reward create failed:', result);

          throw new Error(result.message || `HTTP ${response.status}: Failed to create reward`);

        }

        

        devLog('[API] Reward created successfully:', result);

        return result;

      }

      

      return apiCall('/rewards', {

        method: 'POST',

        body: JSON.stringify(data),

      });

    },

    update: async (id: number, data: FormData | Record<string, unknown>): Promise<ApiResponse> => {

      if (data instanceof FormData) {

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const csrfToken = await getCsrfToken();

        

        // Add _method parameter for Laravel to simulate PUT

        data.append('_method', 'PUT');

        

        devLog('[API] Updating reward with FormData...');

        const response = await fetch(`${API_URL}/rewards/${id}`, {

          method: 'POST',

          headers: {

            ...(token && { Authorization: `Bearer ${token}` }),

            ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),

            // DO NOT set Content-Type - browser will set it with boundary

          },

          credentials: 'include',

          body: data,

        });

        

        let result;

        try {

          result = await response.json();

        } catch (e) {

          devError('[API] Failed to parse response:', response.statusText);

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        }

        

        if (!response.ok) {

          devError('[API] Reward update failed:', result);

          throw new Error(result.message || `HTTP ${response.status}: Failed to update reward`);

        }

        

        devLog('[API] Reward updated successfully:', result);

        return result;

      }

      

      return apiCall(`/rewards/${id}`, {

        method: 'PUT',

        body: JSON.stringify(data),

      });

    },

    delete: (id: number): Promise<ApiResponse> =>

      apiCall(`/rewards/${id}`, {

        method: 'DELETE',

      }),

    redeem: (id: number, options?: RewardRedeemRequest): Promise<ApiResponse> =>

      apiCall(`/rewards/${id}/redeem`, {

        method: 'POST',

        body: JSON.stringify(options || {}),

      }),

    getMyRedemptions: (): Promise<ApiResponse> => apiCall('/my-redemptions'),

    getUserPoints: (): Promise<ApiResponse> => apiCall('/user-points'),

  },



  };

