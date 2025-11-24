'use client';

import { memo } from 'react';
import { LiveTokenData } from '@/lib/hooks';
import { AnimatedNumber } from './AnimatedNumber';
import { Sparkline } from './Sparkline';
import clsx from 'clsx';

interface TokenCardProps {
  token: LiveTokenData;
  rank: number;
  onSelect: (token: LiveTokenData) => void;
  isSelected?: boolean;
}

export const TokenCard = memo(function TokenCard({ 
  token, 
  rank, 
  onSelect,
  isSelected = false 
}: TokenCardProps) {
  const getBuybackRateColor = (rate: number) => {
    if (rate >= 10) return 'text-accent';
    if (rate >= 5) return 'text-green-400';
    if (rate >= 2) return 'text-warning';
    return 'text-muted';
  };

  const getBuybackRateBg = (rate: number) => {
    if (rate >= 10) return 'bg-accent/20';
    if (rate >= 5) return 'bg-green-400/20';
    if (rate >= 2) return 'bg-warning/20';
    return 'bg-muted/20';
  };

  return (
    <div
      onClick={() => onSelect(token)}
      className={clsx(
        'group relative cursor-pointer overflow-hidden rounded-xl border',
        'bg-gradient-to-br from-surface to-surface-light',
        'card-hover transition-all duration-200',
        isSelected 
          ? 'border-accent/50 ring-1 ring-accent/30' 
          : 'border-border/50',
        token.priceDirection === 'up' && 'animate-flash-green',
        token.priceDirection === 'down' && 'animate-flash-red'
      )}
    >
      {/* Rank badge */}
      <div className="absolute -left-1 -top-1 flex h-7 w-7 items-center justify-center rounded-br-lg bg-accent/10 font-mono text-[10px] font-bold text-accent">
        #{rank}
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-light text-xl shadow-lg ring-1 ring-border/50">
              {token.logo}
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-accent transition-colors">
                {token.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted">{token.symbol}</span>
                <span className={clsx(
                  'text-xs font-mono',
                  token.priceChange24h >= 0 ? 'text-accent' : 'text-danger'
                )}>
                  {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Sparkline */}
          <Sparkline 
            data={token.sparkline} 
            width={60} 
            height={24}
          />
        </div>

        {/* Buyback Rate - Main Focus */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted">Buyback Rate / MC</span>
            <span className={clsx(
              'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              token.mechanism === 'buyback-burn' && 'bg-danger/10 text-danger',
              token.mechanism === 'buyback-distribute' && 'bg-accent/10 text-accent',
              token.mechanism === 'buyback' && 'bg-warning/10 text-warning',
            )}>
              {token.mechanism === 'buyback-burn' ? '🔥' : 
               token.mechanism === 'buyback-distribute' ? '💰' : '📈'}
            </span>
          </div>
          <div className={clsx(
            'mt-1 font-mono text-2xl font-bold',
            getBuybackRateColor(token.liveBuybackRate)
          )}>
            <AnimatedNumber
              value={token.liveBuybackRate}
              format="percent"
              decimals={2}
              showChange={true}
            />
          </div>
          
          {/* Progress bar */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-light">
            <div 
              className={clsx('h-full rounded-full transition-all duration-500', getBuybackRateBg(token.liveBuybackRate))}
              style={{ width: `${Math.min(token.liveBuybackRate * 4, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-surface-light/50 p-2">
            <p className="text-[10px] text-muted uppercase">Annual</p>
            <AnimatedNumber
              value={token.annualBuybackAmount}
              format="currency"
              decimals={0}
              className="font-mono text-sm font-semibold text-white"
              showChange={false}
            />
          </div>
          <div className="rounded-lg bg-surface-light/50 p-2">
            <p className="text-[10px] text-muted uppercase">MCap</p>
            <AnimatedNumber
              value={token.liveMarketCap}
              format="currency"
              decimals={2}
              className="font-mono text-sm font-semibold text-white"
              showChange={false}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2">
          <div className="flex items-center gap-1.5">
            <span className="rounded bg-surface-light px-1.5 py-0.5 text-[10px] text-muted">
              {token.chain}
            </span>
          </div>
          <span className="text-[10px] text-muted font-mono">
            {token.percentSupplyBoughtBack.toFixed(1)}% bought
          </span>
        </div>
      </div>
    </div>
  );
});
