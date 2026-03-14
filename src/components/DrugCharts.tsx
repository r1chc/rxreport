'use client'

import dynamic from 'next/dynamic'
import type { SideEffect, TrendPoint, AgeGroup, GenderBreakdown, BreakdownItem, SeriousnessBreakdown } from '@/types/fda'
import BreakdownList from '@/components/BreakdownList'
import { calcYearOverYearChange } from '@/lib/utils'

const ChartSkeleton = () => <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />

const SideEffectsChart = dynamic<{ data: SideEffect[] }>(
  () => import('@/components/SideEffectsChart'),
  { ssr: false, loading: ChartSkeleton },
)
const TrendChart = dynamic<{ data: TrendPoint[] }>(
  () => import('@/components/TrendChart'),
  { ssr: false, loading: ChartSkeleton },
)
const DemographicsChart = dynamic<{ ageGroups: AgeGroup[]; gender: GenderBreakdown }>(
  () => import('@/components/DemographicsChart'),
  { ssr: false, loading: ChartSkeleton },
)

interface DrugChartsProps {
  topSideEffects: SideEffect[]
  trend: TrendPoint[]
  ageGroups: AgeGroup[]
  gender: GenderBreakdown
  totalReports: number
  seriousReports: number
  nonSeriousReports: number
  seriousnessBreakdown: SeriousnessBreakdown
  outcomes: BreakdownItem[]
  indications: BreakdownItem[]
  reporterTypes: BreakdownItem[]
  countries: BreakdownItem[]
  actionTaken: BreakdownItem[]
  routes: BreakdownItem[]
  coReportedDrugs: BreakdownItem[]
  pharmClass: string[]
}

const statBorderColors = {
  default: '#1a3c34',
  danger: '#dc2626',
  success: '#16a34a',
  neutral: '#6b7280',
}

function StatBlock({ label, value, variant = 'default', sub }: { label: string; value: number | string; variant?: keyof typeof statBorderColors; sub?: string }) {
  const color = statBorderColors[variant]
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm" style={{ border: '1px solid #e5e7eb', borderLeftWidth: '3px', borderLeftColor: color }}>
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color }}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

function SectionCard({ title, children, flush = false }: { title: string; children: React.ReactNode; flush?: boolean }) {
  return (
    <section className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <h2 className="text-base font-semibold text-gray-900 px-5 pt-5 pb-3">{title}</h2>
      <div className={flush ? 'px-2 pb-4' : 'px-5 pb-5'}>
        {children}
      </div>
    </section>
  )
}

