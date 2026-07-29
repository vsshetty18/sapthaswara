-- ============================================================
-- SvaraVerse AI - Seed Data
-- ============================================================

-- Owner account
INSERT INTO users (id, full_name, email, username, password_hash, role, is_email_verified, is_active, auth_provider, bio)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'SvaraVerse Owner',
  'owner@svaraverse.com',
  'svara_owner',
  '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq5R5Q5T5D5f5R5R5R5R5R5R5R5R5e',
  'owner',
  TRUE,
  TRUE,
  'email',
  'Founder & Owner of SvaraVerse AI'
);

-- Admin account
INSERT INTO users (id, full_name, email, username, password_hash, role, is_email_verified, is_active, auth_provider, bio)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'Admin User',
  'admin@svaraverse.com',
  'svara_admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq5R5Q5T5D5f5R5R5R5R5R5R5R5R5e',
  'admin',
  TRUE,
  TRUE,
  'email',
  'Platform Administrator'
);

-- Sample creator/premium users
INSERT INTO users (id, full_name, email, username, password_hash, role, is_email_verified, is_active, auth_provider, bio, instagram_handle, youtube_channel_id)
VALUES
  (
    'a0000000-0000-0000-0000-000000000003',
    'Ananya Rao',
    'ananya.rao@example.com',
    'ananya_sings',
    '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq5R5Q5T5D5f5R5R5R5R5R5R5R5R5e',
    'premium',
    TRUE,
    TRUE,
    'email',
    'Playback singer aspirant | Classical & Bollywood covers',
    'ananya_sings',
    'UCananyaRaoChannel123'
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'Rohan Verma',
    'rohan.verma@example.com',
    'rohan_music',
    '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq5R5Q5T5D5f5R5R5R5R5R5R5R5R5e',
    'creator',
    TRUE,
    TRUE,
    'email',
    'Independent music creator | Fusion covers',
    'rohan_music_official',
    'UCrohanVermaChannel456'
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    'Priya Nair',
    'priya.nair@example.com',
    'priya_notes',
    '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq5R5Q5T5D5f5R5R5R5R5R5R5R5R5e',
    'user',
    TRUE,
    TRUE,
    'email',
    'Learning classical Carnatic music',
    NULL,
    NULL
  );

-- Community profiles
INSERT INTO community_profiles (user_id, profile_type, specialization, location, is_available_for_collab)
VALUES
  ('a0000000-0000-0000-0000-000000000003', 'playback_singer', ARRAY['Bollywood', 'Classical', 'Semi-Classical'], 'Mumbai, India', TRUE),
  ('a0000000-0000-0000-0000-000000000004', 'creator', ARRAY['Fusion', 'Indie', 'Covers'], 'Bengaluru, India', TRUE),
  ('a0000000-0000-0000-0000-000000000005', 'creator', ARRAY['Carnatic'], 'Chennai, India', FALSE);

-- Sample songs
INSERT INTO songs (id, user_id, title, movie, singer, composer, lyricist, scale, language, mood, difficulty, status, tags, is_favourite, practice_count)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000003',
    'Tum Hi Ho',
    'Aashiqui 2',
    'Arijit Singh',
    'Mithoon',
    'Mithoon',
    'C Major',
    'Hindi',
    'Romantic',
    'intermediate',
    'practiced',
    ARRAY['bollywood', 'romantic', 'popular'],
    TRUE,
    12
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'Kesariya',
    'Brahmastra',
    'Arijit Singh',
    'Pritam',
    'Amitabh Bhattacharya',
    'D Major',
    'Hindi',
    'Romantic',
    'intermediate',
    'recorded',
    ARRAY['bollywood', 'trending'],
    FALSE,
    8
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000004',
    'Kun Faya Kun',
    'Rockstar',
    'A.R. Rahman',
    'A.R. Rahman',
    'Irshad Kamil',
    'E Minor',
    'Hindi/Urdu',
    'Spiritual',
    'advanced',
    'need_improvement',
    ARRAY['sufi', 'spiritual', 'ar-rahman'],
    FALSE,
    3
  );

-- Sample playlist
INSERT INTO playlists (id, user_id, name, description, is_public)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000003',
  'Practice Favourites',
  'Songs I practice most often',
  FALSE
);

INSERT INTO playlist_songs (playlist_id, song_id, position)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 1),
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 2);

