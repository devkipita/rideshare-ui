import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Lexend } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth-provider'
import { authOptions } from '@/lib/auth'
import { Toaster } from 'sonner'
import './globals.css'

const APP_NAME = 'Kipita'
const APP_DESCRIPTION = 'Share the road. Split the cost.'
const FAVICON_PATH = '/favicon_io'
const THEME_COLOR_LIGHT = '#f5f7f4'
const THEME_COLOR_DARK = '#0f1613'

function resolveMetadataBase() {
  const fallback = 'http://localhost:3000'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim()
  const vercelUrl = process.env.VERCEL_URL?.trim()

  const candidate =
    siteUrl || nextAuthUrl || (vercelUrl ? `https://${vercelUrl}` : fallback)

  try {
    return new URL(candidate)
  } catch {
    return new URL(fallback)
  }
}

const metadataBase = resolveMetadataBase()

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-lexend',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLOR_LIGHT },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLOR_DARK },
  ],
}

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${APP_NAME} | Carpool Community`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  generator: 'Next.js 16',
  keywords: ['carpool', 'rideshare', 'commute', 'Nairobi', 'Nanyuki', 'travel'],
  category: 'travel',
  authors: [{ name: APP_NAME }],
  referrer: 'origin-when-cross-origin',
  formatDetection: { telephone: true, address: false, email: false },
  manifest: `${FAVICON_PATH}/site.webmanifest`,
  icons: {
    icon: [
      { url: `${FAVICON_PATH}/favicon.ico`, rel: 'icon' },
      { url: `${FAVICON_PATH}/favicon-32x32.png`, rel: 'icon', sizes: '32x32', type: 'image/png' },
      { url: `${FAVICON_PATH}/favicon-16x16.png`, rel: 'icon', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: [`${FAVICON_PATH}/favicon.ico`],
    apple: [{ url: `${FAVICON_PATH}/apple-touch-icon.png`, sizes: '180x180' }],
    other: [{ rel: 'manifest', url: `${FAVICON_PATH}/site.webmanifest` }],
  },
  openGraph: {
    title: `${APP_NAME} | Share the road`,
    description: APP_DESCRIPTION,
    url: '/',
    siteName: APP_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${FAVICON_PATH}/android-chrome-512x512.png`,
        width: 512,
        height: 512,
        alt: `${APP_NAME} app icon`,
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: `${APP_NAME} | Share the road`,
    description: APP_DESCRIPTION,
    images: [`${FAVICON_PATH}/android-chrome-192x192.png`],
  },
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: 'default',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // guard against missing/misconfigured auth env in production so the app keeps rendering
  const session = await (async () => {
    try {
      return await getServerSession(authOptions)
    } catch {
      return null
    }
  })()

  return (
    <html lang="en" className={lexend.variable} suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`font-lexend antialiased min-h-screen bg-background text-foreground`}>
        <AuthProvider session={session}>
          <div className="flex flex-col h-screen w-full max-w-md mx-auto relative">
            {children}
          </div>
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
