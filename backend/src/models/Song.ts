import { pool } from '../config/db';

export interface SongRecord {
  id: string;
  user_id: string;
  title: string;
  movie: string | null;
  singer: string | null;
  composer: string | null;
  lyricist: string | null;
  scale: string | null;
  language: string | null;
  mood: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'practiced' | 'recorded' | 'posted' | 'need_improvement' | 'favourite';
  lyrics: string | null;
  audio_file_url: string | null;
  audio_file_path: string | null;
  cover_image_url: string | null;
  duration_seconds: number | null;
  tags: string[];
  is_favourite: boolean;
  practice_count: number;
  last_practiced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SongFilters {
  userId: string;
  status?: string;
  mood?: string;
  language?: string;
  difficulty?: string;
  search?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
  offset: number;
}

export interface CreateSongInput {
  userId: string;
  title: string;
  movie?: string;
  singer?: string;
  composer?: string;
  lyricist?: string;
  scale?: string;
  language?: string;
  mood?: string;
  difficulty?: string;
  status?: string;
  lyrics?: string;
  audioFileUrl?: string;
  audioFilePath?: string;
  coverImageUrl?: string;
  durationSeconds?: number;
  tags?: string[];
}

class SongModel {
  async create(input: CreateSongInput): Promise<SongRecord> {
    const result = await pool.query(
      `INSERT INTO songs
        (user_id, title, movie, singer, composer, lyricist, scale, language, mood,
         difficulty, status, lyrics, audio_file_url, audio_file_path, cover_image_url,
         duration_seconds, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [
        input.userId,
        input.title,
        input.movie || null,
        input.singer || null,
        input.composer || null,
        input.lyricist || null,
        input.scale || null,
        input.language || null,
        input.mood || null,
        input.difficulty || 'intermediate',
        input.status || 'need_improvement',
        input.lyrics || null,
        input.audioFileUrl || null,
        input.audioFilePath || null,
        input.coverImageUrl || null,
        input.durationSeconds || null,
        input.tags || [],
      ]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<SongRecord | null> {
    const result = await pool.query('SELECT * FROM songs WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findByUserAndId(userId: string, id: string): Promise<SongRecord | null> {
    const result = await pool.query(
      'SELECT * FROM songs WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  }

  async findMany(filters: SongFilters): Promise<{ songs: SongRecord[]; total: number }> {
    const conditions: string[] = ['user_id = $1'];
    const values: any[] = [filters.userId];
    let idx = 2;

    if (filters.status) {
      conditions.push(`status = $${idx}`);
      values.push(filters.status);
      idx++;
    }
    if (filters.mood) {
      conditions.push(`mood = $${idx}`);
      values.push(filters.mood);
      idx++;
    }
    if (filters.language) {
      conditions.push(`language = $${idx}`);
      values.push(filters.language);
      idx++;
    }
    if (filters.difficulty) {
      conditions.push(`difficulty = $${idx}`);
      values.push(filters.difficulty);
      idx++;
    }
    if (filters.search) {
      conditions.push(`to_tsvector('english', title) @@ plainto_tsquery('english', $${idx})`);
      values.push(filters.search);
      idx++;
    }
    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`tags && $${idx}`);
      values.push(filters.tags);
      idx++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const sortColumn = ['title', 'created_at', 'updated_at', 'practice_count'].includes(
      filters.sortBy || ''
    )
      ? filters.sortBy
      : 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countResult = await pool.query(`SELECT COUNT(*) FROM songs ${whereClause}`, values);

    const songsResult = await pool.query(
      `SELECT * FROM songs ${whereClause} ORDER BY ${sortColumn} ${sortOrder} LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, filters.limit, filters.offset]
    );

    return {
      songs: songsResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  async update(id: string, updates: Partial<Record<string, any>>): Promise<SongRecord | null> {
    const keys = Object.keys(updates);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = keys.map((key) => updates[key]);

    const result = await pool.query(
      `UPDATE songs SET ${setClauses} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM songs WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount || 0) > 0;
  }

  async incrementPracticeCount(id: string): Promise<void> {
    await pool.query(
      `UPDATE songs SET practice_count = practice_count + 1, last_practiced_at = NOW() WHERE id = $1`,
      [id]
    );
  }

  async countByUserAndStatus(userId: string, status: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM songs WHERE user_id = $1 AND status = $2',
      [userId, status]
    );
    return parseInt(result.rows[0].count, 10);
  }

  async countByUser(userId: string): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM songs WHERE user_id = $1', [userId]);
    return parseInt(result.rows[0].count, 10);
  }

  async getMostPopular(limit = 10): Promise<{ title: string; total_practice: number }[]> {
    const result = await pool.query(
      `SELECT title, SUM(practice_count) as total_practice
       FROM songs GROUP BY title ORDER BY total_practice DESC LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  // Playlist operations
  async createPlaylist(userId: string, name: string, description?: string): Promise<any> {
    const result = await pool.query(
      `INSERT INTO playlists (user_id, name, description) VALUES ($1, $2, $3) RETURNING *`,
      [userId, name, description || null]
    );
    return result.rows[0];
  }

  async findPlaylistsByUser(userId: string): Promise<any[]> {
    const result = await pool.query(
      `SELECT p.*, COUNT(ps.song_id) as song_count
       FROM playlists p
       LEFT JOIN playlist_songs ps ON ps.playlist_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async addSongToPlaylist(playlistId: string, songId: string, position = 0): Promise<void> {
    await pool.query(
      `INSERT INTO playlist_songs (playlist_id, song_id, position)
       VALUES ($1, $2, $3) ON CONFLICT (playlist_id, song_id) DO NOTHING`,
      [playlistId, songId, position]
    );
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    await pool.query(
      'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      [playlistId, songId]
    );
  }

  async deletePlaylist(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM playlists WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount || 0) > 0;
  }
}

export default new SongModel();
