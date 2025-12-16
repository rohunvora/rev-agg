# Buyback Tracker

**Real-time leaderboard tracking crypto protocols that actually buy back their tokens from the market.**

Unlike most DeFi protocols that just distribute fees to stakers, this tracks the rare protocols with verified buyback programs—where the protocol actively purchases tokens from the open market. Get P/E ratios, buyback yields, and trend data for protocols like Hyperliquid, pump.fun, Maker, and Aave that are actually reducing token supply through market purchases.

**🔗 Live App:** [rev-agg.vercel.app](https://rev-agg.vercel.app)

## What It Does

- **Curated Buyback List** — Only protocols with verified market buyback mechanisms (not fee distribution)
- **Real-time Metrics** — P/E ratios, buyback yields, 7-day trends updated every 30 seconds
- **Revenue Comparison** — See top revenue generators and which ones have buyback programs
- **Market Analysis** — Compare buyback efficiency across protocols with standardized metrics

## Key Features

### 📊 Dual Dashboard View

**Buybacks Tab**
- Verified protocols that buy tokens from open market
- P/E ratios based on buyback amounts vs market cap
- Annualized buyback yield as % of market cap
- 7-day buyback and price trend indicators

**Revenue Tab**
- Top 30 protocols by daily revenue
- 🔄 Badge indicates which have buyback programs
- Sortable by daily revenue, 7d change, 30d totals

### 📈 Core Metrics

| Metric | Description |
|--------|-------------|
| **Daily Avg** | 30-day average daily buyback amount |
| **P/E** | Market Cap ÷ Annual Buybacks (lower = better value) |
| **% MCap/yr** | Annualized buyback as % of market cap |
| **BB 7d** | Buyback trend vs previous week |
| **Price 7d** | Token price change over 7 days |

## Verified Buyback Protocols

Only includes protocols that **purchase tokens from the open market**:

| Protocol | Symbol | Buyback Mechanism |
|----------|--------|-------------------|
| Hyperliquid | HYPE | Assistance Fund market purchases |
| pump.fun | PUMP | Protocol revenue buys PUMP |
| ORE | ORE | Direct market purchases |
| Maker (Sky) | MKR | Smart Burn Engine buys & burns |
| Aave | AAVE | Treasury buybacks for safety module |
| Raydium | RAY | 12% of fees → buy & burn |
| PancakeSwap | CAKE | Weekly buy & burn program |
| SushiSwap | SUSHI | Market buys for xSUSHI rewards |
| Banana Gun | BANANA | 40% of fees → buy & burn |

**Excluded:** Protocols that only distribute fees to stakers (Curve, GMX, dYdX, Pendle, etc.)

## Data Sources

- **DefiLlama API** — Buyback and revenue data via `dailyHoldersRevenue` endpoints
- **CoinGecko API** — Real-time price and market cap data
- **Manual Verification** — Each protocol's buyback mechanism researched and verified

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Real-time updates** every 30 seconds

## Development

```bash
# Clone and install
git clone https://github.com/yourusername/rev-agg
cd rev-agg
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## Contributing

Found a protocol with a verified buyback program? Open an issue with:
- Protocol name and token symbol
- Documentation of their buyback mechanism
- Link to official announcement or code

---

**Note:** This tool focuses specifically on protocols that reduce circulating supply through market purchases, not fee distribution to holders. The manual curation ensures data quality but means the list is intentionally selective.