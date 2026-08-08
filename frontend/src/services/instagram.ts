import { apiClient } from './api';

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
  thumbnailUrl?: string;
}

export interface InstagramBestPostingTime {
  hour: number;
  dayOfWeek: string;
  engagementScore: number;
}

export interface InstagramAnalyticsData {
  profile: InstagramProfileStats;
  bestPerforming: InstagramMediaStats[];
  bestPostingTimes: InstagramBestPostingTime[];
  accountInsights: {
    reach: number;
    profileViews: number;
    accountsEngaged: number;
  };
}

/**
 * NOTE: The frontend never calls the Instagram Graph API directly — all requests
 * are proxied through the SvaraVerse backend (/api/analytics/instagram) so the
 * access token stays server-side and results are snapshotted for analytics.
 */
export const instagramService = {
  getAnalytics: (handle?: string): Promise<{ success: boolean; data?: InstagramAnalyticsData }> =>
    apiClient.get('/analytics/instagram', handle ? { handle } : undefined),
};

export default instagramService;
