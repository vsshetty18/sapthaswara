'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { useAICoach, type AIRequestType } from '@/hooks/useAICoach';
import { cn, formatRelativeTime } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_ACTIONS: { label: string; type: AIRequestType }[] = [
  { label: 'What should I upload today?', type: 'suggestSong' },
  { label: "What's today's practice?", type: 'suggestPractice' },
  { label: 'Suggest hashtags', type: 'hashtags' },
  { label: 'Give me motivation', type: 'motivation' },
  { label: 'Analyze my audience', type: 'audienceAnalysis' },
  { label: 'Predict my growth', type: 'growthPrediction' },
];

export default function ChatInterface() {
  const { isLoading, runRequest } = useAICoach();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hey! I'm your AI Music Coach. Ask me what to sing, when to post, or tap a quick action below to get started.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const pushUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `u_${Date.now()}`, role: 'user', content, timestamp: new Date().toISOString() },
    ]);
  };

  const pushAssistantMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `a_${Date.now()}`, role: 'assistant', content, timestamp: new Date().toISOString() },
    ]);
  };

  const handleQuickAction = async (label: string, type: AIRequestType) => {
    pushUserMessage(label);
    const response = await runRequest(type);
    if (response) pushAssistantMessage(response.responseText);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    pushUserMessage(trimmed);
    setInput('');

    // Free-text falls back to career suggestions using the message as the "goal"
    const response = await runRequest('careerSuggestions', trimmed);
    if (response) pushAssistantMessage(response.responseText);
  };

  return (
    <div className="flex h-[600px] flex-col rounded-3xl bg-cream-50 shadow-premium">
      <div className="flex items-center gap-2 border-b border-beige-100 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gold-gradient">
          <Sparkles className="h-4 w-4 text-walnut-600" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-walnut-600">AI Music Coach</p>
          <p className="text-[11px] text-walnut-300">Always here for your next move</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex gap-2.5', msg.role === 'user' && 'flex-row-reverse')}
          >
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                msg.role === 'assistant' ? 'bg-gold-gradient' : 'bg-walnut-500'
              )}
            >
              {msg.role === 'assistant' ? (
                <Sparkles className="h-3.5 w-3.5 text-walnut-600" />
              ) : (
                <User className="h-3.5 w-3.5 text-cream-50" />
              )}
            </div>
            <div
              className={cn(
                'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                msg.role === 'assistant'
                  ? 'bg-gold-50 text-walnut-600'
                  : 'bg-walnut-500 text-cream-50'
              )}
            >
              <p>{msg.content}</p>
              <p
                className={cn(
                  'mt-1.5 text-[10px]',
                  msg.role === 'assistant' ? 'text-walnut-300' : 'text-cream-100/60'
                )}
              >
                {formatRelativeTime(msg.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-gradient">
              <Sparkles className="h-3.5 w-3.5 text-walnut-600" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-gold-50 px-4 py-2.5">
              <Spinner size="sm" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-beige-100 px-5 py-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.label, action.type)}
              disabled={isLoading}
              className="rounded-full border border-beige-200 bg-beige-50 px-3 py-1.5 text-xs font-medium text-walnut-500 transition-colors hover:border-gold-400 hover:bg-gold-50 disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI Coach anything..."
            disabled={isLoading}
            className="h-11 flex-1 rounded-2xl border border-beige-200 bg-cream-50 px-4 text-sm text-walnut-600 placeholder:text-walnut-300 focus:border-gold-400 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-gradient text-walnut-600 shadow-premium disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
