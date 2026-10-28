'use client';

import React, { useState } from 'react';
import { Typography } from '@/components/shared/typography';
import { Input } from '@/components/shared/input';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { useAuth } from '../hooks/use-auth';
import { useTranslations } from '@/hooks/use-translations';
import { Mail, Lock, User as UserIcon, Shield } from 'lucide-react';
import Link from 'next/link';

export const RegisterView: React.FC = () => {
  const tAuth = useTranslations('Auth');
  const { register, isRegistering } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        name,
        email,
        password,
        role,
      });
      window.location.href = '/products';
    } catch {
      // Toast handles error in useAuth
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-8">
      <Card className="p-8">
        <div className="text-center mb-6">
          <Typography variant="h2" weight="bold" className="mb-2">
            {tAuth('registerTitle')}
          </Typography>
          <Typography variant="body-sm" color="muted">
            {tAuth('registerSubtitle')}
          </Typography>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="الاسم الكامل"
            type="text"
            placeholder="مثال: محمد الأحمد"
            value={name}
            onChange={(e) => setName(e.target.value)}
            startIcon={<UserIcon className="w-4 h-4" />}
            required
          />

          <Input
            label={tAuth('emailOrUsername')}
            type="email"
            placeholder="example@store.local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label={tAuth('password')}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">
              {tAuth('roleSelect')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                  role === 'CUSTOMER'
                    ? 'border-primary-500 bg-primary-500/10 text-primary-500 font-semibold'
                    : 'border-border bg-surface-2 text-text-secondary'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>زبون (Customer)</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ADMIN')}
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

          <Button
            type="submit"
            variant="brand"
            size="lg"
            isLoading={isRegistering}
            className="w-full mt-2"
          >
            {tAuth('registerButton')}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-border text-center text-xs text-text-secondary">
          <span>{tAuth('haveAccount')} </span>
          <Link
            href="/login"
            className="text-primary-500 hover:underline font-semibold"
          >
            {tAuth('loginTitle')}
          </Link>
        </div>
      </Card>
    </div>
  );
};
