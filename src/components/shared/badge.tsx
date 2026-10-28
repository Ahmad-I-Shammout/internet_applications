import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'destructive' | 'outline';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-surface-2 text-text-secondary border-border',
  brand: 'bg-primary-500/10 text-primary-500 border-primary-500/30',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  destructive: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
  outline: 'bg-transparent text-text-main border-border',
};

const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'text-[11px] px-2 py-0.5 rounded-md',
  md: 'text-xs px-2.5 py-1 rounded-lg',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium border transition-colors select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
