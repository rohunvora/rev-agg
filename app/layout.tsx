import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Buyback Tracker',
  description: 'Which crypto tokens are buying themselves back? Track daily buybacks, see trends, and find opportunities.',
  keywords: ['crypto', 'buyback', 'tokens', 'defi', 'trading', 'investment'],
  authors: [{ name: 'Buyback Tracker' }],
  openGraph: {
    title: 'Buyback Tracker',
    description: 'Which crypto tokens are buying themselves back? Track daily buybacks, see trends, and find opportunities.',
    url: 'https://rev-agg.vercel.app',
    siteName: 'Buyback Tracker',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buyback Tracker',
    description: 'Which crypto tokens are buying themselves back? Track daily buybacks, see trends, and find opportunities.',
  },
  robots: {
    index: true,
    follow: true,
  },
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
