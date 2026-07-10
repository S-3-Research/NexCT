'use client'

import type { FunnelEvent } from './types'

const STEP_LABELS = ['Step 1 · You', 'Step 2 · Background', 'Step 3 · Location', 'Step 4 · Motivation', 'Step 5 · Availability', 'Submitted']

interface Props {
  events: FunnelEvent[]
}

export function FunnelChart({ events }: Props) {
  // 每个 step 的唯一 session 数（step_view），加上 submit 作为最终节点
  const stepSessions: Set<string>[] = [1, 2, 3, 4, 5].map(
    (step) => new Set(events.filter((e) => e.page === 'apply' && e.event_type === 'step_view' && e.step === step).map((e) => e.session_id)),
  )
  const submitSessions = new Set(events.filter((e) => e.page === 'apply' && e.event_type === 'form_submit').map((e) => e.session_id))

  const counts = [...stepSessions.map((s) => s.size), submitSessions.size]
  const max = Math.max(...counts, 1)

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Apply Form Funnel</h3>
      <div className="space-y-3">
        {STEP_LABELS.map((label, i) => {
          const count = counts[i]
          const pct = max > 0 ? (count / max) * 100 : 0
          const prevCount = i > 0 ? counts[i - 1] : count
          const dropPct = prevCount > 0 ? Math.round((1 - count / prevCount) * 100) : 0
          return (
            <div key={label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-600">{label}</span>
                <span className="text-xs text-slate-400">
                  {count} {i > 0 && dropPct > 0 && <span className="text-red-500 ml-1.5">−{dropPct}%</span>}
                </span>
              </div>
              <div className="h-6 rounded-md bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-md transition-all ${i === STEP_LABELS.length - 1 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
