'use client';

import { Flame, RefreshCw, LayoutGrid, Table, Command } from 'lucide-react';
import { LiveIndicator } from './LiveIndicator';
import clsx from 'clsx';

interface HeaderProps {
  lastUpdated: Date | null;
  isLoading: boolean;
  onRefresh: () => void;
  viewMode: 'cards' | 'table';
  onToggleView: () => void;
}

export function Header({ 
  lastUpdated, 
  isLoading, 
  onRefresh, 
  viewMode, 
  onToggleView 
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-dim text-2xl shadow-lg glow-accent">
                <Flame className="h-5 w-5 text-background" />
              </div>
              <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent animate-pulse ring-2 ring-background" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Buyback<span className="text-accent">Tracker</span>
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <LiveIndicator 
                  lastUpdated={lastUpdated} 
                  isLoading={isLoading} 
                />
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Keyboard hint */}
            <div className="hidden lg:flex items-center gap-1 text-xs text-muted mr-4">
              <kbd className="px-1.5 py-0.5 bg-surface-light rounded text-[10px] font-mono">/</kbd>
              <span>search</span>
              <kbd className="px-1.5 py-0.5 bg-surface-light rounded text-[10px] font-mono ml-2">v</kbd>
              <span>view</span>
              <kbd className="px-1.5 py-0.5 bg-surface-light rounded text-[10px] font-mono ml-2">r</kbd>
              <span>refresh</span>
            </div>

            {/* View Toggle */}
            <div className="flex items-center rounded-lg bg-surface-light p-1">
              <button
                onClick={onToggleView}
                className={clsx(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
                  viewMode === 'cards' 
                    ? 'bg-accent/20 text-accent' 
                    : 'text-muted hover:text-white'
                )}
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={onToggleView}
                className={clsx(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors',
                  viewMode === 'table' 
                    ? 'bg-accent/20 text-accent' 
                    : 'text-muted hover:text-white'
                )}
              >
                <Table size={14} />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {/* Refresh */}
            <button 
              onClick={onRefresh}
              disabled={isLoading}
              className={clsx(
                'flex items-center gap-2 rounded-lg bg-surface-light px-3 py-2 text-sm transition-colors',
                isLoading 
                  ? 'text-muted cursor-not-allowed' 
                  : 'text-muted hover:text-white hover:bg-surface-light/80'
              )}
            >
              <RefreshCw size={14} className={clsx(isLoading && 'animate-spin')} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
