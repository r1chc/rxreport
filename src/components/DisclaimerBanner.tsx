export default function DisclaimerBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-amber-50 border-t border-amber-200 px-4 py-2 text-xs text-amber-800 z-50">
      <strong>Not medical advice.</strong> Data sourced from the FDA Adverse Event Reporting System (FAERS) via openFDA. Reports are submitted voluntarily and do not establish that a drug caused any reaction. Always consult your healthcare provider.
    </div>
  )
}
