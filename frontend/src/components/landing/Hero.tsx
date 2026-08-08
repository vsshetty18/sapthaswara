'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import Button from '@/components/ui/Button';

const STRING_COUNT = 7;

function TanpuraStrings() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <svg
        viewBox="0 0 800 500"
        className="absolute -right-24 top-0 h-full w-full max-w-3xl opacity-[0.14]"
        preserveAspectRatio="xMaxYMid slice"
      >
        {Array.from({ length: STRING_COUNT }).map((_, i) => (
          <motion.line
            key={i}
            x1={100 + i * 8}
            y1="0"
            x2={100 + i * 8}
            y2="500"
            stroke="#3B2C1F"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{
              x1: [100 + i * 8, 104 + i * 8, 100 + i * 8],
              x2: [100 + i * 8, 96 + i * 8, 100 + i * 8],
            }}
            transition={{
              duration: 2.4 + i * 0.15,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.1,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream-50 pt-16 pb-24 sm:pt-24 sm:pb-32">
      <TanpuraStrings />

      <div
        className="absolute inset-x-0 top-0 -z-10 h-[600px] opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 70% 0%, rgba(212,175,55,0.15), transparent)',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-50 px-4 py-1.5 text-xs font-medium text-gold-600"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
              Your riyaz, your reach, your career — in one place
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 font-display text-4xl font-semibold leading-[1.1] text-walnut-600 sm:text-5xl lg:text-6xl"
            >
              Every raga you practice.
              <br />
              <span className="bg-gold-gradient bg-clip-text text-transparent">
                Every stage you're building toward.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-lg text-base leading-relaxed text-walnut-400 sm:text-lg"
            >
              SvaraVerse AI is the operating system for Indian singers and creators —
              track your practice, understand your audience, and let an AI coach trained
              on your journey tell you exactly what to sing, post, and improve next.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <Link href="/signup">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Start Your Journey
                </Button>
              </Link>
              <Button variant="outline" size="lg" leftIcon={<Play className="h-4 w-4" />}>
                Watch How It Works
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-10 flex items-center gap-8 border-t border-beige-200 pt-6"
            >
              <div>
                <p className="font-display text-2xl font-semibold text-walnut-600">12K+</p>
                <p className="text-xs text-walnut-300">Creators tracked</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-walnut-600">4.2L+</p>
                <p className="text-xs text-walnut-300">Songs practiced</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-walnut-600">98%</p>
                <p className="text-xs text-walnut-300">Would recommend</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-md rounded-[2rem] border border-beige-200 bg-cream-50/80 p-3 shadow-premium-lg backdrop-blur-sm">
              <div className="rounded-[1.5rem] bg-walnut-gradient p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-cream-100/60">Today's streak</p>
                    <p className="font-display text-3xl font-semibold text-gold-400">12 days</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-gradient text-xl">
                    🔥
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    { label: 'Kesariya — practiced', pct: 100 },
                    { label: 'Tum Hi Ho — recorded', pct: 80 },
                    { label: 'Kun Faya Kun — needs work', pct: 35 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs text-cream-100/70">
                        <span>{item.label}</span>
                        <span>{item.pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-cream-50/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ duration: 1, delay: 0.6 }}
                          className="h-full rounded-full bg-gold-gradient"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 rounded-2xl bg-gold-50 p-4">
                <p className="text-xs font-medium text-gold-600">🤖 AI Coach suggests</p>
                <p className="mt-1 text-sm text-walnut-500">
                  "Post your Kesariya cover today at 7 PM — your audience is most active then."
                </p>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-6 top-10 hidden rounded-2xl bg-cream-50 px-4 py-3 shadow-premium sm:block"
            >
              <p className="text-xs text-walnut-300">Followers this week</p>
              <p className="font-display text-lg font-semibold text-green-600">+1,204</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
