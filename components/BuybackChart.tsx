'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getChartData } from '@/lib/data';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-surface p-3 shadow-xl">
        <p className="mb-2 font-medium text-white">{label} 2025</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted">{entry.name}:</span>
            <span className="font-mono font-medium" style={{ color: entry.color }}>
              ${entry.value.toFixed(1)}M
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function BuybackChart() {
  const data = getChartData();

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorHype" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00b4d8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorMaker" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffb800" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ffb800" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickFormatter={(value) => `$${value}M`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: 20 }}
            formatter={(value) => <span className="text-sm text-muted">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="totalBuybacks"
            name="Total"
            stroke="#00ff88"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
          <Area
            type="monotone"
            dataKey="hyperliquid"
            name="Hyperliquid"
            stroke="#00b4d8"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorHype)"
          />
          <Area
            type="monotone"
            dataKey="maker"
            name="Maker"
            stroke="#ffb800"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorMaker)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

