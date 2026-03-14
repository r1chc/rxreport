import type { Metadata } from 'next'
import { fetchTopDrugs } from '@/lib/fda'
import { slugify } from '@/lib/drug-list'
import { getTopDrugs, DB_ENABLED } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Top Drugs by FDA Adverse Event Reports',
  description: 'The 500 drugs with the most FDA adverse event reports. Click any drug to see detailed side effect data.',
}

export const revalidate = 604800 // 7 days

export default async function TopDrugsPage() {
  let drugs: string[] = []
  try {
    drugs = DB_ENABLED ? await getTopDrugs(500) : await fetchTopDrugs(500)
  } catch {
    // fallback — page still renders with empty state
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#1a3c34' }}>Top Drugs by FDA Reports</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Ranked by total adverse event reports in the FDA FAERS database. Click any drug to see detailed side effect data.
      </p>
      {drugs.length === 0 ? (
        <p className="text-gray-400 text-sm">Drug data is temporarily unavailable. Please check back shortly.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100" style={{ background: '#f0fdf4' }}>
                <th className="py-3 px-4 text-left font-semibold text-xs uppercase tracking-wider text-gray-500 w-12">#</th>
                <th className="py-3 px-4 text-left font-semibold text-xs uppercase tracking-wider text-gray-500">Drug Name</th>
                <th className="py-3 px-4 text-right font-semibold text-xs uppercase tracking-wider text-gray-500">View</th>
              </tr>
            </thead>
            <tbody>
              {drugs.map((drug, i) => (
                <tr key={drug} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {drug.charAt(0).toUpperCase() + drug.slice(1).toLowerCase()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={`/drug/${slugify(drug)}`}
                      className="text-xs font-medium hover:underline"
                      style={{ color: '#1a3c34' }}
                    >
                      View reports →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
