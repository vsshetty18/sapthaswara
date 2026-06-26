/* ============================================================
   SVARAVERSE AI — TypeScript Type Definitions
   Complete type system for the entire application
   ============================================================ */

// ─── ENUMS ──────────────────────────────────────────────────────────────────

export enum UserRole {
  USER      = 'user',
  CREATOR   = 'creator',
  PREMIUM   = 'premium',
  ADMIN     = 'admin',
  OWNER     = 'owner',
}

export enum SubscriptionPlan {
  FREE    = 'free',
  BASIC   = 'basic',
  PRO     = 'pro',
  PREMIUM = 'premium',
}

export enum SongStatus {
  PRACTICED       = 'practiced',
  RECORDED        = 'recorded',
  POSTED          = 'posted',
  NEED_IMPROVEMENT= 'need_improvement',
  FAVOURITE       = 'favourite',
  IN_PROGRESS     = 'in_progress',
  DRAFT           = 'draft',
}

export enum SongDifficulty {
  BEGINNER     = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED     = 'advanced',
  EXPERT       = 'expert',
}

export enum SongMood {
  HAPPY      = 'happy',
  SAD        = 'sad',
  ROMANTIC   = 'romantic',
  DEVOTIONAL = 'devotional',
  ENERGETIC  = 'energetic',
  CALM       = 'calm',
  PATRIOTIC  = 'patriotic',
  CLASSICAL  = 'classical',
  FOLK       = 'folk',
  FESTIVE    = 'festive',
}

export enum SongLanguage {
  HINDI     = 'hindi',
  ENGLISH   = 'english',
  MARATHI   = 'marathi',
  BENGALI   = 'bengali',
  TAMIL     = 'tamil',
  TELUGU    = 'telugu',
  KANNADA   = 'kannada',
  GUJARATI  = 'gujarati',
  PUNJABI   = 'punjabi',
  MALAYALAM = 'malayalam',
  BHOJPURI  = 'bhojpuri',
  RAJASTHANI= 'rajasthani',
  OTHER     = 'other',
}

export enum PlannerTaskStatus {
  PENDING     = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED   = 'completed',
  SKIPPED     = 'skipped',
}

export enum PlannerTaskType {
  PRACTICE   = 'practice',
  RECORDING  = 'recording',
  EDITING    = 'editing',
  POSTING    = 'posting',
  NETWORKING = 'networking',
  LEARNING   = 'learning',
  LISTENING  = 'listening',
  WRITING    = 'writing',
  REPLY      = 'reply',
  OTHER      = 'other',
}

export enum ReminderType {
  PRACTICE     = 'practice',
  LIVE_SESSION = 'live_session',
  COLLABORATION= 'collaboration',
  COMPETITION  = 'competition',
  STUDIO       = 'studio',
  RECORDING    = 'recording',
  BIRTHDAY     = 'birthday',
  FESTIVAL     = 'festival',
  CUSTOM       = 'custom',
}

export enum MilestoneType {
  FOLLOWERS_100    = 'followers_100',
  FOLLOWERS_500    = 'followers_500',
  FOLLOWERS_1K     = 'followers_1k',
  FOLLOWERS_10K    = 'followers_10k',
  SONGS_10         = 'songs_10',
  SONGS_50         = 'songs_50',
  SONGS_100        = 'songs_100',
  STREAK_7         = 'streak_7',
  STREAK_30        = 'streak_30',
  STREAK_100       = 'streak_100',
  STREAK_365       = 'streak_365',
  VIDEOS_10        = 'videos_10',
  VIDEOS_100       = 'videos_100',
  FIRST_COLLAB     = 'first_collab',
  FIRST_LIVE       = 'first_live',
  FIRST_INCOME     = 'first_income',
  SUBSCRIBERS_100  = 'subscribers_100',
  SUBSCRIBERS_1K   = 'subscribers_1k',
  SUBSCRIBERS_10K  = 'subscribers_10k',
}

export enum PostType {
  TEXT   = 'text',
  AUDIO  = 'audio',
  VIDEO  = 'video',
  IMAGE  = 'image',
  COLLAB = 'collab',
}

