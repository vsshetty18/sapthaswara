/* ============================================================
   SVARAVERSE AI — Reminders Page
   Reminder Cards | Add/Edit Modal | Recurring | Push Notifs
   ============================================================ */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  Plus, Bell, BellOff, Trash2, Edit3, Music, Radio,
  Users, Trophy, Mic2, Calendar, PartyPopper, Pin,
  Clock, Repeat, ChevronDown, X, Check, ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth }     from '@/context/AuthContext'
import {
  ReminderType, type Reminder,
} from '@/types'
import {
  REMINDER_TYPE_OPTIONS, DAYS_OF_WEEK, SUCCESS_MESSAGES,
} from '@/lib/constants'

// ─── TYPE CONFIG ─────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, {
  icon:  React.ElementType
  color: string
  bg:    string
  label: string
}> = {
  [ReminderType.PRACTICE]:     { icon: Music,        color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/20',    label: 'Practice'      },
  [ReminderType.LIVE_SESSION]: { icon: Radio,        color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/20',      label: 'Live Session'  },
  [ReminderType.COLLABORATION]:{ icon: Users,        color: 'text-teal-500',   bg: 'bg-teal-100 dark:bg-teal-900/20',    label: 'Collaboration' },
  [ReminderType.COMPETITION]:  { icon: Trophy,       color: 'text-gold-600',   bg: 'bg-gold-100 dark:bg-gold-900/20',    label: 'Competition'   },
  [ReminderType.STUDIO]:       { icon: Mic2,         color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20',label: 'Studio'        },
  [ReminderType.RECORDING]:    { icon: Mic2,         color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20',label: 'Recording'     },
  [ReminderType.BIRTHDAY]:     { icon: PartyPopper,  color: 'text-pink-500',   bg: 'bg-pink-100 dark:bg-pink-900/20',    label: 'Birthday'      },
  [ReminderType.FESTIVAL]:     { icon: Calendar,     color: 'text-amber-500',  bg: 'bg-amber-100 dark:bg-amber-900/20',  label: 'Festival'      },
  [ReminderType.CUSTOM]:       { icon: Pin,          color: 'text-brown-500',  bg: 'bg-sand-100 dark:bg-walnut-700/50',  label: 'Custom'        },
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_REMINDERS: Reminder[] = [
  {
    id: '1', userId: 'u1',
    title:       'Morning Riyaz',
    description: 'Daily practice session — Sa Re Ga Ma scales',
    type:        ReminderType.PRACTICE,
    scheduledAt: '2024-01-23T06:00:00',
    isRecurring: true,
    recurringDays:[1, 2, 3, 4, 5, 6, 0],
    isActive:    true,
    isPushEnabled:true,
    createdAt:   '2024-01-01T00:00:00',
    updatedAt:   '2024-01-01T00:00:00',
  },
  {
    id: '2', userId: 'u1',
    title:       'Instagram Live Session',
    description: 'Weekly live acoustic session with followers',
    type:        ReminderType.LIVE_SESSION,
    scheduledAt: '2024-01-27T20:00:00',
    isRecurring: true,
    recurringDays:[6],
    isActive:    true,
    isPushEnabled:true,
    createdAt:   '2024-01-01T00:00:00',
    updatedAt:   '2024-01-01T00:00:00',
  },
  {
    id: '3', userId: 'u1',
    title:       'Studio Booking — T-Series',
    description: 'Recording session for cover album',
    type:        ReminderType.STUDIO,
    scheduledAt: '2024-02-05T10:00:00',
    isRecurring: false,
    isActive:    true,
    isPushEnabled:true,
    createdAt:   '2024-01-15T00:00:00',
    updatedAt:   '2024-01-15T00:00:00',
  },
  {
    id: '4', userId: 'u1',
    title:       'Collab with Arjun Mehta',
    description: 'Duet recording — Raataan Lambiyan cover',
    type:        ReminderType.COLLABORATION,
    scheduledAt: '2024-01-30T15:00:00',
    isRecurring: false,
    isActive:    true,
    isPushEnabled:false,
    createdAt:   '2024-01-18T00:00:00',
    updatedAt:   '2024-01-18T00:00:00',
  },
  {
    id: '5', userId: 'u1',
    title:       'SaReGaMaPa Audition',
    description: 'Online audition submission deadline',
    type:        ReminderType.COMPETITION,
    scheduledAt: '2024-02-15T23:59:00',
    isRecurring: false,
    isActive:    false,
    isPushEnabled:true,
    createdAt:   '2024-01-10T00:00:00',
    updatedAt:   '2024-01-10T00:00:00',
  },
]

// ─── REMINDER CARD ────────────────────────────────────────────────────────────

function ReminderCard({
  reminder,
  onToggleActive,
  onTogglePush,
  onEdit,
  onDelete,
}: {
  reminder:       Reminder
  onToggleActive: (id: string) => void
  onTogglePush:   (id: string) => void
  onEdit:         (r: Reminder) => void
  onDelete:       (id: string) => void
}) {
  const cfg  = TYPE_CONFIG[reminder.type]
  const Icon = cfg.icon

  const scheduledDate = new Date(reminder.scheduledAt)
  const isUpcoming    = scheduledDate > new Date()
  const isPast        = scheduledDate < new Date() && !reminder.isRecurring

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  const formatDate = (date: Date) => {
    if (reminder.isRecurring) {
      const days = reminder.recurringDays
        ?.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.short || '')
        .join(', ')
      return `Every ${days} at ${formatTime(date)}`
    }
    return date.toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
      year:    'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className={`
      card-premium p-4 transition-all duration-300 group
      ${!reminder.isActive ? 'opacity-50' : ''}
      ${isPast ? 'border-sand-200/40 dark:border-walnut-700/20' : ''}
    `}>
      <div className="flex items-start gap-3">

        {/* Type icon */}
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center
                         justify-center flex-shrink-0 mt-0.5`}>
          <Icon size={18} className={cfg.color} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-ui font-semibold leading-tight
                             ${reminder.isActive
                               ? 'text-walnut-800 dark:text-cream-100'
                               : 'text-brown-400 dark:text-cream-600 line-through'
                             }`}>
                {reminder.title}
              </p>
              {reminder.description && (
                <p className="text-xs text-brown-400 dark:text-cream-500 mt-0.5 truncate">
                  {reminder.description}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0
                            opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(reminder)}
                className="w-7 h-7 flex items-center justify-center rounded-lg
                           text-brown-400 hover:text-walnut-700 dark:hover:text-cream-200
                           hover:bg-sand-100 dark:hover:bg-walnut-700/40 transition-colors"
              >
                <Edit3 size={13} />
              </button>
              <button
                onClick={() => onDelete(reminder.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg
                           text-brown-400 hover:text-error hover:bg-red-50
                           dark:hover:bg-red-900/10 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Schedule info */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-ui text-brown-400
                            dark:text-cream-500">
              <Clock size={11} />
              {formatDate(scheduledDate)}
            </div>
            {reminder.isRecurring && (
              <div className="flex items-center gap-1 text-2xs font-ui text-blue-500
                              bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                <Repeat size={9} />
                Recurring
              </div>
            )}
            {isPast && !reminder.isRecurring && (
              <span className="text-2xs font-ui text-brown-300 dark:text-cream-700
                               bg-sand-100 dark:bg-walnut-800/60 px-2 py-0.5 rounded-full">
                Past
              </span>
            )}
            {isUpcoming && !reminder.isRecurring && (
              <span className="text-2xs font-ui text-green-600 dark:text-green-400
                               bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                Upcoming
              </span>
            )}
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t
                          border-sand-100/80 dark:border-walnut-700/30">

            {/* Active toggle */}
            <button
              onClick={() => onToggleActive(reminder.id)}
              className={`flex items-center gap-1.5 text-xs font-ui font-medium
                          transition-colors
                          ${reminder.isActive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-brown-400 dark:text-cream-600'
                          }`}
            >
              {reminder.isActive
                ? <ToggleRight size={18} className="text-green-500" />
                : <ToggleLeft  size={18} />
              }
              {reminder.isActive ? 'Active' : 'Inactive'}
            </button>

            <div className="h-3 w-px bg-sand-200 dark:bg-walnut-700" />

            {/* Push toggle */}
            <button
              onClick={() => onTogglePush(reminder.id)}
              className={`flex items-center gap-1.5 text-xs font-ui font-medium
                          transition-colors
                          ${reminder.isPushEnabled
                            ? 'text-gold-600 dark:text-gold-400'
                            : 'text-brown-400 dark:text-cream-600'
                          }`}
            >
              {reminder.isPushEnabled
                ? <Bell    size={13} className="text-gold-500" />
                : <BellOff size={13} />
              }
              {reminder.isPushEnabled ? 'Push On' : 'Push Off'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ADD / EDIT MODAL ─────────────────────────────────────────────────────────

function ReminderModal({
  open,
  onClose,
  onSave,
  editingReminder,
}: {
  open:            boolean
  onClose:         () => void
  onSave:          (r: Partial<Reminder>) => void
  editingReminder: Reminder | null
}) {
  const isEdit = !!editingReminder

  const [title,        setTitle]        = useState(editingReminder?.title        || '')
  const [description,  setDescription]  = useState(editingReminder?.description  || '')
  const [type,         setType]         = useState<ReminderType>(editingReminder?.type || ReminderType.PRACTICE)
  const [date,         setDate]         = useState(
    editingReminder
      ? new Date(editingReminder.scheduledAt).toISOString().slice(0, 16)
      : ''
  )
  const [isRecurring,  setIsRecurring]  = useState(editingReminder?.isRecurring  || false)
  const [recurDays,    setRecurDays]    = useState<number[]>(editingReminder?.recurringDays || [])
  const [isPushEnabled,setIsPushEnabled]= useState(editingReminder?.isPushEnabled ?? true)

  const toggleDay = (day: number) => {
    setRecurDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    )
  }

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a reminder title')
      return
    }
    if (!isRecurring && !date) {
      toast.error('Please select a date and time')
      return
    }
    if (isRecurring && recurDays.length === 0) {
      toast.error('Please select at least one recurring day')
      return
    }

    onSave({
      id:            editingReminder?.id,
      title:         title.trim(),
      description:   description.trim() || undefined,
      type,
      scheduledAt:   date || new Date().toISOString(),
      isRecurring,
      recurringDays: isRecurring ? recurDays : undefined,
      isActive:      editingReminder?.isActive ?? true,
      isPushEnabled,
    })
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-walnut-900/60 backdrop-blur-sm px-4 animate-fade-in">
      <div className="w-full max-w-lg card-premium shadow-3xl overflow-hidden
                      max-h-[90vh] flex flex-col animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b
                        border-sand-200/60 dark:border-walnut-700/40 flex-shrink-0">
          <h2 className="font-display font-bold text-lg text-walnut-800
                         dark:text-cream-100">
            {isEdit ? 'Edit Reminder' : 'New Reminder'}
          </h2>
          <button onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl
                             text-brown-400 hover:text-walnut-700 dark:hover:text-cream-200
                             hover:bg-sand-100 dark:hover:bg-walnut-700/40 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-4">

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Reminder Title *</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Morning Riyaz"
              className="form-input dark:bg-walnut-800/60 dark:border-walnut-600/60
                         dark:text-cream-100 dark:placeholder-cream-600"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add more context..."
              rows={2}
              className="form-input resize-none dark:bg-walnut-800/60
                         dark:border-walnut-600/60 dark:text-cream-100"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Reminder Type</label>
            <div className="grid grid-cols-3 gap-2">
              {REMINDER_TYPE_OPTIONS.map(opt => {
                const cfg = TYPE_CONFIG[opt.value]
                const Icon = cfg.icon
                const selected = type === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setType(opt.value as ReminderType)}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 rounded-xl
                      text-xs font-ui font-medium border transition-all duration-200
                      ${selected
                        ? `${cfg.bg} ${cfg.color} border-current/30`
                        : 'border-sand-200 dark:border-walnut-600/40 text-brown-400 dark:text-cream-500 hover:border-gold-300/50'
                      }
                    `}
                  >
                    <Icon size={14} />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center justify-between py-2 px-3 rounded-xl
                          bg-sand-50/80 dark:bg-walnut-800/40">
            <div className="flex items-center gap-2">
              <Repeat size={15} className="text-blue-500" />
              <span className="text-sm font-ui font-medium text-walnut-700
                               dark:text-cream-200">
                Recurring Reminder
              </span>
            </div>
            <button
              onClick={() => setIsRecurring(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300
                          ${isRecurring ? 'bg-gold-500' : 'bg-sand-300 dark:bg-walnut-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white
                                shadow-sm transition-transform duration-300
                                ${isRecurring ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Date/time (non-recurring) */}
          {!isRecurring && (
            <div className="flex flex-col gap-1.5">
              <label className="form-label">Date & Time *</label>
              <input
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="form-input dark:bg-walnut-800/60 dark:border-walnut-600/60
                           dark:text-cream-100"
              />
            </div>
          )}

          {/* Recurring days */}
          {isRecurring && (
            <div className="flex flex-col gap-2">
              <label className="form-label">Repeat on</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`
                      w-10 h-10 rounded-xl text-xs font-ui font-bold
                      border transition-all duration-200
                      ${recurDays.includes(day.value)
                        ? 'bg-gradient-gold text-cream-50 border-gold-400/50 shadow-gold'
                        : 'border-sand-200 dark:border-walnut-600/40 text-brown-400 dark:text-cream-500 hover:border-gold-300/50'
                      }
                    `}
                  >
                    {day.short[0]}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="form-label">Time</label>
                <input
                  type="time"
                  value={date.includes('T') ? date.split('T')[1] : '07:00'}
                  onChange={e => {
                    const today = new Date().toISOString().split('T')[0]
                    setDate(`${today}T${e.target.value}`)
                  }}
                  className="form-input max-w-[160px] dark:bg-walnut-800/60
                             dark:border-walnut-600/60 dark:text-cream-100"
                />
              </div>
            </div>
          )}

          {/* Push notification toggle */}
          <div className="flex items-center justify-between py-2 px-3 rounded-xl
                          bg-sand-50/80 dark:bg-walnut-800/40">
            <div className="flex items-center gap-2">
              {isPushEnabled ? (
                <Bell size={15} className="text-gold-500" />
              ) : (
                <BellOff size={15} className="text-brown-400" />
              )}
              <span className="text-sm font-ui font-medium text-walnut-700
                               dark:text-cream-200">
                Push Notification
              </span>
            </div>
            <button
              onClick={() => setIsPushEnabled(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300
                          ${isPushEnabled ? 'bg-gold-500' : 'bg-sand-300 dark:bg-walnut-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white
                                shadow-sm transition-transform duration-300
                                ${isPushEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t
                        border-sand-200/60 dark:border-walnut-700/40 flex-shrink-0">
          <button onClick={onClose} className="btn-ghost flex-1 text-sm py-2.5">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex-1 text-sm py-2.5 flex items-center
                       justify-center gap-2"
          >
            <Check size={15} />
            {isEdit ? 'Save Changes' : 'Add Reminder'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── STATS STRIP ─────────────────────────────────────────────────────────────

function StatsStrip({ reminders }: { reminders: Reminder[] }) {
  const active    = reminders.filter(r => r.isActive).length
  const recurring = reminders.filter(r => r.isRecurring).length
  const upcoming  = reminders.filter(r =>
    new Date(r.scheduledAt) > new Date() && !r.isRecurring,
  ).length

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Active',    value: active,    icon: '✅', color: 'text-green-600'  },
        { label: 'Recurring', value: recurring,  icon: '🔁', color: 'text-blue-500'  },
        { label: 'Upcoming',  value: upcoming,   icon: '📅', color: 'text-gold-600'  },
      ].map(stat => (
        <div key={stat.label}
             className="card-premium p-3.5 flex items-center gap-3">
          <span className="text-xl">{stat.icon}</span>
          <div>
            <p className={`text-xl font-display font-bold ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-2xs font-ui text-brown-400 dark:text-cream-500">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── REMINDERS PAGE ───────────────────────────────────────────────────────────

export default function RemindersPage() {
  const { user } = useAuth()

  const [reminders,      setReminders]      = useState<Reminder[]>(MOCK_REMINDERS)
  const [modalOpen,      setModalOpen]      = useState(false)
  const [editingReminder,setEditingReminder]= useState<Reminder | null>(null)
  const [filter,         setFilter]         = useState<'all' | 'active' | 'inactive'>('all')
  const [typeFilter,     setTypeFilter]     = useState<string>('all')

  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      if (filter === 'active'   && !r.isActive) return false
      if (filter === 'inactive' &&  r.isActive) return false
      if (typeFilter !== 'all'  && r.type !== typeFilter) return false
      return true
    })
  }, [reminders, filter, typeFilter])

  const handleToggleActive = useCallback((id: string) => {
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, isActive: !r.isActive } : r,
    ))
  }, [])

  const handleTogglePush = useCallback((id: string) => {
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, isPushEnabled: !r.isPushEnabled } : r,
    ))
    toast.success('Push notification updated')
  }, [])

  const handleDelete = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id))
    toast.success('Reminder deleted')
  }, [])

  const handleEdit = useCallback((r: Reminder) => {
    setEditingReminder(r)
    setModalOpen(true)
  }, [])

  const handleSave = useCallback((data: Partial<Reminder>) => {
    if (data.id) {
      // Edit
      setReminders(prev => prev.map(r =>
        r.id === data.id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r,
      ))
      toast.success('Reminder updated!')
    } else {
      // Add new
      const newReminder: Reminder = {
        id:            Date.now().toString(),
        userId:        user?.uid || '',
        title:         data.title || '',
        description:   data.description,
        type:          data.type || ReminderType.CUSTOM,
        scheduledAt:   data.scheduledAt || new Date().toISOString(),
        isRecurring:   data.isRecurring || false,
        recurringDays: data.recurringDays,
        isActive:      true,
        isPushEnabled: data.isPushEnabled ?? true,
        createdAt:     new Date().toISOString(),
        updatedAt:     new Date().toISOString(),
      }
      setReminders(prev => [newReminder, ...prev])
      toast.success(SUCCESS_MESSAGES.REMINDER_SET)
    }
    setEditingReminder(null)
  }, [user])

  const handleOpenAdd = () => {
    setEditingReminder(null)
    setModalOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-walnut-900
                           dark:text-cream-100">
              Reminders 🔔
            </h1>
            <p className="text-sm text-brown-400 dark:text-cream-400 font-ui mt-0.5">
              Never miss a practice, live, or studio session
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Reminder
          </button>
        </div>

        {/* Stats */}
        <StatsStrip reminders={reminders} />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-sand-100 dark:bg-walnut-800/60
                          rounded-xl p-1">
            {(['all', 'active', 'inactive'] as const).map(f => (
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
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="form-input py-2 pr-8 text-xs dark:bg-walnut-800/60
                         dark:border-walnut-600/60 dark:text-cream-100
                         appearance-none cursor-pointer min-w-[140px]"
            >
              <option value="all">All Types</option>
              {REMINDER_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2
                                              text-brown-400 pointer-events-none" />
          </div>
        </div>

        {/* Reminders list */}
        {filteredReminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-sand-100 dark:bg-walnut-800/60
                            flex items-center justify-center text-3xl">
              🔔
            </div>
            <p className="text-sm font-ui text-brown-400 dark:text-cream-500">
              {filter !== 'all' || typeFilter !== 'all'
                ? 'No reminders match your filters'
                : 'No reminders yet. Add your first one!'
              }
            </p>
            <button
              onClick={handleOpenAdd}
              className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
            >
              <Plus size={13} /> Add Reminder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredReminders.map((reminder, i) => (
              <div
                key={reminder.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <ReminderCard
                  reminder={reminder}
                  onToggleActive={handleToggleActive}
                  onTogglePush={handleTogglePush}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}

        {/* Tip card */}
        <div className="card-premium p-4 flex items-center gap-3
                        bg-gradient-to-r from-blue-50/50 to-cream-50
                        dark:from-blue-900/10 dark:to-walnut-800/40">
          <Bell size={18} className="text-blue-500 flex-shrink-0" />
          <p className="text-xs font-ui text-brown-500 dark:text-cream-300">
            <span className="font-semibold">Pro tip:</span> Enable push notifications
            to get reminded even when the app is closed.
            Go to Settings → Notifications to manage preferences.
          </p>
        </div>
      </div>

      {/* Modal */}
      <ReminderModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingReminder(null) }}
        onSave={handleSave}
        editingReminder={editingReminder}
      />
    </DashboardLayout>
  )
}
