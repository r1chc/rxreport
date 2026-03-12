import type { MetadataRoute } from 'next'
import { getTopDrugSlugs } from '@/lib/drug-list'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let drugSlugs: string[] = []
  try {
    drugSlugs = await getTopDrugSlugs()
  } catch {
    // FDA API unavailable — omit drug pages from sitemap this build
  }
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: 'https://rxreport.com', lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: 'https://rxreport.com/top-drugs', lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://rxreport.com/compare', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://rxreport.com/about', lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://rxreport.com/disclaimer', lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const drugPages: MetadataRoute.Sitemap = drugSlugs.map((slug) => ({
    url: `https://rxreport.com/drug/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...drugPages]
}
