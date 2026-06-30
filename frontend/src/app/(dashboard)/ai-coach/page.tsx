/* ============================================================
   SVARAVERSE AI — Daily Planner Page
   Calendar Strip | Task Management | Progress | Add Task Modal
   ============================================================ */

'use client'

import React, {
  useState, useEffect, useCallback, useMemo, useRef,
} from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Plus, CheckCircle2, Circle, PlayCircle, Clock,
  Music, Mic2, Scissors, Upload, MessageCircle,
  BookOpen, Headphones, PenTool, MoreHorizontal,
  X, Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Trash2, GripVertical, Target, TrendingUp, Flame,
} from 'lucide-react'
import toast from 'react-hot-toast'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { useAuth }     from '@/context/AuthContext'
import { TASK_TYPE_OPTIONS, SUCCESS_MESSAGES } from '@/lib/constants'
import { PlannerTaskType, PlannerTaskStatus, type PlannerTask } from '@/types'

// ─── TASK TYPE CONFIG ─────────────────────────────────────────────────────────

const TASK_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  [PlannerTaskType.PRACTICE]:   { icon: Music,         color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/20'   },
  [PlannerTaskType.RECORDING]:  { icon: Mic2,          color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/20'     },
  [PlannerTaskType.EDITING]:    { icon: Scissors,      color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20'},
  [PlannerTaskType.POSTING]:    { icon: Upload,        color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/20' },
  [PlannerTaskType.NETWORKING]: { icon: MessageCircle, color: 'text-teal-500',   bg: 'bg-teal-100 dark:bg-teal-900/20'   },
  [PlannerTaskType.LEARNING]:   { icon: BookOpen,      color: 'text-amber-500',  bg: 'bg-amber-100 dark:bg-amber-900/20' },
  [PlannerTaskType.LISTENING]:  { icon: Headphones,    color: 'text-pink-500',   bg: 'bg-pink-100 dark:bg-pink-900/20'   },
  [PlannerTaskType.WRITING]:    { icon: PenTool,       color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/20'},
  [PlannerTaskType.REPLY]:      { icon: MessageCircle, color: 'text-cyan-500',   bg: 'bg-cyan-100 dark:bg-cyan-900/20'   },
  [PlannerTaskType.OTHER]:      { icon: MoreHorizontal,color: 'text-gray-500',   bg: 'bg-gray-100 dark:bg-gray-900/20'   },
}

// ─── MOCK DATA GENERATOR ───────────────────────────────────────────────────────

function generateMockTasks(dateStr: string): PlannerTask[] {
  const seed = dateStr.split('-').reduce((a, b) => a + parseInt(b), 0)
  const taskPool: Omit<PlannerTask, 'id' | 'date' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
    { title: 'Practice "Tum Hi Ho" — focus on antara',  type: PlannerTaskType.PRACTICE,   status: PlannerTaskStatus.COMPLETED,   durationMin: 30, order: 0 },
    { title: 'Record cover of "Kesariya"',               type: PlannerTaskType.RECORDING,  status: PlannerTaskStatus.IN_PROGRESS, durationMin: 45, order: 1 },
    { title: 'Edit Instagram reel',                       type: PlannerTaskType.EDITING,    status: PlannerTaskStatus.PENDING,     durationMin: 20, order: 2 },
    { title: 'Post on Instagram + YouTube',               type: PlannerTaskType.POSTING,    status: PlannerTaskStatus.PENDING,     durationMin: 10, order: 3 },
    { title: 'Reply to comments on last post',            type: PlannerTaskType.REPLY,      status: PlannerTaskStatus.PENDING,     durationMin: 15, order: 4 },
    { title: 'Listen to 3 trending covers for inspiration',type: PlannerTaskType.LISTENING,  status: PlannerTaskStatus.PENDING,     durationMin: 25, order: 5 },
    { title: 'Write captions for next 3 posts',           type: PlannerTaskType.WRITING,    status: PlannerTaskStatus.PENDING,     durationMin: 20, order: 6 },
    { title: 'Learn new raga — Bhairavi basics',          type: PlannerTaskType.LEARNING,   status: PlannerTaskStatus.PENDING,     durationMin: 40, order: 7 },
    { title: 'Network — message 2 potential collaborators',type: PlannerTaskType.NETWORKING, status: PlannerTaskStatus.PENDING,     durationMin: 15, order: 8 },
  ]

  const count = 4 + (seed % 4)
  return taskPool.slice(0, count).map((t, i) => ({
    ...t,
    id:        `${dateStr}-${i}`,
    date:      dateStr,
    userId:    'u1',
    createdAt: dateStr,
    updatedAt: dateStr,
  }))
}

// ─── DATE HELPERS ───────────────────────────────────────────────────────────

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getWeekDates(centerDate: Date): Date[] {
  const dates: Date[] = []
  const day = centerDate.getDay()
  const monday = new Date(centerDate)
  monday.setDate(centerDate.getDate() - (day === 0 ? 6 : day - 1))

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }
  return dates
}

// ─── CALENDAR STRIP ───────────────────────────────────────────────────────────

function CalendarStrip({
  selectedDate,
  onSelect,
  taskCompletionMap,
}: {
  selectedDate:      Date
  onSelect:          (date: Date) => void
  taskCompletionMap: Map<string, number>
}) {
  const [weekOffset, setWeekOffset] = useState(0)

  const baseDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + weekOffset * 7)
    return d
  }, [weekOffset])

  const weekDates = useMemo(() => getWeekDates(baseDate), [baseDate])
  const today      = formatDateKey(new Date())
  const dayNames   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="card-premium p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="font-display font-semibold text-base text-walnut-800
                      dark:text-cream-100">
          {baseDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg
                       text-brown-400 hover:text-walnut-700 dark:hover:text-cream-200
                       hover:bg-sand-100 dark:hover:bg-walnut-700/40 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="text-xs font-ui font-medium text-primary px-2 py-1
                       rounded-lg hover:bg-sand-100 dark:hover:bg-walnut-700/40
                       transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg
                       text-brown-400 hover:text-walnut-700 dark:hover:text-cream-200
                       hover:bg-sand-100 dark:hover:bg-walnut-700/40 transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {weekDates.map((date, i) => {
          const dateKey     = formatDateKey(date)
          const isSelected  = formatDateKey(selectedDate) === dateKey
          const isToday     = dateKey === today
          const completion  = taskCompletionMap.get(dateKey) || 0

          return (
            <button
              key={dateKey}
              onClick={() => onSelect(date)}
              className={`
                flex flex-col items-center gap-1.5 py-2.5 rounded-2xl
                transition-all duration-200 relative
                ${isSelected
                  ? 'bg-gradient-gold shadow-gold'
                  : isToday
                  ? 'bg-gold-50 dark:bg-gold-900/20 border border-gold-300/50'
                  : 'hover:bg-sand-50 dark:hover:bg-walnut-800/40'
                }
              `}
            >
              <span className={`text-2xs font-ui font-medium
                                ${isSelected
                                  ? 'text-cream-100'
                                  : 'text-brown-400 dark:text-cream-500'
                                }`}>
                {dayNames[i]}
              </span>
              <span className={`text-sm font-display font-bold
                                ${isSelected
                                  ? 'text-cream-50'
                                  : isToday
                                  ? 'text-gold-dark'
                                  : 'text-walnut-700 dark:text-cream-200'
                                }`}>
                {date.getDate()}
              </span>

              {completion > 0 && (
                <div className={`w-1.5 h-1.5 rounded-full
                                 ${isSelected
                                   ? 'bg-cream-100'
                                   : completion === 100
                                   ? 'bg-green-500'
                                   : 'bg-gold-500'
                                 }`} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── TASK ITEM ────────────────────────────────────────────────────────────────

function TaskItem({
  task,
  onToggleStatus,
  onDelete,
  isDragging,
}: {
  task:            PlannerTask
  onToggleStatus:  (id: string) => void
  onDelete:        (id: string) => void
  isDragging?:     boolean
}) {
  const cfg = TASK_TYPE_CONFIG[task.type]
  const Icon = cfg.icon

  const statusIcon = () => {
    if (task.status === PlannerTaskStatus.COMPLETED)
      return <CheckCircle2 size={20} className="text-green-500" />
    if (task.status === PlannerTaskStatus.IN_PROGRESS)
      return <PlayCircle size={20} className="text-gold-500 animate-pulse" />
    return <Circle size={20} className="text-brown-300 dark:text-cream-600" />
  }

  return (
    <div
      className={`
        flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200
        ${task.status === PlannerTaskStatus.COMPLETED
          ? 'bg-sand-50/50 dark:bg-walnut-800/20 border-transparent opacity-60'
          : 'bg-cream-50 dark:bg-walnut-800/40 border-sand-200/60 dark:border-walnut-700/40 hover:border-gold-300/50 dark:hover:border-gold-600/30'
        }
        ${isDragging ? 'shadow-xl scale-[1.02] rotate-1' : ''}
      `}
    >
      <div className="cursor-grab active:cursor-grabbing text-brown-300
                      dark:text-cream-600 hover:text-brown-500 transition-colors">
        <GripVertical size={15} />
      </div>

      <button onClick={() => onToggleStatus(task.id)} className="flex-shrink-0">
        {statusIcon()}
      </button>

      <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center
                       justify-center flex-shrink-0`}>
        <Icon size={15} className={cfg.color} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-ui font-medium leading-tight
                       ${task.status === PlannerTaskStatus.COMPLETED
                         ? 'line-through text-brown-400 dark:text-cream-600'
                         : 'text-walnut-700 dark:text-cream-200'
                       }`}>
          {task.title}
        </p>
        {task.relatedSong && (
          <p className="text-2xs text-brown-400 dark:text-cream-600 mt-0.5">
            🎵 {task.relatedSong.title}
          </p>
        )}
      </div>

      {task.durationMin && (
        <span className="flex items-center gap-1 text-xs font-ui
                         text-brown-400 dark:text-cream-500 flex-shrink-0">
          <Clock size={11} />
          {task.durationMin}m
        </span>
      )}

      <button
        onClick={() => onDelete(task.id)}
        className="w-7 h-7 flex items-center justify-center rounded-lg
                   text-brown-300 dark:text-cream-600 hover:text-error
                   hover:bg-red-50 dark:hover:bg-red-900/10
                   transition-colors flex-shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ─── ADD TASK MODAL ───────────────────────────────────────────────────────────

function AddTaskModal({
  open,
  onClose,
  onAdd,
  selectedDate,
}: {
  open:         boolean
  onClose:      () => void
  onAdd:        (task: Partial<PlannerTask>) => void
  selectedDate: Date
}) {
  const [title,    setTitle]    = useState('')
  const [type,     setType]     = useState<PlannerTaskType>(PlannerTaskType.PRACTICE)
  const [duration, setDuration] = useState(30)

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Please enter a task title')
      return
    }
    onAdd({
      title:       title.trim(),
      type,
      durationMin: duration,
      status:      PlannerTaskStatus.PENDING,
      date:        formatDateKey(selectedDate),
    })
    setTitle('')
    setType(PlannerTaskType.PRACTICE)
    setDuration(30)
    onClose()
    toast.success('Task added! 📋')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-walnut-900/60 backdrop-blur-sm px-4 animate-fade-in">
      <div className="w-full max-w-md card-premium shadow-3xl animate-scale-in
                      overflow-hidden">

        <div className="flex items-center justify-between px-5 py-4
                        border-b border-sand-200/60 dark:border-walnut-700/40">
          <h2 className="font-display font-bold text-lg text-walnut-800
                         dark:text-cream-100">
            Add Task
          </h2>
          <button onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl
                             text-brown-400 hover:text-walnut-700 dark:hover:text-cream-200
                             hover:bg-sand-100 dark:hover:bg-walnut-700/40 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-ui text-brown-400
                          dark:text-cream-500">
            <CalendarIcon size={13} />
            {selectedDate.toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="form-label">Task Title</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Practice 'Tum Hi Ho'"
              className="form-input dark:bg-walnut-800/60 dark:border-walnut-600/60
                         dark:text-cream-100 dark:placeholder-cream-600"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="form-label">Task Type</label>
            <div className="grid grid-cols-5 gap-2">
              {TASK_TYPE_OPTIONS.slice(0, 10).map(opt => {
                const cfg = TASK_TYPE_CONFIG[opt.value]
                const Icon = cfg.icon
                const selected = type === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setType(opt.value as PlannerTaskType)}
                    title={opt.label}
                    className={`
                      flex flex-col items-center gap-1 py-2.5 rounded-xl
                      transition-all duration-200 border
                      ${selected
                        ? `${cfg.bg} border-current ${cfg.color}`
                        : 'border-sand-200 dark:border-walnut-600/40 text-brown-400 dark:text-cream-500 hover:border-gold-300/50'
                      }
                    `}
                  >
                    <Icon size={16} />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="form-label">
              Duration: <span className="text-primary font-semibold">{duration} min</span>
            </label>
            <input
              type="range"
              min={5}
              max={120}
              step={5}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full accent-gold-600"
            />
            <div className="flex justify-between text-2xs text-brown-400
                            dark:text-cream-600">
              <span>5 min</span>
              <span>120 min</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 border-t
                        border-sand-200/60 dark:border-walnut-700/40">
          <button onClick={onClose} className="btn-ghost flex-1 text-sm py-2.5">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary flex-1 text-sm py-2.5">
            Add Task
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── PROGRESS RING ────────────────────────────────────────────────────────────

function ProgressRing({ percent }: { percent: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={radius} fill="none"
                stroke="rgba(235,217,176,0.4)" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={radius} fill="none"
          stroke="url(#progressGrad)" strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-xl text-walnut-800
                         dark:text-cream-100">
          {Math.round(percent)}%
        </span>
      </div>
    </div>
  )
}

// ─── PLANNER PAGE ─────────────────────────────────────────────────────────────

export default function PlannerPage() {
  const params = useSearchParams()
  const { user } = useAuth()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tasks,         setTasks]       = useState<PlannerTask[]>([])
  const [modalOpen,     setModalOpen]   = useState(params.get('action') === 'add')
  const [draggedId,     setDraggedId]   = useState<string | null>(null)

  const dateKey = formatDateKey(selectedDate)

  useEffect(() => {
    setTasks(generateMockTasks(dateKey))
  }, [dateKey])

  const completionMap = useMemo(() => {
    const map = new Map<string, number>()
    for (let i = -7; i <= 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const key = formatDateKey(d)
      const mockTasks = generateMockTasks(key)
      const completed = mockTasks.filter(t => t.status === PlannerTaskStatus.COMPLETED).length
      map.set(key, mockTasks.length > 0 ? (completed / mockTasks.length) * 100 : 0)
    }
    return map
  }, [])

  const completedCount = tasks.filter(t => t.status === PlannerTaskStatus.COMPLETED).length
  const totalCount     = tasks.length
  const progressPct    = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const totalMinutes   = tasks.reduce((sum, t) => sum + (t.durationMin || 0), 0)
  const completedMinutes = tasks
    .filter(t => t.status === PlannerTaskStatus.COMPLETED)
    .reduce((sum, t) => sum + (t.durationMin || 0), 0)

  const handleToggleStatus = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const next = t.status === PlannerTaskStatus.COMPLETED
        ? PlannerTaskStatus.PENDING
        : t.status === PlannerTaskStatus.PENDING
        ? PlannerTaskStatus.IN_PROGRESS
        : PlannerTaskStatus.COMPLETED
      if (next === PlannerTaskStatus.COMPLETED) {
        toast.success('Task completed! Great work! ✅')
      }
      return { ...t, status: next }
    }))
  }, [])

  const handleDelete = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    toast.success('Task removed')
  }, [])

  const handleAddTask = useCallback((newTask: Partial<PlannerTask>) => {
    const task: PlannerTask = {
      id:          Date.now().toString(),
      userId:      user?.uid || '',
      date:        newTask.date || dateKey,
      title:       newTask.title || '',
      type:        newTask.type || PlannerTaskType.OTHER,
      status:      PlannerTaskStatus.PENDING,
      durationMin: newTask.durationMin,
      order:       tasks.length,
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }
    setTasks(prev => [...prev, task])
  }, [dateKey, tasks.length, user])

  const handleDragStart = (id: string) => setDraggedId(id)
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return

    setTasks(prev => {
      const draggedIdx = prev.findIndex(t => t.id === draggedId)
      const targetIdx  = prev.findIndex(t => t.id === targetId)
      if (draggedIdx === -1 || targetIdx === -1) return prev

      const newTasks = [...prev]
      const [removed] = newTasks.splice(draggedIdx, 1)
      newTasks.splice(targetIdx, 0, removed)
      return newTasks
    })
  }
  const handleDragEnd = () => setDraggedId(null)

  const isToday = dateKey === formatDateKey(new Date())

  return (
    <DashboardLayout>
      <div className="space-y-5">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-walnut-900
                           dark:text-cream-100">
              Daily Planner 📅
            </h1>
            <p className="text-sm text-brown-400 dark:text-cream-400 font-ui mt-0.5">
              {isToday ? "Today's" : selectedDate.toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'short',
              })} schedule
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>

        <CalendarStrip
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          taskCompletionMap={completionMap}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-premium p-5 flex items-center gap-4">
            <ProgressRing percent={progressPct} />
            <div>
              <p className="text-xs font-ui font-bold uppercase tracking-wide
                            text-brown-400 dark:text-cream-500 mb-1">
                Daily Progress
              </p>
              <p className="text-xl font-display font-bold text-walnut-800
                            dark:text-cream-100">
                {completedCount}/{totalCount} tasks
              </p>
              <p className="text-xs text-brown-400 dark:text-cream-500 mt-0.5">
                {totalCount - completedCount} remaining
              </p>
            </div>
          </div>

          <div className="card-premium p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/20
                              flex items-center justify-center">
                <Clock size={17} className="text-blue-500" />
              </div>
              <p className="text-xs font-ui font-bold uppercase tracking-wide
                            text-brown-400 dark:text-cream-500">
                Time Allocated
              </p>
            </div>
            <p className="text-2xl font-display font-bold text-walnut-800
                          dark:text-cream-100">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </p>
            <p className="text-xs text-brown-400 dark:text-cream-500 mt-1">
              {Math.floor(completedMinutes / 60)}h {completedMinutes % 60}m completed
            </p>
          </div>

          <div className="card-premium p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/20
                              flex items-center justify-center">
                <Flame size={17} className="text-orange-500" />
              </div>
              <p className="text-xs font-ui font-bold uppercase tracking-wide
                            text-brown-400 dark:text-cream-500">
                Planning Streak
              </p>
            </div>
            <p className="text-2xl font-display font-bold text-walnut-800
                          dark:text-cream-100">
              {user?.currentStreak || 7} days
            </p>
            <p className="text-xs text-brown-400 dark:text-cream-500 mt-1">
              Keep planning daily!
            </p>
          </div>
        </div>

        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={17} className="text-gold-600" />
              <p className="font-ui font-semibold text-sm text-walnut-800
                            dark:text-cream-100">
                Tasks ({totalCount})
              </p>
            </div>
            <p className="text-xs text-brown-400 dark:text-cream-500 font-ui">
              Drag to reorder
            </p>
          </div>

          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-sand-100 dark:bg-walnut-800/60
                              flex items-center justify-center text-3xl">
                📋
              </div>
              <p className="text-sm font-ui text-brown-400 dark:text-cream-500">
                No tasks for this day yet
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
              >
                <Plus size={13} /> Add your first task
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  onDragOver={e => handleDragOver(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className="animate-fade-up"
                >
                  <TaskItem
                    task={task}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                    isDragging={draggedId === task.id}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-premium p-4 flex items-center gap-3
                        bg-gradient-to-r from-blue-50/50 to-cream-50
                        dark:from-blue-900/10 dark:to-walnut-800/40">
          <TrendingUp size={18} className="text-blue-500 flex-shrink-0" />
          <p className="text-xs font-ui text-brown-500 dark:text-cream-300">
            <span className="font-semibold">Pro tip:</span> Creators who plan
            their day complete 73% more tasks than those who don&apos;t.
            Try planning tomorrow tonight!
          </p>
        </div>
      </div>

      <AddTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddTask}
        selectedDate={selectedDate}
      />
    </DashboardLayout>
  )
}
