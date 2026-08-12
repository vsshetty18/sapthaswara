'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ListMusic, Lock, Globe, MoreVertical } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export interface PlaylistCardProps {
  playlist: {
    id: string;
    name: string;
    description?: string | null;
    coverImageUrl?: string | null;
    isPublic: boolean;
    songCount?: number;
  };
  onClick?: (playlistId: string) => void;
  onMenuClick?: (playlistId: string) => void;
}

const GRADIENT_VARIANTS = [
  'from-gold-300 to-gold-500',
  'from-sand-300 to-sand-500',
  'from-walnut-300 to-walnut-500',
  'from-beige-300 to-beige-500',
];

function getGradientForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENT_VARIANTS[Math.abs(hash) % GRADIENT_VARIANTS.length];
}

export default function PlaylistCard({ playlist, onClick, onMenuClick }: PlaylistCardProps) {
  const gradient = getGradientForId(playlist.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
    >
      <Card hoverable onClick={() => onClick?.(playlist.id)} className="overflow-hidden p-0">
        <div
          className={cn(
            'relative flex h-32 items-center justify-center bg-gradient-to-br',
            gradient
          )}
        >
          {playlist.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={playlist.coverImageUrl}
              alt={playlist.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ListMusic className="h-10 w-10 text-cream-50/80" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick?.(playlist.id);
            }}
            className="absolute right-2.5 top-2.5 rounded-full bg-walnut-600/30 p-1.5 text-cream-50 backdrop-blur-sm hover:bg-walnut-600/50"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-display text-sm font-semibold text-walnut-600">
              {playlist.name}
            </h3>
            <Badge variant={playlist.isPublic ? 'success' : 'default'} size="sm">
              {playlist.isPublic ? (
                <Globe className="h-3 w-3" />
              ) : (
                <Lock className="h-3 w-3" />
              )}
            </Badge>
          </div>
          {playlist.description && (
            <p className="mt-1 truncate text-xs text-walnut-300">{playlist.description}</p>
          )}
          <p className="mt-2 text-xs font-medium text-walnut-400">
            {playlist.songCount ?? 0} {playlist.songCount === 1 ? 'song' : 'songs'}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
