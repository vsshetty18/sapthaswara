'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';

const TESTIMONIALS = [
  {
    name: 'Ananya Rao',
    role: 'Playback Singer Aspirant, Mumbai',
    quote:
      'The AI Coach told me to post my Kesariya cover at exactly the right time — it got triple my usual reach. I finally feel like I have a strategy, not just a hobby.',
    rating: 5,
  },
  {
    name: 'Rohan Verma',
    role: 'Independent Creator, Bengaluru',
    quote:
      'I used to forget half my song ideas. Now everything lives in one library with lyrics, scale, and mood tags. My practice sessions are so much more focused.',
    rating: 5,
  },
  {
    name: 'Priya Nair',
    role: 'Carnatic Music Student, Chennai',
    quote:
      'The streak tracker keeps me honest about daily riyaz, and the milestone celebrations genuinely make me smile. It doesn\'t feel like just another app.',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-beige-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold-600">
            Loved by creators
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-walnut-600 sm:text-4xl">
            Real journeys, real growth
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <Quote className="h-6 w-6 text-gold-400" />
                <p className="mt-4 text-sm leading-relaxed text-walnut-500">
                  "{testimonial.quote}"
                </p>
                <div className="mt-5 flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3 border-t border-beige-200 pt-5">
                  <Avatar name={testimonial.name} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-walnut-600">{testimonial.name}</p>
                    <p className="text-xs text-walnut-300">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
