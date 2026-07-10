'use client'

// Event-driven funnel tracking client — anonymous session + lightweight event dispatch.
// Fire-and-forget: never blocks or throws on the calling page.

const SESSION_KEY = 'nm_funnel_session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 天
const TEST_MODE_KEY = 'nm_test_mode'

export type FunnelPage = 'landing' | 'apply'
export type FunnelEventType = 'page_view' | 'step_view' | 'step_complete' | 'form_submit'

interface TrackEventInput {
  eventType: FunnelEventType
  page: FunnelPage
  step?: number
  metadata?: Record<string, unknown>
}

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

/** 方案 1：自动识别开发/预览环境 */
function isNonProductionEnv(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') return true
  if (host.endsWith('.vercel.app')) return true // Vercel preview 部署
  return false
}

/**
 * 方案 2a：手动测试模式开关。
 * 访问 URL 加 ?nm_test=1 开启（写入 localStorage 持久化），?nm_test=0 关闭。
 */
function syncTestModeFromUrl(): void {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  if (!params.has('nm_test')) return
  const value = params.get('nm_test')
  try {
    if (value === '1') {
      window.localStorage.setItem(TEST_MODE_KEY, 'true')
    } else if (value === '0') {
      window.localStorage.removeItem(TEST_MODE_KEY)
    }
  } catch {
    // ignore
  }
}

function isManualTestMode(): boolean {
  if (typeof window === 'undefined') return false
  syncTestModeFromUrl()
  try {
    return window.localStorage.getItem(TEST_MODE_KEY) === 'true'
  } catch {
    return false
  }
}

/** 判断当前流量是否应标记为测试流量（开发/预览环境 或 手动开启测试模式） */
function resolveIsTest(): boolean {
  return isNonProductionEnv() || isManualTestMode()
}

/** 获取（或创建）匿名 session id，存储在 localStorage，30 天滑动过期 */
export function getFunnelSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { id: string; expiresAt: number }
      if (parsed.expiresAt > Date.now()) {
        // 滑动续期
        window.localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ id: parsed.id, expiresAt: Date.now() + SESSION_TTL_MS }),
        )
        return parsed.id
      }
    }
  } catch {
    // localStorage 不可用（隐私模式等）——降级为内存态 session
  }
  const id = generateSessionId()
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ id, expiresAt: Date.now() + SESSION_TTL_MS }))
  } catch {
    // ignore
  }
  return id
}

/** 上报一个漏斗事件。永远不抛错、不阻塞调用方。 */
export function trackFunnelEvent({ eventType, page, step, metadata }: TrackEventInput): void {
  if (typeof window === 'undefined') return

  try {
    const payload = JSON.stringify({
      sessionId: getFunnelSessionId(),
      eventType,
      page,
      step,
      path: window.location.pathname,
      referrer: document.referrer || null,
      metadata,
      isTest: resolveIsTest(),
    })


    const url = '/api/nurse-match/track'

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' })
      const ok = navigator.sendBeacon(url, blob)
      if (ok) return
    }

    // Fallback：fetch + keepalive，不等待响应
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // 静默失败——追踪不应影响用户体验
    })
  } catch {
    // 静默失败
  }
}
