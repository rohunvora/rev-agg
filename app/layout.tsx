import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Buyback Tracker',
  description: 'Real-time crypto token buyback data aggregated from DefiLlama',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
