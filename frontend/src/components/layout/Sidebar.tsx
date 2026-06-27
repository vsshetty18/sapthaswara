/* ============================================================
   SVARAVERSE AI — Dashboard Sidebar
   Collapsible | Navigation | User Profile | Premium Prompt
   ============================================================ */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Music, Bot, CalendarCheck, BarChart3,
  ImageIcon, Plug, Bell, Trophy, Users, Settings, ChevronLeft,
  ChevronRight, LogOut, Crown, Flame, Star, Menu, X,
  TrendingUp, Mic2, BookOpen, Sparkles,
} from 'lucide-react'

import { useAuth }  from '@/context/AuthContext'
import { APP_NAME, SIDEBAR_NAV_ITEMS } from '@/lib/constants'
import { SubscriptionPlan, UserRole } from '@/types'

// ─── ICON MAP ────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Music,
  Bot,
  CalendarCheck,
  BarChart3,
  ImageIcon,
  Plug,
  Bell,
  Trophy,
  Users,
  Settings,
  TrendingUp,
  Mic2,
  BookOpen,
  Sparkles,
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed:    boolean
  onCollapse:   (collapsed: boolean) => void
  mobileOpen:   boolean
  onMobileClose:() => void
}

// ─── STREAK FLAME ────────────────────────────────────────────────────────────

function StreakFlame({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full
                    bg-orange-500/15 border border-orange-400/25">
      <span className="text-sm streak-flame">🔥</span>
      <span className="text-xs font-bold font-ui text-orange-400">{count}</span>
    </div>
  )
}

// ─── USER PROFILE WIDGET ─────────────────────────────────────────────────────

