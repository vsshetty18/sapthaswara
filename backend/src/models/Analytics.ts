import { pool } from '../config/db';

export interface AnalyticsSnapshotRecord {
  id: string;
  user_id: string;
  platform: string;
  followers: number;
  subscribers: number;
  views: number;
  reach: number;
  engagement_rate: number;
  likes: number;
  comments: number;
  shares: number;
  watch_time_minutes: number;
  retention_rate: number;
  ctr: number;
  revenue: number;
  raw_data: Record<string, any> | null;
  snapshot_date: string;
  created_at: string;
}

export interface PerformanceMetricRecord {
  id: string;
  user_id: string;
  hours_practiced: number;
  songs_completed: number;
  uploads_count: number;
  current_streak: number;
  longest_streak: number;
  performance_score: number;
  metric_date: string;
  created_at: string;
}

export interface CreateSnapshotInput {
  userId: string;
  platform: 'instagram' | 'youtube';
  followers?: number;
  subscribers?: number;
  views?: number;
  reach?: number;
  engagementRate?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  watchTimeMinutes?: number;
  retentionRate?: number;
  ctr?: number;
  revenue?: number;
  rawData?: Record<string, any>;
}

class AnalyticsModel {
  async createSnapshot(input: CreateSnapshotInput): Promise<AnalyticsSnapshotRecord> {
    const result = await pool.query(
      `INSERT INTO analytics_snapshots
        (user_id, platform, followers, subscribers, views, reach, engagement_rate,
         likes, comments, shares, watch_time_minutes, retention_rate, ctr, revenue, raw_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        input.userId,
        input.platform,
        input.followers || 0,
        input.subscribers || 0,
        input.views || 0,
        input.reach || 0,
        input.engagementRate || 0,
        input.likes || 0,
        input.comments || 0,
        input.shares || 0,
        input.watchTimeMinutes || 0,
        input.retentionRate || 0,
        input.ctr || 0,
        input.revenue || 0,
        input.rawData ? JSON.stringify(input.rawData) : null,
      ]
    );
    return result.rows[0];
  }

  async getLatestSnapshot(userId: string, platform: string): Promise<AnalyticsSnapshotRecord | null> {
    const result = await pool.query(
      `SELECT * FROM analytics_snapshots
       WHERE user_id = $1 AND platform = $2
       ORDER BY snapshot_date DESC LIMIT 1`,
      [userId, platform]
    );
    return result.rows[0] || null;
  }

  async getSnapshotsInRange(
    userId: string,
    platform: string,
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsSnapshotRecord[]> {
    const result = await pool.query(
      `SELECT * FROM analytics_snapshots
       WHERE user_id = $1 AND platform = $2 AND snapshot_date BETWEEN $3 AND $4
       ORDER BY snapshot_date ASC`,
      [userId, platform, startDate, endDate]
    );
    return result.rows;
  }

  async upsertPerformanceMetric(input: {
    userId: string;
    hoursPracticed?: number;
    songsCompleted?: number;
    uploadsCount?: number;
    currentStreak?: number;
    longestStreak?: number;
    performanceScore?: number;
    metricDate?: string;
  }): Promise<PerformanceMetricRecord> {
    const date = input.metricDate || new Date().toISOString().slice(0, 10);
    const result = await pool.query(
      `INSERT INTO performance_metrics
        (user_id, hours_practiced, songs_completed, uploads_count, current_streak, longest_streak, performance_score, metric_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (user_id, metric_date)
       DO UPDATE SET
         hours_practiced = EXCLUDED.hours_practiced,
         songs_completed = EXCLUDED.songs_completed,
         uploads_count = EXCLUDED.uploads_count,
         current_streak = EXCLUDED.current_streak,
         longest_streak = EXCLUDED.longest_streak,
         performance_score = EXCLUDED.performance_score
       RETURNING *`,
      [
        input.userId,
        input.hoursPracticed || 0,
        input.songsCompleted || 0,
        input.uploadsCount || 0,
        input.currentStreak || 0,
        input.longestStreak || 0,
        input.performanceScore || 0,
        date,
      ]
    );
    return result.rows[0];
  }

  async getLatestPerformanceMetric(userId: string): Promise<PerformanceMetricRecord | null> {
    const result = await pool.query(
      `SELECT * FROM performance_metrics WHERE user_id = $1 ORDER BY metric_date DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  async getPerformanceMetricsInRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PerformanceMetricRecord[]> {
    const result = await pool.query(
      `SELECT * FROM performance_metrics
       WHERE user_id = $1 AND metric_date BETWEEN $2 AND $3
       ORDER BY metric_date ASC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  async getHeatmapData(userId: string, startDate: Date, endDate: Date): Promise<{ date: string; count: number }[]> {
    const result = await pool.query(
      `SELECT metric_date::text as date, (hours_practiced > 0)::int + songs_completed + uploads_count as count
       FROM performance_metrics
       WHERE user_id = $1 AND metric_date BETWEEN $2 AND $3
       ORDER BY metric_date ASC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  // Owner dashboard aggregations
  async getTotalRevenue(): Promise<number> {
    const result = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'captured'`
    );
    return parseFloat(result.rows[0].total);
  }

  async getRevenueByPeriod(period: 'day' | 'week' | 'month' | 'year'): Promise<number> {
    const intervalMap = { day: '1 day', week: '7 days', month: '30 days', year: '365 days' };
    const result = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payments
       WHERE status = 'captured' AND created_at >= NOW() - INTERVAL '${intervalMap[period]}'`
    );
    return parseFloat(result.rows[0].total);
  }

  async getAIUsageCost(period: 'day' | 'week' | 'month'): Promise<number> {
    const intervalMap = { day: '1 day', week: '7 days', month: '30 days' };
    const result = await pool.query(
      `SELECT COALESCE(SUM(cost_usd), 0) as total FROM ai_coach_logs
       WHERE created_at >= NOW() - INTERVAL '${intervalMap[period]}'`
    );
    return parseFloat(result.rows[0].total);
  }

  async getApiUsageStats(): Promise<{ service: string; total_cost: number; total_calls: number }[]> {
    const result = await pool.query(
      `SELECT service, COALESCE(SUM(cost_usd), 0) as total_cost, COUNT(*) as total_calls
       FROM api_usage_logs
       GROUP BY service
       ORDER BY total_cost DESC`
    );
    return result.rows;
  }
}

export default new AnalyticsModel();
