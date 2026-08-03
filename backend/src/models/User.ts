import { pool } from '../config/db';

export interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  username: string;
  password_hash: string | null;
  firebase_uid: string | null;
  role: 'user' | 'creator' | 'premium' | 'admin' | 'owner';
  avatar_url: string | null;
  bio: string | null;
  phone_number: string | null;
  is_email_verified: boolean;
  is_active: boolean;
  auth_provider: string;
  instagram_handle: string | null;
  youtube_channel_id: string | null;
  fcm_tokens: string[];
  timezone: string;
  theme_preference: string;
  language_preference: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  username: string;
  passwordHash?: string | null;
  firebaseUid?: string | null;
  authProvider?: string;
  isEmailVerified?: boolean;
}

class UserModel {
  async create(input: CreateUserInput): Promise<UserRecord> {
    const result = await pool.query(
      `INSERT INTO users (full_name, email, username, password_hash, firebase_uid, auth_provider, is_email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        input.fullName,
        input.email,
        input.username,
        input.passwordHash || null,
        input.firebaseUid || null,
        input.authProvider || 'email',
        input.isEmailVerified || false,
      ]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<UserRecord | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  async findByEmailOrUsername(identifier: string): Promise<UserRecord | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $1',
      [identifier]
    );
    return result.rows[0] || null;
  }

  async findByFirebaseUid(firebaseUid: string): Promise<UserRecord | null> {
    const result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [firebaseUid]);
    return result.rows[0] || null;
  }

  async updateById(id: string, updates: Partial<Record<string, any>>): Promise<UserRecord | null> {
    const keys = Object.keys(updates);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((key, idx) => `${key} = $${idx + 2}`).join(', ');
    const values = keys.map((key) => updates[key]);

    const result = await pool.query(
      `UPDATE users SET ${setClauses} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
  }

  async updateLastLogin(id: string): Promise<void> {
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [id]);
  }

  async addFcmToken(id: string, token: string): Promise<void> {
    await pool.query(
      `UPDATE users SET fcm_tokens = array_append(fcm_tokens, $2)
       WHERE id = $1 AND NOT ($2 = ANY(fcm_tokens))`,
      [id, token]
    );
  }

  async removeFcmToken(id: string, token: string): Promise<void> {
    await pool.query(
      'UPDATE users SET fcm_tokens = array_remove(fcm_tokens, $2) WHERE id = $1',
      [id, token]
    );
  }

  async verifyEmail(id: string): Promise<void> {
    await pool.query('UPDATE users SET is_email_verified = TRUE WHERE id = $1', [id]);
  }

  async deactivate(id: string): Promise<void> {
    await pool.query('UPDATE users SET is_active = FALSE WHERE id = $1', [id]);
  }

  async findMany(params: {
    role?: string;
    page: number;
    limit: number;
    offset: number;
  }): Promise<{ users: UserRecord[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (params.role) {
      conditions.push(`role = $${idx}`);
      values.push(params.role);
      idx++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      values
    );

    const usersResult = await pool.query(
      `SELECT * FROM users ${whereClause} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, params.limit, params.offset]
    );

    return {
      users: usersResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async countByRole(role: string): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', [role]);
    return parseInt(result.rows[0].count, 10);
  }

  async countTotal(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count, 10);
  }

  async countActiveToday(): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(DISTINCT user_id) FROM app_sessions WHERE session_start >= CURRENT_DATE`
    );
    return parseInt(result.rows[0].count, 10);
  }

  async countActiveThisMonth(): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(DISTINCT user_id) FROM app_sessions WHERE session_start >= date_trunc('month', CURRENT_DATE)`
    );
    return parseInt(result.rows[0].count, 10);
  }
}

export default new UserModel();
