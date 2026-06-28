/* ============================================================
   SVARAVERSE AI — Dashboard Layout
   Sidebar + Navbar + Breadcrumbs + Notifications + Content
   ============================================================ */

'use client'

import React, {
  useState, useEffect, useCallback, useRef, type ReactNode,
} from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell, Search, Crown, ChevronRight,
  X, CheckCheck, Sparkles,
} from 'lucide-react'

import Sidebar, { MobileMenuButton } from '@/components/layout/Sidebar'
import { ThemeToggle }   from '@/context/ThemeContext'
import { useAuth }       from '@/context/AuthContext'
import { WithAuth }      from '@/context/AuthContext'
import { SIDEBAR_NAV_ITEMS, APP_NAME, STORAGE_KEYS } from '@/lib/constants'
import { SubscriptionPlan, type Notification } from '@/types'
import { markNotificationRead, markAllNotificationsRead } from '@/services/firebase'

// ─── BREADCRUMBS ─────────────────────────────────────────────────────────────

function useBreadcrumbs() {
  const pathname = usePathname()

  const crumbs = React.useMemo(() => {
    const parts  = pathname.split('/').filter(Boolean)
    const result = [{ label: 'Home', href: '/dashboard' }]

    let path = ''
    parts.forEach((part, i) => {
      path += `/${part}`
      if (part === 'dashboard' && i === 0) return

      // Find label from nav items
      const navItem = SIDEBAR_NAV_ITEMS.find(n => n.href === path)
      const label   = navItem?.label
        || part.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

      result.push({ label, href: path })
    })

    return result
  }, [pathname])

  return crumbs
}

// ─── NOTIFICATION PANEL ───────────────────────────────────────────────────────

