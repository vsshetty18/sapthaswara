/* ============================================================
   SVARAVERSE AI — Integrations Page
   Instagram & YouTube | Connect Flow | Stats | AI Analysis
   ============================================================ */

'use client'

import React, { useState, useCallback } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Instagram, Youtube, Link2, Unlink, RefreshCw, Users,
  Heart, MessageCircle, Eye, Clock, TrendingUp,
  TrendingDown, Sparkles, Play, ThumbsUp, DollarSign,
  Hash, CheckCircle2, ExternalLink, Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

import DashboardLayout from '@/components/layout/DashboardLayout'

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_INSTAGRAM = {
  handle:         'priyasings',
  followers:      1380,
  following:      245,
  posts:          87,
  reach:          12400,
  engagement:     6.8,
  avgLikes:       420,
  avgComments:    38,
  monthlyGrowth:  15.2,
  bestPostingTime:['7:00 PM', '9:00 PM'],
  topHashtags:    ['#bollywood', '#cover', '#singer', '#music', '#indiansinger'],
  recentPosts: [
    { type: 'reel',  caption: 'Kesariya cover 🧡',     likes: 890, comments: 67, thumbnail: '🎵' },
    { type: 'reel',  caption: 'Riyaz session ✨',       likes: 450, comments: 32, thumbnail: '🎤' },
    { type: 'image', caption: 'New cover dropping!',   likes: 320, comments: 18, thumbnail: '📸' },
    { type: 'reel',  caption: 'Tum Hi Ho — full cover',likes: 1240,comments: 95, thumbnail: '🎶' },
  ],
}

const MOCK_YOUTUBE = {
  channelName:    'Priya Sings',
  subscribers:    520,
  totalViews:     24600,
  totalVideos:    34,
  watchTimeHours: 890,
  avgCTR:         4.2,
  avgRetention:   58,
  monthlyGrowth:  32.4,
  uploadsPerMonth:4,
  estimatedRevenue: 1200,
  topVideos: [
    { title: 'Tum Hi Ho — Full Cover', views: 8200, likes: 540, ctr: 5.1 },
    { title: 'Kesariya Acoustic',      views: 5600, likes: 380, ctr: 4.8 },
    { title: 'Riyaz Routine Vlog',     views: 3100, likes: 210, ctr: 3.2 },
  ],
}

const growthData = [
  { day: 'Week 1', instagram: 1180, youtube: 380 },
  { day: 'Week 2', instagram: 1250, youtube: 420 },
  { day: 'Week 3', instagram: 1310, youtube: 470 },
  { day: 'Week 4', instagram: 1380, youtube: 520 },
]

// ─── CONNECT CARD (not connected state) ──────────────────────────────────────

function ConnectCard({
  platform,
  icon: Icon,
  gradientFrom,
  gradientTo,
  onConnect,
}: {
  platform:     string
  icon:         React.ElementType
  gradientFrom: string
  gradientTo:   string
  onConnect:    (handle: string) => Promise<void>
}) {
  const [handle, setHandle] = useState('')
  const [connecting, setConnecting] = useState(false)

  const handleSubmit = async () => {
    if (!handle.trim()) {
      toast.error(`Please enter your ${platform} handle`)
      return
    }
    setConnecting(true)
    await onConnect(handle.trim())
    setConnecting(false)
  }

  return (
    <div className="card-premium p-8 flex flex-col items-center text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      >
        <Icon size={28} className="text-white" />
      </div>

      <h3 className="font-display font-bold text-lg text-walnut-800
                     dark:text-cream-100 mb-1">
        Connect {platform}
      </h3>
      <p className="text-sm text-brown-400 dark:text-cream-500 mb-6 max-w-xs">
        Enter your {platform} {platform === 'YouTube' ? 'channel URL' : 'handle'} to see
        analytics, growth trends, and AI-powered insights.
      </p>

      <div className="w-full max-w-xs flex flex-col gap-3">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brown-400
                           dark:text-cream-500 text-sm">
            {platform === 'Instagram' ? '@' : '🔗'}
          </span>
          <input
            value={handle}
            onChange={e => setHandle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder={platform === 'Instagram' ? 'yourusername' : 'youtube.com/@yourname'}
            className="form-input w-full pl-9 text-sm dark:bg-walnut-800/60
                       dark:border-walnut-600/60 dark:text-cream-100
                       dark:placeholder-cream-600"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={connecting}
          className="btn-primary py-2.5 text-sm flex items-center
                     justify-center gap-2 disabled:opacity-60"
        >
          {connecting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Link2 size={15} />
              Connect {platform}
            </>
          )}
        </button>
      </div>

      <p className="text-2xs text-brown-300 dark:text-cream-600 mt-4">
        We only read public data. Your credentials are never stored.
      </p>
    </div>
  )
}

