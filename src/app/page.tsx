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
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Real FDA Drug Side Effect Data
        </h1>
        <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
          Search any drug to see what people are actually reporting to the FDA —
          charts, trends, and demographics from official government data.
        </p>
        <div className="flex justify-center">
          <DrugSearchBar size="large" />
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 flex gap-8">
        <div className="flex-1">
          {/* Trending */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Trending Lookups</h2>
            <div className="flex flex-wrap gap-3">
              {TRENDING_DRUGS.map((drug) => (
                <a
                  key={drug}
                  href={`/drug/${drug.toLowerCase()}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-full text-sm transition-colors"
                >
                  {drug}
                </a>
              ))}
            </div>
          </section>

          {/* How it works */}
          <section>
            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: '🔍', title: 'Search any drug', body: 'Type any brand or generic name — prescription or over-the-counter.' },
                { icon: '📊', title: 'See real FDA data', body: 'We pull directly from the FDA Adverse Event Reporting System (FAERS) — the same data used by researchers.' },
                { icon: '📋', title: 'Understand the numbers', body: 'Side effect charts, trend lines, and demographic breakdowns explained in plain English.' },
              ].map((item) => (
                <div key={item.title} className="bg-slate-50 rounded-xl p-5">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.body}</p>
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
