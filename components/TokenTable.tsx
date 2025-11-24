'use client';

import { memo, useState, useMemo } from 'react';
import { LiveTokenData } from '@/lib/hooks';
import { Sparkline } from './Sparkline';
import { AnimatedNumber } from './AnimatedNumber';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

interface TokenTableProps {
  tokens: LiveTokenData[];
  onSelectToken: (token: LiveTokenData) => void;
  selectedIndex: number;
}

type SortKey = 'liveBuybackRate' | 'annualBuybackAmount' | 'liveMarketCap' | 'priceChange24h' | 'percentSupplyBoughtBack';

const TableRow = memo(function TableRow({
  token,
  rank,
  isSelected,
  onClick,
}: {
  token: LiveTokenData;
  rank: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        'group cursor-pointer border-b border-border/30 transition-colors',
        isSelected 
          ? 'bg-accent/10 border-l-2 border-l-accent' 
          : 'hover:bg-surface-light/50',
        token.priceDirection === 'up' && 'animate-flash-green',
        token.priceDirection === 'down' && 'animate-flash-red'
      )}
    >
      {/* Rank */}
      <td className="py-3 px-3 text-center">
        <span className="font-mono text-xs text-muted">#{rank}</span>
      </td>
      
      {/* Token */}
      <td className="py-3 px-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-light text-lg ring-1 ring-border/50">
            {token.logo}
          </div>
          <div>
            <div className="font-medium text-white group-hover:text-accent transition-colors">
              {token.symbol}
            </div>
            <div className="text-xs text-muted truncate max-w-[100px]">
              {token.name}
            </div>
          </div>
        </div>
      </td>
      
      {/* Price */}
      <td className="py-3 px-3 text-right">
        <div className="font-mono text-sm text-white">
          ${token.livePrice < 1 
            ? token.livePrice.toFixed(4) 
            : token.livePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
        <div className={clsx(
          'text-xs font-mono',
          token.priceChange24h >= 0 ? 'text-accent' : 'text-danger'
        )}>
          {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
        </div>
      </td>
      
      {/* Sparkline */}
      <td className="py-3 px-3">
        <Sparkline 
          data={token.sparkline} 
          width={80} 
          height={28}
        />
      </td>
      
      {/* Buyback Rate */}
      <td className="py-3 px-3 text-right">
        <div className={clsx(
          'font-mono text-sm font-bold',
          token.liveBuybackRate >= 10 ? 'text-accent' :
          token.liveBuybackRate >= 5 ? 'text-green-400' :
          token.liveBuybackRate >= 2 ? 'text-warning' : 'text-muted'
        )}>
          <AnimatedNumber
            value={token.liveBuybackRate}
            format="percent"
            decimals={2}
            showChange={true}
          />
        </div>
      </td>
      
      {/* Annual Buyback */}
      <td className="py-3 px-3 text-right">
        <AnimatedNumber
          value={token.annualBuybackAmount}
          format="currency"
          decimals={0}
          className="font-mono text-sm text-white"
          showChange={false}
        />
      </td>
      
      {/* Market Cap */}
      <td className="py-3 px-3 text-right">
        <AnimatedNumber
          value={token.liveMarketCap}
          format="currency"
          decimals={2}
          className="font-mono text-sm text-muted"
          showChange={false}
        />
      </td>
      
      {/* Supply Bought */}
      <td className="py-3 px-3 text-right">
        <div className="font-mono text-sm text-muted">
          {token.percentSupplyBoughtBack.toFixed(1)}%
        </div>
      </td>
      
      {/* Mechanism */}
      <td className="py-3 px-3">
        <span className={clsx(
          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
          token.mechanism === 'buyback-burn' && 'bg-danger/10 text-danger',
          token.mechanism === 'buyback-distribute' && 'bg-accent/10 text-accent',
          token.mechanism === 'buyback' && 'bg-warning/10 text-warning',
        )}>
          {token.mechanism === 'buyback-burn' ? '🔥 Burn' : 
           token.mechanism === 'buyback-distribute' ? '💰 Dist' : '📈 Buy'}
        </span>
      </td>
      
      {/* Chain */}
      <td className="py-3 px-3 text-right">
        <span className="text-xs text-muted bg-surface-light px-2 py-1 rounded">
          {token.chain}
        </span>
      </td>
    </tr>
  );
});

export function TokenTable({ tokens, onSelectToken, selectedIndex }: TokenTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('liveBuybackRate');
  const [sortDesc, setSortDesc] = useState(true);

  const sortedTokens = useMemo(() => {
    return [...tokens].sort((a, b) => {
      const multiplier = sortDesc ? -1 : 1;
      return (a[sortKey] - b[sortKey]) * multiplier;
    });
  }, [tokens, sortKey, sortDesc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <th
      onClick={() => handleSort(sortKeyName)}
      className="py-3 px-3 text-right text-xs font-medium text-muted uppercase tracking-wider cursor-pointer hover:text-white transition-colors group"
    >
      <div className="flex items-center justify-end gap-1">
        {label}
        {sortKey === sortKeyName ? (
          sortDesc ? <ArrowDown size={12} className="text-accent" /> : <ArrowUp size={12} className="text-accent" />
        ) : (
          <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-50" />
        )}
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-border/50 bg-surface/50 backdrop-blur">
      <table className="w-full min-w-[900px]">
        <thead className="bg-surface-light/50 border-b border-border/50">
          <tr>
            <th className="py-3 px-3 text-center text-xs font-medium text-muted uppercase tracking-wider w-12">
              #
            </th>
            <th className="py-3 px-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
              Token
            </th>
            <th className="py-3 px-3 text-right text-xs font-medium text-muted uppercase tracking-wider">
              Price
            </th>
            <th className="py-3 px-3 text-center text-xs font-medium text-muted uppercase tracking-wider">
              7D
            </th>
            <SortHeader label="Rate" sortKeyName="liveBuybackRate" />
            <SortHeader label="Annual" sortKeyName="annualBuybackAmount" />
            <SortHeader label="MCap" sortKeyName="liveMarketCap" />
            <SortHeader label="Bought" sortKeyName="percentSupplyBoughtBack" />
            <th className="py-3 px-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
              Type
            </th>
            <th className="py-3 px-3 text-right text-xs font-medium text-muted uppercase tracking-wider">
              Chain
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTokens.map((token, index) => (
            <TableRow
              key={token.id}
              token={token}
              rank={index + 1}
              isSelected={selectedIndex === index}
              onClick={() => onSelectToken(token)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

