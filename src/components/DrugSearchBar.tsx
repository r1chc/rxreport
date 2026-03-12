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
    ? 'flex-1 px-5 py-4 text-lg rounded-l-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'flex-1 px-4 py-2 rounded-l-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500'

  const buttonClass = size === 'large'
    ? 'px-8 py-4 text-lg bg-blue-600 text-white rounded-r-xl hover:bg-blue-700 transition-colors'
    : 'px-5 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search any drug name (e.g. Ozempic, Adderall, Lipitor)..."
        className={inputClass}
        aria-label="Drug name"
      />
      <button type="submit" className={buttonClass} aria-label="Search">
        Search
      </button>
    </form>
  )
}
