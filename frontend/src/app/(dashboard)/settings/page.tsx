/* ============================================================
   SVARAVERSE AI — Settings Page
   Profile | Billing | Notifications | Privacy | Security
   ============================================================ */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  User, CreditCard, Bell, Shield, Lock, Trash2,
  Camera, Save, Check, Crown, Sparkles, ChevronRight,
  Eye, EyeOff, LogOut, Download, AlertTriangle,
  Instagram, Youtube, Unlink, Globe, Moon, Sun, Monitor,
} from 'lucide-react'
import toast from 'react-hot-toast'

import DashboardLayout   from '@/components/layout/DashboardLayout'
import { ThemeSelector } from '@/context/ThemeContext'
import { useAuth }       from '@/context/AuthContext'
import { PRICING_PLANS, LANGUAGE_OPTIONS, INSTRUMENTS, MUSIC_GENRES, MUSICAL_SCALES } from '@/lib/constants'
import { SubscriptionPlan, type ProfileFormData } from '@/types'

// ─── TAB CONFIG ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'profile',       label: 'Profile',       icon: User        },
  { id: 'billing',       label: 'Billing',        icon: CreditCard  },
  { id: 'notifications', label: 'Notifications',  icon: Bell        },
  { id: 'privacy',       label: 'Privacy',        icon: Shield      },
  { id: 'security',      label: 'Security',       icon: Lock        },
] as const

type TabId = typeof TABS[number]['id']

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────

function Section({
  title, description, children,
}: {
  title:        string
  description?: string
  children:     React.ReactNode
}) {
  return (
    <div className="card-premium p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="font-display font-semibold text-base text-walnut-800
                       dark:text-cream-100">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-brown-400 dark:text-cream-500 mt-0.5 font-ui">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── FORM FIELD ───────────────────────────────────────────────────────────────

function FormField({
  label, hint, children, required,
}: {
  label:     string
  hint?:     string
  children:  React.ReactNode
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="form-label">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-2xs text-brown-400 dark:text-cream-600 font-ui">{hint}</p>
      )}
    </div>
  )
}

function Input({
  value, onChange, placeholder, type = 'text', disabled,
}: {
  value:        string
  onChange:     (v: string) => void
  placeholder?: string
  type?:        string
  disabled?:    boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="form-input dark:bg-walnut-800/60 dark:border-walnut-600/60
                 dark:text-cream-100 dark:placeholder-cream-600
                 disabled:opacity-50 disabled:cursor-not-allowed"
    />
  )
}

