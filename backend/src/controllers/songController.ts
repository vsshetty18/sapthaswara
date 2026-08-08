import { Request, Response, NextFunction } from 'express';
import SongModel from '../models/Song';
import PlaylistModel from '../models/Playlist';
import StorageService from '../services/storageService';
import { songSchema, playlistSchema, validateRequest } from '../utils/validators';
import { paginate, buildPaginationMeta } from '../utils/helpers';

interface AuthedRequest extends Request {
  user?: { userId: string; role: string };
  file?: Express.Multer.File;
}

export const getSongs = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = paginate(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );

    const tags = req.query.tags ? String(req.query.tags).split(',') : undefined;

    const { songs, total } = await SongModel.findMany({
      userId: req.user!.userId,
      status: req.query.status as string | undefined,
      mood: req.query.mood as string | undefined,
      language: req.query.language as string | undefined,
      difficulty: req.query.difficulty as string | undefined,
      search: req.query.search as string | undefined,
      tags,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
      page,
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: { items: songs, meta: buildPaginationMeta(total, page, limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const createSong = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const validation = validateRequest(songSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    let audioFileUrl: string | undefined;
    let audioFilePath: string | undefined;

    if (req.file) {
      if (!StorageService.validateFileType(req.file.mimetype, 'songs')) {
        return res.status(400).json({ success: false, message: 'Invalid audio file type' });
      }
      if (!StorageService.validateFileSize(req.file.size, 'songs')) {
        return res.status(400).json({ success: false, message: 'Audio file too large (max 50MB)' });
      }

      const uploadResult = await StorageService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        'songs',
        req.user!.userId,
        req.file.mimetype
      );
      audioFileUrl = uploadResult.publicUrl;
      audioFilePath = uploadResult.filePath;
    }

    const song = await SongModel.create({
      userId: req.user!.userId,
      ...validation.data,
      audioFileUrl,
      audioFilePath,
    });

    return res.status(201).json({ success: true, data: song });
  } catch (error) {
    next(error);
  }
};

export const getSongById = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const song = await SongModel.findByUserAndId(req.user!.userId, req.params.id);
    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }
    return res.status(200).json({ success: true, data: song });
  } catch (error) {
    next(error);
  }
};

export const updateSong = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await SongModel.findByUserAndId(req.user!.userId, req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    const fieldMap: Record<string, string> = {
      title: 'title',
      movie: 'movie',
      singer: 'singer',
      composer: 'composer',
      lyricist: 'lyricist',
      scale: 'scale',
      language: 'language',
      mood: 'mood',
      difficulty: 'difficulty',
      status: 'status',
      lyrics: 'lyrics',
      tags: 'tags',
      isFavourite: 'is_favourite',
      coverImageUrl: 'cover_image_url',
    };

    const updates: Record<string, any> = {};
    for (const [camelKey, dbKey] of Object.entries(fieldMap)) {
      if (req.body[camelKey] !== undefined) {
        updates[dbKey] = req.body[camelKey];
      }
    }

    const updatedSong = await SongModel.update(req.params.id, updates);
    return res.status(200).json({ success: true, data: updatedSong });
  } catch (error) {
    next(error);
  }
};

export const deleteSong = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const song = await SongModel.findByUserAndId(req.user!.userId, req.params.id);
    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    if (song.audio_file_path) {
      await StorageService.deleteFile(song.audio_file_path);
    }

    await SongModel.delete(req.params.id, req.user!.userId);
    return res.status(200).json({ success: true, message: 'Song deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const markPracticed = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const song = await SongModel.findByUserAndId(req.user!.userId, req.params.id);
    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }
    await SongModel.incrementPracticeCount(req.params.id);
    return res.status(200).json({ success: true, message: 'Practice logged' });
  } catch (error) {
    next(error);
  }
};

// Playlists

export const createPlaylist = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const validation = validateRequest(playlistSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    const playlist = await PlaylistModel.create({
      userId: req.user!.userId,
      name: validation.data.name,
      description: validation.data.description,
    });

    if (validation.data.songIds && validation.data.songIds.length > 0) {
      for (let i = 0; i < validation.data.songIds.length; i++) {
        await PlaylistModel.addSong(playlist.id, validation.data.songIds[i], i);
      }
    }

    return res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    next(error);
  }
};

export const getPlaylists = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const playlists = await SongModel.findPlaylistsByUser(req.user!.userId);
    return res.status(200).json({ success: true, data: playlists });
  } catch (error) {
    next(error);
  }
};

export const getPlaylistById = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const playlist = await PlaylistModel.findByUserAndId(req.user!.userId, req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    const songs = await PlaylistModel.getSongsInPlaylist(playlist.id);
    return res.status(200).json({ success: true, data: { ...playlist, songs } });
  } catch (error) {
    next(error);
  }
};

export const updatePlaylist = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const playlist = await PlaylistModel.findByUserAndId(req.user!.userId, req.params.id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    const updates: Record<string, any> = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.isPublic !== undefined) updates.is_public = req.body.isPublic;
    if (req.body.coverImageUrl !== undefined) updates.cover_image_url = req.body.coverImageUrl;

    if (Object.keys(updates).length > 0) {
      await PlaylistModel.update(playlist.id, updates);
    }

    if (req.body.addSongIds && Array.isArray(req.body.addSongIds)) {
      let count = await PlaylistModel.countSongsInPlaylist(playlist.id);
      for (const songId of req.body.addSongIds) {
        await PlaylistModel.addSong(playlist.id, songId, count);
        count++;
      }
    }

    if (req.body.removeSongIds && Array.isArray(req.body.removeSongIds)) {
      for (const songId of req.body.removeSongIds) {
        await PlaylistModel.removeSong(playlist.id, songId);
      }
    }

    const updatedPlaylist = await PlaylistModel.findById(playlist.id);
    const songs = await PlaylistModel.getSongsInPlaylist(playlist.id);

    return res.status(200).json({ success: true, data: { ...updatedPlaylist, songs } });
  } catch (error) {
    next(error);
  }
};

export const deletePlaylist = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const deleted = await PlaylistModel.delete(req.params.id, req.user!.userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }
    return res.status(200).json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error) {
    next(error);
  }
};
