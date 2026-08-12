'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDate, formatNumber } from '@/lib/utils';

export interface GrowthChartDataPoint {
  date: string;
  instagram?: number;
  youtube?: number;
}

export interface GrowthChartProps {
  data: GrowthChartDataPoint[];
  title?: string;
  isLoading?: boolean;
}

const SERIES_CONFIG = [
  { key: 'instagram', label: 'Instagram', color: '#D4AF37' },
  { key: 'youtube', label: 'YouTube', color: '#8C6F53' },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-walnut-600 px-3 py-2.5 text-xs text-cream-50 shadow-premium">
      <p className="mb-1.5 text-cream-100/60">{formatDate(label)}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="flex items-center gap-1.5 font-medium">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function GrowthChart({ data, title = 'Cross-Platform Growth', isLoading = false }: GrowthChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-walnut-300">
          Loading chart data...
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-walnut-300">
          No data available for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', color: '#8C6F53' }}
            />
            {SERIES_CONFIG.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.label}
                stroke={series.color}
                strokeWidth={2.5}
                dot={{ r: 3, fill: series.color }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
