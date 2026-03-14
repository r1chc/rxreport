import type { Metadata } from 'next'
import { buildCategoryMap } from '@/lib/categories'
import { getCategoryMap, DB_ENABLED } from '@/lib/db'
import CategoriesClient from '@/components/CategoriesClient'

export const metadata: Metadata = {
  title: 'Browse Drug Categories',
  description: 'Browse FDA adverse event data organized by drug class — statins, SSRIs, GLP-1 agonists, and more.',
}

export const revalidate = 604800

export default async function CategoriesPage() {
  let categories: { slug: string; name: string; drugs: string[] }[] = []
  try {
    categories = DB_ENABLED ? await getCategoryMap(150) : await buildCategoryMap(150)
  } catch {
    // fallback to empty
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 pb-16">
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a3c34' }}>Browse by Drug Class</h1>
      <p className="text-gray-500 text-sm mb-6">
        {categories.length > 0
          ? `${categories.length} pharmacologic categories · FDA adverse event data organized by drug class`
          : 'Explore FDA adverse event data organized by pharmacologic class.'}
      </p>

      {categories.length === 0 ? (
        <p className="text-gray-400">Category data is unavailable right now.</p>
      ) : (
        <CategoriesClient categories={categories} />
      )}
    </div>
  )
}
