interface StatCardProps {
  label: string
  value: number
  variant?: 'default' | 'danger' | 'success'
}

const borderColors = {
  default: '#1a3c34',
  danger: '#dc2626',
  success: '#16a34a',
}

const valueColors = {
  default: '#1a3c34',
  danger: '#dc2626',
  success: '#16a34a',
}

export default function StatCard({ label, value, variant = 'default' }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl p-5 shadow-sm"
      style={{ borderLeft: `3px solid ${borderColors[variant]}`, border: '1px solid #e5e7eb', borderLeftWidth: '3px', borderLeftColor: borderColors[variant] }}
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold" style={{ color: valueColors[variant] }}>
        {value.toLocaleString()}
      </div>
    </div>
  )
}
