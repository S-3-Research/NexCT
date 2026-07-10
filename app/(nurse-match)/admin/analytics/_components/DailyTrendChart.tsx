'use client'

import { useMemo, useState } from 'react'
import type { FunnelEvent } from './types'

type Granularity = 'day' | 'week'

interface Props {
  events: FunnelEvent[]
}

function getWeekStart(d: Date): string {
  const date = new Date(d)
  const day = date.getDay() // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day // 回退到本周一
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date.toISOString().slice(0, 10)
}

export function DailyTrendChart({ events }: Props) {
  const [granularity, setGranularity] = useState<Granularity>('day')

  const buckets = useMemo(() => {
    const map = new Map<string, { landingViews: number; applyStarts: number; submissions: number }>()
    for (const e of events) {
      const d = new Date(e.created_at)
      const key = granularity === 'day' ? d.toISOString().slice(0, 10) : getWeekStart(d)
      if (!map.has(key)) map.set(key, { landingViews: 0, applyStarts: 0, submissions: 0 })
      const bucket = map.get(key)!
      if (e.page === 'landing' && e.event_type === 'page_view') bucket.landingViews++
      if (e.page === 'apply' && e.event_type === 'step_view' && e.step === 1) bucket.applyStarts++
      if (e.page === 'apply' && e.event_type === 'form_submit') bucket.submissions++
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-14)
  }, [events, granularity])

  const max = Math.max(...buckets.map(([, b]) => b.landingViews), 1)

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Traffic Trend</h3>
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          {(['day', 'week'] as Granularity[]).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`h-6 px-2.5 rounded-md text-[11px] font-medium transition-all ${
                granularity === g ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'
              }`}
            >
              {g === 'day' ? 'Daily' : 'Weekly'}
            </button>
          ))}
        </div>
      </div>

      {buckets.length === 0 ? (
        <div className="text-xs text-slate-400 py-8 text-center">No data yet</div>
      ) : (
        <div className="flex items-end gap-1.5 h-[140px]">
          {buckets.map(([key, b]) => (
            <div key={key} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="w-full flex flex-col justify-end h-[110px] gap-0.5">
                <div
                  className="w-full bg-blue-200 rounded-t-sm"
                  style={{ height: `${(b.landingViews / max) * 100}%` }}
                  title={`Landing views: ${b.landingViews}`}
                />
                <div
                  className="w-full bg-blue-500"
                  style={{ height: `${(b.applyStarts / max) * 100}%` }}
                  title={`Apply starts: ${b.applyStarts}`}
                />
                <div
                  className="w-full bg-emerald-500 rounded-b-sm"
                  style={{ height: `${(b.submissions / max) * 100}%` }}
                  title={`Submissions: ${b.submissions}`}
                />
              </div>
              <span className="text-[9px] text-slate-400 rotate-45 origin-left whitespace-nowrap">
                {key.slice(5)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-6 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-200" /> Landing views</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Apply starts</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Submissions</span>
      </div>
    </div>
  )
}
