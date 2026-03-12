import { fetchTopDrugs } from '@/lib/fda'

export function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function unslugify(slug: string): string {
  return slug.replace(/-/g, ' ').toUpperCase()
}

// Called once at build time — cached in Next.js build cache
let cachedDrugs: string[] | null = null

export async function getTopDrugSlugs(): Promise<string[]> {
  if (cachedDrugs) return cachedDrugs
  const names = await fetchTopDrugs() // 1000 drug cap per FDA API limit; expand later via pagination
  cachedDrugs = names.map(slugify)
  return cachedDrugs
}
