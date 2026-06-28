/* ============================================================
   SVARAVERSE AI — Song Library Page
   Grid/List | Search | Filters | Upload | Song Cards
   ============================================================ */

'use client'

import React, {
  useState, useEffect, useCallback, useRef, useMemo,
} from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search, Plus, Grid3X3, List, Filter, SortAsc,
  Music, Heart, HeartOff, Play, Pause, MoreVertical,
  Upload, X, ChevronDown, Star, Mic2, CheckCircle,
  Clock, Tag, Globe, Gauge, Trash2, Edit3, Share2,
  Download, BookOpen,
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

import DashboardLayout from '@/components/layout/DashboardLayout'
import {
  LANGUAGE_OPTIONS, MOOD_OPTIONS, DIFFICULTY_OPTIONS,
  STATUS_OPTIONS, MUSICAL_SCALES, UPLOAD_LIMITS,
  SUCCESS_MESSAGES, ERROR_MESSAGES,
} from '@/lib/constants'
import {
  type Song, SongStatus, SongDifficulty, SongLanguage,
  SongMood, SubscriptionPlan,
} from '@/types'
import { useAuth } from '@/context/AuthContext'

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_SONGS: Song[] = [
  {
    id: '1', userId: 'u1', title: 'Tum Hi Ho', artist: 'Arijit Singh',
    movie: 'Aashiqui 2', language: SongLanguage.HINDI, mood: SongMood.ROMANTIC,
    scale: 'C#', difficulty: SongDifficulty.INTERMEDIATE,
    status: [SongStatus.PRACTICED, SongStatus.RECORDED],
    tags: ['bollywood', 'romantic', 'arijit'], lyrics: '',
    practiceCount: 24, totalPracticeMin: 720,
    lastPracticedAt: '2024-01-15', isFavourite: true, isPublic: true,
    createdAt: '2024-01-01', updatedAt: '2024-01-15',
  },
  {
    id: '2', userId: 'u1', title: 'Kesariya', artist: 'Arijit Singh',
    movie: 'Brahmastra', language: SongLanguage.HINDI, mood: SongMood.ROMANTIC,
    scale: 'D', difficulty: SongDifficulty.INTERMEDIATE,
    status: [SongStatus.PRACTICED, SongStatus.POSTED],
    tags: ['bollywood', 'trending'],
    practiceCount: 18, totalPracticeMin: 540,
    lastPracticedAt: '2024-01-20', isFavourite: true, isPublic: true,
    createdAt: '2024-01-05', updatedAt: '2024-01-20',
  },
  {
    id: '3', userId: 'u1', title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal',
    movie: 'Shershaah', language: SongLanguage.HINDI, mood: SongMood.ROMANTIC,
    scale: 'F', difficulty: SongDifficulty.BEGINNER,
    status: [SongStatus.IN_PROGRESS],
    tags: ['bollywood', 'easy'],
    practiceCount: 8, totalPracticeMin: 240,
    lastPracticedAt: '2024-01-18', isFavourite: false, isPublic: false,
    createdAt: '2024-01-10', updatedAt: '2024-01-18',
  },
  {
    id: '4', userId: 'u1', title: 'Agar Tum Saath Ho', artist: 'Alka Yagnik',
    movie: 'Tamasha', language: SongLanguage.HINDI, mood: SongMood.SAD,
    scale: 'G', difficulty: SongDifficulty.ADVANCED,
    status: [SongStatus.NEED_IMPROVEMENT],
    tags: ['ar-rahman', 'emotional'],
    practiceCount: 12, totalPracticeMin: 360,
    lastPracticedAt: '2024-01-12', isFavourite: false, isPublic: false,
    createdAt: '2024-01-08', updatedAt: '2024-01-12',
  },
  {
    id: '5', userId: 'u1', title: 'Channa Mereya', artist: 'Arijit Singh',
    movie: 'Ae Dil Hai Mushkil', language: SongLanguage.HINDI, mood: SongMood.SAD,
    scale: 'A', difficulty: SongDifficulty.ADVANCED,
    status: [SongStatus.PRACTICED],
    tags: ['bollywood', 'classical-touches'],
    practiceCount: 30, totalPracticeMin: 900,
    lastPracticedAt: '2024-01-22', isFavourite: true, isPublic: true,
    createdAt: '2023-12-01', updatedAt: '2024-01-22',
  },
  {
    id: '6', userId: 'u1', title: 'Kalank', artist: 'Arijit Singh',
    movie: 'Kalank', language: SongLanguage.HINDI, mood: SongMood.CLASSICAL,
    scale: 'D#', difficulty: SongDifficulty.EXPERT,
    status: [SongStatus.DRAFT],
    tags: ['classical', 'difficult'],
    practiceCount: 3, totalPracticeMin: 90,
    lastPracticedAt: '2024-01-05', isFavourite: false, isPublic: false,
    createdAt: '2024-01-03', updatedAt: '2024-01-05',
  },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  [SongStatus.PRACTICED]:        { label: 'Practiced',        color: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/20'  },
  [SongStatus.RECORDED]:         { label: 'Recorded',         color: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/20'   },
  [SongStatus.POSTED]:           { label: 'Posted',           color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20'},
  [SongStatus.NEED_IMPROVEMENT]: { label: 'Needs Work',       color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20'},
  [SongStatus.FAVOURITE]:        { label: 'Favourite',        color: 'text-gold-600',   bg: 'bg-gold-100 dark:bg-gold-900/20'   },
  [SongStatus.IN_PROGRESS]:      { label: 'In Progress',      color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/10'    },
  [SongStatus.DRAFT]:            { label: 'Draft',            color: 'text-brown-500',  bg: 'bg-sand-100 dark:bg-walnut-700/30' },
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; dots: number }> = {
  [SongDifficulty.BEGINNER]:     { label: 'Beginner',     color: 'text-green-500',  dots: 1 },
  [SongDifficulty.INTERMEDIATE]: { label: 'Intermediate', color: 'text-yellow-500', dots: 2 },
  [SongDifficulty.ADVANCED]:     { label: 'Advanced',     color: 'text-orange-500', dots: 3 },
  [SongDifficulty.EXPERT]:       { label: 'Expert',       color: 'text-red-500',    dots: 4 },
}

function DifficultyDots({ difficulty }: { difficulty: SongDifficulty }) {
  const cfg = DIFFICULTY_CONFIG[difficulty]
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors
                      ${i < cfg.dots ? cfg.color.replace('text-', 'bg-') : 'bg-sand-300 dark:bg-walnut-600'}`}
        />
      ))}
    </div>
  )
}

// ─── SONG CARD (Grid) ─────────────────────────────────────────────────────────

function SongCardGrid({
  song,
  onToggleFavourite,
  onDelete,
  onEdit,
}: {
  song:              Song
  onToggleFavourite: (id: string) => void
  onDelete:          (id: string) => void
  onEdit:            (song: Song) => void
}) {
  const [playing,   setPlaying]   = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const menuRef                   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <div className="card-premium group overflow-hidden flex flex-col">
      {/* Cover image area */}
      <div className="relative aspect-square bg-gradient-to-br
                      from-gold-200 to-gold-400 dark:from-gold-800 dark:to-walnut-700
                      overflow-hidden">
        {song.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={song.coverUrl} alt={song.title}
               className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music size={40} className="text-gold-600/40 dark:text-gold-400/30" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-walnut-900/40 opacity-0
                        group-hover:opacity-100 transition-opacity duration-300
                        flex items-center justify-center">
          <button
            onClick={() => setPlaying(v => !v)}
            className="w-14 h-14 rounded-full bg-cream-50/90 flex items-center
                       justify-center shadow-lg hover:scale-110 transition-transform"
          >
            {playing
              ? <Pause size={24} className="text-walnut-800" />
              : <Play  size={24} className="text-walnut-800 ml-1" />
            }
          </button>
        </div>

        {/* Favourite button */}
        <button
          onClick={() => onToggleFavourite(song.id)}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full
                     bg-walnut-900/50 backdrop-blur-sm flex items-center
                     justify-center opacity-0 group-hover:opacity-100
                     transition-all duration-200 hover:bg-walnut-800/70"
        >
          {song.isFavourite
            ? <Heart size={14} className="text-red-400 fill-red-400" />
            : <Heart size={14} className="text-cream-200" />
          }
        </button>

        {/* Scale badge */}
        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg
                        bg-walnut-900/70 backdrop-blur-sm text-cream-100
                        text-xs font-mono font-bold">
          {song.scale || '—'}
        </div>
      </div>

      {/* Card body */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        {/* Title & Artist */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-ui font-semibold text-sm text-walnut-800
                           dark:text-cream-100 truncate leading-tight">
              {song.title}
            </h3>
            <p className="text-xs text-brown-400 dark:text-cream-500 truncate">
              {song.artist}
              {song.movie && ` · ${song.movie}`}
            </p>
          </div>

          {/* Menu */}
          <div ref={menuRef} className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="w-7 h-7 rounded-lg flex items-center justify-center
                         text-brown-400 hover:text-walnut-700 dark:hover:text-cream-200
                         hover:bg-sand-100 dark:hover:bg-walnut-700/40
                         transition-colors"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 card-premium
                              shadow-xl z-20 overflow-hidden animate-scale-in
                              border border-sand-200/80 dark:border-walnut-600/50">
                {[
                  { label: 'Edit song',    icon: Edit3,    action: () => { onEdit(song);    setMenuOpen(false) } },
                  { label: 'Share',        icon: Share2,   action: () => setMenuOpen(false) },
                  { label: 'Download',     icon: Download, action: () => setMenuOpen(false) },
                  { label: 'Delete',       icon: Trash2,   action: () => { onDelete(song.id); setMenuOpen(false) }, danger: true },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5
                               text-xs font-ui hover:bg-sand-50 dark:hover:bg-walnut-800/50
                               transition-colors text-left
                               ${item.danger
                                 ? 'text-error hover:bg-red-50 dark:hover:bg-red-900/10'
                                 : 'text-walnut-700 dark:text-cream-200'
                               }`}
                  >
                    <item.icon size={13} />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status tags */}
        <div className="flex flex-wrap gap-1">
          {song.status.slice(0, 2).map(s => {
            const cfg = STATUS_CONFIG[s]
            return (
              <span key={s}
                    className={`text-2xs font-ui font-semibold px-1.5 py-0.5
                                rounded-full ${cfg.color} ${cfg.bg}`}>
                {cfg.label}
              </span>
            )
          })}
          {song.status.length > 2 && (
            <span className="text-2xs font-ui text-brown-400 dark:text-cream-600
                             px-1.5 py-0.5">
              +{song.status.length - 2}
            </span>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <DifficultyDots difficulty={song.difficulty} />
          <div className="flex items-center gap-1.5 text-xs font-ui
                          text-brown-400 dark:text-cream-500">
            <Clock size={11} />
            {Math.round(song.totalPracticeMin / 60)}h
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SONG ROW (List) ──────────────────────────────────────────────────────────

function SongRow({
  song,
  onToggleFavourite,
  onDelete,
  onEdit,
}: {
  song:              Song
  onToggleFavourite: (id: string) => void
  onDelete:          (id: string) => void
  onEdit:            (song: Song) => void
}) {
  return (
    <div className="flex items-center gap-4 p-3.5 rounded-2xl
                    hover:bg-sand-50/60 dark:hover:bg-walnut-800/30
                    border border-transparent hover:border-sand-200/60
                    dark:hover:border-walnut-700/40 transition-all duration-200
                    group cursor-pointer">
      {/* Cover */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-200
                      to-gold-400 dark:from-gold-800 dark:to-walnut-700
                      flex items-center justify-center flex-shrink-0 overflow-hidden">
        {song.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={song.coverUrl} alt={song.title}
               className="w-full h-full object-cover" />
        ) : (
          <Music size={20} className="text-gold-600/60" />
        )}
      </div>

      {/* Title + artist */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-ui font-semibold text-walnut-800
                      dark:text-cream-100 truncate">
          {song.title}
        </p>
        <p className="text-xs text-brown-400 dark:text-cream-500 truncate">
          {song.artist}
          {song.movie && ` · ${song.movie}`}
        </p>
      </div>

      {/* Scale */}
      <div className="hidden sm:flex w-10 justify-center">
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg
                         bg-sand-100 dark:bg-walnut-700/50 text-brown-500
                         dark:text-cream-400">
          {song.scale || '—'}
        </span>
      </div>

      {/* Language */}
      <div className="hidden md:flex w-16 justify-center">
        <span className="text-xs font-ui text-brown-400 dark:text-cream-500 capitalize">
          {song.language}
        </span>
      </div>

      {/* Status */}
      <div className="hidden lg:flex gap-1 w-32">
        {song.status.slice(0, 2).map(s => {
          const cfg = STATUS_CONFIG[s]
          return (
            <span key={s}
                  className={`text-2xs font-ui font-semibold px-1.5 py-0.5
                              rounded-full ${cfg.color} ${cfg.bg}`}>
              {cfg.label}
            </span>
          )
        })}
      </div>

      {/* Difficulty */}
      <div className="hidden md:flex w-20 justify-center">
        <DifficultyDots difficulty={song.difficulty} />
      </div>

      {/* Practice time */}
      <div className="hidden sm:flex w-14 justify-end">
        <span className="text-xs font-ui text-brown-400 dark:text-cream-500">
          {Math.round(song.totalPracticeMin / 60)}h
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100
                      transition-opacity duration-200">
        <button
          onClick={() => onToggleFavourite(song.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg
                     hover:bg-sand-100 dark:hover:bg-walnut-700/40 transition-colors"
        >
          <Heart
            size={14}
            className={song.isFavourite
              ? 'text-red-400 fill-red-400'
              : 'text-brown-400 dark:text-cream-500'
            }
          />
        </button>
        <button
          onClick={() => onEdit(song)}
          className="w-7 h-7 flex items-center justify-center rounded-lg
                     hover:bg-sand-100 dark:hover:bg-walnut-700/40 transition-colors
                     text-brown-400 hover:text-walnut-700 dark:hover:text-cream-200"
        >
          <Edit3 size={13} />
        </button>
        <button
          onClick={() => onDelete(song.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg
                     hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors
                     text-brown-400 hover:text-error"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── UPLOAD MODAL ─────────────────────────────────────────────────────────────

function UploadModal({
  open,
  onClose,
  onSave,
}: {
  open:    boolean
  onClose: () => void
  onSave:  (data: Partial<Song>) => void
}) {
  const [step,       setStep]       = useState(0)
  const [formData,   setFormData]   = useState<Partial<Song>>({
    title: '', artist: '', language: SongLanguage.HINDI,
    difficulty: SongDifficulty.INTERMEDIATE, status: [],
    tags: [], isFavourite: false, isPublic: false,
  })
  const [audioFile,  setAudioFile]  = useState<File | null>(null)
  const [coverFile,  setCoverFile]  = useState<File | null>(null)
  const [saving,     setSaving]     = useState(false)
  const [tagInput,   setTagInput]   = useState('')

  const { getRootProps: getAudioProps, getInputProps: getAudioInput } = useDropzone({
    accept: { 'audio/*': UPLOAD_LIMITS.ACCEPTED_AUDIO },
    maxSize: UPLOAD_LIMITS.AUDIO_MAX_MB * 1024 * 1024,
    onDrop: files => setAudioFile(files[0] || null),
  })

  const { getRootProps: getCoverProps, getInputProps: getCoverInput } = useDropzone({
    accept: { 'image/*': UPLOAD_LIMITS.ACCEPTED_IMAGE },
    maxSize: UPLOAD_LIMITS.IMAGE_MAX_MB * 1024 * 1024,
    onDrop: files => setCoverFile(files[0] || null),
  })

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !formData.tags?.includes(t)) {
      setFormData(p => ({ ...p, tags: [...(p.tags || []), t] }))
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setFormData(p => ({ ...p, tags: p.tags?.filter(t => t !== tag) }))
  }

  const toggleStatus = (status: SongStatus) => {
    setFormData(p => ({
      ...p,
      status: p.status?.includes(status)
        ? p.status.filter(s => s !== status)
        : [...(p.status || []), status],
    }))
  }

  const handleSave = async () => {
    if (!formData.title || !formData.artist) {
      toast.error('Title and artist are required.')
      return
    }
    setSaving(true)
    await new Promise(r => setTimeout(r, 800)) // Simulate save
    onSave({ ...formData, id: Date.now().toString() })
    setSaving(false)
    onClose()
    setStep(0)
    setFormData({
      title: '', artist: '', language: SongLanguage.HINDI,
      difficulty: SongDifficulty.INTERMEDIATE, status: [], tags: [],
      isFavourite: false, isPublic: false,
    })
    toast.success(SUCCESS_MESSAGES.SONG_ADDED)
  }

  if (!open) return null

  const Field = ({
    label, children, required,
  }: { label: string; children: React.ReactNode; required?: boolean }) => (
    <div className="flex flex-col gap-1.5">
      <label className="form-label">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {children}
    </div>
  )

  const Input = ({
    value, onChange, placeholder, type = 'text',
  }: {
    value: string; onChange: (v: string) => void
    placeholder?: string; type?: string
  }) => (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="form-input dark:bg-walnut-800/60 dark:border-walnut-600/60
                 dark:text-cream-100 dark:placeholder-cream-600"
    />
  )

  const Select = ({
    value, onChange, options,
  }: {
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
  }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="form-input dark:bg-walnut-800/60 dark:border-walnut-600/60
                 dark:text-cream-100 appearance-none"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-walnut-900/60 backdrop-blur-sm px-4 animate-fade-in">
      <div className="w-full max-w-2xl card-premium shadow-3xl overflow-hidden
                      max-h-[90vh] flex flex-col animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
                        border-b border-sand-200/60 dark:border-walnut-700/40
                        flex-shrink-0">
          <div>
            <h2 className="font-display font-bold text-lg text-walnut-800
                           dark:text-cream-100">
              Add New Song
            </h2>
            <p className="text-xs text-brown-400 dark:text-cream-500 font-ui">
              Step {step + 1} of 3
            </p>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map(i => (
              <div key={i}
                   className={`h-1.5 w-8 rounded-full transition-all duration-300
                               ${i <= step
                                 ? 'bg-gold-500'
                                 : 'bg-sand-200 dark:bg-walnut-700'
                               }`} />
            ))}
            <button
              onClick={onClose}
              className="ml-2 w-8 h-8 flex items-center justify-center rounded-xl
                         text-brown-400 hover:text-walnut-700 dark:hover:text-cream-200
                         hover:bg-sand-100 dark:hover:bg-walnut-700/40 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">

          {/* Step 0 — Basic Info */}
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-right">
              <div className="sm:col-span-2">
                <Field label="Song Title" required>
                  <Input
                    value={formData.title || ''}
                    onChange={v => setFormData(p => ({ ...p, title: v }))}
                    placeholder="e.g. Tum Hi Ho"
                  />
                </Field>
              </div>
              <Field label="Original Singer" required>
                <Input
                  value={formData.artist || ''}
                  onChange={v => setFormData(p => ({ ...p, artist: v }))}
                  placeholder="e.g. Arijit Singh"
                />
              </Field>
              <Field label="Movie / Album">
                <Input
                  value={formData.movie || ''}
                  onChange={v => setFormData(p => ({ ...p, movie: v }))}
                  placeholder="e.g. Aashiqui 2"
                />
              </Field>
              <Field label="Composer">
                <Input
                  value={formData.composer || ''}
                  onChange={v => setFormData(p => ({ ...p, composer: v }))}
                  placeholder="e.g. Mithoon"
                />
              </Field>
              <Field label="Lyricist">
                <Input
                  value={formData.lyricist || ''}
                  onChange={v => setFormData(p => ({ ...p, lyricist: v }))}
                  placeholder="e.g. Irshad Kamil"
                />
              </Field>
              <Field label="Language">
                <Select
                  value={formData.language || SongLanguage.HINDI}
                  onChange={v => setFormData(p => ({ ...p, language: v as SongLanguage }))}
                  options={LANGUAGE_OPTIONS}
                />
              </Field>
              <Field label="Scale (Shruti)">
                <Select
                  value={formData.scale || 'C'}
                  onChange={v => setFormData(p => ({ ...p, scale: v }))}
                  options={MUSICAL_SCALES}
                />
              </Field>
              <Field label="Mood">
                <Select
                  value={formData.mood || ''}
                  onChange={v => setFormData(p => ({ ...p, mood: v as SongMood }))}
                  options={[{ value: '', label: 'Select mood' }, ...MOOD_OPTIONS]}
                />
              </Field>
              <Field label="Difficulty">
                <Select
                  value={formData.difficulty || SongDifficulty.INTERMEDIATE}
                  onChange={v => setFormData(p => ({ ...p, difficulty: v as SongDifficulty }))}
                  options={DIFFICULTY_OPTIONS}
                />
              </Field>
            </div>
          )}

          {/* Step 1 — Status & Tags */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-fade-right">
              {/* Status */}
              <Field label="Practice Status">
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(opt => {
                    const selected = formData.status?.includes(opt.value as SongStatus)
                    const cfg = STATUS_CONFIG[opt.value]
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleStatus(opt.value as SongStatus)}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                          text-xs font-ui font-medium border transition-all duration-200
                          ${selected
                            ? `${cfg.color} ${cfg.bg} border-current/30`
                            : 'text-brown-400 dark:text-cream-500 border-sand-200 dark:border-walnut-600/50 hover:border-gold-300/50'
                          }
                        `}
                      >
                        {selected && <CheckCircle size={12} />}
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </Field>

              {/* Tags */}
              <Field label="Tags">
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTag()}
                    placeholder="Add tag and press Enter"
                    className="form-input flex-1 dark:bg-walnut-800/60
                               dark:border-walnut-600/60 dark:text-cream-100"
                  />
                  <button
                    onClick={addTag}
                    className="btn-ghost px-3 py-2 text-xs"
                  >
                    Add
                  </button>
                </div>
                {(formData.tags?.length || 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.tags?.map(tag => (
                      <span key={tag}
                            className="tag flex items-center gap-1">
                        #{tag}
                        <button onClick={() => removeTag(tag)}
                                className="hover:text-error transition-colors">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>

              {/* Notes */}
              <Field label="Practice Notes">
                <textarea
                  value={formData.notes || ''}
                  onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="What do you want to focus on while practicing this song?"
                  rows={3}
                  className="form-input resize-none dark:bg-walnut-800/60
                             dark:border-walnut-600/60 dark:text-cream-100"
                />
              </Field>

              {/* Toggles */}
              <div className="flex gap-4">
                {[
                  {
                    label: '⭐ Mark as Favourite',
                    key: 'isFavourite' as const,
                    value: formData.isFavourite,
                  },
                  {
                    label: '🌐 Make Public',
                    key: 'isPublic' as const,
                    value: formData.isPublic,
                  },
                ].map(toggle => (
                  <button
                    key={toggle.key}
                    onClick={() => setFormData(p => ({ ...p, [toggle.key]: !toggle.value }))}
                    className={`
                      flex-1 py-2.5 rounded-xl text-xs font-ui font-medium
                      border transition-all duration-200
                      ${toggle.value
                        ? 'bg-gold-100 dark:bg-gold-900/20 text-gold-dark border-gold-300/60'
                        : 'text-brown-400 dark:text-cream-500 border-sand-200 dark:border-walnut-600/50'
                      }
                    `}
                  >
                    {toggle.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Upload files */}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-fade-right">
              {/* Audio upload */}
              <div>
                <p className="form-label mb-2">Audio File (Optional)</p>
                <div
                  {...getAudioProps()}
                  className={`
                    border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer
                    transition-all duration-200
                    ${audioFile
                      ? 'border-gold-400/60 bg-gold-50/50 dark:bg-gold-900/10'
                      : 'border-sand-300 dark:border-walnut-600/50 hover:border-gold-300/60 dark:hover:border-gold-600/30'
                    }
                  `}
                >
                  <input {...getAudioInput()} />
                  {audioFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">🎵</span>
                      <div className="text-left">
                        <p className="text-sm font-ui font-semibold text-walnut-700
                                     dark:text-cream-100 truncate max-w-xs">
                          {audioFile.name}
                        </p>
                        <p className="text-xs text-brown-400 dark:text-cream-500">
                          {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setAudioFile(null) }}
                        className="text-brown-400 hover:text-error transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={28} className="text-brown-300 dark:text-cream-600" />
                      <p className="text-sm font-ui text-brown-400 dark:text-cream-500">
                        Drop audio file here or{' '}
                        <span className="text-primary font-medium">browse</span>
                      </p>
                      <p className="text-xs text-brown-300 dark:text-cream-600">
                        MP3, WAV, FLAC up to {UPLOAD_LIMITS.AUDIO_MAX_MB}MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover upload */}
              <div>
                <p className="form-label mb-2">Cover Image (Optional)</p>
                <div
                  {...getCoverProps()}
                  className={`
                    border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer
                    transition-all duration-200
                    ${coverFile
                      ? 'border-gold-400/60 bg-gold-50/50 dark:bg-gold-900/10'
                      : 'border-sand-300 dark:border-walnut-600/50 hover:border-gold-300/60 dark:hover:border-gold-600/30'
                    }
                  `}
                >
                  <input {...getCoverInput()} />
                  {coverFile ? (
                    <div className="flex items-center justify-center gap-3">
                      {/* Preview */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(coverFile)}
                        alt="Cover preview"
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="text-left">
                        <p className="text-sm font-ui font-semibold text-walnut-700
                                     dark:text-cream-100 truncate max-w-xs">
                          {coverFile.name}
                        </p>
                        <p className="text-xs text-brown-400 dark:text-cream-500">
                          {(coverFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setCoverFile(null) }}
                        className="text-brown-400 hover:text-error transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={28} className="text-brown-300 dark:text-cream-600" />
                      <p className="text-sm font-ui text-brown-400 dark:text-cream-500">
                        Drop cover image here or{' '}
                        <span className="text-primary font-medium">browse</span>
                      </p>
                      <p className="text-xs text-brown-300 dark:text-cream-600">
                        JPG, PNG, WEBP up to {UPLOAD_LIMITS.IMAGE_MAX_MB}MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="glass rounded-2xl p-4">
                <p className="text-xs font-ui font-semibold text-walnut-700
                              dark:text-cream-200 mb-2">
                  Song Summary
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-ui">
                  {[
                    { label: 'Title',     value: formData.title },
                    { label: 'Artist',    value: formData.artist },
                    { label: 'Scale',     value: formData.scale },
                    { label: 'Language',  value: formData.language },
                    { label: 'Difficulty',value: formData.difficulty },
                    { label: 'Status',    value: formData.status?.join(', ') || 'None' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1">
                      <span className="text-brown-400 dark:text-cream-600">
                        {item.label}:
                      </span>
                      <span className="text-walnut-700 dark:text-cream-200
                                       font-medium truncate capitalize">
                        {item.value || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4
                        border-t border-sand-200/60 dark:border-walnut-700/40
                        flex-shrink-0">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
            className="btn-ghost text-sm px-5 py-2.5"
          >
            {step === 0 ? 'Cancel' : '← Back'}
          </button>
          <button
            onClick={() => step < 2 ? setStep(s => s + 1) : handleSave()}
            disabled={saving || (step === 0 && (!formData.title || !formData.artist))}
            className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-cream-200/50
                                border-t-cream-50 rounded-full animate-spin" />
                Saving...
              </>
            ) : step === 2 ? (
              '🎵 Add to Library'
            ) : (
              'Continue →'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── FILTER BAR ───────────────────────────────────────────────────────────────

function FilterBar({
  search,    onSearch,
  language,  onLanguage,
  mood,      onMood,
  difficulty,onDifficulty,
  status,    onStatus,
  onClear,
  activeCount,
}: {
  search:       string;   onSearch:     (v: string) => void
  language:     string;   onLanguage:   (v: string) => void
  mood:         string;   onMood:       (v: string) => void
  difficulty:   string;   onDifficulty: (v: string) => void
  status:       string;   onStatus:     (v: string) => void
  onClear:      () => void
  activeCount:  number
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                      text-brown-400 dark:text-cream-500" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search songs..."
          className="form-input w-full pl-9 py-2 text-sm
                     dark:bg-walnut-800/60 dark:border-walnut-600/60
                     dark:text-cream-100 dark:placeholder-cream-600"
        />
        {search && (
          <button onClick={() => onSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-brown-400 hover:text-walnut-600 transition-colors">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Dropdowns */}
      {[
        { value: language,   onChange: onLanguage,   options: LANGUAGE_OPTIONS,   placeholder: '🌐 Language'   },
        { value: mood,       onChange: onMood,       options: MOOD_OPTIONS,       placeholder: '🎭 Mood'       },
        { value: difficulty, onChange: onDifficulty, options: DIFFICULTY_OPTIONS, placeholder: '📊 Difficulty' },
        { value: status,     onChange: onStatus,     options: STATUS_OPTIONS,     placeholder: '✅ Status'     },
      ].map((filter, i) => (
        <div key={i} className="relative">
          <select
            value={filter.value}
            onChange={e => filter.onChange(e.target.value)}
            className="appearance-none form-input py-2 pr-8 text-sm
                       dark:bg-walnut-800/60 dark:border-walnut-600/60
                       dark:text-cream-100 cursor-pointer min-w-[120px]"
          >
            <option value="">{filter.placeholder}</option>
            {filter.options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2
                                            text-brown-400 pointer-events-none" />
        </div>
      ))}

      {/* Clear filters */}
      {activeCount > 0 && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs font-ui font-medium
                     text-error hover:text-red-700 transition-colors px-3 py-2
                     rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10"
        >
          <X size={13} />
          Clear ({activeCount})
        </button>
      )}
    </div>
  )
}

// ─── SONGS PAGE ──────────────────────────────────────────────────────────────

export default function SongsPage() {
  const { user } = useAuth()
  const router   = useRouter()
  const params   = useSearchParams()

  const [songs,      setSongs]      = useState<Song[]>(MOCK_SONGS)
  const [viewMode,   setViewMode]   = useState<'grid' | 'list'>('grid')
  const [modalOpen,  setModalOpen]  = useState(params.get('action') === 'new')
  const [search,     setSearch]     = useState(params.get('search') || '')
  const [language,   setLanguage]   = useState('')
  const [mood,       setMood]       = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [status,     setStatus]     = useState('')
  const [sortBy,     setSortBy]     = useState<'title' | 'createdAt' | 'practiceCount'>('createdAt')
  const [editSong,   setEditSong]   = useState<Song | null>(null)

  const activeFilterCount = [language, mood, difficulty, status].filter(Boolean).length

  const filteredSongs = useMemo(() => {
    let result = [...songs]

    if (search)     result = result.filter(s =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.artist.toLowerCase().includes(search.toLowerCase()) ||
      s.movie?.toLowerCase().includes(search.toLowerCase()),
    )
    if (language)   result = result.filter(s => s.language   === language)
    if (mood)       result = result.filter(s => s.mood       === mood)
    if (difficulty) result = result.filter(s => s.difficulty === difficulty)
    if (status)     result = result.filter(s => s.status.includes(status as SongStatus))

    result.sort((a, b) => {
      if (sortBy === 'title')         return a.title.localeCompare(b.title)
      if (sortBy === 'practiceCount') return b.practiceCount - a.practiceCount
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return result
  }, [songs, search, language, mood, difficulty, status, sortBy])

  const handleToggleFavourite = useCallback((id: string) => {
    setSongs(prev => prev.map(s =>
      s.id === id ? { ...s, isFavourite: !s.isFavourite } : s,
    ))
  }, [])

  const handleDelete = useCallback((id: string) => {
    setSongs(prev => prev.filter(s => s.id !== id))
    toast.success(SUCCESS_MESSAGES.SONG_DELETED)
  }, [])

  const handleSave = useCallback((data: Partial<Song>) => {
    const newSong: Song = {
      ...data,
      id:               data.id || Date.now().toString(),
      userId:           user?.uid || '',
      title:            data.title || '',
      artist:           data.artist || '',
      language:         data.language || SongLanguage.HINDI,
      difficulty:       data.difficulty || SongDifficulty.INTERMEDIATE,
      status:           data.status || [],
      tags:             data.tags || [],
      practiceCount:    0,
      totalPracticeMin: 0,
      isFavourite:      data.isFavourite || false,
      isPublic:         data.isPublic || false,
      createdAt:        new Date().toISOString(),
      updatedAt:        new Date().toISOString(),
    }
    setSongs(prev => [newSong, ...prev])
  }, [user])

  const clearFilters = () => {
    setLanguage(''); setMood(''); setDifficulty(''); setStatus('')
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* ── Page header ──────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-walnut-900
                           dark:text-cream-100">
              Song Library 🎵
            </h1>
            <p className="text-sm text-brown-400 dark:text-cream-400 font-ui mt-0.5">
              {songs.length} songs in your library
              {filteredSongs.length !== songs.length && (
                <span className="ml-1">· {filteredSongs.length} shown</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary text-sm px-5 py-2.5 flex items-center
                       gap-2 flex-shrink-0"
          >
            <Plus size={16} />
            Add Song
          </button>
        </div>

        {/* ── Stats strip ──────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Songs',    value: songs.length,                                      icon: '🎵' },
            { label: 'Practiced',      value: songs.filter(s => s.status.includes(SongStatus.PRACTICED)).length,  icon: '✅' },
            { label: 'Recorded',       value: songs.filter(s => s.status.includes(SongStatus.RECORDED)).length,   icon: '🎙️' },
            { label: 'Favourites',     value: songs.filter(s => s.isFavourite).length,            icon: '❤️' },
          ].map(stat => (
            <div key={stat.label}
                 className="card-premium p-3.5 flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-xl font-display font-bold text-walnut-800
                              dark:text-cream-100 leading-none">
                  {stat.value}
                </p>
                <p className="text-xs font-ui text-brown-400 dark:text-cream-500">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters + view toggle ─────────────────── */}
        <div className="flex flex-col gap-3">
          <FilterBar
            search={search}         onSearch={setSearch}
            language={language}     onLanguage={setLanguage}
            mood={mood}             onMood={setMood}
            difficulty={difficulty} onDifficulty={setDifficulty}
            status={status}         onStatus={setStatus}
            onClear={clearFilters}
            activeCount={activeFilterCount}
          />

          {/* Sort + view mode */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SortAsc size={15} className="text-brown-400 dark:text-cream-500" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="form-input py-1.5 text-xs dark:bg-walnut-800/60
                           dark:border-walnut-600/60 dark:text-cream-100
                           appearance-none pr-7 cursor-pointer"
              >
                <option value="createdAt">Newest First</option>
                <option value="title">A to Z</option>
                <option value="practiceCount">Most Practiced</option>
              </select>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-1 bg-sand-100 dark:bg-walnut-800/60
                            rounded-xl p-1">
              {([
                { mode: 'grid' as const, Icon: Grid3X3 },
                { mode: 'list' as const, Icon: List    },
              ]).map(({ mode, Icon }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`
                    w-8 h-7 flex items-center justify-center rounded-lg
                    transition-all duration-200
                    ${viewMode === mode
                      ? 'bg-white dark:bg-walnut-700 text-walnut-700 dark:text-cream-100 shadow-sm'
                      : 'text-brown-400 dark:text-cream-500 hover:text-walnut-600'
                    }
                  `}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Songs display ─────────────────────────── */}
        {filteredSongs.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-20 h-20 rounded-3xl bg-sand-100 dark:bg-walnut-800/60
                            flex items-center justify-center text-4xl">
              🎵
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-semibold text-walnut-700
                            dark:text-cream-200 mb-1">
                {search || activeFilterCount > 0
                  ? 'No songs match your filters'
                  : 'Your library is empty'
                }
              </p>
              <p className="text-sm text-brown-400 dark:text-cream-500">
                {search || activeFilterCount > 0
                  ? 'Try clearing some filters'
                  : 'Add your first song to get started!'
                }
              </p>
            </div>
            {search || activeFilterCount > 0 ? (
              <button onClick={clearFilters} className="btn-ghost text-sm px-5 py-2">
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2"
              >
                <Plus size={15} /> Add First Song
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid view */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredSongs.map((song, i) => (
              <div key={song.id}
                   className="animate-fade-up"
                   style={{ animationDelay: `${i * 0.04}s` }}>
                <SongCardGrid
                  song={song}
                  onToggleFavourite={handleToggleFavourite}
                  onDelete={handleDelete}
                  onEdit={setEditSong}
                />
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="flex flex-col gap-1.5">
            {/* List header */}
            <div className="hidden lg:grid px-3.5 pb-1.5 text-2xs font-ui font-bold
                            uppercase tracking-wider text-brown-400 dark:text-cream-600"
                 style={{ gridTemplateColumns: '1fr 3rem 4rem 6rem 4rem 3rem 4rem' }}>
              <span>Song</span>
              <span className="text-center">Scale</span>
              <span className="text-center">Language</span>
              <span>Status</span>
              <span className="text-center">Difficulty</span>
              <span className="text-right">Practice</span>
              <span className="text-right">Actions</span>
            </div>

            {filteredSongs.map((song, i) => (
              <div key={song.id}
                   className="animate-fade-up"
                   style={{ animationDelay: `${i * 0.03}s` }}>
                <SongRow
                  song={song}
                  onToggleFavourite={handleToggleFavourite}
                  onDelete={handleDelete}
                  onEdit={setEditSong}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </DashboardLayout>
  )
}
