'use client';

import { useEffect, useRef, useState, memo } from 'react';
import clsx from 'clsx';

interface AnimatedNumberProps {
  value: number;
  format?: 'currency' | 'percent' | 'compact' | 'number';
  decimals?: number;
  className?: string;
  showChange?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  prefix?: string;
  suffix?: string;
}

function formatValue(value: number, format: string, decimals: number): string {
  switch (format) {
    case 'currency':
      if (value >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(decimals)}B`;
      }
      if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(decimals)}M`;
      }
      if (value >= 1_000) {
        return `$${(value / 1_000).toFixed(decimals)}K`;
      }
      return `$${value.toFixed(decimals)}`;
    case 'percent':
      return `${value.toFixed(decimals)}%`;
    case 'compact':
      if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(decimals)}B`;
      }
      if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(decimals)}M`;
      }
      if (value >= 1_000) {
        return `${(value / 1_000).toFixed(decimals)}K`;
      }
      return value.toFixed(decimals);
    default:
      return value.toLocaleString(undefined, { 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals 
      });
  }
}

export const AnimatedNumber = memo(function AnimatedNumber({
  value,
  format = 'number',
  decimals = 2,
  className = '',
  showChange = true,
  size = 'md',
  prefix = '',
  suffix = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const [changeDirection, setChangeDirection] = useState<'up' | 'down' | null>(null);
  const prevValue = useRef(value);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (Math.abs(value - prevValue.current) < 0.0001) return;

    const startValue = prevValue.current;
    const endValue = value;
    const duration = 500; // ms
    const startTime = performance.now();
    
    // Determine direction
    if (showChange) {
      setChangeDirection(endValue > startValue ? 'up' : 'down');
      setIsAnimating(true);
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValue.current = endValue;
        setTimeout(() => {
          setIsAnimating(false);
          setChangeDirection(null);
        }, 300);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, showChange]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  };

  return (
    <span
      className={clsx(
        'font-mono tabular-nums transition-colors duration-300',
        sizeClasses[size],
        isAnimating && changeDirection === 'up' && 'text-accent',
        isAnimating && changeDirection === 'down' && 'text-danger',
        className
      )}
    >
      {prefix}
      {formatValue(displayValue, format, decimals)}
      {suffix}
      {isAnimating && showChange && (
        <span className={clsx(
          'ml-1 text-xs animate-pulse',
          changeDirection === 'up' ? 'text-accent' : 'text-danger'
        )}>
          {changeDirection === 'up' ? '▲' : '▼'}
        </span>
      )}
    </span>
  );
});

