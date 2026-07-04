/* ============================================================
   SVARAVERSE AI — Milestones Page
   Achievement Badges | Confetti | Progress | Locked/Unlocked
   ============================================================ */

'use client'

import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react'
import confetti from 'canvas-confetti'
import { Trophy, Lock, CheckCircle2, Star, Flame, Music,
         Users, Video, Heart, DollarSign, ChevronRight,
         Sparkles, Crown } from 'lucide-react'

import DashboardLayout      from '@/components/layout/DashboardLayout'
import { useAuth }          from '@/context/AuthContext'
import { MILESTONE_DEFINITIONS } from '@/lib/constants'
import { MilestoneType, type Milestone } from '@/types'

// ─── MOCK UNLOCKED MILESTONES ────────────────────────────────────────────────

const UNLOCKED_MILESTONES: Milestone[] = [
  {
    id: '1', userId: 'u1',
    type:        MilestoneType.FOLLOWERS_100,
    title:       '100 Followers!',
    description: 'Your first 100 followers — the community is growing!',
    icon:        '🎉',
    achievedAt:  '2023-10-15T12:00:00',
    value:       100,
    isNew:       false,
  },
  {
    id: '2', userId: 'u1',
    type:        MilestoneType.STREAK_7,
    title:       '7-Day Streak!',
    description: 'A full week of consistent practice. Wah!',
    icon:        '🔥',
    achievedAt:  '2023-11-01T08:00:00',
    value:       7,
    isNew:       false,
  },
  {
    id: '3', userId: 'u1',
    type:        MilestoneType.SONGS_10,
    title:       '10 Songs Learned!',
    description: 'A solid repertoire is taking shape.',
    icon:        '🎵',
    achievedAt:  '2023-11-20T18:00:00',
    value:       10,
    isNew:       false,
  },
  {
    id: '4', userId: 'u1',
    type:        MilestoneType.FOLLOWERS_500,
    title:       '500 Followers!',
    description: 'Half a thousand people love your music!',
    icon:        '⭐',
    achievedAt:  '2023-12-05T14:00:00',
    value:       500,
    isNew:       false,
  },
  {
    id: '5', userId: 'u1',
    type:        MilestoneType.STREAK_30,
    title:       '30-Day Streak!',
    description: 'A whole month without breaking the chain!',
    icon:        '💫',
    achievedAt:  '2024-01-01T00:00:00',
    value:       30,
    isNew:       false,
  },
  {
    id: '6', userId: 'u1',
    type:        MilestoneType.FIRST_COLLAB,
    title:       'First Collaboration!',
    description: 'You collaborated with another creator. Beautiful!',
    icon:        '🤝',
    achievedAt:  '2024-01-10T16:00:00',
    value:       1,
    isNew:       false,
  },
  {
    id: '7', userId: 'u1',
    type:        MilestoneType.VIDEOS_10,
    title:       '10 Videos Posted!',
    description: 'Double digits on your video uploads.',
    icon:        '🎬',
    achievedAt:  '2024-01-18T20:00:00',
    value:       10,
    isNew:       true,   // ← will trigger confetti
  },
]

// ─── CATEGORY CONFIG ─────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, {
  label: string; icon: React.ElementType; color: string; bg: string
}> = {
  followers: { label: 'Followers',  icon: Users,       color: 'text-pink-500',   bg: 'bg-pink-100 dark:bg-pink-900/20'   },
  songs:     { label: 'Songs',      icon: Music,       color: 'text-gold-600',   bg: 'bg-gold-100 dark:bg-gold-900/20'   },
  streak:    { label: 'Streak',     icon: Flame,       color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20'},
  videos:    { label: 'Videos',     icon: Video,       color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/20'   },
  community: { label: 'Community',  icon: Heart,       color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/20'     },
  income:    { label: 'Income',     icon: DollarSign,  color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/20' },
}

// ─── CONFETTI BURST ──────────────────────────────────────────────────────────

function burstConfetti() {
  const colors = ['#F59E0B', '#B45309', '#FDE68A', '#FAF5E8', '#D97706']

  // Left cannon
  confetti({
    particleCount: 80,
    spread:        70,
    origin:        { x: 0.2, y: 0.6 },
    colors,
    ticks:         300,
  })

  // Right cannon
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread:        70,
      origin:        { x: 0.8, y: 0.6 },
      colors,
      ticks:         300,
    })
  }, 200)

  // Center burst
  setTimeout(() => {
    confetti({
      particleCount: 120,
      spread:        100,
      origin:        { x: 0.5, y: 0.4 },
      colors,
      ticks:         400,
      scalar:        1.2,
    })
  }, 400)
}

