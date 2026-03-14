'use client'

import { useRouter } from 'next/navigation'
import DrugSearchBar from './DrugSearchBar'
import { unslugify } from '@/lib/drug-list'

interface Props {
  slugA: string
  slugB: string
}

export default function CompareInputs({ slugA, slugB }: Props) {
  const router = useRouter()

  return (
    <div className="flex gap-4 mb-8 flex-wrap">
      <div className="flex-1">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Drug A</label>
        <DrugSearchBar
          initialValue={slugA ? unslugify(slugA) : ''}
          onSelect={(slug) => router.push(`/compare?a=${slug}${slugB ? `&b=${slugB}` : ''}`)}
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Drug B</label>
        <DrugSearchBar
          initialValue={slugB ? unslugify(slugB) : ''}
          onSelect={(slug) => router.push(`/compare?b=${slug}${slugA ? `&a=${slugA}` : ''}`)}
        />
      </div>
    </div>
  )
}
