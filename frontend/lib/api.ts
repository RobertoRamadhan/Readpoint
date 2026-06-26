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

  try {

    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    if (token) return token;



    // Fetch CSRF token from sanctum endpoint

    const response = await fetch(`${API_URL.replace('/api', '')}/sanctum/csrf-cookie`, {

      credentials: 'include',

    });

    

    const newToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    return newToken || '';

  } catch {

    return '';

  }

}



const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';



console.log('[API] Initialized with URL:', API_URL);



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



  console.log(`[API] ${options.method || 'GET'} ${url}`);



  try {

    const response = await fetch(url, {

      ...requestOptions,

      credentials: 'include', // Include cookies for Sanctum

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
        console.warn('[API] Failed to parse JSON response');
      }

      data = { message: `HTTP ${response.status}`, token: null, user: null };

    }



    if (!suppressErrorLogging) {
      console.log(`[API] Response (${response.status}):`, data);
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
      console.error('[API] Error:', errorMessage);
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
  getAllQuizzes: (): Promise<ApiResponse> => apiCall('/quizzes'), // Get all quizzes (siswa)

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

    list: (): Promise<ApiResponse> => apiCall('/users'),

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

    create: async (data: Record<string, unknown>): Promise<ApiResponse> => {

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const csrfToken = await getCsrfToken();

      

      console.log('[API] Creating user...');

      const response = await fetch(`${API_URL}/users/create`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          ...(token && { Authorization: `Bearer ${token}` }),

          ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken }),

        },

        credentials: 'include',

        body: JSON.stringify(data),

      });

      

      let result;

      try {

        result = await response.json();

      } catch (e) {

        console.error('[API] Failed to parse response:', response.statusText);

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      }

      

      if (!response.ok) {

        console.error('[API] User create failed:', result);

        throw new Error(result.message || `HTTP ${response.status}: Failed to create user`);

      }

      

      console.log('[API] User created successfully:', result);

      return result;

    },

    update: async (id: number, data: FormData | Record<string, unknown>): Promise<ApiResponse> => {

      if (data instanceof FormData) {

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const csrfToken = await getCsrfToken();

        

        // Add _method parameter for Laravel to simulate PUT

        data.append('_method', 'PUT');

        

        console.log('[API] Updating user with FormData...');

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

          console.error('[API] Failed to parse response:', response.statusText);

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        }

        

        if (!response.ok) {

          console.error('[API] User update failed:', result);

          throw new Error(result.message || `HTTP ${response.status}: Failed to update user`);

        }

        

        console.log('[API] User updated successfully:', result);

        return result;

      }

      

      console.log('[API] Updating user with JSON...');

      return apiCall(`/users/${id}`, {

        method: 'PUT',

        body: JSON.stringify(data),

      });

    },

    delete: (id: number): Promise<ApiResponse> =>

      apiCall(`/users/${id}`, {

        method: 'DELETE',

      }),

    resetPassword: (id: number): Promise<ApiResponse> =>

      apiCall(`/users/${id}/reset-password`, {

        method: 'POST',

      }),

  },



  classes: {
    list: (): Promise<ApiResponse> => apiCall('/classes'),
    get: (id: number | string): Promise<ApiResponse> => apiCall(`/classes/${id}`),
    create: (data: Record<string, unknown>): Promise<ApiResponse> =>
      apiCall('/classes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: Record<string, unknown>): Promise<ApiResponse> =>
      apiCall(`/classes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number | string): Promise<ApiResponse> =>
      apiCall(`/classes/${id}`, {
        method: 'DELETE',
      }),
  },

  teachers: {
    list: (): Promise<ApiResponse> => apiCall('/teachers'),
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

    

    guruStats: (): Promise<ApiResponse> => apiCall('/dashboard/guru/stats'),

    guruStudents: (): Promise<ApiResponse> => apiCall('/dashboard/guru/students'),

    guruQuizzes: (): Promise<ApiResponse> => apiCall('/dashboard/guru/quizzes'),

    

    siswaStats: (): Promise<ApiResponse> => apiCall('/dashboard/siswa/stats'),

    siswaBooks: (): Promise<ApiResponse> => apiCall('/dashboard/siswa/books'),

    siswaPointsHistory: (): Promise<ApiResponse> => apiCall('/dashboard/siswa/points-history'),

    siswaQuizAttempts: (): Promise<ApiResponse> => apiCall('/dashboard/siswa/quiz-attempts'),

    siswaReadingActivities: (): Promise<ApiResponse> => apiCall('/dashboard/siswa/reading-activities'),

  },



  // E-Books Admin CRUD

  ebooks: {

    list: (): Promise<ApiResponse> => apiCall('/ebooks'),

    get: (id: number): Promise<ApiResponse> => apiCall(`/ebooks/${id}`),

    create: async (data: FormData | Record<string, unknown>): Promise<ApiResponse> => {

      if (data instanceof FormData) {

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const csrfToken = await getCsrfToken();

        

        console.log('[API] Creating ebook with FormData...');

        const response = await fetch(`${API_URL}/ebooks`, {

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

          console.error('[API] Failed to parse response:', response.statusText);

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        }

        

        if (!response.ok) {

          console.error('[API] Ebook create failed:', result);

          throw new Error(result.message || `HTTP ${response.status}: Failed to upload ebook`);

        }

        

        console.log('[API] Ebook created successfully:', result);

        return result;

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

        

        console.log('[API] Updating ebook with FormData...');

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

          console.error('[API] Failed to parse response:', response.statusText);

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        }

        

        if (!response.ok) {

          console.error('[API] Ebook update failed:', result);

          throw new Error(result.message || `HTTP ${response.status}: Failed to update ebook`);

        }

        

        console.log('[API] Ebook updated successfully:', result);

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

        

        console.log('[API] Creating reward with FormData...');

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

          console.error('[API] Failed to parse response:', response.statusText);

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        }

        

        if (!response.ok) {

          console.error('[API] Reward create failed:', result);

          throw new Error(result.message || `HTTP ${response.status}: Failed to create reward`);

        }

        

        console.log('[API] Reward created successfully:', result);

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

        

        console.log('[API] Updating reward with FormData...');

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

          console.error('[API] Failed to parse response:', response.statusText);

          throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        }

        

        if (!response.ok) {

          console.error('[API] Reward update failed:', result);

          throw new Error(result.message || `HTTP ${response.status}: Failed to update reward`);

        }

        

        console.log('[API] Reward updated successfully:', result);

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

