/* ============================================================
   SVARAVERSE AI — Landing Page
   Premium hero + all marketing sections
   ============================================================ */

'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { APP_NAME, PRICING_PLANS, MOTIVATIONAL_QUOTES } from '@/lib/constants'

// ─── MUSIC WAVE ANIMATION ────────────────────────────────────────────────────

function MusicWave({ className = '' }: { className?: string }) {
  return (
    <div className={`music-wave ${className}`}>
      {Array.from({ length: 11 }).map((_, i) => (
        <div key={i} className="bar" />
      ))}
    </div>
  )
}

// ─── FLOATING NOTA (musical note decoration) ─────────────────────────────────

function FloatingNota({
  style,
  symbol,
}: {
  style: React.CSSProperties
  symbol: string
}) {
  return (
    <span
      className="absolute select-none pointer-events-none opacity-20 text-gold-500
                 dark:opacity-10 animate-float"
      style={style}
      aria-hidden="true"
    >
      {symbol}
    </span>
  )
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────

function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing',  href: '#pricing' },
    { label: 'Reviews',  href: '#testimonials' },
    { label: 'FAQ',      href: '#faq' },
  ]

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-400
        ${scrolled
          ? 'glass border-b border-sand-200/60 shadow-warm py-3'
          : 'bg-transparent py-5'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center
                          justify-center shadow-gold group-hover:shadow-glow
                          transition-all duration-300">
            <span className="text-cream-50 font-display font-bold text-lg">स</span>
          </div>
          <span className="font-display font-bold text-xl text-walnut-800
                           dark:text-cream-200 tracking-tight">
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium font-ui text-brown-500
                         dark:text-cream-300 hover:text-walnut-700 dark:hover:text-gold-300
                         rounded-xl hover:bg-sand-100/60 dark:hover:bg-walnut-800/40
                         transition-all duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-primary text-sm px-5 py-2.5"
            >
              Go to Dashboard →
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-ghost text-sm px-5 py-2.5"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="btn-primary text-sm px-5 py-2.5"
              >
                Start Free →
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center
                     gap-1.5 rounded-xl hover:bg-sand-100 dark:hover:bg-walnut-800
                     transition-colors"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-walnut-700 dark:bg-cream-200
                            transition-all duration-300
                            ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-walnut-700 dark:bg-cream-200
                            transition-all duration-300
                            ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-walnut-700 dark:bg-cream-200
                            transition-all duration-300
                            ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-sand-200/60 px-4 py-4
                        flex flex-col gap-2 animate-fade-down">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 text-sm font-medium font-ui text-walnut-700
                         dark:text-cream-200 rounded-xl hover:bg-sand-100/80
                         dark:hover:bg-walnut-800/60 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-2 pt-2 border-t border-sand-200/60">
            <Link href="/login"  className="btn-ghost  flex-1 text-sm text-center py-2.5">Sign In</Link>
            <Link href="/signup" className="btn-primary flex-1 text-sm text-center py-2.5">Start Free</Link>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── HERO SECTION ────────────────────────────────────────────────────────────

function HeroSection() {
  const [quoteIdx, setQuoteIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIdx(i => (i + 1) % MOTIVATIONAL_QUOTES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const floatingSymbols = [
    { symbol: '♩', style: { top: '15%', left:  '8%',  fontSize: '2.5rem', animationDelay: '0s',    animationDuration: '5s'  } },
    { symbol: '♪', style: { top: '25%', right: '10%', fontSize: '2rem',   animationDelay: '1s',    animationDuration: '4s'  } },
    { symbol: '♫', style: { top: '60%', left:  '5%',  fontSize: '3rem',   animationDelay: '0.5s',  animationDuration: '6s'  } },
    { symbol: '♬', style: { top: '70%', right: '7%',  fontSize: '2.5rem', animationDelay: '1.5s',  animationDuration: '5s'  } },
    { symbol: '𝄞', style: { top: '40%', left:  '3%',  fontSize: '3.5rem', animationDelay: '2s',    animationDuration: '7s'  } },
    { symbol: '♩', style: { top: '80%', right: '15%', fontSize: '1.8rem', animationDelay: '0.8s',  animationDuration: '4.5s'} },
  ]

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center
                        overflow-hidden bg-gradient-hero dark:bg-gradient-premium
                        px-4 pt-24 pb-16">

      {/* Background texture */}
      <div className="absolute inset-0 bg-texture-strings opacity-60
                      dark:opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-texture-tabla pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[600px] h-[600px] rounded-full
                      bg-radial-gradient opacity-30 dark:opacity-10
                      blur-3xl pointer-events-none" />

      {/* Floating music symbols */}
      {floatingSymbols.map((s, i) => (
        <FloatingNota key={i} symbol={s.symbol} style={s.style} />
      ))}

      {/* Badge */}
      <div className="animate-fade-down mb-6">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                         bg-gold-100/80 dark:bg-gold-900/30 border border-gold-300/60
                         dark:border-gold-600/30 text-gold-dark text-xs font-semibold
                         font-ui tracking-wide uppercase backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
          AI-Powered Indian Music Creator Platform
        </span>
      </div>

      {/* Headline */}
      <h1 className="animate-fade-up font-display text-center text-walnut-900
                     dark:text-cream-100 max-w-4xl mx-auto mb-6"
          style={{ animationDelay: '0.1s' }}>
        Your Complete
        <span className="block text-gradient-gold">Music Creator OS</span>
        Powered by AI
      </h1>

      {/* Sub-headline */}
      <p className="animate-fade-up text-center text-brown-500 dark:text-cream-300/80
                    text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed font-body"
         style={{ animationDelay: '0.2s' }}>
        Practice smarter. Grow faster. Create better. — Built for Indian singers,
        playback aspirants, and music creators.
      </p>

      {/* Rotating motivational quote */}
      <div className="animate-fade-up mb-10 h-8 overflow-hidden"
           style={{ animationDelay: '0.3s' }}>
        <p key={quoteIdx}
           className="text-center text-sm text-gold-dark dark:text-gold-300
                      font-ui italic animate-fade-up">
          &ldquo;{MOTIVATIONAL_QUOTES[quoteIdx].quote}&rdquo;
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="animate-fade-up flex flex-col sm:flex-row gap-3 mb-14"
           style={{ animationDelay: '0.35s' }}>
        <Link
          href="/signup"
          className="btn-primary text-base px-8 py-3.5 text-center
                     shadow-gold-lg hover:shadow-glow"
        >
          🎵 Start for Free
        </Link>
        <a
          href="#features"
          className="btn-ghost text-base px-8 py-3.5 text-center"
        >
          See How It Works →
        </a>
      </div>

      {/* Music wave + stats row */}
      <div className="animate-fade-up w-full max-w-3xl mx-auto"
           style={{ animationDelay: '0.4s' }}>

        {/* Wave */}
        <div className="flex justify-center mb-10">
          <MusicWave className="scale-150" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '10,000+', label: 'Creators',          icon: '🎤' },
            { value: '5 Lakhs+', label: 'Songs Practiced',  icon: '🎵' },
            { value: '98%',      label: 'Growth Rate',       icon: '📈' },
            { value: '4.9 ⭐',   label: 'App Rating',        icon: '🏆' },
          ].map(stat => (
            <div key={stat.label}
                 className="card-premium text-center p-4 flex flex-col
                            items-center gap-1">
              <span className="text-2xl">{stat.icon}</span>
              <span className="font-display font-bold text-xl text-walnut-800
                               dark:text-cream-100">
                {stat.value}
              </span>
              <span className="text-xs font-ui text-brown-400 dark:text-cream-400">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2
                      flex flex-col items-center gap-1 animate-bounce opacity-50">
        <span className="text-xs font-ui text-brown-400">Scroll</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 10l6 6 6-6"
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
                className="text-brown-400" />
        </svg>
      </div>
    </section>
  )
}

// ─── FEATURES SECTION ────────────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    {
      icon:  '🎵',
      title: 'Smart Song Library',
      desc:  'Organize your entire repertoire with tags, scales, moods, languages, difficulty levels, and practice status.',
      color: 'from-gold-100 to-sand-200',
    },
    {
      icon:  '🤖',
      title: 'AI Music Coach',
      desc:  'Get personalized suggestions for what to practice, which song to post, best hashtags, captions, and reel ideas.',
      color: 'from-amber-100 to-orange-100',
    },
    {
      icon:  '📊',
      title: 'Creator Analytics',
      desc:  'Track your Instagram, YouTube, practice hours, growth, engagement, and performance score in one place.',
      color: 'from-green-50 to-emerald-100',
    },
    {
      icon:  '📅',
      title: 'Daily Planner',
      desc:  'Plan your practice, recording, editing, posting and networking sessions with progress tracking.',
      color: 'from-blue-50 to-sky-100',
    },
    {
      icon:  '🏆',
      title: 'Milestone Celebrations',
      desc:  'Beautiful confetti and badge animations when you hit 100 followers, 7-day streak, 100 songs, and more.',
      color: 'from-purple-50 to-violet-100',
    },
    {
      icon:  '🎨',
      title: 'AI Poster Generator',
      desc:  'Generate stunning Instagram posts, stories, YouTube thumbnails, and album covers from your songs.',
      color: 'from-pink-50 to-rose-100',
    },
    {
      icon:  '🔔',
      title: 'Smart Reminders',
      desc:  'Never miss a practice session, live stream, collaboration, studio booking, or festival with push notifications.',
      color: 'from-yellow-50 to-amber-100',
    },
    {
      icon:  '👥',
      title: 'Creator Community',
      desc:  'Connect with singers, music directors, teachers and studios. Collaborate, follow, and grow together.',
      color: 'from-teal-50 to-cyan-100',
    },
    {
      icon:  '🔥',
      title: 'Streak Tracker',
      desc:  'Build powerful daily practice habits with visual streaks, flame animations, and consistency scores.',
      color: 'from-red-50 to-orange-100',
    },
  ]

  return (
    <section id="features" className="py-24 px-4 bg-cream-50 dark:bg-walnut-900">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="premium-badge mb-4 inline-block">Features</span>
          <h2 className="font-display text-walnut-900 dark:text-cream-100 mb-4">
            Everything a Creator Needs
          </h2>
          <p className="text-brown-400 dark:text-cream-400 max-w-2xl mx-auto text-lg">
            From riyaz to reels — SvaraVerse AI is your complete music career toolkit.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card-premium p-6 group hover:border-gold-300/60
                         dark:hover:border-gold-600/40 transition-all duration-300"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color}
                               flex items-center justify-center text-2xl mb-4
                               group-hover:scale-110 transition-transform duration-300
                               shadow-sm`}>
                {f.icon}
              </div>

              <h3 className="font-display text-lg font-semibold text-walnut-800
                             dark:text-cream-100 mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-brown-400 dark:text-cream-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── HOW IT WORKS ────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    { step: '01', icon: '📝', title: 'Create Your Profile',    desc: 'Sign up, set your musical scale, genres, and connect your Instagram & YouTube.' },
    { step: '02', icon: '🎵', title: 'Build Your Library',     desc: 'Add songs you are learning with details like mood, language, difficulty and lyrics.' },
    { step: '03', icon: '📅', title: 'Plan Your Day',          desc: 'Use the daily planner to schedule practice, recording, editing, and posting tasks.' },
    { step: '04', icon: '🤖', title: 'Ask Your AI Coach',      desc: 'Get personalized suggestions on what to practice, post, and how to grow faster.' },
    { step: '05', icon: '📈', title: 'Track Your Growth',      desc: 'Watch your analytics, streaks, and milestones grow every single day.' },
  ]

  return (
    <section className="py-24 px-4 bg-gradient-warm dark:bg-walnut-800/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="premium-badge mb-4 inline-block">How It Works</span>
          <h2 className="font-display text-walnut-900 dark:text-cream-100 mb-4">
            Start in 5 Simple Steps
          </h2>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-8 bottom-8 w-0.5
                          bg-gradient-to-b from-gold-300 via-gold-500 to-gold-300
                          hidden md:block" />

          <div className="flex flex-col gap-8">
            {steps.map((s, i) => (
              <div key={s.step}
                   className="flex gap-6 items-start group"
                   style={{ animationDelay: `${i * 0.1}s` }}>
                {/* Step number */}
                <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl
                                bg-gradient-gold flex items-center justify-center
                                shadow-gold group-hover:shadow-glow
                                transition-all duration-300 z-10">
                  <span className="text-cream-50 font-display font-bold text-lg">
                    {s.step}
                  </span>
                </div>

                {/* Content */}
                <div className="card-premium flex-1 p-5 flex items-start gap-4
                                group-hover:border-gold-300/50 transition-all duration-300">
                  <span className="text-3xl flex-shrink-0">{s.icon}</span>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-walnut-800
                                   dark:text-cream-100 mb-1">
                      {s.title}
                    </h3>
                    <p className="text-sm text-brown-400 dark:text-cream-400 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── PRICING SECTION ─────────────────────────────────────────────────────────

function PricingSection() {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="py-24 px-4 bg-cream-50 dark:bg-walnut-900">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="premium-badge mb-4 inline-block">Pricing</span>
          <h2 className="font-display text-walnut-900 dark:text-cream-100 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-brown-400 dark:text-cream-400 mb-8">
            Start free, upgrade when you are ready to grow faster.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 glass px-4 py-2 rounded-2xl">
            <span className={`text-sm font-ui font-medium transition-colors
                              ${!yearly ? 'text-walnut-800 dark:text-cream-100' : 'text-brown-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setYearly(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300
                          ${yearly ? 'bg-gold-500' : 'bg-sand-300 dark:bg-walnut-600'}`}
              aria-label="Toggle yearly billing"
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white
                                shadow-sm transition-transform duration-300
                                ${yearly ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-ui font-medium transition-colors
                              ${yearly ? 'text-walnut-800 dark:text-cream-100' : 'text-brown-400'}`}>
              Yearly
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700
                               text-xs font-bold">
                Save 30%
              </span>
            </span>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative card-premium p-6 flex flex-col
                ${plan.popular
                  ? 'border-gold-400/70 dark:border-gold-500/50 shadow-gold-lg scale-[1.02]'
                  : ''
                }
              `}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="premium-badge text-xs px-3 py-1">
                    ⭐ {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-bold text-xl text-walnut-800
                                 dark:text-cream-100">
                    {plan.name}
                  </h3>
                  {plan.badge && !plan.popular && (
                    <span className="text-xs font-ui font-semibold text-gold-dark
                                     bg-gold-100 dark:bg-gold-900/30 px-2 py-0.5 rounded-full">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-brown-400 dark:text-cream-400">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-bold text-walnut-800
                                   dark:text-cream-100">
                    {plan.currency}
                    {yearly
                      ? Math.round(plan.priceYearly / 12)
                      : plan.price
                    }
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-brown-400">/month</span>
                  )}
                </div>
                {yearly && plan.priceYearly > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                    ₹{plan.priceYearly}/year billed annually
                  </p>
                )}
                {plan.price === 0 && (
                  <p className="text-xs text-brown-400 mt-0.5">Forever free</p>
                )}
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-gold-500 mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-brown-500 dark:text-cream-300">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/signup"
                className={`
                  text-center text-sm font-semibold font-ui py-2.5 px-4 rounded-xl
                  transition-all duration-200
                  ${plan.popular
                    ? 'btn-primary shadow-gold'
                    : 'btn-ghost'
                  }
                `}
              >
                {plan.price === 0 ? 'Get Started Free' : `Get ${plan.name}`}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-brown-400 dark:text-cream-500 mt-8">
          All plans include a 7-day free trial. No credit card required to start.
          Payments powered by Razorpay 🔒
        </p>
      </div>
    </section>
  )
}

// ─── TESTIMONIALS ────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const testimonials = [
    {
      name:   'Priya Sharma',
      handle: '@priyasings',
      role:   'Playback Aspirant, Mumbai',
      avatar: '🎤',
      text:   'SvaraVerse changed how I practice. The AI coach suggested I post covers on Tuesday evenings — my views doubled in a month!',
      stars:  5,
    },
    {
      name:   'Arjun Mehta',
      handle: '@arjunmelody',
      role:   'YouTube Creator, Delhi',
      avatar: '🎵',
      text:   'The streak tracker keeps me consistent. 120 days straight of riyaz and my voice has improved so much. The milestone celebrations are so motivating!',
      stars:  5,
    },
    {
      name:   'Kavitha Nair',
      handle: '@kavitha_carnatic',
      role:   'Carnatic Singer, Bangalore',
      avatar: '🎶',
      text:   'Finally an app that understands Indian music! The raga library, scale tracking, and Kannada language support is perfect for me.',
      stars:  5,
    },
    {
      name:   'Rohit Verma',
      handle: '@rohit_beats',
      role:   'Music Creator, Pune',
      avatar: '🥁',
      text:   'The AI poster generator saves me 2 hours every week. I just upload my song and get a beautiful Instagram post ready to go.',
      stars:  5,
    },
    {
      name:   'Sneha Patel',
      handle: '@snehavocals',
      role:   'Instagram Creator, Ahmedabad',
      avatar: '🌟',
      text:   'Went from 200 to 5000 Instagram followers in 3 months using the AI suggestions. The analytics integration is a game changer.',
      stars:  5,
    },
    {
      name:   'Vikram Singh',
      handle: '@vikramraaga',
      role:   'Hindustani Vocalist, Varanasi',
      avatar: '🎼',
      text:   'The community feature helped me find a tabla player for my first collaboration. This platform truly understands a musician\'s journey.',
      stars:  5,
    },
  ]

  return (
    <section id="testimonials" className="py-24 px-4 bg-gradient-warm dark:bg-walnut-800/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="premium-badge mb-4 inline-block">Testimonials</span>
          <h2 className="font-display text-walnut-900 dark:text-cream-100 mb-4">
            Loved by Indian Creators
          </h2>
          <p className="text-brown-400 dark:text-cream-400">
            Join thousands of singers and creators growing with SvaraVerse AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={t.handle}
              className="card-premium p-6 flex flex-col gap-4"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <span key={j} className="text-gold-500 text-sm">★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-brown-500 dark:text-cream-300 leading-relaxed flex-1">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-sand-200/60
                              dark:border-walnut-600/40">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-200
                                to-gold-400 dark:from-gold-700 dark:to-gold-500
                                flex items-center justify-center text-xl flex-shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold font-ui text-walnut-800
                                dark:text-cream-100">
                    {t.name}
                  </p>
                  <p className="text-xs text-brown-400 dark:text-cream-500">
                    {t.handle} · {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ SECTION ─────────────────────────────────────────────────────────────

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  const faqs = [
    {
      q: 'Is SvaraVerse AI free to use?',
      a: 'Yes! Our Starter plan is completely free with 25 songs, 5 daily AI messages, and basic analytics. You can upgrade anytime to unlock more features.',
    },
    {
      q: 'Which Indian languages are supported?',
      a: 'We support Hindi, Marathi, Bengali, Tamil, Telugu, Kannada, Gujarati, Punjabi, Malayalam, Bhojpuri, Rajasthani, and English — with more coming soon.',
    },
    {
      q: 'Does it work for classical and Bollywood singers both?',
      a: 'Absolutely! SvaraVerse AI is built for all Indian music styles — Hindustani Classical, Carnatic, Bollywood playback, folk, Ghazal, Sufi, and more.',
    },
    {
      q: 'How does the AI Coach work?',
      a: 'Our AI Coach is powered by OpenAI and is trained to understand your music profile, song library, growth data, and social media performance. It gives personalized suggestions for practice, content, and career growth.',
    },
    {
      q: 'Can I connect my Instagram and YouTube?',
      a: 'Yes! Enter your Instagram handle and YouTube channel URL to see your follower count, growth trends, engagement rates, and AI-powered recommendations.',
    },
    {
      q: 'Is my data safe and private?',
      a: 'Yes. We use Firebase for secure authentication and storage. Your songs, analytics, and personal data are encrypted and never shared with third parties.',
    },
    {
      q: 'What payment methods are accepted?',
      a: 'We use Razorpay for payments — supporting UPI, Net Banking, Credit/Debit cards, and all major Indian wallets.',
    },
    {
      q: 'Can I cancel my subscription anytime?',
      a: 'Yes, you can cancel anytime from Settings → Billing. Your premium access continues until the end of the billing period.',
    },
  ]

  return (
    <section id="faq" className="py-24 px-4 bg-cream-50 dark:bg-walnut-900">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="premium-badge mb-4 inline-block">FAQ</span>
          <h2 className="font-display text-walnut-900 dark:text-cream-100 mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`card-premium overflow-hidden transition-all duration-300
                          ${openIdx === i ? 'border-gold-300/60 dark:border-gold-600/40' : ''}`}
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between gap-4
                           px-6 py-4 text-left"
              >
                <span className="font-ui font-medium text-walnut-800
                                 dark:text-cream-100 text-sm">
                  {faq.q}
                </span>
                <span className={`text-gold-500 flex-shrink-0 transition-transform duration-300
                                  ${openIdx === i ? 'rotate-45' : 'rotate-0'}`}>
                  ✦
                </span>
              </button>

              {openIdx === i && (
                <div className="px-6 pb-5 animate-fade-down">
                  <p className="text-sm text-brown-400 dark:text-cream-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── DOWNLOAD / CTA SECTION ──────────────────────────────────────────────────

function DownloadSection() {
  return (
    <section className="py-24 px-4 bg-gradient-premium relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full
                      bg-gold-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full
                      bg-gold-700/10 blur-2xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="mb-6">
          <MusicWave className="justify-center mb-8" />
        </div>

        <h2 className="font-display text-cream-50 mb-4 text-4xl md:text-5xl">
          Start Your Musical
          <span className="block text-gradient-gold">Journey Today</span>
        </h2>

        <p className="text-cream-200/70 text-lg mb-10 max-w-xl mx-auto">
          Join 10,000+ Indian creators who are practicing smarter,
          growing faster, and creating better with SvaraVerse AI.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/signup"
            className="btn-primary text-base px-8 py-4 shadow-gold-lg hover:shadow-glow"
          >
            🎵 Start Free — No Credit Card
          </Link>
        </div>

        {/* App download badges */}
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { label: '📱 Download on App Store',       sub: 'iOS — Coming Soon' },
            { label: '🤖 Get it on Google Play',       sub: 'Android — Coming Soon' },
          ].map(app => (
            <button
              key={app.label}
              className="glass-premium flex items-center gap-3 px-5 py-3
                         rounded-2xl border border-gold-600/30 cursor-not-allowed
                         opacity-70"
              disabled
              title="App coming soon"
            >
              <div className="text-left">
                <p className="text-cream-100 text-sm font-semibold font-ui">
                  {app.label}
                </p>
                <p className="text-cream-400 text-xs">{app.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    Product:  ['Features', 'Pricing', 'AI Coach', 'Analytics', 'Community'],
    Company:  ['About Us', 'Blog', 'Careers', 'Press', 'Contact'],
    Support:  ['Help Center', 'Privacy Policy', 'Terms of Service', 'Refund Policy'],
    Connect:  ['Instagram', 'YouTube', 'Twitter', 'LinkedIn'],
  }

  return (
    <footer className="bg-walnut-900 dark:bg-coffee-700 border-t border-walnut-700/40 px-4 py-16">
      <div className="max-w-7xl mx-auto">

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center
                              justify-center shadow-gold">
                <span className="text-cream-50 font-display font-bold text-lg">स</span>
              </div>
              <span className="font-display font-bold text-xl text-cream-100">
                {APP_NAME}
              </span>
            </div>
            <p className="text-sm text-cream-400 leading-relaxed max-w-xs mb-4">
              The complete AI-powered operating system for Indian singers,
              playback aspirants, and music creators.
            </p>
            <div className="music-wave scale-75 origin-left opacity-60">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="bar" />
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-cream-200 font-ui font-semibold text-sm mb-4
                             uppercase tracking-wider">
                {category}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {items.map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-cream-500 hover:text-gold-400
                                 transition-colors duration-200"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-walnut-700/60 mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream-600">
            © {currentYear} {APP_NAME}. All rights reserved.
            Made with ❤️ for Indian Music Creators.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-cream-600">
              🇮🇳 Proudly Made in India
            </span>
            <span className="text-xs text-cream-600">
              Payments by Razorpay 🔒
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── MAIN LANDING PAGE ───────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <DownloadSection />
      <Footer />
    </>
  )
}
