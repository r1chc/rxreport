import type { BreakdownItem } from '@/types/fda'
import { slugify } from '@/lib/drug-list'

interface Props {
  drugs: BreakdownItem[]
  currentSlug: string
}

export default function CoReportedDrugs({ drugs, currentSlug }: Props) {
  if (!drugs.length) return <p className="text-sm text-gray-400">No co-reported drug data available.</p>

  const max = Math.max(...drugs.map((d) => d.percentage), 1)

  return (
    <div className="space-y-3">
      {drugs.map((drug) => (
        <div key={drug.label}>
          <div className="flex justify-between text-sm mb-1">
            <a
              href={`/drug/${slugify(drug.label)}`}
              className="font-medium hover:underline"
              style={{ color: '#1a3c34' }}
            >
              {drug.label}
            </a>
            <span className="text-gray-400 text-xs tabular-nums">{drug.count.toLocaleString()} reports</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-2 rounded-full"
              style={{ width: `${(drug.percentage / max) * 100}%`, background: '#4ade80' }}
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400 mt-2">Drugs that appear most frequently in the same FDA adverse event reports</p>
    </div>
  )
}
