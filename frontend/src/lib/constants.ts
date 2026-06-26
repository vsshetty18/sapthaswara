/* ============================================================
   SVARAVERSE AI — Application Constants
   ============================================================ */

import {
  MilestoneType,
  SongLanguage,
  SongMood,
  SongDifficulty,
  SongStatus,
  PlannerTaskType,
  ReminderType,
  UserRole,
  SubscriptionPlan,
  PosterType,
  type MilestoneDefinition,
  type SelectOption,
  type NavItem,
} from '@/types'

// ─── APP META ───────────────────────────────────────────────────────────────

export const APP_NAME        = 'SvaraVerse AI'
export const APP_TAGLINE     = 'Your AI-Powered Indian Music Creator Platform'
export const APP_DESCRIPTION = 'The complete operating system for singers, playback aspirants, music creators, YouTubers and Instagram creators.'
export const APP_VERSION     = '1.0.0'
export const APP_URL         = process.env.NEXT_PUBLIC_APP_URL || 'https://svaraverse.ai'
export const SUPPORT_EMAIL   = 'support@svaraverse.ai'
export const CONTACT_EMAIL   = 'hello@svaraverse.ai'

// ─── API ENDPOINTS ──────────────────────────────────────────────────────────

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN:           `${API_BASE_URL}/auth/login`,
    SIGNUP:          `${API_BASE_URL}/auth/signup`,
    LOGOUT:          `${API_BASE_URL}/auth/logout`,
    REFRESH:         `${API_BASE_URL}/auth/refresh`,
    ME:              `${API_BASE_URL}/auth/me`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD:  `${API_BASE_URL}/auth/reset-password`,
    VERIFY_EMAIL:    `${API_BASE_URL}/auth/verify-email`,
    GOOGLE:          `${API_BASE_URL}/auth/google`,
  },

  // Users
  USERS: {
    PROFILE:         `${API_BASE_URL}/users/profile`,
    UPDATE:          `${API_BASE_URL}/users/update`,
    UPLOAD_AVATAR:   `${API_BASE_URL}/users/avatar`,
    SETTINGS:        `${API_BASE_URL}/users/settings`,
    DELETE:          `${API_BASE_URL}/users/delete`,
    EXPORT:          `${API_BASE_URL}/users/export`,
    FOLLOW:          (id: string) => `${API_BASE_URL}/users/${id}/follow`,
    UNFOLLOW:        (id: string) => `${API_BASE_URL}/users/${id}/unfollow`,
    BY_USERNAME:     (username: string) => `${API_BASE_URL}/users/${username}`,
  },

  // Songs
  SONGS: {
    LIST:            `${API_BASE_URL}/songs`,
    CREATE:          `${API_BASE_URL}/songs`,
    GET:             (id: string) => `${API_BASE_URL}/songs/${id}`,
    UPDATE:          (id: string) => `${API_BASE_URL}/songs/${id}`,
    DELETE:          (id: string) => `${API_BASE_URL}/songs/${id}`,
    UPLOAD_AUDIO:    (id: string) => `${API_BASE_URL}/songs/${id}/audio`,
    UPLOAD_COVER:    (id: string) => `${API_BASE_URL}/songs/${id}/cover`,
    TOGGLE_FAVOURITE:(id: string) => `${API_BASE_URL}/songs/${id}/favourite`,
    LOG_PRACTICE:    (id: string) => `${API_BASE_URL}/songs/${id}/practice`,
  },

  // Playlists
  PLAYLISTS: {
    LIST:            `${API_BASE_URL}/playlists`,
    CREATE:          `${API_BASE_URL}/playlists`,
    GET:             (id: string) => `${API_BASE_URL}/playlists/${id}`,
    UPDATE:          (id: string) => `${API_BASE_URL}/playlists/${id}`,
    DELETE:          (id: string) => `${API_BASE_URL}/playlists/${id}`,
    ADD_SONG:        (id: string) => `${API_BASE_URL}/playlists/${id}/songs`,
    REMOVE_SONG:     (id: string, songId: string) => `${API_BASE_URL}/playlists/${id}/songs/${songId}`,
  },

  // Analytics
  ANALYTICS: {
    SUMMARY:         `${API_BASE_URL}/analytics/summary`,
    DAILY:           `${API_BASE_URL}/analytics/daily`,
    HEATMAP:         `${API_BASE_URL}/analytics/heatmap`,
    GROWTH:          `${API_BASE_URL}/analytics/growth`,
    REPORT:          `${API_BASE_URL}/analytics/report`,
    PERFORMANCE:     `${API_BASE_URL}/analytics/performance`,
  },

  // Integrations
  INTEGRATIONS: {
    INSTAGRAM:       `${API_BASE_URL}/integrations/instagram`,
    YOUTUBE:         `${API_BASE_URL}/integrations/youtube`,
  },

  // AI
  AI: {
    CHAT:            `${API_BASE_URL}/ai/chat`,
    SUGGESTIONS:     `${API_BASE_URL}/ai/suggestions`,
    INSIGHTS:        `${API_BASE_URL}/ai/insights`,
    POSTER:          `${API_BASE_URL}/ai/poster`,
    SONG_RECOMMEND:  `${API_BASE_URL}/ai/recommend-song`,
    HASHTAGS:        `${API_BASE_URL}/ai/hashtags`,
    CAPTION:         `${API_BASE_URL}/ai/caption`,
  },

  // Planner
  PLANNER: {
    TODAY:           `${API_BASE_URL}/planner/today`,
    DATE:            (date: string) => `${API_BASE_URL}/planner/${date}`,
    CREATE_TASK:     `${API_BASE_URL}/planner/tasks`,
    UPDATE_TASK:     (id: string) => `${API_BASE_URL}/planner/tasks/${id}`,
    DELETE_TASK:     (id: string) => `${API_BASE_URL}/planner/tasks/${id}`,
    COMPLETE_TASK:   (id: string) => `${API_BASE_URL}/planner/tasks/${id}/complete`,
  },

  // Reminders
  REMINDERS: {
    LIST:            `${API_BASE_URL}/reminders`,
    CREATE:          `${API_BASE_URL}/reminders`,
    UPDATE:          (id: string) => `${API_BASE_URL}/reminders/${id}`,
    DELETE:          (id: string) => `${API_BASE_URL}/reminders/${id}`,
    TOGGLE:          (id: string) => `${API_BASE_URL}/reminders/${id}/toggle`,
  },

  // Milestones
  MILESTONES: {
    LIST:            `${API_BASE_URL}/milestones`,
    MARK_SEEN:       (id: string) => `${API_BASE_URL}/milestones/${id}/seen`,
  },

  // Community
  COMMUNITY: {
    FEED:            `${API_BASE_URL}/community/feed`,
    MEMBERS:         `${API_BASE_URL}/community/members`,
    POSTS:           `${API_BASE_URL}/community/posts`,
    CREATE_POST:     `${API_BASE_URL}/community/posts`,
    GET_POST:        (id: string) => `${API_BASE_URL}/community/posts/${id}`,
    DELETE_POST:     (id: string) => `${API_BASE_URL}/community/posts/${id}`,
    LIKE_POST:       (id: string) => `${API_BASE_URL}/community/posts/${id}/like`,
    COMMENTS:        (id: string) => `${API_BASE_URL}/community/posts/${id}/comments`,
    ADD_COMMENT:     (id: string) => `${API_BASE_URL}/community/posts/${id}/comments`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST:            `${API_BASE_URL}/notifications`,
    MARK_READ:       (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ:   `${API_BASE_URL}/notifications/read-all`,
    DELETE:          (id: string) => `${API_BASE_URL}/notifications/${id}`,
  },

  // Payments
  PAYMENTS: {
    CREATE_ORDER:    `${API_BASE_URL}/payments/create-order`,
    VERIFY:          `${API_BASE_URL}/payments/verify`,
    HISTORY:         `${API_BASE_URL}/payments/history`,
    SUBSCRIPTION:    `${API_BASE_URL}/payments/subscription`,
    CANCEL:          `${API_BASE_URL}/payments/cancel`,
  },

  // Owner
  OWNER: {
    STATS:           `${API_BASE_URL}/owner/stats`,
    USERS:           `${API_BASE_URL}/owner/users`,
    REVENUE:         `${API_BASE_URL}/owner/revenue`,
    SYSTEM:          `${API_BASE_URL}/owner/system`,
    ANNOUNCEMENTS:   `${API_BASE_URL}/owner/announcements`,
  },
} as const

