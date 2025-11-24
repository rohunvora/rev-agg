'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPrices, fetchSparklineData, mapPricesToTokens, PriceData, COINGECKO_IDS } from './api';
import { buybackTokens, TokenBuyback } from './data';

export interface LiveTokenData extends TokenBuyback {
  livePrice: number;
  liveMarketCap: number;
  priceChange24h: number;
  volume24h: number;
  lastUpdated: number;
  sparkline: number[];
  liveBuybackRate: number;
  priceDirection: 'up' | 'down' | 'neutral';
}

interface UseLiveDataReturn {
  tokens: LiveTokenData[];
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

// Calculate live buyback rate based on real-time market cap
function calculateLiveBuybackRate(annualBuyback: number, marketCap: number): number {
  if (marketCap <= 0) return 0;
  return (annualBuyback / marketCap) * 100;
}

export function useLiveData(refreshInterval = 30000): UseLiveDataReturn {
  const [tokens, setTokens] = useState<LiveTokenData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});
  const previousPrices = useRef<Record<string, number>>({});

  const fetchData = useCallback(async () => {
    try {
      const priceData = await fetchPrices();
      
      if (!priceData) {
        // Use static data as fallback
        const fallbackTokens: LiveTokenData[] = buybackTokens.map(token => ({
          ...token,
          livePrice: token.price,
          liveMarketCap: token.marketCap,
          priceChange24h: 0,
          volume24h: 0,
          lastUpdated: Date.now() / 1000,
          sparkline: token.monthlyBuybacks,
          liveBuybackRate: token.buybackRate,
          priceDirection: 'neutral' as const,
        }));
        setTokens(fallbackTokens);
        setLastUpdated(new Date());
        setIsLoading(false);
        return;
      }

      const mappedPrices = mapPricesToTokens(priceData);
      
      const updatedTokens: LiveTokenData[] = buybackTokens.map(token => {
        const geckoId = COINGECKO_IDS[token.id];
        const liveData = mappedPrices[token.id];
        
        const livePrice = liveData?.usd ?? token.price;
        const liveMarketCap = liveData?.usd_market_cap ?? token.marketCap;
        const priceChange24h = liveData?.usd_24h_change ?? 0;
        const volume24h = liveData?.usd_24h_vol ?? 0;
        const lastUpdatedAt = liveData?.last_updated_at ?? Date.now() / 1000;
        
        // Determine price direction
        const prevPrice = previousPrices.current[token.id] ?? livePrice;
        let priceDirection: 'up' | 'down' | 'neutral' = 'neutral';
        if (livePrice > prevPrice) priceDirection = 'up';
        else if (livePrice < prevPrice) priceDirection = 'down';
        
        previousPrices.current[token.id] = livePrice;
        
        // Calculate live buyback rate
        const liveBuybackRate = calculateLiveBuybackRate(token.annualBuybackAmount, liveMarketCap);
        
        return {
          ...token,
          livePrice,
          liveMarketCap,
          priceChange24h,
          volume24h,
          lastUpdated: lastUpdatedAt,
          sparkline: sparklines[geckoId] ?? token.monthlyBuybacks,
          liveBuybackRate,
          priceDirection,
        };
      });

      setTokens(updatedTokens);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to fetch live data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [sparklines]);

  // Fetch sparklines on mount (less frequently)
  useEffect(() => {
    const loadSparklines = async () => {
      const data = await fetchSparklineData();
      if (data) {
        setSparklines(data);
      }
    };
    loadSparklines();
    
    // Refresh sparklines every 5 minutes
    const interval = setInterval(loadSparklines, 300000);
    return () => clearInterval(interval);
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  return { tokens, lastUpdated, isLoading, error, refresh };
}

// Hook for relative time display that updates every second
export function useRelativeTime(date: Date | null): string {
  const [relativeTime, setRelativeTime] = useState('--');

  useEffect(() => {
    if (!date) return;

    const updateTime = () => {
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
      
      if (seconds < 5) {
        setRelativeTime('just now');
      } else if (seconds < 60) {
        setRelativeTime(`${seconds}s ago`);
      } else if (seconds < 3600) {
        setRelativeTime(`${Math.floor(seconds / 60)}m ago`);
      } else {
        setRelativeTime(`${Math.floor(seconds / 3600)}h ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [date]);

  return relativeTime;
}

// Keyboard shortcuts hook
export function useKeyboardShortcuts(handlers: {
  onSearch?: () => void;
  onEscape?: () => void;
  onRefresh?: () => void;
  onToggleView?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape' && handlers.onEscape) {
          handlers.onEscape();
          (e.target as HTMLElement).blur();
        }
        return;
      }

      switch (e.key) {
        case '/':
          e.preventDefault();
          handlers.onSearch?.();
          break;
        case 'Escape':
          handlers.onEscape?.();
          break;
        case 'r':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            handlers.onRefresh?.();
          }
          break;
        case 'v':
          e.preventDefault();
          handlers.onToggleView?.();
          break;
        case 'j':
        case 'ArrowDown':
          handlers.onNavigateDown?.();
          break;
        case 'k':
        case 'ArrowUp':
          handlers.onNavigateUp?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

// Generate simulated live buyback activity
export interface BuybackEvent {
  id: string;
  tokenId: string;
  tokenSymbol: string;
  tokenLogo: string;
  amount: number;
  timestamp: Date;
  txHash: string;
  type: 'buyback' | 'burn';
}

export function useSimulatedActivity(tokens: LiveTokenData[]): BuybackEvent[] {
  const [events, setEvents] = useState<BuybackEvent[]>([]);

  useEffect(() => {
    if (tokens.length === 0) return;

    // Generate initial events
    const initialEvents: BuybackEvent[] = [];
    const now = Date.now();
    
    for (let i = 0; i < 5; i++) {
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const dailyBuyback = token.annualBuybackAmount / 365;
      const eventAmount = (dailyBuyback / 24) * (0.5 + Math.random()); // Hourly-ish amount with variance
      
      initialEvents.push({
        id: `event-${now}-${i}`,
        tokenId: token.id,
        tokenSymbol: token.symbol,
        tokenLogo: token.logo,
        amount: eventAmount,
        timestamp: new Date(now - i * (60000 + Math.random() * 120000)), // Spread over last few minutes
        txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
        type: token.mechanism.includes('burn') ? 'burn' : 'buyback',
      });
    }
    
    setEvents(initialEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));

    // Simulate new events periodically
    const interval = setInterval(() => {
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const dailyBuyback = token.annualBuybackAmount / 365;
      const eventAmount = (dailyBuyback / 24) * (0.3 + Math.random() * 0.7);
      
      const newEvent: BuybackEvent = {
        id: `event-${Date.now()}`,
        tokenId: token.id,
        tokenSymbol: token.symbol,
        tokenLogo: token.logo,
        amount: eventAmount,
        timestamp: new Date(),
        txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
        type: token.mechanism.includes('burn') ? 'burn' : 'buyback',
      };
      
      setEvents(prev => [newEvent, ...prev.slice(0, 19)]); // Keep last 20 events
    }, 15000 + Math.random() * 30000); // Random interval 15-45 seconds

    return () => clearInterval(interval);
  }, [tokens]);

  return events;
}

