'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Check } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn, formatDate } from '@/lib/utils';
import type { Milestone } from '@/types';

export interface MilestoneCardProps {
  milestone: Milestone & { isAchieved?: boolean };
  isLocked?: boolean;
  onClick?: (milestone: Milestone) => void;
}

const MILESTONE_EMOJI: Record<string, string> = {
  '100_followers': '🌱',
  '500_followers': '🌿',
  '1000_followers': '🌳',
  '100_songs': '🎵',
  '365_day_streak': '🔥',
  '100_videos': '🎬',
  first_collaboration: '🤝',
  first_live: '🔴',
  first_income: '💰',
};

export default function MilestoneCard({ milestone, isLocked = false, onClick }: MilestoneCardProps) {
  const emoji = MILESTONE_EMOJI[milestone.milestoneKey] || '🏆';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!isLocked ? { y: -3 } : undefined}
      transition={{ duration: 0.25 }}
    >
      <Card
        hoverable={!isLocked}
        onClick={() => !isLocked && onClick?.(milestone)}
        className={cn(
          'relative flex flex-col items-center text-center',
          isLocked && 'opacity-50 grayscale'
        )}
      >
        {!isLocked && !milestone.isCelebrated && (
          <span className="absolute right-3 top-3 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold-500" />
          </span>
        )}

        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full text-3xl',
            isLocked ? 'bg-beige-100' : 'bg-gold-gradient shadow-premium'
          )}
        >
          {isLocked ? <Lock className="h-6 w-6 text-walnut-300" /> : emoji}
        </div>

        <h4 className="mt-3 font-display text-sm font-semibold text-walnut-600">
          {milestone.title}
        </h4>
        {milestone.description && (
          <p className="mt-1 text-xs leading-relaxed text-walnut-300">{milestone.description}</p>
        )}

        <div className="mt-3">
          {isLocked ? (
            <Badge variant="default" size="sm">Locked</Badge>
          ) : (
            <Badge variant="success" size="sm">
              <Check className="h-3 w-3" />
              {formatDate(milestone.achievedAt)}
            </Badge>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export function MilestoneEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-beige-200 bg-beige-50 py-12 text-center">
      <Trophy className="h-10 w-10 text-walnut-200" />
      <div>
        <p className="text-sm font-medium text-walnut-500">No milestones yet</p>
        <p className="mt-1 text-xs text-walnut-300">
          Keep practicing and posting — your first milestone is closer than you think
        </p>
      </div>
    </div>
  );
}
