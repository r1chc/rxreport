'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import type { AgeGroup, GenderBreakdown } from '@/types/fda'

interface Props {
  ageGroups: AgeGroup[]
  gender: GenderBreakdown
}

const AGE_COLORS = ['#bbf7d0', '#4ade80', '#16a34a', '#1a3c34', '#14532d']
const GENDER_COLORS = { Female: '#f472b6', Male: '#60a5fa', Unknown: '#cbd5e1' }

export default function DemographicsChart({ ageGroups, gender }: Props) {
  const genderTotal = gender.female + gender.male + gender.unknown
  const genderData = [
    { name: 'Female', value: gender.female, percentage: genderTotal > 0 ? Math.round((gender.female / genderTotal) * 1000) / 10 : 0 },
    { name: 'Male', value: gender.male, percentage: genderTotal > 0 ? Math.round((gender.male / genderTotal) * 1000) / 10 : 0 },
    { name: 'Unknown', value: gender.unknown, percentage: genderTotal > 0 ? Math.round((gender.unknown / genderTotal) * 1000) / 10 : 0 },
  ].filter((d) => d.value > 0)

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Age groups */}
      <div className="bg-white border border-slate-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-4 text-slate-600">Age Groups</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={ageGroups} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Share']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {ageGroups.map((_, i) => (
                <Cell key={i} fill={AGE_COLORS[i % AGE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gender */}
      <div className="bg-white border border-slate-100 rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-4 text-slate-600">Gender</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={genderData} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Share']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={64}>
              {genderData.map((entry) => (
                <Cell key={entry.name} fill={GENDER_COLORS[entry.name as keyof typeof GENDER_COLORS] ?? '#cbd5e1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