// ─── STAT PILL ────────────────────────────────────────────────────────────────

function StatPill({
  icon: Icon, label, value, trend,
}: {
  icon:  React.ElementType
  label: string
  value: string
  trend?: number
}) {
  return (
    <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-sand-50/80
                    dark:bg-walnut-800/40 border border-sand-100/80
                    dark:border-walnut-700/30">
      <div className="flex items-center justify-between">
        <Icon size={15} className="text-brown-400 dark:text-cream-500" />
        {trend !== undefined && (
          <span className={`text-2xs font-ui font-semibold flex items-center gap-0.5
                            ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-lg font-display font-bold text-walnut-800 dark:text-cream-100">
        {value}
      </p>
      <p className="text-2xs font-ui text-brown-400 dark:text-cream-500">
        {label}
      </p>
    </div>
  )
}

// ─── INSTAGRAM PANEL ──────────────────────────────────────────────────────────

function InstagramPanel({ onDisconnect }: { onDisconnect: () => void }) {
  const data = MOCK_INSTAGRAM
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 1200))
    setRefreshing(false)
    toast.success('Instagram data refreshed!')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="card-premium p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center
                          bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400
                          shadow-lg">
            <Instagram size={22} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-base text-walnut-800
                          dark:text-cream-100 flex items-center gap-1.5">
              @{data.handle}
              <CheckCircle2 size={14} className="text-blue-500" />
            </p>
            <p className="text-xs text-brown-400 dark:text-cream-500 font-ui">
              Connected · Last synced 2 hours ago
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-9 h-9 flex items-center justify-center rounded-xl
                       bg-sand-100 dark:bg-walnut-700/50 text-brown-500
                       dark:text-cream-400 hover:bg-sand-200 dark:hover:bg-walnut-700
                       transition-colors"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <a
            href={`https://instagram.com/${data.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 flex items-center justify-center rounded-xl
                       bg-sand-100 dark:bg-walnut-700/50 text-brown-500
                       dark:text-cream-400 hover:bg-sand-200 dark:hover:bg-walnut-700
                       transition-colors"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1.5 text-xs font-ui font-medium
                       text-error hover:text-red-700 px-3 py-2 rounded-xl
                       hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <Unlink size={13} />
            Disconnect
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill icon={Users}          label="Followers"   value={data.followers.toLocaleString('en-IN')} trend={data.monthlyGrowth} />
        <StatPill icon={Eye}            label="Reach"       value={`${(data.reach / 1000).toFixed(1)}K`}   trend={8.2} />
        <StatPill icon={Heart}          label="Engagement"  value={`${data.engagement}%`}                   trend={2.1} />
        <StatPill icon={MessageCircle}  label="Avg Comments"value={`${data.avgComments}`}                   trend={-1.5} />
      </div>

      {/* Best time + hashtags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-premium p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-blue-500" />
            <p className="text-xs font-ui font-bold uppercase tracking-wide
                          text-brown-400 dark:text-cream-500">
              Best Posting Time
            </p>
          </div>
          <div className="flex gap-2">
            {data.bestPostingTime.map(time => (
              <span key={time}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20
                               text-blue-600 dark:text-blue-400 text-sm font-ui
                               font-semibold">
                {time}
              </span>
            ))}
          </div>
        </div>

        <div className="card-premium p-4">
          <div className="flex items-center gap-2 mb-3">
            <Hash size={15} className="text-purple-500" />
            <p className="text-xs font-ui font-bold uppercase tracking-wide
                          text-brown-400 dark:text-cream-500">
              Top Performing Hashtags
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.topHashtags.map(tag => (
              <span key={tag} className="tag gold text-2xs">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent posts */}
      <div className="card-premium p-5">
        <p className="text-sm font-ui font-semibold text-walnut-800
                      dark:text-cream-100 mb-3">
          Recent Posts Performance
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.recentPosts.map((post, i) => (
            <div key={i}
                 className="rounded-2xl overflow-hidden border border-sand-200/60
                            dark:border-walnut-700/40 group cursor-pointer">
              <div className="aspect-square bg-gradient-to-br from-purple-200
                              to-pink-200 dark:from-purple-900/30 dark:to-pink-900/30
                              flex items-center justify-center text-3xl">
                {post.thumbnail}
              </div>
              <div className="p-2.5">
                <p className="text-2xs font-ui text-walnut-700 dark:text-cream-200
                             truncate mb-1">
                  {post.caption}
                </p>
                <div className="flex items-center gap-2 text-2xs text-brown-400
                                dark:text-cream-500">
                  <span className="flex items-center gap-0.5">
                    <Heart size={10} /> {post.likes}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MessageCircle size={10} /> {post.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── YOUTUBE PANEL ────────────────────────────────────────────────────────────

function YouTubePanel({ onDisconnect }: { onDisconnect: () => void }) {
  const data = MOCK_YOUTUBE
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(r => setTimeout(r, 1200))
    setRefreshing(false)
    toast.success('YouTube data refreshed!')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="card-premium p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center
                          bg-red-500 shadow-lg">
            <Youtube size={22} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-base text-walnut-800
                          dark:text-cream-100">
              {data.channelName}
            </p>
            <p className="text-xs text-brown-400 dark:text-cream-500 font-ui">
              Connected · Last synced 2 hours ago
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-9 h-9 flex items-center justify-center rounded-xl
                       bg-sand-100 dark:bg-walnut-700/50 text-brown-500
                       dark:text-cream-400 hover:bg-sand-200 dark:hover:bg-walnut-700
                       transition-colors"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1.5 text-xs font-ui font-medium
                       text-error hover:text-red-700 px-3 py-2 rounded-xl
                       hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <Unlink size={13} />
            Disconnect
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill icon={Users} label="Subscribers" value={data.subscribers.toLocaleString('en-IN')} trend={data.monthlyGrowth} />
        <StatPill icon={Eye}   label="Total Views" value={`${(data.totalViews / 1000).toFixed(1)}K`} trend={12.5} />
        <StatPill icon={Play}  label="CTR"         value={`${data.avgCTR}%`}                          trend={1.8} />
        <StatPill icon={Clock} label="Avg Retention" value={`${data.avgRetention}%`}                  trend={-2.3} />
      </div>

      {/* Revenue + watch time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-premium p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={15} className="text-green-500" />
            <p className="text-xs font-ui font-bold uppercase tracking-wide
                          text-brown-400 dark:text-cream-500">
              Estimated Revenue
            </p>
          </div>
          <p className="text-2xl font-display font-bold text-walnut-800
                        dark:text-cream-100">
            ₹{data.estimatedRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-brown-400 dark:text-cream-500 mt-1">
            This month (estimated)
          </p>
        </div>

        <div className="card-premium p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-blue-500" />
            <p className="text-xs font-ui font-bold uppercase tracking-wide
                          text-brown-400 dark:text-cream-500">
              Total Watch Time
            </p>
          </div>
          <p className="text-2xl font-display font-bold text-walnut-800
                        dark:text-cream-100">
            {data.watchTimeHours}h
          </p>
          <p className="text-xs text-brown-400 dark:text-cream-500 mt-1">
            {data.uploadsPerMonth} uploads/month average
          </p>
        </div>
      </div>

      {/* Top videos */}
      <div className="card-premium p-5">
        <p className="text-sm font-ui font-semibold text-walnut-800
                      dark:text-cream-100 mb-3">
          Top Performing Videos
        </p>
        <div className="flex flex-col gap-2">
          {data.topVideos.map((video, i) => (
            <div key={i}
                 className="flex items-center gap-3 p-3 rounded-xl
                            hover:bg-sand-50/60 dark:hover:bg-walnut-800/30
                            transition-colors duration-150">
              <div className="w-16 h-10 rounded-lg bg-gradient-to-br from-red-200
                              to-red-400 dark:from-red-900/40 dark:to-red-800/30
                              flex items-center justify-center flex-shrink-0">
                <Play size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-ui font-semibold text-walnut-700
                              dark:text-cream-200 truncate">
                  {video.title}
                </p>
                <div className="flex items-center gap-3 text-2xs text-brown-400
                                dark:text-cream-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Eye size={10} /> {video.views.toLocaleString('en-IN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={10} /> {video.likes}
                  </span>
                  <span>CTR: {video.ctr}%</span>
                </div>
              </div>
              <span className="text-2xs font-ui font-bold text-gold-600
                               bg-gold-50 dark:bg-gold-900/20 px-2 py-1 rounded-lg
                               flex-shrink-0">
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── COMBINED GROWTH CHART ────────────────────────────────────────────────────

function CombinedGrowthChart() {
  return (
    <div className="card-premium p-5">
      <h3 className="font-display font-semibold text-lg text-walnut-800
                     dark:text-cream-100 mb-1">
        Combined Growth Trend
      </h3>
      <p className="text-xs text-brown-400 dark:text-cream-500 font-ui mb-4">
        Instagram followers vs YouTube subscribers — last 4 weeks
      </p>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={growthData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#E1306C" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#E1306C" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ytGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#FF0000" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#FF0000" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(235,217,176,0.3)" />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#A97C52' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#A97C52' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: 'rgba(253,250,244,0.95)',
              border: '1px solid rgba(235,217,176,0.6)',
              borderRadius: '1rem',
              fontSize: '12px',
            }}
          />
          <Area type="monotone" dataKey="instagram" stroke="#E1306C" strokeWidth={2}
                fill="url(#igGrad)" name="Instagram" />
          <Area type="monotone" dataKey="youtube" stroke="#FF0000" strokeWidth={2}
                fill="url(#ytGrad)" name="YouTube" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── AI ANALYSIS CARD ─────────────────────────────────────────────────────────

function AIAnalysisCard() {
  return (
    <div className="card-premium p-5 bg-gradient-to-br from-purple-50/50
                    to-cream-50 dark:from-purple-900/10 dark:to-walnut-800/40
                    border-purple-100/60 dark:border-purple-800/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30
                        flex items-center justify-center">
          <Sparkles size={17} className="text-purple-500" />
        </div>
        <div>
          <p className="text-sm font-ui font-semibold text-walnut-800
                        dark:text-cream-100">
            AI Cross-Platform Analysis
          </p>
          <p className="text-2xs text-brown-400 dark:text-cream-500">
            Based on your last 30 days
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {[
          'Your YouTube growth (32%) is outpacing Instagram (15%) — consider cross-promoting Instagram content on YouTube Shorts.',
          'Reels posted between 7-9 PM IST get 2.3x more engagement than other times.',
          'Your top-performing content theme is "Acoustic Covers" — consider a dedicated weekly series.',
          'Comment reply rate is 65% — replying to more comments could boost algorithmic reach by ~20%.',
        ].map((insight, i) => (
          <div key={i}
               className="flex items-start gap-2.5 text-xs font-ui
                          text-brown-500 dark:text-cream-300 leading-relaxed">
            <span className="text-purple-400 mt-0.5 flex-shrink-0">✦</span>
            {insight}
          </div>
        ))}
      </div>

      <a href="/dashboard/ai-coach"
         className="mt-4 inline-flex items-center gap-1.5 text-xs font-ui
                    font-semibold text-purple-600 dark:text-purple-400
                    hover:text-purple-700 transition-colors">
        Ask AI Coach for more insights →
      </a>
    </div>
  )
}

// ─── INTEGRATIONS PAGE ────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [igConnected, setIgConnected] = useState(true)
  const [ytConnected, setYtConnected] = useState(true)
  const [activeTab,   setActiveTab]   = useState<'instagram' | 'youtube'>('instagram')

  const handleConnectIg = useCallback(async (handle: string) => {
    await new Promise(r => setTimeout(r, 1500))
    setIgConnected(true)
    toast.success(`Connected to @${handle}! 🎉`)
  }, [])

  const handleConnectYt = useCallback(async (_channelUrl: string) => {
    await new Promise(r => setTimeout(r, 1500))
    setYtConnected(true)
    toast.success('YouTube channel connected! 🎉')
  }, [])

  const handleDisconnect = (platform: 'instagram' | 'youtube') => {
    if (!confirm(`Disconnect ${platform === 'instagram' ? 'Instagram' : 'YouTube'}?`)) return
    if (platform === 'instagram') setIgConnected(false)
    else setYtConnected(false)
    toast.success('Disconnected successfully')
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-walnut-900
                         dark:text-cream-100">
            Integrations 🔗
          </h1>
          <p className="text-sm text-brown-400 dark:text-cream-400 font-ui mt-0.5">
            Connect your social platforms to unlock growth insights
          </p>
        </div>

        {/* Platform tabs */}
        <div className="flex items-center gap-2 bg-sand-100 dark:bg-walnut-800/60
                        rounded-2xl p-1.5 w-fit">
          {[
            { key: 'instagram' as const, label: 'Instagram', icon: Instagram, connected: igConnected },
            { key: 'youtube'   as const, label: 'YouTube',   icon: Youtube,   connected: ytConnected },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-ui
                font-medium transition-all duration-200
                ${activeTab === tab.key
                  ? 'bg-white dark:bg-walnut-700 text-walnut-700 dark:text-cream-100 shadow-sm'
                  : 'text-brown-400 dark:text-cream-500 hover:text-walnut-600'
                }
              `}
            >
              <tab.icon size={15} />
              {tab.label}
              {tab.connected && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              )}
            </button>
          ))}
        </div>

        {/* Panel content */}
        {activeTab === 'instagram' ? (
          igConnected ? (
            <InstagramPanel onDisconnect={() => handleDisconnect('instagram')} />
          ) : (
            <ConnectCard
              platform="Instagram"
              icon={Instagram}
              gradientFrom="#833AB4"
              gradientTo="#FD1D1D"
              onConnect={handleConnectIg}
            />
          )
        ) : (
          ytConnected ? (
            <YouTubePanel onDisconnect={() => handleDisconnect('youtube')} />
          ) : (
            <ConnectCard
              platform="YouTube"
              icon={Youtube}
              gradientFrom="#FF0000"
              gradientTo="#CC0000"
              onConnect={handleConnectYt}
            />
          )
        )}

        {/* Combined view (only if both connected) */}
        {igConnected && ytConnected && (
          <>
            <CombinedGrowthChart />
            <AIAnalysisCard />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
