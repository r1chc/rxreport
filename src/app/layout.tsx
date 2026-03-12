import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import DisclaimerBanner from '@/components/DisclaimerBanner'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={`${inter.className} bg-white text-slate-900 min-h-screen`}>
        <nav className="border-b border-slate-200 px-6 py-3 flex items-center gap-6 sticky top-0 bg-white z-40">
          <a href="/" className="font-bold text-lg text-blue-600">RxReport</a>
          <a href="/top-drugs" className="text-sm text-slate-600 hover:text-slate-900">Top Drugs</a>
          <a href="/compare" className="text-sm text-slate-600 hover:text-slate-900">Compare</a>
          <a href="/about" className="text-sm text-slate-600 hover:text-slate-900">About</a>
        </nav>
        <main className="pb-24">{children}</main>
        <DisclaimerBanner />
      </body>
    </html>
  )
}
