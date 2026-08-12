'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MoreVertical, Music2, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn, getStatusColor, formatDuration } from '@/lib/utils';
import type { Song } from '@/types';

export interface SongCardProps {
  song: Song;
  onClick?: (song: Song) => void;
  onToggleFavourite?: (song: Song) => void;
  onMenuClick?: (song: Song) => void;
}

const STATUS_LABELS: Record<string, string> = {
  practiced: 'Practiced',
  recorded: 'Recorded',
  posted: 'Posted',
  need_improvement: 'Needs Work',
  favourite: 'Favourite',
};

export default function SongCard({ song, onClick, onToggleFavourite, onMenuClick }: SongCardProps) {
  const statusColor = getStatusColor(song.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
    >
      <Card
        hoverable
        onClick={() => onClick?.(song)}
        className="relative overflow-hidden"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-beige-100">
            {song.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={song.coverImageUrl} alt={song.title} className="h-full w-full object-cover" />
            ) : (
              <Music2 className="h-6 w-6 text-walnut-300" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate font-display text-sm font-semibold text-walnut-600">
                  {song.title}
                </h3>
                {song.movie && (
                  <p className="truncate text-xs text-walnut-300">{song.movie}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavourite?.(song);
                  }}
                  aria-label="Toggle favourite"
                  className="rounded-full p-1 hover:bg-beige-100"
                >
                  <Heart
                    className={cn(
                      'h-4 w-4 transition-colors',
                      song.isFavourite ? 'fill-red-500 text-red-500' : 'text-walnut-300'
                    )}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuClick?.(song);
                  }}
                  aria-label="More options"
                  className="rounded-full p-1 hover:bg-beige-100"
                >
                  <MoreVertical className="h-4 w-4 text-walnut-300" />
                </button>
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-medium',
                  statusColor.bg,
                  statusColor.text
                )}
              >
                {STATUS_LABELS[song.status] || song.status}
              </span>
              {song.mood && (
                <Badge variant="outline" size="sm">
                  {song.mood}
                </Badge>
              )}
              {song.difficulty && (
                <Badge variant="default" size="sm">
                  {song.difficulty}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-beige-100 pt-3 text-xs text-walnut-300">
          <span>{song.singer || 'Unknown singer'}</span>
          <div className="flex items-center gap-3">
            {song.durationSeconds && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(song.durationSeconds)}
              </span>
            )}
            {song.practiceCount > 0 && <span>{song.practiceCount}x practiced</span>}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
