/* ============================================================
   SVARAVERSE AI — AI Poster Generator Page
   Template Selection | Song Picker | Theme | Preview | Download
   ============================================================ */

'use client'

import React, { useState, useCallback, useRef } from 'react'
import {
  Sparkles, Download, Share2, RefreshCw, Image as ImageIcon,
  Music, Palette, Type, Layout, ChevronRight, Check,
  Instagram, Youtube, Smartphone, Monitor, Copy,
  Loader2, Plus, Star, Crown,
} from 'lucide-react'
import toast from 'react-hot-toast'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth }     from '@/context/AuthContext'
import { POSTER_TYPE_OPTIONS } from '@/lib/constants'
import { PosterType, SubscriptionPlan } from '@/types'

// ─── POSTER TYPES CONFIG ─────────────────────────────────────────────────────

const POSTER_SIZE: Record<string, { w: number; h: number; label: string }> = {
  [PosterType.INSTAGRAM_POST]:  { w: 1080, h: 1080, label: '1080×1080' },
  [PosterType.INSTAGRAM_STORY]: { w: 1080, h: 1920, label: '1080×1920' },
  [PosterType.YOUTUBE_THUMB]:   { w: 1280, h: 720,  label: '1280×720'  },
  [PosterType.ALBUM_COVER]:     { w: 3000, h: 3000, label: '3000×3000' },
  [PosterType.FESTIVAL_POSTER]: { w: 1080, h: 1350, label: '1080×1350' },
  [PosterType.MINIMAL_POSTER]:  { w: 1080, h: 1350, label: '1080×1350' },
  [PosterType.PREMIUM_POSTER]:  { w: 1080, h: 1350, label: '1080×1350' },
  [PosterType.WALLPAPER]:       { w: 1920, h: 1080, label: '1920×1080' },
}

// ─── THEME CONFIG ─────────────────────────────────────────────────────────────

const THEMES = [
  {
    id:    'gold',
    label: 'Golden Hour',
    bg:    'linear-gradient(135deg, #2A1D08 0%, #6E4818 50%, #B45309 100%)',
    accent:'#F59E0B',
    text:  '#FAF5E8',
    preview:['#2A1D08', '#B45309', '#F59E0B'],
  },
  {
    id:    'dark',
    label: 'Midnight',
    bg:    'linear-gradient(135deg, #0F0F0F 0%, #1A1A2E 50%, #16213E 100%)',
    accent:'#E2B96F',
    text:  '#F0F0F0',
    preview:['#0F0F0F', '#1A1A2E', '#E2B96F'],
  },
  {
    id:    'minimal',
    label: 'Cream & Gold',
    bg:    'linear-gradient(135deg, #FAF5E8 0%, #F5EDD3 100%)',
    accent:'#B45309',
    text:  '#2A1D08',
    preview:['#FAF5E8', '#F5EDD3', '#B45309'],
  },
  {
    id:    'festival',
    label: 'Festival',
    bg:    'linear-gradient(135deg, #7B2D8B 0%, #C0392B 50%, #E74C3C 100%)',
    accent:'#F1C40F',
    text:  '#FFFFFF',
    preview:['#7B2D8B', '#C0392B', '#F1C40F'],
  },
  {
    id:    'classic',
    label: 'Classical',
    bg:    'linear-gradient(135deg, #1a0a00 0%, #3d1f00 50%, #6b3a00 100%)',
    accent:'#C9A84C',
    text:  '#FFF8E7',
    preview:['#1a0a00', '#3d1f00', '#C9A84C'],
  },
  {
    id:    'pastel',
    label: 'Pastel Bloom',
    bg:    'linear-gradient(135deg, #FFE4E1 0%, #E8D5F5 50%, #D4E8F5 100%)',
    accent:'#8B4513',
    text:  '#2D1B00',
    preview:['#FFE4E1', '#E8D5F5', '#8B4513'],
  },
]

// ─── MOCK SONGS ───────────────────────────────────────────────────────────────

const MOCK_SONGS = [
  { id: '1', title: 'Tum Hi Ho',          artist: 'Arijit Singh',   scale: 'C#' },
  { id: '2', title: 'Kesariya',           artist: 'Arijit Singh',   scale: 'D'  },
  { id: '3', title: 'Raataan Lambiyan',   artist: 'Jubin Nautiyal', scale: 'F'  },
  { id: '4', title: 'Channa Mereya',      artist: 'Arijit Singh',   scale: 'A'  },
  { id: '5', title: 'Agar Tum Saath Ho',  artist: 'Alka Yagnik',   scale: 'G'  },
]

