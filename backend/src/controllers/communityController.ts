import { Request, Response, NextFunction } from 'express';
import CommunityModel from '../models/Community';
import { communityMessageSchema, validateRequest } from '../utils/validators';
import { paginate, buildPaginationMeta, sanitizeInput } from '../utils/helpers';

interface AuthedRequest extends Request {
  user?: { userId: string; role: string };
}

export const searchCreators = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = paginate(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );

    const { profiles, total } = await CommunityModel.searchCreators({
      search: req.query.search as string | undefined,
      profileType: req.query.specialization as string | undefined,
      location: req.query.location as string | undefined,
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      data: { items: profiles, meta: buildPaginationMeta(total, page, limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const sendConnectionRequest = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const { recipientId } = req.body;
    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'recipientId is required' });
    }
    if (recipientId === req.user!.userId) {
      return res.status(400).json({ success: false, message: 'Cannot connect with yourself' });
    }

    const connection = await CommunityModel.createConnection(req.user!.userId, recipientId);
    if (!connection) {
      return res.status(409).json({ success: false, message: 'Connection request already exists' });
    }

    return res.status(201).json({ success: true, data: connection });
  } catch (error) {
    next(error);
  }
};

export const respondToConnection = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Use "accepted" or "blocked"' });
    }

    const updated = await CommunityModel.updateConnectionStatus(req.params.id, req.user!.userId, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const getConnections = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const connections = await CommunityModel.findConnectionsByUser(req.user!.userId, status);
    return res.status(200).json({ success: true, data: connections });
  } catch (error) {
    next(error);
  }
};

export const getMessageThread = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const otherUserId = req.params.userId;
    const messages = await CommunityModel.getMessageThread(req.user!.userId, otherUserId);
    await CommunityModel.markMessagesAsRead(req.user!.userId, otherUserId);
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const validation = validateRequest(communityMessageSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: validation.errors });
    }

    const { recipientId, content } = validation.data;
    const message = await CommunityModel.sendMessage(
      req.user!.userId,
      recipientId,
      sanitizeInput(content)
    );

    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

export const getGroups = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, offset } = paginate(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );
    const groups = await CommunityModel.listGroups(limit, offset);
    return res.status(200).json({ success: true, data: groups });
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, coverImageUrl } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    const group = await CommunityModel.createGroup(name, req.user!.userId, description, coverImageUrl);
    await CommunityModel.joinGroup(group.id, req.user!.userId);

    return res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

export const joinGroup = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    await CommunityModel.joinGroup(req.params.id, req.user!.userId);
    return res.status(200).json({ success: true, message: 'Joined group successfully' });
  } catch (error) {
    next(error);
  }
};

export const likeSong = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const liked = await CommunityModel.likeSong(req.user!.userId, req.params.songId);
    const likeCount = await CommunityModel.getSongLikeCount(req.params.songId);
    return res.status(200).json({ success: true, data: { liked, likeCount } });
  } catch (error) {
    next(error);
  }
};

export const unlikeSong = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    await CommunityModel.unlikeSong(req.user!.userId, req.params.songId);
    const likeCount = await CommunityModel.getSongLikeCount(req.params.songId);
    return res.status(200).json({ success: true, data: { likeCount } });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const comment = await CommunityModel.addComment(req.user!.userId, req.params.songId, sanitizeInput(content));
    return res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const comments = await CommunityModel.getComments(req.params.songId);
    return res.status(200).json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};
