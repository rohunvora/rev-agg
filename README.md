# Buyback Tracker

A real-time leaderboard tracking crypto tokens with active buyback programs.

**Live:** [rev-agg.vercel.app](https://rev-agg.vercel.app)

## What It Does

Tracks which tokens are buying themselves back and how much:
- **Daily Buyback** — Average daily buyback in USD
- **% of MCap** — Annualized buyback as percentage of market cap
- **7d Trend** — Whether buybacks are increasing or decreasing
- **Price 7d** — Price movement for comparison

Click any row to see detailed stats, charts, and business model info.

## Data Sources

- **DefiLlama** — Buyback/revenue data via `dailyHoldersRevenue`
- **CoinGecko** — Price and market cap data

Data refreshes every 30 seconds.

## Tech Stack

- **Next.js 14** — App Router
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Recharts** — Charts
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
│   ├── page.tsx           # Main leaderboard page
│   ├── layout.tsx         # Root layout + meta tags
│   ├── globals.css        # Global styles
│   ├── opengraph-image.tsx # OG image generation
│   └── twitter-image.tsx   # Twitter card image
├── lib/
│   ├── types.ts           # Shared TypeScript types
│   ├── protocols.ts       # Protocol configurations
│   └── defillama.ts       # Data fetching functions
```

## Adding a New Protocol

1. Find the protocol on DefiLlama and get its slug
2. Find the token on CoinGecko and get its ID
3. Add entry to `lib/protocols.ts`:

```typescript
{
  slug: 'protocol-slug',      // DefiLlama slug
  name: 'Protocol Name',
  symbol: 'TOKEN',
  geckoId: 'coingecko-id',    // CoinGecko ID
  buybackSource: 'Where buyback funds come from',
  businessModel: 'How the protocol makes money',
  growthDrivers: 'What could drive growth',
  risks: 'Key risks to consider',
}
```

## License

MIT