// ─── NAVIGATION ─────────────────────────────────────────────────────────────

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href:  '/dashboard',
    icon:  'LayoutDashboard',
  },
  {
    label: 'Song Library',
    href:  '/dashboard/songs',
    icon:  'Music',
  },
  {
    label: 'AI Coach',
    href:  '/dashboard/ai-coach',
    icon:  'Bot',
  },
  {
    label: 'Daily Planner',
    href:  '/dashboard/planner',
    icon:  'CalendarCheck',
  },
  {
    label: 'Analytics',
    href:  '/dashboard/analytics',
    icon:  'BarChart3',
  },
  {
    label: 'Poster Generator',
    href:  '/dashboard/posters',
    icon:  'ImageIcon',
  },
  {
    label: 'Integrations',
    href:  '/dashboard/integrations',
    icon:  'Plug',
  },
  {
    label: 'Reminders',
    href:  '/dashboard/reminders',
    icon:  'Bell',
  },
  {
    label: 'Milestones',
    href:  '/dashboard/milestones',
    icon:  'Trophy',
  },
  {
    label: 'Community',
    href:  '/dashboard/community',
    icon:  'Users',
  },
  {
    label: 'Settings',
    href:  '/dashboard/settings',
    icon:  'Settings',
  },
]

export const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: 'Overview',
    href:  '/admin',
    icon:  'LayoutDashboard',
    roles: [UserRole.ADMIN, UserRole.OWNER],
  },
  {
    label: 'Users',
    href:  '/admin/users',
    icon:  'Users',
    roles: [UserRole.ADMIN, UserRole.OWNER],
  },
  {
    label: 'Content',
    href:  '/admin/content',
    icon:  'FileText',
    roles: [UserRole.ADMIN, UserRole.OWNER],
  },
  {
    label: 'Payments',
    href:  '/admin/payments',
    icon:  'CreditCard',
    roles: [UserRole.ADMIN, UserRole.OWNER],
  },
  {
    label: 'Support',
    href:  '/admin/support',
    icon:  'HeadphonesIcon',
    roles: [UserRole.ADMIN, UserRole.OWNER],
  },
  {
    label: 'Owner Panel',
    href:  '/owner',
    icon:  'ShieldCheck',
    roles: [UserRole.OWNER],
  },
]

