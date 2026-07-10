'use client'

import type { FunnelEvent } from './types'

interface Props {
  events: FunnelEvent[]
}

const DEVICE_COLORS: Record<string, string> = {
  mobile: 'bg-violet-500',
  desktop: 'bg-blue-500',
  tablet: 'bg-amber-500',
}

export function DeviceBreakdown({ events }: Props) {
  const sessions = new Map<string, string>() // sessionId -> device_type
  for (const e of events) {
    if (e.device_type && !sessions.has(e.session_id)) {
      sessions.set(e.session_id, e.device_type)
    }
  }

  const counts: Record<string, number> = {}
  for (const device of sessions.values()) {
    counts[device] = (counts[device] ?? 0) + 1
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  const entries = Object.entries(counts).sort(([, a], [, b]) => b - a)

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Device Breakdown</h3>
      {entries.length === 0 ? (
        <div className="text-xs text-slate-400 py-6 text-center">No data yet</div>
      ) : (
        <>
          <div className="h-3 rounded-full overflow-hidden flex mb-4 bg-slate-100">
            {entries.map(([device, count]) => (
              <div
                key={device}
                className={DEVICE_COLORS[device] ?? 'bg-slate-400'}
                style={{ width: `${(count / total) * 100}%` }}
                title={`${device}: ${count}`}
              />
            ))}
          </div>
          <div className="space-y-2">
            {entries.map(([device, count]) => (
              <div key={device} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 capitalize text-slate-600">
                  <span className={`w-2.5 h-2.5 rounded-sm ${DEVICE_COLORS[device] ?? 'bg-slate-400'}`} />
                  {device}
                </span>
                <span className="text-slate-500 font-medium">
                  {count} <span className="text-slate-300">({Math.round((count / total) * 100)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
