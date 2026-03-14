/**
 * db.ts — Supabase data layer
 *
 * Provides the same function signatures as the FDA API helpers in fda.ts /
 * label.ts / categories.ts so that pages can swap to this source with minimal
 * changes. Every function returns null / [] on errors — callers decide whether
 * to fall back to the FDA API.
 */

import { createClient } from '@supabase/supabase-js'
import type {
  DrugReport,
  DrugLabel,
  BreakdownItem,
  RisingDrug,
  SideEffect,
  TrendPoint,
  AgeGroup,
  GenderBreakdown,
  SeriousnessBreakdown,
} from '@/types/fda'
import type { CategoryEntry } from '@/lib/categories'

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export const DB_ENABLED = !!(
  process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
)

const supabase = DB_ENABLED
  ? createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    )
  : null

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function client() {
  if (!supabase) throw new Error('Supabase client not initialised')
  return supabase
}

// ---------------------------------------------------------------------------
// getDrugReport
// ---------------------------------------------------------------------------

export async function getDrugReport(slug: string): Promise<DrugReport | null> {
  try {
    const db = client()

    // Fetch all tables in parallel
    const [
      drugRow,
      reactionsRow,
      trendsRow,
      ageGroupsRow,
      genderRow,
      seriousnessRow,
      outcomesRow,
      indicationsRow,
      reporterTypesRow,
      countriesRow,
      actionTakenRow,
      routesRow,
    ] = await Promise.all([
      db.from('drugs').select('*').eq('slug', slug).single(),
      db.from('drug_reactions').select('*').eq('drug_slug', slug).order('rank'),
      db.from('drug_trends').select('*').eq('drug_slug', slug).order('quarter'),
      db.from('drug_age_groups').select('*').eq('drug_slug', slug),
      db.from('drug_gender').select('*').eq('drug_slug', slug).single(),
      db.from('drug_seriousness').select('*').eq('drug_slug', slug).single(),
      db.from('drug_outcomes').select('*').eq('drug_slug', slug),
      db.from('drug_indications').select('*').eq('drug_slug', slug),
      db.from('drug_reporter_types').select('*').eq('drug_slug', slug),
      db.from('drug_countries').select('*').eq('drug_slug', slug),
      db.from('drug_action_taken').select('*').eq('drug_slug', slug),
      db.from('drug_routes').select('*').eq('drug_slug', slug),
    ])

    if (drugRow.error || !drugRow.data) return null

    const drug = drugRow.data

    const topSideEffects: SideEffect[] = (reactionsRow.data ?? []).map(
      (r: any) => ({
        name: r.name,
        count: r.count,
        percentage: r.percentage,
      })
    )

    const trend: TrendPoint[] = (trendsRow.data ?? []).map((r: any) => ({
      quarter: r.quarter,
      count: r.count,
    }))

    const ageGroups: AgeGroup[] = (ageGroupsRow.data ?? []).map((r: any) => ({
      label: r.label,
      count: r.count,
      percentage: r.percentage,
    }))

    const gd = genderRow.data
    const gender: GenderBreakdown = gd
      ? { male: gd.male ?? 0, female: gd.female ?? 0, unknown: gd.unknown ?? 0 }
      : { male: 0, female: 0, unknown: 0 }

    const sd = seriousnessRow.data
    const seriousnessBreakdown: SeriousnessBreakdown = sd
      ? {
          death: sd.death ?? 0,
          hospitalization: sd.hospitalization ?? 0,
          lifeThreatening: sd.life_threatening ?? 0,
          disabling: sd.disabling ?? 0,
          congenitalAnomali: sd.congenital_anomali ?? 0,
        }
      : {
          death: 0,
          hospitalization: 0,
          lifeThreatening: 0,
          disabling: 0,
          congenitalAnomali: 0,
        }

    const toBreakdown = (rows: any[] | null): BreakdownItem[] =>
      (rows ?? []).map((r: any) => ({
        label: r.label,
        count: r.count,
        percentage: r.percentage,
      }))

    const lastUpdated =
      drug.last_synced_at
        ? new Date(drug.last_synced_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

    return {
      name: drug.name,
      totalReports: drug.total_reports ?? 0,
      seriousReports: drug.serious_reports ?? 0,
      nonSeriousReports: drug.non_serious_reports ?? 0,
      topSideEffects,
      trend,
      ageGroups,
      gender,
      seriousnessBreakdown,
      outcomes: toBreakdown(outcomesRow.data),
      indications: toBreakdown(indicationsRow.data),
      reporterTypes: toBreakdown(reporterTypesRow.data),
      countries: toBreakdown(countriesRow.data),
      actionTaken: toBreakdown(actionTakenRow.data),
      routes: toBreakdown(routesRow.data),
      lastUpdated,
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// getDrugLabel
// ---------------------------------------------------------------------------

export async function getDrugLabel(slug: string): Promise<DrugLabel | null> {
  try {
    const { data, error } = await client()
      .from('drug_labels')
      .select('*')
      .eq('drug_slug', slug)
      .single()

    if (error || !data) return null

    return {
      hasBlackBoxWarning: data.has_black_box_warning ?? false,
      blackBoxWarning: data.black_box_warning ?? null,
      // These text columns are not stored in DB — return null so callers
      // degrade gracefully (same behaviour as a missing FDA label result).
      warnings: null,
      contraindications: null,
      indicationsAndUsage: null,
      pharmClass: Array.isArray(data.pharm_class) ? data.pharm_class : [],
      brandNames: Array.isArray(data.brand_names) ? data.brand_names : [],
      genericNames: Array.isArray(data.generic_names) ? data.generic_names : [],
      manufacturer: data.manufacturer ?? null,
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// getCoReportedDrugs
// ---------------------------------------------------------------------------

export async function getCoReportedDrugs(slug: string): Promise<BreakdownItem[]> {
  try {
    const { data, error } = await client()
      .from('drug_co_reported')
      .select('*')
      .eq('drug_slug', slug)
      .order('count', { ascending: false })

    if (error || !data) return []

    return data.map((r: any) => ({
      label: r.co_drug_label,
      count: r.count,
      percentage: r.percentage,
    }))
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// getTrendingDrugs
// ---------------------------------------------------------------------------

export async function getTrendingDrugs(
  limit = 10
): Promise<{ name: string; count: number }[]> {
  try {
    const { data, error } = await client()
      .from('drugs')
      .select('name, total_reports')
      .order('total_reports', { ascending: false })
      .limit(limit)

    if (error || !data) return []

    return data.map((r: any) => ({
      name:
        r.name.charAt(0).toUpperCase() + r.name.slice(1).toLowerCase(),
      count: r.total_reports ?? 0,
    }))
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// getTopDrugs
// ---------------------------------------------------------------------------

export async function getTopDrugs(limit = 1000): Promise<string[]> {
  try {
    const { data, error } = await client()
      .from('drugs')
      .select('name')
      .order('total_reports', { ascending: false })
      .limit(limit)

    if (error || !data) return []

    return data.map((r: any) => r.name as string).filter(Boolean)
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// getRisingDrugs
// Computes year-over-year change from drug_trends, comparing the most recent
// complete year against the prior year.
// ---------------------------------------------------------------------------

export async function getRisingDrugs(topN = 5): Promise<RisingDrug[]> {
  try {
    const db = client()

    // Fetch all trend rows so we can group in memory.
    // For large tables a DB-side aggregation via RPC would be better, but this
    // keeps the implementation self-contained and avoids requiring a stored proc.
    const { data, error } = await db
      .from('drug_trends')
      .select('drug_slug, quarter, count')

    if (error || !data || data.length === 0) return []

    // Aggregate counts by (drug_slug, year)
    const yearlyTotals = new Map<string, Map<number, number>>()
    for (const row of data as { drug_slug: string; quarter: string; count: number }[]) {
      // quarter format: "2023 Q1"
      const year = parseInt(row.quarter.slice(0, 4), 10)
      if (isNaN(year)) continue

      if (!yearlyTotals.has(row.drug_slug)) {
        yearlyTotals.set(row.drug_slug, new Map())
      }
      const yearMap = yearlyTotals.get(row.drug_slug)!
      yearMap.set(year, (yearMap.get(year) ?? 0) + row.count)
    }

    // Determine the most recent year that appears in the data
    let maxYear = 0
    for (const yearMap of yearlyTotals.values()) {
      for (const y of yearMap.keys()) {
        if (y > maxYear) maxYear = y
      }
    }
    const priorYear = maxYear - 1

    // Join drug names
    const { data: drugRows, error: drugErr } = await db
      .from('drugs')
      .select('slug, name')

    if (drugErr || !drugRows) return []

    const slugToName = new Map<string, string>(
      (drugRows as { slug: string; name: string }[]).map((r) => [r.slug, r.name])
    )

    const results: RisingDrug[] = []

    for (const [slug, yearMap] of yearlyTotals.entries()) {
      const currentYearCount = yearMap.get(maxYear) ?? 0
      const priorYearCount = yearMap.get(priorYear) ?? 0

      // Skip drugs with no prior-year baseline or very low volume (noise filter)
      if (priorYearCount < 100) continue

      const percentChange =
        Math.round(((currentYearCount - priorYearCount) / priorYearCount) * 1000) / 10

      const rawName = slugToName.get(slug) ?? slug
      const displayName =
        rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()

      results.push({
        name: displayName,
        slug,
        currentYearCount,
        priorYearCount,
        percentChange,
      })
    }

    return results
      .sort((a, b) => b.percentChange - a.percentChange)
      .slice(0, topN)
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// getCategoryMap
// Joins drug_labels -> drugs, groups by each pharm_class element,
// returns CategoryEntry[] sorted by drug count descending.
// ---------------------------------------------------------------------------

function toSlug(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export async function getCategoryMap(limit = 150): Promise<CategoryEntry[]> {
  try {
    const db = client()

    // Fetch drug_labels joined to drugs (we only need name + pharm_class)
    const { data: labelRows, error: labelErr } = await db
      .from('drug_labels')
      .select('drug_slug, pharm_class')

    if (labelErr || !labelRows || labelRows.length === 0) return []

    // Fetch drug names
    const { data: drugRows, error: drugErr } = await db
      .from('drugs')
      .select('slug, name, total_reports')
      .order('total_reports', { ascending: false })
      .limit(limit)

    if (drugErr || !drugRows) return []

    // Build a set of top-N slugs so we only categorise drugs in scope
    const topSlugs = new Set<string>(
      (drugRows as { slug: string }[]).map((r) => r.slug)
    )
    const slugToName = new Map<string, string>(
      (drugRows as { slug: string; name: string }[]).map((r) => [r.slug, r.name])
    )

    // Group by pharm_class
    const map = new Map<string, { slug: string; drugs: string[] }>()

    for (const row of labelRows as { drug_slug: string; pharm_class: string[] | null }[]) {
      if (!topSlugs.has(row.drug_slug)) continue
      if (!Array.isArray(row.pharm_class) || row.pharm_class.length === 0) continue

      const rawName = slugToName.get(row.drug_slug) ?? row.drug_slug
      const displayName =
        rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()

      for (const cls of row.pharm_class) {
        if (!cls) continue
        const slug = toSlug(cls)
        if (!map.has(slug)) map.set(slug, { slug, drugs: [] })
        const entry = map.get(slug)!
        if (!entry.drugs.includes(displayName)) {
          entry.drugs.push(displayName)
        }
      }
    }

    return Array.from(map.values())
      .map((v) => ({
        slug: v.slug,
        name: v.slug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        drugs: v.drugs.sort(),
      }))
      .filter((c) => c.drugs.length >= 1)
      .sort((a, b) => b.drugs.length - a.drugs.length)
  } catch {
    return []
  }
}
