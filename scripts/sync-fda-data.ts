/**
 * sync-fda-data.ts
 *
 * Fetches drug adverse event data from the FDA FAERS API and upserts it
 * into the Supabase Postgres database so the Next.js app can read from its
 * own DB instead of hitting the FDA API on every request.
 *
 * Usage:
 *   npx tsx scripts/sync-fda-data.ts            # sync up to 500 drugs
 *   npx tsx scripts/sync-fda-data.ts --limit 50 # test run with 50 drugs
 *
 * Required env vars:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2)
const limitFlag = args.indexOf('--limit')
const DRUG_LIMIT = limitFlag !== -1 ? parseInt(args[limitFlag + 1], 10) : 500
const BATCH_SIZE = 5   // concurrent drugs per FDA API batch

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ---------------------------------------------------------------------------
// FDA API helpers (mirrors src/lib/fda.ts but without Next.js cache headers)
// ---------------------------------------------------------------------------

const FDA_EVENT_BASE = 'https://api.fda.gov/drug/event.json'
const FDA_LABEL_BASE = 'https://api.fda.gov/drug/label.json'

interface FDACountResult {
  term?: string
  time?: string
  count: number
}

interface FDAQueryResponse {
  meta: { results: { total: number } }
  results: FDACountResult[]
}

async function fdaFetch(
  base: string,
  params: Record<string, string>,
): Promise<FDAQueryResponse> {
  const url = new URL(base)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await delay(1500 * attempt)
    const res = await fetch(url.toString())
    if (res.status === 429) { await delay(2000); continue }
    if (!res.ok) throw new Error(`FDA API ${res.status}: ${url.toString()}`)
    return res.json() as Promise<FDAQueryResponse>
  }
  throw new Error('FDA API error: too many retries (429)')
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function drugSearch(name: string) {
  return `patient.drug.medicinalproduct:"${name.toUpperCase()}"`
}

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// ---------------------------------------------------------------------------
// FDA event data fetchers
// ---------------------------------------------------------------------------

async function fetchTotalCount(name: string): Promise<number> {
  const data = await fdaFetch(FDA_EVENT_BASE, { search: drugSearch(name), limit: '1' })
  return data.meta.results.total
}

async function fetchSeriousCount(name: string): Promise<number> {
  const data = await fdaFetch(FDA_EVENT_BASE, {
    search: `${drugSearch(name)} AND serious:1`,
    limit: '1',
  })
  return data.meta.results.total
}

async function fetchTopReactions(name: string, total: number) {
  const data = await fdaFetch(FDA_EVENT_BASE, {
    search: drugSearch(name),
    count: 'patient.reaction.reactionmeddrapt.exact',
    limit: '20',
  })
  return data.results.map((r, i) => ({
    name: (r.term ?? '').toLowerCase(),
    count: r.count,
    percentage: Math.round((r.count / total) * 1000) / 10,
    rank: i + 1,
  }))
}

async function fetchTrend(name: string) {
  const data = await fdaFetch(FDA_EVENT_BASE, {
    search: drugSearch(name),
    count: 'receivedate',
  })
  const quarters: Record<string, number> = {}
  data.results.forEach(({ time, count }) => {
    if (!time) return
    const year = time.slice(0, 4)
    const month = parseInt(time.slice(4, 6), 10)
    const q = Math.ceil(month / 3)
    quarters[`${year} Q${q}`] = (quarters[`${year} Q${q}`] ?? 0) + count
  })
  return Object.entries(quarters)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([quarter, count]) => ({ quarter, count }))
}

async function fetchAgeGroups(name: string) {
  const data = await fdaFetch(FDA_EVENT_BASE, {
    search: drugSearch(name),
    count: 'patient.patientonsetage',
    limit: '100',
  })
  const total = data.results.reduce((s, r) => s + r.count, 0)
  const buckets: Record<string, number> = {
    '0-17': 0, '18-44': 0, '45-64': 0, '65-74': 0, '75+': 0,
  }
  data.results.forEach(({ term, count }) => {
    const age = parseInt(term ?? '', 10)
    if (isNaN(age)) return
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

async function fetchGender(name: string) {
  const data = await fdaFetch(FDA_EVENT_BASE, {
    search: drugSearch(name),
    count: 'patient.patientsex',
  })
  const map: Record<string, number> = {}
  data.results.forEach(({ term, count }) => { if (term) map[term] = count })
  return { male: map['1'] ?? 0, female: map['2'] ?? 0, unknown: map['0'] ?? 0 }
}

async function fetchSeriousnessBreakdown(name: string) {
  const base = drugSearch(name)
  const countFor = (field: string) =>
    fdaFetch(FDA_EVENT_BASE, { search: `${base} AND ${field}:1`, limit: '1' })
      .then((d) => d.meta.results.total)
      .catch(() => 0)

  const [death, hospitalization, life_threatening, disabling, congenital_anomali] =
    await Promise.all([
      countFor('seriousnessdeath'),
      countFor('seriousnesshospitalization'),
      countFor('seriousnesslifethreatening'),
      countFor('seriousnessdisabling'),
      countFor('seriousnesscongenitalanomali'),
    ])
  return { death, hospitalization, life_threatening, disabling, congenital_anomali }
}

const OUTCOME_LABELS: Record<string, string> = {
  '1': 'Recovered / Resolved',
  '2': 'Recovering / Resolving',
  '3': 'Not Recovered',
  '4': 'Fatal',
  '5': 'Unknown',
  '6': 'Unknown',
}

async function fetchOutcomes(name: string) {
  try {
    const data = await fdaFetch(FDA_EVENT_BASE, {
      search: drugSearch(name),
      count: 'patient.reaction.reactionoutcome',
    })
    const total = data.results.reduce((s, r) => s + r.count, 0)
    const merged = new Map<string, number>()
    data.results
      .filter((r) => r.term && OUTCOME_LABELS[r.term])
      .forEach((r) => {
        const lbl = OUTCOME_LABELS[r.term!]
        merged.set(lbl, (merged.get(lbl) ?? 0) + r.count)
      })
    return Array.from(merged.entries()).map(([label, count]) => ({
      label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
  } catch { return [] }
}

async function fetchIndications(name: string) {
  try {
    const data = await fdaFetch(FDA_EVENT_BASE, {
      search: drugSearch(name),
      count: 'patient.drug.drugindication.exact',
      limit: '12',
    })
    const total = data.results.reduce((s, r) => s + r.count, 0)
    const merged = new Map<string, number>()
    data.results
      .filter((r) => {
        const t = (r.term ?? '').toUpperCase()
        return t && t !== 'PRODUCT USED FOR UNKNOWN INDICATION' && t !== 'DRUG USE FOR UNKNOWN INDICATION'
      })
      .forEach((r) => {
        const lbl = r.term!.charAt(0).toUpperCase() + r.term!.slice(1).toLowerCase()
        merged.set(lbl, (merged.get(lbl) ?? 0) + r.count)
      })
    return Array.from(merged.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({
        label,
        count,
        percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
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

async function fetchReporterTypes(name: string) {
  try {
    const data = await fdaFetch(FDA_EVENT_BASE, {
      search: drugSearch(name),
      count: 'primarysource.qualification',
    })
    const total = data.results.reduce((s, r) => s + r.count, 0)
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

async function fetchCountries(name: string) {
  try {
    const data = await fdaFetch(FDA_EVENT_BASE, {
      search: drugSearch(name),
      count: 'occurcountry.exact',
      limit: '10',
    })
    const total = data.results.reduce((s, r) => s + r.count, 0)
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

async function fetchActionTaken(name: string) {
  try {
    const data = await fdaFetch(FDA_EVENT_BASE, {
      search: drugSearch(name),
      count: 'patient.drug.actiondrug',
    })
    const total = data.results.reduce((s, r) => s + r.count, 0)
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

async function fetchRoutes(name: string) {
  try {
    const data = await fdaFetch(FDA_EVENT_BASE, {
      search: drugSearch(name),
      count: 'patient.drug.drugadministrationroute',
      limit: '15',
    })
    const total = data.results.reduce((s, r) => s + r.count, 0)
    return data.results
      .map((r) => ({
        label: ROUTE_LABELS[r.term ?? ''] ?? r.term ?? 'Unknown',
        count: r.count,
        percentage: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
      }))
      .slice(0, 10)
  } catch { return [] }
}

async function fetchCoReported(name: string) {
  try {
    const data = await fdaFetch(FDA_EVENT_BASE, {
      search: drugSearch(name),
      count: 'patient.drug.medicinalproduct.exact',
      limit: '25',
    })
    const upper = name.toUpperCase()
    const filtered = data.results.filter((r) => r.term && r.term.toUpperCase() !== upper)
    const total = filtered.reduce((s, r) => s + r.count, 0)
    return filtered.slice(0, 10).map((r) => ({
      co_drug_label: r.term!.charAt(0).toUpperCase() + r.term!.slice(1).toLowerCase(),
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }))
  } catch { return [] }
}

// ---------------------------------------------------------------------------
// FDA Label API fetcher
// ---------------------------------------------------------------------------

async function fetchDrugLabel(name: string) {
  const upper = name.toUpperCase()
  for (const field of ['openfda.brand_name', 'openfda.generic_name']) {
    try {
      const url = new URL(FDA_LABEL_BASE)
      url.searchParams.set('search', `${field}:"${upper}"`)
      url.searchParams.set('limit', '1')
      const res = await fetch(url.toString())
      if (!res.ok) continue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await res.json()
      const r = data.results?.[0]
      if (!r) continue
      const cleanPharmClass = (classes: string[]) =>
        classes
          .map((c: string) => c.replace(/\s*\[EPC\]\s*$/i, '').replace(/\s*\[MoA\]\s*$/i, '').trim())
          .filter(Boolean)

      return {
        has_black_box_warning: !!(r.boxed_warning?.[0]),
        black_box_warning: r.boxed_warning?.[0] ?? null,
        warnings: r.warnings?.[0] ?? null,
        contraindications: r.contraindications?.[0] ?? null,
        indications_and_usage: r.indications_and_usage?.[0] ?? null,
        pharm_class: cleanPharmClass(r.openfda?.pharm_class_epc ?? []),
        brand_names: (r.openfda?.brand_name ?? []).map(
          (n: string) => n.charAt(0) + n.slice(1).toLowerCase(),
        ),
        generic_names: (r.openfda?.generic_name ?? []).map(
          (n: string) => n.charAt(0) + n.slice(1).toLowerCase(),
        ),
        manufacturer: r.openfda?.manufacturer_name?.[0] ?? null,
      }
    } catch {
      continue
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Fetch all data for a single drug
// ---------------------------------------------------------------------------

async function fetchTopDrugs(limit: number): Promise<string[]> {
  // FDA API hard cap is 1000 per count query
  const cap = Math.min(limit, 1000)
  const data = await fdaFetch(FDA_EVENT_BASE, {
    count: 'patient.drug.medicinalproduct.exact',
    limit: String(cap),
  })
  return data.results.map((r) => r.term ?? '').filter(Boolean)
}

// ---------------------------------------------------------------------------
// Supabase upsert helpers
// ---------------------------------------------------------------------------

async function upsertBreakdownTable(
  table: string,
  drugSlug: string,
  conflictColumn: string,
  rows: Array<Record<string, unknown>>,
) {
  if (rows.length === 0) return
  const records = rows.map((r) => ({ ...r, drug_slug: drugSlug, updated_at: new Date().toISOString() }))
  const { error } = await supabase
    .from(table)
    .upsert(records, { onConflict: `drug_slug,${conflictColumn}` })
  if (error) console.warn(`  [warn] ${table} upsert:`, error.message)
}

// ---------------------------------------------------------------------------
// Sync a single drug
// ---------------------------------------------------------------------------

async function syncDrug(name: string, index: number, total: number): Promise<boolean> {
  const slug = slugify(name)
  const label = `[${index + 1}/${total}] ${name} (${slug})`

  try {
    console.log(`  ${label} — fetching...`)

    // Fetch core report data (sequential to stay within FDA rate limits)
    const totalReports = await fetchTotalCount(name)
    if (totalReports === 0) {
      console.log(`  ${label} — skipped (0 reports)`)
      return false
    }

    const seriousReports = await fetchSeriousCount(name)

    // Remaining fetches run concurrently per drug
    const [
      reactions,
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
      coReported,
      labelData,
    ] = await Promise.all([
      fetchTopReactions(name, totalReports),
      fetchTrend(name),
      fetchAgeGroups(name),
      fetchGender(name),
      fetchSeriousnessBreakdown(name),
      fetchOutcomes(name),
      fetchIndications(name),
      fetchReporterTypes(name),
      fetchCountries(name),
      fetchActionTaken(name),
      fetchRoutes(name),
      fetchCoReported(name),
      fetchDrugLabel(name),
    ])

    const now = new Date().toISOString()

    // 1. Upsert master drug row
    const { error: drugErr } = await supabase.from('drugs').upsert(
      {
        slug,
        name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
        total_reports: totalReports,
        serious_reports: seriousReports,
        non_serious_reports: totalReports - seriousReports,
        last_synced_at: now,
        updated_at: now,
      },
      { onConflict: 'slug' },
    )
    if (drugErr) { console.warn(`  ${label} — drugs upsert error:`, drugErr.message); return false }

    // 2. Reactions
    await upsertBreakdownTable(
      'drug_reactions',
      slug,
      'name',
      reactions.map((r) => ({ name: r.name, count: r.count, percentage: r.percentage, rank: r.rank })),
    )

    // 3. Trends
    await upsertBreakdownTable(
      'drug_trends',
      slug,
      'quarter',
      trend.map((t) => ({ quarter: t.quarter, count: t.count })),
    )

    // 4. Age groups
    await upsertBreakdownTable(
      'drug_age_groups',
      slug,
      'label',
      ageGroups.map((a) => ({ label: a.label, count: a.count, percentage: a.percentage })),
    )

    // 5. Gender (single row, upsert by PK)
    const { error: genderErr } = await supabase
      .from('drug_gender')
      .upsert({ drug_slug: slug, ...gender, updated_at: now }, { onConflict: 'drug_slug' })
    if (genderErr) console.warn(`  ${label} — drug_gender:`, genderErr.message)

    // 6. Seriousness (single row, upsert by PK)
    const { error: seriErr } = await supabase
      .from('drug_seriousness')
      .upsert({ drug_slug: slug, ...seriousnessBreakdown, updated_at: now }, { onConflict: 'drug_slug' })
    if (seriErr) console.warn(`  ${label} — drug_seriousness:`, seriErr.message)

    // 7. Outcomes
    await upsertBreakdownTable(
      'drug_outcomes',
      slug,
      'label',
      outcomes.map((o) => ({ label: o.label, count: o.count, percentage: o.percentage })),
    )

    // 8. Indications
    await upsertBreakdownTable(
      'drug_indications',
      slug,
      'label',
      indications.map((i) => ({ label: i.label, count: i.count, percentage: i.percentage })),
    )

    // 9. Reporter types
    await upsertBreakdownTable(
      'drug_reporter_types',
      slug,
      'label',
      reporterTypes.map((r) => ({ label: r.label, count: r.count, percentage: r.percentage })),
    )

    // 10. Countries
    await upsertBreakdownTable(
      'drug_countries',
      slug,
      'label',
      countries.map((c) => ({ label: c.label, count: c.count, percentage: c.percentage })),
    )

    // 11. Action taken
    await upsertBreakdownTable(
      'drug_action_taken',
      slug,
      'label',
      actionTaken.map((a) => ({ label: a.label, count: a.count, percentage: a.percentage })),
    )

    // 12. Routes
    await upsertBreakdownTable(
      'drug_routes',
      slug,
      'label',
      routes.map((r) => ({ label: r.label, count: r.count, percentage: r.percentage })),
    )

    // 13. Co-reported drugs
    await upsertBreakdownTable(
      'drug_co_reported',
      slug,
      'co_drug_label',
      coReported.map((c) => ({ co_drug_label: c.co_drug_label, count: c.count, percentage: c.percentage })),
    )

    // 14. Label data (if available)
    if (labelData) {
      const { error: labelErr } = await supabase
        .from('drug_labels')
        .upsert({ drug_slug: slug, ...labelData, updated_at: now }, { onConflict: 'drug_slug' })
      if (labelErr) console.warn(`  ${label} — drug_labels:`, labelErr.message)
    }

    console.log(`  ${label} — done (${totalReports.toLocaleString()} reports)`)
    return true
  } catch (err) {
    console.error(`  ${label} — ERROR:`, err instanceof Error ? err.message : err)
    return false
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\nRxReport FDA sync — limit=${DRUG_LIMIT}, batch=${BATCH_SIZE}`)
  console.log('='.repeat(60))

  // Write sync_log start row
  const { data: logRow, error: logStartErr } = await supabase
    .from('sync_log')
    .insert({ started_at: new Date().toISOString(), status: 'running' })
    .select('id')
    .single()

  if (logStartErr) {
    console.warn('Could not write sync_log start row:', logStartErr.message)
  }
  const syncLogId: number | null = logRow?.id ?? null

  let drugsSynced = 0
  let finalStatus = 'success'
  let finalError: string | null = null

  try {
    console.log(`\nFetching top ${DRUG_LIMIT} drugs from FDA...`)
    const drugNames = await fetchTopDrugs(DRUG_LIMIT)
    const drugsToProcess = drugNames.slice(0, DRUG_LIMIT)
    console.log(`Got ${drugsToProcess.length} drugs. Processing in batches of ${BATCH_SIZE}...\n`)

    for (let i = 0; i < drugsToProcess.length; i += BATCH_SIZE) {
      const batch = drugsToProcess.slice(i, i + BATCH_SIZE)
      const results = await Promise.all(
        batch.map((name, batchIdx) => syncDrug(name, i + batchIdx, drugsToProcess.length)),
      )
      drugsSynced += results.filter(Boolean).length

      // Small pause between batches to be polite to the FDA API
      if (i + BATCH_SIZE < drugsToProcess.length) {
        await delay(500)
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`Sync complete. Drugs synced: ${drugsSynced} / ${drugsToProcess.length}`)
  } catch (err) {
    finalStatus = 'error'
    finalError = err instanceof Error ? err.message : String(err)
    console.error('\nFatal sync error:', finalError)
  }

  // Update sync_log row with result
  if (syncLogId !== null) {
    const { error: logEndErr } = await supabase
      .from('sync_log')
      .update({
        completed_at: new Date().toISOString(),
        drugs_synced: drugsSynced,
        status: finalStatus,
        error: finalError,
      })
      .eq('id', syncLogId)

    if (logEndErr) console.warn('Could not update sync_log end row:', logEndErr.message)
  }

  process.exit(finalStatus === 'success' ? 0 : 1)
}

main()