// ─── PRICING PLANS ──────────────────────────────────────────────────────────

export const PRICING_PLANS = [
  {
    id:          SubscriptionPlan.FREE,
    name:        'Starter',
    nameHindi:   'शुरुआत',
    price:       0,
    priceYearly: 0,
    currency:    '₹',
    description: 'Perfect for beginners exploring their musical journey',
    color:       'sand',
    popular:     false,
    features: [
      '25 songs in library',
      '5 AI coach messages/day',
      'Basic analytics',
      '3 poster generations/month',
      'Daily planner',
      'Community access',
      'YouTube & Instagram integration',
    ],
    limitations: [
      'No unlimited AI',
      'No advanced reports',
      'No priority support',
    ],
  },
  {
    id:          SubscriptionPlan.BASIC,
    name:        'Creator',
    nameHindi:   'निर्माता',
    price:       299,
    priceYearly: 2499,
    currency:    '₹',
    description: 'For dedicated creators building their audience',
    color:       'brown',
    popular:     false,
    features: [
      '100 songs in library',
      '25 AI coach messages/day',
      'Advanced analytics',
      '15 poster generations/month',
      'Weekly reports',
      'Reminder notifications',
      'Priority community badge',
      'Export data',
    ],
    limitations: [
      'No unlimited songs',
      'No monthly/yearly reports',
    ],
  },
  {
    id:          SubscriptionPlan.PRO,
    name:        'Pro',
    nameHindi:   'प्रो',
    price:       599,
    priceYearly: 4999,
    currency:    '₹',
    description: 'For serious artists committed to growth',
    color:       'gold',
    popular:     true,
    badge:       'Most Popular',
    features: [
      'Unlimited songs',
      '100 AI coach messages/day',
      'Full analytics suite',
      '50 poster generations/month',
      'Weekly + monthly reports',
      'All reminder types',
      'Milestone celebrations',
      'Pro badge on profile',
      'Growth predictions',
      'Career suggestions',
    ],
    limitations: [],
  },
  {
    id:          SubscriptionPlan.PREMIUM,
    name:        'Premium',
    nameHindi:   'प्रीमियम',
    price:       999,
    priceYearly: 7999,
    currency:    '₹',
    description: 'The complete creator OS for professional artists',
    color:       'walnut',
    popular:     false,
    badge:       'All Inclusive',
    features: [
      'Everything in Pro',
      'Unlimited AI coach',
      'Unlimited poster generation',
      'Yearly reports & insights',
      'Priority support (24hr)',
      'Custom AI persona',
      'Collaboration matching',
      'Revenue tracking',
      'Advanced audience insights',
      'Early access to features',
      'Verified creator badge',
      'Direct consultation (1/month)',
    ],
    limitations: [],
  },
] as const

