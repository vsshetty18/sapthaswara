'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Apple, Smartphone } from 'lucide-react';

export default function DownloadApp() {
  return (
    <section id="download" className="relative overflow-hidden bg-walnut-gradient py-24">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 38px, #E8C87A 38px, #E8C87A 40px)',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-semibold uppercase tracking-widest text-gold-400"
        >
          Take SvaraVerse anywhere
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mt-3 font-display text-3xl font-semibold text-cream-50 sm:text-4xl"
        >
          Your practice streak fits in your pocket
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-4 max-w-lg text-cream-100/70"
        >
          Log practice, catch reminders, and check your AI Coach's daily suggestions — on Android, iOS, or the web.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          
            href="#"
            className="flex items-center gap-3 rounded-2xl bg-cream-50 px-6 py-3 shadow-premium transition-transform hover:-translate-y-0.5"
          >
            <Apple className="h-7 w-7 text-walnut-600" />
            <div className="text-left">
              <p className="text-[10px] text-walnut-300">Download on the</p>
              <p className="text-sm font-semibold text-walnut-600">App Store</p>
            </div>
          </a>
          
            href="#"
            className="flex items-center gap-3 rounded-2xl bg-cream-50 px-6 py-3 shadow-premium transition-transform hover:-translate-y-0.5"
          >
            <Smartphone className="h-7 w-7 text-walnut-600" />
            <div className="text-left">
              <p className="text-[10px] text-walnut-300">Get it on</p>
              <p className="text-sm font-semibold text-walnut-600">Google Play</p>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
