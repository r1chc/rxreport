import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import DisclaimerBanner from '@/components/DisclaimerBanner'
import Footer from '@/components/Footer'

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
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <nav className="px-6 py-3 flex items-center gap-6 sticky top-0 z-40" style={{ background: '#1a3c34' }}>
          <a href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-black" style={{ background: '#d1fae5', color: '#1a3c34' }}>Rx</div>
            <span className="font-semibold text-white tracking-tight">RxReport</span>
          </a>
          <a href="/top-drugs" className="text-sm text-emerald-200 hover:text-white transition-colors">Top Drugs</a>
          <a href="/categories" className="text-sm text-emerald-200 hover:text-white transition-colors">Categories</a>
          <a href="/compare" className="text-sm text-emerald-200 hover:text-white transition-colors">Compare</a>
          <a href="/about" className="text-sm text-emerald-200 hover:text-white transition-colors">About</a>
          <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: '#6ee7b7' }}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Official FDA Data
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <Footer />
        <DisclaimerBanner />
      </body>
    </html>
  )
}
