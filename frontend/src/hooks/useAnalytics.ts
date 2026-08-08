'use client';

import useSWR from 'swr';
import { apiClient } from '@/services/api';
import { useAppContext } from '@/context/AppContext';

interface DashboardSummary {
  songsCompleted: number;
  songsRemaining: number;
  totalSongs: number;
  currentStreak: number;
  followers: number;
  subscribers: number;
  views: number;
  hoursPracticed: number;
  uploads: number;
  performanceScore: number;
}

const fetcher = async <T,>(url: string): Promise<T | undefined> => {
  const response = await apiClient.get<T>(url);
  return response.data;
};

export function useDashboardSummary() {
  const { data, error, isLoading, mutate } = useSWR<DashboardSummary>(
    '/analytics/dashboard',
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 60000 }
  );

  return { summary: data, isLoading, error, refresh: mutate };
}

export function useInstagramAnalytics(handle?: string) {
  const { showError } = useAppContext();
  const key = `/analytics/instagram${handle ? `?handle=${handle}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      try {
        const response = await apiClient.get('/analytics/instagram', handle ? { handle } : undefined);
        return response.data;
      } catch (err: any) {
        showError(err?.response?.data?.message || 'Failed to load Instagram analytics');
        throw err;
      }
    },
    { revalidateOnFocus: false }
  );

  return { data, isLoading, error, refresh: mutate };
}

export function useYouTubeAnalytics(channel?: string) {
  const { showError } = useAppContext();
  const key = `/analytics/youtube${channel ? `?channel=${channel}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      try {
        const response = await apiClient.get('/analytics/youtube', channel ? { channel } : undefined);
        return response.data;
      } catch (err: any) {
        showError(err?.response?.data?.message || 'Failed to load YouTube analytics');
        throw err;
      }
    },
    { revalidateOnFocus: false }
  );

  return { data, isLoading, error, refresh: mutate };
}

export function useAnalyticsReport(period: 'day' | 'week' | 'month' | 'year' = 'week') {
  const { data, error, isLoading, mutate } = useSWR(
    `/analytics/report?period=${period}`,
    () => fetcher(`/analytics/report?period=${period}`),
    { revalidateOnFocus: false }
  );

  return { report: data, isLoading, error, refresh: mutate };
}

export function useHeatmap() {
  const { data, error, isLoading } = useSWR(
    '/analytics/heatmap',
    () => fetcher('/analytics/heatmap'),
    { revalidateOnFocus: false }
  );

  return { heatmapData: data || [], isLoading, error };
}

export default useDashboardSummary;
