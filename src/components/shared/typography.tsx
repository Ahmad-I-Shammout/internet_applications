import React from 'react';
import { cn } from '@/utils/cn';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'body-sm' | 'caption' | 'detail';
  color?: 'default' | 'muted' | 'brand' | 'white';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  as?: React.ElementType;
  children: React.ReactNode;
}

const variantStyles: Record<NonNullable<TypographyProps['variant']>, string> = {
  h1: 'text-3xl md:text-4xl leading-tight',
  h2: 'text-2xl md:text-3xl leading-snug',
  h3: 'text-xl md:text-2xl leading-snug',
  h4: 'text-lg md:text-xl leading-normal',
  h5: 'text-base md:text-lg leading-normal',
  h6: 'text-sm md:text-base leading-normal',
  body: 'text-base leading-relaxed',
  'body-sm': 'text-sm leading-relaxed',
  caption: 'text-xs leading-normal',
  detail: 'text-[11px] leading-tight',
};

const defaultTags: Record<NonNullable<TypographyProps['variant']>, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
  detail: 'span',
};

const colorStyles: Record<NonNullable<TypographyProps['color']>, string> = {
  default: 'text-text-main',
  muted: 'text-text-secondary',
  brand: 'text-primary-500',
  white: 'text-white',
};

const weightStyles: Record<NonNullable<TypographyProps['weight']>, string> = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'default',
  weight = 'normal',
  as,
  className,
  children,
  ...props
}) => {
  const Component = as || defaultTags[variant] || 'p';

  return (
    <Component
      className={cn(
        variantStyles[variant],
        colorStyles[color],
        weightStyles[weight],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