// ─── NEW MILESTONE MODAL ─────────────────────────────────────────────────────

function NewMilestoneModal({
  milestone,
  onClose,
}: {
  milestone: Milestone
  onClose:   () => void
}) {
  useEffect(() => {
    // Trigger confetti on mount
    burstConfetti()
    setTimeout(burstConfetti, 1500)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-walnut-900/70 backdrop-blur-md px-4 animate-fade-in">
      <div className="w-full max-w-sm card-premium shadow-3xl text-center
                      animate-bounce-in overflow-hidden relative">

        {/* Shimmer background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold-100/80
                        via-cream-50 to-sand-200/60 dark:from-gold-900/30
                        dark:via-walnut-800 dark:to-walnut-700" />

        {/* Gold border ring */}
        <div className="absolute inset-0 border-2 border-gold-400/50
                        dark:border-gold-600/40 rounded-2xl pointer-events-none" />

        <div className="relative z-10 p-8">
          {/* Crown icon */}
          <div className="flex justify-center mb-2">
            <Crown size={20} className="text-gold-500" />
          </div>

          {/* Badge */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-300
                          to-gold-500 dark:from-gold-600 dark:to-gold-400
                          flex items-center justify-center text-5xl mx-auto mb-4
                          shadow-gold-lg animate-glow-ring">
            {milestone.icon}
          </div>

          {/* Text */}
          <p className="text-xs font-ui font-bold uppercase tracking-widest
                        text-gold-dark dark:text-gold-400 mb-2">
            Achievement Unlocked!
          </p>
          <h2 className="font-display text-2xl font-bold text-walnut-900
                         dark:text-cream-100 mb-2">
            {milestone.title}
          </h2>
          <p className="text-sm text-brown-400 dark:text-cream-400 leading-relaxed mb-6">
            {milestone.description}
          </p>

          {/* Date */}
          <p className="text-2xs font-ui text-brown-300 dark:text-cream-600 mb-6">
            Achieved on{' '}
            {new Date(milestone.achievedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>

          {/* CTA */}
          <button
            onClick={onClose}
            className="btn-primary w-full py-3 text-sm"
          >
            🎉 Celebrate & Continue
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MILESTONE CARD ───────────────────────────────────────────────────────────

function MilestoneCard({
  milestone,
  isUnlocked,
  unlockedData,
  onCelebrate,
}: {
  milestone:    typeof MILESTONE_DEFINITIONS[number]
  isUnlocked:   boolean
  unlockedData: Milestone | undefined
  onCelebrate:  (m: Milestone) => void
}) {
  const catCfg = CATEGORY_CONFIG[milestone.category]
  const CatIcon = catCfg.icon

  return (
    <div
      className={`
        relative card-premium p-5 flex flex-col items-center text-center
        transition-all duration-300 overflow-hidden group
        ${isUnlocked
          ? 'border-gold-300/50 dark:border-gold-600/30 hover:border-gold-400/70'
          : 'opacity-60 hover:opacity-80'
        }
      `}
    >
      {/* Unlocked shimmer */}
      {isUnlocked && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                        transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent
                          via-gold-400/8 to-transparent -skew-x-12
                          animate-gold-sweep" />
        </div>
      )}

      {/* "New" badge */}
      {unlockedData?.isNew && (
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full
                        bg-gradient-gold text-cream-50 text-2xs font-bold font-ui
                        uppercase tracking-wide animate-pulse-gold">
          New!
        </div>
      )}

      {/* Icon */}
      <div className={`
        w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3
        transition-all duration-300
        ${isUnlocked
          ? 'bg-gradient-to-br from-gold-200 to-gold-400 dark:from-gold-700 dark:to-gold-500 shadow-gold'
          : 'bg-sand-100 dark:bg-walnut-800/60'
        }
        ${isUnlocked ? 'group-hover:scale-110 group-hover:shadow-glow' : ''}
      `}>
        {isUnlocked
          ? <span>{milestone.icon}</span>
          : <Lock size={24} className="text-brown-300 dark:text-cream-600" />
        }
      </div>

      {/* Category chip */}
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full
                       text-2xs font-ui font-medium mb-2 ${catCfg.bg} ${catCfg.color}`}>
        <CatIcon size={10} />
        {catCfg.label}
      </div>

      {/* Title */}
      <h3 className={`font-display font-semibold text-sm leading-tight mb-1
                      ${isUnlocked
                        ? 'text-walnut-800 dark:text-cream-100'
                        : 'text-brown-400 dark:text-cream-600'
                      }`}>
        {isUnlocked ? milestone.title : '???'}
      </h3>

      {/* Description */}
      <p className={`text-2xs leading-relaxed mb-3
                     ${isUnlocked
                       ? 'text-brown-400 dark:text-cream-500'
                       : 'text-brown-300 dark:text-cream-700'
                     }`}>
        {isUnlocked
          ? milestone.description
          : `Reach ${milestone.targetValue.toLocaleString('en-IN')} ${milestone.category}`
        }
      </p>

      {/* Achieved date OR lock hint */}
      {isUnlocked && unlockedData ? (
        <div className="flex flex-col items-center gap-2 w-full">
          <p className="text-2xs text-brown-300 dark:text-cream-600 font-ui">
            {new Date(unlockedData.achievedAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </p>
          {unlockedData.isNew && (
            <button
              onClick={() => onCelebrate(unlockedData)}
              className="w-full py-1.5 rounded-xl bg-gradient-gold text-cream-50
                         text-2xs font-ui font-semibold shadow-gold
                         hover:shadow-glow transition-all duration-200"
            >
              🎉 Celebrate!
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1 text-2xs font-ui text-brown-300
                        dark:text-cream-700">
          <Lock size={10} />
          Locked
        </div>
      )}
    </div>
  )
}

// ─── PROGRESS SECTION ────────────────────────────────────────────────────────

function ProgressSection({ unlockedCount, totalCount }: {
  unlockedCount: number
  totalCount:    number
}) {
  const pct = (unlockedCount / totalCount) * 100

  const nextMilestones = [
    { title: '1K Followers',   progress: 68, icon: '🌟' },
    { title: '50 Songs',       progress: 48, icon: '🎶' },
    { title: '100-Day Streak', progress: 7,  icon: '⚡' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Overall progress */}
      <div className="card-premium p-5 flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg width="80" height="80" className="-rotate-90">
            <circle cx="40" cy="40" r="32" fill="none"
                    stroke="rgba(235,217,176,0.4)" strokeWidth="7" />
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke="url(#mileGrad)" strokeWidth="7"
              strokeDasharray={2 * Math.PI * 32}
              strokeDashoffset={2 * Math.PI * 32 * (1 - pct / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="mileGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Trophy size={22} className="text-gold-500" />
          </div>
        </div>
        <div>
          <p className="text-xs font-ui font-bold uppercase tracking-wide
                        text-brown-400 dark:text-cream-500 mb-1">
            Achievements
          </p>
          <p className="text-2xl font-display font-bold text-walnut-800
                        dark:text-cream-100">
            {unlockedCount}/{totalCount}
          </p>
          <p className="text-xs text-brown-400 dark:text-cream-500 mt-0.5">
            {Math.round(pct)}% complete
          </p>
        </div>
      </div>

      {/* Next milestones */}
      <div className="lg:col-span-2 card-premium p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-gold-500" />
          <p className="text-sm font-ui font-semibold text-walnut-800
                        dark:text-cream-100">
            In Progress
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {nextMilestones.map(next => (
            <div key={next.title}>
              <div className="flex items-center justify-between text-xs font-ui mb-1.5">
                <span className="flex items-center gap-1.5 text-walnut-700
                                 dark:text-cream-200 font-medium">
                  {next.icon} {next.title}
                </span>
                <span className="text-brown-400 dark:text-cream-500">
                  {next.progress}%
                </span>
              </div>
              <div className="h-2 bg-sand-200 dark:bg-walnut-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-400 to-gold-600
                             rounded-full transition-all duration-1000"
                  style={{ width: `${next.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MILESTONES PAGE ──────────────────────────────────────────────────────────

export default function MilestonesPage() {
  const { user } = useAuth()

  const [celebratingMilestone, setCelebratingMilestone] = useState<Milestone | null>(null)
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [category, setCategory] = useState<string>('all')

  // Check for new milestones on load
  useEffect(() => {
    const newMilestone = UNLOCKED_MILESTONES.find(m => m.isNew)
    if (newMilestone) {
      const timer = setTimeout(() => {
        setCelebratingMilestone(newMilestone)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const unlockedIds = useMemo(() =>
    new Set(UNLOCKED_MILESTONES.map(m => m.type)),
    [],
  )

  const filteredMilestones = useMemo(() => {
    return MILESTONE_DEFINITIONS.filter(m => {
      const isUnlocked = unlockedIds.has(m.type)
      if (filter === 'unlocked' && !isUnlocked) return false
      if (filter === 'locked'   &&  isUnlocked) return false
      if (category !== 'all' && m.category !== category) return false
      return true
    })
  }, [filter, category, unlockedIds])

  const handleCelebrate = useCallback((milestone: Milestone) => {
    setCelebratingMilestone(milestone)
  }, [])

  const categories = ['all', ...Object.keys(CATEGORY_CONFIG)]

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold text-walnut-900
                           dark:text-cream-100">
              Milestones 🏆
            </h1>
            <p className="text-sm text-brown-400 dark:text-cream-400 font-ui mt-0.5">
              {UNLOCKED_MILESTONES.length} of {MILESTONE_DEFINITIONS.length} achievements unlocked
            </p>
          </div>

          {/* Quick celebrate new */}
          {UNLOCKED_MILESTONES.some(m => m.isNew) && (
            <button
              onClick={() => {
                const newM = UNLOCKED_MILESTONES.find(m => m.isNew)
                if (newM) setCelebratingMilestone(newM)
              }}
              className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2
                         animate-pulse-gold"
            >
              🎉 New Achievement!
            </button>
          )}
        </div>

        {/* Progress section */}
        <ProgressSection
          unlockedCount={UNLOCKED_MILESTONES.length}
          totalCount={MILESTONE_DEFINITIONS.length}
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-sand-100 dark:bg-walnut-800/60
                          rounded-xl p-1">
            {(['all', 'unlocked', 'locked'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  px-3 py-1.5 rounded-lg text-xs font-ui font-medium
                  transition-all duration-200 capitalize
                  ${filter === f
                    ? 'bg-white dark:bg-walnut-700 text-walnut-700 dark:text-cream-100 shadow-sm'
                    : 'text-brown-400 dark:text-cream-500 hover:text-walnut-600'
                  }
                `}
              >
                {f === 'all' ? 'All' : f === 'unlocked' ? '✓ Unlocked' : '🔒 Locked'}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => {
              const cfg = cat === 'all' ? null : CATEGORY_CONFIG[cat]
              const Icon = cfg?.icon
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs
                    font-ui font-medium transition-all duration-200 capitalize
                    ${category === cat
                      ? cfg
                        ? `${cfg.bg} ${cfg.color} border border-current/30`
                        : 'bg-walnut-800 dark:bg-cream-100 text-cream-100 dark:text-walnut-900'
                      : 'border border-sand-200 dark:border-walnut-600/50 text-brown-400 dark:text-cream-500 hover:border-gold-300/50'
                    }
                  `}
                >
                  {Icon && <Icon size={12} />}
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Milestone grid */}
        {filteredMilestones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="text-5xl">🏆</div>
            <p className="text-sm font-ui text-brown-400 dark:text-cream-500">
              No milestones in this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
                          gap-4">
            {filteredMilestones.map((milestone, i) => {
              const isUnlocked   = unlockedIds.has(milestone.type)
              const unlockedData = UNLOCKED_MILESTONES.find(m => m.type === milestone.type)
              return (
                <div
                  key={milestone.type}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <MilestoneCard
                    milestone={milestone}
                    isUnlocked={isUnlocked}
                    unlockedData={unlockedData}
                    onCelebrate={handleCelebrate}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* Motivational footer */}
        <div className="card-premium p-5 flex items-center gap-4
                        bg-gradient-to-r from-walnut-800 to-coffee-600
                        border-walnut-700/40 dark:border-walnut-600/30">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 flex items-center
                          justify-center flex-shrink-0 text-2xl">
            ✨
          </div>
          <div>
            <p className="text-sm font-ui font-semibold text-cream-100 mb-0.5">
              Keep going, {user?.displayName?.split(' ')[0] || 'Creator'}!
            </p>
            <p className="text-xs text-cream-400 leading-relaxed">
              You&apos;ve unlocked {UNLOCKED_MILESTONES.length} milestones so far.
              {MILESTONE_DEFINITIONS.length - UNLOCKED_MILESTONES.length} more await you —
              each one a celebration of your dedication to music.
            </p>
          </div>
        </div>
      </div>

      {/* Celebration modal */}
      {celebratingMilestone && (
        <NewMilestoneModal
          milestone={celebratingMilestone}
          onClose={() => setCelebratingMilestone(null)}
        />
      )}
    </DashboardLayout>
  )
}
