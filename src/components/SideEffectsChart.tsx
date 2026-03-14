'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { SideEffect } from '@/types/fda'

interface Props {
  data: SideEffect[]
}

// Capitalize each word, truncate if too long
function formatLabel(name: string, maxLen = 32): string {
  const titled = name.replace(/\b\w/g, (c) => c.toUpperCase())
  return titled.length > maxLen ? titled.slice(0, maxLen - 1) + '…' : titled
}

// Estimate pixel width needed for the longest label
function getLabelWidth(data: SideEffect[]): number {
  const longest = Math.max(...data.map((d) => formatLabel(d.name).length))
  return Math.min(Math.max(longest * 7, 120), 200)
}

export default function SideEffectsChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 15)
  const labelWidth = getLabelWidth(sorted)

  return (
    <div>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 0, right: 4, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => `${v}%`}
            domain={[0, (dataMax: number) => parseFloat((Math.ceil(dataMax * 10) / 10).toFixed(1))]}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={labelWidth}
            tickFormatter={(name) => formatLabel(name)}
            tick={{ fontSize: 11, fill: '#374151' }}
          />
          <Tooltip
            formatter={(value, _, props) => [
              `${value}% (${props.payload.count.toLocaleString()} reports)`,
              formatLabel(props.payload.name),
            ]}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
            {sorted.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={index < 5 ? '#1a3c34' : index < 10 ? '#4ade80' : '#bbf7d0'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Percentage of all reports mentioning this reaction
      </p>
    </div>
  )
}
