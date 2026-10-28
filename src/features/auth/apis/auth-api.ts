import api from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';
import { AuthResponse, LoginCredentials, RegisterData, User } from '../types';
import { mockUsers } from './mock-data';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (API_CONFIG.useMock) {
      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.mockDelayMs));

      // Simulate Rate Limiting if triggered
      if (API_CONFIG.loginAttemptsCount >= API_CONFIG.maxLoginAttempts) {
        const error: any = new Error('Too Many Requests');
        error.response = {
          status: 429,
          data: {
            message: 'تم تجاوز عدد محاولات الدخول المسموح بها. الرجاء المحاولة لاحقاً.',
            code: 429,
          },
        };
        throw error;
      }

      // Check if user specified a simulated role or email
      let user: User | undefined;
      if (credentials.simulatedRole === 'ADMIN' || credentials.email.includes('admin')) {
        user = mockUsers.find((u) => u.role === 'ADMIN');
      } else {
        user = mockUsers.find((u) => u.role === 'CUSTOMER');
      }

      if (!user) user = mockUsers[0];

      return {
        user,
        token: `mock-jwt-token-for-${user.id}-${user.role}`,
        expiresIn: 3600,
      };
    }

    // Real API implementation
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    if (API_CONFIG.useMock) {
      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.mockDelayMs));
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      };
      return {
        user: newUser,
        token: `mock-jwt-token-for-${newUser.id}-${newUser.role}`,
        expiresIn: 3600,
      };
    }

    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getCurrentUser(): Promise<User | null> {
    if (API_CONFIG.useMock) {
      // Read simulated user from localStorage if on browser
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mock_current_user');
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch {
            return mockUsers[0];
          }
        }
      }
      return mockUsers[0];
    }

    const { data } = await api.get('/auth/me');
    return data;
  },
};