-- Analytics snapshots
INSERT INTO analytics_snapshots (user_id, platform, followers, reach, engagement_rate, likes, comments, shares, snapshot_date)
VALUES
  ('a0000000-0000-0000-0000-000000000003', 'instagram', 15200, 42000, 4.8, 1850, 210, 95, CURRENT_DATE),
  ('a0000000-0000-0000-0000-000000000004', 'instagram', 8300, 21000, 3.2, 780, 95, 40, CURRENT_DATE);

INSERT INTO analytics_snapshots (user_id, platform, subscribers, views, watch_time_minutes, retention_rate, ctr, snapshot_date)
VALUES
  ('a0000000-0000-0000-0000-000000000003', 'youtube', 9800, 340000, 128000, 52.5, 6.8, CURRENT_DATE),
  ('a0000000-0000-0000-0000-000000000004', 'youtube', 4200, 98000, 45000, 41.2, 4.9, CURRENT_DATE);

-- Performance metrics
INSERT INTO performance_metrics (user_id, hours_practiced, songs_completed, uploads_count, current_streak, longest_streak, performance_score, metric_date)
VALUES
  ('a0000000-0000-0000-0000-000000000003', 4.5, 2, 1, 12, 45, 82.5, CURRENT_DATE),
  ('a0000000-0000-0000-0000-000000000004', 2.0, 1, 0, 5, 20, 61.0, CURRENT_DATE);

-- Planner tasks
INSERT INTO planner_tasks (user_id, title, category, notes, is_completed, scheduled_date)
VALUES
  ('a0000000-0000-0000-0000-000000000003', 'Practice Kesariya - verse 2', 'practice', 'Focus on breath control', FALSE, CURRENT_DATE),
  ('a0000000-0000-0000-0000-000000000003', 'Record Tum Hi Ho cover', 'recording', 'Use studio mic setup', FALSE, CURRENT_DATE),
  ('a0000000-0000-0000-0000-000000000003', 'Reply to Instagram comments', 'reply_comments', NULL, TRUE, CURRENT_DATE);

-- Reminders
INSERT INTO reminders (user_id, type, title, description, scheduled_time, is_recurring, recurrence_pattern)
VALUES
  ('a0000000-0000-0000-0000-000000000003', 'practice', 'Daily Riyaz', 'Morning practice session', NOW() + INTERVAL '1 day', TRUE, 'daily'),
  ('a0000000-0000-0000-0000-000000000003', 'live_session', 'Instagram Live Q&A', 'Weekly fan interaction', NOW() + INTERVAL '3 days', TRUE, 'weekly');

-- Milestones
INSERT INTO milestones (user_id, milestone_key, title, description, achieved_at, is_celebrated)
VALUES
  ('a0000000-0000-0000-0000-000000000003', '10000_followers', '10,000 Followers!', 'Reached 10K followers on Instagram', NOW() - INTERVAL '10 days', TRUE),
  ('a0000000-0000-0000-0000-000000000003', 'first_collaboration', 'First Collaboration', 'Completed first duet collaboration', NOW() - INTERVAL '30 days', TRUE),
  ('a0000000-0000-0000-0000-000000000004', '100_songs', '100 Songs Practiced', 'Practiced 100 songs milestone', NOW() - INTERVAL '5 days', FALSE);

-- Subscriptions
INSERT INTO subscriptions (user_id, plan, status, current_period_start, current_period_end)
VALUES
  ('a0000000-0000-0000-0000-000000000003', 'premium_yearly', 'active', NOW() - INTERVAL '2 months', NOW() + INTERVAL '10 months'),
  ('a0000000-0000-0000-0000-000000000004', 'free', 'active', NOW() - INTERVAL '6 months', NULL);

-- Payments
INSERT INTO payments (user_id, subscription_id, razorpay_order_id, razorpay_payment_id, amount, currency, status)
SELECT
  'a0000000-0000-0000-0000-000000000003',
  s.id,
  'order_sample123456',
  'pay_sample123456',
  2999.00,
  'INR',
  'captured'
FROM subscriptions s WHERE s.user_id = 'a0000000-0000-0000-0000-000000000003';

-- Community connection
INSERT INTO connections (requester_id, recipient_id, status)
VALUES ('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'accepted');

-- Sample message
INSERT INTO messages (sender_id, recipient_id, content, is_read)
VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000003',
  'Hey! Loved your Kesariya cover. Want to collaborate on a fusion piece?',
  FALSE
);

-- App review
INSERT INTO app_reviews (user_id, platform, rating, review_text)
VALUES
  ('a0000000-0000-0000-0000-000000000003', 'android', 5, 'Best app for tracking my music journey. The AI coach is incredibly helpful!'),
  ('a0000000-0000-0000-0000-000000000004', 'ios', 4, 'Great features, would love more collaboration tools.');