// ─── MILESTONE DEFINITIONS ──────────────────────────────────────────────────

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    type:        MilestoneType.FOLLOWERS_100,
    title:       '100 Followers!',
    description: 'Your first 100 followers — the community is growing!',
    icon:        '🎉',
    targetValue: 100,
    category:    'followers',
  },
  {
    type:        MilestoneType.FOLLOWERS_500,
    title:       '500 Followers!',
    description: 'Half a thousand people love your music!',
    icon:        '⭐',
    targetValue: 500,
    category:    'followers',
  },
  {
    type:        MilestoneType.FOLLOWERS_1K,
    title:       '1K Followers!',
    description: 'You crossed 1,000 followers. You are a star!',
    icon:        '🌟',
    targetValue: 1000,
    category:    'followers',
  },
  {
    type:        MilestoneType.FOLLOWERS_10K,
    title:       '10K Followers!',
    description: 'Five digits! You are a bonafide creator now.',
    icon:        '👑',
    targetValue: 10000,
    category:    'followers',
  },
  {
    type:        MilestoneType.SONGS_10,
    title:       '10 Songs Learned!',
    description: 'A solid repertoire is taking shape.',
    icon:        '🎵',
    targetValue: 10,
    category:    'songs',
  },
  {
    type:        MilestoneType.SONGS_50,
    title:       '50 Songs Learned!',
    description: 'Half a century of songs — incredible dedication!',
    icon:        '🎶',
    targetValue: 50,
    category:    'songs',
  },
  {
    type:        MilestoneType.SONGS_100,
    title:       '100 Songs Learned!',
    description: 'A century of songs! You are a true musician.',
    icon:        '🏆',
    targetValue: 100,
    category:    'songs',
  },
  {
    type:        MilestoneType.STREAK_7,
    title:       '7-Day Streak!',
    description: 'A full week of consistent practice. Wah!',
    icon:        '🔥',
    targetValue: 7,
    category:    'streak',
  },
  {
    type:        MilestoneType.STREAK_30,
    title:       '30-Day Streak!',
    description: 'A whole month without breaking the chain!',
    icon:        '💫',
    targetValue: 30,
    category:    'streak',
  },
  {
    type:        MilestoneType.STREAK_100,
    title:       '100-Day Streak!',
    description: 'Hundred days of dedication. Legendary!',
    icon:        '⚡',
    targetValue: 100,
    category:    'streak',
  },
  {
    type:        MilestoneType.STREAK_365,
    title:       '365-Day Streak!',
    description: 'A full year of practice. You are unstoppable!',
    icon:        '🌠',
    targetValue: 365,
    category:    'streak',
  },
  {
    type:        MilestoneType.VIDEOS_10,
    title:       '10 Videos Posted!',
    description: 'Double digits on your video uploads. Keep going!',
    icon:        '🎬',
    targetValue: 10,
    category:    'videos',
  },
  {
    type:        MilestoneType.VIDEOS_100,
    title:       '100 Videos Posted!',
    description: 'A century of uploads. You are a content machine!',
    icon:        '📽️',
    targetValue: 100,
    category:    'videos',
  },
  {
    type:        MilestoneType.FIRST_COLLAB,
    title:       'First Collaboration!',
    description: 'You collaborated with another creator. Beautiful!',
    icon:        '🤝',
    targetValue: 1,
    category:    'community',
  },
  {
    type:        MilestoneType.FIRST_LIVE,
    title:       'First Live Session!',
    description: 'You went live for the first time. Incredible!',
    icon:        '🎙️',
    targetValue: 1,
    category:    'community',
  },
  {
    type:        MilestoneType.FIRST_INCOME,
    title:       'First Income!',
    description: 'Music paid you back. This is just the beginning!',
    icon:        '💰',
    targetValue: 1,
    category:    'income',
  },
  {
    type:        MilestoneType.SUBSCRIBERS_100,
    title:       '100 YouTube Subscribers!',
    description: 'Your channel is growing. Keep uploading!',
    icon:        '▶️',
    targetValue: 100,
    category:    'followers',
  },
  {
    type:        MilestoneType.SUBSCRIBERS_1K,
    title:       '1K YouTube Subscribers!',
    description: 'You are eligible for the YouTube Partner Program!',
    icon:        '🥇',
    targetValue: 1000,
    category:    'followers',
  },
]

