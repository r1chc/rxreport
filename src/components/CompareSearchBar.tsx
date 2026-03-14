'use client'

import { useRouter } from 'next/navigation'
import DrugSearchBar from './DrugSearchBar'

export default function CompareSearchBar({ currentSlug }: { currentSlug: string }) {
  const router = useRouter()
  return (
    <DrugSearchBar
      onSelect={(slug) => router.push(`/compare?a=${currentSlug}&b=${slug}`)}
    />
  )
}
