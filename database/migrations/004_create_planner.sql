-- Migration: 004_create_planner
-- Description: Creates planner_tasks, reminders, and milestones tables

DO $$ BEGIN
  CREATE TYPE planner_category AS ENUM (
    'practice', 'recording', 'editing', 'posting', 'reply_comments',
    'networking', 'learning', 'listening', 'writing'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS planner_tasks (
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

CREATE INDEX IF NOT EXISTS idx_planner_tasks_user_id ON planner_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_planner_tasks_scheduled_date ON planner_tasks(scheduled_date);

DROP TRIGGER IF EXISTS trg_planner_tasks_updated_at ON planner_tasks;
CREATE TRIGGER trg_planner_tasks_updated_at BEFORE UPDATE ON planner_tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DO $$ BEGIN
  CREATE TYPE reminder_type AS ENUM (
    'practice', 'live_session', 'collaboration', 'competition',
    'studio_booking', 'recording', 'birthday', 'festival'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE recurrence_pattern AS ENUM ('daily', 'weekly', 'monthly', 'yearly', 'none');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS reminders (
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

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_time ON reminders(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_reminders_is_sent ON reminders(is_sent);

DROP TRIGGER IF EXISTS trg_reminders_updated_at ON reminders;
CREATE TRIGGER trg_reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_key VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  badge_icon_url TEXT,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_celebrated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, milestone_key)
);

CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON milestones(user_id);
