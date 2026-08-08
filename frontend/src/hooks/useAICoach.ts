'use client';

import { useState, useCallback } from 'react';
import aiCoachService from '@/services/openai';
import { useAppContext } from '@/context/AppContext';
import type { AICoachResponse } from '@/types';

export type AIRequestType =
  | 'suggestSong'
  | 'suggestPractice'
  | 'trendingSong'
  | 'hashtags'
  | 'uploadTiming'
  | 'caption'
  | 'thumbnailIdeas'
  | 'coverImageIdeas'
  | 'reelIdeas'
  | 'collaborationSuggestions'
  | 'liveSessionSuggestions'
  | 'audienceAnalysis'
  | 'performanceReview'
  | 'motivation'
  | 'growthPrediction'
  | 'careerSuggestions';

export function useAICoach() {
  const { showError } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<AICoachResponse | null>(null);
  const [history, setHistory] = useState<AICoachResponse[]>([]);

  const runRequest = useCallback(
    async (
      type: AIRequestType,
      ...args: any[]
    ): Promise<AICoachResponse | null> => {
      setIsLoading(true);
      try {
        const handlerMap: Record<AIRequestType, (...a: any[]) => Promise<any>> = {
          suggestSong: aiCoachService.suggestSong,
          suggestPractice: aiCoachService.suggestPractice,
          trendingSong: aiCoachService.trendingSong,
          hashtags: aiCoachService.hashtags,
          uploadTiming: aiCoachService.uploadTiming,
          caption: aiCoachService.caption,
          thumbnailIdeas: aiCoachService.thumbnailIdeas,
          coverImageIdeas: aiCoachService.coverImageIdeas,
          reelIdeas: aiCoachService.reelIdeas,
          collaborationSuggestions: aiCoachService.collaborationSuggestions,
          liveSessionSuggestions: aiCoachService.liveSessionSuggestions,
          audienceAnalysis: aiCoachService.audienceAnalysis,
          performanceReview: aiCoachService.performanceReview,
          motivation: aiCoachService.motivation,
          growthPrediction: aiCoachService.growthPrediction,
          careerSuggestions: aiCoachService.careerSuggestions,
        };

        const response = await handlerMap[type](...args);

        if (response.success && response.data) {
          setLastResponse(response.data);
          setHistory((prev) => [response.data, ...prev].slice(0, 20));
          return response.data;
        }

        showError(response.message || 'AI Coach request failed');
        return null;
      } catch (err: any) {
        showError(err?.response?.data?.message || 'AI Coach is temporarily unavailable');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [showError]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    setLastResponse(null);
  }, []);

  return {
    isLoading,
    lastResponse,
    history,
    runRequest,
    clearHistory,
  };
}

export default useAICoach;
