import axios from 'axios';
import logger from '../utils/logger';

const INSTAGRAM_GRAPH_API_BASE = 'https://graph.facebook.com/v19.0';
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || '';

export interface InstagramProfileStats {
  igUserId: string;
  username: string;
  followersCount: number;
  followsCount: number;
  mediaCount: number;
  profilePictureUrl: string;
}

export interface InstagramMediaStats {
  mediaId: string;
  caption: string;
  mediaType: string;
  permalink: string;
  timestamp: string;
  likeCount: number;
  commentsCount: number;
  reach?: number;
  impressions?: number;
  saved?: number;
  shares?: number;
  thumbnailUrl?: string;
}

class InstagramService {
  private client = axios.create({
    baseURL: INSTAGRAM_GRAPH_API_BASE,
    params: { access_token: INSTAGRAM_ACCESS_TOKEN },
  });

  async getProfileByUsername(igUserId: string): Promise<InstagramProfileStats | null> {
    try {
      const res = await this.client.get(`/${igUserId}`, {
        params: {
          fields: 'id,username,followers_count,follows_count,media_count,profile_picture_url',
        },
      });

      const data = res.data;
      return {
        igUserId: data.id,
        username: data.username,
        followersCount: data.followers_count || 0,
        followsCount: data.follows_count || 0,
        mediaCount: data.media_count || 0,
        profilePictureUrl: data.profile_picture_url || '',
      };
    } catch (error: any) {
      logger.error('Instagram getProfileByUsername error', { error: error.message });
      return null;
    }
  }

  async getRecentMedia(igUserId: string, limit = 25): Promise<InstagramMediaStats[]> {
    try {
      const res = await this.client.get(`/${igUserId}/media`, {
        params: {
          fields: 'id,caption,media_type,permalink,timestamp,like_count,comments_count,thumbnail_url',
          limit,
        },
      });

      return (res.data.data || []).map((item: any) => ({
        mediaId: item.id,
        caption: item.caption || '',
        mediaType: item.media_type,
        permalink: item.permalink,
        timestamp: item.timestamp,
        likeCount: item.like_count || 0,
        commentsCount: item.comments_count || 0,
        thumbnailUrl: item.thumbnail_url,
      }));
    } catch (error: any) {
      logger.error('Instagram getRecentMedia error', { error: error.message });
      return [];
    }
  }

  async getMediaInsights(mediaId: string): Promise<{
    reach: number;
    impressions: number;
    saved: number;
    shares: number;
  }> {
    try {
      const res = await this.client.get(`/${mediaId}/insights`, {
        params: { metric: 'reach,impressions,saved,shares' },
      });

      const insights: Record<string, number> = {};
      (res.data.data || []).forEach((metric: any) => {
        insights[metric.name] = metric.values?.[0]?.value || 0;
      });

      return {
        reach: insights.reach || 0,
        impressions: insights.impressions || 0,
        saved: insights.saved || 0,
        shares: insights.shares || 0,
      };
    } catch (error: any) {
      logger.error('Instagram getMediaInsights error', { error: error.message });
      return { reach: 0, impressions: 0, saved: 0, shares: 0 };
    }
  }

  async getAccountInsights(
    igUserId: string,
    period: 'day' | 'week' | 'days_28' = 'week'
  ): Promise<{
    reach: number;
    profileViews: number;
    accountsEngaged: number;
  }> {
    try {
      const res = await this.client.get(`/${igUserId}/insights`, {
        params: {
          metric: 'reach,profile_views,accounts_engaged',
          period,
        },
      });

      const insights: Record<string, number> = {};
      (res.data.data || []).forEach((metric: any) => {
        const total = metric.values?.reduce((sum: number, v: any) => sum + (v.value || 0), 0) || 0;
        insights[metric.name] = total;
      });

      return {
        reach: insights.reach || 0,
        profileViews: insights.profile_views || 0,
        accountsEngaged: insights.accounts_engaged || 0,
      };
    } catch (error: any) {
      logger.error('Instagram getAccountInsights error', { error: error.message });
      return { reach: 0, profileViews: 0, accountsEngaged: 0 };
    }
  }

  calculateEngagementRate(media: InstagramMediaStats, followersCount: number): number {
    if (followersCount === 0) return 0;
    return parseFloat((((media.likeCount + media.commentsCount) / followersCount) * 100).toFixed(2));
  }

  findBestPerformingMedia(mediaList: InstagramMediaStats[], limit = 5): InstagramMediaStats[] {
    return [...mediaList]
      .sort((a, b) => (b.likeCount + b.commentsCount) - (a.likeCount + a.commentsCount))
      .slice(0, limit);
  }

  analyzeBestPostingTime(mediaList: InstagramMediaStats[]): { hour: number; dayOfWeek: string; engagementScore: number }[] {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const buckets: Record<string, { total: number; count: number }> = {};

    mediaList.forEach((media) => {
      const date = new Date(media.timestamp);
      const hour = date.getHours();
      const day = dayNames[date.getDay()];
      const key = `${day}-${hour}`;
      const engagement = media.likeCount + media.commentsCount;

      if (!buckets[key]) buckets[key] = { total: 0, count: 0 };
      buckets[key].total += engagement;
      buckets[key].count += 1;
    });

    return Object.entries(buckets)
      .map(([key, val]) => {
        const [dayOfWeek, hourStr] = key.split('-');
        return {
          dayOfWeek,
          hour: parseInt(hourStr, 10),
          engagementScore: parseFloat((val.total / val.count).toFixed(2)),
        };
      })
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 5);
  }
}

export default new InstagramService();
