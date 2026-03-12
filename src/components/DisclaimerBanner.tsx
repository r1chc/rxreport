export default function DisclaimerBanner() {
  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 py-2 text-xs z-50" style={{ background: '#f0fdf4', borderTop: '1px solid #bbf7d0', color: '#166534' }}>
      <strong>Not medical advice.</strong> Data sourced from the FDA Adverse Event Reporting System (FAERS) via openFDA. Reports are submitted voluntarily and do not establish that a drug caused any reaction. Always consult your healthcare provider.
    </div>
  )
}
