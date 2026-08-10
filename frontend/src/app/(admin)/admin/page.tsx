'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Bug,
  AlertTriangle,
  Star,
  Shield,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { SkeletonCard, SkeletonRow } from '@/components/ui/Skeleton';
import { apiClient } from '@/services/api';
import { formatNumber, formatRelativeTime } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  username: string;
  email: string;
  created_at: string;
}

interface BugReport {
  id: string;
  title: string;
  platform: string;
  app_version: string;
  status: string;
  created_at: string;
}

const STAT_CARDS = [
  { key: 'totalUsers', label: 'Total Users', icon: Users },
  { key: 'openTickets', label: 'Open Tickets', icon: MessageSquare },
  { key: 'openBugs', label: 'Open Bugs', icon: Bug },
  { key: 'avgRating', label: 'Avg. App Rating', icon: Star },
];

export default function AdminDashboardPage() {
  const { showError } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    openTickets: 0,
    openBugs: 0,
    avgRating: '0.0',
  });

  useEffect(() => {
    const loadAdminData = async () => {
      setIsLoading(true);
      try {
        const [overviewRes, ticketsRes, bugsRes, reviewsRes] = await Promise.all([
          apiClient.get<{ totalUsers: number }>('/owner/overview'),
          apiClient.get<{ items: SupportTicket[] }>('/owner/support-tickets', { status: 'open', limit: 6 }),
          apiClient.get<{ items: BugReport[] }>('/owner/bug-reports', { limit: 6 }),
          apiClient.get<{ averageRating: string }>('/owner/reviews'),
        ]);

        setStats({
          totalUsers: overviewRes.data?.totalUsers || 0,
          openTickets: ticketsRes.data?.items?.length || 0,
          openBugs: bugsRes.data?.items?.length || 0,
          avgRating: reviewsRes.data?.averageRating || '0.0',
        });
        setTickets(ticketsRes.data?.items || []);
        setBugReports(bugsRes.data?.items || []);
      } catch (err: any) {
        showError('Failed to load admin data. Admin access requires elevated permissions.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, [showError]);

  const priorityVariant: Record<string, 'default' | 'warning' | 'danger'> = {
    low: 'default',
    medium: 'warning',
    high: 'danger',
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-gradient">
            <Shield className="h-5 w-5 text-walnut-600" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-walnut-600">
              Admin Dashboard
            </h1>
            <p className="text-sm text-walnut-300">
              Support tickets, bug reports, and platform moderation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : STAT_CARDS.map((stat) => (
                <Card key={stat.key}>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-beige-100">
                      <stat.icon className="h-4.5 w-4.5 text-walnut-500" />
                    </div>
                  </div>
                  <p className="mt-4 font-display text-2xl font-semibold text-walnut-600">
                    {stat.key === 'avgRating'
                      ? `${stats.avgRating} ★`
                      : formatNumber(stats[stat.key as keyof typeof stats] as number)}
                  </p>
                  <p className="text-xs text-walnut-300">{stat.label}</p>
                </Card>
              ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Open Support Tickets</CardTitle>
              <Badge variant="warning" size="sm">{tickets.length} open</Badge>
            </CardHeader>
            <CardContent className="space-y-1">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : tickets.length === 0 ? (
                <p className="py-6 text-center text-sm text-walnut-300">
                  No open support tickets. All caught up!
                </p>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-start justify-between gap-3 border-b border-beige-100 py-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-walnut-600">{ticket.subject}</p>
                      <p className="mt-0.5 truncate text-xs text-walnut-300">
                        {ticket.username} · {formatRelativeTime(ticket.created_at)}
                      </p>
                    </div>
                    <Badge variant={priorityVariant[ticket.priority] || 'default'} size="sm">
                      {ticket.priority}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Bug Reports</CardTitle>
              <Badge variant="danger" size="sm">{bugReports.length} recent</Badge>
            </CardHeader>
            <CardContent className="space-y-1">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : bugReports.length === 0 ? (
                <p className="py-6 text-center text-sm text-walnut-300">
                  No bug reports. The app is running smoothly!
                </p>
              ) : (
                bugReports.map((bug) => (
                  <div
                    key={bug.id}
                    className="flex items-start justify-between gap-3 border-b border-beige-100 py-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-walnut-600">{bug.title}</p>
                      <p className="mt-0.5 truncate text-xs text-walnut-300">
                        {bug.platform} v{bug.app_version} · {formatRelativeTime(bug.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-amber-500">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
