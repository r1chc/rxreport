import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import Footer from '@/components/Footer'
import NavBar from '@/components/NavBar'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: {
    default: 'RxReport — FDA Drug Side Effects, Visualized',
    template: '%s | RxReport',
  },
  description:
    'Look up real FDA adverse event reports for any drug. Charts, trends, and demographics sourced directly from openFDA.',
  metadataBase: new URL('https://rxreport.com'),
  openGraph: {
    type: 'website',
    siteName: 'RxReport',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? 'ca-pub-XXXXXXXXXXXXXXXX'}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col w-full overflow-x-hidden`}>
        <NavBar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <DisclaimerBanner />
      </body>
    </html>
  )
}
