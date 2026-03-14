import type { DrugLabel } from '@/types/fda'

const LABEL_BASE = 'https://api.fda.gov/drug/label.json'

function escapeLucene(value: string): string {
  return value.replace(/[+\-!(){}[\]^"~*?:\\/]/g, '\\$&')
}

async function labelFetch(params: Record<string, string>): Promise<any> {
  const url = new URL(LABEL_BASE)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { next: { revalidate: 604800 } })
  if (!res.ok) throw new Error(`Label API error: ${res.status}`)
  return res.json()
}

function cleanPharmClass(classes: string[]): string[] {
  return classes.map((c) => c.replace(/\s*\[EPC\]\s*$/i, '').replace(/\s*\[MoA\]\s*$/i, '').trim()).filter(Boolean)
}

function first(arr: string[] | undefined): string | null {
  return arr?.[0] ?? null
}

export async function fetchDrugLabel(name: string): Promise<DrugLabel | null> {
  if (!name || name.length > 200) throw new Error('Invalid drug name')
  const upper = escapeLucene(name.toUpperCase())

  // Try brand name first, then generic name
  for (const field of ['openfda.brand_name', 'openfda.generic_name']) {
    try {
      const data = await labelFetch({ search: `${field}:"${upper}"`, limit: '1' })
      const r = data.results?.[0]
      if (!r) continue
      return {
        hasBlackBoxWarning: !!(r.boxed_warning?.[0]),
        blackBoxWarning: first(r.boxed_warning),
        warnings: first(r.warnings),
        contraindications: first(r.contraindications),
        indicationsAndUsage: first(r.indications_and_usage),
        pharmClass: cleanPharmClass([
          ...(r.openfda?.pharm_class_epc ?? []),
        ]),
        brandNames: (r.openfda?.brand_name ?? []).map((n: string) => n.charAt(0) + n.slice(1).toLowerCase()),
        genericNames: (r.openfda?.generic_name ?? []).map((n: string) => n.charAt(0) + n.slice(1).toLowerCase()),
        manufacturer: first(r.openfda?.manufacturer_name) ?? null,
      }
    } catch {
      continue
    }
  }
  return null
}

// Build a Set of drug names (uppercased) that have a black box warning.
// Used at build time to badge drugs in listings.
export async function fetchBlackBoxDrugSet(names: string[]): Promise<Set<string>> {
  const bbwSet = new Set<string>()
  const chunks: string[][] = []
  for (let i = 0; i < names.length; i += 20) chunks.push(names.slice(i, i + 20))
  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async (name) => {
        const label = await fetchDrugLabel(name).catch(() => null)
        if (label?.hasBlackBoxWarning) bbwSet.add(name.toUpperCase())
      })
    )
  }
  return bbwSet
}
