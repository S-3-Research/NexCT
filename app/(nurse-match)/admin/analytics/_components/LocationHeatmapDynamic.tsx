'use client'

import dynamic from 'next/dynamic'
import type { FunnelEvent } from './types'

export const LocationHeatmapDynamic = dynamic(
  () => import('./LocationHeatmap').then((m) => ({ default: m.LocationHeatmap })),
  { ssr: false, loading: () => <div className="h-[360px] flex items-center justify-center text-slate-400 text-sm">Loading map…</div> },
) as React.ComponentType<{ events: FunnelEvent[] }>
