import type { RisingDrug } from '@/types/fda'
import { slugify } from '@/lib/drug-list'

interface Props {
  drugs: RisingDrug[]
}

export default function RisingDrugs({ drugs }: Props) {
  if (!drugs.length) return null

  return (
    <section className="mb-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-1">Rising Reports</h2>
      <p className="text-sm text-gray-400 mb-6">Drugs with the fastest-growing adverse event reports year over year</p>
      <div className="flex flex-col gap-2">
        {drugs.map((drug, i) => (
          <a
            key={drug.slug}
            href={`/drug/${drug.slug}`}
            className="flex items-center justify-between rounded-xl px-4 py-3 border border-gray-100 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-gray-300 w-5">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-sm font-medium text-gray-800">{drug.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{drug.currentYearCount.toLocaleString()} reports this year</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#f0fdf4', color: '#16a34a' }}
              >
                ↑ {drug.percentChange}%
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
