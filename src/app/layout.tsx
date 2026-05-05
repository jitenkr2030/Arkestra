import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'SymphonyHub - Orchestra Management',
  description: 'Comprehensive orchestra management platform for events, members, and bookings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}