export enum NotificationType {
  MILESTONE    = 'milestone',
  REMINDER     = 'reminder',
  COLLAB       = 'collaboration',
  SYSTEM       = 'system',
  AI_INSIGHT   = 'ai_insight',
  COMMUNITY    = 'community',
  PAYMENT      = 'payment',
}

export enum PosterType {
  INSTAGRAM_POST  = 'instagram_post',
  INSTAGRAM_STORY = 'instagram_story',
  YOUTUBE_THUMB   = 'youtube_thumbnail',
  ALBUM_COVER     = 'album_cover',
  FESTIVAL_POSTER = 'festival_poster',
  MINIMAL_POSTER  = 'minimal_poster',
  PREMIUM_POSTER  = 'premium_poster',
  WALLPAPER       = 'wallpaper',
}

// ─── USER TYPES ─────────────────────────────────────────────────────────────

export interface User {
  id:               string
  uid:              string           // Firebase UID
  email:            string
  username:         string
  displayName:      string
  photoURL?:        string
  bio?:             string
  role:             UserRole
  plan:             SubscriptionPlan
  isEmailVerified:  boolean
  isActive:         boolean

  // Profile
  phone?:           string
  dateOfBirth?:     string
  city?:            string
  state?:           string
  country:          string

  // Social handles
  instagramHandle?: string
  youtubeChannelId?:string
  youtubeChannelUrl?:string

  // Music profile
  primaryScale?:    string
  genres?:          string[]
  instruments?:     string[]
  yearsOfExperience?: number

  // Stats (cached from analytics)
  totalSongs:       number
  totalPracticeHours: number
  currentStreak:    number
  longestStreak:    number
  totalUploads:     number

  // Timestamps
  createdAt:        string
  updatedAt:        string
  lastLoginAt?:     string
}

export interface UserProfile extends User {
  followers:        number
  following:        number
  isFollowing?:     boolean
  milestones:       Milestone[]
  recentSongs:      Song[]
}

export interface AuthUser {
  uid:              string
  email:            string | null
  displayName:      string | null
  photoURL:         string | null
  emailVerified:    boolean
}

export interface LoginCredentials {
  email:    string
  password: string
}

export interface SignupCredentials {
  email:       string
  password:    string
  username:    string
  displayName: string
}

// ─── SONG TYPES ─────────────────────────────────────────────────────────────

export interface Song {
  id:           string
  userId:       string
  title:        string
  artist:       string          // Singer
  composer?:    string
  lyricist?:    string
  movie?:       string
  album?:       string
  language:     SongLanguage
  mood?:        SongMood
  scale?:       string          // Sur / Shruti (e.g., "C#", "D")
  difficulty:   SongDifficulty
  status:       SongStatus[]
  tags:         string[]
  lyrics?:      string
  notes?:       string          // Practice notes

  // Media
  audioUrl?:    string
  coverUrl?:    string
  videoUrl?:    string

  // Practice data
  practiceCount:   number
  totalPracticeMin:number
  lastPracticedAt?:string
  recordedAt?:     string
  postedAt?:       string

  // Social
  postedTo?:    ('instagram' | 'youtube' | 'both')[]
  instagramUrl?:string
  youtubeUrl?:  string

  // AI
  aiSuggestions?: string[]
  aiRating?:      number

  isFavourite:  boolean
  isPublic:     boolean

  createdAt:    string
  updatedAt:    string
}

export interface Playlist {
  id:          string
  userId:      string
  name:        string
  description?:string
  coverUrl?:   string
  songIds:     string[]
  songs?:      Song[]
  isPublic:    boolean
  createdAt:   string
  updatedAt:   string
}

export interface SongFilter {
  search?:     string
  language?:   SongLanguage
  mood?:       SongMood
  difficulty?: SongDifficulty
  status?:     SongStatus
  isFavourite?:boolean
  tags?:       string[]
  sortBy?:     'title' | 'createdAt' | 'lastPracticedAt' | 'practiceCount'
  sortOrder?:  'asc' | 'desc'
  page?:       number
  limit?:      number
}

