'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getBuybackRateData } from '@/lib/data';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-surface p-4 shadow-xl">
        <p className="mb-2 font-mono font-bold text-accent">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted">Buyback Rate:</span>
            <span className="font-mono font-medium text-white">{data.rate.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Annual Buyback:</span>
            <span className="font-mono font-medium text-accent">${data.amount.toFixed(0)}M</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Market Cap:</span>
            <span className="font-mono font-medium text-white">${data.marketCap.toFixed(2)}B</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const getBarColor = (rate: number): string => {
  if (rate >= 15) return '#00ff88';
  if (rate >= 8) return '#4ade80';
  if (rate >= 5) return '#facc15';
  if (rate >= 2) return '#fb923c';
  return '#6b7280';
};

export function RateChart() {
  const data = getBuybackRateData();

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" horizontal={false} />
          <XAxis 
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#e5e5e5', fontSize: 12, fontFamily: 'JetBrains Mono' }}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(42, 42, 58, 0.5)' }} />
          <Bar 
            dataKey="rate" 
            radius={[0, 4, 4, 0]}
            maxBarSize={24}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

