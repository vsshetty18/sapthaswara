'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn, getInitials, generateAvatarColor } from '@/lib/utils';

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ringed?: boolean;
}

const sizeStyles: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

const pixelSizes: Record<NonNullable<AvatarProps['size']>, number> = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 64,
  xl: 96,
};

export default function Avatar({ src, name, size = 'md', className, ringed = false }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;
  const bgColor = generateAvatarColor(name || 'S');

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full flex items-center justify-center font-semibold text-cream-50',
        sizeStyles[size],
        ringed && 'ring-2 ring-gold-400 ring-offset-2 ring-offset-cream-50',
        className
      )}
      style={!showImage ? { backgroundColor: bgColor } : undefined}
    >
      {showImage ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={`${pixelSizes[size]}px`}
          className="object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{getInitials(name || 'S')}</span>
      )}
    </div>
  );
}