// ─── MUSICAL SCALES (SHRUTI) ────────────────────────────────────────────────

export const MUSICAL_SCALES: SelectOption[] = [
  { value: 'C',   label: 'C  (Sa)' },
  { value: 'C#',  label: 'C# / Db' },
  { value: 'D',   label: 'D' },
  { value: 'D#',  label: 'D# / Eb' },
  { value: 'E',   label: 'E' },
  { value: 'F',   label: 'F' },
  { value: 'F#',  label: 'F# / Gb' },
  { value: 'G',   label: 'G' },
  { value: 'G#',  label: 'G# / Ab' },
  { value: 'A',   label: 'A' },
  { value: 'A#',  label: 'A# / Bb' },
  { value: 'B',   label: 'B' },
]

export const INDIAN_RAGAS: SelectOption[] = [
  { value: 'bhairav',    label: 'Bhairav' },
  { value: 'yaman',      label: 'Yaman' },
  { value: 'bhupali',    label: 'Bhupali' },
  { value: 'durga',      label: 'Durga' },
  { value: 'kafi',       label: 'Kafi' },
  { value: 'khamaj',     label: 'Khamaj' },
  { value: 'bilawal',    label: 'Bilawal' },
  { value: 'kalyan',     label: 'Kalyan' },
  { value: 'bhairavi',   label: 'Bhairavi' },
  { value: 'desh',       label: 'Desh' },
  { value: 'malkauns',   label: 'Malkauns' },
  { value: 'charukeshi', label: 'Charukeshi' },
  { value: 'kedar',      label: 'Kedar' },
  { value: 'marwa',      label: 'Marwa' },
  { value: 'puriya',     label: 'Puriya' },
  { value: 'todi',       label: 'Todi' },
  { value: 'bageshri',   label: 'Bageshri' },
  { value: 'jaunpuri',   label: 'Jaunpuri' },
  { value: 'pahadi',     label: 'Pahadi' },
  { value: 'other',      label: 'Other' },
]

export const INSTRUMENTS: SelectOption[] = [
  { value: 'voice',     label: '🎤 Voice' },
  { value: 'harmonium', label: '🎹 Harmonium' },
  { value: 'tabla',     label: '🥁 Tabla' },
  { value: 'sitar',     label: '🎸 Sitar' },
  { value: 'veena',     label: '🎵 Veena' },
  { value: 'tanpura',   label: '🎶 Tanpura' },
  { value: 'flute',     label: '🎼 Flute / Bansuri' },
  { value: 'violin',    label: '🎻 Violin' },
  { value: 'sarangi',   label: '🎵 Sarangi' },
  { value: 'keyboard',  label: '🎹 Keyboard / Piano' },
  { value: 'guitar',    label: '🎸 Guitar' },
  { value: 'mridangam', label: '🥁 Mridangam' },
  { value: 'other',     label: '🎵 Other' },
]

export const MUSIC_GENRES: SelectOption[] = [
  { value: 'bollywood',     label: '🎬 Bollywood' },
  { value: 'classical',     label: '🎼 Classical (Hindustani)' },
  { value: 'carnatic',      label: '🎶 Carnatic' },
  { value: 'ghazal',        label: '🌹 Ghazal' },
  { value: 'bhajan',        label: '🙏 Bhajan / Devotional' },
  { value: 'folk',          label: '🌾 Folk' },
  { value: 'indie',         label: '🎵 Indie / Independent' },
  { value: 'playback',      label: '🎤 Playback' },
  { value: 'sufi',          label: '✨ Sufi' },
  { value: 'gazal',         label: '🌙 Gazal' },
  { value: 'pop',           label: '⭐ Pop' },
  { value: 'regional',      label: '🗺️ Regional' },
  { value: 'fusion',        label: '🎸 Fusion' },
  { value: 'other',         label: '🎵 Other' },
]

