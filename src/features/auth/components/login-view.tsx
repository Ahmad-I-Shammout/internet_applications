'use client';

import React, { useState } from 'react';
import { Typography } from '@/components/shared/typography';
import { Input } from '@/components/shared/input';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { useAuth } from '../hooks/use-auth';
import { useTranslations } from '@/hooks/use-translations';
import { Mail, Lock, Shield, User, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { API_CONFIG } from '@/lib/api-config';

export const LoginView: React.FC = () => {
  const tAuth = useTranslations('Auth');
  const { login, isLoggingIn } = useAuth();

  const [email, setEmail] = useState('customer1@store.local');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      await login({
        email,
        password,
        simulatedRole: role,
      });
      // Redirect to products page
      window.location.href = '/products';
    } catch (err: any) {
      if (err.response?.status === 429) {
        setErrorMessage(tAuth('rateLimitError'));
      } else {
        setErrorMessage(tAuth('invalidCredentials'));
      }
    }
  };

  const handleSimulateRateLimit = () => {
    API_CONFIG.loginAttemptsCount = API_CONFIG.maxLoginAttempts;
    setErrorMessage(tAuth('rateLimitError'));
  };

  const handleResetRateLimit = () => {
    API_CONFIG.resetLoginAttempts();
    setErrorMessage('');
  };

  return (
    <div className="w-full max-w-md mx-auto my-8">
      <Card className="p-8">
        <div className="text-center mb-6">
          <Typography variant="h2" weight="bold" className="mb-2">
            {tAuth('loginTitle')}
          </Typography>
          <Typography variant="body-sm" color="muted">
            {tAuth('loginSubtitle')}
          </Typography>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">تنبيه أمني</p>
              <p className="text-xs mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">
              {tAuth('roleSelect')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole('CUSTOMER');
                  setEmail('customer1@store.local');
                }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                  role === 'CUSTOMER'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-500 font-semibold'
                    : 'border-border bg-surface-2 text-text-secondary'
                }`}
              >
                <User className="w-4 h-4" />
                <span>زبون (Customer)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('ADMIN');
                  setEmail('admin@store.local');
                }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                  role === 'ADMIN'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-500 font-semibold'
                    : 'border-border bg-surface-2 text-text-secondary'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>مسؤول (Admin)</span>
              </button>
            </div>
          </div>

          <Input
            label={tAuth('emailOrUsername')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label={tAuth('password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="brand"
            size="lg"
            isLoading={isLoggingIn}
            className="w-full mt-2"
          >
            {tAuth('loginButton')}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-border flex flex-col gap-3 text-center">
          <div className="text-xs text-text-secondary">
            <span>{tAuth('noAccount')} </span>
            <Link
              href="/register"
              className="text-primary-500 hover:underline font-semibold"
            >
              {tAuth('registerTitle')}
            </Link>
          </div>

          {/* Quick Rate-Limit Test Helper for Presentation (Slide 07) */}
          <div className="p-3 bg-surface-2 rounded-xl text-start">
            <Typography variant="detail" weight="semibold" color="muted" className="block mb-1.5">
              تجربة الأمان (Slide 07: تحديد محاولات تسجيل الدخول):
            </Typography>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSimulateRateLimit}
                className="text-[11px] text-destructive hover:underline cursor-pointer"
              >
                محاكاة خطأ تجاوز المحاولات (429)
              </button>
              <span className="text-text-secondary">•</span>
              <button
                type="button"
                onClick={handleResetRateLimit}
                className="text-[11px] text-primary-500 hover:underline cursor-pointer"
              >
                إعادة تصفير العداد
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
