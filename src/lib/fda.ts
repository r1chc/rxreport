import type { DrugReport, SideEffect, TrendPoint, AgeGroup, GenderBreakdown, FDAQueryResponse } from '@/types/fda'

const FDA_BASE = 'https://api.fda.gov/drug/event.json'

async function fdaFetch(params: Record<string, string>): Promise<FDAQueryResponse> {
  const url = new URL(FDA_BASE)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { next: { revalidate: 604800 } }) // 7 days
  if (!res.ok) throw new Error(`FDA API error: ${res.status}`)
  return res.json()
}

function drugSearch(name: string) {
  return `patient.drug.medicinalproduct:"${name.toUpperCase()}"`
}

async function fetchTotalCount(name: string): Promise<number> {
  const data = await fdaFetch({
    search: drugSearch(name),
    limit: '1',
  })
  return data.meta.results.total
}

async function fetchTopReactions(name: string, total: number): Promise<SideEffect[]> {
  const data = await fdaFetch({
    search: drugSearch(name),
    count: 'patient.reaction.reactionmeddrapt.exact',
    limit: '20',
  })
  return data.results.map((r) => ({
    name: (r.term ?? '').toLowerCase(),
    count: r.count,
    percentage: Math.round((r.count / total) * 1000) / 10,
  }))
}

async function fetchTrend(name: string): Promise<TrendPoint[]> {
  const data = await fdaFetch({
    search: drugSearch(name),
    count: 'receivedate',
  })
  const quarters: Record<string, number> = {}
  data.results.forEach(({ time, count }) => {
    if (!time) return
    const year = time.slice(0, 4)
    const month = parseInt(time.slice(4, 6), 10)
    const q = Math.ceil(month / 3)
    const key = `${year} Q${q}`
    quarters[key] = (quarters[key] ?? 0) + count
  })
  return Object.entries(quarters)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([quarter, count]) => ({ quarter, count }))
}

async function fetchAgeGroups(name: string): Promise<AgeGroup[]> {
  const data = await fdaFetch({
    search: drugSearch(name),
    count: 'patient.patientonsetage',
    limit: '100',
  })
  const total = data.results.reduce((sum, r) => sum + r.count, 0)
  const buckets: Record<string, number> = {
    '0-17': 0, '18-44': 0, '45-64': 0, '65-74': 0, '75+': 0,
  }
  data.results.forEach(({ term, count }) => {
    const age = parseInt(term ?? '', 10)
    if (age < 18) buckets['0-17'] += count
    else if (age < 45) buckets['18-44'] += count
    else if (age < 65) buckets['45-64'] += count
    else if (age < 75) buckets['65-74'] += count
    else buckets['75+'] += count
  })
  return Object.entries(buckets).map(([label, count]) => ({
    label,
    count,
    percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
  }))
}

async function fetchGender(name: string): Promise<GenderBreakdown> {
  const data = await fdaFetch({
    search: drugSearch(name),
    count: 'patient.patientsex',
  })
  const map: Record<string, number> = {}
  data.results.forEach(({ term, count }) => { if (term) map[term] = count })
  return {
    male: map['1'] ?? 0,
    female: map['2'] ?? 0,
    unknown: map['0'] ?? 0,
  }
}

async function fetchSeriousCount(name: string): Promise<number> {
  const data = await fdaFetch({
    search: `${drugSearch(name)} AND serious:1`,
    limit: '1',
  })
  return data.meta.results.total
}

export async function fetchDrugReport(name: string): Promise<DrugReport> {
  const total = await fetchTotalCount(name)
  const [reactions, trend, ageGroups, gender, seriousReports] = await Promise.all([
    fetchTopReactions(name, total),
    fetchTrend(name),
    fetchAgeGroups(name),
    fetchGender(name),
    fetchSeriousCount(name),
  ])
  return {
    name,
    totalReports: total,
    seriousReports,
    nonSeriousReports: total - seriousReports,
    topSideEffects: reactions,
    trend,
    ageGroups,
    gender,
    lastUpdated: new Date().toISOString().split('T')[0],
  }
}

// NOTE: FDA API hard cap is 1000 results per request with no pagination offset
// for count queries. Start with 1000 for MVP; expand via skip= pagination later.
export async function fetchTopDrugs(limit = 1000): Promise<string[]> {
  const data = await fdaFetch({
    count: 'patient.drug.medicinalproduct.exact',
    limit: String(Math.min(limit, 1000)),
  })
  return data.results.map((r) => r.term ?? '').filter(Boolean)
}
