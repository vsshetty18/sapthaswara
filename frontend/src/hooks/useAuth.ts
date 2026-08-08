'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * Convenience hook wrapping AuthContext.
 * Provides: user, loading state, and auth actions (login, signup, logout, etc).
 * Throws if used outside an AuthProvider to catch integration mistakes early.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default useAuth;
