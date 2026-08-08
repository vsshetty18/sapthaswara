'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { apiClient } from '@/services/api';
import type { Song, PaginatedResponse } from '@/types';
import { useAppContext } from '@/context/AppContext';

export interface SongFilters {
  status?: string;
  mood?: string;
  language?: string;
  difficulty?: string;
  search?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

const buildQueryKey = (filters: SongFilters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(','));
    } else {
      params.set(key, String(value));
    }
  });
  return `/songs?${params.toString()}`;
};

const fetcher = async (url: string) => {
  const [path, query] = url.split('?');
  const response = await apiClient.get<PaginatedResponse<Song>>(path, Object.fromEntries(new URLSearchParams(query)));
  return response.data;
};

export function useSongs(filters: SongFilters = {}) {
  const { showSuccess, showError } = useAppContext();
  const key = buildQueryKey(filters);

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSong = useCallback(
    async (payload: Record<string, any>, audioFile?: File) => {
      setIsSubmitting(true);
      try {
        let response;
        if (audioFile) {
          const formData = new FormData();
          Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined) formData.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
          });
          formData.append('audio', audioFile);
          response = await apiClient.upload<Song>('/songs', formData);
        } else {
          response = await apiClient.post<Song>('/songs', payload);
        }
        showSuccess('Song added successfully');
        mutate();
        return response.data;
      } catch (err: any) {
        showError(err?.response?.data?.message || 'Failed to add song');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [mutate, showSuccess, showError]
  );

  const updateSong = useCallback(
    async (id: string, updates: Record<string, any>) => {
      try {
        const response = await apiClient.patch<Song>(`/songs/${id}`, updates);
        showSuccess('Song updated');
        mutate();
        return response.data;
      } catch (err: any) {
        showError(err?.response?.data?.message || 'Failed to update song');
        throw err;
      }
    },
    [mutate, showSuccess, showError]
  );

  const deleteSong = useCallback(
    async (id: string) => {
      try {
        await apiClient.delete(`/songs/${id}`);
        showSuccess('Song deleted');
        mutate();
      } catch (err: any) {
        showError(err?.response?.data?.message || 'Failed to delete song');
        throw err;
      }
    },
    [mutate, showSuccess, showError]
  );

  const markPracticed = useCallback(
    async (id: string) => {
      try {
        await apiClient.post(`/songs/${id}/practice`);
        mutate();
      } catch (err: any) {
        showError(err?.response?.data?.message || 'Failed to log practice');
      }
    },
    [mutate, showError]
  );

  return {
    songs: data?.items || [],
    meta: data?.meta,
    isLoading,
    error,
    isSubmitting,
    createSong,
    updateSong,
    deleteSong,
    markPracticed,
    refresh: mutate,
  };
}

export default useSongs;
