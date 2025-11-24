import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Buyback Tracker | Crypto Revenue Aggregator',
  description: 'Track and analyze cryptocurrency token buyback programs relative to market cap',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}

