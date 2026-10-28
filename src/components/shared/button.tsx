import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 shadow-sm',
  brand:
    'bg-brand text-white hover:bg-brand-hover focus-visible:ring-primary-500 shadow-sm',
  secondary:
    'bg-surface-2 text-text-main hover:bg-muted border border-border focus-visible:ring-primary-500',
  outline:
    'border border-border bg-transparent text-text-main hover:bg-surface-2 focus-visible:ring-primary-500',
  ghost:
    'bg-transparent text-text-main hover:bg-surface-2 focus-visible:ring-primary-500',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'brand',
      size = 'md',
      isLoading = false,
      startIcon,
      endIcon,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          startIcon && <span className="inline-flex shrink-0">{startIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && endIcon && (
          <span className="inline-flex shrink-0">{endIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
