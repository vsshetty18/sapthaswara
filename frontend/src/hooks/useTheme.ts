'use client';

import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';

/**
 * Convenience hook wrapping ThemeContext.
 * Provides: current theme ('light' | 'dark'), toggle function, and setter.
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

export default useTheme;
