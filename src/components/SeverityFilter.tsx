export type Severity = 'all' | 'serious' | 'non-serious'

interface SeverityFilterProps {
  value: Severity
  onChange: (value: Severity) => void
}

const options: { label: string; value: Severity }[] = [
  { label: 'All Reports', value: 'all' },
  { label: 'Serious Only', value: 'serious' },
  { label: 'Non-Serious Only', value: 'non-serious' },
]

export default function SeverityFilter({ value, onChange }: SeverityFilterProps) {
  return (
    <div className="flex gap-2" role="group" aria-label="Filter by severity">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border"
          style={value === opt.value
            ? { background: '#1a3c34', color: 'white', borderColor: '#1a3c34' }
            : { background: 'white', color: '#374151', borderColor: '#d1d5db' }
          }
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
