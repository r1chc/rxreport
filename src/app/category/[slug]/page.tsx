import type { Metadata } from 'next'
import { buildCategoryMap } from '@/lib/categories'
import { getCategoryMap, DB_ENABLED } from '@/lib/db'
import { slugify } from '@/lib/drug-list'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 604800

export async function generateStaticParams() {
  try {
    const cats = DB_ENABLED ? await getCategoryMap(150) : await buildCategoryMap(150)
    return cats.map((c) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return {
    title: `${name} Drugs — FDA Adverse Event Reports`,
    description: `Browse FDA FAERS adverse event data for all ${name} drugs.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  let categories: { slug: string; name: string; drugs: string[] }[] = []
  try {
    categories = DB_ENABLED ? await getCategoryMap(150) : await buildCategoryMap(150)
  } catch {}

  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center text-gray-400 pb-32">
        Category not found. <a href="/categories" className="underline" style={{ color: '#1a3c34' }}>Browse all categories</a>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 pb-32">
      <nav className="text-sm text-gray-400 mb-6">
        <a href="/" className="hover:text-gray-600">Home</a>
        {' / '}
        <a href="/categories" className="hover:text-gray-600">Categories</a>
        {' / '}
        <span style={{ color: '#1a3c34' }} className="font-medium">{category.name}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a3c34' }}>{category.name}</h1>
      <p className="text-gray-500 text-sm mb-10">
        {category.drugs.length} drug{category.drugs.length !== 1 ? 's' : ''} in this class with FDA adverse event data
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {category.drugs.map((drug) => (
          <a
            key={drug}
            href={`/drug/${slugify(drug)}`}
            className="flex items-center justify-between rounded-xl px-4 py-3 border border-gray-100 bg-white hover:border-green-200 hover:bg-green-50 transition-all"
          >
            <span className="text-sm font-medium text-gray-800">{drug}</span>
            <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  )
}
