import type { BreakdownItem } from '@/types/fda'

interface Props {
  items: BreakdownItem[]
  color?: string
  emptyText?: string
}

export default function BreakdownList({ items, color = '#1a3c34', emptyText = 'No data available' }: Props) {
  if (!items.length) return <p className="text-sm text-gray-400 py-2">{emptyText}</p>
  const max = Math.max(...items.map((i) => i.percentage), 1)
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 font-medium">{item.label}</span>
            <span className="text-gray-400 text-xs tabular-nums">{item.count.toLocaleString()} &middot; {item.percentage}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 rounded-full" style={{ width: `${(item.percentage / max) * 100}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  )
}
