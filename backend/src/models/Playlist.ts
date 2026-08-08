import { pool } from '../config/db';

export interface PlaylistRecord {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaylistSongRecord {
  id: string;
  playlist_id: string;
  song_id: string;
  position: number;
  added_at: string;
}

export interface CreatePlaylistInput {
  userId: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  isPublic?: boolean;
}

class PlaylistModel {
  async create(input: CreatePlaylistInput): Promise<PlaylistRecord> {
    const result = await pool.query(
      `INSERT INTO playlists (user_id, name, description, cover_image_url, is_public)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        input.userId,
        input.name,
        input.description || null,
        input.coverImageUrl || null,
        input.isPublic || false,
      ]
    );
    return result.rows[0];
  }

  async findById(id: string): Promise<PlaylistRecord | null> {
    const result = await pool.query('SELECT * FROM playlists WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findByUserAndId(userId: string, id: string): Promise<PlaylistRecord | null> {
    const result = await pool.query(
      'SELECT * FROM playlists WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  }

  async findAllByUser(userId: string): Promise<PlaylistRecord[]> {
    const result = await pool.query(
      'SELECT * FROM playlists WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  async findPublicPlaylists(limit = 20, offset = 0): Promise<PlaylistRecord[]> {
    const result = await pool.query(
      'SELECT * FROM playlists WHERE is_public = TRUE ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  async update(id: string, updates: Partial<Record<string, any>>): Promise<PlaylistRecord | null> {
    const keys = Object.keys(updates);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = keys.map((key) => updates[key]);

    const result = await pool.query(
      `UPDATE playlists SET ${setClauses} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM playlists WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount || 0) > 0;
  }

  async getSongsInPlaylist(playlistId: string): Promise<any[]> {
    const result = await pool.query(
      `SELECT s.*, ps.position, ps.added_at
       FROM playlist_songs ps
       JOIN songs s ON s.id = ps.song_id
       WHERE ps.playlist_id = $1
       ORDER BY ps.position ASC`,
      [playlistId]
    );
    return result.rows;
  }

  async addSong(playlistId: string, songId: string, position: number): Promise<PlaylistSongRecord> {
    const result = await pool.query(
      `INSERT INTO playlist_songs (playlist_id, song_id, position)
       VALUES ($1, $2, $3)
       ON CONFLICT (playlist_id, song_id) DO UPDATE SET position = $3
       RETURNING *`,
      [playlistId, songId, position]
    );
    return result.rows[0];
  }

  async removeSong(playlistId: string, songId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      [playlistId, songId]
    );
    return (result.rowCount || 0) > 0;
  }

  async reorderSongs(playlistId: string, songOrder: { songId: string; position: number }[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of songOrder) {
        await client.query(
          'UPDATE playlist_songs SET position = $1 WHERE playlist_id = $2 AND song_id = $3',
          [item.position, playlistId, item.songId]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async countSongsInPlaylist(playlistId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) FROM playlist_songs WHERE playlist_id = $1',
      [playlistId]
    );
    return parseInt(result.rows[0].count, 10);
  }
}

export default new PlaylistModel();
