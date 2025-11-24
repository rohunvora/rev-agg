'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  highlight?: boolean;
  delay?: number;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue,
  highlight = false,
  delay = 0 
}: StatsCardProps) {
  return (
    <div 
      className={clsx(
        'relative overflow-hidden rounded-2xl border p-6 card-hover',
        'bg-gradient-to-br from-surface to-surface-light',
        highlight 
          ? 'border-accent/30 glow-accent' 
          : 'border-border/50'
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        opacity: 0,
        animation: 'countUp 0.6s ease-out forwards'
      }}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-accent/5 blur-2xl" />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-2xl">
            {icon}
          </div>
          
          {trend && trendValue && (
            <div className={clsx(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              trend === 'up' && 'bg-accent/10 text-accent',
              trend === 'down' && 'bg-danger/10 text-danger',
              trend === 'neutral' && 'bg-muted/10 text-muted'
            )}>
              <span>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
              </span>
              {trendValue}
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className={clsx(
            'mt-1 font-mono text-3xl font-bold tracking-tight',
            highlight ? 'text-accent glow-text' : 'text-white'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

