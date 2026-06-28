/* ============================================================
   SVARAVERSE AI — Main Dashboard Page
   Stats | Streak | Growth | AI Insights | Planner | Quote
   ============================================================ */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import {
  Music, Clock, Flame, TrendingUp, Upload,
  Users, Eye, Star, ChevronRight, Plus,
  Sparkles, Target, CheckCircle2, Circle,
  Calendar, Bot, Trophy, ArrowUpRight,
  PlayCircle, Mic2, BarChart3,
} from 'lucide-react'

import DashboardLayout   from '@/components/layout/DashboardLayout'
import { useAuth }       from '@/context/AuthContext'
import { MOTIVATIONAL_QUOTES, API_ENDPOINTS } from '@/lib/constants'
import { SubscriptionPlan }  from '@/types'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface StatCardProps {
  title:      string
  value:      string | number
  subtitle?:  string
  icon:       React.ElementType
  iconColor:  string
  iconBg:     string
  trend?:     { value: number; label: string }
  href?:      string
  animate?:   boolean
}

interface DailyTask {
  id:        string
  title:     string
  type:      string
  status:    'pending' | 'completed' | 'in_progress'
  duration?: number
}

// ─── ANIMATED COUNTER ────────────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) return
    let start     = 0
    const step    = target / (duration / 16)
    const timer   = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return count
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────