function Select({
  value, onChange, options, placeholder,
}: {
  value:       string
  onChange:    (v: string) => void
  options:     { value: string; label: string }[]
  placeholder?:string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="form-input dark:bg-walnut-800/60 dark:border-walnut-600/60
                 dark:text-cream-100 appearance-none"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

// ─── TOGGLE SWITCH ────────────────────────────────────────────────────────────

function Toggle({
  checked, onChange, label, description,
}: {
  checked:     boolean
  onChange:    (v: boolean) => void
  label:       string
  description?:string
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b
                    border-sand-100/80 dark:border-walnut-700/30 last:border-0">
      <div>
        <p className="text-sm font-ui font-medium text-walnut-700 dark:text-cream-200">
          {label}
        </p>
        {description && (
          <p className="text-xs text-brown-400 dark:text-cream-500 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0
          ${checked ? 'bg-gold-500' : 'bg-sand-300 dark:bg-walnut-600'}
        `}
        role="switch"
        aria-checked={checked}
      >
        <span className={`
          absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm
          transition-transform duration-300
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `} />
      </button>
    </div>
  )
}

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, updateProfile } = useAuth()
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  const [form, setForm] = useState<ProfileFormData>({
    displayName:      user?.displayName      || '',
    username:         user?.username         || '',
    bio:              user?.bio              || '',
    phone:            user?.phone            || '',
    city:             user?.city             || '',
    state:            user?.state            || '',
    primaryScale:     user?.primaryScale     || '',
    genres:           user?.genres           || [],
    instruments:      user?.instruments      || [],
    instagramHandle:  user?.instagramHandle  || '',
    youtubeChannelUrl:user?.youtubeChannelUrl|| '',
  })

  const set = (key: keyof ProfileFormData, val: string) =>
    setForm(p => ({ ...p, [key]: val }))

  const toggleArray = (key: 'genres' | 'instruments', val: string) => {
    setForm(p => {
      const arr = p[key] || []
      return {
        ...p,
        [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val],
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Avatar */}
      <Section title="Profile Photo" description="Your public profile picture">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-gold-300/40">
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt={user.displayName}
                     className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-gold flex items-center
                                justify-center">
                  <span className="text-cream-50 font-display font-bold text-3xl">
                    {user?.displayName?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            <button className="absolute inset-0 flex items-center justify-center
                               bg-walnut-900/50 rounded-2xl opacity-0
                               group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-cream-50" />
            </button>
          </div>
          <div>
            <p className="text-sm font-ui font-medium text-walnut-700
                          dark:text-cream-200 mb-1">
              {user?.displayName}
            </p>
            <button className="text-xs font-ui text-primary hover:text-primary-hover
                               transition-colors">
              Change photo →
            </button>
          </div>
        </div>
      </Section>

      {/* Basic info */}
      <Section title="Basic Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Name" required>
            <Input value={form.displayName}
                   onChange={v => set('displayName', v)}
                   placeholder="Your name" />
          </FormField>

          <FormField label="Username" required
                     hint="Lowercase letters, numbers, underscore only">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2
                               text-brown-400 dark:text-cream-500 text-sm">@</span>
              <input
                value={form.username}
                onChange={e => set('username', e.target.value.toLowerCase())}
                className="form-input w-full pl-8 dark:bg-walnut-800/60
                           dark:border-walnut-600/60 dark:text-cream-100"
              />
            </div>
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Bio" hint="Tell the community about yourself">
              <textarea
                value={form.bio || ''}
                onChange={e => set('bio', e.target.value)}
                placeholder="I'm a Bollywood cover singer from Mumbai..."
                rows={3}
                className="form-input resize-none dark:bg-walnut-800/60
                           dark:border-walnut-600/60 dark:text-cream-100"
              />
            </FormField>
          </div>

          <FormField label="Phone">
            <Input value={form.phone || ''}
                   onChange={v => set('phone', v)}
                   placeholder="+91 98765 43210" />
          </FormField>

          <FormField label="City">
            <Input value={form.city || ''}
                   onChange={v => set('city', v)}
                   placeholder="Mumbai" />
          </FormField>

          <FormField label="State">
            <Input value={form.state || ''}
                   onChange={v => set('state', v)}
                   placeholder="Maharashtra" />
          </FormField>

          <FormField label="Primary Scale (Shruti)">
            <Select
              value={form.primaryScale || ''}
              onChange={v => set('primaryScale', v)}
              options={MUSICAL_SCALES}
              placeholder="Select your natural scale"
            />
          </FormField>
        </div>
      </Section>

      {/* Music profile */}
      <Section title="Music Profile"
               description="Help us personalize your AI suggestions">
        <div className="flex flex-col gap-4">
          <FormField label="Instruments">
            <div className="flex flex-wrap gap-2">
              {INSTRUMENTS.slice(0, 8).map(inst => (
                <button
                  key={inst.value}
                  onClick={() => toggleArray('instruments', inst.value)}
                  className={`
                    px-3 py-1.5 rounded-xl text-xs font-ui font-medium
                    border transition-all duration-200
                    ${(form.instruments || []).includes(inst.value)
                      ? 'bg-gold-100 dark:bg-gold-900/20 text-gold-dark border-gold-300/60'
                      : 'border-sand-200 dark:border-walnut-600/50 text-brown-400 dark:text-cream-500 hover:border-gold-300/50'
                    }
                  `}
                >
                  {inst.label}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Music Genres">
            <div className="flex flex-wrap gap-2">
              {MUSIC_GENRES.slice(0, 8).map(genre => (
                <button
                  key={genre.value}
                  onClick={() => toggleArray('genres', genre.value)}
                  className={`
                    px-3 py-1.5 rounded-xl text-xs font-ui font-medium
                    border transition-all duration-200
                    ${(form.genres || []).includes(genre.value)
                      ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-300/60'
                      : 'border-sand-200 dark:border-walnut-600/50 text-brown-400 dark:text-cream-500 hover:border-purple-300/50'
                    }
                  `}
                >
                  {genre.label}
                </button>
              ))}
            </div>
          </FormField>
        </div>
      </Section>

      {/* Social handles */}
      <Section title="Social Handles"
               description="Link your social profiles for analytics">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Instagram Handle">
            <div className="relative">
              <Instagram size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                             text-pink-500" />
              <input
                value={form.instagramHandle || ''}
                onChange={e => set('instagramHandle', e.target.value)}
                placeholder="yourusername"
                className="form-input w-full pl-9 dark:bg-walnut-800/60
                           dark:border-walnut-600/60 dark:text-cream-100"
              />
            </div>
          </FormField>

          <FormField label="YouTube Channel">
            <div className="relative">
              <Youtube size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                            text-red-500" />
              <input
                value={form.youtubeChannelUrl || ''}
                onChange={e => set('youtubeChannelUrl', e.target.value)}
                placeholder="youtube.com/@yourchannel"
                className="form-input w-full pl-9 dark:bg-walnut-800/60
                           dark:border-walnut-600/60 dark:text-cream-100"
              />
            </div>
          </FormField>
        </div>
      </Section>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-8 py-3 flex items-center gap-2
                     disabled:opacity-70"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-cream-200/50
                            border-t-cream-50 rounded-full animate-spin" />
          ) : saved ? (
            <Check size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// ─── BILLING TAB ─────────────────────────────────────────────────────────────

function BillingTab() {
  const { user } = useAuth()
  const currentPlan = user?.plan || SubscriptionPlan.FREE

  return (
    <div className="flex flex-col gap-5">

      {/* Current plan */}
      <Section title="Current Plan">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center
                            justify-center shadow-gold">
              <Crown size={18} className="text-cream-50" />
            </div>
            <div>
              <p className="font-ui font-semibold text-walnut-800 dark:text-cream-100
                            capitalize">
                {currentPlan} Plan
              </p>
              <p className="text-xs text-brown-400 dark:text-cream-500">
                {currentPlan === SubscriptionPlan.FREE
                  ? 'Free forever'
                  : 'Renews on Feb 1, 2025'
                }
              </p>
            </div>
          </div>
          {currentPlan !== SubscriptionPlan.PREMIUM && (
            <span className="premium-badge">Upgrade Available</span>
          )}
        </div>

        {/* Usage bars */}
        {[
          { label: 'Songs',         used: 24,  limit: 25,  unit: 'songs' },
          { label: 'AI Messages',   used: 3,   limit: 5,   unit: 'today' },
          { label: 'Posters',       used: 2,   limit: 3,   unit: 'this month' },
        ].map(item => (
          <div key={item.label} className="mb-3">
            <div className="flex justify-between text-xs font-ui mb-1.5">
              <span className="text-brown-500 dark:text-cream-400">{item.label}</span>
              <span className="text-walnut-700 dark:text-cream-200 font-medium">
                {item.used}/{item.limit} {item.unit}
              </span>
            </div>
            <div className="h-2 bg-sand-200 dark:bg-walnut-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700
                            ${(item.used / item.limit) >= 0.9
                              ? 'bg-gradient-to-r from-red-400 to-red-500'
                              : 'bg-gradient-to-r from-gold-400 to-gold-600'
                            }`}
                style={{ width: `${(item.used / item.limit) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </Section>

      {/* Plan cards */}
      <Section title="Upgrade Plan"
               description="Unlock more features with a higher plan">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {PRICING_PLANS.map(plan => (
            <div
              key={plan.id}
              className={`
                relative rounded-2xl p-4 border transition-all duration-300
                ${plan.id === currentPlan
                  ? 'border-gold-400/60 bg-gold-50/50 dark:bg-gold-900/10'
                  : 'border-sand-200/60 dark:border-walnut-600/40 hover:border-gold-300/50'
                }
                ${plan.popular ? 'ring-2 ring-gold-400/40' : ''}
              `}
            >
              {plan.id === currentPlan && (
                <div className="absolute -top-2.5 left-3">
                  <span className="text-2xs font-ui font-bold uppercase tracking-wide
                                   px-2.5 py-0.5 rounded-full bg-gold-500 text-cream-50">
                    Current
                  </span>
                </div>
              )}

              <h4 className="font-display font-bold text-sm text-walnut-800
                             dark:text-cream-100 mb-1">
                {plan.name}
              </h4>
              <p className="text-xl font-display font-bold text-walnut-800
                            dark:text-cream-100 mb-3">
                {plan.currency}{plan.price}
                {plan.price > 0 && (
                  <span className="text-xs font-ui font-normal text-brown-400">/mo</span>
                )}
              </p>

              <ul className="space-y-1.5 mb-4">
                {plan.features.slice(0, 4).map(f => (
                  <li key={f} className="text-2xs font-ui flex items-start gap-1.5
                                        text-brown-400 dark:text-cream-500">
                    <Check size={10} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`
                  w-full py-2 rounded-xl text-xs font-ui font-semibold
                  transition-all duration-200
                  ${plan.id === currentPlan
                    ? 'bg-sand-200 dark:bg-walnut-700/60 text-brown-500 dark:text-cream-500 cursor-default'
                    : plan.id === SubscriptionPlan.PREMIUM || plan.popular
                    ? 'btn-primary'
                    : 'btn-ghost'
                  }
                `}
                disabled={plan.id === currentPlan}
              >
                {plan.id === currentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Payment history */}
      <Section title="Payment History">
        <div className="flex flex-col gap-2">
          {[
            { date: 'Jan 1, 2025',  plan: 'Pro',   amount: '₹599', status: 'Paid' },
            { date: 'Dec 1, 2024',  plan: 'Pro',   amount: '₹599', status: 'Paid' },
            { date: 'Nov 1, 2024',  plan: 'Basic', amount: '₹299', status: 'Paid' },
          ].map((tx, i) => (
            <div key={i}
                 className="flex items-center justify-between py-3 border-b
                            border-sand-100/80 dark:border-walnut-700/30 last:border-0">
              <div>
                <p className="text-sm font-ui font-medium text-walnut-700
                              dark:text-cream-200">
                  {plan.name} Plan
                </p>
                <p className="text-xs text-brown-400 dark:text-cream-500">{tx.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-ui font-semibold text-walnut-700
                              dark:text-cream-200">
                  {tx.amount}
                </p>
                <span className="text-2xs font-ui text-green-600 dark:text-green-400">
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}

// ─── NOTIFICATIONS TAB ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [settings, setSettings] = useState({
    push:             true,
    email:            true,
    practiceReminder: true,
    milestones:       true,
    community:        false,
    aiInsights:       true,
    weeklyReport:     true,
    newFollower:      false,
  })

  const toggle = (key: keyof typeof settings) =>
    setSettings(p => ({ ...p, [key]: !p[key] }))

  const handleSave = () => toast.success('Notification settings saved!')

  return (
    <div className="flex flex-col gap-5">
      <Section title="Push Notifications"
               description="Manage notifications sent to your device">
        <Toggle checked={settings.push}             onChange={() => toggle('push')}
                label="Enable Push Notifications"
                description="Receive real-time alerts on your device" />
        <Toggle checked={settings.practiceReminder} onChange={() => toggle('practiceReminder')}
                label="Practice Reminders"
                description="Daily reminders to keep your streak alive" />
        <Toggle checked={settings.milestones}       onChange={() => toggle('milestones')}
                label="Milestone Celebrations"
                description="Get notified when you unlock achievements" />
        <Toggle checked={settings.aiInsights}       onChange={() => toggle('aiInsights')}
                label="AI Insights"
                description="Weekly AI-generated tips for your growth" />
        <Toggle checked={settings.newFollower}      onChange={() => toggle('newFollower')}
                label="New Followers"
                description="Notify when someone follows you" />
      </Section>

      <Section title="Email Notifications">
        <Toggle checked={settings.email}       onChange={() => toggle('email')}
                label="Enable Email Notifications"
                description="Receive updates in your inbox" />
        <Toggle checked={settings.weeklyReport} onChange={() => toggle('weeklyReport')}
                label="Weekly Report"
                description="A summary of your progress every Sunday" />
        <Toggle checked={settings.community}   onChange={() => toggle('community')}
                label="Community Updates"
                description="New posts, collabs, and community activity" />
      </Section>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary px-8 py-3 flex items-center gap-2">
          <Save size={16} /> Save Settings
        </button>
      </div>
    </div>
  )
}

// ─── PRIVACY TAB ─────────────────────────────────────────────────────────────

function PrivacyTab() {
  const [settings, setSettings] = useState({
    profilePublic:    true,
    songsPublic:      false,
    analyticsPublic:  false,
    showOnLeaderboard:true,
  })

  const toggle = (key: keyof typeof settings) =>
    setSettings(p => ({ ...p, [key]: !p[key] }))

  return (
    <div className="flex flex-col gap-5">
      <Section title="Profile Visibility"
               description="Control who can see your information">
        <Toggle checked={settings.profilePublic}    onChange={() => toggle('profilePublic')}
                label="Public Profile"
                description="Anyone can view your profile page" />
        <Toggle checked={settings.songsPublic}      onChange={() => toggle('songsPublic')}
                label="Public Song Library"
                description="Other creators can browse your song list" />
        <Toggle checked={settings.analyticsPublic}  onChange={() => toggle('analyticsPublic')}
                label="Public Analytics"
                description="Share your growth stats with the community" />
        <Toggle checked={settings.showOnLeaderboard}onChange={() => toggle('showOnLeaderboard')}
                label="Show on Leaderboard"
                description="Appear in community leaderboards" />
      </Section>

      <Section title="Data Management">
        <div className="flex flex-col gap-3">
          <button className="flex items-center justify-between w-full py-3 px-4
                             rounded-xl hover:bg-sand-50 dark:hover:bg-walnut-800/40
                             transition-colors group">
            <div className="flex items-center gap-3">
              <Download size={16} className="text-blue-500" />
              <div className="text-left">
                <p className="text-sm font-ui font-medium text-walnut-700
                              dark:text-cream-200">
                  Export My Data
                </p>
                <p className="text-xs text-brown-400 dark:text-cream-500">
                  Download all your songs, analytics & settings
                </p>
              </div>
            </div>
            <ChevronRight size={15} className="text-brown-300 dark:text-cream-600" />
          </button>

          <button className="flex items-center justify-between w-full py-3 px-4
                             rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10
                             transition-colors group border border-transparent
                             hover:border-red-200/60 dark:hover:border-red-800/30">
            <div className="flex items-center gap-3">
              <Trash2 size={16} className="text-error" />
              <div className="text-left">
                <p className="text-sm font-ui font-medium text-error">
                  Delete Account
                </p>
                <p className="text-xs text-brown-400 dark:text-cream-500">
                  Permanently delete all your data
                </p>
              </div>
            </div>
            <ChevronRight size={15} className="text-brown-300 dark:text-cream-600" />
          </button>
        </div>
      </Section>
    </div>
  )
}

// ─── SECURITY TAB ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [showCurrent,  setShowCurrent]  = useState(false)
  const [showNew,      setShowNew]      = useState(false)
  const [currentPw,   setCurrentPw]   = useState('')
  const [newPw,        setNewPw]        = useState('')
  const [confirmPw,    setConfirmPw]    = useState('')
  const [saving,       setSaving]       = useState(false)

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) {
      toast.error('New passwords do not match')
      return
    }
    if (newPw.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    toast.success('Password updated successfully!')
  }

  return (
    <div className="flex flex-col gap-5">
      <Section title="Change Password"
               description="Update your account password">
        <div className="flex flex-col gap-4 max-w-md">
          {[
            { label: 'Current Password', value: currentPw, onChange: setCurrentPw, show: showCurrent, toggleShow: () => setShowCurrent(v => !v) },
            { label: 'New Password',     value: newPw,     onChange: setNewPw,     show: showNew,     toggleShow: () => setShowNew(v => !v) },
            { label: 'Confirm New',      value: confirmPw, onChange: setConfirmPw, show: showNew,     toggleShow: () => setShowNew(v => !v) },
          ].map(field => (
            <div key={field.label} className="relative">
              <label className="form-label">{field.label}</label>
              <input
                type={field.show ? 'text' : 'password'}
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                placeholder="••••••••"
                className="form-input w-full pr-10 dark:bg-walnut-800/60
                           dark:border-walnut-600/60 dark:text-cream-100"
              />
              <button
                type="button"
                onClick={field.toggleShow}
                className="absolute right-3 top-8 text-brown-400 hover:text-walnut-600
                           dark:hover:text-cream-300 transition-colors"
              >
                {field.show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          ))}

          <button
            onClick={handleChangePassword}
            disabled={saving || !currentPw || !newPw || !confirmPw}
            className="btn-primary py-3 flex items-center justify-center gap-2
                       disabled:opacity-60 w-fit px-8"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-cream-200/50
                              border-t-cream-50 rounded-full animate-spin" />
            ) : <Lock size={15} />}
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </Section>

      <Section title="Active Sessions"
               description="Manage where you're logged in">
        <div className="flex flex-col gap-2">
          {[
            { device: 'Chrome on MacBook Pro', location: 'Mumbai, India', current: true,  time: 'Now' },
            { device: 'Safari on iPhone 15',   location: 'Mumbai, India', current: false, time: '2h ago' },
            { device: 'Chrome on Windows PC',  location: 'Pune, India',   current: false, time: '3d ago' },
          ].map((session, i) => (
            <div key={i}
                 className="flex items-center justify-between py-3 border-b
                            border-sand-100/80 dark:border-walnut-700/30 last:border-0">
              <div>
                <p className="text-sm font-ui font-medium text-walnut-700
                              dark:text-cream-200 flex items-center gap-2">
                  {session.device}
                  {session.current && (
                    <span className="text-2xs font-ui text-green-600 bg-green-100
                                     dark:bg-green-900/20 dark:text-green-400 px-1.5
                                     py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </p>
                <p className="text-xs text-brown-400 dark:text-cream-500">
                  {session.location} · {session.time}
                </p>
              </div>
              {!session.current && (
                <button className="text-xs font-ui text-error hover:text-red-700
                                   transition-colors">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
        <button className="mt-3 text-xs font-ui text-error hover:text-red-700
                           transition-colors flex items-center gap-1.5">
          <LogOut size={13} />
          Sign out of all other sessions
        </button>
      </Section>

      <Section title="Danger Zone">
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50/60
                        dark:bg-red-900/10 border border-red-200/60
                        dark:border-red-800/30">
          <AlertTriangle size={18} className="text-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-ui font-semibold text-error mb-1">
              Delete Account
            </p>
            <p className="text-xs text-brown-400 dark:text-cream-500 mb-3">
              This will permanently delete your account, all songs, analytics,
              and data. This action cannot be undone.
            </p>
            <button className="text-xs font-ui font-semibold text-error
                               border border-error/40 px-4 py-2 rounded-xl
                               hover:bg-red-100 dark:hover:bg-red-900/20
                               transition-colors">
              Delete My Account
            </button>
          </div>
        </div>
      </Section>
    </div>
  )
}

// ─── DISPLAY TAB (Appearance) ─────────────────────────────────────────────────

function DisplaySection() {
  const [lang, setLang] = useState('en')

  return (
    <div className="flex flex-col gap-5">
      <Section title="Theme"
               description="Choose your preferred appearance">
        <div className="flex items-center gap-4">
          <ThemeSelector />
          <p className="text-xs text-brown-400 dark:text-cream-500 font-ui">
            System follows your OS preference
          </p>
        </div>
      </Section>

      <Section title="Language">
        <div className="max-w-xs">
          <Select
            value={lang}
            onChange={setLang}
            options={[
              { value: 'en', label: '🌐 English' },
              { value: 'hi', label: '🇮🇳 हिंदी (Hindi)' },
              { value: 'mr', label: 'मराठी (Marathi)' },
            ]}
          />
        </div>
      </Section>
    </div>
  )
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const params = useSearchParams()
  const initialTab = (params.get('tab') as TabId) || 'profile'
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)

  useEffect(() => {
    const tab = params.get('tab') as TabId
    if (tab) setActiveTab(tab)
  }, [params])

  const tabContent: Record<TabId, React.ReactNode> = {
    profile:       <ProfileTab />,
    billing:       <BillingTab />,
    notifications: <NotificationsTab />,
    privacy:       <PrivacyTab />,
    security:      <SecurityTab />,
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-walnut-900
                         dark:text-cream-100">
            Settings ⚙️
          </h1>
          <p className="text-sm text-brown-400 dark:text-cream-400 font-ui mt-0.5">
            Manage your account, preferences, and billing
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">

          {/* Sidebar tabs */}
          <div className="lg:w-52 flex-shrink-0">
            <div className="card-premium p-2 flex flex-row lg:flex-col gap-1
                            overflow-x-auto lg:overflow-x-visible scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                    text-sm font-ui font-medium transition-all duration-200
                    whitespace-nowrap flex-shrink-0 lg:flex-shrink lg:w-full
                    ${activeTab === tab.id
                      ? 'bg-gold-100 dark:bg-gold-900/20 text-gold-dark dark:text-gold-400'
                      : 'text-brown-400 dark:text-cream-500 hover:bg-sand-50 dark:hover:bg-walnut-800/40'
                    }
                  `}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 min-w-0 animate-fade-up">
            {tabContent[activeTab]}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
