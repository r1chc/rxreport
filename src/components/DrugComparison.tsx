'use client'

import dynamic from 'next/dynamic'
import type { DrugReport, SeriousnessBreakdown, BreakdownItem } from '@/types/fda'
import BreakdownList from '@/components/BreakdownList'

const SideEffectsChart = dynamic(() => import('@/components/SideEffectsChart'), { ssr: false, loading: () => <div className="h-64 bg-slate-100 rounded-xl animate-pulse" /> })
const TrendChart = dynamic(() => import('@/components/TrendChart'), { ssr: false, loading: () => <div className="h-48 bg-slate-100 rounded-xl animate-pulse" /> })
const DemographicsChart = dynamic(() => import('@/components/DemographicsChart'), { ssr: false, loading: () => <div className="h-48 bg-slate-100 rounded-xl animate-pulse" /> })

function displayName(name: string) {
  return name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

const statColors = {
  default: { border: '#1a3c34', value: '#1a3c34' },
  danger: { border: '#dc2626', value: '#dc2626' },
  success: { border: '#16a34a', value: '#16a34a' },
}

function StatBlock({ label, value, variant = 'default' }: { label: string; value: number; variant?: keyof typeof statColors }) {
  const c = statColors[variant]
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid #e5e7eb', borderLeftWidth: '3px', borderLeftColor: c.border }}>
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-bold" style={{ color: c.value }}>{value.toLocaleString()}</div>
    </div>
  )
}

function CompareRow({ title, subtitle, left, right }: { title: string; subtitle?: string; left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100" style={{ background: '#f8fafc' }}>
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        <div className="p-5">{left}</div>
        <div className="p-5">{right}</div>
      </div>
    </div>
  )
}

function seriousnessItems(breakdown: SeriousnessBreakdown, total: number): BreakdownItem[] {
  return [
    { label: 'Death', count: breakdown.death, percentage: total > 0 ? Math.round((breakdown.death / total) * 1000) / 10 : 0 },
    { label: 'Hospitalization', count: breakdown.hospitalization, percentage: total > 0 ? Math.round((breakdown.hospitalization / total) * 1000) / 10 : 0 },
    { label: 'Life-Threatening', count: breakdown.lifeThreatening, percentage: total > 0 ? Math.round((breakdown.lifeThreatening / total) * 1000) / 10 : 0 },
    { label: 'Disabling', count: breakdown.disabling, percentage: total > 0 ? Math.round((breakdown.disabling / total) * 1000) / 10 : 0 },
    { label: 'Congenital Anomaly', count: breakdown.congenitalAnomali, percentage: total > 0 ? Math.round((breakdown.congenitalAnomali / total) * 1000) / 10 : 0 },
  ].filter((i) => i.count > 0)
}

export default function DrugComparison({ reportA, reportB }: { reportA: DrugReport; reportB: DrugReport }) {
  const nameA = displayName(reportA.name)
  const nameB = displayName(reportB.name)

  return (
    <div className="space-y-4">

      {/* Drug name headers */}
      <div className="grid grid-cols-2 gap-4 px-1">
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#1a3c34' }}>{nameA}</h2>
          <p className="text-sm text-gray-400">{reportA.totalReports.toLocaleString()} FDA reports</p>
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#7c3aed' }}>{nameB}</h2>
          <p className="text-sm text-gray-400">{reportB.totalReports.toLocaleString()} FDA reports</p>
        </div>
      </div>

      {/* Total reports */}
      <CompareRow
        title="Total Reports"
        left={
          <div className="flex flex-col gap-3">
            <StatBlock label="Total Reports" value={reportA.totalReports} />
            <StatBlock label="Serious" value={reportA.seriousReports} variant="danger" />
            <StatBlock label="Non-Serious" value={reportA.nonSeriousReports} variant="success" />
          </div>
        }
        right={
          <div className="flex flex-col gap-3">
            <StatBlock label="Total Reports" value={reportB.totalReports} />
            <StatBlock label="Serious" value={reportB.seriousReports} variant="danger" />
            <StatBlock label="Non-Serious" value={reportB.nonSeriousReports} variant="success" />
          </div>
        }
      />

      {/* Top side effects */}
      <CompareRow
        title="Top Reported Side Effects"
        left={<SideEffectsChart data={reportA.topSideEffects} />}
        right={<SideEffectsChart data={reportB.topSideEffects} />}
      />

      {/* Reports over time */}
      <CompareRow
        title="Reports Over Time"
        left={<TrendChart data={reportA.trend} />}
        right={<TrendChart data={reportB.trend} />}
      />

      {/* Seriousness breakdown */}
      <CompareRow
        title="Seriousness Breakdown"
        subtitle="% of all reports involving each serious outcome"
        left={<BreakdownList items={seriousnessItems(reportA.seriousnessBreakdown, reportA.totalReports)} color="#dc2626" emptyText="No serious events reported" />}
        right={<BreakdownList items={seriousnessItems(reportB.seriousnessBreakdown, reportB.totalReports)} color="#dc2626" emptyText="No serious events reported" />}
      />

      {/* Reaction outcomes */}
      <CompareRow
        title="Reaction Outcomes"
        subtitle="How reactions resolved across all reports"
        left={<BreakdownList items={reportA.outcomes} color="#1a3c34" />}
        right={<BreakdownList items={reportB.outcomes} color="#7c3aed" />}
      />

      {/* Who is reporting */}
      <CompareRow
        title="Who Is Reporting? (Age & Gender)"
        left={<DemographicsChart ageGroups={reportA.ageGroups} gender={reportA.gender} />}
        right={<DemographicsChart ageGroups={reportB.ageGroups} gender={reportB.gender} />}
      />

      {/* Reporter type */}
      <CompareRow
        title="Reporter Type"
        subtitle="Who submitted these adverse event reports"
        left={<BreakdownList items={reportA.reporterTypes} color="#1a3c34" />}
        right={<BreakdownList items={reportB.reporterTypes} color="#7c3aed" />}
      />

      {/* Drug indications */}
      <CompareRow
        title="Drug Indications"
        subtitle="What the drug was prescribed for in reported cases"
        left={<BreakdownList items={reportA.indications} color="#0369a1" />}
        right={<BreakdownList items={reportB.indications} color="#0369a1" />}
      />

      {/* Administration route */}
      <CompareRow
        title="Administration Route"
        subtitle="How the drug was administered"
        left={<BreakdownList items={reportA.routes} color="#0369a1" />}
        right={<BreakdownList items={reportB.routes} color="#0369a1" />}
      />

      {/* Countries */}
      <CompareRow
        title="Top Reporting Countries"
        left={<BreakdownList items={reportA.countries} color="#7c3aed" />}
        right={<BreakdownList items={reportB.countries} color="#7c3aed" />}
      />

      {/* Action taken */}
      <CompareRow
        title="Action Taken on Drug"
        subtitle="What action was taken after the adverse event"
        left={<BreakdownList items={reportA.actionTaken} color="#7c3aed" />}
        right={<BreakdownList items={reportB.actionTaken} color="#7c3aed" />}
      />

    </div>
  )
}
