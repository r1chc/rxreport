'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { SideEffect } from '@/types/fda'

interface Props {
  data: SideEffect[]
}

export default function SideEffectsChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 15)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 0, right: 60, left: 120, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => `${v}%`}
            domain={[0, 'dataMax']}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={115}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Reports']}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
            {sorted.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={index < 5 ? '#3b82f6' : index < 10 ? '#93c5fd' : '#dbeafe'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 mt-2 text-center">
        Percentage of all reports mentioning this reaction
      </p>
    </div>
  )
}
