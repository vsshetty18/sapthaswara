import { Request, Response, NextFunction } from 'express';
import AnalyticsModel from '../models/Analytics';
import SongModel from '../models/Song';
import UserModel from '../models/User';
import YouTubeService from '../services/youtubeService';
import InstagramService from '../services/instagramService';
import { getDateRange, calculateStreak } from '../utils/helpers';
import { pool } from '../config/db';
import logger from '../utils/logger';

interface AuthedRequest extends Request {
  user?: { userId: string; role: string };
}

export const getDashboardSummary = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const [
      songsCompleted,
      songsNeedImprovement,
      totalSongs,
      latestPerformance,
      igSnapshot,
      ytSnapshot,
      practiceRows,
    ] = await Promise.all([
      SongModel.countByUserAndStatus(userId, 'posted'),
      SongModel.countByUserAndStatus(userId, 'need_improvement'),
      SongModel.countByUser(userId),
      AnalyticsModel.getLatestPerformanceMetric(userId),
      AnalyticsModel.getLatestSnapshot(userId, 'instagram'),
      AnalyticsModel.getLatestSnapshot(userId, 'youtube'),
      pool.query(
        `SELECT DISTINCT last_practiced_at::date as date FROM songs WHERE user_id = $1 AND last_practiced_at IS NOT NULL`,
        [userId]
      ),
    ]);

    const practiceDates = practiceRows.rows.map((r: any) => new Date(r.date));
    const currentStreak = calculateStreak(practiceDates);

    return res.status(200).json({
      success: true,
      data: {
        songsCompleted,
        songsRemaining: songsNeedImprovement,
        totalSongs,
        currentStreak,
        followers: igSnapshot?.followers || 0,
        subscribers: ytSnapshot?.subscribers || 0,
        views: ytSnapshot?.views || 0,
        hoursPracticed: latestPerformance?.hours_practiced || 0,
        uploads: latestPerformance?.uploads_count || 0,
        performanceScore: latestPerformance?.performance_score || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getInstagramAnalytics = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const handle = (req.query.handle as string) || undefined;
    const user = await UserModel.findById(req.user!.userId);
    const igHandle = handle || user?.instagram_handle;

    if (!igHandle) {
      return res.status(400).json({ success: false, message: 'No Instagram handle connected' });
    }

    const profile = await InstagramService.getProfileByUsername(igHandle);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Instagram profile not found or not accessible' });
    }

    const media = await InstagramService.getRecentMedia(profile.igUserId);
    const bestPerforming = InstagramService.findBestPerformingMedia(media);
    const bestTimes = InstagramService.analyzeBestPostingTime(media);
    const accountInsights = await InstagramService.getAccountInsights(profile.igUserId);

    await AnalyticsModel.createSnapshot({
      userId: req.user!.userId,
      platform: 'instagram',
      followers: profile.followersCount,
      reach: accountInsights.reach,
      likes: media.reduce((sum, m) => sum + m.likeCount, 0),
      comments: media.reduce((sum, m) => sum + m.commentsCount, 0),
      rawData: { profile, accountInsights },
    });

    return res.status(200).json({
      success: true,
      data: { profile, bestPerforming, bestPostingTimes: bestTimes, accountInsights },
    });
  } catch (error) {
    next(error);
  }
};

export const getYouTubeAnalytics = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const channelHandle = (req.query.channel as string) || undefined;
    const user = await UserModel.findById(req.user!.userId);
    const channelId = channelHandle || user?.youtube_channel_id;

    if (!channelId) {
      return res.status(400).json({ success: false, message: 'No YouTube channel connected' });
    }

    const channel = channelId.startsWith('UC')
      ? await YouTubeService.getChannelById(channelId)
      : await YouTubeService.getChannelByHandle(channelId);

    if (!channel) {
      return res.status(404).json({ success: false, message: 'YouTube channel not found' });
    }

    const topVideos = await YouTubeService.getTopVideos(channel.channelId);
    const uploadFrequency = await YouTubeService.getUploadFrequency(channel.channelId);
    const ctrProxy = YouTubeService.calculateCTRProxy(topVideos);

    await AnalyticsModel.createSnapshot({
      userId: req.user!.userId,
      platform: 'youtube',
      subscribers: channel.subscribers,
      views: channel.totalViews,
      ctr: ctrProxy,
      rawData: { channel, uploadFrequency },
    });

    return res.status(200).json({
      success: true,
      data: { channel, topVideos, uploadFrequency },
    });
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as 'day' | 'week' | 'month' | 'year') || 'week';
    const dbPeriod = period === 'day' ? 'day' : period === 'week' ? 'week' : period === 'month' ? 'month' : 'year';
    const { start, end } = getDateRange(dbPeriod as any);

    const [performanceMetrics, igSnapshots, ytSnapshots] = await Promise.all([
      AnalyticsModel.getPerformanceMetricsInRange(req.user!.userId, start, end),
      AnalyticsModel.getSnapshotsInRange(req.user!.userId, 'instagram', start, end),
      AnalyticsModel.getSnapshotsInRange(req.user!.userId, 'youtube', start, end),
    ]);

    return res.status(200).json({
      success: true,
      data: { period, performanceMetrics, instagram: igSnapshots, youtube: ytSnapshots },
    });
  } catch (error) {
    next(error);
  }
};

export const getHeatmap = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const { start, end } = getDateRange('year');
    const heatmapData = await AnalyticsModel.getHeatmapData(req.user!.userId, start, end);
    return res.status(200).json({ success: true, data: heatmapData });
  } catch (error) {
    next(error);
  }
};
