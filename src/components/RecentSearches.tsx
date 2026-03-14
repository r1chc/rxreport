'use client'

import { useEffect, useState } from 'react'

interface RecentDrug {
  name: string
  slug: string
}

export default function RecentSearches() {
  const [recents, setRecents] = useState<RecentDrug[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rxreport_recent_searches')
      if (stored) setRecents(JSON.parse(stored))
    } catch {}
  }, [])

  if (!recents.length) return null

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center mt-4">
      <span className="text-xs text-emerald-200 opacity-70">Recent:</span>
      {recents.map((drug) => (
        <a
          key={drug.slug}
          href={`/drug/${drug.slug}`}
          className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
          style={{ background: 'rgba(209,250,229,.12)', color: '#6ee7b7', border: '1px solid rgba(209,250,229,.2)' }}
        >
          {drug.name}
        </a>
      ))}
    </div>
  )
}