// ─── ANALYTICS TYPES ────────────────────────────────────────────────────────

export interface DailyStats {
  date:             string
  practiceMinutes:  number
  songsLearned:     number
  songsRecorded:    number
  songsPosted:      number
  hoursOnPlatform:  number
}

export interface GrowthData {
  date:          string
  followers?:    number
  subscribers?:  number
  views?:        number
  likes?:        number
  comments?:     number
  shares?:       number
  reach?:        number
}

export interface AnalyticsSummary {
  // Practice
  totalPracticeHours:   number
  weeklyPracticeHours:  number
  monthlyPracticeHours: number
  avgDailyPracticeMin:  number
  currentStreak:        number
  longestStreak:        number

  // Content
  totalSongs:       number
  songsThisWeek:    number
  songsThisMonth:   number
  totalUploads:     number
  uploadsThisMonth: number

  // Social
  instagramFollowers?:  number
  instagramGrowth?:     number   // % growth this month
  youtubeSubscribers?:  number
  youtubeGrowth?:       number
  totalViews?:          number
  totalLikes?:          number

  // Performance score (0-100)
  performanceScore:  number
  scoreBreakdown: {
    consistency:   number
    growth:        number
    engagement:    number
    productivity:  number
  }
}

export interface HeatmapData {
  date:  string
  count: number    // 0-4 intensity levels
}

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface ReportData {
  period:    'weekly' | 'monthly' | 'yearly'
  startDate: string
  endDate:   string
  summary:   AnalyticsSummary
  daily:     DailyStats[]
  growth:    GrowthData[]
  topSongs:  Song[]
  insights:  string[]
}

// ─── INSTAGRAM TYPES ────────────────────────────────────────────────────────

export interface InstagramData {
  handle:            string
  followers:         number
  following:         number
  posts:             number
  reach?:            number
  impressions?:      number
  engagement?:       number   // percentage
  avgLikes?:         number
  avgComments?:      number
  avgShares?:        number
  bestPostingTime?:  string[]
  topHashtags?:      string[]
  audienceAge?:      Record<string, number>
  audienceGender?:   { male: number; female: number; other: number }
  audienceLocation?: Record<string, number>
  monthlyGrowth:     number   // percentage
  recentPosts?:      InstagramPost[]
  aiAnalysis?:       string
}

export interface InstagramPost {
  id:          string
  type:        'image' | 'video' | 'reel' | 'carousel'
  caption?:    string
  likes:       number
  comments:    number
  reach?:      number
  url?:        string
  thumbnailUrl?:string
  postedAt:    string
}

// ─── YOUTUBE TYPES ──────────────────────────────────────────────────────────

export interface YouTubeData {
  channelId:      string
  channelName:    string
  channelUrl:     string
  subscribers:    number
  totalViews:     number
  totalVideos:    number
  watchTimeHours?:number
  avgViewDuration?:string
  avgCTR?:        number   // Click-through rate %
  avgRetention?:  number   // Average view percentage
  monthlyGrowth:  number
  uploadsPerMonth?:number
  estimatedRevenue?:number
  topVideos?:     YouTubeVideo[]
  aiSuggestions?:string[]
}

export interface YouTubeVideo {
  id:           string
  title:        string
  views:        number
  likes?:       number
  comments?:    number
  watchTime?:   number
  ctr?:         number
  retention?:   number
  thumbnailUrl?:string
  url:          string
  publishedAt:  string
}

// ─── PLANNER TYPES ──────────────────────────────────────────────────────────

export interface PlannerTask {
  id:          string
  userId:      string
  date:        string
  title:       string
  description?:string
  type:        PlannerTaskType
  status:      PlannerTaskStatus
  durationMin?:number
  scheduledAt?:string
  completedAt?:string
  relatedSongId?:string
  relatedSong?: Song
  order:       number
  createdAt:   string
  updatedAt:   string
}

export interface DailyPlan {
  date:           string
  tasks:          PlannerTask[]
  completedCount: number
  totalCount:     number
  progressPercent:number
  totalMinutes:   number
  completedMinutes:number
}

