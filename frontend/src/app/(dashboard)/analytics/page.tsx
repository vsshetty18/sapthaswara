/* ============================================================
   SVARAVERSE AI — Analytics Page
   Heatmap | Performance Score | Growth Charts | Reports
   ============================================================ */

'use client'

import React, { useState, useMemo, useCallback } from 'react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Music, Clock, Users, Eye,
  Flame, Target, Download, Calendar, ChevronDown,
  Instagram, Youtube, Award, Zap, ArrowUpRight, ArrowDownRight,
  Info,
} from 'lucide-react'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth }     from '@/context/AuthContext'
import { PERFORMANCE_SCORE_WEIGHTS } from '@/lib/constants'

// ─── HEATMAP DATA GENERATOR ───────────────────────────────────────────────────

function generateHeatmapData(): { date: string; count: number }[] {
  const data: { date: string; count: number }[] = []
  const today = new Date()

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const seed = d.getDate() + d.getMonth()
    const rand = Math.sin(seed * 12.9898) * 43758.5453
    const frac = rand - Math.floor(rand)
    const count = frac > 0.3 ? Math.floor(frac * 5) : 0

    data.push({ date: d.toISOString().split('T')[0], count })
  }
  return data
}

// ─── HEATMAP CALENDAR ─────────────────────────────────────────────────────────