// ─── POSTER CANVAS (SVG Preview) ─────────────────────────────────────────────

function PosterCanvas({
  type,
  theme,
  songTitle,
  artistName,
  creatorName,
  tagline,
}: {
  type:        string
  theme:       typeof THEMES[number]
  songTitle:   string
  artistName:  string
  creatorName: string
  tagline:     string
}) {
  const isStory   = type === PosterType.INSTAGRAM_STORY
  const isWide    = type === PosterType.YOUTUBE_THUMB || type === PosterType.WALLPAPER
  const viewW     = isWide ? 640 : 360
  const viewH     = isStory ? 640 : 360
  const aspectCls = isStory ? 'aspect-[9/16]' : isWide ? 'aspect-[16/9]' : 'aspect-square'

  // Decorative music notes positions
  const notes = [
    { x: 30,  y: 50,  size: 28, opacity: 0.15, symbol: '♪' },
    { x: 290, y: 30,  size: 22, opacity: 0.12, symbol: '♫' },
    { x: 20,  y: 280, size: 18, opacity: 0.10, symbol: '♩' },
    { x: 310, y: 290, size: 24, opacity: 0.13, symbol: '𝄞' },
    { x: 150, y: 20,  size: 16, opacity: 0.08, symbol: '♬' },
  ]

  return (
    <div className={`w-full ${aspectCls} rounded-2xl overflow-hidden shadow-2xl
                     relative select-none`}>
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
      >
        {/* Background */}
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={theme.preview[0]} />
            <stop offset="50%"  stopColor={theme.preview[1]} />
            <stop offset="100%" stopColor={theme.preview[2]} />
          </linearGradient>
          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={theme.accent} stopOpacity="0.8" />
            <stop offset="100%" stopColor={theme.accent} stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* BG fill */}
        <rect width={viewW} height={viewH} fill="url(#bgGrad)" />

        {/* Decorative circles */}
        <circle cx={viewW * 0.85} cy={viewH * 0.15} r="80"
                fill={theme.accent} opacity="0.06" />
        <circle cx={viewW * 0.1}  cy={viewH * 0.8}  r="60"
                fill={theme.accent} opacity="0.05" />

        {/* Top gold line */}
        <rect x="0" y="0" width={viewW} height="3"
              fill="url(#accentGrad)" />

        {/* Floating music notes */}
        {notes.map((n, i) => (
          <text key={i} x={n.x} y={n.y} fontSize={n.size}
                fill={theme.accent} opacity={n.opacity}
                fontFamily="serif">
            {n.symbol}
          </text>
        ))}

        {/* Center ornament circle */}
        <circle cx={viewW / 2} cy={viewH * 0.42} r={viewW * 0.2}
                fill={theme.accent} opacity="0.08" />
        <circle cx={viewW / 2} cy={viewH * 0.42} r={viewW * 0.18}
                fill="none" stroke={theme.accent} strokeWidth="1"
                opacity="0.2" />

        {/* Large musical note icon */}
        <text
          x={viewW / 2} y={viewH * 0.45}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={viewW * 0.12}
          fill={theme.accent} opacity="0.7"
          filter="url(#glow)"
        >
          🎵
        </text>

        {/* Song title */}
        <text
          x={viewW / 2}
          y={viewH * 0.62}
          textAnchor="middle"
          fontSize={viewW * 0.065}
          fontWeight="700"
          fill={theme.text}
          fontFamily="Playfair Display, Georgia, serif"
          letterSpacing="-0.5"
        >
          {(songTitle || 'Song Title').slice(0, 20)}
        </text>

        {/* Artist name */}
        <text
          x={viewW / 2}
          y={viewH * 0.72}
          textAnchor="middle"
          fontSize={viewW * 0.038}
          fill={theme.accent}
          opacity="0.9"
          letterSpacing="1"
          fontFamily="DM Sans, sans-serif"
        >
          {(artistName || 'Original Artist').toUpperCase()}
        </text>

        {/* Divider line */}
        <line
          x1={viewW / 2 - 40} y1={viewH * 0.77}
          x2={viewW / 2 + 40} y2={viewH * 0.77}
          stroke={theme.accent} strokeWidth="1" opacity="0.5"
        />

        {/* Tagline */}
        <text
          x={viewW / 2}
          y={viewH * 0.83}
          textAnchor="middle"
          fontSize={viewW * 0.03}
          fill={theme.text}
          opacity="0.6"
          fontFamily="DM Sans, sans-serif"
        >
          {tagline || 'A Cover by'} {creatorName || 'Creator'}
        </text>

        {/* Bottom brand */}
        <text
          x={viewW / 2}
          y={viewH * 0.93}
          textAnchor="middle"
          fontSize={viewW * 0.025}
          fill={theme.accent}
          opacity="0.4"
          letterSpacing="2"
          fontFamily="DM Sans, sans-serif"
        >
          SVARAVERSE AI
        </text>

        {/* Bottom gold line */}
        <rect x="0" y={viewH - 3} width={viewW} height="3"
              fill="url(#accentGrad)" />
      </svg>
    </div>
  )
}

