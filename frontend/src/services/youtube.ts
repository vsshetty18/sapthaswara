import { apiClient } from './api';

export interface YouTubeChannelStats {
  channelId: string;
  channelTitle: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  thumbnail: string;
}

export interface YouTubeVideoStats {
  videoId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
  thumbnail: string;
  duration: string;
}

export interface YouTubeAnalyticsData {
  channel: YouTubeChannelStats;
  topVideos: YouTubeVideoStats[];
  uploadFrequency: { videosPerWeek: number; videosPerMonth: number };
}

/**
 * NOTE: The frontend never calls the YouTube Data API directly — all requests
 * are proxied through the SvaraVerse backend (/api/analytics/youtube) so the
 * API key stays server-side and results are cached/snapshotted for analytics.
 */
export const youtubeService = {
  getAnalytics: (channelHandle?: string): Promise<{ success: boolean; data?: YouTubeAnalyticsData }> =>
    apiClient.get('/analytics/youtube', channelHandle ? { channel: channelHandle } : undefined),
};

export default youtubeService;
