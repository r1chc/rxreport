interface StatCardProps {
  label: string
  value: number
  variant?: 'default' | 'danger' | 'success'
}

const variantStyles = {
  default: 'bg-slate-50 border-slate-200',
  danger: 'bg-red-50 border-red-200',
  success: 'bg-green-50 border-green-200',
}

const valueStyles = {
  default: 'text-slate-900',
  danger: 'text-red-600',
  success: 'text-green-600',
}

export default function StatCard({ label, value, variant = 'default' }: StatCardProps) {
  return (
    <div className={`rounded-lg border p-4 text-center ${variantStyles[variant]}`}>
      <div className={`text-2xl font-bold ${valueStyles[variant]}`}>
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  )
}
