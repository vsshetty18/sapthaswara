-- ============================================================
-- SvaraVerse AI - PostgreSQL Full Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('user', 'creator', 'premium', 'admin', 'owner');
CREATE TYPE song_status AS ENUM ('practiced', 'recorded', 'posted', 'need_improvement', 'favourite');
CREATE TYPE song_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE reminder_type AS ENUM (
  'practice', 'live_session', 'collaboration', 'competition',
  'studio_booking', 'recording', 'birthday', 'festival'
);
CREATE TYPE recurrence_pattern AS ENUM ('daily', 'weekly', 'monthly', 'yearly', 'none');
CREATE TYPE planner_category AS ENUM (
  'practice', 'recording', 'editing', 'posting', 'reply_comments',
  'networking', 'learning', 'listening', 'writing'
);
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'past_due', 'trialing');
CREATE TYPE subscription_plan AS ENUM ('free', 'premium_monthly', 'premium_yearly');
CREATE TYPE payment_status AS ENUM ('created', 'authorized', 'captured', 'failed', 'refunded');
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE poster_type AS ENUM (
  'instagram_post', 'story', 'thumbnail', 'wallpaper',
  'album_cover', 'festival_poster', 'minimal_poster', 'premium_poster'
);

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  firebase_uid VARCHAR(128) UNIQUE,
  role user_role NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  bio TEXT,
  phone_number VARCHAR(20),
  is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  auth_provider VARCHAR(20) NOT NULL DEFAULT 'email',
  instagram_handle VARCHAR(100),
  youtube_channel_id VARCHAR(100),
  fcm_tokens TEXT[] DEFAULT '{}',
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  theme_preference VARCHAR(10) DEFAULT 'light',
  language_preference VARCHAR(10) DEFAULT 'en',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);

-- ============================================================
-- PASSWORD RESET / EMAIL VERIFICATION TOKENS
-- ============================================================

CREATE TABLE auth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL,
  token_type VARCHAR(30) NOT NULL, -- 'email_verification' | 'password_reset' | 'refresh'
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_tokens_user_id ON auth_tokens(user_id);
CREATE INDEX idx_auth_tokens_token ON auth_tokens(token);

-- ============================================================
-- SONGS
-- ============================================================

CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  movie VARCHAR(200),
  singer VARCHAR(200),
  composer VARCHAR(200),
  lyricist VARCHAR(200),
  scale VARCHAR(50),
  language VARCHAR(50),
  mood VARCHAR(50),
  difficulty song_difficulty DEFAULT 'intermediate',
  status song_status DEFAULT 'need_improvement',
  lyrics TEXT,
  audio_file_url TEXT,
  audio_file_path TEXT,
  cover_image_url TEXT,
  duration_seconds INTEGER,
  tags TEXT[] DEFAULT '{}',
  is_favourite BOOLEAN NOT NULL DEFAULT FALSE,
  practice_count INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_songs_user_id ON songs(user_id);
CREATE INDEX idx_songs_status ON songs(status);
CREATE INDEX idx_songs_tags ON songs USING GIN(tags);
CREATE INDEX idx_songs_title ON songs USING GIN(to_tsvector('english', title));

-- ============================================================
-- PLAYLISTS
-- ============================================================

CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE playlist_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(playlist_id, song_id)
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);

-- ============================================================
-- ANALYTICS (Instagram / YouTube snapshots)
-- ============================================================

CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL, -- 'instagram' | 'youtube'
  followers INTEGER DEFAULT 0,
  subscribers INTEGER DEFAULT 0,
  views BIGINT DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  watch_time_minutes INTEGER DEFAULT 0,
  retention_rate NUMERIC(5,2) DEFAULT 0,
  ctr NUMERIC(5,2) DEFAULT 0,
  revenue NUMERIC(10,2) DEFAULT 0,
  raw_data JSONB,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_user_id ON analytics_snapshots(user_id);
CREATE INDEX idx_analytics_platform ON analytics_snapshots(platform);
CREATE INDEX idx_analytics_snapshot_date ON analytics_snapshots(snapshot_date);

CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hours_practiced NUMERIC(6,2) DEFAULT 0,
  songs_completed INTEGER DEFAULT 0,
  uploads_count INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  performance_score NUMERIC(5,2) DEFAULT 0,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, metric_date)
);

CREATE INDEX idx_perf_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_perf_metrics_date ON performance_metrics(metric_date);

-- ============================================================
-- DAILY PLANNER
-- ============================================================

CREATE TABLE planner_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  category planner_category NOT NULL,
  notes TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_planner_tasks_user_id ON planner_tasks(user_id);
CREATE INDEX idx_planner_tasks_scheduled_date ON planner_tasks(scheduled_date);

-- ============================================================
-- REMINDERS
-- ============================================================

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type reminder_type NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  scheduled_time TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_pattern recurrence_pattern DEFAULT 'none',
  is_sent BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_scheduled_time ON reminders(scheduled_time);
CREATE INDEX idx_reminders_is_sent ON reminders(is_sent);

-- ============================================================
-- MILESTONES
-- ============================================================

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_key VARCHAR(50) NOT NULL, -- e.g. '100_followers', '365_day_streak'
  title VARCHAR(200) NOT NULL,
  description TEXT,
  badge_icon_url TEXT,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_celebrated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, milestone_key)
);

CREATE INDEX idx_milestones_user_id ON milestones(user_id);

-- ============================================================
-- AI POSTERS
-- ============================================================

CREATE TABLE ai_posters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
  poster_type poster_type NOT NULL,
  image_url TEXT NOT NULL,
  prompt_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_posters_user_id ON ai_posters(user_id);
CREATE INDEX idx_ai_posters_song_id ON ai_posters(song_id);

-- ============================================================
-- AI COACH LOGS
-- ============================================================

CREATE TABLE ai_coach_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL,
  prompt_context JSONB,
  response_text TEXT,
  tokens_used INTEGER DEFAULT 0,
  cost_usd NUMERIC(10,6) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_coach_logs_user_id ON ai_coach_logs(user_id);
CREATE INDEX idx_ai_coach_logs_created_at ON ai_coach_logs(created_at);

-- ============================================================
-- COMMUNITY
-- ============================================================

CREATE TABLE community_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  profile_type VARCHAR(30) NOT NULL DEFAULT 'creator', -- creator, teacher, music_director, playback_singer, studio
  specialization TEXT[],
  location VARCHAR(100),
  is_available_for_collab BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status connection_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(requester_id, recipient_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_recipient ON connections(recipient_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);

CREATE TABLE community_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, song_id)
);

CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS & PAYMENTS
-- ============================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  razorpay_subscription_id VARCHAR(100),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status payment_status NOT NULL DEFAULT 'created',
  refund_amount NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================================
-- SUPPORT / BUG REPORTS (Owner Dashboard)
-- ============================================================

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE bug_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  platform VARCHAR(20),
  app_version VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE crash_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  platform VARCHAR(20),
  app_version VARCHAR(20),
  stack_trace TEXT,
  device_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE app_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  platform VARCHAR(20),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SYSTEM / API USAGE (Owner Dashboard)
-- ============================================================

CREATE TABLE api_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service VARCHAR(50) NOT NULL, -- 'openai', 'youtube', 'instagram', 'razorpay'
  endpoint VARCHAR(200),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  cost_usd NUMERIC(10,6) DEFAULT 0,
  status_code INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_usage_service ON api_usage_logs(service);
CREATE INDEX idx_api_usage_created_at ON api_usage_logs(created_at);

CREATE TABLE app_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  platform VARCHAR(20),
  country VARCHAR(100),
  city VARCHAR(100),
  session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_sessions_user_id ON app_sessions(user_id);
CREATE INDEX idx_app_sessions_created_at ON app_sessions(created_at);

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_songs_updated_at BEFORE UPDATE ON songs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_playlists_updated_at BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_planner_tasks_updated_at BEFORE UPDATE ON planner_tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_connections_updated_at BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