function NotificationPanel({
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
}: {
  notifications: Notification[]
  onClose:       () => void
  onMarkRead:    (id: string) => void
  onMarkAllRead: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const typeIcons: Record<string, string> = {
    milestone:    '🏆',
    reminder:     '🔔',
    collaboration:'🤝',
    system:       '⚙️',
    ai_insight:   '🤖',
    community:    '👥',
    payment:      '💳',
  }

  const unread = notifications.filter(n => !n.isRead)

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96
                 card-premium border border-sand-200/80 dark:border-walnut-600/50
                 shadow-2xl z-50 overflow-hidden animate-scale-in
                 max-h-[480px] flex flex-col"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3
                      border-b border-sand-200/60 dark:border-walnut-700/40
                      flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-ui font-semibold text-sm text-walnut-800
                         dark:text-cream-100">
            Notifications
          </h3>
          {unread.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-gold-500 text-cream-50
                             text-2xs font-bold flex items-center justify-center">
              {unread.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread.length > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs font-ui text-primary
                         hover:text-primary-hover transition-colors px-2 py-1
                         rounded-lg hover:bg-sand-100 dark:hover:bg-walnut-700/40"
            >
              <CheckCheck size={13} />
              All read
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg
                       text-brown-400 hover:text-walnut-700 dark:hover:text-cream-200
                       hover:bg-sand-100 dark:hover:bg-walnut-700/40 transition-colors"
            aria-label="Close notifications"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 scrollbar-warm">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-full bg-sand-100 dark:bg-walnut-700/50
                            flex items-center justify-center text-2xl">
              🔔
            </div>
            <p className="text-sm text-brown-400 dark:text-cream-500 font-ui">
              You&apos;re all caught up!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-sand-100/80 dark:divide-walnut-700/30">
            {notifications.map(notif => (
              <button
                key={notif.id}
                onClick={() => !notif.isRead && onMarkRead(notif.id)}
                className={`
                  w-full text-left flex items-start gap-3 px-4 py-3
                  hover:bg-sand-50/80 dark:hover:bg-walnut-800/40
                  transition-colors duration-150 group
                  ${!notif.isRead
                    ? 'bg-gold-50/50 dark:bg-gold-900/10'
                    : ''
                  }
                `}
              >
                {/* Icon */}
                <div className={`
                  w-9 h-9 rounded-xl flex items-center justify-center
                  flex-shrink-0 text-lg
                  ${!notif.isRead
                    ? 'bg-gold-100 dark:bg-gold-900/30'
                    : 'bg-sand-100 dark:bg-walnut-700/40'
                  }
                `}>
                  {typeIcons[notif.type] || '📢'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold font-ui leading-snug mb-0.5
                                 ${!notif.isRead
                                   ? 'text-walnut-800 dark:text-cream-100'
                                   : 'text-brown-500 dark:text-cream-300'
                                 }`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-brown-400 dark:text-cream-500
                                leading-relaxed line-clamp-2">
                    {notif.body}
                  </p>
                  <p className="text-2xs text-brown-300 dark:text-cream-600 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                      day:   'numeric',
                      month: 'short',
                      hour:  '2-digit',
                      minute:'2-digit',
                    })}
                  </p>
                </div>

                {/* Unread dot */}
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-gold-500 flex-shrink-0
                                  mt-1.5 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-sand-100/80
                      dark:border-walnut-700/40 flex-shrink-0">
        <Link
          href="/dashboard/settings?tab=notifications"
          onClick={onClose}
          className="text-xs font-ui text-primary hover:text-primary-hover
                     transition-colors"
        >
          Notification settings →
        </Link>
      </div>
    </div>
  )
}

// ─── SEARCH BAR ──────────────────────────────────────────────────────────────

function SearchBar() {
  const [query,  setQuery]  = useState('')
  const [open,   setOpen]   = useState(false)
  const router              = useRouter()
  const inputRef            = useRef<HTMLInputElement>(null)

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const quickLinks = [
    { label: 'Add new song',    href: '/dashboard/songs?action=new',    icon: '🎵' },
    { label: 'Ask AI Coach',    href: '/dashboard/ai-coach',            icon: '🤖' },
    { label: 'View analytics',  href: '/dashboard/analytics',           icon: '📊' },
    { label: 'Today\'s planner',href: '/dashboard/planner',             icon: '📅' },
    { label: 'Generate poster', href: '/dashboard/posters?action=new',  icon: '🎨' },
  ]

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl
                   bg-sand-100/80 dark:bg-walnut-800/60
                   border border-sand-200 dark:border-walnut-600/40
                   text-brown-400 dark:text-cream-500
                   hover:bg-sand-200/60 dark:hover:bg-walnut-700/60
                   transition-all duration-200 text-sm font-ui
                   min-w-[180px] sm:min-w-[240px]"
      >
        <Search size={14} />
        <span className="flex-1 text-left text-xs sm:text-sm">Search...</span>
        <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5
                        rounded bg-sand-200 dark:bg-walnut-700 text-2xs
                        font-mono text-brown-400 dark:text-cream-600">
          <span>⌘</span>K
        </kbd>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-walnut-900/50 backdrop-blur-sm
                     flex items-start justify-center pt-[15vh] px-4
                     animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg card-premium overflow-hidden
                       shadow-3xl animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3.5
                            border-b border-sand-200/60 dark:border-walnut-700/40">
              <Search size={18} className="text-brown-400 dark:text-cream-500
                                           flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && query) {
                    router.push(`/dashboard/songs?search=${encodeURIComponent(query)}`)
                    setOpen(false)
                    setQuery('')
                  }
                }}
                placeholder="Search songs, features, settings..."
                className="flex-1 bg-transparent text-sm font-ui
                           text-walnut-800 dark:text-cream-100
                           placeholder-brown-400 dark:placeholder-cream-600
                           outline-none"
                autoComplete="off"
              />
              {query && (
                <button onClick={() => setQuery('')}
                        className="text-brown-400 hover:text-walnut-600
                                   dark:hover:text-cream-300 transition-colors">
                  <X size={14} />
                </button>
              )}
              <kbd className="px-1.5 py-0.5 rounded bg-sand-100 dark:bg-walnut-700
                              text-2xs font-mono text-brown-400 dark:text-cream-600">
                ESC
              </kbd>
            </div>

            {/* Quick links */}
            <div className="p-2">
              <p className="px-3 py-1.5 text-2xs font-bold font-ui uppercase
                            tracking-wider text-brown-400 dark:text-cream-600">
                Quick Actions
              </p>
              {quickLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                             text-sm font-ui text-walnut-700 dark:text-cream-200
                             hover:bg-sand-100/80 dark:hover:bg-walnut-800/60
                             transition-colors duration-150 group"
                >
                  <span className="w-7 h-7 rounded-lg bg-sand-100
                                   dark:bg-walnut-700/60 flex items-center
                                   justify-center text-base flex-shrink-0
                                   group-hover:bg-gold-100/60
                                   dark:group-hover:bg-gold-900/30
                                   transition-colors">
                    {link.icon}
                  </span>
                  {link.label}
                  <ChevronRight size={14} className="ml-auto text-brown-300
                                                     dark:text-cream-600" />
                </Link>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-sand-100/80
                            dark:border-walnut-700/40 flex items-center gap-3">
              <span className="text-2xs font-ui text-brown-300 dark:text-cream-600">
                Press <kbd className="px-1 py-0.5 rounded bg-sand-100
                                     dark:bg-walnut-700 font-mono text-2xs">
                  Enter
                </kbd> to search songs
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── TOP NAVBAR ───────────────────────────────────────────────────────────────

function TopNavbar({
  onMobileMenuToggle,
  mobileMenuOpen,
}: {
  onMobileMenuToggle: () => void
  mobileMenuOpen:     boolean
}) {
  const { user, notifications, unreadCount } = useAuth()
  const [notifOpen, setNotifOpen]            = useState(false)
  const breadcrumbs                          = useBreadcrumbs()
  const pathname                             = usePathname()

  // Get page title from breadcrumbs
  const pageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard'

  const handleMarkRead = useCallback(async (id: string) => {
    try {
      await markNotificationRead(id)
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    }
  }, [])

  const handleMarkAllRead = useCallback(async () => {
    if (!user) return
    try {
      await markAllNotificationsRead(user.uid)
    } catch (err) {
      console.error('Failed to mark all notifications read:', err)
    }
  }, [user])

  return (
    <header className="sticky top-0 z-30 h-16 flex-shrink-0
                       bg-cream-50/90 dark:bg-walnut-900/90
                       backdrop-blur-md border-b border-sand-200/80
                       dark:border-walnut-700/40 px-4 flex items-center gap-4">

      {/* Mobile menu button */}
      <MobileMenuButton
        onClick={onMobileMenuToggle}
        isOpen={mobileMenuOpen}
      />

      {/* Breadcrumbs (desktop) */}
      <nav aria-label="Breadcrumb"
           className="hidden md:flex items-center gap-1.5 flex-1 min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && (
              <ChevronRight size={13}
                            className="text-brown-300 dark:text-cream-600
                                       flex-shrink-0" />
            )}
            {i === breadcrumbs.length - 1 ? (
              <span className="text-sm font-semibold font-ui text-walnut-800
                               dark:text-cream-100 truncate">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-sm font-ui text-brown-400 dark:text-cream-500
                           hover:text-walnut-700 dark:hover:text-cream-200
                           transition-colors truncate"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Page title (mobile) */}
      <h1 className="md:hidden text-base font-display font-bold
                     text-walnut-800 dark:text-cream-100 flex-1 truncate">
        {pageTitle}
      </h1>

      {/* Right side controls */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Search */}
        <SearchBar />

        {/* Premium badge (if not premium) */}
        {user && user.plan !== SubscriptionPlan.PREMIUM && (
          <Link
            href="/dashboard/settings?tab=billing"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5
                       rounded-xl bg-gradient-to-r from-gold-100 to-sand-200
                       dark:from-gold-900/30 dark:to-walnut-800/40
                       border border-gold-300/60 dark:border-gold-600/30
                       text-xs font-semibold font-ui text-gold-dark
                       hover:shadow-gold transition-all duration-200"
          >
            <Crown size={13} />
            Upgrade
          </Link>
        )}

        {/* Theme toggle */}
        <ThemeToggle size="sm" />

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative w-9 h-9 flex items-center justify-center
                       rounded-xl bg-sand-100/80 dark:bg-walnut-800/60
                       border border-sand-200 dark:border-walnut-600/40
                       text-brown-500 dark:text-cream-400
                       hover:bg-sand-200/60 dark:hover:bg-walnut-700/60
                       hover:text-walnut-700 dark:hover:text-cream-200
                       transition-all duration-200"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            aria-expanded={notifOpen}
            aria-haspopup="true"
          >
            <Bell size={17} />

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full
                               bg-gold-500 text-cream-50 text-2xs font-bold
                               flex items-center justify-center
                               border-2 border-cream-50 dark:border-walnut-900
                               animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification panel */}
          {notifOpen && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setNotifOpen(false)}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
            />
          )}
        </div>

        {/* User avatar (quick access) */}
        {user && (
          <Link
            href="/dashboard/settings?tab=profile"
            className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0
                       ring-2 ring-transparent hover:ring-gold-400/50
                       transition-all duration-200"
            aria-label="Profile settings"
          >
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-gold flex items-center
                              justify-center">
                <span className="text-cream-50 font-display font-bold text-sm">
                  {user.displayName?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </Link>
        )}
      </div>
    </header>
  )
}

// ─── AI FLOATING BUTTON ───────────────────────────────────────────────────────

function AIFloatingButton() {
  const pathname = usePathname()
  const isOnAIPage = pathname === '/dashboard/ai-coach'

  if (isOnAIPage) return null

  return (
    <Link
      href="/dashboard/ai-coach"
      className="fixed bottom-6 right-6 z-40
                 w-14 h-14 rounded-2xl bg-gradient-gold
                 flex items-center justify-center
                 shadow-gold-lg hover:shadow-glow
                 transition-all duration-300 hover:-translate-y-1
                 animate-pulse-gold group"
      aria-label="Open AI Coach"
      title="AI Music Coach"
    >
      <Sparkles
        size={24}
        className="text-cream-50 group-hover:rotate-12
                   transition-transform duration-300"
      />

      {/* Tooltip */}
      <div className="absolute right-full mr-3 px-3 py-1.5 rounded-xl
                      bg-walnut-800 text-cream-100 text-xs font-ui font-medium
                      whitespace-nowrap opacity-0 group-hover:opacity-100
                      transition-all duration-200 shadow-lg
                      pointer-events-none translate-x-1
                      group-hover:translate-x-0">
        AI Coach
        <div className="absolute left-full top-1/2 -translate-y-1/2
                        border-4 border-transparent border-l-walnut-800" />
      </div>
    </Link>
  )
}

// ─── DASHBOARD LAYOUT ─────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children: ReactNode
}

function DashboardLayoutInner({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false)

  // Persist sidebar state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_OPEN)
      if (stored !== null) setSidebarCollapsed(stored === 'false')
    } catch {}
  }, [])

  const handleCollapse = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
    try {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_OPEN, String(!collapsed))
    } catch {}
  }, [])

  const handleMobileClose = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-cream-50 dark:bg-walnut-900">

      {/* ── Sidebar ────────────────────────────────── */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={handleCollapse}
        mobileOpen={mobileMenuOpen}
        onMobileClose={handleMobileClose}
      />

      {/* ── Main area ──────────────────────────────── */}
      <div className={`
        flex flex-col flex-1 min-w-0 overflow-hidden
        transition-all duration-300 ease-premium
      `}>

        {/* Top navbar */}
        <TopNavbar
          onMobileMenuToggle={() => setMobileMenuOpen(v => !v)}
          mobileMenuOpen={mobileMenuOpen}
        />

        {/* Page content */}
        <main
          id="dashboard-content"
          className="flex-1 overflow-y-auto overflow-x-hidden
                     bg-cream-50 dark:bg-walnut-900
                     scrollbar-warm"
        >
          {/* Inner padding wrapper */}
          <div className="p-4 sm:p-6 lg:p-8 min-h-full">
            <div className="max-w-[1400px] mx-auto animate-fade-up">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* ── Floating AI button ─────────────────────── */}
      <AIFloatingButton />
    </div>
  )
}

// ─── EXPORTED LAYOUT WITH AUTH GUARD ─────────────────────────────────────────

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <WithAuth redirectTo="/login">
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </WithAuth>
  )
}
