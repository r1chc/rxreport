'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import type { AgeGroup, GenderBreakdown } from '@/types/fda'

interface Props {
  ageGroups: AgeGroup[]
  gender: GenderBreakdown
}

const AGE_COLORS = ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a']
const GENDER_COLORS = ['#93c5fd', '#f9a8d4', '#e2e8f0']

export default function DemographicsChart({ ageGroups, gender }: Props) {
  const genderData = [
    { name: 'Male', value: gender.male },
    { name: 'Female', value: gender.female },
    { name: 'Unknown', value: gender.unknown },
  ].filter((d) => d.value > 0)

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Age */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3 text-slate-600">Age Groups</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={ageGroups}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label={(props: PieLabelRenderProps & { label?: string; percentage?: number }) => `${props.label ?? ''} (${props.percentage ?? 0}%)`}
              labelLine={false}
            >
              {ageGroups.map((_, i) => (
                <Cell key={i} fill={AGE_COLORS[i % AGE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => Number(v).toLocaleString()} contentStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Gender */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3 text-slate-600">Gender</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={genderData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
            >
              {genderData.map((_, i) => (
                <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => Number(v).toLocaleString()} contentStyle={{ fontSize: 12 }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