function UserProfileWidget({
  collapsed,
}: {
  collapsed: boolean
}) {
  const { user, logout } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  const planColors: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.FREE]:    'bg-sand-200 text-brown-500',
    [SubscriptionPlan.BASIC]:   'bg-brown-100 text-brown-700',
    [SubscriptionPlan.PRO]:     'bg-gold-100 text-gold-dark',
    [SubscriptionPlan.PREMIUM]: 'bg-gradient-gold text-cream-50',
  }

  const planIcons: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.FREE]:    '○',
    [SubscriptionPlan.BASIC]:   '◈',
    [SubscriptionPlan.PRO]:     '◆',
    [SubscriptionPlan.PREMIUM]: '♛',
  }

  if (!user) return null

  return (
    <div className={`
      border-t border-walnut-700/40 p-3
      ${collapsed ? 'flex flex-col items-center gap-2' : ''}
    `}>
      {collapsed ? (
        /* Collapsed — just avatar + logout */
        <>
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0
                          ring-2 ring-gold-500/30">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt={user.displayName}
                   className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-gold flex items-center
                              justify-center">
                <span className="text-cream-50 font-display font-bold text-base">
                  {user.displayName?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
            className="w-9 h-9 rounded-xl flex items-center justify-center
                       text-cream-500 hover:text-error hover:bg-red-900/20
                       transition-all duration-200"
          >
            {loggingOut
              ? <div className="w-4 h-4 border-2 border-cream-500 border-t-transparent rounded-full animate-spin" />
              : <LogOut size={16} />
            }
          </button>
        </>
      ) : (
        /* Expanded — full profile card */
        <div className="glass-dark rounded-2xl p-3 border border-walnut-600/30">
          {/* User info row */}
          <div className="flex items-center gap-3 mb-2.5">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0
                            ring-2 ring-gold-500/30">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt={user.displayName}
                     className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-gold flex items-center
                                justify-center">
                  <span className="text-cream-50 font-display font-bold text-lg">
                    {user.displayName?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>

            {/* Name + username */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold font-ui text-cream-100
                            truncate leading-tight">
                {user.displayName}
              </p>
              <p className="text-xs text-cream-500 font-ui truncate">
                @{user.username}
              </p>
            </div>

            {/* Streak */}
            <StreakFlame count={user.currentStreak} />
          </div>

          {/* Plan badge */}
          <div className="flex items-center justify-between">
            <span className={`
              inline-flex items-center gap-1 text-2xs font-bold font-ui
              uppercase tracking-wider px-2 py-0.5 rounded-full
              ${planColors[user.plan]}
            `}>
              {planIcons[user.plan]} {user.plan}
            </span>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Sign out"
              className="text-cream-500 hover:text-error transition-colors
                         flex items-center gap-1 text-xs font-ui"
            >
              {loggingOut
                ? <div className="w-3 h-3 border border-cream-500 border-t-transparent rounded-full animate-spin" />
                : <LogOut size={13} />
              }
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PREMIUM UPGRADE PROMPT ───────────────────────────────────────────────────

function PremiumPrompt({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth()
  if (!user || user.plan === SubscriptionPlan.PREMIUM) return null

  if (collapsed) {
    return (
      <div className="px-3 mb-2">
        <Link
          href="/dashboard/settings?tab=billing"
          title="Upgrade to Premium"
          className="w-full flex items-center justify-center py-2 rounded-xl
                     bg-gradient-to-r from-gold-600/20 to-gold-500/20
                     border border-gold-500/30 hover:border-gold-400/50
                     transition-all duration-200 group"
        >
          <Crown size={16} className="text-gold-400 group-hover:text-gold-300
                                      transition-colors" />
        </Link>
      </div>
    )
  }

  return (
    <div className="px-3 mb-3">
      <Link
        href="/dashboard/settings?tab=billing"
        className="block relative overflow-hidden rounded-2xl
                   bg-gradient-to-br from-gold-900/50 to-walnut-800/50
                   border border-gold-600/30 p-3.5 group
                   hover:border-gold-500/50 transition-all duration-300
                   hover:shadow-gold"
      >
        {/* Shimmer */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                        transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent
                          via-gold-400/10 to-transparent -skew-x-12
                          animate-gold-sweep" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={16} className="text-gold-400" />
            <span className="text-xs font-bold font-ui text-gold-300
                             uppercase tracking-wide">
              Upgrade to Premium
            </span>
          </div>
          <p className="text-xs text-cream-500 leading-relaxed mb-2.5">
            Unlock unlimited songs, AI coach, posters & advanced analytics.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-ui font-semibold
                          text-gold-400">
            <Sparkles size={12} />
            Get Premium →
          </div>
        </div>
      </Link>
    </div>
  )
}

// ─── NAV ITEM ────────────────────────────────────────────────────────────────

function NavItem({
  item,
  collapsed,
  isActive,
}: {
  item:      (typeof SIDEBAR_NAV_ITEMS)[number]
  collapsed: boolean
  isActive:  boolean
}) {
  const Icon = ICON_MAP[item.icon] || Music

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`
        sidebar-nav-item mx-2 group relative
        ${isActive ? 'active' : ''}
        ${collapsed ? 'justify-center px-0 w-11 mx-auto' : ''}
      `}
    >
      {/* Icon */}
      <Icon
        size={18}
        className={`
          flex-shrink-0 transition-transform duration-200
          group-hover:scale-110
          ${isActive ? 'text-gold-300' : 'text-cream-400'}
        `}
      />

      {/* Label */}
      {!collapsed && (
        <span className="truncate">{item.label}</span>
      )}

      {/* Badge */}
      {item.badge && !collapsed && (
        <span className="ml-auto text-2xs font-bold font-ui px-1.5 py-0.5
                         rounded-full bg-gold-500/20 text-gold-400 border
                         border-gold-500/30">
          {item.badge}
        </span>
      )}

      {/* Tooltip (collapsed mode) */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2.5 py-1.5 rounded-lg
                        bg-walnut-700 text-cream-100 text-xs font-ui font-medium
                        whitespace-nowrap opacity-0 group-hover:opacity-100
                        pointer-events-none transition-all duration-150
                        shadow-lg border border-walnut-600/50 z-50
                        translate-x-1 group-hover:translate-x-0">
          {item.label}
          {/* Arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2
                          border-4 border-transparent border-r-walnut-700" />
        </div>
      )}
    </Link>
  )
}

// ─── NAV SECTION ─────────────────────────────────────────────────────────────

function NavSection({
  title,
  items,
  collapsed,
  pathname,
}: {
  title:    string
  items:    typeof SIDEBAR_NAV_ITEMS
  collapsed:boolean
  pathname: string
}) {
  return (
    <div className="mb-2">
      {!collapsed && (
        <p className="px-5 mb-1 text-2xs font-bold font-ui uppercase
                      tracking-widest text-cream-600">
          {title}
        </p>
      )}
      {collapsed && <div className="h-px bg-walnut-700/40 mx-3 mb-2" />}
      <div className="flex flex-col gap-0.5">
        {items.map(item => (
          <NavItem
            key={item.href}
            item={item}
            collapsed={collapsed}
            isActive={
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            }
          />
        ))}
      </div>
    </div>
  )
}

// ─── MAIN SIDEBAR ─────────────────────────────────────────────────────────────

export default function Sidebar({
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname()
  const { user, isAdmin, isOwner } = useAuth()

  // Split nav items into sections
  const mainItems = SIDEBAR_NAV_ITEMS.slice(0, 6)   // Dashboard → Integrations
  const toolItems = SIDEBAR_NAV_ITEMS.slice(6, 9)   // Reminders → Milestones → Community
  const footerItems = SIDEBAR_NAV_ITEMS.slice(9)    // Settings

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose()
  }, [pathname, onMobileClose])

  // Close on escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) onMobileClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen, onMobileClose])

  const SidebarContent = (
    <div className="flex flex-col h-full">

      {/* ── Logo & collapse button ──────────────────── */}
      <div className={`
        flex items-center px-4 py-4 border-b border-walnut-700/40
        ${collapsed ? 'justify-center' : 'justify-between'}
      `}>
        {/* Logo */}
        {!collapsed && (
          <Link href="/dashboard"
                className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-gold flex items-center
                            justify-center shadow-gold group-hover:shadow-glow
                            transition-all duration-300 flex-shrink-0">
              <span className="text-cream-50 font-display font-bold text-base">स</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold font-display text-cream-100 leading-none
                            truncate">
                {APP_NAME}
              </p>
              <p className="text-2xs text-cream-500 font-ui">Creator Platform</p>
            </div>
          </Link>
        )}

        {collapsed && (
          <Link href="/dashboard" title={APP_NAME}>
            <div className="w-9 h-9 rounded-xl bg-gradient-gold flex items-center
                            justify-center shadow-gold hover:shadow-glow
                            transition-all duration-300">
              <span className="text-cream-50 font-display font-bold text-lg">स</span>
            </div>
          </Link>
        )}

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => onCollapse(!collapsed)}
          className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center
                     text-cream-500 hover:text-cream-200 hover:bg-walnut-700/60
                     transition-all duration-200 flex-shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight size={15} />
            : <ChevronLeft  size={15} />
          }
        </button>

        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center
                     text-cream-500 hover:text-cream-200 transition-colors"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Quick stats strip (expanded only) ──────── */}
      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-walnut-700/30">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Songs',   value: user.totalSongs,        icon: '🎵' },
              { label: 'Hours',   value: Math.round(user.totalPracticeHours), icon: '⏱️' },
              { label: 'Streak',  value: user.currentStreak,     icon: '🔥' },
            ].map(stat => (
              <div key={stat.label}
                   className="flex flex-col items-center py-1.5 rounded-xl
                              bg-walnut-800/40 border border-walnut-700/30">
                <span className="text-base leading-none mb-0.5">{stat.icon}</span>
                <span className="text-sm font-bold font-display text-cream-100
                                 leading-none">
                  {stat.value}
                </span>
                <span className="text-2xs font-ui text-cream-600">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Navigation ──────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3
                      scrollbar-hide" aria-label="Main navigation">
        <NavSection
          title="Main"
          items={mainItems}
          collapsed={collapsed}
          pathname={pathname}
        />
        <NavSection
          title="Tools"
          items={toolItems}
          collapsed={collapsed}
          pathname={pathname}
        />

        {/* Admin / Owner links */}
        {(isAdmin || isOwner) && (
          <div className="mb-2 mt-1">
            {!collapsed && (
              <p className="px-5 mb-1 text-2xs font-bold font-ui uppercase
                            tracking-widest text-gold-500/60">
                Admin
              </p>
            )}
            {collapsed && <div className="h-px bg-walnut-700/40 mx-3 mb-2" />}
            <div className="flex flex-col gap-0.5">
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`sidebar-nav-item mx-2 group relative
                    ${pathname.startsWith('/admin') ? 'active' : ''}
                    ${collapsed ? 'justify-center px-0 w-11 mx-auto' : ''}
                  `}
                  title={collapsed ? 'Admin Panel' : undefined}
                >
                  <Star size={18} className="flex-shrink-0 text-gold-400" />
                  {!collapsed && <span>Admin Panel</span>}
                </Link>
              )}
              {isOwner && (
                <Link
                  href="/owner"
                  className={`sidebar-nav-item mx-2 group relative
                    ${pathname.startsWith('/owner') ? 'active' : ''}
                    ${collapsed ? 'justify-center px-0 w-11 mx-auto' : ''}
                  `}
                  title={collapsed ? 'Owner Dashboard' : undefined}
                >
                  <Crown size={18} className="flex-shrink-0 text-gold-300" />
                  {!collapsed && <span>Owner Dashboard</span>}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Footer nav item (Settings) */}
        <NavSection
          title="Account"
          items={footerItems}
          collapsed={collapsed}
          pathname={pathname}
        />
      </nav>

      {/* ── Premium upgrade prompt ──────────────────── */}
      <PremiumPrompt collapsed={collapsed} />

      {/* ── User profile widget ─────────────────────── */}
      <UserProfileWidget collapsed={collapsed} />
    </div>
  )

  return (
    <>
      {/* ── Mobile overlay ──────────────────────────── */}
      {mobileOpen && (
        <div
          className="sidebar-overlay open lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* ── Desktop sidebar ─────────────────────────── */}
      <aside
        className={`
          sidebar hidden lg:flex flex-col
          bg-gradient-sidebar
          transition-all duration-300 ease-premium
          ${collapsed ? 'w-[72px]' : 'w-[280px]'}
        `}
        aria-label="Sidebar navigation"
      >
        {SidebarContent}
      </aside>

      {/* ── Mobile sidebar (slide-in) ────────────────── */}
      <aside
        className={`
          sidebar lg:hidden flex flex-col
          bg-gradient-sidebar
          transition-transform duration-300 ease-premium
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          w-[280px]
        `}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        {SidebarContent}
      </aside>
    </>
  )
}

// ─── MOBILE MENU BUTTON ───────────────────────────────────────────────────────

export function MobileMenuButton({
  onClick,
  isOpen,
}: {
  onClick: () => void
  isOpen:  boolean
}) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden w-10 h-10 flex items-center justify-center
                 rounded-xl bg-walnut-800/60 border border-walnut-600/40
                 text-cream-200 hover:bg-walnut-700/60 transition-all duration-200"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
    >
      {isOpen ? <X size={18} /> : <Menu size={18} />}
    </button>
  )
}
