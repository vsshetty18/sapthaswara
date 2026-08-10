'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    description: 'For creators just getting started with their music journey.',
    features: [
      'Up to 25 songs in your library',
      '5 AI Coach requests / month',
      'Basic analytics dashboard',
      'Daily planner & reminders',
      '2 AI posters / month',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Premium',
    priceMonthly: 299,
    priceYearly: 2499,
    description: 'For serious creators ready to grow faster with AI on their side.',
    features: [
      'Unlimited songs & playlists',
      'Unlimited AI Coach requests',
      'Advanced Instagram & YouTube analytics',
      'Unlimited AI posters & thumbnails',
      'Creator Insights & growth reports',
      'Priority support',
    ],
    cta: 'Go Premium',
    highlighted: true,
  },
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="bg-cream-50 py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">Pricing</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-walnut-600 sm:text-4xl">
            Simple pricing, serious growth
          </h2>
          <p className="mt-4 text-walnut-400">
            Start free. Upgrade when the AI Coach becomes part of your daily routine.
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <span className={cn('text-sm font-medium', !isYearly ? 'text-walnut-600' : 'text-walnut-300')}>
            Monthly
          </span>
          <button
            role="switch"
            aria-checked={isYearly}
            onClick={() => setIsYearly((prev) => !prev)}
            className="relative h-7 w-13 rounded-full bg-beige-200 transition-colors"
            style={{ width: '52px' }}
          >
            <motion.span
              animate={{ x: isYearly ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute top-1 h-5 w-5 rounded-full bg-gold-gradient shadow-premium"
            />
          </button>
          <span className={cn('text-sm font-medium', isYearly ? 'text-walnut-600' : 'text-walnut-300')}>
            Yearly
          </span>
          <Badge variant="success" size="sm">Save 30%</Badge>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              variant={plan.highlighted ? 'default' : 'outline'}
              className={cn(
                'relative flex flex-col',
                plan.highlighted && 'ring-2 ring-gold-400 shadow-premium-lg'
              )}
            >
              {plan.highlighted && (
                <Badge variant="gold" className="absolute -top-3 left-6">
                  Most Popular
                </Badge>
              )}
              <h3 className="font-display text-lg font-semibold text-walnut-600">{plan.name}</h3>
              <p className="mt-1 text-sm text-walnut-300">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold text-walnut-600">
                  ₹{isYearly ? plan.priceYearly : plan.priceMonthly}
                </span>
                {plan.priceMonthly > 0 && (
                  <span className="text-sm text-walnut-300">/ {isYearly ? 'year' : 'month'}</span>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-walnut-500">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="mt-8 block">
                <Button variant={plan.highlighted ? 'primary' : 'outline'} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
