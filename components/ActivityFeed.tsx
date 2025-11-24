'use client';

import { memo } from 'react';
import { BuybackEvent } from '@/lib/hooks';
import { Flame, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';

interface ActivityFeedProps {
  events: BuybackEvent[];
  className?: string;
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

function formatTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
}

const ActivityItem = memo(function ActivityItem({ 
  event, 
  isNew 
}: { 
  event: BuybackEvent; 
  isNew: boolean;
}) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-500',
        isNew ? 'bg-accent/10 animate-pulse' : 'bg-surface-light/50'
      )}
    >
      {/* Token logo */}
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-lg">
        {event.tokenLogo}
      </div>
      
      {/* Event info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-white">
            {event.tokenSymbol}
          </span>
          <span className={clsx(
            'flex items-center gap-0.5 text-xs font-medium',
            event.type === 'burn' ? 'text-danger' : 'text-accent'
          )}>
            {event.type === 'burn' ? (
              <><Flame size={10} /> BURN</>
            ) : (
              <><ArrowDownRight size={10} /> BUY</>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="font-mono truncate">{event.txHash}</span>
        </div>
      </div>
      
      {/* Amount and time */}
      <div className="text-right">
        <div className="font-mono text-sm font-medium text-accent">
          {formatAmount(event.amount)}
        </div>
        <div className="text-xs text-muted font-mono">
          {formatTime(event.timestamp)}
        </div>
      </div>
    </div>
  );
});

export function ActivityFeed({ events, className }: ActivityFeedProps) {
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          Live Activity
        </h3>
        <span className="text-xs text-muted">
          {events.length} events
        </span>
      </div>
      
      <div className="space-y-1.5 max-h-[320px] overflow-y-auto scrollbar-thin">
        {events.map((event, index) => (
          <ActivityItem
            key={event.id}
            event={event}
            isNew={index === 0 && Date.now() - event.timestamp.getTime() < 5000}
          />
        ))}
        
        {events.length === 0 && (
          <div className="text-center py-8 text-muted text-sm">
            Waiting for activity...
          </div>
        )}
      </div>
    </div>
  );
}

