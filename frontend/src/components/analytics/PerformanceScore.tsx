'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export interface PerformanceScoreProps {
  score: number; // 0-100
  previousScore?: number;
  breakdown?: {
    label: string;
    value: number; // 0-100
  }[];
  isLoading?: boolean;
}

function getScoreColor(score: number): { ring: string; text: string; label: string } {
  if (score >= 80) return { ring: '#22c55e', text: 'text-green-600', label: 'Excellent' };
  if (score >= 60) return { ring: '#D4AF37', text: 'text-gold-600', label: 'Good' };
  if (score >= 40) return { ring: '#BE9143', text: 'text-sand-600', label: 'Fair' };
  return { ring: '#ef4444', text: 'text-red-500', label: 'Needs Focus' };
}

export default function PerformanceScore({
  score,
  previousScore,
  breakdown = [],
  isLoading = false,
}: PerformanceScoreProps) {
  const { ring, text, label } = getScoreColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const trend = previousScore !== undefined ? score - previousScore : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Score</CardTitle>
      </CardHeader>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-sm text-walnut-300">
          Calculating score...
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative h-36 w-36">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#F5EEE1" strokeWidth="10" />
              <motion.circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={ring}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-semibold text-walnut-600">{score}</span>
              <span className={cn('text-xs font-medium', text)}>{label}</span>
            </div>
          </div>

          {trend !== null && (
            <div
              className={cn(
                'mt-3 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                trend > 0
                  ? 'bg-green-100 text-green-700'
                  : trend < 0
                  ? 'bg-red-100 text-red-600'
                  : 'bg-beige-100 text-walnut-400'
              )}
            >
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : trend < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {trend > 0 ? '+' : ''}
              {trend} vs last period
            </div>
          )}

          {breakdown.length > 0 && (
            <div className="mt-6 w-full space-y-3 border-t border-beige-100 pt-5">
              {breakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-walnut-400">
                    <span>{item.label}</span>
                    <span className="font-medium text-walnut-600">{item.value}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-beige-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-gold-gradient"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
