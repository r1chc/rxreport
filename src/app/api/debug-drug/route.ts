import { NextResponse } from 'next/server'
import { fetchDrugReport } from '@/lib/fda'
import { unslugify } from '@/lib/drug-list'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') ?? 'ozempic'
  try {
    const report = await fetchDrugReport(unslugify(name))
    return NextResponse.json({ ok: true, report })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