function StatCard({
  title, value, subtitle, icon: Icon,
  iconColor, iconBg, trend, href, animate,
}: StatCardProps) {
  const numValue  = typeof value === 'number' ? value : 0
  const displayed = animate ? useAnimatedCounter(numValue) : value

  const Card = (
    <div className={`
      stat-card group relative overflow-hidden
      ${href ? 'cursor-pointer hover:border-gold-300/50 dark:hover:border-gold-600/40' : ''}
    `}>
      {/* Background glow */}
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full
                       ${iconBg} opacity-20 blur-2xl group-hover:opacity-30
                       transition-opacity duration-300`} />

      {/* Top row */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center
                         justify-center shadow-sm group-hover:scale-110
                         transition-transform duration-300`}>
          <Icon size={20} className={iconColor} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-ui font-semibold
                           px-2 py-0.5 rounded-full
                           ${trend.value >= 0
                             ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                             : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                           }`}>
            <ArrowUpRight
              size={12}
              className={trend.value < 0 ? 'rotate-90' : ''}
            />
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="relative z-10">
        <p className="font-display text-2xl font-bold text-walnut-800
                      dark:text-cream-100 leading-none mb-1">
          {displayed}
        </p>
        <p className="text-xs font-ui font-semibold text-brown-500
                      dark:text-cream-400 uppercase tracking-wide">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-brown-400 dark:text-cream-500 mt-0.5">
            {subtitle}
          </p>
        )}
        {trend && (
          <p className="text-xs text-brown-400 dark:text-cream-500 mt-0.5">
            {trend.label}
          </p>
        )}
      </div>

      {href && (
        <ChevronRight
          size={16}
          className="absolute bottom-4 right-4 text-brown-300
                     dark:text-cream-600 group-hover:text-primary
                     transition-colors duration-200"
        />
      )}
    </div>
  )

  return href ? <Link href={href}>{Card}</Link> : Card
}

// ─── STREAK WIDGET ───────────────────────────────────────────────────────────

function StreakWidget({ streak, longest }: { streak: number; longest: number }) {
  const pct = longest > 0 ? Math.min((streak / longest) * 100, 100) : 0

  // Last 7 days mock (in real app, fetched from analytics)
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const practiced = [true, true, true, false, true, true, streak > 0]

  return (
    <div className="card-premium p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/20
                          flex items-center justify-center">
            <Flame size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-ui font-bold uppercase tracking-wide
                          text-brown-500 dark:text-cream-400">
              Practice Streak
            </p>
          </div>
        </div>
        <Link href="/dashboard/analytics"
              className="text-xs text-primary hover:text-primary-hover
                         font-ui transition-colors">
          View all →
        </Link>
      </div>

      {/* Streak count */}
      <div className="flex items-end gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-5xl font-display font-bold text-walnut-800
                           dark:text-cream-100 leading-none streak-flame">
            {streak}
          </span>
          <span className="text-4xl">🔥</span>
        </div>
        <div className="mb-1">
          <p className="text-sm font-ui font-semibold text-brown-500
                        dark:text-cream-400">
            day streak
          </p>
          <p className="text-xs text-brown-400 dark:text-cream-500">
            Best: {longest} days
          </p>
        </div>
      </div>

      {/* Progress to longest */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-ui text-brown-400
                        dark:text-cream-500 mb-1.5">
          <span>Progress to personal best</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-2 bg-sand-200 dark:bg-walnut-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-red-500
                       rounded-full transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Last 7 days */}
      <div>
        <p className="text-xs font-ui text-brown-400 dark:text-cream-500 mb-2">
          Last 7 days
        </p>
        <div className="flex gap-1.5">
          {days.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`
                w-full aspect-square rounded-lg flex items-center justify-center
                transition-all duration-300
                ${practiced[i]
                  ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-sm'
                  : 'bg-sand-200 dark:bg-walnut-700/60'
                }
              `}>
                {practiced[i] && (
                  <span className="text-cream-50 text-xs">✓</span>
                )}
              </div>
              <span className="text-2xs font-ui text-brown-400
                               dark:text-cream-600">
                {day}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── GROWTH CHART ────────────────────────────────────────────────────────────

function GrowthChart() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')

  // Mock data — in real app fetched from API
  const weekData = [
    { day: 'Mon', followers: 1200, subscribers: 450, practice: 45 },
    { day: 'Tue', followers: 1230, subscribers: 460, practice: 60 },
    { day: 'Wed', followers: 1245, subscribers: 465, practice: 30 },
    { day: 'Thu', followers: 1280, subscribers: 475, practice: 75 },
    { day: 'Fri', followers: 1310, subscribers: 490, practice: 90 },
    { day: 'Sat', followers: 1350, subscribers: 510, practice: 120 },
    { day: 'Sun', followers: 1380, subscribers: 520, practice: 60 },
  ]

  const monthData = Array.from({ length: 30 }, (_, i) => ({
    day: `${i + 1}`,
    followers:   1000 + Math.floor(i * 15 + Math.random() * 20),
    subscribers: 400  + Math.floor(i * 4  + Math.random() * 8),
    practice:    Math.floor(30 + Math.random() * 90),
  }))

  const yearData = [
    { day: 'Jan', followers: 600,  subscribers: 200, practice: 40 },
    { day: 'Feb', followers: 750,  subscribers: 250, practice: 55 },
    { day: 'Mar', followers: 900,  subscribers: 310, practice: 60 },
    { day: 'Apr', followers: 1050, subscribers: 370, practice: 50 },
    { day: 'May', followers: 1150, subscribers: 410, practice: 70 },
    { day: 'Jun', followers: 1200, subscribers: 440, practice: 65 },
    { day: 'Jul', followers: 1280, subscribers: 460, practice: 80 },
    { day: 'Aug', followers: 1320, subscribers: 475, practice: 75 },
    { day: 'Sep', followers: 1350, subscribers: 490, practice: 85 },
    { day: 'Oct', followers: 1360, subscribers: 500, practice: 90 },
    { day: 'Nov', followers: 1370, subscribers: 510, practice: 95 },
    { day: 'Dec', followers: 1380, subscribers: 520, practice: 100},
  ]

  const data = period === 'week' ? weekData : period === 'month' ? monthData : yearData

  return (
    <div className="card-premium p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-semibold text-lg text-walnut-800
                         dark:text-cream-100">
            Growth Overview
          </h3>
          <p className="text-xs text-brown-400 dark:text-cream-500 font-ui">
            Followers & Subscribers
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-1 bg-sand-100 dark:bg-walnut-800/60
                        rounded-xl p-1">
          {(['week', 'month', 'year'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`
                px-3 py-1 rounded-lg text-xs font-ui font-medium
                transition-all duration-200
                ${period === p
                  ? 'bg-white dark:bg-walnut-700 text-walnut-700 dark:text-cream-100 shadow-sm'
                  : 'text-brown-400 dark:text-cream-500 hover:text-walnut-600'
                }
              `}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="followersGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="subsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#B45309" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#B45309" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(235,217,176,0.3)" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: '#A97C52', fontFamily: 'DM Sans' }}
            tickLine={false}
            axisLine={false}
            interval={period === 'month' ? 4 : 0}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#A97C52', fontFamily: 'DM Sans' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background:   'rgba(253,250,244,0.95)',
              border:       '1px solid rgba(235,217,176,0.6)',
              borderRadius: '1rem',
              fontSize:     '12px',
              fontFamily:   'DM Sans',
              boxShadow:    '0 8px 24px rgba(110,72,24,0.12)',
            }}
          />
          <Area
            type="monotone"
            dataKey="followers"
            stroke="#F59E0B"
            strokeWidth={2}
            fill="url(#followersGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#F59E0B' }}
          />
          <Area
            type="monotone"
            dataKey="subscribers"
            stroke="#B45309"
            strokeWidth={2}
            fill="url(#subsGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#B45309' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 mt-3 justify-end">
        {[
          { color: '#F59E0B', label: 'Instagram Followers' },
          { color: '#B45309', label: 'YouTube Subscribers' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
            <span className="text-xs font-ui text-brown-400 dark:text-cream-500">
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── AI INSIGHTS WIDGET ──────────────────────────────────────────────────────

function AIInsightsWidget() {
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<string[]>([])

  // Mock insights — real app calls AI endpoint
  useEffect(() => {
    const timer = setTimeout(() => {
      setInsights([
        '🎵 You haven\'t practiced "Tum Hi Ho" in 5 days — time to revisit!',
        '📈 Your reels posted on Tuesday get 2.3x more views. Post today!',
        '🎯 You\'re 3 songs away from your 100-song milestone. Keep going!',
        '⏰ Your audience is most active at 7 PM IST. Schedule your next post.',
        '🤝 Arjun Mehta is a great collaboration match — same scale and genre.',
      ])
      setLoading(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="card-premium p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/20
                          flex items-center justify-center">
            <Sparkles size={18} className="text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-ui font-semibold text-walnut-800
                          dark:text-cream-100">
              AI Insights
            </p>
            <p className="text-xs text-brown-400 dark:text-cream-500">
              Personalized for you
            </p>
          </div>
        </div>
        <Link href="/dashboard/ai-coach"
              className="text-xs text-primary hover:text-primary-hover
                         font-ui transition-colors">
          Chat →
        </Link>
      </div>

      {/* Insights list */}
      <div className="flex flex-col gap-2.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i}
                 className="h-10 rounded-xl shimmer-bg animate-shimmer" />
          ))
        ) : (
          insights.map((insight, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-3 rounded-xl
                         bg-sand-50/80 dark:bg-walnut-800/40
                         border border-sand-100/80 dark:border-walnut-700/30
                         hover:border-gold-200/60 dark:hover:border-gold-700/30
                         transition-all duration-200 group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <p className="text-xs font-ui text-brown-500 dark:text-cream-300
                            leading-relaxed">
                {insight}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Ask AI */}
      <Link
        href="/dashboard/ai-coach"
        className="mt-4 w-full flex items-center justify-center gap-2
                   py-2.5 rounded-xl border border-dashed border-gold-300/60
                   dark:border-gold-600/30 text-xs font-ui font-medium
                   text-primary hover:bg-gold-50/50 dark:hover:bg-gold-900/10
                   transition-all duration-200"
      >
        <Bot size={14} />
        Ask AI Coach anything →
      </Link>
    </div>
  )
}

// ─── TODAY'S PLANNER PREVIEW ─────────────────────────────────────────────────

function TodaysPlannerWidget() {
  const tasks: DailyTask[] = [
    { id: '1', title: 'Practice "Tum Hi Ho"',      type: 'practice',  status: 'completed', duration: 30 },
    { id: '2', title: 'Record new cover',           type: 'recording', status: 'in_progress', duration: 45 },
    { id: '3', title: 'Edit Instagram reel',        type: 'editing',   status: 'pending', duration: 20 },
    { id: '4', title: 'Post on Instagram + YouTube',type: 'posting',   status: 'pending', duration: 10 },
    { id: '5', title: 'Reply to comments',          type: 'reply',     status: 'pending', duration: 15 },
  ]

  const completed = tasks.filter(t => t.status === 'completed').length
  const total     = tasks.length
  const pct       = Math.round((completed / total) * 100)

  const statusIcon = (status: DailyTask['status']) => {
    if (status === 'completed')   return <CheckCircle2 size={16} className="text-green-500" />
    if (status === 'in_progress') return <PlayCircle   size={16} className="text-gold-500 animate-pulse" />
    return <Circle size={16} className="text-brown-300 dark:text-cream-600" />
  }

  const typeEmoji: Record<string, string> = {
    practice:  '🎵',
    recording: '🎙️',
    editing:   '✂️',
    posting:   '📤',
    reply:     '💬',
  }

  return (
    <div className="card-premium p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/20
                          flex items-center justify-center">
            <Calendar size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-ui font-semibold text-walnut-800
                          dark:text-cream-100">
              Today&apos;s Plan
            </p>
            <p className="text-xs text-brown-400 dark:text-cream-500">
              {completed}/{total} completed
            </p>
          </div>
        </div>
        <Link href="/dashboard/planner"
              className="text-xs text-primary hover:text-primary-hover
                         font-ui transition-colors">
          Full planner →
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-ui text-brown-400
                        dark:text-cream-500 mb-1.5">
          <span>Daily progress</span>
          <span className="font-semibold text-walnut-700 dark:text-cream-200">
            {pct}%
          </span>
        </div>
        <div className="h-2 bg-sand-200 dark:bg-walnut-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500
                       rounded-full transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`
              flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200
              ${task.status === 'completed'
                ? 'opacity-60'
                : 'hover:bg-sand-50/60 dark:hover:bg-walnut-800/30'
              }
            `}
          >
            {statusIcon(task.status)}
            <span className="text-base flex-shrink-0">{typeEmoji[task.type]}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-ui font-medium leading-tight
                             ${task.status === 'completed'
                               ? 'line-through text-brown-400 dark:text-cream-600'
                               : 'text-walnut-700 dark:text-cream-200'
                             }`}>
                {task.title}
              </p>
            </div>
            {task.duration && (
              <span className="text-2xs font-ui text-brown-400 dark:text-cream-600
                               flex-shrink-0">
                {task.duration}m
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Add task */}
      <Link
        href="/dashboard/planner?action=add"
        className="mt-3 w-full flex items-center justify-center gap-2
                   py-2 rounded-xl border border-dashed border-sand-300
                   dark:border-walnut-600/50 text-xs font-ui font-medium
                   text-brown-400 hover:text-primary hover:border-gold-300/60
                   dark:hover:border-gold-600/30 transition-all duration-200"
      >
        <Plus size={14} />
        Add task
      </Link>
    </div>
  )
}

