'use client'

import { useState } from 'react'

export default function NavBar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="px-4 py-3 sticky top-0 z-40" style={{ background: '#1a3c34' }}>
      <div className="flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-black" style={{ background: '#d1fae5', color: '#1a3c34' }}>Rx</div>
          <span className="font-semibold text-white tracking-tight">RxReport</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <a href="/top-drugs" className="text-sm text-emerald-200 hover:text-white transition-colors">Top Drugs</a>
          <a href="/categories" className="text-sm text-emerald-200 hover:text-white transition-colors">Categories</a>
          <a href="/compare" className="text-sm text-emerald-200 hover:text-white transition-colors">Compare</a>
          <a href="/about" className="text-sm text-emerald-200 hover:text-white transition-colors">About</a>
        </div>

        {/* Desktop FDA badge */}
        <div className="hidden md:flex items-center gap-1.5 text-xs" style={{ color: '#6ee7b7' }}>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Official FDA Data
        </div>

        {/* Mobile: FDA badge + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <span className="text-xs" style={{ color: '#6ee7b7' }}>✓ FDA Data</span>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="flex flex-col justify-center items-center gap-1.5 w-8 h-8"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden mt-3 pb-2 flex flex-col gap-1 border-t border-emerald-800 pt-3">
          {[
            { href: '/top-drugs', label: 'Top Drugs' },
            { href: '/categories', label: 'Categories' },
            { href: '/compare', label: 'Compare' },
            { href: '/about', label: 'About' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="text-sm text-emerald-200 hover:text-white transition-colors py-2 px-1"
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
