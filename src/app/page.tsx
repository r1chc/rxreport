import DrugSearchBar from '@/components/DrugSearchBar'
import AdSlot from '@/components/AdSlot'

const TRENDING_DRUGS = [
  'Ozempic', 'Adderall', 'Mounjaro', 'Keytruda', 'Humira',
  'Eliquis', 'Jardiance', 'Skyrizi', 'Dupixent', 'Wegovy',
]

export default function HomePage() {
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
        <div className="flex-1">
          {/* Trending */}
          <section className="mb-12">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Trending Lookups</h2>
            <div className="flex flex-wrap gap-2">
              {TRENDING_DRUGS.map((drug) => (
                <a
                  key={drug}
                  href={`/drug/${drug.toLowerCase()}`}
                  className="drug-pill px-4 py-2 rounded-full text-sm font-medium"
                >
                  {drug}
                </a>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-800">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: '🔍', title: 'Search any drug', body: 'Type any brand or generic name — prescription or over-the-counter.' },
                { icon: '📊', title: 'See real FDA data', body: 'We pull directly from the FDA Adverse Event Reporting System (FAERS) — the same data used by researchers.' },
                { icon: '📋', title: 'Understand the numbers', body: 'Side effect charts, trend lines, and demographic breakdowns explained in plain English.' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm" style={{ borderLeft: '3px solid #1a3c34' }}>
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-semibold mb-1 text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar ad */}
        <div className="w-72 hidden lg:block">
          <AdSlot slot="1234567890" format="rectangle" />
        </div>
      </div>
    </div>
  )
}
