'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Music4,
  Hash,
  Clock,
  MessageSquareText,
  Image as ImageIcon,
  Video,
  Users2,
  Radio,
  BarChart2,
  Sparkles,
  Heart,
  TrendingUp,
  Compass,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import type { AIRequestType } from '@/hooks/useAICoach';

export interface SuggestionCardConfig {
  type: AIRequestType;
  title: string;
  description: string;
  icon: React.ElementType;
  accent: string;
}

export const SUGGESTION_CARDS: SuggestionCardConfig[] = [
  {
    type: 'suggestSong',
    title: 'Song to Upload',
    description: 'Which song from your library should go live today',
    icon: Music4,
    accent: 'bg-gold-gradient',
  },
  {
    type: 'suggestPractice',
    title: "Today's Practice",
    description: 'A focused practice plan based on what needs work',
    icon: Sparkles,
    accent: 'bg-walnut-500',
  },
  {
    type: 'trendingSong',
    title: 'Trending Songs',
    description: 'What\'s trending right now for covers and reels',
    icon: TrendingUp,
    accent: 'bg-sand-500',
  },
  {
    type: 'hashtags',
    title: 'Hashtag Suggestions',
    description: 'High-performing tags for your next post',
    icon: Hash,
    accent: 'bg-gold-500',
  },
  {
    type: 'uploadTiming',
    title: 'Best Upload Time',
    description: 'The optimal day and time to post, based on your data',
    icon: Clock,
    accent: 'bg-walnut-400',
  },
  {
    type: 'caption',
    title: 'Caption Ideas',
    description: 'Ready-to-use captions for your next post',
    icon: MessageSquareText,
    accent: 'bg-gold-400',
  },
  {
    type: 'thumbnailIdeas',
    title: 'Thumbnail Concepts',
    description: 'Eye-catching thumbnail ideas for YouTube',
    icon: ImageIcon,
    accent: 'bg-sand-400',
  },
  {
    type: 'coverImageIdeas',
    title: 'Cover Art Ideas',
    description: 'Album and cover image concepts for your song',
    icon: ImageIcon,
    accent: 'bg-walnut-300',
  },
  {
    type: 'reelIdeas',
    title: 'Reel Concepts',
    description: 'Creative short-form video ideas using your songs',
    icon: Video,
    accent: 'bg-gold-600',
  },
  {
    type: 'collaborationSuggestions',
    title: 'Collaboration Ideas',
    description: 'Creators and studios you could team up with',
    icon: Users2,
    accent: 'bg-sand-600',
  },
  {
    type: 'liveSessionSuggestions',
    title: 'Live Session Ideas',
    description: 'Formats and themes for your next live session',
    icon: Radio,
    accent: 'bg-walnut-500',
  },
  {
    type: 'audienceAnalysis',
    title: 'Audience Analysis',
    description: 'Who your core audience is and how to serve them',
    icon: BarChart2,
    accent: 'bg-gold-500',
  },
  {
    type: 'performanceReview',
    title: 'Performance Review',
    description: 'An honest, encouraging review of your recent work',
    icon: Compass,
    accent: 'bg-sand-500',
  },
  {
    type: 'motivation',
    title: 'Daily Motivation',
    description: 'A short boost to keep your momentum going',
    icon: Heart,
    accent: 'bg-red-400',
  },
  {
    type: 'growthPrediction',
    title: 'Growth Prediction',
    description: 'Where your growth trajectory is heading',
    icon: TrendingUp,
    accent: 'bg-green-500',
  },
  {
    type: 'careerSuggestions',
    title: 'Career Roadmap',
    description: 'A realistic path toward your music career goal',
    icon: Compass,
    accent: 'bg-walnut-600',
  },
];

export interface SuggestionCardsProps {
  onSelect: (type: AIRequestType, title: string) => void;
  activeType?: AIRequestType | null;
  isLoading?: boolean;
}

export default function SuggestionCards({ onSelect, activeType, isLoading }: SuggestionCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {SUGGESTION_CARDS.map((card, index) => (
        <motion.div
          key={card.type}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: (index % 8) * 0.04 }}
        >
          <Card
            hoverable
            onClick={() => !isLoading && onSelect(card.type, card.title)}
            className={
              activeType === card.type
                ? 'ring-2 ring-gold-400 shadow-premium-lg'
                : undefined
            }
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.accent}`}>
              <card.icon className="h-4 w-4 text-cream-50" />
            </div>
            <h4 className="mt-3 font-display text-sm font-semibold text-walnut-600">
              {card.title}
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-walnut-300">{card.description}</p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
