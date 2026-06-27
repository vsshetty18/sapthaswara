/* ============================================================
   SVARAVERSE AI — Root Layout
   Providers | Fonts | Metadata | Theme | Toasts
   ============================================================ */

import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

import { AuthProvider }  from '@/context/AuthContext'
import { ThemeProvider, themeScript } from '@/context/ThemeContext'
import { APP_NAME, APP_DESCRIPTION, APP_URL } from '@/lib/constants'

import '@/app/globals.css'

// ─── FONTS ──────────────────────────────────────────────────────────────────

const playfairDisplay = Playfair_Display({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700', '800', '900'],
  style:    ['normal', 'italic'],
  variable: '--font-display',
  display:  'swap',
  preload:  true,
})

const dmSans = DM_Sans({
  subsets:   ['latin'],
  weight:    ['300', '400', '500', '600', '700'],
  style:     ['normal', 'italic'],
  variable:  '--font-body',
  display:   'swap',
  preload:   true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets:  ['latin'],
  weight:   ['400', '500', '600'],
  variable: '--font-mono',
  display:  'swap',
  preload:  false,
})

// ─── METADATA ───────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default:  `${APP_NAME} — AI-Powered Indian Music Creator Platform`,
    template: `%s | ${APP_NAME}`,
  },

  description: APP_DESCRIPTION,

  keywords: [
    'Indian music creator',
    'AI music coach',
    'playback singer',
    'Bollywood singer',
    'music practice app',
    'singer app India',
    'riyaz app',
    'YouTube music creator',
    'Instagram musician',
    'music analytics India',
    'AI singing coach',
    'SvaraVerse',
    'music productivity',
    'singer toolkit',
    'Indian classical music app',
  ],

  authors: [{ name: 'SvaraVerse AI', url: APP_URL }],

  creator:   'SvaraVerse AI',
  publisher: 'SvaraVerse AI',

  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:             true,
      follow:            true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  openGraph: {
    type:        'website',
    locale:      'en_IN',
    url:          APP_URL,
    siteName:    APP_NAME,
    title:       `${APP_NAME} — AI-Powered Indian Music Creator Platform`,
    description: APP_DESCRIPTION,
    images: [
      {
        url:    `${APP_URL}/og-image.png`,
        width:   1200,
        height:  630,
        alt:    `${APP_NAME} — Indian Music Creator Platform`,
      },
    ],
  },

  twitter: {
    card:        'summary_large_image',
    site:        '@svaraverseai',
    creator:     '@svaraverseai',
    title:       `${APP_NAME} — AI-Powered Indian Music Creator Platform`,
    description: APP_DESCRIPTION,
    images:      [`${APP_URL}/og-image.png`],
  },

  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple:   [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    other:   [{ rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#B45309' }],
  },

  manifest: '/site.webmanifest',

  alternates: {
    canonical: APP_URL,
    languages: {
      'en-IN': APP_URL,
      'hi-IN': `${APP_URL}/hi`,
    },
  },

  category: 'music',
}

export const viewport: Viewport = {
  width:               'device-width',
  initialScale:        1,
  maximumScale:        5,
  userScalable:        true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF5E8' },
    { media: '(prefers-color-scheme: dark)',  color: '#1A1008' },
  ],
  colorScheme: 'light dark',
}

// ─── ROOT LAYOUT ────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`
        ${playfairDisplay.variable}
        ${dmSans.variable}
        ${jetbrainsMono.variable}
      `}
    >
      <head>
        {/* ── Anti-flash theme script (blocking) ─────────── */}
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />

        {/* ── DNS prefetch for external services ─────────── */}
        <link rel="dns-prefetch"    href="//fonts.googleapis.com" />
        <link rel="dns-prefetch"    href="//fonts.gstatic.com" />
        <link rel="dns-prefetch"    href="//firebaseapp.com" />
        <link rel="preconnect"      href="https://fonts.googleapis.com" />
        <link rel="preconnect"      href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ── Devanagari font for Hindi support ──────────── */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600&family=Noto+Serif+Devanagari:wght@400;600;700&display=swap"
          rel="stylesheet"
        />

        {/* ── PWA Meta ────────────────────────────────────── */}
        <meta name="application-name"  content={APP_NAME} />
        <meta name="apple-mobile-web-app-capable"          content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title"            content={APP_NAME} />
        <meta name="mobile-web-app-capable"                content="yes" />
        <meta name="msapplication-TileColor"               content="#B45309" />
        <meta name="msapplication-tap-highlight"           content="no" />

        {/* ── Structured Data ─────────────────────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context':   'https://schema.org',
              '@type':      'SoftwareApplication',
              name:         APP_NAME,
              description:  APP_DESCRIPTION,
              url:          APP_URL,
              applicationCategory: 'MusicApplication',
              operatingSystem:     'Web, Android, iOS',
              offers: {
                '@type':   'Offer',
                price:     '0',
                priceCurrency: 'INR',
              },
              author: {
                '@type': 'Organization',
                name:    'SvaraVerse AI',
                url:     APP_URL,
              },
            }),
          }}
        />
      </head>

      <body
        className="
          font-body bg-cream text-text-primary
          antialiased min-h-screen min-h-dvh
          dark:bg-walnut-900 dark:text-cream-100
          transition-colors duration-300
        "
        suppressHydrationWarning
      >
        {/* ── Theme Provider (outermost — no Firebase deps) ─ */}
        <ThemeProvider>

          {/* ── Auth Provider ──────────────────────────────── */}
          <AuthProvider>

            {/* ── Main Content ────────────────────────────── */}
            <main id="main-content">
              {children}
            </main>

            {/* ── Toast Notifications ─────────────────────── */}
            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={8}
              containerStyle={{
                top:   24,
                right: 24,
              }}
              toastOptions={{
                // Default options
                duration: 4000,
                style: {
                  fontFamily:  'var(--font-body)',
                  fontSize:    '0.875rem',
                  fontWeight:  '500',
                  borderRadius:'1rem',
                  padding:     '0.75rem 1rem',
                  maxWidth:    '380px',
                  boxShadow:   '0 8px 24px rgba(110,72,24,0.15)',
                },

                // Success toasts
                success: {
                  duration: 3500,
                  iconTheme: {
                    primary:   '#B45309',
                    secondary: '#FAF5E8',
                  },
                  style: {
                    background:  '#FAF5E8',
                    color:       '#2A1D08',
                    border:      '1px solid rgba(235,217,176,0.8)',
                  },
                },

                // Error toasts
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary:   '#B91C1C',
                    secondary: '#FAF5E8',
                  },
                  style: {
                    background: '#FAF5E8',
                    color:      '#7F1D1D',
                    border:     '1px solid rgba(185,28,28,0.2)',
                  },
                },

                // Loading toasts
                loading: {
                  iconTheme: {
                    primary:   '#F59E0B',
                    secondary: '#FAF5E8',
                  },
                  style: {
                    background: '#FAF5E8',
                    color:      '#2A1D08',
                    border:     '1px solid rgba(235,217,176,0.8)',
                  },
                },
              }}
            />

          </AuthProvider>
        </ThemeProvider>

        {/* ── Skip to main content (accessibility) ────────── */}
        <a
          href="#main-content"
          className="
            sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
            focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-xl
            focus:bg-gold focus:text-walnut-900 focus:font-semibold
            focus:shadow-gold-lg
          "
        >
          Skip to main content
        </a>
      </body>
    </html>
  )
}