// ─── POSTER GALLERY (generated history) ──────────────────────────────────────

function PosterGallery() {
  const gallery = [
    { title: 'Tum Hi Ho',       type: 'Instagram Post',  theme: 'Golden Hour', date: '2 days ago' },
    { title: 'Kesariya',        type: 'YouTube Thumbnail',theme: 'Midnight',    date: '5 days ago' },
    { title: 'Channa Mereya',   type: 'Instagram Story', theme: 'Classical',   date: '1 week ago' },
  ]

  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-ui font-semibold text-sm text-walnut-800 dark:text-cream-100">
          Recent Posters
        </p>
        <button className="text-xs font-ui text-primary hover:text-primary-hover
                           transition-colors">
          View all →
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {gallery.map((item, i) => (
          <div key={i}
               className="flex items-center gap-3 p-3 rounded-xl
                          hover:bg-sand-50/60 dark:hover:bg-walnut-800/30
                          transition-colors group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-200
                            to-gold-400 dark:from-gold-800 dark:to-walnut-700
                            flex items-center justify-center text-xl flex-shrink-0">
              🎨
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-ui font-semibold text-walnut-700
                            dark:text-cream-200 truncate">
                {item.title}
              </p>
              <p className="text-2xs text-brown-400 dark:text-cream-500">
                {item.type} · {item.theme}
              </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100
                            transition-opacity">
              <button className="w-7 h-7 flex items-center justify-center rounded-lg
                                 text-brown-400 hover:text-walnut-700 dark:hover:text-cream-200
                                 hover:bg-sand-100 dark:hover:bg-walnut-700/40 transition-colors">
                <Download size={13} />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg
                                 text-brown-400 hover:text-walnut-700 dark:hover:text-cream-200
                                 hover:bg-sand-100 dark:hover:bg-walnut-700/40 transition-colors">
                <Share2 size={13} />
              </button>
            </div>
            <p className="text-2xs text-brown-300 dark:text-cream-600 flex-shrink-0">
              {item.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── POSTERS PAGE ─────────────────────────────────────────────────────────────

export default function PostersPage() {
  const { user } = useAuth()

  const [posterType,  setPosterType]  = useState<string>(PosterType.INSTAGRAM_POST)
  const [selectedSong,setSelectedSong]= useState<typeof MOCK_SONGS[number] | null>(MOCK_SONGS[0])
  const [selectedTheme,setSelectedTheme]= useState(THEMES[0])
  const [creatorName, setCreatorName] = useState(user?.displayName || '')
  const [tagline,     setTagline]     = useState('A Cover by')
  const [generating,  setGenerating]  = useState(false)
  const [generated,   setGenerated]   = useState(false)
  const [step,        setStep]        = useState(0)   // 0=type, 1=song, 2=theme, 3=text, 4=preview

  const isPremium = user?.plan === SubscriptionPlan.PREMIUM
    || user?.plan === SubscriptionPlan.PRO

  const handleGenerate = async () => {
    setGenerating(true)
    setStep(4)
    await new Promise(r => setTimeout(r, 2000))
    setGenerating(false)
    setGenerated(true)
    toast.success('Poster generated! 🎨')
  }

  const handleDownload = () => {
    toast.success('Poster downloaded!')
  }

  const handleRegenerate = async () => {
    setGenerated(false)
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1800))
    setGenerating(false)
    setGenerated(true)
    toast.success('New variation generated!')
  }

  const STEPS = [
    { label: 'Format',   icon: Layout    },
    { label: 'Song',     icon: Music     },
    { label: 'Theme',    icon: Palette   },
    { label: 'Text',     icon: Type      },
    { label: 'Preview',  icon: ImageIcon },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold text-walnut-900
                           dark:text-cream-100">
              AI Poster Generator 🎨
            </h1>
            <p className="text-sm text-brown-400 dark:text-cream-400 font-ui mt-0.5">
              Create stunning visuals for your music content
            </p>
          </div>
          {!isPremium && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl
                            bg-gold-50 dark:bg-gold-900/20 border border-gold-300/50">
              <Crown size={15} className="text-gold-600" />
              <span className="text-xs font-ui font-medium text-gold-dark">
                3 free posters remaining this month
              </span>
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="card-premium p-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.label}>
                <button
                  onClick={() => setStep(i)}
                  className={`flex flex-col items-center gap-1 group`}
                >
                  <div className={`
                    w-9 h-9 rounded-xl flex items-center justify-center
                    transition-all duration-200
                    ${step === i
                      ? 'bg-gradient-gold shadow-gold'
                      : step > i
                      ? 'bg-green-100 dark:bg-green-900/20'
                      : 'bg-sand-100 dark:bg-walnut-800/60'
                    }
                  `}>
                    {step > i
                      ? <Check size={15} className="text-green-600" />
                      : <s.icon size={15} className={
                          step === i
                            ? 'text-cream-50'
                            : 'text-brown-400 dark:text-cream-500'
                        } />
                    }
                  </div>
                  <span className={`text-2xs font-ui font-medium hidden sm:block
                                    ${step === i
                                      ? 'text-walnut-700 dark:text-cream-200'
                                      : 'text-brown-400 dark:text-cream-500'
                                    }`}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300
                                   ${step > i
                                     ? 'bg-green-400'
                                     : 'bg-sand-200 dark:bg-walnut-700'
                                   }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Left — Configuration */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* Step 0 — Format */}
            {step === 0 && (
              <div className="card-premium p-5 animate-fade-right">
                <h3 className="font-display font-semibold text-base text-walnut-800
                               dark:text-cream-100 mb-4">
                  Choose Format
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {POSTER_TYPE_OPTIONS.map(opt => {
                    const size = POSTER_SIZE[opt.value]
                    const selected = posterType === opt.value

                    const PlatformIcon = opt.value.includes('instagram')
                      ? Instagram
                      : opt.value.includes('youtube')
                      ? Youtube
                      : opt.value === PosterType.WALLPAPER
                      ? Monitor
                      : Smartphone

                    return (
                      <button
                        key={opt.value}
                        onClick={() => setPosterType(opt.value)}
                        className={`
                          p-3.5 rounded-2xl text-left border transition-all duration-200
                          ${selected
                            ? 'border-gold-400/70 bg-gold-50/50 dark:bg-gold-900/10'
                            : 'border-sand-200/60 dark:border-walnut-700/40 hover:border-gold-300/50'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <PlatformIcon size={14}
                            className={selected ? 'text-gold-600' : 'text-brown-400 dark:text-cream-500'} />
                          <span className={`text-xs font-ui font-semibold
                                          ${selected ? 'text-walnut-800 dark:text-cream-100' : 'text-brown-500 dark:text-cream-300'}`}>
                            {opt.label.replace(/\(.*\)/, '').trim()}
                          </span>
                        </div>
                        {size && (
                          <p className="text-2xs text-brown-400 dark:text-cream-600 font-mono">
                            {size.label}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
                <button onClick={() => setStep(1)}
                        className="btn-primary w-full mt-4 py-2.5 text-sm flex
                                   items-center justify-center gap-2">
                  Next: Choose Song <ChevronRight size={15} />
                </button>
              </div>
            )}

            {/* Step 1 — Song */}
            {step === 1 && (
              <div className="card-premium p-5 animate-fade-right">
                <h3 className="font-display font-semibold text-base text-walnut-800
                               dark:text-cream-100 mb-4">
                  Select Song
                </h3>
                <div className="flex flex-col gap-2">
                  {MOCK_SONGS.map(song => (
                    <button
                      key={song.id}
                      onClick={() => setSelectedSong(song)}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl text-left
                        border transition-all duration-200
                        ${selectedSong?.id === song.id
                          ? 'border-gold-400/60 bg-gold-50/40 dark:bg-gold-900/10'
                          : 'border-sand-200/60 dark:border-walnut-700/40 hover:border-gold-300/50'
                        }
                      `}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br
                                      from-gold-200 to-gold-400 dark:from-gold-800
                                      dark:to-walnut-700 flex items-center justify-center
                                      text-lg flex-shrink-0">
                        🎵
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-ui font-semibold text-walnut-700
                                     dark:text-cream-200 truncate">
                          {song.title}
                        </p>
                        <p className="text-xs text-brown-400 dark:text-cream-500">
                          {song.artist} · Key: {song.scale}
                        </p>
                      </div>
                      {selectedSong?.id === song.id && (
                        <Check size={16} className="text-gold-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setStep(0)}
                          className="btn-ghost flex-1 text-sm py-2.5">
                    ← Back
                  </button>
                  <button onClick={() => setStep(2)}
                          className="btn-primary flex-1 text-sm py-2.5 flex
                                     items-center justify-center gap-2">
                    Next: Theme <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Theme */}
            {step === 2 && (
              <div className="card-premium p-5 animate-fade-right">
                <h3 className="font-display font-semibold text-base text-walnut-800
                               dark:text-cream-100 mb-4">
                  Choose Theme
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme)}
                      className={`
                        relative rounded-2xl overflow-hidden transition-all
                        duration-200 border-2 aspect-[4/3]
                        ${selectedTheme.id === theme.id
                          ? 'border-gold-500 shadow-gold'
                          : 'border-transparent hover:border-sand-300 dark:hover:border-walnut-600'
                        }
                      `}
                    >
                      {/* Theme preview */}
                      <div className="w-full h-full"
                           style={{ background: theme.bg }} />

                      {/* Label overlay */}
                      <div className="absolute inset-0 flex flex-col items-center
                                      justify-end pb-2">
                        <span className="text-2xs font-ui font-semibold px-2 py-0.5
                                         rounded-full bg-black/30 backdrop-blur-sm
                                         text-white/90">
                          {theme.label}
                        </span>
                      </div>

                      {/* Selected check */}
                      {selectedTheme.id === theme.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full
                                        bg-gold-500 flex items-center justify-center">
                          <Check size={11} className="text-cream-50" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setStep(1)}
                          className="btn-ghost flex-1 text-sm py-2.5">
                    ← Back
                  </button>
                  <button onClick={() => setStep(3)}
                          className="btn-primary flex-1 text-sm py-2.5 flex
                                     items-center justify-center gap-2">
                    Next: Text <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Text */}
            {step === 3 && (
              <div className="card-premium p-5 animate-fade-right">
                <h3 className="font-display font-semibold text-base text-walnut-800
                               dark:text-cream-100 mb-4">
                  Customize Text
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="form-label">Your Name / Channel Name</label>
                    <input
                      value={creatorName}
                      onChange={e => setCreatorName(e.target.value)}
                      placeholder="Your name"
                      className="form-input dark:bg-walnut-800/60 dark:border-walnut-600/60
                                 dark:text-cream-100"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="form-label">Tagline</label>
                    <input
                      value={tagline}
                      onChange={e => setTagline(e.target.value)}
                      placeholder="A Cover by"
                      className="form-input dark:bg-walnut-800/60 dark:border-walnut-600/60
                                 dark:text-cream-100"
                    />
                  </div>

                  {/* Quick taglines */}
                  <div>
                    <p className="text-xs font-ui text-brown-400 dark:text-cream-500 mb-2">
                      Quick taglines:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['A Cover by', 'Singing', 'Recreated by', 'My Version of', 'Performed by'].map(t => (
                        <button
                          key={t}
                          onClick={() => setTagline(t)}
                          className={`text-xs font-ui px-2.5 py-1 rounded-xl border
                                     transition-all duration-200
                                     ${tagline === t
                                       ? 'border-gold-300/60 bg-gold-50 dark:bg-gold-900/20 text-gold-dark'
                                       : 'border-sand-200 dark:border-walnut-600/50 text-brown-400 dark:text-cream-500 hover:border-gold-300/50'
                                     }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => setStep(2)}
                          className="btn-ghost flex-1 text-sm py-2.5">
                    ← Back
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="btn-primary flex-1 text-sm py-2.5 flex
                               items-center justify-center gap-2"
                  >
                    <Sparkles size={15} />
                    Generate Poster
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 — Preview actions */}
            {step === 4 && generated && (
              <div className="card-premium p-5 animate-fade-right">
                <h3 className="font-display font-semibold text-base text-walnut-800
                               dark:text-cream-100 mb-4">
                  Your Poster is Ready! 🎉
                </h3>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleDownload}
                    className="btn-primary w-full py-3 text-sm flex items-center
                               justify-center gap-2"
                  >
                    <Download size={16} />
                    Download ({POSTER_SIZE[posterType]?.label})
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleRegenerate}
                      className="btn-ghost py-2.5 text-sm flex items-center
                                 justify-center gap-2"
                    >
                      <RefreshCw size={14} />
                      Regenerate
                    </button>
                    <button
                      onClick={() => {
                        toast.success('Link copied!')
                      }}
                      className="btn-ghost py-2.5 text-sm flex items-center
                                 justify-center gap-2"
                    >
                      <Share2 size={14} />
                      Share
                    </button>
                  </div>

                  <div className="h-px bg-sand-200 dark:bg-walnut-700/60" />

                  <button
                    onClick={() => { setStep(0); setGenerated(false) }}
                    className="text-xs font-ui text-primary hover:text-primary-hover
                               transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    Create another poster
                  </button>
                </div>

                {/* Poster details */}
                <div className="mt-4 glass rounded-xl p-3 grid grid-cols-2 gap-2">
                  {[
                    { label: 'Format', value: POSTER_TYPE_OPTIONS.find(o => o.value === posterType)?.label?.replace(/\(.*\)/, '') || '' },
                    { label: 'Size',   value: POSTER_SIZE[posterType]?.label || '' },
                    { label: 'Song',   value: selectedSong?.title || '' },
                    { label: 'Theme',  value: selectedTheme.label },
                  ].map(d => (
                    <div key={d.label}>
                      <p className="text-2xs text-brown-400 dark:text-cream-600 font-ui">
                        {d.label}
                      </p>
                      <p className="text-xs font-ui font-semibold text-walnut-700
                                   dark:text-cream-200 truncate">
                        {d.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent posters gallery */}
            <PosterGallery />
          </div>

          {/* Right — Live Preview */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="card-premium p-4">
              <p className="text-xs font-ui font-bold uppercase tracking-wide
                            text-brown-400 dark:text-cream-500 mb-3">
                Live Preview
              </p>

              {generating ? (
                <div className="aspect-square rounded-2xl bg-gradient-to-br
                                from-sand-100 to-sand-200 dark:from-walnut-800
                                dark:to-walnut-700 flex flex-col items-center
                                justify-center gap-4">
                  <Loader2 size={32} className="text-gold-500 animate-spin" />
                  <div className="text-center">
                    <p className="text-sm font-ui font-semibold text-walnut-700
                                  dark:text-cream-200">
                      Generating your poster...
                    </p>
                    <p className="text-xs text-brown-400 dark:text-cream-500 mt-1">
                      AI is creating your design
                    </p>
                  </div>
                </div>
              ) : (
                <PosterCanvas
                  type={posterType}
                  theme={selectedTheme}
                  songTitle={selectedSong?.title || ''}
                  artistName={selectedSong?.artist || ''}
                  creatorName={creatorName}
                  tagline={tagline}
                />
              )}

              {/* Format badge */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-2xs font-mono text-brown-400
                                 dark:text-cream-600">
                  {POSTER_SIZE[posterType]?.label}
                </span>
                <span className="text-2xs font-ui text-brown-400
                                 dark:text-cream-600">
                  {selectedTheme.label}
                </span>
              </div>
            </div>

            {/* Tips */}
            <div className="card-premium p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} className="text-gold-500" />
                <p className="text-xs font-ui font-bold uppercase tracking-wide
                              text-brown-400 dark:text-cream-500">
                  Pro Tips
                </p>
              </div>
              <ul className="flex flex-col gap-2">
                {[
                  'Use "Golden Hour" theme for romantic Bollywood covers',
                  'Story format works best for Instagram reels promotion',
                  'Add your channel name for brand recognition',
                  'Regenerate to get different layout variations',
                ].map((tip, i) => (
                  <li key={i} className="text-xs font-ui text-brown-400
                                        dark:text-cream-500 flex items-start gap-2">
                    <span className="text-gold-400 mt-0.5">›</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
