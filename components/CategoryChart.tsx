'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getCategoryData } from '@/lib/data';

const COLORS = ['#00ff88', '#00b4d8', '#ffb800', '#ff4757', '#a855f7', '#f472b6'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-surface p-3 shadow-xl">
        <p className="mb-2 font-medium text-white">{data.name}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted">Protocols:</span>
            <span className="font-mono font-medium text-white">{data.count}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Total Buyback:</span>
            <span className="font-mono font-medium text-accent">${data.totalBuyback.toFixed(0)}M</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Avg Rate:</span>
            <span className="font-mono font-medium text-warning">{data.avgRate.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function CategoryChart() {
  const data = getCategoryData();

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            innerRadius={50}
            dataKey="totalBuyback"
            stroke="rgba(10, 10, 15, 0.5)"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => <span className="text-sm text-muted">{value}</span>}
            wrapperStyle={{ paddingTop: 10 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

