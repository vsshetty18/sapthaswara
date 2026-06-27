/* ============================================================
   SVARAVERSE AI — Forgot Password Page
   Email form + Success state + Resend countdown timer
   ============================================================ */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useAuth } from '@/context/AuthContext'
import { APP_NAME } from '@/lib/constants'

// ─── SCHEMA ──────────────────────────────────────────────────────────────────

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotFormData = z.infer<typeof forgotSchema>

// ─── COUNTDOWN HOOK ──────────────────────────────────────────────────────────

function useCountdown(seconds: number) {
  const [count,    setCount]    = useState(0)
  const [running,  setRunning]  = useState(false)
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = () => {
    setCount(seconds)
    setRunning(true)
  }

  useEffect(() => {
    if (!running) return

    intervalRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          setRunning(false)
          clearInterval(intervalRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current!)
  }, [running])

  return { count, running, start }
}

// ─── EMAIL SENT ILLUSTRATION ─────────────────────────────────────────────────

function EmailSentIllustration() {
  return (
    <div className="relative flex items-center justify-center w-32 h-32 mx-auto">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gold-100 dark:bg-gold-900/20
                      animate-pulse-gold" />

      {/* Icon container */}
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br
                      from-gold-200 to-gold-400 dark:from-gold-700 dark:to-gold-500
                      flex items-center justify-center shadow-gold-lg
                      animate-bounce-in">
        {/* Envelope SVG */}
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          {/* Envelope body */}
          <rect x="4" y="10" width="36" height="26" rx="3"
                fill="rgba(253,250,244,0.95)" stroke="rgba(180,83,9,0.3)"
                strokeWidth="1.5" />
          {/* Envelope flap open */}
          <path d="M4 13 L22 24 L40 13"
                stroke="#B45309" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                fill="none" />
          {/* Lines (content hint) */}
          <line x1="12" y1="29" x2="22" y2="29"
                stroke="rgba(180,83,9,0.3)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="33" x2="32" y2="33"
                stroke="rgba(180,83,9,0.2)" strokeWidth="1.5" strokeLinecap="round" />

          {/* Flying paper plane (small) */}
          <g transform="translate(26, 6) rotate(-30)">
            <path d="M0 6 L12 0 L8 12 L5 8 Z"
                  fill="#F59E0B" opacity="0.9" />
            <path d="M5 8 L8 12 L6 9 Z"
                  fill="#B45309" opacity="0.8" />
          </g>

          {/* Sparkles */}
          <circle cx="8"  cy="8"  r="1.5" fill="#F59E0B" opacity="0.7" />
          <circle cx="36" cy="8"  r="1"   fill="#F59E0B" opacity="0.5" />
          <circle cx="38" cy="18" r="1.5" fill="#F59E0B" opacity="0.6" />
        </svg>
      </div>

      {/* Orbiting dots */}
      {[0, 120, 240].map((deg, i) => (
        <div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full bg-gold-400 animate-spin-slow"
          style={{
            top:       '50%',
            left:      '50%',
            transform: `rotate(${deg}deg) translateX(52px) translateY(-50%)`,
            opacity:   0.6 - i * 0.1,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  )
}

// ─── MUSIC DECORATION ────────────────────────────────────────────────────────

function MusicDecoration() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating notes */}
      {[
        { symbol: '♪', top: '10%', left: '5%',  size: '1.5rem', delay: '0s',   dur: '4s'   },
        { symbol: '♫', top: '20%', right: '8%', size: '1.2rem', delay: '0.5s', dur: '5s'   },
        { symbol: '♩', top: '70%', left: '8%',  size: '1.8rem', delay: '1s',   dur: '4.5s' },
        { symbol: '♬', top: '80%', right: '6%', size: '1.4rem', delay: '1.5s', dur: '3.5s' },
        { symbol: '𝄞', top: '45%', left: '3%',  size: '2rem',   delay: '0.8s', dur: '6s'   },
      ].map((n, i) => (
        <span
          key={i}
          className="absolute text-gold-400/25 dark:text-gold-500/15 animate-float
                     select-none"
          style={{
            top:               n.top,
            left:              n.left,
            right:             n.right,
            fontSize:          n.size,
            animationDelay:    n.delay,
            animationDuration: n.dur,
          }}
          aria-hidden="true"
        >
          {n.symbol}
        </span>
      ))}

      {/* Subtle tanpura strings */}
      {[15, 85].map((left, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px"
          style={{
            left:       `${left}%`,
            background: 'linear-gradient(to bottom, transparent, rgba(180,83,9,0.1) 30%, rgba(245,158,11,0.15) 50%, rgba(180,83,9,0.1) 70%, transparent)',
          }}
        />
      ))}
    </div>
  )
}

// ─── SUCCESS STATE ────────────────────────────────────────────────────────────

function SuccessState({
  email,
  onResend,
  resendCount,
  resendRunning,
  isResending,
}: {
  email:         string
  onResend:      () => void
  resendCount:   number
  resendRunning: boolean
  isResending:   boolean
}) {
  return (
    <div className="flex flex-col items-center text-center animate-fade-up">

      {/* Illustration */}
      <EmailSentIllustration />

      {/* Text */}
      <div className="mt-8 mb-6">
        <h2 className="font-display text-2xl font-bold text-walnut-900
                       dark:text-cream-100 mb-3">
          Check your inbox!
        </h2>
        <p className="text-sm text-brown-400 dark:text-cream-400 leading-relaxed max-w-xs">
          We sent a password reset link to
        </p>
        <p className="text-sm font-semibold font-ui text-walnut-700
                      dark:text-gold-400 mt-1 break-all">
          {email}
        </p>
        <p className="text-sm text-brown-400 dark:text-cream-400 mt-2">
          Click the link in the email to reset your password.
        </p>
      </div>

      {/* Tips */}
      <div className="w-full glass rounded-2xl p-4 mb-6 text-left">
        <p className="text-xs font-semibold font-ui text-walnut-700
                      dark:text-gold-400 mb-2 uppercase tracking-wide">
          Didn&apos;t receive it?
        </p>
        <ul className="flex flex-col gap-1.5">
          {[
            'Check your spam or junk folder',
            'Make sure the email address is correct',
            'Wait a few minutes and check again',
            'Try resending the email below',
          ].map(tip => (
            <li key={tip}
                className="text-xs text-brown-400 dark:text-cream-500
                           font-ui flex items-start gap-2">
              <span className="text-gold-500 mt-0.5 flex-shrink-0">›</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Resend button */}
      <button
        onClick={onResend}
        disabled={resendRunning || isResending}
        className="w-full btn-ghost py-3 text-sm flex items-center
                   justify-center gap-2 disabled:opacity-60
                   disabled:cursor-not-allowed mb-4"
      >
        {isResending ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-walnut-400
                            border-t-transparent animate-spin" />
            Sending...
          </>
        ) : resendRunning ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            Resend in {resendCount}s
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2">
              <polyline points="1,4 1,10 7,10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.53" />
            </svg>
            Resend email
          </>
        )}
      </button>

      {/* Back to login */}
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm font-ui font-medium
                   text-primary hover:text-primary-hover transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Sign In
      </Link>
    </div>
  )
}

// ─── FORGOT PASSWORD PAGE ────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const { forgotPassword }                             = useAuth()
  const [isLoading,   setIsLoading]                   = useState(false)
  const [isResending, setIsResending]                 = useState(false)
  const [submitted,   setSubmitted]                   = useState(false)
  const [sentEmail,   setSentEmail]                   = useState('')
  const { count: resendCount, running: resendRunning, start: startCountdown } = useCountdown(60)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver:      zodResolver(forgotSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotFormData) => {
    try {
      setIsLoading(true)
      await forgotPassword(data.email)
      setSentEmail(data.email)
      setSubmitted(true)
      startCountdown()
    } catch {
      // Error handled in context
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendRunning || isResending) return
    try {
      setIsResending(true)
      await forgotPassword(sentEmail)
      startCountdown()
    } catch {
      // handled in context
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero dark:bg-gradient-premium
                    flex items-center justify-center px-4 py-12 relative">

      {/* Music decoration */}
      <MusicDecoration />

      <div className="w-full max-w-md relative z-10">

        {/* Card */}
        <div className="card-premium px-8 py-10 animate-fade-up">

          {/* Logo */}
          <Link href="/"
                className="flex items-center gap-2.5 mb-8 group w-fit">
            <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center
                            justify-center shadow-gold group-hover:shadow-glow
                            transition-all duration-300">
              <span className="text-cream-50 font-display font-bold text-xl">स</span>
            </div>
            <span className="font-display font-bold text-lg text-walnut-800
                             dark:text-cream-100">
              {APP_NAME}
            </span>
          </Link>

          {/* ── Success state ─────────────────────────── */}
          {submitted ? (
            <SuccessState
              email={sentEmail}
              onResend={handleResend}
              resendCount={resendCount}
              resendRunning={resendRunning}
              isResending={isResending}
            />
          ) : (

            /* ── Form state ───────────────────────────── */
            <div className="animate-fade-up">

              {/* Lock icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br
                              from-gold-100 to-gold-200 dark:from-gold-800/40
                              dark:to-gold-700/30 flex items-center justify-center
                              mb-6 shadow-sm">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                     stroke="#B45309" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  <circle cx="12" cy="16" r="1" fill="#B45309" />
                </svg>
              </div>

              {/* Heading */}
              <h1 className="font-display text-2xl font-bold text-walnut-900
                             dark:text-cream-100 mb-2">
                Forgot your password?
              </h1>
              <p className="text-sm text-brown-400 dark:text-cream-400 mb-8
                            leading-relaxed">
                No worries! Enter your email address and we&apos;ll send you
                a link to reset your password.
              </p>

              {/* Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="flex flex-col gap-4"
              >
                {/* Email field */}
                <div className="flex flex-col gap-1.5">
                  <label className="form-label">Email address</label>
                  <div className="relative">
                    {/* Icon */}
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2
                                    text-brown-400 dark:text-cream-500 pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4
                                 c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      {...register('email')}
                      className={`
                        form-input w-full pl-10
                        dark:bg-walnut-800/60 dark:border-walnut-600/60
                        dark:text-cream-100 dark:placeholder-cream-600
                        ${errors.email ? 'error' : ''}
                      `}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-error font-ui flex items-center
                                  gap-1 animate-fade-down">
                      <span>⚠</span> {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-3.5 text-base
                             flex items-center justify-center gap-2 mt-1
                             disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2
                                      border-cream-200/50 border-t-cream-50
                                      animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <svg width="16" height="16" viewBox="0 0 24 24"
                           fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="h-px bg-sand-200 dark:bg-walnut-700/60 my-6" />

              {/* Back + Sign up links */}
              <div className="flex flex-col gap-3 text-center">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1.5
                             text-sm font-ui font-medium text-primary
                             hover:text-primary-hover transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back to Sign In
                </Link>

                <p className="text-xs text-brown-400 dark:text-cream-600">
                  Don&apos;t have an account?{' '}
                  <Link href="/signup"
                        className="text-primary hover:text-primary-hover
                                   font-semibold transition-colors">
                    Sign up free →
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-brown-400 dark:text-cream-600
                      mt-6 flex items-center justify-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Your account is secured with Firebase Authentication
        </p>
      </div>
    </div>
  )
         }
