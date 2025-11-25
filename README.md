# Buyback Tracker

A real-time leaderboard tracking crypto protocols with verified buyback programs and top revenue generators.

**Live:** [rev-agg.vercel.app](https://rev-agg.vercel.app)

## Features

### 📊 Two Views

**Buybacks Tab** — Protocols with verified buyback mechanisms
- Only includes tokens that actively buy from the open market
- Shows: Market Cap, Daily Avg, P/E, % MCap/yr, 7d trends

**Revenue Tab** — Top 30 protocols by daily revenue
- All major revenue-generating protocols
- Shows which ones have buyback programs (🔄 badge)
- Sortable by Daily, 7d Change, 30d Total

### 📈 Key Metrics

| Metric | Description |
|--------|-------------|
| Daily Avg | 30-day average daily buyback amount |
| P/E | Market Cap ÷ Annual Buybacks (lower = cheaper) |
| % MCap/yr | Annualized buyback as % of market cap |
| BB 7d | Buyback trend vs prior week |
| Price 7d | Price change over 7 days |

### ⚡ Real-time
- Data refreshes every 30 seconds
- Flash animation when values change
- Skeleton loading state for better UX

## Data Sources

- **DefiLlama** — Buyback/revenue data via `dailyHoldersRevenue` and `fees`
- **CoinGecko** — Price and market cap data

## Verified Buyback Protocols

Only protocols that **actively purchase their token from the open market**:

| Protocol | Symbol | Mechanism |
|----------|--------|-----------|
| Hyperliquid | HYPE | Assistance Fund buys from market |
| pump.fun | PUMP | Protocol buys PUMP |
| ORE | ORE | Protocol buys ORE |
| Maker (Sky) | MKR | Smart Burn Engine buys & burns |
| Aave | AAVE | Treasury buys for safety module |
| Raydium | RAY | 12% of fees buy & burn |
| PancakeSwap | CAKE | Weekly buy & burn |
| SushiSwap | SUSHI | Buys for xSUSHI pool |
| Banana Gun | BANANA | 40% of fees buy & burn |

**Excluded:** Protocols that only distribute fees to stakers (Curve, GMX, dYdX, Pendle, etc.)

## Tech Stack

- **Next.js 14** — App Router
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Recharts** — Charts in detail modal
- **Vercel** — Hosting

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run type-check

# Build for production
npm run build
```

## Project Structure

```
├── app/
│   ├── page.tsx           # Main page (both tabs)
│   ├── layout.tsx         # Root layout + meta tags
│   ├── globals.css        # Global styles
│   ├── opengraph-image.tsx
│   └── twitter-image.tsx
├── lib/
│   ├── types.ts           # Shared TypeScript types
│   ├── protocols.ts       # Buyback protocol configs
│   └── defillama.ts       # Data fetching (DefiLlama + CoinGecko)
```

## Adding a New Buyback Protocol

1. Verify the protocol **actually buys tokens from the market** (not just fee distribution)
2. Find the protocol on DefiLlama and get its slug
3. Find the token on CoinGecko and get its ID
4. Add entry to `lib/protocols.ts`
5. Add slug to `BUYBACK_SLUGS` in `lib/defillama.ts`

## License

MIT
