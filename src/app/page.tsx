import DrugSearchBar from '@/components/DrugSearchBar'
import AdSlot from '@/components/AdSlot'
import { fetchTrendingDrugs } from '@/lib/fda'
import { slugify } from '@/lib/drug-list'

export const revalidate = 604800 // 7 days

export default async function HomePage() {
  let trending: { name: string; count: number }[] = []
  try {
    trending = await fetchTrendingDrugs(10)
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
        <div className="flex justify-center gap-8 mt-8 text-sm" style={{ color: '#6ee7b7' }}>
          <span>✓ Official FDA data</span>
          <span>✓ Free forever</span>
          <span>✓ Updated weekly</span>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 flex gap-8">
        <div className="flex-1 min-w-0">

          {/* ── Trending Lookups ── */}
          {trending.length > 0 && (
            <section className="mb-14">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Trending Lookups</h2>
              <p className="text-sm text-gray-400 mb-6">Most-reported drugs in the FDA adverse event database</p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Featured #1 */}
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

                {/* 2×2 grid */}
                <div className="grid grid-cols-2 gap-2">
                  {top4.map((drug, i) => (
                    <a
                      key={drug.name}
                      href={`/drug/${slugify(drug.name)}`}
                      className="flex items-center gap-2 rounded-xl p-3 border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-xs font-mono text-gray-300">{String(i + 2).padStart(2, '0')}</span>
                      <span className="text-sm font-medium text-gray-800">{drug.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Overflow pills */}
              {overflow.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {overflow.map((drug) => (
                    <a
                      key={drug.name}
                      href={`/drug/${slugify(drug.name)}`}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      {drug.name}
                    </a>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── How It Works ── */}
          <section className="rounded-2xl overflow-hidden">
            <div className="px-8 py-8" style={{ background: '#1a3c34' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: '#6ee7b7' }}>How It Works</p>
              <div className="grid md:grid-cols-3 gap-8">
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

        {/* Sidebar ad */}
        <div className="w-72 hidden lg:block shrink-0">
          <AdSlot slot="1234567890" format="rectangle" />
        </div>
      </div>
    </div>
  )
}