// ─── SELECT OPTIONS FROM ENUMS ───────────────────────────────────────────────

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: SongLanguage.HINDI,     label: '🇮🇳 Hindi' },
  { value: SongLanguage.ENGLISH,   label: '🌐 English' },
  { value: SongLanguage.MARATHI,   label: 'मराठी Marathi' },
  { value: SongLanguage.BENGALI,   label: 'বাংলা Bengali' },
  { value: SongLanguage.TAMIL,     label: 'தமிழ் Tamil' },
  { value: SongLanguage.TELUGU,    label: 'తెలుగు Telugu' },
  { value: SongLanguage.KANNADA,   label: 'ಕನ್ನಡ Kannada' },
  { value: SongLanguage.GUJARATI,  label: 'ગુજરાતી Gujarati' },
  { value: SongLanguage.PUNJABI,   label: 'ਪੰਜਾਬੀ Punjabi' },
  { value: SongLanguage.MALAYALAM, label: 'മലയാളം Malayalam' },
  { value: SongLanguage.BHOJPURI,  label: 'भोजपुरी Bhojpuri' },
  { value: SongLanguage.RAJASTHANI,label: 'राजस्थानी Rajasthani' },
  { value: SongLanguage.OTHER,     label: 'Other' },
]

export const MOOD_OPTIONS: SelectOption[] = [
  { value: SongMood.HAPPY,      label: '😊 Happy' },
  { value: SongMood.SAD,        label: '😢 Sad' },
  { value: SongMood.ROMANTIC,   label: '❤️ Romantic' },
  { value: SongMood.DEVOTIONAL, label: '🙏 Devotional' },
  { value: SongMood.ENERGETIC,  label: '⚡ Energetic' },
  { value: SongMood.CALM,       label: '🌿 Calm' },
  { value: SongMood.PATRIOTIC,  label: '🇮🇳 Patriotic' },
  { value: SongMood.CLASSICAL,  label: '🎼 Classical' },
  { value: SongMood.FOLK,       label: '🌾 Folk' },
  { value: SongMood.FESTIVE,    label: '🎉 Festive' },
]

export const DIFFICULTY_OPTIONS: SelectOption[] = [
  { value: SongDifficulty.BEGINNER,     label: '🌱 Beginner' },
  { value: SongDifficulty.INTERMEDIATE, label: '🌿 Intermediate' },
  { value: SongDifficulty.ADVANCED,     label: '🌳 Advanced' },
  { value: SongDifficulty.EXPERT,       label: '🏆 Expert' },
]

export const STATUS_OPTIONS: SelectOption[] = [
  { value: SongStatus.PRACTICED,        label: '✅ Practiced' },
  { value: SongStatus.RECORDED,         label: '🎙️ Recorded' },
  { value: SongStatus.POSTED,           label: '📤 Posted' },
  { value: SongStatus.NEED_IMPROVEMENT, label: '🔧 Needs Improvement' },
  { value: SongStatus.FAVOURITE,        label: '⭐ Favourite' },
  { value: SongStatus.IN_PROGRESS,      label: '🎵 In Progress' },
  { value: SongStatus.DRAFT,            label: '📝 Draft' },
]

export const TASK_TYPE_OPTIONS: SelectOption[] = [
  { value: PlannerTaskType.PRACTICE,   label: '🎵 Practice' },
  { value: PlannerTaskType.RECORDING,  label: '🎙️ Recording' },
  { value: PlannerTaskType.EDITING,    label: '✂️ Editing' },
  { value: PlannerTaskType.POSTING,    label: '📤 Posting' },
  { value: PlannerTaskType.NETWORKING, label: '🤝 Networking' },
  { value: PlannerTaskType.LEARNING,   label: '📚 Learning' },
  { value: PlannerTaskType.LISTENING,  label: '🎧 Listening' },
  { value: PlannerTaskType.WRITING,    label: '✍️ Writing' },
  { value: PlannerTaskType.REPLY,      label: '💬 Reply Comments' },
  { value: PlannerTaskType.OTHER,      label: '📋 Other' },
]

