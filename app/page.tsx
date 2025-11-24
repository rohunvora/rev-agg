'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { Header } from '@/components/Header';
import { QuickStats } from '@/components/QuickStats';
import { TokenCard } from '@/components/TokenCard';
import { TokenTable } from '@/components/TokenTable';
import { ActivityFeed } from '@/components/ActivityFeed';
import { TokenModal } from '@/components/TokenModal';
import { useLiveData, useKeyboardShortcuts, useSimulatedActivity, LiveTokenData } from '@/lib/hooks';
import { Search, X, Keyboard } from 'lucide-react';
import clsx from 'clsx';

type FilterMechanism = 'all' | 'buyback' | 'buyback-burn' | 'buyback-distribute';

export default function Dashboard() {
  const { tokens, lastUpdated, isLoading, refresh } = useLiveData(30000); // 30s refresh
  const [selectedToken, setSelectedToken] = useState<LiveTokenData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMechanism, setFilterMechanism] = useState<FilterMechanism>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const activity = useSimulatedActivity(tokens);

  const filteredTokens = useMemo(() => {
    let result = [...tokens];
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.symbol.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }
    
    // Filter by mechanism
    if (filterMechanism !== 'all') {
      result = result.filter(t => t.mechanism === filterMechanism);
    }
    
    // Sort by buyback rate (highest first)
    result.sort((a, b) => b.liveBuybackRate - a.liveBuybackRate);
    
    return result;
  }, [tokens, searchQuery, filterMechanism]);

  const handleSelectToken = useCallback((token: LiveTokenData) => {
    setSelectedToken(token);
  }, []);

  const toggleView = useCallback(() => {
    setViewMode(prev => prev === 'cards' ? 'table' : 'cards');
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => searchInputRef.current?.focus(),
    onEscape: () => {
      setSelectedToken(null);
      setSearchQuery('');
      setSelectedIndex(-1);
    },
    onRefresh: refresh,
    onToggleView: toggleView,
    onNavigateDown: () => {
      if (filteredTokens.length > 0) {
        setSelectedIndex(prev => Math.min(prev + 1, filteredTokens.length - 1));
      }
    },
    onNavigateUp: () => {
      if (filteredTokens.length > 0) {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-30" />
      
      <div className="relative">
        <Header 
          lastUpdated={lastUpdated}
          isLoading={isLoading}
          onRefresh={refresh}
          viewMode={viewMode}
          onToggleView={toggleView}
        />
        
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Quick Stats Bar */}
          <QuickStats tokens={tokens} className="mb-6" />
          
          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left Column - Token List */}
            <div className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search tokens... (/)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 rounded-lg border border-border bg-surface-light py-2 pl-10 pr-10 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Mechanism Filter */}
                  <select
                    value={filterMechanism}
                    onChange={(e) => setFilterMechanism(e.target.value as FilterMechanism)}
                    className="rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-white focus:border-accent focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="buyback-burn">🔥 Burn</option>
                    <option value="buyback-distribute">💰 Distribute</option>
                    <option value="buyback">📈 Buyback</option>
                  </select>
                </div>

                <div className="text-sm text-muted">
                  <span className="font-mono text-accent">{filteredTokens.length}</span> protocols
                </div>
              </div>

              {/* Token List */}
              {isLoading && tokens.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <p className="mt-4 text-muted">Loading live data...</p>
                </div>
              ) : viewMode === 'table' ? (
                <TokenTable 
                  tokens={filteredTokens}
                  onSelectToken={handleSelectToken}
                  selectedIndex={selectedIndex}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredTokens.map((token, index) => (
                    <TokenCard
                      key={token.id}
                      token={token}
                      rank={index + 1}
                      onSelect={handleSelectToken}
                      isSelected={selectedIndex === index}
                    />
                  ))}
                </div>
              )}

              {filteredTokens.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-surface/50 py-16">
                  <p className="text-lg text-muted">No protocols found</p>
                  <p className="mt-2 text-sm text-muted">Try adjusting your filters</p>
                </div>
              )}
            </div>

            {/* Right Column - Activity Feed */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-border/50 bg-surface/50 backdrop-blur p-4">
                <ActivityFeed events={activity} />
              </div>

              {/* Keyboard Shortcuts Help */}
              <div className="mt-4 rounded-xl border border-border/30 bg-surface/30 p-4">
                <div className="flex items-center gap-2 mb-3 text-sm text-muted">
                  <Keyboard size={14} />
                  <span>Keyboard Shortcuts</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-surface-light rounded font-mono">/</kbd>
                    <span className="text-muted">Search</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-surface-light rounded font-mono">v</kbd>
                    <span className="text-muted">Toggle view</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-surface-light rounded font-mono">r</kbd>
                    <span className="text-muted">Refresh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-surface-light rounded font-mono">esc</kbd>
                    <span className="text-muted">Clear</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-surface-light rounded font-mono">j/k</kbd>
                    <span className="text-muted">Navigate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 border-t border-border/50 pt-6 text-center">
            <p className="text-xs text-muted">
              Real-time data from CoinGecko API • Buyback rates calculated from annual buyback amounts
              <br />
              <span className="text-accent">●</span> Auto-refreshing every 30 seconds
            </p>
          </footer>
        </main>
      </div>

      {/* Token Detail Modal */}
      {selectedToken && (
        <TokenModal 
          token={selectedToken as any} 
          onClose={() => setSelectedToken(null)} 
        />
      )}
    </div>
  );
}
