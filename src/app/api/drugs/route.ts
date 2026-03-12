import { NextResponse } from 'next/server'
import { fetchTopDrugs } from '@/lib/fda'

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24h edge cache

export async function GET() {
  const drugs = await fetchTopDrugs(1000)
  const formatted = drugs.map(
    (d) => d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()
  )
  return NextResponse.json(formatted)
}
