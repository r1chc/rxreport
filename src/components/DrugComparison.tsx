'use client'

import dynamic from 'next/dynamic'
import type { DrugReport } from '@/types/fda'
import StatCard from '@/components/StatCard'

const SideEffectsChart = dynamic(() => import('@/components/SideEffectsChart'), { ssr: false })
const TrendChart = dynamic(() => import('@/components/TrendChart'), { ssr: false })

function DrugColumn({ report }: { report: DrugReport }) {
  const displayName = report.name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
  return (
    <div className="flex-1 min-w-0">
      <h2 className="text-xl font-bold mb-1">{displayName}</h2>
      <p className="text-slate-400 text-sm mb-4">{report.totalReports.toLocaleString()} FDA reports</p>
      <div className="flex flex-col gap-4 mb-6">
        <StatCard label="Total Reports" value={report.totalReports} />
        <StatCard label="Serious" value={report.seriousReports} variant="danger" />
      </div>
      <h3 className="text-sm font-semibold mb-2 text-slate-600">Top Side Effects</h3>
      <SideEffectsChart data={report.topSideEffects} />
      <h3 className="text-sm font-semibold mt-6 mb-2 text-slate-600">Reports Over Time</h3>
      <TrendChart data={report.trend} />
    </div>
  )
}

export default function DrugComparison({ reportA, reportB }: { reportA: DrugReport; reportB: DrugReport }) {
  return (
    <div className="flex gap-8">
      <DrugColumn report={reportA} />
      <div className="w-px bg-slate-200 hidden md:block" />
      <DrugColumn report={reportB} />
    </div>
  )
}