// ─── MOTIVATIONAL QUOTE ───────────────────────────────────────────────────────

function MotivationalQuote() {
  const [idx, setIdx] = useState(() =>
    Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length),
  )
  const quote = MOTIVATIONAL_QUOTES[idx]

  return (
    <div className="relative overflow-hidden rounded-2xl
                    bg-gradient-to-br from-walnut-800 via-walnut-700 to-coffee-600
                    p-5 border border-walnut-600/40">
      {/* Texture */}
      <div className="absolute inset-0 bg-texture-strings opacity-10" />

      {/* Quote mark */}
      <div className="absolute top-3 right-4 font-display text-6xl
                      text-gold-400/20 leading-none select-none">
        &ldquo;
      </div>

      <div className="relative z-10">
        <p className="font-display text-sm italic text-cream-100 leading-relaxed mb-3">
          &ldquo;{quote.quote}&rdquo;
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs font-ui text-cream-400">
            — {quote.author}
          </p>
          <button
            onClick={() => setIdx(i => (i + 1) % MOTIVATIONAL_QUOTES.length)}
            className="text-xs font-ui text-gold-400 hover:text-gold-300
                       transition-colors"
          >
            Next quote →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── RECENT SONGS WIDGET ─────────────────────────────────────────────────────

function RecentSongsWidget() {
  const songs = [
    { title: 'Tum Hi Ho',       artist: 'Arijit Singh',   status: '🎙️', scale: 'C#' },
    { title: 'Kesariya',        artist: 'Arijit Singh',   status: '✅', scale: 'D'  },
    { title: 'Raataan Lambiyan',artist: 'Jubin Nautiyal', status: '📝', scale: 'F'  },
    { title: 'Agar Tum Saath Ho',artist: 'Alka Yagnik',  status: '🎵', scale: 'G'  },
  ]

  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gold-100 dark:bg-gold-900/20
                          flex items-center justify-center">
            <Music size={18} className="text-gold-600" />
          </div>
          <p className="text-sm font-ui font-semibold text-walnut-800
                        dark:text-cream-100">
            Recent Songs
          </p>
        </div>
        <Link href="/dashboard/songs"
              className="text-xs text-primary hover:text-primary-hover
                         font-ui transition-colors flex items-center gap-1">
          Library <ChevronRight size={12} />
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {songs.map((song, i) => (
          <div key={i}
               className="flex items-center gap-3 p-2.5 rounded-xl
                          hover:bg-sand-50/60 dark:hover:bg-walnut-800/30
                          transition-colors duration-150 group cursor-pointer">
            {/* Cover placeholder */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-200
                            to-gold-400 dark:from-gold-800 dark:to-gold-600
                            flex items-center justify-center flex-shrink-0
                            text-base shadow-sm">
              🎵
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-ui font-semibold text-walnut-700
                            dark:text-cream-100 truncate">
                {song.title}
              </p>
              <p className="text-2xs text-brown-400 dark:text-cream-500 truncate">
                {song.artist}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs px-1.5 py-0.5 rounded-md
                               bg-sand-100 dark:bg-walnut-700/50
                               text-brown-500 dark:text-cream-400 font-mono">
                {song.scale}
              </span>
              <span className="text-sm">{song.status}</span>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/songs?action=new"
        className="mt-3 w-full flex items-center justify-center gap-2
                   py-2 rounded-xl bg-gradient-gold text-cream-50
                   text-xs font-ui font-semibold shadow-gold
                   hover:shadow-glow transition-all duration-200"
      >
        <Plus size={14} />
        Add New Song
      </Link>
    </div>
  )
}

// ─── PRACTICE BAR CHART ──────────────────────────────────────────────────────

function PracticeChart() {
  const data = [
    { day: 'Mon', minutes: 45  },
    { day: 'Tue', minutes: 60  },
    { day: 'Wed', minutes: 30  },
    { day: 'Thu', minutes: 75  },
    { day: 'Fri', minutes: 90  },
    { day: 'Sat', minutes: 120 },
    { day: 'Sun', minutes: 60  },
  ]

  const total = data.reduce((a, d) => a + d.minutes, 0)
  const hrs   = Math.floor(total / 60)
  const mins  = total % 60

  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-ui font-semibold text-walnut-800
                      dark:text-cream-100">
          Practice This Week
        </p>
        <span className="text-xs font-ui font-bold text-primary">
          {hrs}h {mins}m total
        </span>
      </div>
      <p className="text-xs text-brown-400 dark:text-cream-500 mb-4 font-ui">
        Daily practice minutes
      </p>

      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(235,217,176,0.3)"
                         vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: '#A97C52', fontFamily: 'DM Sans' }}
            tickLine={false} axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: '#A97C52', fontFamily: 'DM Sans' }}
            tickLine={false} axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background:   'rgba(253,250,244,0.95)',
              border:       '1px solid rgba(235,217,176,0.6)',
              borderRadius: '0.75rem',
              fontSize:     '11px',
              fontFamily:   'DM Sans',
            }}
            formatter={(v: number) => [`${v} min`, 'Practice']}
          />
          <Bar
            dataKey="minutes"
            fill="url(#barGrad)"
            radius={[6, 6, 0, 0]}
          />
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#F59E0B" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#B45309" stopOpacity={0.7} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── MAIN DASHBOARD PAGE ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const stats: StatCardProps[] = [
    {
      title:     'Songs in Library',
      value:      user?.totalSongs || 0,
      subtitle:  '3 added this week',
      icon:       Music,
      iconColor: 'text-gold-600',
      iconBg:    'bg-gold-100 dark:bg-gold-900/20',
      trend:     { value: 12, label: 'vs last month' },
      href:      '/dashboard/songs',
      animate:    true,
    },
    {
      title:     'Practice Hours',
      value:     `${Math.round(user?.totalPracticeHours || 0)}h`,
      subtitle:  '7.5h this week',
      icon:       Clock,
      iconColor: 'text-blue-500',
      iconBg:    'bg-blue-100 dark:bg-blue-900/20',
      trend:     { value: 8, label: 'vs last week' },
      href:      '/dashboard/analytics',
    },
    {
      title:     'Current Streak',
      value:     `${user?.currentStreak || 0} days`,
      subtitle:  `Best: ${user?.longestStreak || 0} days`,
      icon:       Flame,
      iconColor: 'text-orange-500',
      iconBg:    'bg-orange-100 dark:bg-orange-900/20',
      trend:     { value: 5, label: 'days above avg' },
    },
    {
      title:     'Total Uploads',
      value:      user?.totalUploads || 0,
      subtitle:  '2 this month',
      icon:       Upload,
      iconColor: 'text-green-500',
      iconBg:    'bg-green-100 dark:bg-green-900/20',
      trend:     { value: 20, label: 'vs last month' },
      href:      '/dashboard/songs',
      animate:    true,
    },
    {
      title:     'Followers',
      value:     '1.38K',
      subtitle:  'Instagram',
      icon:       Users,
      iconColor: 'text-pink-500',
      iconBg:    'bg-pink-100 dark:bg-pink-900/20',
      trend:     { value: 15, label: 'this month' },
      href:      '/dashboard/integrations',
    },
    {
      title:     'Total Views',
      value:     '24.6K',
      subtitle:  'YouTube',
      icon:       Eye,
      iconColor: 'text-red-500',
      iconBg:    'bg-red-100 dark:bg-red-900/20',
      trend:     { value: 32, label: 'this month' },
      href:      '/dashboard/integrations',
    },
    {
      title:     'Performance Score',
      value:     '82/100',
      subtitle:  'Good — keep going!',
      icon:       Star,
      iconColor: 'text-purple-500',
      iconBg:    'bg-purple-100 dark:bg-purple-900/20',
      trend:     { value: 6, label: 'vs last week' },
      href:      '/dashboard/analytics',
    },
    {
      title:     'Milestones',
      value:     '7',
      subtitle:  '2 new this month',
      icon:       Trophy,
      iconColor: 'text-gold-600',
      iconBg:    'bg-gold-100 dark:bg-gold-900/20',
      href:      '/dashboard/milestones',
      animate:   true,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Greeting ─────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold
                           text-walnut-900 dark:text-cream-100">
              {greeting()}, {user?.displayName?.split(' ')[0] || 'Creator'}! 🎵
            </h1>
            <p className="text-sm text-brown-400 dark:text-cream-400 mt-1 font-ui">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric',
                month: 'long', year: 'numeric',
              })}
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <Link
              href="/dashboard/songs?action=new"
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Song
            </Link>
            <Link
              href="/dashboard/ai-coach"
              className="btn-ghost text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Bot size={14} /> Ask AI
            </Link>
          </div>
        </div>

        {/* ── Motivational quote ───────────────────── */}
        <MotivationalQuote />

        {/* ── Stats grid ──────────────────────────── */}
        <div>
          <h2 className="font-display font-semibold text-lg text-walnut-800
                         dark:text-cream-100 mb-3">
            Your Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={stat.title}
                   style={{ animationDelay: `${i * 0.05}s` }}
                   className="animate-fade-up">
                <StatCard {...stat} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Streak + AI Insights ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StreakWidget
            streak={user?.currentStreak || 7}
            longest={user?.longestStreak || 30}
          />
          <div className="lg:col-span-2">
            <AIInsightsWidget />
          </div>
        </div>

        {/* ── Growth chart ─────────────────────────── */}
        <GrowthChart />

        {/* ── Planner + Practice chart + Recent songs ─ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <TodaysPlannerWidget />
          <div className="flex flex-col gap-4">
            <PracticeChart />
          </div>
          <RecentSongsWidget />
        </div>

        {/* ── Quick links footer ───────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Analytics',     href: '/dashboard/analytics',   icon: BarChart3,  color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            { label: 'AI Posters',    href: '/dashboard/posters',     icon: Sparkles,   color: 'text-pink-500',   bg: 'bg-pink-50   dark:bg-pink-900/20'   },
            { label: 'Community',     href: '/dashboard/community',   icon: Users,      color: 'text-teal-500',   bg: 'bg-teal-50   dark:bg-teal-900/20'   },
            { label: 'Milestones',    href: '/dashboard/milestones',  icon: Trophy,     color: 'text-gold-600',   bg: 'bg-gold-50   dark:bg-gold-900/20'   },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="card-premium p-4 flex items-center gap-3 group
                         hover:border-gold-300/50 dark:hover:border-gold-600/40"
            >
              <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center
                               justify-center group-hover:scale-110
                               transition-transform duration-200`}>
                <item.icon size={18} className={item.color} />
              </div>
              <span className="text-sm font-ui font-medium text-walnut-700
                               dark:text-cream-200">
                {item.label}
              </span>
              <ChevronRight size={14} className="ml-auto text-brown-300
                                                  dark:text-cream-600" />
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