function HeatmapCalendar() {
  const data = useMemo(() => generateHeatmapData(), [])
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null)

  // Group by weeks
  const weeks = useMemo(() => {
    const result: { date: string; count: number }[][] = []
    let currentWeek: { date: string; count: number }[] = []

    data.forEach((day, i) => {
      const dayOfWeek = new Date(day.date).getDay()
      if (i === 0) {
        for (let j = 0; j < (dayOfWeek === 0 ? 6 : dayOfWeek - 1); j++) {
          currentWeek.push({ date: '', count: -1 })
        }
      }
      currentWeek.push(day)
      if (dayOfWeek === 0 || i === data.length - 1) {
        result.push(currentWeek)
        currentWeek = []
      }
    })
    return result
  }, [data])

  const monthLabels = useMemo(() => {
    const labels: { weekIdx: number; label: string }[] = []
    let lastMonth = -1
    weeks.forEach((week, wIdx) => {
      const firstValidDay = week.find(d => d.date)
      if (!firstValidDay) return
      const month = new Date(firstValidDay.date).getMonth()
      if (month !== lastMonth) {
        labels.push({
          weekIdx: wIdx,
          label: new Date(firstValidDay.date).toLocaleDateString('en-IN', { month: 'short' }),
        })
        lastMonth = month
      }
    })
    return labels
  }, [weeks])

  const totalDays   = data.filter(d => d.count > 0).length
  const totalActive = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-display font-semibold text-lg text-walnut-800
                         dark:text-cream-100">
            Practice Heatmap
          </h3>
          <p className="text-xs text-brown-400 dark:text-cream-500 font-ui">
            {totalDays} active days in the last year
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-2xs text-brown-400 dark:text-cream-500 mr-1">Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level}
                 className="heatmap-cell w-3 h-3"
                 data-level={level} />
          ))}
          <span className="text-2xs text-brown-400 dark:text-cream-500 ml-1">More</span>
        </div>
      </div>

      {/* Scrollable heatmap */}
      <div className="overflow-x-auto scrollbar-warm pb-2">
        <div className="relative min-w-[700px]">
          {/* Month labels */}
          <div className="flex mb-1 relative h-4">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="absolute text-2xs font-ui text-brown-400 dark:text-cream-500"
                style={{ left: `${m.weekIdx * 14.5}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3px]">
                {week.map((day, dIdx) => (
                  <div
                    key={dIdx}
                    className={day.count >= 0 ? 'heatmap-cell w-3 h-3' : 'w-3 h-3'}
                    data-level={day.count >= 0 ? Math.min(day.count, 4) : undefined}
                    onMouseEnter={() => day.date && setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      <div className="h-8 flex items-center">
        {hoveredDay ? (
          <p className="text-xs font-ui text-walnut-700 dark:text-cream-200">
            <span className="font-semibold">{hoveredDay.count} sessions</span> on{' '}
            {new Date(hoveredDay.date).toLocaleDateString('en-IN', {
              weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
            })}
          </p>
        ) : (
          <p className="text-xs text-brown-300 dark:text-cream-600 font-ui">
            Hover over a day to see details
          </p>
        )}
      </div>
    </div>
  )
}

// ─── PERFORMANCE SCORE ────────────────────────────────────────────────────────

function PerformanceScoreCard() {
  const breakdown = {
    consistency:  85,
    growth:       72,
    engagement:   68,
    productivity: 90,
  }

  const overallScore = Math.round(
    breakdown.consistency  * PERFORMANCE_SCORE_WEIGHTS.consistency +
    breakdown.growth       * PERFORMANCE_SCORE_WEIGHTS.growth +
    breakdown.engagement   * PERFORMANCE_SCORE_WEIGHTS.engagement +
    breakdown.productivity * PERFORMANCE_SCORE_WEIGHTS.productivity,
  )

  const radarData = [
    { metric: 'Consistency',  value: breakdown.consistency  },
    { metric: 'Growth',       value: breakdown.growth       },
    { metric: 'Engagement',   value: breakdown.engagement   },
    { metric: 'Productivity', value: breakdown.productivity },
  ]

  const scoreLabel = overallScore >= 85 ? 'Excellent!'
    : overallScore >= 70 ? 'Good — keep going!'
    : overallScore >= 50 ? 'Fair — room to grow'
    : 'Needs attention'

  const scoreColor = overallScore >= 85 ? 'text-green-500'
    : overallScore >= 70 ? 'text-gold-600'
    : overallScore >= 50 ? 'text-orange-500'
    : 'text-red-500'

  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-purple-500" />
          <h3 className="font-display font-semibold text-base text-walnut-800
                         dark:text-cream-100">
            Performance Score
          </h3>
        </div>
        <button title="How is this calculated?"
                className="text-brown-300 dark:text-cream-600 hover:text-brown-500
                           transition-colors">
          <Info size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Score number */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-32 h-32">
            <svg width="128" height="128" className="-rotate-90">
              <circle cx="64" cy="64" r="56" fill="none"
                      stroke="rgba(235,217,176,0.4)" strokeWidth="10" />
              <circle
                cx="64" cy="64" r="56" fill="none"
                stroke="url(#scoreGrad)" strokeWidth="10"
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={2 * Math.PI * 56 * (1 - overallScore / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%"   stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold text-3xl text-walnut-800
                               dark:text-cream-100">
                {overallScore}
              </span>
              <span className="text-2xs text-brown-400 dark:text-cream-500">/ 100</span>
            </div>
          </div>
          <p className={`text-sm font-ui font-semibold mt-2 ${scoreColor}`}>
            {scoreLabel}
          </p>
        </div>

        {/* Radar chart */}
        <ResponsiveContainer width="100%" height={160}>
          <RadarChart data={radarData} outerRadius={60}>
            <PolarGrid stroke="rgba(235,217,176,0.5)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fontSize: 9, fill: '#A97C52', fontFamily: 'DM Sans' }}
            />
            <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
            <Radar
              dataKey="value"
              stroke="#B45309"
              fill="#F59E0B"
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown bars */}
      <div className="flex flex-col gap-2.5 mt-4">
        {Object.entries(breakdown).map(([key, value]) => (
          <div key={key}>
            <div className="flex justify-between text-2xs font-ui mb-1">
              <span className="text-brown-400 dark:text-cream-500 capitalize">
                {key}
              </span>
              <span className="font-semibold text-walnut-700 dark:text-cream-200">
                {value}%
              </span>
            </div>
            <div className="h-1.5 bg-sand-200 dark:bg-walnut-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-400 to-gold-600
                           rounded-full transition-all duration-1000"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── METRIC SUMMARY CARD ──────────────────────────────────────────────────────

function MetricCard({
  icon: Icon, label, value, change, color, bg,
}: {
  icon:   React.ElementType
  label:  string
  value:  string
  change: number
  color:  string
  bg:     string
}) {
  const positive = change >= 0
  return (
    <div className="card-premium p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={17} className={color} />
        </div>
        <div className={`flex items-center gap-0.5 text-xs font-ui font-semibold
                         ${positive ? 'text-green-600' : 'text-red-500'}`}>
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-xl font-display font-bold text-walnut-800 dark:text-cream-100">
        {value}
      </p>
      <p className="text-xs font-ui text-brown-400 dark:text-cream-500 mt-0.5">
        {label}
      </p>
    </div>
  )
}

// ─── PLATFORM SPLIT CHART ─────────────────────────────────────────────────────

function PlatformSplitChart() {
  const data = [
    { name: 'Instagram', value: 1380, color: '#E1306C' },
    { name: 'YouTube',   value: 520,  color: '#FF0000' },
  ]

  return (
    <div className="card-premium p-5">
      <h3 className="font-display font-semibold text-base text-walnut-800
                     dark:text-cream-100 mb-1">
        Audience Split
      </h3>
      <p className="text-xs text-brown-400 dark:text-cream-500 font-ui mb-4">
        Total followers/subscribers by platform
      </p>

      <div className="flex items-center gap-6">
        <ResponsiveContainer width="50%" height={140}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={3}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'rgba(253,250,244,0.95)',
                border: '1px solid rgba(235,217,176,0.6)',
                borderRadius: '0.75rem',
                fontSize: '11px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex flex-col gap-3 flex-1">
          {data.map(item => (
            <div key={item.name} className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full flex-shrink-0"
                   style={{ background: item.color }} />
              <div>
                <p className="text-sm font-ui font-semibold text-walnut-700
                              dark:text-cream-200">
                  {item.value.toLocaleString('en-IN')}
                </p>
                <p className="text-2xs text-brown-400 dark:text-cream-500">
                  {item.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── REPORT TABS ──────────────────────────────────────────────────────────────

function ReportSection() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week')

  const weekData = [
    { label: 'Mon', practice: 45, songs: 1, posts: 0 },
    { label: 'Tue', practice: 60, songs: 0, posts: 1 },
    { label: 'Wed', practice: 30, songs: 1, posts: 0 },
    { label: 'Thu', practice: 75, songs: 0, posts: 1 },
    { label: 'Fri', practice: 90, songs: 2, posts: 0 },
    { label: 'Sat', practice: 120,songs: 0, posts: 2 },
    { label: 'Sun', practice: 60, songs: 1, posts: 0 },
  ]

  const monthData = Array.from({ length: 4 }, (_, i) => ({
    label:    `Week ${i + 1}`,
    practice: 250 + Math.floor(Math.random() * 150),
    songs:    2 + Math.floor(Math.random() * 4),
    posts:    1 + Math.floor(Math.random() * 3),
  }))

  const yearData = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    .map(label => ({
      label,
      practice: 800 + Math.floor(Math.random() * 600),
      songs:    8  + Math.floor(Math.random() * 10),
      posts:    5  + Math.floor(Math.random() * 10),
    }))

  const data = period === 'week' ? weekData : period === 'month' ? monthData : yearData

  const insights = {
    week: [
      'Your Saturday practice sessions are your longest (120 min average)',
      'You posted 2x more this week than your monthly average',
      'Practice consistency improved 15% compared to last week',
    ],
    month: [
      'Week 3 was your most productive with 4 new songs learned',
      'Your posting frequency increased by 22% this month',
      'You maintained an average 65-minute daily practice session',
    ],
    year: [
      'August was your best month with 18 songs learned',
      'Your YouTube growth accelerated significantly in Q3',
      'Overall practice consistency improved by 40% year-over-year',
    ],
  }

  return (
    <div className="card-premium p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="font-display font-semibold text-lg text-walnut-800
                         dark:text-cream-100">
            Detailed Report
          </h3>
          <p className="text-xs text-brown-400 dark:text-cream-500 font-ui">
            Practice, songs & posting activity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-sand-100 dark:bg-walnut-800/60
                          rounded-xl p-1">
            {(['week', 'month', 'year'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-ui font-medium
                  transition-all duration-200
                  ${period === p
                    ? 'bg-white dark:bg-walnut-700 text-walnut-700 dark:text-cream-100 shadow-sm'
                    : 'text-brown-400 dark:text-cream-500 hover:text-walnut-600'
                  }
                `}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}ly
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 text-xs font-ui font-medium
                             text-primary hover:text-primary-hover transition-colors
                             px-3 py-2 rounded-xl hover:bg-sand-100 dark:hover:bg-walnut-700/40">
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(235,217,176,0.3)"
                         vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#A97C52', fontFamily: 'DM Sans' }}
            tickLine={false} axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#A97C52', fontFamily: 'DM Sans' }}
            tickLine={false} axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(253,250,244,0.95)',
              border: '1px solid rgba(235,217,176,0.6)',
              borderRadius: '1rem',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="practice" fill="#F59E0B" radius={[6,6,0,0]} name="Practice (min)" />
          <Bar dataKey="songs"    fill="#10B981" radius={[6,6,0,0]} name="Songs Learned" />
          <Bar dataKey="posts"    fill="#8B5CF6" radius={[6,6,0,0]} name="Posts" />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 justify-center mt-2 mb-5">
        {[
          { color: '#F59E0B', label: 'Practice (min)' },
          { color: '#10B981', label: 'Songs Learned' },
          { color: '#8B5CF6', label: 'Posts' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
            <span className="text-2xs font-ui text-brown-400 dark:text-cream-500">
              {l.label}
            </span>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl p-4
                      border border-purple-100/60 dark:border-purple-800/20">
        <div className="flex items-center gap-2 mb-2.5">
          <Zap size={14} className="text-purple-500" />
          <p className="text-xs font-ui font-bold uppercase tracking-wide
                        text-purple-600 dark:text-purple-400">
            Key Insights
          </p>
        </div>
        <ul className="flex flex-col gap-1.5">
          {insights[period].map((insight, i) => (
            <li key={i} className="text-xs font-ui text-brown-500 dark:text-cream-300
                                   flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">✦</span>
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { user } = useAuth()

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold text-walnut-900
                           dark:text-cream-100">
              Analytics 📊
            </h1>
            <p className="text-sm text-brown-400 dark:text-cream-400 font-ui mt-0.5">
              Track your growth, practice, and performance
            </p>
          </div>
          <button className="btn-ghost text-sm px-5 py-2.5 flex items-center gap-2">
            <Download size={15} />
            Export Report
          </button>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard icon={Music}   label="Total Songs"      value={`${user?.totalSongs || 24}`}     change={12} color="text-gold-600"  bg="bg-gold-100 dark:bg-gold-900/20" />
          <MetricCard icon={Clock}   label="Practice Hours"   value={`${Math.round(user?.totalPracticeHours || 87)}h`} change={8}  color="text-blue-500"  bg="bg-blue-100 dark:bg-blue-900/20" />
          <MetricCard icon={Users}   label="Total Followers"  value="1.9K"  change={15} color="text-pink-500"  bg="bg-pink-100 dark:bg-pink-900/20" />
          <MetricCard icon={Eye}     label="Total Views"      value="24.6K" change={-3} color="text-red-500"   bg="bg-red-100 dark:bg-red-900/20" />
        </div>

        {/* Heatmap */}
        <HeatmapCalendar />

        {/* Performance score + Platform split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <PerformanceScoreCard />
          </div>
          <PlatformSplitChart />
        </div>

        {/* Detailed report */}
        <ReportSection />
      </div>
    </DashboardLayout>
  )
}
