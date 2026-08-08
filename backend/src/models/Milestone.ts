import { pool } from '../config/db';

export interface MilestoneRecord {
  id: string;
  user_id: string;
  milestone_key: string;
  title: string;
  description: string | null;
  badge_icon_url: string | null;
  achieved_at: string;
  is_celebrated: boolean;
  created_at: string;
}

export interface CreateMilestoneInput {
  userId: string;
  milestoneKey: string;
  title: string;
  description?: string;
  badgeIconUrl?: string;
}

export const MILESTONE_DEFINITIONS: Record<string, { title: string; description: string; check: (stats: MilestoneCheckStats) => boolean }> = {
  '100_followers': {
    title: '100 Followers!',
    description: 'Reached 100 followers on social media',
    check: (s) => s.totalFollowers >= 100,
  },
  '500_followers': {
    title: '500 Followers!',
    description: 'Reached 500 followers on social media',
    check: (s) => s.totalFollowers >= 500,
  },
  '1000_followers': {
    title: '1,000 Followers!',
    description: 'Reached 1K followers on social media',
    check: (s) => s.totalFollowers >= 1000,
  },
  '100_songs': {
    title: '100 Songs!',
    description: 'Added 100 songs to your library',
    check: (s) => s.totalSongs >= 100,
  },
  '365_day_streak': {
    title: '365 Day Streak!',
    description: 'Practiced every day for a full year',
    check: (s) => s.currentStreak >= 365,
  },
  '100_videos': {
    title: '100 Videos!',
    description: 'Uploaded 100 videos',
    check: (s) => s.totalUploads >= 100,
  },
  first_collaboration: {
    title: 'First Collaboration!',
    description: 'Completed your first collaboration',
    check: (s) => s.collaborationsCount >= 1,
  },
  first_live: {
    title: 'First Live Session!',
    description: 'Hosted your first live session',
    check: (s) => s.liveSessionsCount >= 1,
  },
  first_income: {
    title: 'First Income!',
    description: 'Earned your first revenue as a creator',
    check: (s) => s.totalRevenue > 0,
  },
};

export interface MilestoneCheckStats {
  totalFollowers: number;
  totalSongs: number;
  currentStreak: number;
  totalUploads: number;
  collaborationsCount: number;
  liveSessionsCount: number;
  totalRevenue: number;
}

class MilestoneModel {
  async create(input: CreateMilestoneInput): Promise<MilestoneRecord> {
    const result = await pool.query(
      `INSERT INTO milestones (user_id, milestone_key, title, description, badge_icon_url)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, milestone_key) DO NOTHING
       RETURNING *`,
      [input.userId, input.milestoneKey, input.title, input.description || null, input.badgeIconUrl || null]
    );
    return result.rows[0];
  }

  async findByUser(userId: string): Promise<MilestoneRecord[]> {
    const result = await pool.query(
      'SELECT * FROM milestones WHERE user_id = $1 ORDER BY achieved_at DESC',
      [userId]
    );
    return result.rows;
  }

  async findByUserAndKey(userId: string, milestoneKey: string): Promise<MilestoneRecord | null> {
    const result = await pool.query(
      'SELECT * FROM milestones WHERE user_id = $1 AND milestone_key = $2',
      [userId, milestoneKey]
    );
    return result.rows[0] || null;
  }

  async getUncelebrated(userId: string): Promise<MilestoneRecord[]> {
    const result = await pool.query(
      'SELECT * FROM milestones WHERE user_id = $1 AND is_celebrated = FALSE ORDER BY achieved_at DESC',
      [userId]
    );
    return result.rows;
  }

  async markCelebrated(id: string, userId: string): Promise<void> {
    await pool.query(
      'UPDATE milestones SET is_celebrated = TRUE WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
  }

  async checkAndAwardMilestones(userId: string, stats: MilestoneCheckStats): Promise<MilestoneRecord[]> {
    const newlyAwarded: MilestoneRecord[] = [];
    const existingKeys = new Set(
      (await this.findByUser(userId)).map((m) => m.milestone_key)
    );

    for (const [key, def] of Object.entries(MILESTONE_DEFINITIONS)) {
      if (!existingKeys.has(key) && def.check(stats)) {
        const created = await this.create({
          userId,
          milestoneKey: key,
          title: def.title,
          description: def.description,
        });
        if (created) newlyAwarded.push(created);
      }
    }

    return newlyAwarded;
  }

  async countTotalByUser(userId: string): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM milestones WHERE user_id = $1', [userId]);
    return parseInt(result.rows[0].count, 10);
  }
}

export default new MilestoneModel();
