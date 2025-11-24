'use client';

import { useRelativeTime } from '@/lib/hooks';
import clsx from 'clsx';

interface LiveIndicatorProps {
  lastUpdated: Date | null;
  isLoading?: boolean;
  className?: string;
}

export function LiveIndicator({ lastUpdated, isLoading, className }: LiveIndicatorProps) {
  const relativeTime = useRelativeTime(lastUpdated);

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="relative flex items-center gap-1.5">
        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2">
          <span className={clsx(
            'absolute inline-flex h-full w-full rounded-full opacity-75',
            isLoading ? 'bg-warning animate-ping' : 'bg-accent animate-ping'
          )} />
          <span className={clsx(
            'relative inline-flex rounded-full h-2 w-2',
            isLoading ? 'bg-warning' : 'bg-accent'
          )} />
        </span>
        <span className={clsx(
          'text-xs font-medium uppercase tracking-wider',
          isLoading ? 'text-warning' : 'text-accent'
        )}>
          {isLoading ? 'Updating' : 'Live'}
        </span>
      </div>
      
      <span className="text-xs text-muted">•</span>
      
      <span className="text-xs text-muted font-mono">
        {relativeTime}
      </span>
    </div>
  );
}

