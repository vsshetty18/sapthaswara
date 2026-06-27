/* ============================================================
   SVARAVERSE AI — Login Page
   Email/Password + Google Sign-in + Validation + Animations
   ============================================================ */

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useAuth } from '@/context/AuthContext'
import { APP_NAME } from '@/lib/constants'

// ─── VALIDATION SCHEMA ───────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

// ─── ANIMATED MUSIC ILLUSTRATION ─────────────────────────────────────────────

function MusicIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center
                    min-h-[300px] lg:min-h-full overflow-hidden">

      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full
                      bg-gold-300/20 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full
                      bg-brown-300/20 blur-2xl animate-float-reverse" />

      {/* Tanpura strings */}
      {[20, 35, 50, 65, 80].map((left, i) => (
        <div
          key={i}
          className="tanpura-string absolute top-0 bottom-0"
          style={{
            left:              `${left}%`,
            animationDelay:    `${i * 0.2}s`,
            animationDuration: `${2 + i * 0.3}s`,
            opacity:            0.15 + i * 0.05,
          }}
        />
      ))}

      {/* Central veena / tanpura SVG illustration */}
      <div className="relative z-10 animate-float-slow">
        <svg
          width="220"
          height="320"
          viewBox="0 0 220 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-2xl"
        >
          {/* Tanpura body */}
          <ellipse cx="110" cy="230" rx="65" ry="80"
                   fill="url(#bodyGrad)" opacity="0.95" />

          {/* Neck */}
          <rect x="98" y="60" width="24" height="170" rx="12"
                fill="url(#neckGrad)" />

          {/* Tuning pegs */}
          {[75, 90, 105, 120].map((y, i) => (
            <g key={i}>
              <circle cx="90"  cy={y} r="5" fill="#B45309" opacity="0.8" />
              <circle cx="130" cy={y} r="5" fill="#B45309" opacity="0.8" />
            </g>
          ))}

          {/* Strings */}
          {[100, 105, 110, 115, 120].map((x, i) => (
            <line
              key={i}
              x1={x} y1="60"
              x2={x + (i % 2 === 0 ? 2 : -2)} y2="280"
              stroke="#F59E0B"
              strokeWidth="0.8"
              opacity={0.4 + i * 0.1}
              strokeDasharray="4 2"
            >
              <animate
                attributeName="x2"
                values={`${x + 2};${x - 2};${x + 2}`}
                dur={`${0.8 + i * 0.15}s`}
                repeatCount="indefinite"
              />
            </line>
          ))}

          {/* Sound hole */}
          <ellipse cx="110" cy="230" rx="22" ry="25"
                   fill="#2A1D08" opacity="0.6" />
          <ellipse cx="110" cy="230" rx="15" ry="17"
                   fill="none" stroke="#F59E0B" strokeWidth="1"
                   opacity="0.4" />

          {/* Bridge */}
          <rect x="85" y="270" width="50" height="6" rx="3"
                fill="#B45309" opacity="0.7" />

          {/* Head */}
          <ellipse cx="110" cy="50" rx="22" ry="16"
                   fill="url(#headGrad)" />

          {/* Decorative floral */}
          <circle cx="110" cy="50" r="8" fill="none"
                  stroke="#F59E0B" strokeWidth="1.5" opacity="0.6" />
          <circle cx="110" cy="50" r="3" fill="#F59E0B" opacity="0.8" />

          {/* Floating music notes */}
          <text x="155" y="140" fontSize="18" fill="#F59E0B" opacity="0.7"
                className="animate-float">♪</text>
          <text x="40"  y="120" fontSize="14" fill="#B45309" opacity="0.6"
                className="animate-float-slow">♫</text>
          <text x="165" y="200" fontSize="12" fill="#F59E0B" opacity="0.5"
                className="animate-float-reverse">♩</text>
          <text x="30"  y="200" fontSize="16" fill="#D97706" opacity="0.55"
                className="animate-float">𝄞</text>

          {/* Gradient defs */}
          <defs>
            <radialGradient id="bodyGrad" cx="40%" cy="35%">
              <stop offset="0%"   stopColor="#DEB887" />
              <stop offset="50%"  stopColor="#C4952A" />
              <stop offset="100%" stopColor="#8B6914" />
            </radialGradient>
            <linearGradient id="neckGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#A0752A" />
              <stop offset="50%"  stopColor="#D4A843" />
              <stop offset="100%" stopColor="#8B6914" />
            </linearGradient>
            <linearGradient id="headGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#E8C56A" />
              <stop offset="100%" stopColor="#A07830" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Glow ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-48 h-48 rounded-full border border-gold-300/20
                        animate-glow-ring" />
      </div>
    </div>
  )
}

// ─── GOOGLE BUTTON ───────────────────────────────────────────────────────────

function GoogleButton({
  onClick,
  isLoading,
}: {
  onClick:   () => void
  isLoading: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 px-4 py-3
                 rounded-xl border border-sand-300 dark:border-walnut-600
                 bg-white dark:bg-walnut-800/60
                 text-walnut-700 dark:text-cream-200
                 font-ui font-medium text-sm
                 hover:bg-sand-50 dark:hover:bg-walnut-700/60
                 hover:border-gold-300 dark:hover:border-gold-600/50
                 hover:shadow-warm transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="w-5 h-5 rounded-full border-2 border-gold-400
                        border-t-transparent animate-spin" />
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      )}
      Continue with Google
    </button>
  )
}

// ─── DIVIDER ─────────────────────────────────────────────────────────────────

