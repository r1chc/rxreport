'use client'

import { useState } from 'react'

interface Category {
  slug: string
  name: string
  drugs: string[]
}

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.drugs.some((d) => d.toLowerCase().includes(query.toLowerCase()))
      )
    : categories

  const featured = categories.slice(0, 6)
  const allSorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
  const showFeatured = !query.trim()

  return (
    <div>
      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 mb-8 max-w-sm shadow-sm">
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search categories or drugs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        )}
      </div>

      {/* Featured — top 6 by drug count */}
      {showFeatured && (
        <div className="mb-9">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Most populated classes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((cat) => (
              <a
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group block bg-white rounded-2xl border border-gray-100 p-5 hover:border-green-200 hover:shadow-md transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: '#1a3c34' }} />
                <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  Drug class · {cat.drugs.length} drugs
                </div>
                <div className="text-base font-bold text-gray-900 mb-3 group-hover:text-[#1a3c34] transition-colors">
                  {cat.name}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.drugs.slice(0, 3).map((drug) => (
                    <span key={drug} className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-100">
                      {drug}
                    </span>
                  ))}
                  {cat.drugs.length > 3 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">
                      +{cat.drugs.length - 3} more
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* A–Z list */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          {showFeatured ? 'All Categories (A–Z)' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
        </p>

        {filtered.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">No categories match "{query}"</p>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {allSorted.map((cat, i) => (
              <a
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="flex items-center px-5 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
              >
                <span className="flex-1 text-sm font-medium text-gray-800">{cat.name}</span>
                <span className="text-xs text-gray-400 mr-4 tabular-nums">
                  {cat.drugs.length} drug{cat.drugs.length !== 1 ? 's' : ''}
                </span>
                <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
