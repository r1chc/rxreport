import { NextResponse } from 'next/server'
import { unslugify } from '@/lib/drug-list'

const FDA_BASE = 'https://api.fda.gov/drug/event.json'

function drugSearch(name: string) {
  return `patient.drug.medicinalproduct:"${name.toUpperCase()}"`
}

async function fdaGet(params: Record<string, string>) {
  const url = new URL(FDA_BASE)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { cache: 'no-store' })
  const json = await res.json()
  return { status: res.status, url: url.toString(), json }
}

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = unslugify(searchParams.get('name') ?? 'ozempic')

  const results: Record<string, unknown> = {}

  try {
    const r = await fdaGet({ search: drugSearch(name), limit: '1' })
    results.totalCount = { status: r.status, total: r.json?.meta?.results?.total, error: r.json?.error }
  } catch (e) { results.totalCount = { threw: String(e) } }

  try {
    const r = await fdaGet({ search: drugSearch(name), count: 'patient.reaction.reactionmeddrapt.exact', limit: '20' })
    results.reactions = { status: r.status, resultCount: r.json?.results?.length, error: r.json?.error }
  } catch (e) { results.reactions = { threw: String(e) } }

  try {
    const r = await fdaGet({ search: drugSearch(name), count: 'receivedate' })
    results.trend = { status: r.status, resultCount: r.json?.results?.length, sample: r.json?.results?.[0], error: r.json?.error }
  } catch (e) { results.trend = { threw: String(e) } }

  try {
    const r = await fdaGet({ search: drugSearch(name), count: 'patient.patientonsetage', limit: '100' })
    results.age = { status: r.status, resultCount: r.json?.results?.length, error: r.json?.error }
  } catch (e) { results.age = { threw: String(e) } }

  try {
    const r = await fdaGet({ search: drugSearch(name), count: 'patient.patientsex' })
    results.gender = { status: r.status, resultCount: r.json?.results?.length, error: r.json?.error }
  } catch (e) { results.gender = { threw: String(e) } }

  try {
    const r = await fdaGet({ search: `${drugSearch(name)} AND serious:1`, limit: '1' })
    results.serious = { status: r.status, total: r.json?.meta?.results?.total, error: r.json?.error }
  } catch (e) { results.serious = { threw: String(e) } }

  return NextResponse.json(results)
}
