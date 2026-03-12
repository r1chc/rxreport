'use client'

import dynamic from 'next/dynamic'
import type { SideEffect, TrendPoint, AgeGroup, GenderBreakdown } from '@/types/fda'

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
}

export default function DrugCharts({ topSideEffects, trend, ageGroups, gender }: DrugChartsProps) {
  return (
    <>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Top Reported Side Effects</h2>
        <SideEffectsChart data={topSideEffects} />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Reports Over Time</h2>
        <TrendChart data={trend} />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Who Is Reporting?</h2>
        <DemographicsChart ageGroups={ageGroups} gender={gender} />
      </section>
    </>
  )
}
