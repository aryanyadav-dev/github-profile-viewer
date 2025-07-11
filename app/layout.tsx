import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gitviewer',
  description: 'An intelligent GitHub profile viewer that provides AI-driven insights and analysis of your GitHub presence',
  generator: 'Next.js',
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
