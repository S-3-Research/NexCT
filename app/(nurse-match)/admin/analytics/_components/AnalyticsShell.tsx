'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart3, Trash2, FlaskConical } from 'lucide-react'
import { FunnelChart } from './FunnelChart'
import { DailyTrendChart } from './DailyTrendChart'
import { DeviceBreakdown } from './DeviceBreakdown'
import { AbandonmentTable } from './AbandonmentTable'
import { LocationHeatmapDynamic } from './LocationHeatmapDynamic'
import type { FunnelEvent } from './types'

interface Props {
  events: FunnelEvent[]
}

const CLEANUP_OPTIONS = [
  { label: '5 min', minutes: 5 },
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '24 hours', minutes: 24 * 60 },
]

export function AnalyticsShell({ events }: Props) {
  const [cleaning, setCleaning] = useState<number | null>(null)
  const [cleanupMsg, setCleanupMsg] = useState<string | null>(null)
  const [showTestTraffic, setShowTestTraffic] = useState(false)

  const visibleEvents = useMemo(
    () => (showTestTraffic ? events : events.filter((e) => !e.is_test)),
    [events, showTestTraffic],
  )
  const testEventCount = useMemo(() => events.filter((e) => e.is_test).length, [events])

  const kpis = useMemo(() => {
    const landingViews = visibleEvents.filter((e) => e.page === 'landing' && e.event_type === 'page_view').length
    const applyStarts = new Set(
      visibleEvents.filter((e) => e.page === 'apply' && e.event_type === 'step_view' && e.step === 1).map((e) => e.session_id),
    ).size
    const submissions = new Set(
      visibleEvents.filter((e) => e.page === 'apply' && e.event_type === 'form_submit').map((e) => e.session_id),
    ).size
    const completionRate = applyStarts > 0 ? Math.round((submissions / applyStarts) * 100) : 0
    return { landingViews, applyStarts, submissions, completionRate }
  }, [visibleEvents])

  async function handleCleanup(minutes: number, label: string) {
    if (!confirm(`Delete all tracking events from the last ${label}? This cannot be undone.`)) return
    setCleaning(minutes)
    setCleanupMsg(null)
    try {
      const res = await fetch('/api/nurse-match/admin/clear-tracking-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? 'Failed to delete events')
      setCleanupMsg(`Deleted ${json.deleted} event(s) from the last ${label}. Refresh the page to see updated charts.`)
    } catch (err) {
      setCleanupMsg(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setCleaning(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="h-14 border-b border-slate-100 px-6 flex items-center justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={15} />
            <span className="text-xs font-medium">Back to Admin</span>
          </Link>
          <div className="w-px h-5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-600" />
            <span className="text-sm font-bold text-slate-800">nexct-nursematch</span>
            <span className="text-sm text-slate-300">·</span>
            <span className="text-sm font-medium text-slate-500">Analytics</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowTestTraffic((v) => !v)}
            className={`flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-[11px] font-medium transition-colors ${
              showTestTraffic ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
            title="Toggle visibility of test/dev traffic (marked via localhost, preview, or ?nm_test=1)"
          >
            <FlaskConical size={12} />
            {showTestTraffic ? `Showing test data (${testEventCount})` : `Test data hidden (${testEventCount})`}
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <span className="flex items-center gap-1 text-[11px] text-slate-400 mr-1">
            <Trash2 size={12} />
            Clear test data:
          </span>
          {CLEANUP_OPTIONS.map(({ label, minutes }) => (
            <button
              key={minutes}
              onClick={() => handleCleanup(minutes, label)}
              disabled={cleaning !== null}
              className="h-7 px-2.5 rounded-lg text-[11px] font-medium text-slate-500
                         hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {cleaning === minutes ? '…' : label}
            </button>
          ))}
        </div>
      </header>

      {cleanupMsg && (
        <div className="max-w-[1200px] mx-auto px-6 pt-4">
          <div className="text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
            {cleanupMsg}
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-6 py-6">
        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <KpiCard label="Landing Page Views" value={kpis.landingViews} />
          <KpiCard label="Apply Started" value={kpis.applyStarts} />
          <KpiCard label="Submissions" value={kpis.submissions} />
          <KpiCard label="Completion Rate" value={`${kpis.completionRate}%`} accent />
        </div>

        {visibleEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-400 text-sm">
            No tracking data yet. Events will appear here as visitors browse the landing and apply pages.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <DailyTrendChart events={visibleEvents} />
            </div>
            <FunnelChart events={visibleEvents} />
            <DeviceBreakdown events={visibleEvents} />
            <div className="col-span-2">
              <AbandonmentTable events={visibleEvents} />
            </div>
            <div className="col-span-2">
              <LocationHeatmapDynamic events={visibleEvents} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <div className="text-xs font-medium text-slate-400 mb-1.5">{label}</div>
      <div className={`text-2xl font-bold ${accent ? 'text-blue-600' : 'text-slate-800'}`}>{value}</div>
    </div>
  )
}
