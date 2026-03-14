import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300 // 5 min max (Vercel Pro allows up to 900s)
export const dynamic = 'force-dynamic'

const FDA_EVENT_BASE = 'https://api.fda.gov/drug/event.json'
const FDA_LABEL_BASE = 'https://api.fda.gov/drug/label.json'
const BATCH_SIZE = 5

// Vercel calls crons with the CRON_SECRET in the Authorization header
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false  // fail closed — require secret always
  const incoming = req.headers.get('authorization') ?? ''
  const expected = `Bearer ${secret}`
  if (incoming.length !== expected.length) return false
  // timing-safe comparison (Fix 14)
  const a = Buffer.from(incoming)
  const b = Buffer.from(expected)
  return require('crypto').timingSafeEqual(a, b)
}

async function fdaFetch(base: string, params: Record<string, string>) {
  const url = new URL(base)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1500 * attempt))
    const res = await fetch(url.toString())
    if (res.status === 429) continue
    if (!res.ok) throw new Error(`FDA ${res.status}`)
    return res.json()
  }
  throw new Error('FDA API: too many retries')
}

function drugSearch(name: string) {
  return `patient.drug.medicinalproduct:"${name.toUpperCase()}"`
}

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Prevent concurrent runs — check if a sync completed in the last 6 hours
  const { data: recentSync } = await supabase
    .from('sync_log')
    .select('completed_at')
    .eq('status', 'success')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  if (recentSync?.completed_at) {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)
    if (new Date(recentSync.completed_at) > sixHoursAgo) {
      return NextResponse.json({ ok: false, reason: 'Sync ran recently' }, { status: 429 })
    }
  }

  // Fetch top 500 drugs and sync in batches
  let synced = 0
  let errors = 0

  try {
    const data = await fdaFetch(FDA_EVENT_BASE, {
      count: 'patient.drug.medicinalproduct.exact',
      limit: '500',
    })
    const drugs: string[] = data.results.map((r: { term?: string }) => r.term ?? '').filter(Boolean)

    for (let i = 0; i < drugs.length; i += BATCH_SIZE) {
      const batch = drugs.slice(i, i + BATCH_SIZE)
      await Promise.all(batch.map(async (name: string) => {
        try {
          const slug = slugify(name)
          const totalData = await fdaFetch(FDA_EVENT_BASE, { search: drugSearch(name), limit: '1' })
          const total = totalData.meta.results.total
          if (total === 0) return

          const seriousData = await fdaFetch(FDA_EVENT_BASE, { search: `${drugSearch(name)} AND serious:1`, limit: '1' })
          const serious = seriousData.meta.results.total

          await supabase.from('drugs').upsert({
            slug,
            name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
            total_reports: total,
            serious_reports: serious,
            non_serious_reports: total - serious,
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'slug' })

          synced++
        } catch {
          errors++
        }
      }))
      // Small pause between batches
      await new Promise((r) => setTimeout(r, 300))
    }
  } catch (err) {
    console.error('Sync error:', err instanceof Error ? err.message : 'unknown error')
    return NextResponse.json({ error: 'Internal sync error' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    synced,
    errors,
    timestamp: new Date().toISOString(),
  })
}
