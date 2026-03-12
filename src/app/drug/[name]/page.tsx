import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchDrugReport } from '@/lib/fda'
import { getTopDrugSlugs, unslugify } from '@/lib/drug-list'
import StatCard from '@/components/StatCard'
import AdSlot from '@/components/AdSlot'
import DrugSearchBar from '@/components/DrugSearchBar'
import DrugCharts from '@/components/DrugCharts'

interface Props {
  params: Promise<{ name: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getTopDrugSlugs()
    return slugs.map((name) => ({ name }))
  } catch {
    // FDA API unavailable at build time — pages will be generated on first request
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params
  const displayName = unslugify(name)
  return {
    title: `${displayName} Side Effects: FDA Adverse Event Reports`,
    description: `See real FDA adverse event reports for ${displayName}. Charts showing top side effects, trends over time, and demographic breakdowns from official FAERS data.`,
    openGraph: {
      title: `${displayName} Side Effects | RxReport`,
      description: `Official FDA adverse event data for ${displayName}, visualized.`,
    },
  }
}

export const revalidate = 604800 // 7 days

export default async function DrugPage({ params }: Props) {
  const { name } = await params
  let report
  try {
    report = await fetchDrugReport(unslugify(name))
  } catch {
    notFound()
  }

  const displayName = report.name
    .split(' ')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-400 mb-6" aria-label="Breadcrumb">
        <a href="/" className="hover:text-slate-600">Home</a>
        {' / '}
        <a href="/top-drugs" className="hover:text-slate-600">Top Drugs</a>
        {' / '}
        <span className="text-slate-700">{displayName}</span>
      </nav>

      <div className="flex gap-8">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <h1 className="text-3xl font-bold mb-1">{displayName}</h1>
          <p className="text-slate-400 text-sm mb-6">
            {report.totalReports.toLocaleString()} FDA adverse event reports · Last updated {report.lastUpdated}
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Reports" value={report.totalReports} />
            <StatCard label="Serious" value={report.seriousReports} variant="danger" />
            <StatCard label="Non-Serious" value={report.nonSeriousReports} variant="success" />
          </div>

          {/* Charts (client component — Recharts needs window) */}
          <DrugCharts
            topSideEffects={report.topSideEffects}
            trend={report.trend}
            ageGroups={report.ageGroups}
            gender={report.gender}
          />

          <AdSlot slot="0987654321" format="leaderboard" className="mb-8" />

          {/* Compare CTA */}
          <section className="bg-blue-50 rounded-xl p-5 mb-8">
            <h2 className="font-semibold mb-2">⚖️ Compare with another drug</h2>
            <DrugSearchBar />
            <p className="text-xs text-slate-400 mt-2">
              Or go to <a href={`/compare?a=${name}`} className="text-blue-600 hover:underline">the compare page</a>.
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="w-72 hidden lg:block shrink-0">
          <AdSlot slot="1122334455" format="rectangle" className="sticky top-20" />
        </aside>
      </div>

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalWebPage',
            name: `${displayName} Side Effects`,
            description: `FDA adverse event report data for ${displayName}`,
            url: `https://rxreport.com/drug/${name}`,
            medicalAudience: 'Patient',
            lastReviewed: report.lastUpdated,
          }),
        }}
      />
    </div>
  )
}
