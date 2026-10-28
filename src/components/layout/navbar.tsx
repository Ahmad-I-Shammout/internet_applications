'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useTranslations } from '@/hooks/use-translations';
import { Badge } from '@/components/shared/badge';
import {
  Package,
  ShoppingBag,
  ListOrdered,
  PlusCircle,
  Zap,
  Moon,
  Sun,
  Shield,
  User,
  LogOut,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const tNav = useTranslations('Nav');
  const tCommon = useTranslations('Common');

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check current theme
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (root.classList.contains('dark')) {
        root.classList.remove('dark');
        setIsDark(false);
      } else {
        root.classList.add('dark');
        setIsDark(true);
      }
    }
  };

  const navLinks = [
    {
      href: '/products',
      label: tNav('products'),
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      href: '/orders',
      label: tNav('orders'),
      icon: <ListOrdered className="w-4 h-4" />,
    },
    ...(isAdmin
      ? [
          {
            href: '/admin/orders',
            label: tNav('adminOrders'),
            icon: <Shield className="w-4 h-4" />,
            adminOnly: true,
          },
          {
            href: '/admin/products/new',
            label: tNav('adminAddProduct'),
            icon: <PlusCircle className="w-4 h-4" />,
            adminOnly: true,
          },
        ]
      : []),
    {
      href: '/demo/race-condition',
      label: tNav('raceConditionDemo'),
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      highlight: true,
    },
  ];

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/products" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-500 group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base text-text-main group-hover:text-primary-500 transition-colors block leading-tight">
              {tCommon('appName')}
            </span>
            <span className="text-[10px] text-text-secondary block leading-tight">
              المتطلبان 1 و 2 (REST & gRPC)
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-500 font-semibold'
                    : 'text-text-secondary hover:text-text-main hover:bg-surface-2'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
                {link.adminOnly && (
                  <Badge variant="brand" size="sm" className="text-[9px] py-0 px-1">
                    مسؤول
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions & Theme & User */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-text-secondary hover:text-text-main hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="تبديل المظهر"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Status */}
          {user ? (
            <div className="flex items-center gap-2 border-s border-border ps-3">
              <div className="hidden sm:flex flex-col text-end">
                <span className="text-xs font-semibold text-text-main leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-text-secondary">
                  {user.role === 'ADMIN' ? 'مسؤول النظام' : 'زبون'}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg text-text-secondary hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                title={tNav('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-medium hover:bg-primary-600 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>{tNav('login')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