function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-sand-200 dark:bg-walnut-600/60" />
      <span className="text-xs font-ui text-brown-400 dark:text-cream-500 px-2">
        or continue with email
      </span>
      <div className="flex-1 h-px bg-sand-200 dark:bg-walnut-600/60" />
    </div>
  )
}

// ─── INPUT FIELD ─────────────────────────────────────────────────────────────

interface InputFieldProps {
  label:        string
  type?:        string
  placeholder?: string
  error?:       string
  icon?:        React.ReactNode
  rightEl?:     React.ReactNode
  registration: ReturnType<typeof useForm>['register'] extends
    (...args: infer A) => infer R ? (...args: A) => R : never
}

function InputField({
  label,
  type = 'text',
  placeholder,
  error,
  icon,
  rightEl,
  registration,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="form-label">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2
                          text-brown-400 dark:text-cream-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          {...registration}
          className={`
            form-input w-full
            ${icon    ? 'pl-10'  : ''}
            ${rightEl ? 'pr-12' : ''}
            ${error   ? 'error'  : ''}
            dark:bg-walnut-800/60 dark:border-walnut-600/60
            dark:text-cream-100 dark:placeholder-cream-600
          `}
        />
        {rightEl && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightEl}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-error font-ui flex items-center gap-1 animate-fade-down">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [showPassword,   setShowPassword]   = useState(false)
  const [googleLoading,  setGoogleLoading]  = useState(false)
  const [formLoading,    setFormLoading]    = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver:      zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setFormLoading(true)
      await loginWithEmail({ email: data.email, password: data.password })
    } catch {
      // Error handled in context
    } finally {
      setFormLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      setGoogleLoading(true)
      await loginWithGoogle()
    } catch {
      // Error handled in context
    } finally {
      setGoogleLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-walnut-900 flex items-center
                      justify-center">
        <div className="loading-logo animate-pulse-gold">
          <span className="text-2xl font-display text-cream-50 font-bold">स</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero dark:bg-gradient-premium
                    flex items-stretch overflow-hidden">

      {/* ── Left panel — Illustration ──────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative
                      bg-gradient-to-br from-walnut-900 via-walnut-800 to-coffee-600
                      flex-col items-center justify-center p-12">

        {/* Background texture */}
        <div className="absolute inset-0 bg-texture-strings opacity-10" />
        <div className="absolute inset-0 bg-texture-tabla opacity-5" />

        {/* Illustration */}
        <div className="relative z-10 w-full max-w-sm">
          <MusicIllustration />
        </div>

        {/* Text */}
        <div className="relative z-10 text-center mt-8 max-w-sm">
          <h2 className="font-display text-3xl text-cream-50 mb-3">
            Welcome Back, Creator
          </h2>
          <p className="text-cream-300/70 text-sm leading-relaxed">
            Your songs, streaks, and AI coach are waiting. Let&apos;s continue
            your musical journey.
          </p>
        </div>

        {/* Floating stats */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between z-10">
          {[
            { value: '10K+',  label: 'Creators' },
            { value: '365',   label: 'Day Streaks' },
            { value: '4.9★',  label: 'Rating' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-display text-xl text-gold-400 font-bold">{s.value}</p>
              <p className="text-xs text-cream-500 font-ui">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — Form ─────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center
                      px-4 sm:px-8 py-12 bg-cream-50 dark:bg-walnut-900
                      min-h-screen lg:min-h-0">

        <div className="w-full max-w-md animate-fade-up">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 group w-fit">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center
                            justify-center shadow-gold group-hover:shadow-glow
                            transition-all duration-300">
              <span className="text-cream-50 font-display font-bold text-xl">स</span>
            </div>
            <span className="font-display font-bold text-xl text-walnut-800
                             dark:text-cream-100">
              {APP_NAME}
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-walnut-900
                           dark:text-cream-100 mb-2">
              Sign in
            </h1>
            <p className="text-brown-400 dark:text-cream-400 text-sm">
              New to SvaraVerse?{' '}
              <Link href="/signup"
                    className="text-primary hover:text-primary-hover font-semibold
                               transition-colors">
                Create a free account →
              </Link>
            </p>
          </div>

          {/* Google Sign-in */}
          <GoogleButton onClick={handleGoogle} isLoading={googleLoading} />

          {/* Divider */}
          <OrDivider />

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">

            <InputField
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              }
              registration={register('email')}
            />

            <InputField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              error={errors.password?.message}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              }
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="text-brown-400 dark:text-cream-500 hover:text-walnut-600
                             dark:hover:text-cream-300 transition-colors text-sm"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              }
              registration={register('password')}
            />

            {/* Forgot password */}
            <div className="flex justify-end -mt-1">
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:text-primary-hover
                           font-ui font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={formLoading}
              className="btn-primary w-full py-3.5 text-base relative
                         disabled:opacity-70 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 mt-1"
            >
              {formLoading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-cream-200/50
                                  border-t-cream-50 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-brown-400 dark:text-cream-600 text-center mt-6 leading-relaxed">
            By signing in, you agree to our{' '}
            <a href="/terms"   className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
          </p>

          {/* Owner / Admin login */}
          <div className="mt-8 pt-6 border-t border-sand-200 dark:border-walnut-700/60">
            <p className="text-center text-xs text-brown-400 dark:text-cream-600">
              Are you a team member?{' '}
              <Link href="/owner/login"
                    className="text-walnut-600 dark:text-gold-400 font-semibold
                               hover:text-primary transition-colors">
                Owner / Admin Login →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
