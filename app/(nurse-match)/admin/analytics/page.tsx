import { createClient } from '@supabase/supabase-js'
import { AnalyticsShell } from './_components/AnalyticsShell'
import type { FunnelEvent } from './_components/types'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export default async function AnalyticsPage() {
  const { data, error } = await supabase
    .from('funnel_events')
    .select(`
      id, session_id, event_type, page, step,
      geo_city, geo_region, geo_country, geo_lat, geo_lng,
      device_type, browser, is_test, created_at
    `)
    .eq('project', 'nexct-nursematch')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[admin/analytics/page] Supabase error:', error)
  }

  const events: FunnelEvent[] = (data ?? []) as FunnelEvent[]

  return <AnalyticsShell events={events} />
}
