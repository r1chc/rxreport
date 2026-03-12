'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/drug-list'

interface DrugSearchBarProps {
  size?: 'default' | 'large'
  initialValue?: string
}

export default function DrugSearchBar({ size = 'default', initialValue = '' }: DrugSearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const router = useRouter()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const slug = slugify(query.trim())
    if (slug) router.push(`/drug/${slug}`)
  }

  const inputClass = size === 'large'
    ? 'flex-1 px-5 py-4 text-lg rounded-l-xl border border-gray-300 focus:outline-none focus:ring-2 text-gray-900 bg-white'
    : 'flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 text-gray-900 bg-white'

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search any drug name (e.g. Ozempic, Adderall, Lipitor)..."
        className={inputClass}
        style={{ '--tw-ring-color': '#1a3c34' } as React.CSSProperties}
        aria-label="Drug name"
      />
      <button
        type="submit"
        className={`font-semibold text-white transition-colors ${size === 'large' ? 'px-8 py-4 text-lg rounded-r-xl' : 'px-5 py-2 rounded-r-lg'}`}
        style={{ background: '#1a3c34' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#14532d')}
        onMouseLeave={e => (e.currentTarget.style.background = '#1a3c34')}
        aria-label="Search"
      >
        Look up →
      </button>
    </form>
  )
}
