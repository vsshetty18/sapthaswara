/* ============================================================
   SVARAVERSE AI — Owner Dashboard
   Platform Stats | Revenue | System Health | User Management
   ============================================================ */

'use client'

import React, { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Users, DollarSign, Activity, Server, Database, Cpu,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  RefreshCw, Download, Eye, Shield, Zap, Music,
  ArrowUpRight, ArrowDownRight, Globe, Smartphone,
  Crown, Star, BarChart3, Clock, Brain,
} from 'lucide-react'
import toast from 'react-hot-toast'

import DashboardLayout from '@/components/layout/DashboardLayout'
import { WithAuth }    from '@/context/AuthContext'
import { UserRole }    from '@/types'

// ─── MOCK OWNER DATA ─────────────────────────────────────────────────────────

const OWNER_STATS = {
  totalUsers:          10842,
  dailyActiveUsers:    2341,
  monthlyActiveUsers:  7865,
  premiumUsers:        1204,
  newUsersToday:       87,
  newUsersThisMonth:   1240,
  totalRevenue:        842000,
  monthlyRevenue:      68400,
  dailyRevenue:        2280,
  activeSubscriptions: 1204,
  cancelledThisMonth:  34,
  refundsThisMonth:    8,
  androidInstalls:     6240,
  iosInstalls:         3180,
  webSessions:         18420,
  avgSessionMin:       24,
  retentionRate:       68,
  totalSongs:          284600,
  totalUploads:        42300,
  totalPracticeHours:  98400,
  storageUsedGB:       1840,
  aiRequestsToday:     12840,
  aiCostToday:         18.42,
  dbStatusOk:          true,
  serverStatusOk:      true,
  apiLatencyMs:        124,
  openSupportTickets:  23,
  openBugReports:      7,
  avgRating:           4.8,
}

const userGrowthData = [
  { month: 'Aug', total: 5200, premium: 580 },
  { month: 'Sep', total: 6100, premium: 710 },
  { month: 'Oct', total: 7300, premium: 890 },
  { month: 'Nov', total: 8400, premium: 980 },
  { month: 'Dec', total: 9600, premium: 1100 },
  { month: 'Jan', total: 10842,premium: 1204 },
]

const revenueData = [
  { month: 'Aug', revenue: 38200, refunds: 1200 },
  { month: 'Sep', revenue: 44500, refunds: 800  },
  { month: 'Oct', revenue: 52100, refunds: 1400 },
  { month: 'Nov', revenue: 59800, refunds: 900  },
  { month: 'Dec', revenue: 63400, refunds: 1100 },
  { month: 'Jan', revenue: 68400, refunds: 640  },
]

const dailyActiveData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  dau: Math.floor(1800 + Math.random() * 1000),
  sessions: Math.floor(4000 + Math.random() * 2000),
}))

const aiUsageData = Array.from({ length: 7 }, (_, i) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return {
    day:      days[i],
    requests: Math.floor(8000 + Math.random() * 8000),
    cost:     parseFloat((10 + Math.random() * 15).toFixed(2)),
  }
})

