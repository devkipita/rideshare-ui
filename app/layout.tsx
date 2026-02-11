import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Lexend } from 'next/font/google'
import { getServerSession } from 'next-auth'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth-provider'
import { authOptions } from '@/lib/auth'
import './globals.css'

const APP_NAME = 'RideShare'
const APP_DESCRIPTION = 'Share the road. Split the cost. Join a community of conscious travelers.'
const FAVICON_PATH = '/favicon_io'
const THEME_COLOR_LIGHT = '#f5f7f4'
const THEME_COLOR_DARK = '#0f1613'
const metadataBase = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : undefined

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
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLOR_LIGHT },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLOR_DARK },
  ],
}

export const metadata: Metadata = {
  ...(metadataBase ? { metadataBase } : {}),
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
  colorScheme: 'light dark',
  formatDetection: { telephone: true, address: false, email: false },
  manifest: `${FAVICON_PATH}/site.webmanifest`,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLOR_LIGHT },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLOR_DARK },
  ],
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
  const session = await getServerSession(authOptions)

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
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