export const REMINDER_TYPE_OPTIONS: SelectOption[] = [
  { value: ReminderType.PRACTICE,      label: '🎵 Practice Reminder' },
  { value: ReminderType.LIVE_SESSION,  label: '🔴 Live Session' },
  { value: ReminderType.COLLABORATION, label: '🤝 Collaboration' },
  { value: ReminderType.COMPETITION,   label: '🏆 Competition' },
  { value: ReminderType.STUDIO,        label: '🎙️ Studio Booking' },
  { value: ReminderType.RECORDING,     label: '⏺️ Recording Session' },
  { value: ReminderType.BIRTHDAY,      label: '🎂 Birthday' },
  { value: ReminderType.FESTIVAL,      label: '🎉 Festival' },
  { value: ReminderType.CUSTOM,        label: '📌 Custom' },
]

export const POSTER_TYPE_OPTIONS: SelectOption[] = [
  { value: PosterType.INSTAGRAM_POST,  label: '📸 Instagram Post (1:1)' },
  { value: PosterType.INSTAGRAM_STORY, label: '📱 Instagram Story (9:16)' },
  { value: PosterType.YOUTUBE_THUMB,   label: '▶️ YouTube Thumbnail (16:9)' },
  { value: PosterType.ALBUM_COVER,     label: '💿 Album Cover (1:1)' },
  { value: PosterType.FESTIVAL_POSTER, label: '🎉 Festival Poster' },
  { value: PosterType.MINIMAL_POSTER,  label: '🖼️ Minimal Poster' },
  { value: PosterType.PREMIUM_POSTER,  label: '⭐ Premium Poster' },
  { value: PosterType.WALLPAPER,       label: '🖥️ Wallpaper' },
]

// ─── AI COACH QUICK PROMPTS ──────────────────────────────────────────────────

export const AI_QUICK_PROMPTS = [
  { label: 'What should I practice today?',     icon: '🎵' },
  { label: 'Which song should I upload today?', icon: '📤' },
  { label: 'Suggest trending hashtags for me',  icon: '#️⃣' },
  { label: 'Write a caption for my next reel',  icon: '✍️' },
  { label: 'What is the best time to post?',    icon: '⏰' },
  { label: 'Give me a thumbnail idea',          icon: '🖼️' },
  { label: 'Suggest collaboration ideas',       icon: '🤝' },
  { label: 'Review my growth this month',       icon: '📈' },
  { label: 'Motivate me!',                      icon: '💪' },
  { label: 'Give me Reel ideas for this week',  icon: '🎬' },
  { label: 'Predict my growth for next month',  icon: '🔮' },
  { label: 'What career path should I choose?', icon: '🚀' },
]

// ─── MOTIVATIONAL QUOTES ─────────────────────────────────────────────────────

export const MOTIVATIONAL_QUOTES = [
  { quote: 'Sangeet ek sadhana hai, ek din nahi.',            author: 'Anonymous' },
  { quote: 'Riyaz karo, naseeb khud chal ke aayega.',         author: 'Old Saying' },
  { quote: 'Music gives a soul to the universe.',             author: 'Plato' },
  { quote: 'Where words fail, music speaks.',                 author: 'Hans Christian Andersen' },
  { quote: 'Practice is the key, consistency is the door.',   author: 'SvaraVerse AI' },
  { quote: 'Sur mein jiyo, sur mein soch.',                   author: 'Anonymous' },
  { quote: 'Every master was once a beginner.',               author: 'Anonymous' },
  { quote: 'Your voice is your instrument. Polish it daily.', author: 'SvaraVerse AI' },
  { quote: 'Har ek sur ek kadam hai manzil ki taraf.',        author: 'Anonymous' },
  { quote: 'The more you sweat in practice, the less you bleed on stage.', author: 'Anonymous' },
]

// ─── DAYS OF WEEK ────────────────────────────────────────────────────────────

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday',    short: 'Sun' },
  { value: 1, label: 'Monday',    short: 'Mon' },
  { value: 2, label: 'Tuesday',   short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday',  short: 'Thu' },
  { value: 5, label: 'Friday',    short: 'Fri' },
  { value: 6, label: 'Saturday',  short: 'Sat' },
]

// ─── PERFORMANCE SCORE WEIGHTS ───────────────────────────────────────────────

export const PERFORMANCE_SCORE_WEIGHTS = {
  consistency:  0.35,  // Daily practice streak
  growth:       0.25,  // Follower / subscriber growth
  engagement:   0.20,  // Likes, comments, shares
  productivity: 0.20,  // Songs learned, videos posted
} as const

