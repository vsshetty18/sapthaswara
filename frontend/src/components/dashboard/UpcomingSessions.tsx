'use client';

import React from 'react';
import { Calendar, Users, Radio, Trophy, Mic, Music } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { Reminder, ReminderType } from '@/types';

export interface UpcomingSessionsProps {
  reminders: Reminder[];
  isLoading?: boolean;
}

const TYPE_ICON_MAP: Record<ReminderType, React.ElementType> = {
  practice: Music,
  live_session: Radio,
  collaboration: Users,
  competition: Trophy,
  studio_booking: Mic,
  recording: Mic,
  birthday: Calendar,
  festival: Calendar,
};

const TYPE_LABEL_MAP: Record<ReminderType, string> = {
  practice: 'Practice',
  live_session: 'Live Session',
  collaboration: 'Collaboration',
  competition: 'Competition',
  studio_booking: 'Studio Booking',
  recording: 'Recording',
  birthday: 'Birthday',
  festival: 'Festival',
};

export default function UpcomingSessions({ reminders, isLoading = false }: UpcomingSessionsProps) {
  const upcoming = [...reminders]
    .filter((r) => new Date(r.scheduledTime) >= new Date())
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Sessions</CardTitle>
        <Badge variant="default" size="sm">{upcoming.length} scheduled</Badge>
      </CardHeader>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-walnut-300">Loading sessions...</div>
      ) : upcoming.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Calendar className="h-8 w-8 text-walnut-200" />
          <p className="text-sm text-walnut-300">No upcoming sessions</p>
          <p className="text-xs text-walnut-300/70">
            Schedule a live session, collaboration, or studio booking
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {upcoming.map((reminder) => {
            const Icon = TYPE_ICON_MAP[reminder.type];
            const date = new Date(reminder.scheduledTime);
            return (
              <div
                key={reminder.id}
                className="flex items-center gap-3 border-b border-beige-100 py-3 last:border-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-beige-100">
                  <Icon className="h-4 w-4 text-walnut-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-walnut-600">{reminder.title}</p>
                  <p className="text-xs text-walnut-300">{TYPE_LABEL_MAP[reminder.type]}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-walnut-500">
                    {formatDate(reminder.scheduledTime, { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-[11px] text-walnut-300">
                    {date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
