import { apiClient } from './api';
import type { AICoachResponse } from '@/types';

/**
 * NOTE: The frontend never calls OpenAI directly — all AI requests are proxied
 * through the SvaraVerse backend (/api/ai/*) so the API key stays server-side
 * and usage/cost can be logged and rate-limited per user.
 */

export const aiCoachService = {
  suggestSong: (): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/suggest-song'),

  suggestPractice: (): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/suggest-practice'),

  trendingSong: (language?: string): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/trending-song', { language }),

  hashtags: (songTitle: string, mood?: string, language?: string): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/hashtags', { songTitle, mood, language }),

  uploadTiming: (): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/upload-timing'),

  caption: (songTitle: string, mood?: string, tone?: string): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/caption', { songTitle, mood, tone }),

  thumbnailIdeas: (songTitle: string): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/thumbnail-ideas', { songTitle }),

  coverImageIdeas: (songTitle: string, mood?: string): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/cover-image-ideas', { songTitle, mood }),

  reelIdeas: (): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/reel-ideas'),

  collaborationSuggestions: (): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/collaboration-suggestions'),

  liveSessionSuggestions: (): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/live-session-suggestions'),

  audienceAnalysis: (): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/audience-analysis'),

  performanceReview: (): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/performance-review'),

  motivation: (): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/motivation'),

  growthPrediction: (): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/growth-prediction'),

  careerSuggestions: (goal: string): Promise<{ success: boolean; data?: AICoachResponse }> =>
    apiClient.post('/ai/career-suggestions', { goal }),
};

export default aiCoachService;
