'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';
import Card from '@/components/ui/Card';
import { cn, formatNumber } from '@/lib/utils';

export interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  formatAsNumber?: boolean;
  accent?: 'gold' | 'walnut' | 'green' | 'default';
  suffix?: string;
}

const accentStyles: Record<NonNullable<StatsCardProps['accent']>, string> = {
  gold: 'bg-gold-gradient text-walnut-600',
  walnut: 'bg-walnut-500 text-cream-50',
  green: 'bg-green-100 text-green-700',
  default: 'bg-beige-100 text-walnut-500',
};

export default function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  formatAsNumber = true,
  accent = 'default',
  suffix,
}: StatsCardProps) {
  const displayValue =
    formatAsNumber && typeof value === 'number' ? formatNumber(value) : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card hoverable className="h-full">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              accentStyles[accent]
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          {trend && (
            <span
              className={cn(
                'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              )}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        <p className="mt-4 font-display text-2xl font-semibold text-walnut-600">
          {displayValue}
          {suffix && <span className="ml-0.5 text-sm font-normal text-walnut-300">{suffix}</span>}
        </p>
        <p className="mt-1 text-xs text-walnut-300">{label}</p>
      </Card>
    </motion.div>
  );
}
