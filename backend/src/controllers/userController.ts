import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/User';
import { sanitizeInput } from '../utils/helpers';
import logger from '../utils/logger';

interface AuthedRequest extends Request {
  user?: { userId: string; role: string };
}

const sanitizeUser = (user: any) => {
  const { password_hash, ...safeUser } = user;
  return safeUser;
};

export const getMe = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const allowedFields = [
      'full_name',
      'bio',
      'avatar_url',
      'phone_number',
      'instagram_handle',
      'youtube_channel_id',
      'timezone',
      'theme_preference',
      'language_preference',
    ];

    const fieldMap: Record<string, string> = {
      fullName: 'full_name',
      bio: 'bio',
      avatarUrl: 'avatar_url',
      phoneNumber: 'phone_number',
      instagramHandle: 'instagram_handle',
      youtubeChannelId: 'youtube_channel_id',
      timezone: 'timezone',
      themePreference: 'theme_preference',
      languagePreference: 'language_preference',
    };

    const updates: Record<string, any> = {};
    for (const [camelKey, dbKey] of Object.entries(fieldMap)) {
      if (req.body[camelKey] !== undefined && allowedFields.includes(dbKey)) {
        updates[dbKey] = typeof req.body[camelKey] === 'string' ? sanitizeInput(req.body[camelKey]) : req.body[camelKey];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const updatedUser = await UserModel.updateById(req.user!.userId, updates);
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: sanitizeUser(updatedUser) });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Public profile — expose only safe fields
    const publicProfile = {
      id: user.id,
      fullName: user.full_name,
      username: user.username,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      role: user.role,
      instagramHandle: user.instagram_handle,
      youtubeChannelId: user.youtube_channel_id,
    };

    return res.status(200).json({ success: true, data: publicProfile });
  } catch (error) {
    next(error);
  }
};

export const deleteMe = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    await UserModel.deactivate(req.user!.userId);
    return res.status(200).json({ success: true, message: 'Account deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

export const registerFcmToken = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ success: false, message: 'fcmToken is required' });
    }

    await UserModel.addFcmToken(req.user!.userId, fcmToken);
    return res.status(200).json({ success: true, message: 'FCM token registered' });
  } catch (error) {
    next(error);
  }
};

export const removeFcmToken = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ success: false, message: 'fcmToken is required' });
    }

    await UserModel.removeFcmToken(req.user!.userId, fcmToken);
    return res.status(200).json({ success: true, message: 'FCM token removed' });
  } catch (error) {
    next(error);
  }
};
