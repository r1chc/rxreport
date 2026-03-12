export default function DrugPageLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-48 mb-6" />
      <div className="h-8 bg-slate-200 rounded w-64 mb-2" />
      <div className="h-4 bg-slate-200 rounded w-80 mb-8" />
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-200 rounded-lg" />
        ))}
      </div>
      <div className="h-64 bg-slate-200 rounded-lg mb-8" />
      <div className="h-48 bg-slate-200 rounded-lg" />
    </div>
  )
}
