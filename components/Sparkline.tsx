'use client';

import { memo, useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  className?: string;
}

export const Sparkline = memo(function Sparkline({
  data,
  width = 80,
  height = 24,
  strokeColor = '#00ff88',
  fillColor = 'rgba(0, 255, 136, 0.1)',
  strokeWidth = 1.5,
  className = '',
}: SparklineProps) {
  const pathData = useMemo(() => {
    if (data.length < 2) return { line: '', fill: '' };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - min) / range) * chartHeight;
      return { x, y };
    });

    const linePath = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    const fillPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { line: linePath, fill: fillPath };
  }, [data, width, height]);

  // Determine trend color
  const trendColor = useMemo(() => {
    if (data.length < 2) return strokeColor;
    const first = data[0];
    const last = data[data.length - 1];
    if (last > first) return '#00ff88';
    if (last < first) return '#ff4757';
    return '#6b7280';
  }, [data, strokeColor]);

  if (data.length < 2) {
    return <div className={className} style={{ width, height }} />;
  }

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Fill */}
      <path
        d={pathData.fill}
        fill={fillColor}
        opacity={0.3}
      />
      {/* Line */}
      <path
        d={pathData.line}
        fill="none"
        stroke={trendColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={width - 2}
        cy={height / 2}
        r={2}
        fill={trendColor}
        className="animate-pulse"
      />
    </svg>
  );
});

