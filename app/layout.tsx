import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#2D333B',
  width: 'device-width',
  initialScale: 1.0,
}

export const metadata: Metadata = {
  title: 'Gitviewer - GitHub Profile Analysis',
  description: 'An intelligent GitHub profile viewer that provides AI-driven insights and analysis of your GitHub presence',
  generator: 'Next.js',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.svg'],
    apple: [
      { url: '/favicon.svg' }
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
