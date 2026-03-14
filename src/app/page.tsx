import DrugSearchBar from '@/components/DrugSearchBar'
import { fetchTrendingDrugs, fetchRisingDrugs } from '@/lib/fda'
import { getTrendingDrugs, getRisingDrugs, DB_ENABLED } from '@/lib/db'
import { slugify } from '@/lib/drug-list'
import RecentSearches from '@/components/RecentSearches'
import RisingDrugs from '@/components/RisingDrugs'

export const revalidate = 604800 // 7 days

export default async function HomePage() {
  let trending: { name: string; count: number }[] = []
  let rising: import('@/types/fda').RisingDrug[] = []
  try {
    [trending, rising] = await Promise.all([
      DB_ENABLED ? getTrendingDrugs(10) : fetchTrendingDrugs(10),
      DB_ENABLED ? getRisingDrugs(5) : fetchRisingDrugs(5),
    ])
  } catch {
    // fallback to empty — page still renders fine
  }

  const [first, ...rest] = trending
  const top4 = rest.slice(0, 4)
  const overflow = rest.slice(4)

  return (
    <div>
      {/* Hero */}
      <section className="px-6 py-20 text-center text-white" style={{ background: 'linear-gradient(135deg, #1a3c34 0%, #14532d 100%)' }}>
        <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full mb-6" style={{ background: 'rgba(209,250,229,.12)', color: '#6ee7b7', border: '1px solid rgba(209,250,229,.2)' }}>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Sourced directly from FDA FAERS database
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          Know What the FDA Knows<br className="hidden md:block" /> About Your Drug
        </h1>
        <p className="mb-10 max-w-xl mx-auto text-lg" style={{ color: '#a7f3d0' }}>
          Transparent, unfiltered adverse event data. The same reports regulators,
          researchers, and physicians rely on.
        </p>
        <div className="flex justify-center">
          <DrugSearchBar size="large" />
        </div>
        <RecentSearches />
        <div className="flex justify-center gap-8 mt-6 text-sm" style={{ color: '#6ee7b7' }}>
          <span>✓ Official FDA data</span>
          <span>✓ No account needed</span>
          <span>✓ Updated weekly</span>
        </div>
      </section>

      {/* ── Trending + Rising ── */}
      <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-6">

          {/* Trending Lookups */}
          {trending.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">Trending Lookups</h2>
              <p className="text-sm text-gray-400 mb-6">Most-reported drugs in the FDA adverse event database</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {first && (
                  <a
                    href={`/drug/${slugify(first.name)}`}
                    className="flex items-center justify-between rounded-xl p-4 border transition-colors"
                    style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#1a3c34' }}>#1</span>
                        <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{ background: '#1a3c34', fontSize: '10px' }}>Top reported</span>
                      </div>
                      <div className="font-semibold text-gray-900 text-base">{first.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{first.count.toLocaleString()} FDA reports</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {top4.map((drug, i) => (
                    <a
                      key={drug.name}
                      href={`/drug/${slugify(drug.name)}`}
                      className="flex items-center gap-2 rounded-xl p-3 border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xs font-mono text-gray-300">{String(i + 2).padStart(2, '0')}</span>
                      <span className="text-sm font-medium text-gray-800">{drug.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {overflow.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {overflow.map((drug) => (
                    <a
                      key={drug.name}
                      href={`/drug/${slugify(drug.name)}`}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {drug.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rising Reports */}
          <RisingDrugs drugs={rising} />

        </div>
      </div>

      {/* ── How It Works ── */}
      <section style={{ background: '#1a3c34' }}>
        <div className="max-w-5xl mx-auto px-8 py-14">
          <p className="text-base font-semibold uppercase tracking-widest mb-10" style={{ color: '#6ee7b7' }}>How It Works</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { n: '01', title: 'Search any drug', body: 'Brand or generic name. We find it in the FDA database instantly.' },
              { n: '02', title: 'We pull FDA data', body: 'Directly from FAERS — the same source researchers and regulators use.' },
              { n: '03', title: 'Read the reports', body: 'Side effects, trends, demographics — visualized and explained.' },
            ].map((step) => (
              <div key={step.n}>
                <div className="text-3xl font-bold mb-3" style={{ color: '#6ee7b7' }}>{step.n}</div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#a7f3d0' }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
