/* ============================================================
   SVARAVERSE AI — Theme Context
   Dark / Light / System theme with persistence & transitions
   ============================================================ */

'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'

import { STORAGE_KEYS } from '@/lib/constants'
import { type Theme } from '@/types'

// ─── CONTEXT TYPES ──────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme:          Theme
  resolvedTheme:  'light' | 'dark'   // actual applied theme (system resolved)
  isDark:         boolean
  isLight:        boolean
  setTheme:       (theme: Theme) => void
  toggleTheme:    () => void
}

// ─── CONTEXT ────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null)

// ─── HELPERS ────────────────────────────────────────────────────────────────

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME)
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored
    }
  } catch {}
  return 'system'
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement

  // Add transition class briefly to smooth the switch
  root.classList.add('theme-transitioning')

  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      resolved === 'dark' ? '#1A1008' : '#FAF5E8',
    )
  }

  // Remove transition class after animation completes
  setTimeout(() => {
    root.classList.remove('theme-transitioning')
  }, 300)
}

// ─── INLINE SCRIPT — prevent flash of wrong theme ───────────────────────────
// This is injected as a blocking script in layout.tsx <head>

export const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('sv_theme');
    var theme = stored === 'dark' || stored === 'light' ? stored
      : (stored === 'system' || !stored)
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {}
})();
`.trim()

// ─── PROVIDER ───────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Resolved theme = explicit choice OR system preference
  const resolvedTheme = useMemo<'light' | 'dark'>(() => {
    if (theme === 'system') return systemTheme
    return theme
  }, [theme, systemTheme])

  const isDark  = resolvedTheme === 'dark'
  const isLight = resolvedTheme === 'light'

  // ── Initialize on mount ──────────────────────────────────
  useEffect(() => {
    const stored = getStoredTheme()
    const system = getSystemTheme()

    setSystemTheme(system)
    setThemeState(stored)
    setMounted(true)
  }, [])

  // ── Apply theme to DOM whenever it changes ───────────────
  useEffect(() => {
    if (!mounted) return
    applyTheme(resolvedTheme)
  }, [resolvedTheme, mounted])

  // ── Listen for system preference changes ─────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
    // Legacy
    mediaQuery.addListener(handler)
    return () => mediaQuery.removeListener(handler)
  }, [])

  // ── Set theme ────────────────────────────────────────────
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme)
    } catch {}
  }, [])

  // ── Toggle between light / dark (skips system) ───────────
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  // ── Prevent SSR mismatch flash ───────────────────────────
  // Return children always — the inline script handles the initial
  // class before React hydrates, so there's no flash

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    isDark,
    isLight,
    setTheme,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// ─── HOOK ───────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// ─── THEME TOGGLE BUTTON COMPONENT ──────────────────────────────────────────

interface ThemeToggleProps {
  className?: string
  size?:      'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function ThemeToggle({
  className = '',
  size = 'md',
  showLabel = false,
}: ThemeToggleProps) {
  const { isDark, toggleTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div
        className={`
          rounded-full bg-sand-100 animate-pulse
          ${size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'}
          ${className}
        `}
      />
    )
  }

  const sizeClasses = {
    sm:  'w-8 h-8 text-sm',
    md:  'w-10 h-10 text-base',
    lg:  'w-12 h-12 text-lg',
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`
        relative flex items-center justify-center rounded-full
        transition-all duration-300 ease-premium
        ${isDark
          ? 'bg-walnut-700/80 text-gold-300 hover:bg-walnut-600/80 border border-walnut-500/40'
          : 'bg-sand-100 text-walnut-600 hover:bg-sand-200 border border-sand-300'
        }
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {/* Sun icon */}
      <span
        className={`
          absolute transition-all duration-300
          ${isDark
            ? 'opacity-0 rotate-90 scale-50'
            : 'opacity-100 rotate-0 scale-100'
          }
        `}
        aria-hidden="true"
      >
        ☀️
      </span>

      {/* Moon icon */}
      <span
        className={`
          absolute transition-all duration-300
          ${isDark
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 -rotate-90 scale-50'
          }
        `}
        aria-hidden="true"
      >
        🌙
      </span>

      {showLabel && (
        <span className="sr-only">
          {resolvedTheme === 'dark' ? 'Dark mode' : 'Light mode'}
        </span>
      )}
    </button>
  )
}

// ─── THEME SELECTOR (3-way: Light / Dark / System) ──────────────────────────

interface ThemeSelectorProps {
  className?: string
}

export function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  const options: { value: Theme; label: string; icon: string }[] = [
    { value: 'light',  label: 'Light',  icon: '☀️' },
    { value: 'dark',   label: 'Dark',   icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ]

  return (
    <div
      className={`
        flex items-center gap-1 p-1 rounded-2xl
        bg-sand-100 dark:bg-walnut-800/60
        border border-sand-200 dark:border-walnut-600/40
        ${className}
      `}
      role="radiogroup"
      aria-label="Theme preference"
    >
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          role="radio"
          aria-checked={theme === opt.value}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
            font-ui transition-all duration-200
            ${theme === opt.value
              ? 'bg-white dark:bg-walnut-700 text-walnut-700 dark:text-gold-300 shadow-sm'
              : 'text-brown-400 dark:text-brown-300 hover:text-walnut-600 dark:hover:text-gold-400'
            }
          `}
        >
          <span aria-hidden="true">{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── CSS FOR THEME TRANSITION ────────────────────────────────────────────────
// Add to globals.css if not already present:
//
// .theme-transitioning,
// .theme-transitioning *,
// .theme-transitioning *::before,
// .theme-transitioning *::after {
//   transition: background-color 300ms ease, color 200ms ease,
//               border-color 200ms ease, box-shadow 200ms ease !important;
// }

export default ThemeContext
