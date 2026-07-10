'use client'

import type { FunnelEvent } from './types'

const STEP_LABELS = ['You', 'Background', 'Location', 'Motivation', 'Availability']

interface Props {
  events: FunnelEvent[]
}

/**
 * 放弃率分析：对每个 session，找到它到达的最大 step，且没有 form_submit 记录，
 * 视为在该 step 放弃。同时计算该 session 在放弃前的平均停留时间
 * （从进入该 step 到最后一次事件的时间差）。
 */
export function AbandonmentTable({ events }: Props) {
  const applyEvents = events.filter((e) => e.page === 'apply')
  const bySession = new Map<string, FunnelEvent[]>()
  for (const e of applyEvents) {
    if (!bySession.has(e.session_id)) bySession.set(e.session_id, [])
    bySession.get(e.session_id)!.push(e)
  }

  const abandonedAtStep: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const dwellTimeAtStep: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] }

  for (const sessionEvents of bySession.values()) {
    const submitted = sessionEvents.some((e) => e.event_type === 'form_submit')
    if (submitted) continue

    const stepViews = sessionEvents
      .filter((e) => e.event_type === 'step_view' && e.step != null)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    if (stepViews.length === 0) continue

    const lastStepView = stepViews[stepViews.length - 1]
    const maxStep = lastStepView.step!
    abandonedAtStep[maxStep] = (abandonedAtStep[maxStep] ?? 0) + 1

    // 停留时间：最后一个 step_view 到该 session 最后一个事件的时间差
    const allTimes = sessionEvents.map((e) => new Date(e.created_at).getTime())
    const lastEventTime = Math.max(...allTimes)
    const enteredTime = new Date(lastStepView.created_at).getTime()
    const dwellSeconds = Math.max(0, (lastEventTime - enteredTime) / 1000)
    dwellTimeAtStep[maxStep].push(dwellSeconds)
  }

  const totalAbandoned = Object.values(abandonedAtStep).reduce((a, b) => a + b, 0)

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <h3 className="text-sm font-bold text-slate-800 mb-4">
        Abandonment by Step
        {totalAbandoned > 0 && <span className="ml-2 text-xs font-normal text-slate-400">({totalAbandoned} sessions never submitted)</span>}
      </h3>
      {totalAbandoned === 0 ? (
        <div className="text-xs text-slate-400 py-6 text-center">No abandonment data yet 🎉</div>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-100">
              <th className="pb-2 font-medium">Last Step Reached</th>
              <th className="pb-2 font-medium text-right">Sessions Abandoned</th>
              <th className="pb-2 font-medium text-right">Avg. Dwell Time</th>
            </tr>
          </thead>
          <tbody>
            {STEP_LABELS.map((label, i) => {
              const step = i + 1
              const count = abandonedAtStep[step] ?? 0
              const dwells = dwellTimeAtStep[step] ?? []
              const avgDwell = dwells.length > 0 ? dwells.reduce((a, b) => a + b, 0) / dwells.length : null
              if (count === 0) return null
              return (
                <tr key={step} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 text-slate-700">Step {step} · {label}</td>
                  <td className="py-2 text-right font-medium text-red-500">{count}</td>
                  <td className="py-2 text-right text-slate-500">
                    {avgDwell != null ? `${Math.round(avgDwell)}s` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
