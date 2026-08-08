'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'reminder' | 'milestone' | 'message' | 'system';
  isRead: boolean;
  createdAt: string;
}

interface AppContextValue {
  notifications: Notification[];
  unreadCount: number;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  isGlobalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setIsSidebarOpen(open);
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((message: string) => {
    toast.success(message, {
      style: {
        background: '#FBF8F3',
        color: '#3B2C1F',
        border: '1px solid #E0CBA5',
      },
    });
  }, []);

  const showError = useCallback((message: string) => {
    toast.error(message, {
      style: {
        background: '#FBF8F3',
        color: '#3B2C1F',
        border: '1px solid #E0CBA5',
      },
    });
  }, []);

  const setGlobalLoading = useCallback((loading: boolean) => {
    setIsGlobalLoading(loading);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const value: AppContextValue = {
    notifications,
    unreadCount,
    isSidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    showSuccess,
    showError,
    isGlobalLoading,
    setGlobalLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