// ─── REMINDER TYPES ─────────────────────────────────────────────────────────

export interface Reminder {
  id:           string
  userId:       string
  title:        string
  description?: string
  type:         ReminderType
  scheduledAt:  string
  isRecurring:  boolean
  recurringDays?:number[]    // 0=Sun, 1=Mon, etc.
  isActive:     boolean
  isPushEnabled:boolean
  relatedSongId?:string
  createdAt:    string
  updatedAt:    string
}

// ─── MILESTONE TYPES ────────────────────────────────────────────────────────

export interface Milestone {
  id:           string
  userId:       string
  type:         MilestoneType
  title:        string
  description:  string
  icon:         string
  achievedAt:   string
  value:        number        // e.g., 1000 for 1K followers
  isNew:        boolean       // To trigger celebration animation
}

export interface MilestoneDefinition {
  type:        MilestoneType
  title:       string
  description: string
  icon:        string
  targetValue: number
  category:    'followers' | 'songs' | 'streak' | 'videos' | 'community' | 'income'
}

// ─── AI TYPES ───────────────────────────────────────────────────────────────

export interface AIMessage {
  id:        string
  role:      'user' | 'assistant'
  content:   string
  timestamp: string
  isLoading?:boolean
}

export interface AICoachSession {
  id:        string
  userId:    string
  messages:  AIMessage[]
  createdAt: string
  updatedAt: string
}

export interface AISuggestion {
  id:       string
  type:     'song' | 'practice' | 'upload' | 'hashtag' | 'caption' | 'timing' | 'collab'
  title:    string
  content:  string
  priority: 'high' | 'medium' | 'low'
  icon:     string
}

export interface AIInsight {
  category:    string
  insight:     string
  actionItems: string[]
  priority:    'high' | 'medium' | 'low'
}

// ─── POSTER TYPES ────────────────────────────────────────────────────────────

export interface PosterConfig {
  id:          string
  userId:      string
  songId?:     string
  type:        PosterType
  title:       string
  subtitle?:   string
  artistName:  string
  imageUrl?:   string
  theme:       'gold' | 'dark' | 'minimal' | 'festival' | 'classic'
  generatedUrl?:string
  createdAt:   string
}

// ─── COMMUNITY TYPES ────────────────────────────────────────────────────────

export interface CommunityPost {
  id:          string
  userId:      string
  user?:       Pick<User, 'id' | 'displayName' | 'username' | 'photoURL' | 'role' | 'plan'>
  type:        PostType
  content:     string
  mediaUrl?:   string
  songId?:     string
  song?:       Pick<Song, 'id' | 'title' | 'artist'>
  tags?:       string[]
  likesCount:  number
  commentsCount:number
  sharesCount: number
  isLiked?:   boolean
  comments?:  Comment[]
  createdAt:  string
  updatedAt:  string
}

export interface Comment {
  id:        string
  postId:    string
  userId:    string
  user?:     Pick<User, 'id' | 'displayName' | 'username' | 'photoURL'>
  content:   string
  likesCount:number
  isLiked?:  boolean
  createdAt: string
}

export interface CommunityMember {
  id:          string
  displayName: string
  username:    string
  photoURL?:   string
  role:        UserRole
  plan:        SubscriptionPlan
  city?:       string
  instruments?:string[]
  genres?:     string[]
  followers:   number
  totalSongs:  number
  isFollowing?:boolean
}

// ─── NOTIFICATION TYPES ──────────────────────────────────────────────────────

export interface Notification {
  id:        string
  userId:    string
  type:      NotificationType
  title:     string
  body:      string
  data?:     Record<string, string>
  isRead:    boolean
  createdAt: string
}

// ─── PAYMENT TYPES ───────────────────────────────────────────────────────────

export interface PaymentOrder {
  id:          string
  orderId:     string     // Razorpay order ID
  userId:      string
  plan:        SubscriptionPlan
  amount:      number     // in paise
  currency:    string
  status:      'created' | 'paid' | 'failed'
  createdAt:   string
}

