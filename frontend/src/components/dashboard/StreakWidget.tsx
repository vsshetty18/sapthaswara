'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export interface StreakWidgetProps {
  currentStreak: number;
  longestStreak?: number;
  weekActivity?: boolean[]; // 7 booleans, Sun-Sat, whether user was active that day
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function StreakWidget({
  currentStreak,
  longestStreak,
  weekActivity = [true, true, false, true, true, true, false],
}: StreakWidgetProps) {
  const getStreakMessage = () => {
    if (currentStreak === 0) return 'Start your streak today!';
    if (currentStreak < 7) return 'Keep the momentum going';
    if (currentStreak < 30) return "You're on fire this month";
    return 'Legendary consistency';
  };

  return (
    <Card className="bg-walnut-gradient text-cream-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-cream-100/60">Current Streak</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-gold-400">
              {currentStreak}
            </span>
            <span className="text-sm text-cream-100/70">
              {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-gradient shadow-premium"
        >
          <Flame className="h-7 w-7 text-walnut-600" />
        </motion.div>
      </div>

      <p className="mt-3 text-sm text-cream-100/70">{getStreakMessage()}</p>

      <div className="mt-6 flex items-center justify-between">
        {weekActivity.map((active, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
                active ? 'bg-gold-gradient text-walnut-600' : 'bg-cream-50/10 text-cream-100/40'
              )}
            >
              {active ? '🔥' : ''}
            </div>
            <span className="text-[10px] text-cream-100/50">{DAY_LABELS[i]}</span>
          </div>
        ))}
      </div>

      {longestStreak !== undefined && (
        <div className="mt-5 flex items-center justify-between border-t border-cream-50/10 pt-4 text-xs text-cream-100/60">
          <span>Longest streak</span>
          <span className="font-semibold text-cream-50">{longestStreak} days</span>
        </div>
      )}
    </Card>
  );
}
