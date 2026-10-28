import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, startIcon, endIcon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-start">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-text-secondary select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute start-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none flex items-center">
              {startIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-10 rounded-lg border bg-surface text-text-main text-sm transition-colors',
              'border-border focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              'placeholder:text-text-secondary/60',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              startIcon ? 'ps-10' : 'ps-3.5',
              endIcon ? 'pe-10' : 'pe-3.5',
              error && 'border-destructive focus:border-destructive focus:ring-destructive',
              className
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute end-3.5 top-1/2 -translate-y-1/2 text-text-secondary flex items-center">
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs text-destructive font-medium mt-0.5">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
