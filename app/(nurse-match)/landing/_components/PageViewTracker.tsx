'use client'

import { useEffect } from 'react'
import { trackFunnelEvent } from '@/lib/tracking/funnelTracker'

/** 落地页浏览打点。只在首次挂载时触发一次，不阻塞渲染。 */
export default function PageViewTracker() {
  useEffect(() => {
    trackFunnelEvent({ eventType: 'page_view', page: 'landing' })
  }, [])

  return null
}
