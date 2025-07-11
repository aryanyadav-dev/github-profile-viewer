import type { Metadata } from 'next'
import './globals.css'

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
  themeColor: '#2D333B',
  viewport: 'width=device-width, initial-scale=1.0',
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
