/* ============================================================
   SVARAVERSE AI — Signup Page
   Multi-field registration + Username check + Password strength
   ============================================================ */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useAuth } from '@/context/AuthContext'
import { isUsernameTaken } from '@/services/firebase'
import { APP_NAME } from '@/lib/constants'

// ─── VALIDATION SCHEMA ───────────────────────────────────────────────────────

const signupSchema = z.object({
  displayName: z
    .string()
    .min(2,  'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters')
    .regex(/^[a-zA-Z\s\u0900-\u097F]+$/, 'Name can only contain letters'),

  username: z
    .string()
    .min(3,  'Username must be at least 3 characters')
    .max(20, 'Username must be under 20 characters')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers and _')
    .regex(/^[a-z]/, 'Username must start with a letter'),

  email: z
    .string()
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/,       'Must contain at least one uppercase letter')
    .regex(/[0-9]/,       'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/,'Must contain at least one special character'),

  confirmPassword: z.string(),

  agreeToTerms: z
    .boolean()
    .refine(v => v === true, 'You must agree to the terms to continue'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path:    ['confirmPassword'],
})

type SignupFormData = z.infer<typeof signupSchema>

// ─── PASSWORD STRENGTH ───────────────────────────────────────────────────────

interface PasswordStrength {
  score:   0 | 1 | 2 | 3 | 4
  label:   string
  color:   string
  percent: number
}

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: '',        color: 'bg-sand-200',   percent: 0   }

  let score = 0
  if (password.length >= 8)          score++
  if (password.length >= 12)         score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password))        score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const clamped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4

  const map: Record<0 | 1 | 2 | 3 | 4, PasswordStrength> = {
    0: { score: 0, label: '',          color: 'bg-sand-200',   percent: 0   },
    1: { score: 1, label: 'Weak',      color: 'bg-error',      percent: 25  },
    2: { score: 2, label: 'Fair',      color: 'bg-warning',    percent: 50  },
    3: { score: 3, label: 'Good',      color: 'bg-success',    percent: 75  },
    4: { score: 4, label: 'Strong 💪', color: 'bg-success',    percent: 100 },
  }

  return map[clamped]
}

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password)

  if (!password) return null

  return (
    <div className="flex flex-col gap-1.5 mt-1.5 animate-fade-down">
      {/* Bar */}
      <div className="h-1.5 w-full bg-sand-200 dark:bg-walnut-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
          style={{ width: `${strength.percent}%` }}
        />
      </div>

      {/* Label + requirements */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {[
            { check: password.length >= 8,           label: '8+ chars'  },
            { check: /[A-Z]/.test(password),          label: 'Uppercase' },
            { check: /[0-9]/.test(password),          label: 'Number'    },
            { check: /[^A-Za-z0-9]/.test(password),  label: 'Symbol'    },
          ].map(req => (
            <span
              key={req.label}
              className={`text-2xs font-ui transition-colors duration-200
                          ${req.check
                            ? 'text-success dark:text-green-400'
                            : 'text-brown-400 dark:text-cream-600'
                          }`}
            >
              {req.check ? '✓' : '○'} {req.label}
            </span>
          ))}
        </div>
        {strength.label && (
          <span className={`text-2xs font-ui font-semibold
                            ${strength.score >= 3
                              ? 'text-success dark:text-green-400'
                              : strength.score === 2
                              ? 'text-warning'
                              : 'text-error'
                            }`}>
            {strength.label}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── USERNAME AVAILABILITY ───────────────────────────────────────────────────

type UsernameState = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

function UsernameStatus({ state }: { state: UsernameState }) {
  const map: Record<UsernameState, { icon: string; text: string; color: string } | null> = {
    idle:      null,
    checking:  { icon: '⏳', text: 'Checking...',   color: 'text-brown-400' },
    available: { icon: '✓',  text: 'Available!',    color: 'text-success dark:text-green-400' },
    taken:     { icon: '✗',  text: 'Already taken', color: 'text-error' },
    invalid:   null,
  }

  const info = map[state]
  if (!info) return null

  return (
    <p className={`text-xs font-ui flex items-center gap-1 animate-fade-down ${info.color}`}>
      <span>{info.icon}</span> {info.text}
    </p>
  )
}

// ─── FORM INPUT ───────────────────────────────────────────────────────────────

interface FieldProps {
  label:       string
  type?:       string
  placeholder?:string
  error?:      string
  hint?:       string
  icon?:       React.ReactNode
  rightEl?:    React.ReactNode
  below?:      React.ReactNode
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registration:any
}

function Field({
  label, type = 'text', placeholder, error,
  hint, icon, rightEl, below, registration,
}: FieldProps) {
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
      {below}
      {error && (
        <p className="text-xs text-error font-ui flex items-center gap-1 animate-fade-down">
          <span>⚠</span> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-brown-400 dark:text-cream-600 font-ui">{hint}</p>
      )}
    </div>
  )
}

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className={`
              h-1.5 rounded-full transition-all duration-400
              ${i < current
                ? 'bg-gold-500 flex-1'
                : i === current
                ? 'bg-gold-300 flex-1'
                : 'bg-sand-200 dark:bg-walnut-700 flex-1'
              }
            `}
          />
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── DECORATIVE SIDE PANEL ───────────────────────────────────────────────────

function SidePanel() {
  const benefits = [
    { icon: '🎵', text: 'Organize your entire song library' },
    { icon: '🤖', text: 'AI coach for daily practice guidance' },
    { icon: '📊', text: 'Track Instagram & YouTube growth' },
    { icon: '🏆', text: 'Celebrate milestones with animations' },
    { icon: '🎨', text: 'Generate posters for every song' },
    { icon: '🔥', text: 'Build 365-day practice streaks' },
  ]

  return (
    <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 flex-col justify-center
                    bg-gradient-to-br from-walnut-900 via-coffee-600 to-walnut-800
                    px-12 py-16 relative overflow-hidden">

      {/* Texture */}
      <div className="absolute inset-0 bg-texture-wave opacity-5" />

      {/* Animated rings */}
      <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
        <div className="w-96 h-96 rounded-full border border-gold-500/10 animate-spin-slow" />
        <div className="absolute inset-8 rounded-full border border-gold-500/15
                        animate-spin-slow" style={{ animationDirection: 'reverse' }} />
        <div className="absolute inset-16 rounded-full border border-gold-400/20
                        animate-spin-slow" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-gold flex items-center
                          justify-center shadow-gold">
            <span className="text-cream-50 font-display font-bold text-2xl">स</span>
          </div>
          <div>
            <p className="font-display text-xl text-cream-100 font-bold">{APP_NAME}</p>
            <p className="text-xs text-cream-400 font-ui">AI Music Creator Platform</p>
          </div>
        </div>

        {/* Headline */}
        <h2 className="font-display text-4xl text-cream-50 mb-3 leading-tight">
          Your Musical
          <span className="block text-gradient-gold">Journey Starts</span>
          Here
        </h2>
        <p className="text-cream-400 text-sm mb-10 leading-relaxed">
          Join 10,000+ Indian singers and creators who use SvaraVerse AI
          to practice smarter and grow faster.
        </p>

        {/* Benefits list */}
        <div className="flex flex-col gap-4">
          {benefits.map((b, i) => (
            <div
              key={b.text}
              className="flex items-center gap-3 animate-fade-right"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="w-9 h-9 rounded-xl bg-gold-900/40 border border-gold-600/30
                              flex items-center justify-center flex-shrink-0 text-lg">
                {b.icon}
              </div>
              <span className="text-sm text-cream-300 font-ui">{b.text}</span>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="mt-10 flex items-center gap-3 glass-dark rounded-2xl
                        px-4 py-3 border border-gold-600/20">
          <div className="flex -space-x-2">
            {['🎤', '🎵', '🎶', '🎼'].map((emoji, i) => (
              <div key={i}
                   className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400
                              to-gold-600 flex items-center justify-center text-sm
                              border-2 border-walnut-800 flex-shrink-0">
                {emoji}
              </div>
            ))}
          </div>
          <div>
            <p className="text-cream-200 text-xs font-semibold font-ui">
              +10,000 creators joined
            </p>
            <div className="flex gap-0.5 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-gold-400 text-xs">★</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SIGNUP PAGE ──────────────────────────────────────────────────────────────

export default function SignupPage() {
  const { register: authRegister, loginWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [showPassword,        setShowPassword]        = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [googleLoading,       setGoogleLoading]       = useState(false)
  const [formLoading,         setFormLoading]         = useState(false)
  const [usernameState,       setUsernameState]       = useState<UsernameState>('idle')
  const [step,                setStep]                = useState(0) // 0 = personal, 1 = credentials

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver:      zodResolver(signupSchema),
    mode:          'onChange',
    defaultValues: {
      displayName:     '',
      username:        '',
      email:           '',
      password:        '',
      confirmPassword: '',
      agreeToTerms:    false,
    },
  })

  const passwordValue  = watch('password')
  const usernameValue  = watch('username')

  // ── Username availability debounce ───────────────────────
  const checkUsername = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameState('idle')
      return
    }

    const isValid = /^[a-z][a-z0-9_]{2,19}$/.test(username)
    if (!isValid) {
      setUsernameState('invalid')
      return
    }

    setUsernameState('checking')
    try {
      const taken = await isUsernameTaken(username)
      setUsernameState(taken ? 'taken' : 'available')
    } catch {
      setUsernameState('idle')
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      checkUsername(usernameValue)
    }, 600)
    return () => clearTimeout(timer)
  }, [usernameValue, checkUsername])

  // ── Step 1 validation before proceeding ──────────────────
  const handleNext = async () => {
    const valid = await trigger(['displayName', 'username'])
    if (valid && usernameState === 'available') {
      setStep(1)
    } else if (usernameState !== 'available') {
      // Force check
      await checkUsername(usernameValue)
    }
  }

  // ── Form submit ──────────────────────────────────────────
  const onSubmit = async (data: SignupFormData) => {
    if (usernameState === 'taken') return

    try {
      setFormLoading(true)
      await authRegister({
        email:       data.email,
        password:    data.password,
        displayName: data.displayName,
        username:    data.username.toLowerCase(),
      })
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
      // handled in context
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

  const IconEmail = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )

  const IconLock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )

  const IconUser = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )

  const IconAt = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4"/>
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
    </svg>
  )

  const EyeToggle = ({
    show, onToggle, label,
  }: { show: boolean; onToggle: () => void; label: string }) => (
    <button type="button" onClick={onToggle}
            className="text-brown-400 dark:text-cream-500 hover:text-walnut-600
                       dark:hover:text-cream-300 transition-colors text-sm"
            aria-label={label}>
      {show ? '🙈' : '👁️'}
    </button>
  )

  return (
    <div className="min-h-screen flex items-stretch overflow-hidden
                    bg-cream-50 dark:bg-walnut-900">

      {/* ── Side panel ─────────────────────────────────── */}
      <SidePanel />

      {/* ── Form panel ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center
                      px-4 sm:px-8 py-12 overflow-y-auto">

        <div className="w-full max-w-md animate-fade-up">

          {/* Logo (mobile only) */}
          <Link href="/" className="flex items-center gap-2.5 mb-10 group w-fit lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center
                            justify-center shadow-gold">
              <span className="text-cream-50 font-display font-bold text-xl">स</span>
            </div>
            <span className="font-display font-bold text-xl text-walnut-800
                             dark:text-cream-100">
              {APP_NAME}
            </span>
          </Link>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold text-walnut-900
                           dark:text-cream-100 mb-2">
              Create your account
            </h1>
            <p className="text-brown-400 dark:text-cream-400 text-sm">
              Already have one?{' '}
              <Link href="/login"
                    className="text-primary hover:text-primary-hover font-semibold
                               transition-colors">
                Sign in →
              </Link>
            </p>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step + 1} total={2} />

          {/* Google button */}
          {step === 0 && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3
                           rounded-xl border border-sand-300 dark:border-walnut-600
                           bg-white dark:bg-walnut-800/60
                           text-walnut-700 dark:text-cream-200
                           font-ui font-medium text-sm
                           hover:bg-sand-50 dark:hover:bg-walnut-700/60
                           hover:border-gold-300 transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed mb-1"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-gold-400
                                  border-t-transparent animate-spin" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Sign up with Google
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-sand-200 dark:bg-walnut-600/60" />
                <span className="text-xs font-ui text-brown-400 dark:text-cream-500">
                  or create with email
                </span>
                <div className="flex-1 h-px bg-sand-200 dark:bg-walnut-600/60" />
              </div>
            </>
          )}

          {/* ── STEP 0 — Personal Info ─────────────────── */}
          {step === 0 && (
            <div className="flex flex-col gap-4 animate-fade-right">
              <Field
                label="Full Name"
                placeholder="Priya Sharma"
                error={errors.displayName?.message}
                hint="Your real name or stage name"
                icon={<IconUser />}
                registration={register('displayName')}
              />

              <Field
                label="Username"
                placeholder="priyasings"
                error={errors.username?.message}
                icon={<IconAt />}
                below={<UsernameStatus state={usernameState} />}
                hint="Lowercase letters, numbers and _ only"
                registration={register('username')}
              />

              <button
                type="button"
                onClick={handleNext}
                disabled={usernameState === 'checking' || usernameState === 'taken'}
                className="btn-primary w-full py-3.5 text-base mt-2
                           flex items-center justify-center gap-2
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Continue
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          )}

          {/* ── STEP 1 — Credentials ───────────────────── */}
          {step === 1 && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-4 animate-fade-left"
            >
              {/* Back button */}
              <button
                type="button"
                onClick={() => setStep(0)}
                className="flex items-center gap-1.5 text-sm text-brown-400
                           hover:text-walnut-700 dark:hover:text-cream-200
                           transition-colors font-ui w-fit -mt-1 mb-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back
              </button>

              {/* Selected username display */}
              <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-gold flex items-center
                                justify-center flex-shrink-0 text-xs font-bold
                                text-cream-50 font-display">
                  {watch('displayName')?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-xs font-semibold text-walnut-800 dark:text-cream-100 font-ui">
                    {watch('displayName')}
                  </p>
                  <p className="text-xs text-brown-400 dark:text-cream-500 font-ui">
                    @{watch('username')}
                  </p>
                </div>
                <span className="ml-auto text-xs text-success">✓ Available</span>
              </div>

              <Field
                label="Email address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                icon={<IconEmail />}
                registration={register('email')}
              />

              <Field
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                error={errors.password?.message}
                icon={<IconLock />}
                rightEl={
                  <EyeToggle
                    show={showPassword}
                    onToggle={() => setShowPassword(v => !v)}
                    label={showPassword ? 'Hide password' : 'Show password'}
                  />
                }
                below={<PasswordStrengthBar password={passwordValue} />}
                registration={register('password')}
              />

              <Field
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repeat your password"
                error={errors.confirmPassword?.message}
                icon={<IconLock />}
                rightEl={
                  <EyeToggle
                    show={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword(v => !v)}
                    label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  />
                }
                registration={register('confirmPassword')}
              />

              {/* Terms checkbox */}
              <div className="flex items-start gap-3 mt-1">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  {...register('agreeToTerms')}
                  className="mt-0.5 w-4 h-4 rounded border-sand-300
                             accent-gold-600 cursor-pointer flex-shrink-0"
                />
                <label htmlFor="agreeToTerms"
                       className="text-xs text-brown-400 dark:text-cream-500
                                  font-ui leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <a href="/terms"   className="text-primary hover:underline font-medium">
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </a>
                  . I understand my data will be processed securely.
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-xs text-error font-ui -mt-2 animate-fade-down">
                  ⚠ {errors.agreeToTerms.message}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={formLoading}
                className="btn-primary w-full py-3.5 text-base
                           flex items-center justify-center gap-2 mt-1
                           disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {formLoading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-cream-200/50
                                    border-t-cream-50 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    🎵 Create My Account
                  </>
                )}
              </button>

              {/* Free plan note */}
              <p className="text-center text-xs text-brown-400 dark:text-cream-600">
                ✓ Free forever &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Cancel anytime
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
