'use client'

import { useEffect } from 'react'

export default function RecordDrugView({ name, slug }: { name: string; slug: string }) {
  useEffect(() => {
    try {
      const key = 'rxreport_recent_searches'
      const existing: { name: string; slug: string }[] = JSON.parse(localStorage.getItem(key) ?? '[]')
      const filtered = existing.filter((d) => d.slug !== slug)
      const updated = [{ name, slug }, ...filtered].slice(0, 8)
      localStorage.setItem(key, JSON.stringify(updated))
    } catch {}
  }, [name, slug])

  return null
}
