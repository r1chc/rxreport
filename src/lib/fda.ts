import type { DrugReport, SideEffect, TrendPoint, AgeGroup, GenderBreakdown, FDAQueryResponse, BreakdownItem, SeriousnessBreakdown } from '@/types/fda'

const FDA_BASE = 'https://api.fda.gov/drug/event.json'

function escapeLucene(value: string): string {
  return value.replace(/[+\-!(){}[\]^"~*?:\\/]/g, '\\$&')
}

async function fdaFetch(params: Record<string, string>): Promise<FDAQueryResponse> {
  const url = new URL(FDA_BASE)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const maxAttempts = 4
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1500 * attempt))
    const res = await fetch(url.toString(), { next: { revalidate: 604800 } })
    if (res.status === 429) continue
    if (!res.ok) throw new Error(`FDA API error: ${res.status}`)
    return res.json()
  }
  throw new Error('FDA API error: 429')
}

function drugSearch(name: string) {
  return `patient.drug.medicinalproduct:"${escapeLucene(name.toUpperCase())}"`
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

async function fetchSeriousnessBreakdown(name: string): Promise<SeriousnessBreakdown> {
  const base = drugSearch(name)
  const countFor = (field: string) =>
    fdaFetch({ search: `${base} AND ${field}:1`, limit: '1' })
      .then((d) => d.meta.results.total)
      .catch(() => 0)

  const [death, hospitalization, lifeThreatening, disabling, congenitalAnomali] = await Promise.all([
    countFor('seriousnessdeath'),
    countFor('seriousnesshospitalization'),
    countFor('seriousnesslifethreatening'),
    countFor('seriousnessdisabling'),
    countFor('seriousnesscongenitalanomali'),
  ])
  return { death, hospitalization, lifeThreatening, disabling, congenitalAnomali }
}

const OUTCOME_LABELS: Record<string, string> = {
  '1': 'Recovered / Resolved',
  '2': 'Recovering / Resolving',
  '3': 'Not Recovered',
  '4': 'Fatal',
  '5': 'Unknown',
  '6': 'Unknown',
}

async function fetchOutcomes(name: string): Promise<BreakdownItem[]> {
  try {
    const data = await fdaFetch({
      search: drugSearch(name),
      count: 'patient.reaction.reactionoutcome',
    })
    const total = data.results.reduce((sum, r) => sum + r.count, 0)
    return data.results
      .filter((r) => r.term && OUTCOME_LABELS[r.term])
      .map((r) => ({
        label: OUTCOME_LABELS[r.term!],
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
      }))
  } catch { return [] }
}

async function fetchIndications(name: string): Promise<BreakdownItem[]> {
  try {
    const data = await fdaFetch({
      search: drugSearch(name),
      count: 'patient.drug.drugindication.exact',
      limit: '12',
    })
    const total = data.results.reduce((sum, r) => sum + r.count, 0)
    return data.results
      .filter((r) => {
        const t = (r.term ?? '').toUpperCase()
        return t && t !== 'PRODUCT USED FOR UNKNOWN INDICATION' && t !== 'DRUG USE FOR UNKNOWN INDICATION'
      })
      .slice(0, 10)
      .map((r) => ({
        label: r.term!.charAt(0).toUpperCase() + r.term!.slice(1).toLowerCase(),
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
      }))
  } catch { return [] }
}

const REPORTER_LABELS: Record<string, string> = {
  '1': 'Physician',
  '2': 'Pharmacist',
  '3': 'Other Health Professional',
  '4': 'Lawyer',
  '5': 'Consumer / Patient',
}

async function fetchReporterTypes(name: string): Promise<BreakdownItem[]> {
  try {
    const data = await fdaFetch({
      search: drugSearch(name),
      count: 'primarysource.qualification',
    })
    const total = data.results.reduce((sum, r) => sum + r.count, 0)
    return data.results
      .filter((r) => r.term && REPORTER_LABELS[r.term])
      .map((r) => ({
        label: REPORTER_LABELS[r.term!],
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count)
  } catch { return [] }
}

async function fetchCountries(name: string): Promise<BreakdownItem[]> {
  try {
    const data = await fdaFetch({
      search: drugSearch(name),
      count: 'occurcountry.exact',
      limit: '10',
    })
    const total = data.results.reduce((sum, r) => sum + r.count, 0)
    return data.results.slice(0, 10).map((r) => ({
      label: r.term ?? 'Unknown',
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }))
  } catch { return [] }
}

const ACTION_LABELS: Record<string, string> = {
  '1': 'Drug Withdrawn',
  '2': 'Dose Reduced',
  '3': 'Dose Increased',
  '4': 'Dose Not Changed',
  '5': 'Unknown',
  '6': 'Not Applicable',
}

async function fetchActionTaken(name: string): Promise<BreakdownItem[]> {
  try {
    const data = await fdaFetch({
      search: drugSearch(name),
      count: 'patient.drug.actiondrug',
    })
    const total = data.results.reduce((sum, r) => sum + r.count, 0)
    return data.results
      .filter((r) => r.term && ACTION_LABELS[r.term])
      .map((r) => ({
        label: ACTION_LABELS[r.term!],
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
      }))
  } catch { return [] }
}

const ROUTE_LABELS: Record<string, string> = {
  '048': 'Intratracheal', '060': 'Oral', '054': 'Intravenous',
  '052': 'IV Bolus', '053': 'IV Drip', '071': 'Subcutaneous',
  '035': 'Intramuscular', '057': 'Nasal', '067': 'Inhalation',
  '074': 'Topical', '075': 'Transdermal', '073': 'Sublingual',
  '066': 'Rectal', '080': 'Vaginal', '023': 'Intradermal',
  '047': 'Intrathecal', '062': 'Other', '078': 'Unknown',
  '063': 'Parenteral', '058': 'Nasogastric', '059': 'Ophthalmic',
  '003': 'Cutaneous', '013': 'Intra-arterial', '014': 'Intra-articular',
}

async function fetchRoutes(name: string): Promise<BreakdownItem[]> {
  try {
    const data = await fdaFetch({
      search: drugSearch(name),
      count: 'patient.drug.drugadministrationroute',
      limit: '15',
    })
    const total = data.results.reduce((sum, r) => sum + r.count, 0)
    return data.results
      .map((r) => ({
        label: ROUTE_LABELS[r.term ?? ''] ?? r.term ?? 'Unknown',
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
      }))
      .slice(0, 10)
  } catch { return [] }
}

export async function fetchDrugReport(name: string): Promise<DrugReport> {
  if (!name || name.length > 200) throw new Error('Invalid drug name')
  const total = await fetchTotalCount(name)
  const [
    reactions,
    trend,
    ageGroups,
    gender,
    seriousReports,
    seriousnessBreakdown,
    outcomes,
    indications,
    reporterTypes,
    countries,
    actionTaken,
    routes,
  ] = await Promise.all([
    fetchTopReactions(name, total),
    fetchTrend(name),
    fetchAgeGroups(name),
    fetchGender(name),
    fetchSeriousCount(name),
    fetchSeriousnessBreakdown(name),
    fetchOutcomes(name),
    fetchIndications(name),
    fetchReporterTypes(name),
    fetchCountries(name),
    fetchActionTaken(name),
    fetchRoutes(name),
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
    seriousnessBreakdown,
    outcomes,
    indications,
    reporterTypes,
    countries,
    actionTaken,
    routes,
    lastUpdated: new Date().toISOString().split('T')[0],
  }
}

export async function fetchCoReportedDrugs(name: string): Promise<import('@/types/fda').BreakdownItem[]> {
  if (!name || name.length > 200) throw new Error('Invalid drug name')
  try {
    const data = await fdaFetch({
      search: drugSearch(name),
      count: 'patient.drug.medicinalproduct.exact',
      limit: '25',
    })
    const upper = name.toUpperCase()
    const filtered = data.results.filter((r) => r.term && r.term.toUpperCase() !== upper)
    const total = filtered.reduce((sum, r) => sum + r.count, 0)
    return filtered.slice(0, 10).map((r) => ({
      label: r.term!.charAt(0).toUpperCase() + r.term!.slice(1).toLowerCase(),
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }))
  } catch { return [] }
}

export async function fetchRisingDrugs(topN = 5): Promise<import('@/types/fda').RisingDrug[]> {
  const currentYear = new Date().getFullYear()
  const priorYear = currentYear - 1

  try {
    const [currentData, priorData] = await Promise.all([
      fdaFetch({ search: `receivedate:[${currentYear}0101 TO ${currentYear}1231]`, count: 'patient.drug.medicinalproduct.exact', limit: '100' }),
      fdaFetch({ search: `receivedate:[${priorYear}0101 TO ${priorYear}1231]`, count: 'patient.drug.medicinalproduct.exact', limit: '100' }),
    ])

    const priorMap = new Map<string, number>()
    priorData.results.forEach((r) => { if (r.term) priorMap.set(r.term.toUpperCase(), r.count) })

    return currentData.results
      .filter((r) => r.term && priorMap.has(r.term.toUpperCase()) && (priorMap.get(r.term.toUpperCase()) ?? 0) > 100)
      .map((r) => {
        const prior = priorMap.get(r.term!.toUpperCase()) ?? 0
        return {
          name: r.term!.charAt(0).toUpperCase() + r.term!.slice(1).toLowerCase(),
          slug: r.term!.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          currentYearCount: r.count,
          priorYearCount: prior,
          percentChange: Math.round(((r.count - prior) / prior) * 1000) / 10,
        }
      })
      .sort((a, b) => b.percentChange - a.percentChange)
      .slice(0, topN)
  } catch { return [] }
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

export async function fetchTrendingDrugs(limit = 10): Promise<{ name: string; count: number }[]> {
  const data = await fdaFetch({
    count: 'patient.drug.medicinalproduct.exact',
    limit: String(limit),
  })
  return data.results
    .filter((r) => r.term)
    .map((r) => ({
      name: r.term!.charAt(0).toUpperCase() + r.term!.slice(1).toLowerCase(),
      count: r.count,
    }))
}
