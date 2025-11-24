'use client';

import { memo, useMemo } from 'react';
import { LiveTokenData } from '@/lib/hooks';
import { AnimatedNumber } from './AnimatedNumber';
import { TrendingUp, Flame, Coins, Activity } from 'lucide-react';
import clsx from 'clsx';

interface QuickStatsProps {
  tokens: LiveTokenData[];
  className?: string;
}

export const QuickStats = memo(function QuickStats({ tokens, className }: QuickStatsProps) {
  const stats = useMemo(() => {
    if (tokens.length === 0) return null;
    
    const totalMarketCap = tokens.reduce((sum, t) => sum + t.liveMarketCap, 0);
    const totalAnnualBuyback = tokens.reduce((sum, t) => sum + t.annualBuybackAmount, 0);
    const avgBuybackRate = tokens.reduce((sum, t) => sum + t.liveBuybackRate, 0) / tokens.length;
    const totalVolume24h = tokens.reduce((sum, t) => sum + (t.volume24h || 0), 0);
    const avgPriceChange = tokens.reduce((sum, t) => sum + t.priceChange24h, 0) / tokens.length;
    
    // Top performer
    const topPerformer = tokens.reduce((best, t) => 
      t.priceChange24h > best.priceChange24h ? t : best
    , tokens[0]);
    
    // Highest buyback rate
    const highestRate = tokens.reduce((best, t) => 
      t.liveBuybackRate > best.liveBuybackRate ? t : best
    , tokens[0]);
    
    return {
      totalMarketCap,
      totalAnnualBuyback,
      avgBuybackRate,
      totalVolume24h,
      avgPriceChange,
      topPerformer,
      highestRate,
    };
  }, [tokens]);

  if (!stats) return null;

  return (
    <div className={clsx(
      'flex items-center gap-6 overflow-x-auto py-3 px-4 rounded-xl',
      'bg-gradient-to-r from-surface via-surface-light/50 to-surface',
      'border border-border/30',
      className
    )}>
      {/* Total Buybacks */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
          <Flame className="h-4 w-4 text-accent" />
        </div>
        <div>
          <div className="text-xs text-muted uppercase tracking-wider">Annual Buybacks</div>
          <AnimatedNumber
            value={stats.totalAnnualBuyback}
            format="currency"
            decimals={2}
            className="font-bold text-white"
            size="md"
          />
        </div>
      </div>

      <div className="h-8 w-px bg-border/50 shrink-0" />

      {/* Avg Rate */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
          <TrendingUp className="h-4 w-4 text-green-400" />
        </div>
        <div>
          <div className="text-xs text-muted uppercase tracking-wider">Avg Rate</div>
          <AnimatedNumber
            value={stats.avgBuybackRate}
            format="percent"
            decimals={2}
            className="font-bold text-green-400"
            size="md"
          />
        </div>
      </div>

      <div className="h-8 w-px bg-border/50 shrink-0" />

      {/* Market Cap */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
          <Coins className="h-4 w-4 text-blue-400" />
        </div>
        <div>
          <div className="text-xs text-muted uppercase tracking-wider">Total MCap</div>
          <AnimatedNumber
            value={stats.totalMarketCap}
            format="currency"
            decimals={2}
            className="font-bold text-white"
            size="md"
          />
        </div>
      </div>

      <div className="h-8 w-px bg-border/50 shrink-0" />

      {/* 24h Change */}
      <div className="flex items-center gap-3 shrink-0">
        <div className={clsx(
          'flex h-9 w-9 items-center justify-center rounded-lg',
          stats.avgPriceChange >= 0 ? 'bg-accent/10' : 'bg-danger/10'
        )}>
          <Activity className={clsx(
            'h-4 w-4',
            stats.avgPriceChange >= 0 ? 'text-accent' : 'text-danger'
          )} />
        </div>
        <div>
          <div className="text-xs text-muted uppercase tracking-wider">24h Avg</div>
          <div className={clsx(
            'font-mono font-bold',
            stats.avgPriceChange >= 0 ? 'text-accent' : 'text-danger'
          )}>
            {stats.avgPriceChange >= 0 ? '+' : ''}{stats.avgPriceChange.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="h-8 w-px bg-border/50 shrink-0" />

      {/* Top Rate */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-lg">
          {stats.highestRate.logo}
        </div>
        <div>
          <div className="text-xs text-muted uppercase tracking-wider">Top Rate</div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-accent">
              {stats.highestRate.liveBuybackRate.toFixed(1)}%
            </span>
            <span className="text-xs text-muted">{stats.highestRate.symbol}</span>
          </div>
        </div>
      </div>

      <div className="h-8 w-px bg-border/50 shrink-0" />

      {/* Top Gainer */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-lg">
          {stats.topPerformer.logo}
        </div>
        <div>
          <div className="text-xs text-muted uppercase tracking-wider">Top 24h</div>
          <div className="flex items-center gap-1.5">
            <span className={clsx(
              'font-mono font-bold',
              stats.topPerformer.priceChange24h >= 0 ? 'text-accent' : 'text-danger'
            )}>
              {stats.topPerformer.priceChange24h >= 0 ? '+' : ''}
              {stats.topPerformer.priceChange24h.toFixed(1)}%
            </span>
            <span className="text-xs text-muted">{stats.topPerformer.symbol}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

