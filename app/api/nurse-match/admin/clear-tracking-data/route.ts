import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const ALLOWED_MINUTES = [5, 30, 60, 24 * 60]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const minutes = Number(body?.minutes)

    if (!ALLOWED_MINUTES.includes(minutes)) {
      return NextResponse.json({ error: 'Invalid minutes value' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString()

    const { error, count } = await supabase
      .from('funnel_events')
      .delete({ count: 'exact' })
      .eq('project', 'nexct-nursematch')
      .gte('created_at', cutoff)

    if (error) {
      console.error('[clear-tracking-data] Supabase delete error:', error)
      return NextResponse.json({ error: 'Failed to delete events' }, { status: 500 })
    }

    return NextResponse.json({ deleted: count ?? 0 })
  } catch (err) {
    console.error('[clear-tracking-data] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
