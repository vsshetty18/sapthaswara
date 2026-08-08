import { pool } from '../config/db';

export interface ReminderRecord {
  id: string;
  user_id: string;
  type:
    | 'practice'
    | 'live_session'
    | 'collaboration'
    | 'competition'
    | 'studio_booking'
    | 'recording'
    | 'birthday'
    | 'festival';
  title: string;
  description: string | null;
  scheduled_time: string;
  is_recurring: boolean;
  recurrence_pattern: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none' | null;
  is_sent: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderInput {
  userId: string;
  type: string;
  title: string;
  description?: string;
  scheduledTime: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

class ReminderModel {
  async create(input: CreateReminderInput): Promise<ReminderRecord> {
    const result = await pool.query(
      `INSERT INTO reminders (user_id, type, title, description, scheduled_time, is_recurring, recurrence_pattern)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        input.userId,
        input.type,
        input.title,
        input.description || null,
        input.scheduledTime,
        input.isRecurring || false,
        input.recurrencePattern || 'none',
      ]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<ReminderRecord | null> {
    const result = await pool.query('SELECT * FROM reminders WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findByUserAndId(userId: string, id: string): Promise<ReminderRecord | null> {
    const result = await pool.query(
      'SELECT * FROM reminders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  }

  async findActiveByUser(userId: string): Promise<ReminderRecord[]> {
    const result = await pool.query(
      `SELECT * FROM reminders WHERE user_id = $1 AND is_active = TRUE ORDER BY scheduled_time ASC`,
      [userId]
    );
    return result.rows;
  }

  async findDueReminders(withinMinutes = 5): Promise<ReminderRecord[]> {
    const result = await pool.query(
      `SELECT * FROM reminders
       WHERE is_active = TRUE AND is_sent = FALSE
       AND scheduled_time <= NOW() + INTERVAL '${withinMinutes} minutes'
       AND scheduled_time >= NOW() - INTERVAL '${withinMinutes} minutes'`
    );
    return result.rows;
  }

  async update(id: string, updates: Partial<Record<string, any>>): Promise<ReminderRecord | null> {
    const keys = Object.keys(updates);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = keys.map((key) => updates[key]);

    const result = await pool.query(
      `UPDATE reminders SET ${setClauses} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  }

  async markAsSent(id: string): Promise<void> {
    await pool.query('UPDATE reminders SET is_sent = TRUE WHERE id = $1', [id]);
  }

  async rescheduleRecurring(id: string, nextTime: string): Promise<void> {
    await pool.query(
      'UPDATE reminders SET scheduled_time = $1, is_sent = FALSE WHERE id = $2',
      [nextTime, id]
    );
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM reminders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount || 0) > 0;
  }

  async deactivate(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'UPDATE reminders SET is_active = FALSE WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount || 0) > 0;
  }

  // Planner tasks (co-located here for simplicity of daily-planning domain)
  async createPlannerTask(input: {
    userId: string;
    title: string;
    category: string;
    notes?: string;
    scheduledDate?: string;
  }): Promise<any> {
    const result = await pool.query(
      `INSERT INTO planner_tasks (user_id, title, category, notes, scheduled_date)
       VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE))
       RETURNING *`,
      [input.userId, input.title, input.category, input.notes || null, input.scheduledDate || null]
    );
    return result.rows[0];
  }

  async findPlannerTasksByDate(userId: string, date: string): Promise<any[]> {
    const result = await pool.query(
      `SELECT * FROM planner_tasks WHERE user_id = $1 AND scheduled_date = $2 ORDER BY created_at ASC`,
      [userId, date]
    );
    return result.rows;
  }

  async updatePlannerTask(id: string, userId: string, updates: Partial<Record<string, any>>): Promise<any> {
    const keys = Object.keys(updates);
    if (keys.length === 0) return null;

    const setClauses = keys.map((key, i) => `${key} = $${i + 3}`).join(', ');
    const values = keys.map((key) => updates[key]);

    const result = await pool.query(
      `UPDATE planner_tasks SET ${setClauses} WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId, ...values]
    );
    return result.rows[0] || null;
  }

  async completePlannerTask(id: string, userId: string): Promise<any> {
    const result = await pool.query(
      `UPDATE planner_tasks SET is_completed = TRUE, completed_at = NOW()
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return result.rows[0] || null;
  }

  async deletePlannerTask(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM planner_tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount || 0) > 0;
  }

  async getPlannerProgress(userId: string, date: string): Promise<{ total: number; completed: number; percentage: number }> {
    const result = await pool.query(
      `SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_completed = TRUE) as completed
       FROM planner_tasks WHERE user_id = $1 AND scheduled_date = $2`,
      [userId, date]
    );
    const total = parseInt(result.rows[0].total, 10);
    const completed = parseInt(result.rows[0].completed, 10);
    return {
      total,
      completed,
      percentage: total === 0 ? 0 : parseFloat(((completed / total) * 100).toFixed(2)),
    };
  }
}

export default new ReminderModel();
