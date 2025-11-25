import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Buyback Tracker - Track crypto token buybacks'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f7f4',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.1) 100%)',
          }}
        />
        
        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#1a1a1a',
              margin: 0,
              letterSpacing: '-2px',
            }}
          >
            Buyback Tracker
          </h1>
          
          <p
            style={{
              fontSize: 32,
              color: '#666',
              margin: '24px 0 0 0',
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            Which crypto tokens are buying themselves back?
          </p>
          
          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: '48px',
              marginTop: '48px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px 40px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              <span style={{ fontSize: 20, color: '#999' }}>Top Daily</span>
              <span style={{ fontSize: 36, fontWeight: 600, color: '#1a1a1a' }}>$3M+</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px 40px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              <span style={{ fontSize: 20, color: '#999' }}>Protocols</span>
              <span style={{ fontSize: 36, fontWeight: 600, color: '#1a1a1a' }}>20+</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px 40px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              <span style={{ fontSize: 20, color: '#999' }}>Live Data</span>
              <span style={{ fontSize: 36, fontWeight: 600, color: '#16a34a' }}>●</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#999',
            fontSize: 18,
          }}
        >
          rev-agg.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