export interface Subscription {
  id:          string
  userId:      string
  plan:        SubscriptionPlan
  status:      'active' | 'cancelled' | 'expired' | 'trial'
  startDate:   string
  endDate:     string
  autoRenew:   boolean
  paymentId?:  string
}

// ─── OWNER DASHBOARD TYPES ───────────────────────────────────────────────────

export interface OwnerStats {
  // Users
  totalUsers:        number
  dailyActiveUsers:  number
  monthlyActiveUsers:number
  premiumUsers:      number
  newUsersToday:     number
  newUsersThisMonth: number

  // Revenue
  totalRevenue:      number
  monthlyRevenue:    number
  dailyRevenue:      number

  // Subscriptions
  activeSubscriptions:   number
  cancelledThisMonth:    number
  refundsThisMonth:      number

  // Platform
  androidInstalls:   number
  iosInstalls:       number
  webSessions:       number
  avgSessionMin:     number
  retentionRate:     number    // %

  // Content
  totalSongs:        number
  totalUploads:      number
  totalPracticeHours:number

  // System
  storageUsedGB:     number
  aiRequestsToday:   number
  aiCostToday:       number    // USD
  dbStatusOk:        boolean
  serverStatusOk:    boolean
  apiLatencyMs:      number

  // Tickets
  openSupportTickets:number
  openBugReports:    number
  avgRating:         number
}

export interface UserGrowthPoint {
  date:         string
  total:        number
  premium:      number
  newSignups:   number
}

export interface RevenuePoint {
  date:     string
  revenue:  number
  refunds:  number
  net:      number
}

// ─── API RESPONSE TYPES ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success:  boolean
  data?:    T
  message?: string
  error?:   string
  errors?:  Record<string, string>
}

export interface PaginatedResponse<T> {
  success:  boolean
  data:     T[]
  meta: {
    total:       number
    page:        number
    limit:       number
    totalPages:  number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// ─── SETTINGS TYPES ──────────────────────────────────────────────────────────

export interface UserSettings {
  userId:   string
  theme:    'light' | 'dark' | 'system'
  language: 'en' | 'hi' | 'mr' | 'bn' | 'ta' | 'te'
  notifications: {
    push:          boolean
    email:         boolean
    practiceReminder: boolean
    milestones:    boolean
    community:     boolean
    aiInsights:    boolean
  }
  privacy: {
    profilePublic:  boolean
    songsPublic:    boolean
    analyticsPublic:boolean
    showOnLeaderboard:boolean
  }
  display: {
    compactMode:   boolean
    showStreak:    boolean
    showProgress:  boolean
  }
}

// ─── FORM TYPES ──────────────────────────────────────────────────────────────

export interface SongFormData {
  title:      string
  artist:     string
  composer?:  string
  lyricist?:  string
  movie?:     string
  language:   SongLanguage
  mood?:      SongMood
  scale?:     string
  difficulty: SongDifficulty
  status:     SongStatus[]
  tags:       string[]
  lyrics?:    string
  notes?:     string
  isPublic:   boolean
}

export interface ProfileFormData {
  displayName:       string
  username:          string
  bio?:              string
  phone?:            string
  city?:             string
  state?:            string
  primaryScale?:     string
  genres?:           string[]
  instruments?:      string[]
  instagramHandle?:  string
  youtubeChannelUrl?:string
}

// ─── MISC / UTILITY TYPES ────────────────────────────────────────────────────

export interface SelectOption {
  value: string
  label: string
  icon?: string
  color?:string
}

export interface NavItem {
  label:    string
  href:     string
  icon:     string
  badge?:   string | number
  roles?:   UserRole[]
  children?:NavItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface TableColumn<T> {
  key:       keyof T | string
  header:    string
  render?:   (value: unknown, row: T) => React.ReactNode
  sortable?: boolean
  width?:    string
}

export type Theme = 'light' | 'dark' | 'system'

export type DateRange = {
  from: Date | undefined
  to:   Date | undefined
}

export type Period = 'today' | 'week' | 'month' | 'year' | 'custom'

export type SortOrder = 'asc' | 'desc'

export interface Coordinates {
  lat: number
  lng: number
  }
  
