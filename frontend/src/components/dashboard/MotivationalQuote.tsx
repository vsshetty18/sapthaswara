'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const FALLBACK_QUOTES = [
  { text: 'Riyaz is not practice for the stage — riyaz is the stage.', author: 'SvaraVerse' },
  { text: 'Your voice today is louder than your doubts tomorrow.', author: 'SvaraVerse' },
  { text: 'Every raga you master is a room you can never be locked out of again.', author: 'SvaraVerse' },
  { text: 'Consistency is the quietest form of talent.', author: 'SvaraVerse' },
  { text: 'The mic doesn\'t know your following count — only your feeling.', author: 'SvaraVerse' },
];

export interface MotivationalQuoteProps {
  quote?: string;
  isLoading?: boolean;
}

export default function MotivationalQuote({ quote, isLoading = false }: MotivationalQuoteProps) {
  const [fallbackQuote, setFallbackQuote] = useState(FALLBACK_QUOTES[0]);

  useEffect(() => {
    const dayIndex = new Date().getDate() % FALLBACK_QUOTES.length;
    setFallbackQuote(FALLBACK_QUOTES[dayIndex]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gold-gradient p-6"
    >
      <Quote className="absolute -right-2 -top-2 h-16 w-16 text-walnut-600/10" />
      {isLoading ? (
        <div className="h-12 animate-pulse rounded-lg bg-walnut-600/10" />
      ) : (
        <p className="relative font-display text-lg font-medium leading-snug text-walnut-600">
          "{quote || fallbackQuote.text}"
        </p>
      )}
      <p className="relative mt-3 text-xs font-medium text-walnut-500/70">
        — Your daily dose of motivation
      </p>
    </motion.div>
  );
}