// ─── METRIC CARD ─────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon, label, value, sub, change, color, bg, format,
}: {
  icon:    React.ElementType
  label:   string
  value:   number | string
  sub?:    string
  change?: number
  color:   string
  bg:      string
  format?: 'currency' | 'percent' | 'number'
}) {
  const displayValue = typeof value === 'string' ? value
    : format === 'currency' ? `₹${value.toLocaleString('en-IN')}`
    : format === 'percent'  ? `${value}%`
    : value.toLocaleString('en-IN')

  return (
    <div className="card-premium p-4 relative overflow-hidden group">
      <div className={`absolute -top-3 -right-3 w-16 h-16 rounded-full
                       ${bg} opacity-20 blur-xl`} />
      <div className="flex items-start justify-between mb-2 relative z-10">
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={17} className={color} />
        </div>
        {change !== undefined && (
          <span className={`text-2xs font-ui font-semibold flex items-center gap-0.5
                            ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {change >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-xl font-display font-bold text-walnut-800 dark:text-cream-100
                    relative z-10">
        {displayValue}
      </p>
      <p className="text-xs font-ui font-medium text-brown-500 dark:text-cream-400
                    uppercase tracking-wide mt-0.5 relative z-10">
        {label}
      </p>
      {sub && (
        <p className="text-2xs text-brown-400 dark:text-cream-500 mt-0.5 relative z-10">
          {sub}
        </p>
      )}
    </div>
  )
}

// ─── SYSTEM HEALTH ────────────────────────────────────────────────────────────

function SystemHealth() {
  const services = [
    { name: 'API Server',      status: true,  latency: '124ms', uptime: '99.98%' },
    { name: 'Database (PG)',   status: true,  latency: '8ms',   uptime: '100%'   },
    { name: 'Firebase',        status: true,  latency: '45ms',  uptime: '99.99%' },
    { name: 'Storage',         status: true,  latency: '92ms',  uptime: '99.97%' },
    { name: 'OpenAI API',      status: true,  latency: '890ms', uptime: '99.85%' },
    { name: 'Razorpay',        status: true,  latency: '210ms', uptime: '99.92%' },
    { name: 'Push Notifs (FCM)',status: false, latency: '—',     uptime: '98.40%' },
  ]

  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server size={16} className="text-green-500" />
          <h3 className="font-ui font-semibold text-sm text-walnut-800
                         dark:text-cream-100">
            System Health
          </h3>
        </div>
        <button
          onClick={() => toast.success('Status refreshed!')}
          className="w-7 h-7 flex items-center justify-center rounded-lg
                     text-brown-400 hover:text-walnut-700 dark:hover:text-cream-200
                     hover:bg-sand-100 dark:hover:bg-walnut-700/40 transition-colors"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {services.map(service => (
          <div key={service.name}
               className="flex items-center gap-3 py-2 border-b border-sand-100/60
                          dark:border-walnut-700/20 last:border-0">
            <div className={`w-2 h-2 rounded-full flex-shrink-0
                             ${service.status ? 'bg-green-500' : 'bg-red-500'}
                             ${service.status ? 'shadow-[0_0_6px_rgba(34,197,94,0.6)]' : ''}`} />
            <span className="text-xs font-ui font-medium text-walnut-700
                             dark:text-cream-200 flex-1">
              {service.name}
            </span>
            <span className={`text-2xs font-mono
                              ${service.status ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              {service.latency}
            </span>
            <span className="text-2xs font-ui text-brown-400 dark:text-cream-500 w-14 text-right">
              {service.uptime}
            </span>
          </div>
        ))}
      </div>

      {/* Alert */}
      <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl
                      bg-orange-50 dark:bg-orange-900/15 border border-orange-200/60
                      dark:border-orange-800/20">
        <AlertTriangle size={13} className="text-orange-500 flex-shrink-0" />
        <p className="text-2xs font-ui text-orange-600 dark:text-orange-400">
          FCM push notifications experiencing intermittent delays
        </p>
      </div>
    </div>
  )
}

// ─── AI COST TRACKER ─────────────────────────────────────────────────────────

function AICostTracker() {
  const monthCost  = 342.80
  const budget     = 500
  const pct        = (monthCost / budget) * 100

  return (
    <div className="card-premium p-5">
      <div className="flex items-center gap-2 mb-4">
        <Brain size={16} className="text-purple-500" />
        <h3 className="font-ui font-semibold text-sm text-walnut-800
                       dark:text-cream-100">
          OpenAI Usage & Cost
        </h3>
      </div>

      {/* Today's cost */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Today',   value: `$${OWNER_STATS.aiCostToday}`,       sub: `${OWNER_STATS.aiRequestsToday.toLocaleString('en-IN')} req` },
          { label: 'Month',   value: `$${monthCost}`,                     sub: `${(budget - monthCost).toFixed(2)} left` },
          { label: 'Budget',  value: `$${budget}`,                        sub: 'Monthly limit' },
        ].map(item => (
          <div key={item.label} className="text-center p-2.5 rounded-xl
                                          bg-sand-50/80 dark:bg-walnut-800/40">
            <p className="text-sm font-display font-bold text-walnut-800
                          dark:text-cream-100">
              {item.value}
            </p>
            <p className="text-2xs font-ui text-brown-400 dark:text-cream-500">
              {item.label}
            </p>
            <p className="text-2xs font-ui text-brown-300 dark:text-cream-600">
              {item.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Budget bar */}
      <div className="mb-1.5 flex justify-between text-2xs font-ui text-brown-400
                      dark:text-cream-500">
        <span>Monthly budget usage</span>
        <span className="font-semibold">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-sand-200 dark:bg-walnut-700 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-700
                      ${pct > 80 ? 'bg-gradient-to-r from-red-400 to-red-500'
                        : pct > 60 ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                        : 'bg-gradient-to-r from-purple-400 to-purple-600'
                      }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Weekly chart */}
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={aiUsageData} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
          <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#A97C52' }}
                 tickLine={false} axisLine={false} />
          <YAxis tick={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: 'rgba(253,250,244,0.95)',
              border: '1px solid rgba(235,217,176,0.6)',
              borderRadius: '0.75rem', fontSize: '11px',
            }}
            formatter={(v: number) => [`${v.toLocaleString()} req`, 'Requests']}
          />
          <Bar dataKey="requests" fill="#A78BFA" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── RECENT USERS TABLE ──────────────────────────────────────────────────────

function RecentUsersTable() {
  const users = [
    { name: 'Priya Sharma',   email: 'priya@example.com', plan: 'Pro',     joined: '2h ago',  status: 'active' },
    { name: 'Rahul Gupta',    email: 'rahul@example.com', plan: 'Free',    joined: '5h ago',  status: 'active' },
    { name: 'Ananya Singh',   email: 'ananya@ex.com',     plan: 'Premium', joined: '8h ago',  status: 'active' },
    { name: 'Kiran Patel',    email: 'kiran@example.com', plan: 'Basic',   joined: '1d ago',  status: 'active' },
    { name: 'Deepak Rao',     email: 'deepak@example.com',plan: 'Free',    joined: '1d ago',  status: 'inactive'},
  ]

  const planColors: Record<string, string> = {
    Free:    'bg-sand-100 text-brown-500 dark:bg-walnut-700/50 dark:text-cream-400',
    Basic:   'bg-brown-100 text-brown-700 dark:bg-brown-900/30 dark:text-brown-300',
    Pro:     'bg-gold-100 text-gold-dark dark:bg-gold-900/20 dark:text-gold-400',
    Premium: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  }

  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-ui font-semibold text-sm text-walnut-800
                       dark:text-cream-100">
          Recent Signups
        </h3>
        <button className="text-xs font-ui text-primary hover:text-primary-hover
                           transition-colors">
          View all →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-sand-100/80 dark:border-walnut-700/30">
              {['User', 'Email', 'Plan', 'Joined', 'Status'].map(h => (
                <th key={h}
                    className="pb-2 text-2xs font-ui font-bold uppercase tracking-wide
                               text-brown-400 dark:text-cream-600 text-left pr-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={i}
                  className="border-b border-sand-100/40 dark:border-walnut-700/20
                             last:border-0 hover:bg-sand-50/60 dark:hover:bg-walnut-800/30
                             transition-colors">
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-300
                                    to-gold-500 flex items-center justify-center
                                    text-xs font-display font-bold text-cream-50
                                    flex-shrink-0">
                      {user.name[0]}
                    </div>
                    <span className="text-xs font-ui font-medium text-walnut-700
                                     dark:text-cream-200 whitespace-nowrap">
                      {user.name}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 pr-3">
                  <span className="text-2xs text-brown-400 dark:text-cream-500">
                    {user.email}
                  </span>
                </td>
                <td className="py-2.5 pr-3">
                  <span className={`text-2xs font-ui font-semibold px-2 py-0.5
                                   rounded-full ${planColors[user.plan]}`}>
                    {user.plan}
                  </span>
                </td>
                <td className="py-2.5 pr-3">
                  <span className="text-2xs text-brown-400 dark:text-cream-500">
                    {user.joined}
                  </span>
                </td>
                <td className="py-2.5">
                  <div className={`flex items-center gap-1 text-2xs font-ui font-medium
                                   ${user.status === 'active' ? 'text-green-600' : 'text-brown-400'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full
                                     ${user.status === 'active' ? 'bg-green-500' : 'bg-sand-300'}`} />
                    {user.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── OWNER DASHBOARD ─────────────────────────────────────────────────────────

function OwnerDashboardContent() {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 1500))
    setRefreshing(false)
    toast.success('Dashboard data refreshed!')
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown size={20} className="text-gold-500" />
              <h1 className="font-display text-2xl font-bold text-walnut-900
                             dark:text-cream-100">
                Owner Dashboard
              </h1>
            </div>
            <p className="text-sm text-brown-400 dark:text-cream-400 font-ui">
              Full platform overview — only visible to owners
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-ghost text-sm px-4 py-2.5 flex items-center gap-2"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2">
              <Download size={14} />
              Export Report
            </button>
          </div>
        </div>

        {/* Alert banner */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl
                        bg-orange-50 dark:bg-orange-900/15
                        border border-orange-200/60 dark:border-orange-800/20">
          <AlertTriangle size={16} className="text-orange-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-ui font-semibold text-orange-700 dark:text-orange-400">
              1 service degraded — FCM Push Notifications
            </p>
            <p className="text-xs text-orange-600/80 dark:text-orange-400/70">
              Some users may experience delayed push notifications. Team is investigating.
            </p>
          </div>
          <button className="text-xs font-ui text-orange-600 hover:text-orange-700
                             font-semibold flex-shrink-0">
            View →
          </button>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard icon={Users}      label="Total Users"     value={OWNER_STATS.totalUsers}        change={13}  color="text-blue-500"   bg="bg-blue-100 dark:bg-blue-900/20"   />
          <MetricCard icon={Activity}   label="Daily Active"    value={OWNER_STATS.dailyActiveUsers}  change={8}   color="text-green-500"  bg="bg-green-100 dark:bg-green-900/20" />
          <MetricCard icon={Crown}      label="Premium Users"   value={OWNER_STATS.premiumUsers}      change={21}  color="text-gold-600"   bg="bg-gold-100 dark:bg-gold-900/20"   />
          <MetricCard icon={DollarSign} label="Monthly Revenue" value={OWNER_STATS.monthlyRevenue} format="currency" change={12} color="text-purple-500" bg="bg-purple-100 dark:bg-purple-900/20" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard icon={Smartphone} label="Android Installs" value={OWNER_STATS.androidInstalls} change={18}  color="text-green-600"  bg="bg-green-100 dark:bg-green-900/20" />
          <MetricCard icon={Globe}      label="iOS Installs"     value={OWNER_STATS.iosInstalls}      change={9}   color="text-blue-500"   bg="bg-blue-100 dark:bg-blue-900/20"   />
          <MetricCard icon={BarChart3}  label="Retention Rate"   value={OWNER_STATS.retentionRate} format="percent" change={3} color="text-teal-500" bg="bg-teal-100 dark:bg-teal-900/20" />
          <MetricCard icon={Star}       label="Avg Rating"       value={OWNER_STATS.avgRating}         change={2}   color="text-gold-600"   bg="bg-gold-100 dark:bg-gold-900/20"   />
        </div>

        {/* Revenue + User growth charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Revenue chart */}
          <div className="card-premium p-5">
            <h3 className="font-display font-semibold text-base text-walnut-800
                           dark:text-cream-100 mb-1">
              Monthly Revenue
            </h3>
            <p className="text-xs text-brown-400 dark:text-cream-500 mb-4">
              Revenue vs refunds (₹)
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(235,217,176,0.3)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#A97C52' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#A97C52' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(253,250,244,0.95)',
                    border: '1px solid rgba(235,217,176,0.6)',
                    borderRadius: '1rem', fontSize: '12px',
                  }}
                  formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="revenue" fill="#B45309" radius={[6,6,0,0]} name="Revenue" />
                <Bar dataKey="refunds" fill="#EF4444" radius={[6,6,0,0]} name="Refunds" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* User growth chart */}
          <div className="card-premium p-5">
            <h3 className="font-display font-semibold text-base text-walnut-800
                           dark:text-cream-100 mb-1">
              User Growth
            </h3>
            <p className="text-xs text-brown-400 dark:text-cream-500 mb-4">
              Total users vs premium users
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={userGrowthData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="premGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(235,217,176,0.3)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#A97C52' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#A97C52' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(253,250,244,0.95)',
                    border: '1px solid rgba(235,217,176,0.6)',
                    borderRadius: '1rem', fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="total"   stroke="#3B82F6" fill="url(#totalGrad)" strokeWidth={2} name="Total Users" />
                <Area type="monotone" dataKey="premium" stroke="#F59E0B" fill="url(#premGrad)"  strokeWidth={2} name="Premium" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DAU chart */}
        <div className="card-premium p-5">
          <h3 className="font-display font-semibold text-base text-walnut-800
                         dark:text-cream-100 mb-1">
            Daily Active Users (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={dailyActiveData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(235,217,176,0.3)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#A97C52' }}
                     tickLine={false} axisLine={false}
                     interval={4} />
              <YAxis tick={{ fontSize: 9, fill: '#A97C52' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(253,250,244,0.95)',
                  border: '1px solid rgba(235,217,176,0.6)',
                  borderRadius: '0.75rem', fontSize: '11px',
                }}
              />
              <Line type="monotone" dataKey="dau" stroke="#10B981" strokeWidth={2}
                    dot={false} name="DAU" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* System health + AI cost */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SystemHealth />
          <AICostTracker />
        </div>

        {/* Platform stats + Recent users */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Platform content stats */}
          <div className="card-premium p-5">
            <h3 className="font-ui font-semibold text-sm text-walnut-800
                           dark:text-cream-100 mb-4">
              Platform Content
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { icon: Music,    label: 'Total Songs',         value: OWNER_STATS.totalSongs.toLocaleString('en-IN'),    color: 'text-gold-600' },
                { icon: Activity, label: 'Total Uploads',       value: OWNER_STATS.totalUploads.toLocaleString('en-IN'),  color: 'text-blue-500' },
                { icon: Clock,    label: 'Practice Hours',      value: `${OWNER_STATS.totalPracticeHours.toLocaleString('en-IN')}h`, color: 'text-green-500' },
                { icon: Database, label: 'Storage Used',        value: `${OWNER_STATS.storageUsedGB} GB`,                 color: 'text-purple-500' },
                { icon: Zap,      label: 'AI Req Today',        value: OWNER_STATS.aiRequestsToday.toLocaleString('en-IN'), color: 'text-orange-500' },
                { icon: Shield,   label: 'Support Tickets',     value: OWNER_STATS.openSupportTickets,                    color: 'text-red-500' },
              ].map(item => (
                <div key={item.label}
                     className="flex items-center justify-between py-1.5 border-b
                                border-sand-100/60 dark:border-walnut-700/20 last:border-0">
                  <div className="flex items-center gap-2">
                    <item.icon size={14} className={item.color} />
                    <span className="text-xs font-ui text-brown-500 dark:text-cream-400">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs font-ui font-semibold text-walnut-700
                                   dark:text-cream-200">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent users */}
          <div className="lg:col-span-2">
            <RecentUsersTable />
          </div>
        </div>

        {/* Support + Bug stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Open Support Tickets', value: OWNER_STATS.openSupportTickets, icon: Shield,    color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20', action: 'View tickets' },
            { label: 'Open Bug Reports',      value: OWNER_STATS.openBugReports,     icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20',      action: 'View bugs'    },
            { label: 'Cancellations/Month',   value: OWNER_STATS.cancelledThisMonth, icon: TrendingDown,  color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20',  action: 'View churned' },
          ].map(item => (
            <div key={item.label} className="card-premium p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center
                               justify-center flex-shrink-0`}>
                <item.icon size={18} className={item.color} />
              </div>
              <div className="flex-1">
                <p className="text-xl font-display font-bold text-walnut-800
                              dark:text-cream-100">
                  {item.value}
                </p>
                <p className="text-xs font-ui text-brown-400 dark:text-cream-500">
                  {item.label}
                </p>
              </div>
              <button className="text-2xs font-ui text-primary hover:text-primary-hover
                                 transition-colors flex-shrink-0">
                {item.action} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

// ─── EXPORT WITH AUTH GUARD ───────────────────────────────────────────────────

export default function OwnerPage() {
  return (
    <WithAuth requiredRole={UserRole.OWNER}>
      <OwnerDashboardContent />
    </WithAuth>
  )
}
