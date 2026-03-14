import { fetchTopDrugs } from '@/lib/fda'
import { fetchDrugLabel } from '@/lib/label'

export interface CategoryEntry {
  slug: string
  name: string
  drugs: string[]
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Build a map of pharmacologic class -> drug names.
// Fetches labels for top drugs in batches to stay within rate limits.
export async function buildCategoryMap(limit = 150): Promise<CategoryEntry[]> {
  const drugs = await fetchTopDrugs(limit)
  const map = new Map<string, { slug: string; drugs: string[] }>()

  // Process in batches of 15 to avoid hammering the API
  const batches: string[][] = []
  for (let i = 0; i < drugs.length; i += 15) batches.push(drugs.slice(i, i + 15))

  for (const batch of batches) {
    await Promise.all(
      batch.map(async (drug) => {
        const label = await fetchDrugLabel(drug).catch(() => null)
        if (!label?.pharmClass.length) return
        for (const cls of label.pharmClass) {
          const slug = toSlug(cls)
          if (!map.has(slug)) map.set(slug, { slug, drugs: [] })
          const displayName = drug.charAt(0).toUpperCase() + drug.slice(1).toLowerCase()
          if (!map.get(slug)!.drugs.includes(displayName)) {
            map.get(slug)!.drugs.push(displayName)
          }
        }
      })
    )
  }

  return Array.from(map.entries())
    .map(([, v]) => ({
      slug: v.slug,
      name: v.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      drugs: v.drugs.sort(),
    }))
    .filter((c) => c.drugs.length >= 1)
    .sort((a, b) => b.drugs.length - a.drugs.length)
}
