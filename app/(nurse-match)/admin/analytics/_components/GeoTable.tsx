'use client'

import type { FunnelEvent } from './types'

interface Props {
  events: FunnelEvent[]
}

interface GeoRow {
  country: string
  region: string
  city: string
  count: number
  uniqueSessions: number
}

export function GeoTable({ events }: Props) {
  const geoEvents = events.filter((e) => e.geo_city || e.geo_region || e.geo_country)

  const map = new Map<string, { count: number; sessions: Set<string>; country: string; region: string; city: string }>()

  for (const e of geoEvents) {
    const country = e.geo_country ?? '—'
    const region = e.geo_region ?? '—'
    const city = e.geo_city ?? '—'
    const key = `${country}|${region}|${city}`
    if (!map.has(key)) {
      map.set(key, { count: 0, sessions: new Set(), country, region, city })
    }
    const entry = map.get(key)!
    entry.count++
    entry.sessions.add(e.session_id)
  }

  const rows: GeoRow[] = [...map.values()]
    .map((v) => ({ country: v.country, region: v.region, city: v.city, count: v.count, uniqueSessions: v.sessions.size }))
    .sort((a, b) => b.uniqueSessions - a.uniqueSessions)

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Unique Locations</h3>
        <span className="text-xs text-slate-400">{rows.length} distinct location{rows.length !== 1 ? 's' : ''}</span>
      </div>

      {rows.length === 0 ? (
        <div className="text-xs text-slate-400 py-6 text-center">No location data yet</div>
      ) : (
        <div className="max-h-[360px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="text-left text-slate-400 border-b border-slate-100">
                <th className="pb-2 font-medium">Country</th>
                <th className="pb-2 font-medium">Region</th>
                <th className="pb-2 font-medium">City</th>
                <th className="pb-2 font-medium text-right">Unique Sessions</th>
                <th className="pb-2 font-medium text-right">Events</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 text-slate-700">{row.country}</td>
                  <td className="py-2 text-slate-700">{row.region}</td>
                  <td className="py-2 text-slate-700">{row.city}</td>
                  <td className="py-2 text-right font-medium text-blue-600">{row.uniqueSessions}</td>
                  <td className="py-2 text-right text-slate-400">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
