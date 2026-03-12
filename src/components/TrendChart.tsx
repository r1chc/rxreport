'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { TrendPoint } from '@/types/fda'

interface Props {
  data: TrendPoint[]
}

export default function TrendChart({ data }: Props) {
  // Show last 20 quarters (5 years) max to avoid chart crowding
  const recent = data.slice(-20)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={recent} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="quarter"
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} />
          <Tooltip
            formatter={(v) => [Number(v).toLocaleString(), 'Reports']}
            contentStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 mt-2 text-center">
        Quarterly adverse event reports submitted to FDA
      </p>
    </div>
  )
}
