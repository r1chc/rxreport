import type { TrendPoint } from '@/types/fda'

export function calcYearOverYearChange(trend: TrendPoint[]): number | null {
  if (!trend.length) return null

  const byYear: Record<string, number> = {}
  for (const { quarter, count } of trend) {
    const year = quarter.slice(0, 4)
    byYear[year] = (byYear[year] ?? 0) + count
  }

  const years = Object.keys(byYear).sort()
  if (years.length < 2) return null

  const current = byYear[years[years.length - 1]]
  const prior = byYear[years[years.length - 2]]
  if (!prior) return null

  return Math.round(((current - prior) / prior) * 1000) / 10
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}
