'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { authApi } from '../apis/auth-api';
import { User, LoginCredentials, RegisterData } from '../types';
import { mockUsers } from '../apis/mock-data';
import { toast } from 'sonner';

// Shared global state across all hook instances
let globalUser: User = mockUsers[0];

const listeners = new Set<(u: User) => void>();

function setGlobalUser(user: User) {
  globalUser = user;
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_current_user', JSON.stringify(user));
  }
  Cookies.set('token', `mock-jwt-token-for-${user.id}`);
  Cookies.set('user_role', user.role);
  listeners.forEach((fn) => fn(user));
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);

  useEffect(() => {
    // Sync with localStorage on client mount without causing SSR mismatch
    const stored = localStorage.getItem('mock_current_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        globalUser = parsed;
        setCurrentUser(parsed);
      } catch {}
    }

    listeners.add(setCurrentUser);
    return () => {
      listeners.delete(setCurrentUser);
    };
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (creds: LoginCredentials) => {
      return await authApi.login(creds);
    },
    onSuccess: (data) => {
      setGlobalUser(data.user);
      toast.success(`مرحباً بك، ${data.user.name}`);
      queryClient.invalidateQueries();
    },
    onError: (err: any) => {
      if (err.response?.status === 429) {
        toast.error('تم حظر تسجيل الدخول مؤقتاً لتجاوز الحد المسموح (HTTP 429)');
      } else {
        toast.error('فشل تسجيل الدخول: تحقق من بياناتك');
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      return await authApi.register(data);
    },
    onSuccess: (data) => {
      setGlobalUser(data.user);
      toast.success(`تم إنشاء الحساب بنجاح، مرحباً ${data.user.name}`);
      queryClient.invalidateQueries();
    },
  });

  // Role Switcher for instant testing (Slide 07 & 08)
  const switchUser = (user: User) => {
    setGlobalUser(user);
    toast.info(`تم التبديل إلى: ${user.name} (${user.role === 'ADMIN' ? 'مسؤول' : 'زبون'})`);
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user_role');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_current_user');
    }
    setGlobalUser(mockUsers[0]);
    toast.success('تم تسجيل الخروج بنجاح');
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  return {
    user: currentUser,
    isAdmin: currentUser.role === 'ADMIN',
    isCustomer: currentUser.role === 'CUSTOMER',
    availableUsers: mockUsers,
    switchUser,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout,
  };
}
