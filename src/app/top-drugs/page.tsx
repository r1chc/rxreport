import type { Metadata } from 'next'
import { fetchTopDrugs } from '@/lib/fda'
import { slugify } from '@/lib/drug-list'

export const metadata: Metadata = {
  title: 'Top Drugs by FDA Adverse Event Reports',
  description: 'The 500 drugs with the most FDA adverse event reports. Click any drug to see detailed side effect data.',
}

export const revalidate = 604800 // 7 days

export default async function TopDrugsPage() {
  const drugs = await fetchTopDrugs(500)

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-2">Top Drugs by FDA Reports</h1>
      <p className="text-slate-500 mb-8 text-sm">
        Ranked by total adverse event reports in the FDA FAERS database. Click any drug to see detailed side effect data.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="pb-3 font-semibold text-slate-500 w-12">#</th>
              <th className="pb-3 font-semibold text-slate-500">Drug Name</th>
              <th className="pb-3 font-semibold text-slate-500 text-right">View</th>
            </tr>
          </thead>
          <tbody>
            {drugs.map((drug, i) => (
              <tr key={drug} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 text-slate-400">{i + 1}</td>
                <td className="py-3 font-medium">
                  {drug.charAt(0).toUpperCase() + drug.slice(1).toLowerCase()}
                </td>
                <td className="py-3 text-right">
                  <a
                    href={`/drug/${slugify(drug)}`}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    View reports →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
