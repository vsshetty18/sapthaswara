'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    question: 'Is SvaraVerse a music streaming app?',
    answer:
      'No. SvaraVerse is a creator operating system — it helps you organize your song library, track practice, understand your social analytics, and get AI-powered career guidance. It\'s built for creating and growing, not for streaming other people\'s music.',
  },
  {
    question: 'How does the AI Music Coach work?',
    answer:
      'The AI Coach looks at your song library, practice history, and connected Instagram/YouTube analytics to give personalized suggestions — what to practice, which song to post next, best posting times, hashtags, captions, and even long-term career roadmaps.',
  },
  {
    question: 'Do I need a large following to use SvaraVerse?',
    answer:
      'Not at all. Whether you\'re just starting your riyaz or already have a following, SvaraVerse adapts to where you are — from your first practice streak to your first 100K followers.',
  },
  {
    question: 'Which platforms does SvaraVerse integrate with?',
    answer:
      'SvaraVerse connects with Instagram and YouTube to pull real engagement data — followers, reach, watch time, and top-performing content — directly into your dashboard.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'Yes. Your song library, practice data, and social analytics are private to your account. We never sell your data, and you can export or delete it anytime from Settings.',
  },
  {
    question: 'Can I cancel my Premium subscription anytime?',
    answer:
      'Yes, you can cancel anytime from Settings. Your Premium access continues until the end of your current billing period, with no cancellation fees.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-cream-50 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-walnut-600 sm:text-4xl">
            Questions, answered
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-beige-200 bg-beige-50"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-walnut-600">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-walnut-400 transition-transform duration-300',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-5 pb-4 text-sm leading-relaxed text-walnut-400">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
