'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Music4,
  Sparkles,
  BarChart3,
  Calendar,
  Trophy,
  Users,
  Image as ImageIcon,
  Bell,
} from 'lucide-react';
import Card from '@/components/ui/Card';

const FEATURES = [
  {
    icon: Music4,
    title: 'Song Library',
    description:
      'Organize every song by movie, scale, mood, and status — never lose track of what to practice next.',
  },
  {
    icon: Sparkles,
    title: 'AI Music Coach',
    description:
      'Get personalized suggestions on what to sing, post, and improve — powered by your own practice data.',
  },
  {
    icon: BarChart3,
    title: 'Instagram & YouTube Analytics',
    description:
      'See real engagement, best posting times, and top content — all in one clean dashboard.',
  },
  {
    icon: Calendar,
    title: 'Daily Planner',
    description:
      'Practice, record, edit, post — plan your creator day with a simple, satisfying checklist.',
  },
  {
    icon: Trophy,
    title: 'Milestones & Badges',
    description:
      'Celebrate 100 followers, 365-day streaks, and first collaborations with confetti-worthy moments.',
  },
  {
    icon: ImageIcon,
    title: 'AI Poster Generator',
    description:
      'Turn any song into a poster, thumbnail, or album cover in seconds — no design skills required.',
  },
  {
    icon: Users,
    title: 'Creator Community',
    description:
      'Connect with playback singers, music directors, and studios looking for their next collaborator.',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description:
      'Practice, live sessions, studio bookings — never miss a beat with reminders that adapt to you.',
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-beige-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-widest text-gold-600"
          >
            Everything a creator needs
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="mt-3 font-display text-3xl font-semibold text-walnut-600 sm:text-4xl"
          >
            One operating system for your entire music journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-walnut-400"
          >
            From your first riyaz to your first million views — SvaraVerse grows with you.
          </motion.p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
            >
              <Card hoverable className="h-full">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-gradient">
                  <feature.icon className="h-5 w-5 text-walnut-600" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-walnut-600">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-walnut-300">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
