'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Send } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useAICoach } from '@/hooks/useAICoach';
import { formatRelativeTime } from '@/lib/utils';

const QUICK_PROMPTS = [
  { label: 'What should I upload today?', type: 'suggestSong' as const },
  { label: "What's today's practice?", type: 'suggestPractice' as const },
  { label: 'Give me motivation', type: 'motivation' as const },
];

export default function AIInsights() {
  const { isLoading, lastResponse, runRequest } = useAICoach();
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  const handlePromptClick = async (type: (typeof QUICK_PROMPTS)[number]['type'], label: string) => {
    setActivePrompt(label);
    await runRequest(type);
  };

  return (
    <Card className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }}
      />

      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold-gradient">
            <Sparkles className="h-4 w-4 text-walnut-600" />
          </div>
          <CardTitle>AI Coach</CardTitle>
        </div>
        {lastResponse && (
          <button
            onClick={() => setActivePrompt(null)}
            className="text-walnut-300 hover:text-walnut-500"
            aria-label="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </CardHeader>

      <div className="min-h-[92px] rounded-2xl bg-gold-50 p-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-walnut-400">
            <Spinner size="sm" />
            Thinking about your next move...
          </div>
        ) : lastResponse ? (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm leading-relaxed text-walnut-600"
          >
            {lastResponse.responseText}
          </motion.p>
        ) : (
          <p className="text-sm text-walnut-400">
            Ask your AI Coach anything — what to sing, when to post, or just a little motivation.
          </p>
        )}
        {lastResponse && !isLoading && (
          <p className="mt-3 text-[11px] text-walnut-300">
            {formatRelativeTime(lastResponse.createdAt)}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            onClick={() => handlePromptClick(prompt.type, prompt.label)}
            disabled={isLoading}
            className="rounded-full border border-beige-200 bg-cream-50 px-3.5 py-1.5 text-xs font-medium text-walnut-500 transition-colors hover:border-gold-400 hover:bg-gold-50 disabled:opacity-50"
          >
            {prompt.label}
          </button>
        ))}
      </div>

      <Button variant="ghost" size="sm" className="mt-4 w-full" rightIcon={<Send className="h-3.5 w-3.5" />}>
        Open Full AI Coach
      </Button>
    </Card>
  );
}
