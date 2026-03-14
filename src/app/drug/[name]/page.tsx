import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchDrugReport, fetchCoReportedDrugs } from '@/lib/fda'
import { fetchDrugLabel } from '@/lib/label'
import { getTopDrugSlugs, unslugify } from '@/lib/drug-list'
import { getDrugReport, getDrugLabel, getCoReportedDrugs, DB_ENABLED } from '@/lib/db'
import AdSlot from '@/components/AdSlot'
import CompareSearchBar from '@/components/CompareSearchBar'
import DrugCharts from '@/components/DrugCharts'
import PrintButton from '@/components/PrintButton'
import BlackBoxWarning from '@/components/BlackBoxWarning'
import RecordDrugView from '@/components/RecordDrugView'

interface Props {
  params: Promise<{ name: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getTopDrugSlugs()
    return slugs.map((name) => ({ name }))
  } catch {
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
    report = DB_ENABLED
      ? (await getDrugReport(name)) ?? await fetchDrugReport(unslugify(name))
      : await fetchDrugReport(unslugify(name))
  } catch {
    notFound()
  }

  const [label, coReportedDrugs] = await Promise.all([
    DB_ENABLED
      ? (getDrugLabel(name).then(r => r ?? fetchDrugLabel(unslugify(name)).catch(() => null)))
      : fetchDrugLabel(unslugify(name)).catch(() => null),
    DB_ENABLED
      ? (getCoReportedDrugs(name).then(r => r.length ? r : fetchCoReportedDrugs(unslugify(name)).catch(() => [])))
      : fetchCoReportedDrugs(unslugify(name)).catch(() => []),
  ])

  const displayName = report.name
    .split(' ')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Records this view to localStorage for recent searches */}
      <RecordDrugView name={displayName} slug={name} />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 print-hide" aria-label="Breadcrumb">
        <a href="/" className="hover:text-gray-600">Home</a>
        {' / '}
        <a href="/top-drugs" className="hover:text-gray-600">Top Drugs</a>
        {' / '}
        <span style={{ color: '#1a3c34' }} className="font-medium">{displayName}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold" style={{ color: '#1a3c34' }}>{displayName}</h1>
            {label?.hasBlackBoxWarning && (
              <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#dc2626', color: 'white' }}>
                ⚠ Black Box Warning
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {report.totalReports.toLocaleString()} FDA adverse event reports · Last updated {report.lastUpdated}
            {label?.pharmClass[0] && <span className="ml-2 text-gray-400">· {label.pharmClass[0]}</span>}
          </p>
          {label?.brandNames.length && label.brandNames[0].toLowerCase() !== displayName.toLowerCase() && (
            <p className="text-xs text-gray-400 mt-0.5">Also known as: {label.brandNames.slice(0, 3).join(', ')}</p>
          )}
        </div>
        <PrintButton />
      </div>

      {/* Black box warning banner */}
      {label?.hasBlackBoxWarning && label.blackBoxWarning && (
        <BlackBoxWarning text={label.blackBoxWarning} />
      )}

      {/* Drug class comparison note */}
      {label?.pharmClass[0] && (
        <div className="rounded-lg px-4 py-3 mb-6 text-sm" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <span className="font-medium" style={{ color: '#1a3c34' }}>{label.pharmClass[0]}</span>
          <span className="text-gray-600"> — {Math.round((report.seriousReports / report.totalReports) * 100)}% of {displayName} reports are classified as serious by the FDA.</span>
          {label.genericNames[0] && label.genericNames[0].toLowerCase() !== displayName.toLowerCase() && (
            <span className="text-gray-500"> Generic name: {label.genericNames[0]}.</span>
          )}
        </div>
      )}

      {/* All charts */}
      <DrugCharts
        topSideEffects={report.topSideEffects}
        trend={report.trend}
        ageGroups={report.ageGroups}
        gender={report.gender}
        totalReports={report.totalReports}
        seriousReports={report.seriousReports}
        nonSeriousReports={report.nonSeriousReports}
        seriousnessBreakdown={report.seriousnessBreakdown}
        outcomes={report.outcomes}
        indications={report.indications}
        reporterTypes={report.reporterTypes}
        countries={report.countries}
        actionTaken={report.actionTaken}
        routes={report.routes}
        coReportedDrugs={coReportedDrugs}
        pharmClass={label?.pharmClass ?? []}
      />

      <AdSlot slot="0987654321" format="leaderboard" className="mb-8 print-hide" />

      {/* Compare CTA */}
      <section className="max-w-xl mx-auto rounded-xl p-5 mb-8 border print-hide" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
        <h2 className="font-semibold mb-2 text-gray-800">Compare with another drug</h2>
        <CompareSearchBar currentSlug={name} />
        <p className="text-xs text-gray-400 mt-2">
          Or go to <a href={`/compare?a=${name}`} className="hover:underline" style={{ color: '#1a3c34' }}>the compare page</a>.
        </p>
      </section>

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
          }).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026'),
        }}
      />
    </div>
  )
}
