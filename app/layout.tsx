import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Buyback Tracker',
  description: 'Track crypto protocols with verified buyback programs. See which tokens are being bought from the open market daily.',
  keywords: ['crypto', 'buyback', 'tokens', 'defi', 'trading', 'investment'],
  authors: [{ name: 'Buyback Tracker' }],
  openGraph: {
    title: 'Buyback Tracker',
    description: 'Track crypto protocols with verified buyback programs. See which tokens are being bought from the open market daily.',
    url: 'https://rev-agg.vercel.app',
    siteName: 'Buyback Tracker',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buyback Tracker',
    description: 'Track crypto protocols with verified buyback programs. See which tokens are being bought from the open market daily.',
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
