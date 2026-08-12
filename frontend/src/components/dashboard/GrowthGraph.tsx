'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { cn, formatNumber, formatDate } from '@/lib/utils';

export interface GrowthDataPoint {
  date: string;
  followers?: number;
  subscribers?: number;
  views?: number;
}

export interface GrowthGraphProps {
  data: GrowthDataPoint[];
  isLoading?: boolean;
}

type Metric = 'followers' | 'subscribers' | 'views';

const METRIC_CONFIG: Record<Metric, { label: string; color: string }> = {
  followers: { label: 'Instagram Followers', color: '#D4AF37' },
  subscribers: { label: 'YouTube Subscribers', color: '#8C6F53' },
  views: { label: 'Total Views', color: '#BE9143' },
};

function CustomTooltip({ active, payload, label, metric }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-walnut-600 px-3 py-2 text-xs text-cream-50 shadow-premium">
      <p className="text-cream-100/60">{formatDate(label)}</p>
      <p className="mt-0.5 font-semibold">{formatNumber(payload[0].value)} {METRIC_CONFIG[metric as Metric].label}</p>
    </div>
  );
}

export default function GrowthGraph({ data, isLoading = false }: GrowthGraphProps) {
  const [activeMetric, setActiveMetric] = useState<Metric>('followers');
  const config = METRIC_CONFIG[activeMetric];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Over Time</CardTitle>
        <div className="flex gap-1 rounded-xl bg-beige-100 p-1">
          {(Object.keys(METRIC_CONFIG) as Metric[]).map((metric) => (
            <button
              key={metric}
              onClick={() => setActiveMetric(metric)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                activeMetric === metric
                  ? 'bg-cream-50 text-walnut-600 shadow-sm'
                  : 'text-walnut-300 hover:text-walnut-500'
              )}
            >
              {metric === 'followers' ? 'IG' : metric === 'subscribers' ? 'YT' : 'Views'}
            </button>
          ))}
        </div>
      </CardHeader>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-walnut-300">
          Loading growth data...
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-walnut-300">No growth data yet</p>
          <p className="text-xs text-walnut-300/70">
            Connect Instagram or YouTube to start tracking your growth
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EBDDC3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => formatDate(val, { day: 'numeric', month: 'short' })}
              tick={{ fontSize: 11, fill: '#8C6F53' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(val) => formatNumber(val)}
              tick={{ fontSize: 11, fill: '#8C6F53' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip metric={activeMetric} />} />
            <Area
              type="monotone"
              dataKey={activeMetric}
              stroke={config.color}
              strokeWidth={2.5}
              fill="url(#growthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
