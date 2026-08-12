'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Tooltip from '@/components/ui/Tooltip';
import { cn, formatDate } from '@/lib/utils';

export interface HeatmapDataPoint {
  date: string;
  count: number;
}

export interface HeatmapChartProps {
  data: HeatmapDataPoint[];
  isLoading?: boolean;
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getIntensity(count: number): string {
  if (count === 0) return 'bg-beige-100';
  if (count === 1) return 'bg-gold-200';
  if (count === 2) return 'bg-gold-400';
  if (count <= 4) return 'bg-gold-500';
  return 'bg-walnut-500';
}

export default function HeatmapChart({ data, isLoading = false }: HeatmapChartProps) {
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => map.set(d.date, d.count));
    return map;
  }, [data]);

  const weeks = useMemo(() => {
    const today = new Date();
    const daysInYear = 371; // 53 weeks
    const cells: { date: string; count: number }[] = [];

    for (let i = daysInYear - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      cells.push({ date: dateStr, count: dataMap.get(dateStr) || 0 });
    }

    const weekChunks: { date: string; count: number }[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weekChunks.push(cells.slice(i, i + 7));
    }
    return weekChunks;
  }, [dataMap]);

  const monthMarkers = useMemo(() => {
    const markers: { index: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const month = new Date(week[0].date).getMonth();
      if (month !== lastMonth) {
        markers.push({ index: i, label: MONTH_LABELS[month] });
        lastMonth = month;
      }
    });
    return markers;
  }, [weeks]);

  const totalActive = data.filter((d) => d.count > 0).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <p className="text-xs text-walnut-300">{totalActive} active days this year</p>
      </CardHeader>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-sm text-walnut-300">
          Loading activity...
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="inline-block min-w-full">
            <div className="mb-1 flex gap-[3px] pl-6">
              {weeks.map((_, i) => {
                const marker = monthMarkers.find((m) => m.index === i);
                return (
                  <span key={i} className="w-[11px] text-[9px] text-walnut-300">
                    {marker?.label || ''}
                  </span>
                );
              })}
            </div>
            <div className="flex gap-[3px]">
              <div className="flex flex-col gap-[3px] pr-1">
                {DAY_LABELS.map((label, i) => (
                  <span key={i} className="h-[11px] text-[9px] leading-[11px] text-walnut-300">
                    {label}
                  </span>
                ))}
              </div>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <Tooltip
                      key={day.date}
                      content={`${day.count} activities on ${formatDate(day.date)}`}
                      position="top"
                    >
                      <motion.div
                        whileHover={{ scale: 1.3 }}
                        className={cn('h-[11px] w-[11px] rounded-[3px]', getIntensity(day.count))}
                      />
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-1.5 text-[10px] text-walnut-300">
        <span>Less</span>
        {['bg-beige-100', 'bg-gold-200', 'bg-gold-400', 'bg-gold-500', 'bg-walnut-500'].map((c) => (
          <span key={c} className={cn('h-[11px] w-[11px] rounded-[3px]', c)} />
        ))}
        <span>More</span>
      </div>
    </Card>
  );
}
