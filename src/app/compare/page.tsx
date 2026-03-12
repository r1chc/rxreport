import type { Metadata } from 'next'
import { fetchDrugReport } from '@/lib/fda'
import { unslugify } from '@/lib/drug-list'
import DrugSearchBar from '@/components/DrugSearchBar'
import AdSlot from '@/components/AdSlot'
import DrugComparison from '@/components/DrugComparison'

interface Props {
  searchParams: Promise<{ a?: string; b?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { a, b } = await searchParams
  if (a && b) {
    return {
      title: `${unslugify(a)} vs ${unslugify(b)} Side Effects`,
      description: `Compare FDA adverse event reports for ${unslugify(a)} and ${unslugify(b)}.`,
    }
  }
  return {
    title: 'Compare Drug Side Effects',
    description: 'Side-by-side comparison of FDA adverse event data for two drugs.',
  }
}

export default async function ComparePage({ searchParams }: Props) {
  const { a: slugA, b: slugB } = await searchParams

  let reportA = null
  let reportB = null

  if (slugA) {
    try { reportA = await fetchDrugReport(unslugify(slugA)) } catch {}
  }
  if (slugB) {
    try { reportB = await fetchDrugReport(unslugify(slugB)) } catch {}
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#1a3c34' }}>Compare Drug Side Effects</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Enter two drug names to see their FDA adverse event reports side by side.
      </p>

      <div className="flex gap-4 mb-8 flex-wrap">
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Drug A</label>
          <DrugSearchBar initialValue={slugA ?? ''} />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Drug B</label>
          <DrugSearchBar initialValue={slugB ?? ''} />
        </div>
      </div>

      {reportA && reportB ? (
        <DrugComparison reportA={reportA} reportB={reportB} />
      ) : (
        <div className="text-center py-20 text-gray-400">
          Search two drugs above to start comparing.
        </div>
      )}

      <AdSlot slot="5566778899" format="leaderboard" className="mt-10" />
    </div>
  )
}
