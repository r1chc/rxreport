import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Medical Disclaimer | RxReport',
  description: 'RxReport medical disclaimer and terms of use.',
}

export default function DisclaimerPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">Medical Disclaimer</h1>
      <div className="text-slate-600 leading-relaxed space-y-4">
        <p>
          The information provided on RxReport is sourced from the FDA Adverse Event Reporting System
          (FAERS) via the openFDA public API and is intended for <strong>informational and educational purposes only</strong>.
        </p>
        <p>
          <strong>This website does not provide medical advice.</strong> Nothing on this site should be
          construed as medical advice, diagnosis, or treatment recommendations. Always seek the advice of
          your physician or other qualified health provider with any questions you may have regarding a
          medical condition or medication.
        </p>
        <p>
          Adverse event reports in FAERS are submitted voluntarily. <strong>The existence of a report does
          not establish a causal relationship between a drug and a reported event.</strong> Many factors
          influence whether an event is reported, and the absence of reports does not indicate safety.
        </p>
        <p>
          RxReport is not affiliated with, endorsed by, or officially connected to the U.S. Food and
          Drug Administration (FDA) or any government agency.
        </p>
        <p className="text-sm text-slate-400">Last updated: March 2026</p>
      </div>
    </div>
  )
}
