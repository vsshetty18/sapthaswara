import axios from 'axios';
import logger from '../utils/logger';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

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

class YouTubeService {
  private client = axios.create({
    baseURL: YOUTUBE_API_BASE,
    params: { key: YOUTUBE_API_KEY },
  });

  async getChannelByHandle(handle: string): Promise<YouTubeChannelStats | null> {
    try {
      const cleanHandle = handle.replace('@', '');
      const searchRes = await this.client.get('/channels', {
        params: { forHandle: `@${cleanHandle}`, part: 'snippet,statistics' },
      });

      const channel = searchRes.data.items?.[0];
      if (!channel) return null;

      return {
        channelId: channel.id,
        channelTitle: channel.snippet.title,
        subscribers: parseInt(channel.statistics.subscriberCount || '0', 10),
        totalViews: parseInt(channel.statistics.viewCount || '0', 10),
        videoCount: parseInt(channel.statistics.videoCount || '0', 10),
        thumbnail: channel.snippet.thumbnails?.high?.url || '',
      };
    } catch (error: any) {
      logger.error('YouTube getChannelByHandle error', { error: error.message });
      return null;
    }
  }

  async getChannelById(channelId: string): Promise<YouTubeChannelStats | null> {
    try {
      const res = await this.client.get('/channels', {
        params: { id: channelId, part: 'snippet,statistics' },
      });
      const channel = res.data.items?.[0];
      if (!channel) return null;

      return {
        channelId: channel.id,
        channelTitle: channel.snippet.title,
        subscribers: parseInt(channel.statistics.subscriberCount || '0', 10),
        totalViews: parseInt(channel.statistics.viewCount || '0', 10),
        videoCount: parseInt(channel.statistics.videoCount || '0', 10),
        thumbnail: channel.snippet.thumbnails?.high?.url || '',
      };
    } catch (error: any) {
      logger.error('YouTube getChannelById error', { error: error.message });
      return null;
    }
  }

  async getTopVideos(channelId: string, maxResults = 10): Promise<YouTubeVideoStats[]> {
    try {
      const uploadsPlaylistId = channelId.replace(/^UC/, 'UU');

      const playlistRes = await this.client.get('/playlistItems', {
        params: {
          playlistId: uploadsPlaylistId,
          part: 'snippet',
          maxResults: 50,
        },
      });

      const videoIds = (playlistRes.data.items || [])
        .map((item: any) => item.snippet.resourceId.videoId)
        .join(',');

      if (!videoIds) return [];

      const videosRes = await this.client.get('/videos', {
        params: {
          id: videoIds,
          part: 'snippet,statistics,contentDetails',
        },
      });

      const videos: YouTubeVideoStats[] = (videosRes.data.items || []).map((v: any) => ({
        videoId: v.id,
        title: v.snippet.title,
        views: parseInt(v.statistics.viewCount || '0', 10),
        likes: parseInt(v.statistics.likeCount || '0', 10),
        comments: parseInt(v.statistics.commentCount || '0', 10),
        publishedAt: v.snippet.publishedAt,
        thumbnail: v.snippet.thumbnails?.high?.url || '',
        duration: v.contentDetails.duration,
      }));

      return videos.sort((a, b) => b.views - a.views).slice(0, maxResults);
    } catch (error: any) {
      logger.error('YouTube getTopVideos error', { error: error.message });
      return [];
    }
  }

  async getUploadFrequency(channelId: string): Promise<{ videosPerWeek: number; videosPerMonth: number }> {
    try {
      const uploadsPlaylistId = channelId.replace(/^UC/, 'UU');
      const playlistRes = await this.client.get('/playlistItems', {
        params: {
          playlistId: uploadsPlaylistId,
          part: 'snippet',
          maxResults: 50,
        },
      });

      const dates = (playlistRes.data.items || []).map(
        (item: any) => new Date(item.snippet.publishedAt)
      );

      if (dates.length < 2) return { videosPerWeek: 0, videosPerMonth: 0 };

      dates.sort((a: Date, b: Date) => b.getTime() - a.getTime());
      const oldestDate = dates[dates.length - 1];
      const daysDiff = Math.max(
        1,
        (dates[0].getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const videosPerWeek = (dates.length / daysDiff) * 7;
      const videosPerMonth = (dates.length / daysDiff) * 30;

      return {
        videosPerWeek: parseFloat(videosPerWeek.toFixed(2)),
        videosPerMonth: parseFloat(videosPerMonth.toFixed(2)),
      };
    } catch (error: any) {
      logger.error('YouTube getUploadFrequency error', { error: error.message });
      return { videosPerWeek: 0, videosPerMonth: 0 };
    }
  }

  calculateEngagementRate(video: YouTubeVideoStats): number {
    if (video.views === 0) return 0;
    return parseFloat((((video.likes + video.comments) / video.views) * 100).toFixed(2));
  }

  calculateCTRProxy(videos: YouTubeVideoStats[]): number {
    if (videos.length === 0) return 0;
    const avgViews = videos.reduce((sum, v) => sum + v.views, 0) / videos.length;
    return parseFloat(avgViews.toFixed(0));
  }
}

export default new YouTubeService();
