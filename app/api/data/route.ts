/**
 * API route for cached data
 * 
 * Uses server-side caching to reduce API calls and improve load times
 * Data is cached for 2 minutes, shared across all users
 */

import { NextResponse } from 'next/server';
import { getBuybacksData, getRevenueData, getCleanMarketData } from '@/lib/data-server';

// This route uses cached data, so we can enable static generation
export const dynamic = 'force-dynamic';
export const revalidate = 120; // Revalidate every 2 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'buybacks';
  
  try {
    if (type === 'revenue') {
      const data = await getRevenueData();
      return NextResponse.json({ 
        data, 
        timestamp: Date.now(),
        cached: true 
      });
    }
    
    if (type === 'market') {
      const data = await getCleanMarketData();
      return NextResponse.json({ 
        data, 
        timestamp: Date.now(),
        cached: true 
      });
    }
    
    const data = await getBuybacksData();
    return NextResponse.json({ 
      data, 
      timestamp: Date.now(),
      cached: true 
    });
  } catch (error) {
    console.error('[API] Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

