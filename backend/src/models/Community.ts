import { pool } from '../config/db';

export interface CommunityProfileRecord {
  id: string;
  user_id: string;
  profile_type: string;
  specialization: string[];
  location: string | null;
  is_available_for_collab: boolean;
  created_at: string;
}

export interface ConnectionRecord {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface MessageRecord {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface GroupRecord {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  created_by: string;
  created_at: string;
}

class CommunityModel {
  // Profiles
  async upsertProfile(input: {
    userId: string;
    profileType: string;
    specialization?: string[];
    location?: string;
    isAvailableForCollab?: boolean;
  }): Promise<CommunityProfileRecord> {
    const result = await pool.query(
      `INSERT INTO community_profiles (user_id, profile_type, specialization, location, is_available_for_collab)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         profile_type = EXCLUDED.profile_type,
         specialization = EXCLUDED.specialization,
         location = EXCLUDED.location,
         is_available_for_collab = EXCLUDED.is_available_for_collab
       RETURNING *`,
      [
        input.userId,
        input.profileType,
        input.specialization || [],
        input.location || null,
        input.isAvailableForCollab ?? true,
      ]
    );
    return result.rows[0];
  }

  async searchCreators(params: {
    search?: string;
    profileType?: string;
    location?: string;
    limit: number;
    offset: number;
  }): Promise<{ profiles: any[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (params.profileType) {
      conditions.push(`cp.profile_type = $${idx}`);
      values.push(params.profileType);
      idx++;
    }
    if (params.location) {
      conditions.push(`cp.location ILIKE $${idx}`);
      values.push(`%${params.location}%`);
      idx++;
    }
    if (params.search) {
      conditions.push(`(u.full_name ILIKE $${idx} OR u.username ILIKE $${idx})`);
      values.push(`%${params.search}%`);
      idx++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM community_profiles cp JOIN users u ON u.id = cp.user_id ${whereClause}`,
      values
    );

    const result = await pool.query(
      `SELECT cp.*, u.full_name, u.username, u.avatar_url
       FROM community_profiles cp
       JOIN users u ON u.id = cp.user_id
       ${whereClause}
       ORDER BY cp.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, params.limit, params.offset]
    );

    return { profiles: result.rows, total: parseInt(countResult.rows[0].count, 10) };
  }

  // Connections
  async createConnection(requesterId: string, recipientId: string): Promise<ConnectionRecord> {
    const result = await pool.query(
      `INSERT INTO connections (requester_id, recipient_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (requester_id, recipient_id) DO NOTHING
       RETURNING *`,
      [requesterId, recipientId]
    );
    return result.rows[0];
  }

  async updateConnectionStatus(id: string, recipientId: string, status: string): Promise<ConnectionRecord | null> {
    const result = await pool.query(
      `UPDATE connections SET status = $1 WHERE id = $2 AND recipient_id = $3 RETURNING *`,
      [status, id, recipientId]
    );
    return result.rows[0] || null;
  }

  async findConnectionsByUser(userId: string, status?: string): Promise<any[]> {
    const conditions = ['(requester_id = $1 OR recipient_id = $1)'];
    const values: any[] = [userId];
    if (status) {
      conditions.push('status = $2');
      values.push(status);
    }
    const result = await pool.query(
      `SELECT c.*, 
        CASE WHEN c.requester_id = $1 THEN ru.username ELSE su.username END as other_username
       FROM connections c
       JOIN users su ON su.id = c.requester_id
       JOIN users ru ON ru.id = c.recipient_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY c.created_at DESC`,
      values
    );
    return result.rows;
  }

  // Messages
  async sendMessage(senderId: string, recipientId: string, content: string): Promise<MessageRecord> {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, recipient_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [senderId, recipientId, content]
    );
    return result.rows[0];
  }

  async getMessageThread(userId: string, otherUserId: string, limit = 50): Promise<MessageRecord[]> {
    const result = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1)
       ORDER BY created_at DESC LIMIT $3`,
      [userId, otherUserId, limit]
    );
    return result.rows.reverse();
  }

  async markMessagesAsRead(userId: string, otherUserId: string): Promise<void> {
    await pool.query(
      `UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND recipient_id = $2 AND is_read = FALSE`,
      [otherUserId, userId]
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE recipient_id = $1 AND is_read = FALSE',
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  // Groups
  async createGroup(name: string, createdBy: string, description?: string, coverImageUrl?: string): Promise<GroupRecord> {
    const result = await pool.query(
      `INSERT INTO community_groups (name, description, cover_image_url, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, description || null, coverImageUrl || null, createdBy]
    );
    return result.rows[0];
  }

  async listGroups(limit = 20, offset = 0): Promise<GroupRecord[]> {
    const result = await pool.query(
      `SELECT g.*, COUNT(gm.user_id) as member_count
       FROM community_groups g
       LEFT JOIN group_members gm ON gm.group_id = g.id
       GROUP BY g.id
       ORDER BY g.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async joinGroup(groupId: string, userId: string): Promise<void> {
    await pool.query(
      `INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)
       ON CONFLICT (group_id, user_id) DO NOTHING`,
      [groupId, userId]
    );
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    await pool.query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );
  }

  // Likes & Comments
  async likeSong(userId: string, songId: string): Promise<boolean> {
    const result = await pool.query(
      `INSERT INTO post_likes (user_id, song_id) VALUES ($1, $2)
       ON CONFLICT (user_id, song_id) DO NOTHING RETURNING *`,
      [userId, songId]
    );
    return (result.rowCount || 0) > 0;
  }

  async unlikeSong(userId: string, songId: string): Promise<void> {
    await pool.query('DELETE FROM post_likes WHERE user_id = $1 AND song_id = $2', [userId, songId]);
  }

  async getSongLikeCount(songId: string): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM post_likes WHERE song_id = $1', [songId]);
    return parseInt(result.rows[0].count, 10);
  }

  async addComment(userId: string, songId: string, content: string): Promise<any> {
    const result = await pool.query(
      `INSERT INTO post_comments (user_id, song_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [userId, songId, content]
    );
    return result.rows[0];
  }

  async getComments(songId: string): Promise<any[]> {
    const result = await pool.query(
      `SELECT pc.*, u.username, u.avatar_url
       FROM post_comments pc
       JOIN users u ON u.id = pc.user_id
       WHERE pc.song_id = $1
       ORDER BY pc.created_at ASC`,
      [songId]
    );
    return result.rows;
  }
}

export default new CommunityModel();
