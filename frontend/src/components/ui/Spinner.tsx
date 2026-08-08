'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizeStyles: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-7 w-7 border-[3px]',
  lg: 'h-12 w-12 border-4',
};

export default function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status">
      <div
        className={cn(
          'rounded-full border-beige-200 border-t-gold-500 animate-spin',
          sizeStyles[size],
          className
        )}
      />
      {label && <p className="text-sm text-walnut-300">{label}</p>}
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function FullPageSpinner({ label = 'Loading SvaraVerse...' }: { label?: string }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-cream-50">
      <Spinner size="lg" label={label} />
    </div>
  );
}