// ─── FILE UPLOAD LIMITS ──────────────────────────────────────────────────────

export const UPLOAD_LIMITS = {
  AUDIO_MAX_MB:   50,
  IMAGE_MAX_MB:   10,
  VIDEO_MAX_MB:   500,
  AVATAR_MAX_MB:  5,
  POSTER_MAX_MB:  10,

  ACCEPTED_AUDIO: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/flac'],
  ACCEPTED_IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ACCEPTED_VIDEO: ['video/mp4', 'video/quicktime', 'video/webm'],
} as const

// ─── PAGINATION ──────────────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 20,
  SONGS_LIMIT:   24,
  COMMUNITY_LIMIT: 15,
  NOTIFICATIONS_LIMIT: 30,
} as const

// ─── FEATURE FLAGS ───────────────────────────────────────────────────────────

export const FEATURES = {
  INSTAGRAM_API:   process.env.NEXT_PUBLIC_INSTAGRAM_ENABLED === 'true',
  YOUTUBE_API:     process.env.NEXT_PUBLIC_YOUTUBE_ENABLED   === 'true',
  RAZORPAY:        process.env.NEXT_PUBLIC_RAZORPAY_ENABLED  === 'true',
  AI_POSTER:       process.env.NEXT_PUBLIC_AI_POSTER_ENABLED === 'true',
  COMMUNITY:       true,
  MILESTONES:      true,
  PUSH_NOTIFS:     true,
} as const

// ─── SOCIAL LINKS ────────────────────────────────────────────────────────────

export const SOCIAL_LINKS = {
  INSTAGRAM: 'https://instagram.com/svaraverseai',
  YOUTUBE:   'https://youtube.com/@svaraverseai',
  TWITTER:   'https://twitter.com/svaraverseai',
  LINKEDIN:  'https://linkedin.com/company/svaraverseai',
} as const

// ─── RAZORPAY ────────────────────────────────────────────────────────────────

export const RAZORPAY_CONFIG = {
  KEY_ID:   process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  CURRENCY: 'INR',
  NAME:     APP_NAME,
  DESCRIPTION: 'SvaraVerse AI Subscription',
  IMAGE:    `${APP_URL}/logo.png`,
  THEME:    { color: '#B45309' },
} as const

// ─── LOCAL STORAGE KEYS ──────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  AUTH_TOKEN:      'sv_auth_token',
  REFRESH_TOKEN:   'sv_refresh_token',
  USER:            'sv_user',
  THEME:           'sv_theme',
  LANGUAGE:        'sv_language',
  SIDEBAR_OPEN:    'sv_sidebar',
  ONBOARDING_DONE: 'sv_onboarded',
  AI_SESSIONS:     'sv_ai_sessions',
} as const

// ─── ERROR MESSAGES ──────────────────────────────────────────────────────────

export const ERROR_MESSAGES = {
  GENERIC:          'Something went wrong. Please try again.',
  NETWORK:          'Network error. Please check your connection.',
  UNAUTHORIZED:     'Please log in to continue.',
  FORBIDDEN:        'You do not have permission to do this.',
  NOT_FOUND:        'The requested resource was not found.',
  VALIDATION:       'Please check your inputs and try again.',
  UPLOAD_FAILED:    'Upload failed. Please try again.',
  AI_UNAVAILABLE:   'AI Coach is temporarily unavailable.',
  PAYMENT_FAILED:   'Payment failed. Please try again.',
  SESSION_EXPIRED:  'Your session has expired. Please log in again.',
} as const

// ─── SUCCESS MESSAGES ────────────────────────────────────────────────────────

export const SUCCESS_MESSAGES = {
  SONG_ADDED:       'Song added to your library! 🎵',
  SONG_UPDATED:     'Song updated successfully.',
  SONG_DELETED:     'Song removed from library.',
  PROFILE_UPDATED:  'Profile updated successfully.',
  SETTINGS_SAVED:   'Settings saved.',
  REMINDER_SET:     'Reminder set! We will notify you. 🔔',
  TASK_COMPLETED:   'Task completed! Great work! ✅',
  MILESTONE_UNLOCKED:'Milestone unlocked! 🏆',
  PAYMENT_SUCCESS:  'Payment successful! Welcome to Premium! 🎉',
  POSTER_GENERATED: 'Poster generated successfully! 🎨',
} as const