export default function DrugCharts({
  topSideEffects, trend, ageGroups, gender,
  totalReports, seriousReports, nonSeriousReports,
  seriousnessBreakdown, outcomes, indications,
  reporterTypes, countries, actionTaken, routes,
  coReportedDrugs, pharmClass,
}: DrugChartsProps) {
  const yoy = calcYearOverYearChange(trend)
  const seriousnessItems: BreakdownItem[] = [
    { label: 'Death', count: seriousnessBreakdown.death, percentage: totalReports > 0 ? Math.round((seriousnessBreakdown.death / totalReports) * 1000) / 10 : 0 },
    { label: 'Hospitalization', count: seriousnessBreakdown.hospitalization, percentage: totalReports > 0 ? Math.round((seriousnessBreakdown.hospitalization / totalReports) * 1000) / 10 : 0 },
    { label: 'Life-Threatening', count: seriousnessBreakdown.lifeThreatening, percentage: totalReports > 0 ? Math.round((seriousnessBreakdown.lifeThreatening / totalReports) * 1000) / 10 : 0 },
    { label: 'Disabling', count: seriousnessBreakdown.disabling, percentage: totalReports > 0 ? Math.round((seriousnessBreakdown.disabling / totalReports) * 1000) / 10 : 0 },
    { label: 'Congenital Anomaly', count: seriousnessBreakdown.congenitalAnomali, percentage: totalReports > 0 ? Math.round((seriousnessBreakdown.congenitalAnomali / totalReports) * 1000) / 10 : 0 },
  ].filter((i) => i.count > 0)

  const seriousRate = totalReports > 0 ? Math.round((seriousReports / totalReports) * 1000) / 10 : 0
  const nonSeriousRate = totalReports > 0 ? Math.round((nonSeriousReports / totalReports) * 1000) / 10 : 0

  return (
    <div className="space-y-6 mb-8">

      {/* Row 1 — Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBlock label="Total Reports" value={totalReports} />
        <StatBlock label="Serious" value={seriousReports} variant="danger" sub={`${seriousRate}% of all reports`} />
        <StatBlock label="Non-Serious" value={nonSeriousReports} variant="success" sub={`${nonSeriousRate}% of all reports`} />
        {yoy !== null
          ? <StatBlock
              label="Year-over-Year"
              value={`${yoy > 0 ? '+' : ''}${yoy}%`}
              variant={yoy > 0 ? 'danger' : 'success'}
              sub="vs prior year report volume"
            />
          : pharmClass.length > 0
            ? <StatBlock label="Drug Class" value={pharmClass[0]} variant="neutral" />
            : null
        }
      </div>

      {/* Row 2 — Side effects | Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Top Reported Side Effects" flush>
          <SideEffectsChart data={topSideEffects} />
        </SectionCard>
        <SectionCard title="Reports Over Time">
          <TrendChart data={trend} />
        </SectionCard>
      </div>

      {/* Row 3 — Seriousness breakdown | Reaction outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Seriousness Breakdown">
          <p className="text-xs text-gray-400 mb-4">Percentage of all reports involving each serious outcome (reports may count in multiple categories)</p>
          <BreakdownList items={seriousnessItems} color="#dc2626" emptyText="No serious events reported" />
        </SectionCard>
        <SectionCard title="Reaction Outcomes">
          <p className="text-xs text-gray-400 mb-4">How reactions resolved across all reports</p>
          <BreakdownList items={outcomes} color="#1a3c34" />
        </SectionCard>
      </div>

      {/* Row 4 — Demographics | Reporter type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Who Is Reporting?">
          <DemographicsChart ageGroups={ageGroups} gender={gender} />
        </SectionCard>
        <SectionCard title="Reporter Type">
          <p className="text-xs text-gray-400 mb-4">Who submitted these adverse event reports</p>
          <BreakdownList items={reporterTypes} color="#1a3c34" />
        </SectionCard>
      </div>

      {/* Row 5 — Drug indications | Administration route */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Drug Indications">
          <p className="text-xs text-gray-400 mb-4">What this drug was prescribed for in reported cases</p>
          <BreakdownList items={indications} color="#0369a1" />
        </SectionCard>
        <SectionCard title="Administration Route">
          <p className="text-xs text-gray-400 mb-4">How the drug was administered</p>
          <BreakdownList items={routes} color="#0369a1" />
        </SectionCard>
      </div>

      {/* Row 6 — Countries | Action taken */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Top Reporting Countries">
          <p className="text-xs text-gray-400 mb-4">Where adverse event reports originated</p>
          <BreakdownList items={countries} color="#7c3aed" />
        </SectionCard>
        <SectionCard title="Action Taken on Drug">
          <p className="text-xs text-gray-400 mb-4">What action was taken with the drug after the adverse event</p>
          <BreakdownList items={actionTaken} color="#7c3aed" />
        </SectionCard>
      </div>

      {/* Row 7 — Co-reported drugs */}
      {coReportedDrugs.length > 0 && (
        <SectionCard title="Commonly Co-Reported Drugs">
          <p className="text-xs text-gray-400 mb-4">Other drugs that most frequently appear in the same adverse event reports</p>
          <CoReportedList drugs={coReportedDrugs} />
        </SectionCard>
      )}

    </div>
  )
}

function CoReportedList({ drugs }: { drugs: BreakdownItem[] }) {
  const max = Math.max(...drugs.map((d) => d.percentage), 1)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
      {drugs.map((drug) => (
        <div key={drug.label}>
          <div className="flex justify-between text-sm mb-1">
            <a href={`/drug/${drug.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`} className="font-medium hover:underline" style={{ color: '#1a3c34' }}>
              {drug.label}
            </a>
            <span className="text-gray-400 text-xs tabular-nums">{drug.count.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 rounded-full" style={{ width: `${(drug.percentage / max) * 100}%`, background: '#4ade80' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
