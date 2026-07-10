import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// ── 轻量 User-Agent 解析（无需额外依赖，QPS 极低不需要专业库）────────────────

function parseDeviceType(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/iPad|Tablet/i.test(ua)) return 'tablet'
  if (/Mobi|Android|iPhone/i.test(ua)) return 'mobile'
  return 'desktop'
}

function parseBrowser(ua: string): string | null {
  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\//.test(ua)) return 'Opera'
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) return 'Chrome'
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return 'Safari'
  if (/Firefox\//.test(ua)) return 'Firefox'
  return null
}

function parseOS(ua: string): string | null {
  if (/Windows/.test(ua)) return 'Windows'
  if (/Mac OS X/.test(ua)) return 'macOS'
  if (/Android/.test(ua)) return 'Android'
  if (/iPhone|iPad|iOS/.test(ua)) return 'iOS'
  if (/Linux/.test(ua)) return 'Linux'
  return null
}

function extractIp(req: NextRequest): string | null {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return null
}

function isPrivateOrLocalIp(ip: string): boolean {
  return (
    ip === '::1' ||
    ip.startsWith('127.') ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  )
}

interface GeoResult {
  city: string | null
  region: string | null
  country: string | null
  lat: number | null
  lng: number | null
  /** 调试用：说明 geo 数据来源或失败原因 */
  status:
    | 'vercel_headers'
    | 'ipapi_success'
    | 'ipapi_failed'
    | 'ipapi_error'
    | 'private_or_local_ip'
    | 'missing_ip'
}

/** 优先读取 Vercel 边缘网络自带的地理位置 header（无网络调用，最快最稳） */
function lookupGeoFromVercelHeaders(req: NextRequest): GeoResult | null {
  const city = req.headers.get('x-vercel-ip-city')
  const country = req.headers.get('x-vercel-ip-country')
  const region = req.headers.get('x-vercel-ip-country-region')
  const lat = req.headers.get('x-vercel-ip-latitude')
  const lng = req.headers.get('x-vercel-ip-longitude')

  if (!city && !country && !lat && !lng) return null // 本地开发无此 header，走 fallback

  return {
    city: city ? decodeURIComponent(city) : null,
    region: region ? decodeURIComponent(region) : null,
    country: country ?? null,
    lat: lat ? Number(lat) : null,
    lng: lng ? Number(lng) : null,
    status: 'vercel_headers',
  }
}

async function lookupGeoFromIpapi(ip: string): Promise<GeoResult> {
  const empty: GeoResult = { city: null, region: null, country: null, lat: null, lng: null, status: 'missing_ip' }
  if (!ip) return empty
  if (isPrivateOrLocalIp(ip)) return { ...empty, status: 'private_or_local_ip' }

  try {
    // 免费 IP 地理位置查询，低 QPS（~50/天）完全在免费额度内
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return { ...empty, status: 'ipapi_failed' }
    const data = await res.json()
    if (data.error) return { ...empty, status: 'ipapi_failed' }
    return {
      city: data.city ?? null,
      region: data.region ?? null,
      country: data.country_name ?? null,
      lat: typeof data.latitude === 'number' ? data.latitude : null,
      lng: typeof data.longitude === 'number' ? data.longitude : null,
      status: 'ipapi_success',
    }
  } catch {
    return { ...empty, status: 'ipapi_error' }
  }
}

/** Geo 解析入口：优先 Vercel headers，其次 ipapi.co fallback */
async function lookupGeo(req: NextRequest, ip: string): Promise<GeoResult> {
  const vercelGeo = lookupGeoFromVercelHeaders(req)
  if (vercelGeo) return vercelGeo
  return lookupGeoFromIpapi(ip)
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sessionId, eventType, page, step, path, referrer, metadata, isTest } = body ?? {}

    if (!sessionId || !eventType || !page) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const ua = req.headers.get('user-agent') ?? ''
    const ip = extractIp(req)
    const geo = await lookupGeo(req, ip ?? '')

    const { error } = await supabase.from('funnel_events').insert({
      project: 'nexct-nursematch',
      session_id: String(sessionId),
      event_type: String(eventType),
      page: String(page),
      step: typeof step === 'number' ? step : null,
      path: path ?? null,
      referrer: referrer ?? null,
      ip: ip ?? null,
      geo_city: geo.city,
      geo_region: geo.region,
      geo_country: geo.country,
      geo_lat: geo.lat,
      geo_lng: geo.lng,
      user_agent: ua || null,
      device_type: ua ? parseDeviceType(ua) : null,
      browser: ua ? parseBrowser(ua) : null,
      os: ua ? parseOS(ua) : null,
      metadata: { ...(metadata ?? {}), geo_lookup_status: geo.status },
      is_test: Boolean(isTest),
    })

    if (error) {
      console.error('[track] Supabase insert error:', error)
      // 追踪失败不应影响用户体验，仍返回 204
    }

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    console.error('[track] Unexpected error:', err)
    // 追踪端点永远不应该向前端抛出可见错误
    return new NextResponse(null, { status: 204 })
  }
}
