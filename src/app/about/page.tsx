import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About RxReport — FDA Drug Data Explained',
  description: 'How RxReport works, where the data comes from, and what the numbers mean.',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">About RxReport</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Where does the data come from?</h2>
        <p className="text-slate-600 leading-relaxed">
          All data on RxReport comes directly from the <strong>FDA Adverse Event Reporting System (FAERS)</strong>,
          accessed via the free <a href="https://open.fda.gov" className="text-blue-600 hover:underline" target="_blank" rel="noopener">openFDA API</a>.
          FAERS is a database that contains adverse event reports, medication error reports, and product quality
          complaints submitted to the FDA by consumers, healthcare professionals, and manufacturers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">What does an &ldquo;adverse event report&rdquo; mean?</h2>
        <p className="text-slate-600 leading-relaxed mb-3">
          An adverse event report is a voluntary submission to the FDA describing a negative experience
          someone had while taking a drug. Important caveats:
        </p>
        <ul className="list-disc list-inside text-slate-600 space-y-2 text-sm">
          <li>Reports are <strong>voluntary and self-reported</strong> — they do not prove the drug caused the reaction.</li>
          <li>Drugs with more users will naturally have more reports — raw counts do not imply relative danger.</li>
          <li>The same event may be reported multiple times by different reporters.</li>
          <li>Data quality varies. Some reports are detailed clinical submissions; others are brief consumer notes.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">How often is the data updated?</h2>
        <p className="text-slate-600 leading-relaxed">
          Drug pages are refreshed from openFDA once per week. The FDA updates FAERS quarterly,
          so very recent reports may not yet appear.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Is this medical advice?</h2>
        <p className="text-slate-600 leading-relaxed">
          No. RxReport is an informational tool. Nothing here constitutes medical advice.
          Always consult a licensed healthcare provider about your medications.
          See our full <a href="/disclaimer" className="text-blue-600 hover:underline">medical disclaimer</a>.
        </p>
      </section>
    </div>
  )
}
