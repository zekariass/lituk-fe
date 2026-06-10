import axios from 'axios';
import { apiClient } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8085';

// Create a separate axios instance for guest endpoints (no auth required)
const guestAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Ensure no Authorization headers are sent for guest requests
guestAxios.interceptors.request.use(
  (config) => {
    // Explicitly remove Authorization header if it exists
    if (config.headers) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface ContactMessage {
  id: number;
  threadId: number;
  senderType: 'GUEST' | 'USER' | 'ADMIN';
  senderId: string | null;
  message: string;
  createdAt: string;
}

export interface ContactThread {
  id: number;
  userId: string | null;
  guestEmail: string | null;
  guestName: string | null;
  reference: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'CLOSED';
  subject: string;
  messages: ContactMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface PageResponse<T> {
  content: T[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

// Guest Contact APIs (no authentication required)
export const guestContactApi = {
  // Create new contact thread
  createThread: async (data: {
    guestName: string;
    guestEmail: string;
    subject: string;
    message: string;
  }): Promise<ApiResponse<ContactThread>> => {
    console.log('[Guest Contact API] ===== SENDING REQUEST =====');
    console.log('[Guest Contact API] URL:', `${API_BASE_URL}/api/v1/guest/contact`);
    console.log('[Guest Contact API] Request data:', JSON.stringify(data, null, 2));
    try {
      const response = await guestAxios.post('/api/v1/guest/contact', data);
      console.log('[Guest Contact API] ✅ SUCCESS');
      console.log('[Guest Contact API] Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[Guest Contact API] ❌ ERROR DETAILS:');
      console.error('[Guest Contact API] Status:', error.response?.status);
      console.error('[Guest Contact API] Status Text:', error.response?.statusText);
      console.error('[Guest Contact API] Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('[Guest Contact API] Request Headers:', error.config?.headers);
      console.error('[Guest Contact API] Full Error:', error.message);
      throw error;
    }
  },

  // Track contact thread by reference and email
  trackThread: async (reference: string, guestEmail: string): Promise<ApiResponse<ContactThread>> => {
    const response = await guestAxios.get(
      `/api/v1/guest/contact/${reference}`,
      { params: { guestEmail } }
    );
    return response.data;
  },

  // Reply to existing thread
  replyToThread: async (
    reference: string,
    data: { guestEmail: string; message: string }
  ): Promise<ApiResponse<ContactThread>> => {
    const response = await guestAxios.post(
      `/api/v1/guest/contact/${reference}/reply`,
      data
    );
    return response.data;
  },
};

// Authenticated User Contact APIs
export const userContactApi = {
  // Create new contact thread (authenticated)
  createThread: async (data: {
    subject: string;
    message: string;
  }): Promise<ApiResponse<ContactThread>> => {
    const response = await apiClient.getClient().post('/api/v1/contact', data);
    return response.data;
  },

  // Get all user's contact threads
  getThreads: async (params?: {
    status?: 'NEW' | 'READ' | 'REPLIED' | 'CLOSED';
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<ContactThread>>> => {
    const response = await apiClient.getClient().get('/api/v1/contact', { params });
    return response.data;
  },

  // Get specific thread by ID
  getThread: async (id: number): Promise<ApiResponse<ContactThread>> => {
    const response = await apiClient.getClient().get(`/api/v1/contact/${id}`);
    return response.data;
  },

  // Reply to thread
  replyToThread: async (
    id: number,
    data: { message: string }
  ): Promise<ApiResponse<ContactThread>> => {
    const response = await apiClient.getClient().post(`/api/v1/contact/${id}/reply`, data);
    return response.data;
  },
};
