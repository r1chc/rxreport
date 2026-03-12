'use client'

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/drug-list'

interface DrugSearchBarProps {
  size?: 'default' | 'large'
  initialValue?: string
}

let cachedDrugs: string[] | null = null

async function getDrugList(): Promise<string[]> {
  if (cachedDrugs) return cachedDrugs
  const res = await fetch('/drug-list.json')
  cachedDrugs = await res.json()
  return cachedDrugs!
}

export default function DrugSearchBar({ size = 'default', initialValue = '' }: DrugSearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleChange(value: string) {
    setQuery(value)
    setActiveIndex(-1)
    if (value.trim().length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }
    const drugs = await getDrugList()
    const lower = value.toLowerCase()
    const matches = drugs
      .filter((d) => d.toLowerCase().startsWith(lower))
      .slice(0, 8)
    // If nothing starts with it, fall back to "contains"
    const results = matches.length > 0
      ? matches
      : drugs.filter((d) => d.toLowerCase().includes(lower)).slice(0, 8)
    setSuggestions(results)
    setOpen(results.length > 0)
  }

  function navigate(drug: string) {
    setQuery(drug)
    setOpen(false)
    router.push(`/drug/${slugify(drug)}`)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const target = activeIndex >= 0 ? suggestions[activeIndex] : query.trim()
    const slug = slugify(target)
    if (slug) {
      setOpen(false)
      router.push(`/drug/${slug}`)
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'Tab' && open && suggestions.length > 0) {
      e.preventDefault()
      const pick = suggestions[activeIndex >= 0 ? activeIndex : 0]
      setQuery(pick)
      setOpen(false)
    }
  }

  const isLarge = size === 'large'

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search any drug name (e.g. Ozempic, Adderall, Lipitor)..."
          className={`flex-1 border border-gray-300 focus:outline-none focus:ring-2 text-gray-900 bg-white ${
            isLarge
              ? `px-5 py-4 text-lg ${open ? 'rounded-tl-xl' : 'rounded-l-xl'}`
              : `px-4 py-2 ${open ? 'rounded-tl-lg' : 'rounded-l-lg'}`
          }`}
          style={{ '--tw-ring-color': '#1a3c34' } as React.CSSProperties}
          aria-label="Drug name"
          aria-autocomplete="list"
          aria-expanded={open}
          autoComplete="off"
        />
        <button
          type="submit"
          className={`font-semibold text-white transition-colors ${
            isLarge
              ? `px-8 py-4 text-lg ${open ? 'rounded-tr-xl' : 'rounded-r-xl'}`
              : `px-5 py-2 ${open ? 'rounded-tr-lg' : 'rounded-r-lg'}`
          }`}
          style={{ background: '#1a3c34' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#14532d')}
          onMouseLeave={e => (e.currentTarget.style.background = '#1a3c34')}
          aria-label="Search"
        >
          Look up →
        </button>
      </form>

      {open && (
        <ul
          className="absolute left-0 right-0 bg-white border border-t-0 border-gray-300 shadow-lg z-50 overflow-hidden"
          style={{ borderRadius: `0 0 ${isLarge ? '0.75rem' : '0.5rem'} ${isLarge ? '0.75rem' : '0.5rem'}` }}
          role="listbox"
        >
          {suggestions.map((drug, i) => {
            const lower = query.toLowerCase()
            const matchStart = drug.toLowerCase().indexOf(lower)
            const before = drug.slice(0, matchStart)
            const match = drug.slice(matchStart, matchStart + query.length)
            const after = drug.slice(matchStart + query.length)
            return (
              <li
                key={drug}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={() => navigate(drug)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`px-4 py-2.5 cursor-pointer text-sm flex items-center gap-2 ${
                  i === activeIndex ? 'text-white' : 'text-gray-800 hover:bg-gray-50'
                }`}
                style={i === activeIndex ? { background: '#1a3c34' } : {}}
              >
                <svg className="w-3.5 h-3.5 opacity-40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>
                  {before}
                  <strong>{match}</strong>
                  {after}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
