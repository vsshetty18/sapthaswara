-- Migration: 003_create_analytics
-- Description: Creates analytics_snapshots, performance_metrics, ai_posters, and ai_coach_logs tables

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_platform ON analytics_snapshots(platform);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshot_date ON analytics_snapshots(snapshot_date);

CREATE TABLE IF NOT EXISTS performance_metrics (
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

CREATE INDEX IF NOT EXISTS idx_perf_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_date ON performance_metrics(metric_date);

DO $$ BEGIN
  CREATE TYPE poster_type AS ENUM (
    'instagram_post', 'story', 'thumbnail', 'wallpaper',
    'album_cover', 'festival_poster', 'minimal_poster', 'premium_poster'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS ai_posters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
  poster_type poster_type NOT NULL,
  image_url TEXT NOT NULL,
  prompt_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_posters_user_id ON ai_posters(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_posters_song_id ON ai_posters(song_id);

CREATE TABLE IF NOT EXISTS ai_coach_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL,
  prompt_context JSONB,
  response_text TEXT,
  tokens_used INTEGER DEFAULT 0,
  cost_usd NUMERIC(10,6) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_coach_logs_user_id ON ai_coach_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_coach_logs_created_at ON ai_coach_logs(created_at);
