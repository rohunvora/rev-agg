# Buyback Tracker

A real-time dashboard that aggregates cryptocurrency tokens with buyback programs and visualizes their buyback rates relative to market cap.

## Features

- **Live Overview**: Track total annual buybacks, average rates, and cumulative buyback data across all protocols
- **Interactive Charts**: Monthly buyback volume trends, rate comparisons, and category distribution
- **Protocol Cards**: Detailed cards showing buyback rate, annual volume, market cap, and mechanism type
- **Advanced Filtering**: Search, sort, and filter by buyback mechanism type
- **Detailed Modal View**: Click any protocol for monthly activity charts and comprehensive stats

## Tracked Protocols

The dashboard currently tracks 12 major protocols with active buyback programs:

| Protocol | Symbol | Buyback Rate | Mechanism |
|----------|--------|--------------|-----------|
| Hyperliquid | HYPE | 12.39% | Buyback + Burn |
| PancakeSwap | CAKE | 21.32% | Buyback + Burn |
| GMX | GMX | 8.42% | Buyback + Distribute |
| Raydium | RAY | 7.5% | Buyback + Burn |
| Maker | MKR | 5.3% | Buyback + Burn |
| Synthetix | SNX | 2.88% | Buyback + Burn |
| Pendle | PENDLE | 2.68% | Buyback + Distribute |
| Lido | LDO | 2.0% | Buyback |
| Jupiter | JUP | 1.98% | Buyback |
| dYdX | DYDX | 1.57% | Buyback + Distribute |
| BNB | BNB | 1.28% | Buyback + Burn |
| Aave | AAVE | 0.96% | Buyback + Distribute |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Language**: TypeScript

## Data Sources

Data is aggregated from:
- Protocol documentation and governance proposals
- On-chain transaction data
- DefiLlama and Token Terminal
- Official announcements

---

Built with 🔥 for the crypto community

