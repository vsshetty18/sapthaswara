'use client';

import React, { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import Button from '@/components/ui/Button';

export interface ConfettiAnimationProps {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
}

const GOLD_PALETTE = ['#D4AF37', '#E8C87A', '#B8912C', '#CCA869', '#F5EEE1'];

export default function ConfettiAnimation({ isOpen, title, description, onClose }: ConfettiAnimationProps) {
  const fireConfetti = useCallback(() => {
    const duration = 2500;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: GOLD_PALETTE,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: GOLD_PALETTE,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.5 },
      colors: GOLD_PALETTE,
      startVelocity: 35,
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      fireConfetti();
    }
  }, [isOpen, fireConfetti]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-walnut-600/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="relative w-full max-w-sm rounded-3xl bg-cream-50 p-8 text-center shadow-premium-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-1.5 text-walnut-300 hover:bg-beige-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-gradient shadow-premium-lg"
              >
                <Trophy className="h-9 w-9 text-walnut-600" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-5 font-display text-xl font-semibold text-walnut-600"
              >
                {title}
              </motion.h3>

              {description && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="mt-2 text-sm leading-relaxed text-walnut-400"
                >
                  {description}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <Button variant="primary" className="mt-6 w-full" onClick={onClose}>
                  Continue Your Journey
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
