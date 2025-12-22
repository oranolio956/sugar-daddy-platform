import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Match type
export interface Match {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    location?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Create axios instance with default config
const createApiClient = (): AxiosInstance => {
  const api = axios.create({
    baseURL: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle errors and auth
  api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 errors (unauthorized)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const refreshResponse = await axios.post(
              `${process.env['NEXT_PUBLIC_API_URL']}/auth/refresh`,
              { refreshToken }
            );

            if (refreshResponse.data.token) {
              localStorage.setItem('auth_token', refreshResponse.data.token);
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
              return api(originalRequest);
            }
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // Handle other errors
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'An unexpected error occurred';

      // Don't show toast for 401 errors as we handle them above
      if (error.response?.status !== 401) {
        toast.error(errorMessage);
      }

      return Promise.reject(
        new ApiError(errorMessage, error.response?.status, error.response?.data?.code)
      );
    }
  );

  return api;
};

// Initialize API client
export const api = createApiClient();

// Auth API endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post<ApiResponse>('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse>('/auth/logout');
    return response.data;
  },

  me: async () => {
    const response = await api.get<ApiResponse>('/auth/me');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post<ApiResponse>('/auth/refresh');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post<ApiResponse>('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post<ApiResponse>('/auth/reset-password', { token, password });
    return response.data;
  },
};

// User API endpoints
export const userApi = {
  getProfile: async (userId: string) => {
    const response = await api.get<ApiResponse>(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userId: string, data: any) => {
    const response = await api.put<ApiResponse>(`/users/${userId}`, data);
    return response.data;
  },

  updateSettings: async (userId: string, settings: any) => {
    const response = await api.put<ApiResponse>(`/users/${userId}/settings`, settings);
    return response.data;
  },

  uploadAvatar: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post<ApiResponse>(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAccount: async (userId: string) => {
    const response = await api.delete<ApiResponse>(`/users/${userId}`);
    return response.data;
  },
};

// Match API endpoints
export const matchApi = {
  getMatches: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedResponse<Match>>(`/matches`, {
      params: { page, limit },
    });
    return response.data;
  },

  getMatch: async (matchId: string) => {
    const response = await api.get<ApiResponse>(`/matches/${matchId}`);
    return response.data;
  },

  createMatch: async (targetUserId: string) => {
    const response = await api.post<ApiResponse>('/matches', { targetUserId });
    return response.data;
  },

  respondToMatch: async (matchId: string, accepted: boolean) => {
    const response = await api.patch<ApiResponse>(`/matches/${matchId}/response`, { accepted });
    return response.data;
  },

  getPotentialMatches: async (filters?: any) => {
    const response = await api.get<PaginatedResponse<Match>>('/matches/potential', {
      params: filters,
    });
    return response.data;
  },
};

// Message API endpoints
export const messageApi = {
  getConversations: async (page: number = 1, limit: number = 20) => {
    const response = await api.get<PaginatedResponse<any>>('/messages/conversations', {
      params: { page, limit },
    });
    return response.data;
  },

  getMessages: async (conversationId: string, page: number = 1, limit: number = 50) => {
    const response = await api.get<PaginatedResponse<any>>(`/messages/${conversationId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  sendMessage: async (conversationId: string, content: string, type: 'text' | 'image' | 'voice' = 'text') => {
    const response = await api.post<ApiResponse>('/messages', {
      conversationId,
      content,
      type,
    });
    return response.data;
  },

  markAsRead: async (conversationId: string) => {
    const response = await api.patch<ApiResponse>(`/messages/${conversationId}/read`);
    return response.data;
  },

  deleteMessage: async (messageId: string) => {
    const response = await api.delete<ApiResponse>(`/messages/${messageId}`);
    return response.data;
  },
};

// Payment API endpoints
export const paymentApi = {
  getBalance: async () => {
    const response = await api.get<ApiResponse>('/payments/balance');
    return response.data;
  },

  addFunds: async (amount: number, paymentMethod: string) => {
    const response = await api.post<ApiResponse>('/payments/add-funds', {
      amount,
      paymentMethod,
    });
    return response.data;
  },

  getTransactions: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedResponse<any>>('/payments/transactions', {
      params: { page, limit },
    });
    return response.data;
  },

  sendGift: async (recipientId: string, amount: number, message?: string) => {
    const response = await api.post<ApiResponse>('/payments/gifts', {
      recipientId,
      amount,
      message,
    });
    return response.data;
  },

  getGiftHistory: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedResponse<any>>('/payments/gifts', {
      params: { page, limit },
    });
    return response.data;
  },
};

// Notification API endpoints
export const notificationApi = {
  getNotifications: async (page: number = 1, limit: number = 20) => {
    const response = await api.get<PaginatedResponse<any>>('/notifications', {
      params: { page, limit },
    });
    return response.data;
  },

  markAsRead: async (notificationId: string) => {
    const response = await api.patch<ApiResponse>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch<ApiResponse>('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (notificationId: string) => {
    const response = await api.delete<ApiResponse>(`/notifications/${notificationId}`);
    return response.data;
  },
};

// Utility function to handle file uploads
export const uploadFile = async (file: File, endpoint: string): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ApiResponse>(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Utility function to handle API calls with loading states
export const withLoading = async <T>(
  apiCall: () => Promise<ApiResponse<T>>,
  setLoading?: (loading: boolean) => void
): Promise<T> => {
  if (setLoading) setLoading(true);
  
  try {
    const response = await apiCall();
    if (!response.success) {
      throw new Error(response.message || 'Request failed');
    }
    return response.data as T;
  } finally {
    if (setLoading) setLoading(false);
  }
};