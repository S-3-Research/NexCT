import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'nexct-nursematch-cvs'
const SIGNED_URL_TTL_SECONDS = 60 // link expires 1 minute after being issued

// Legacy records (submitted before the bucket was switched to private) stored a full
// public Storage URL in `cv_url` instead of a bare path. Normalize either form down to
// the raw object path so `createSignedUrl` can find it.
function normalizeToPath(raw: string): string {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = raw.indexOf(marker)
  if (idx !== -1) {
    return decodeURIComponent(raw.slice(idx + marker.length))
  }
  return raw
}

// Generates a short-lived signed URL for an applicant's CV stored in the private
// `nexct-nursematch-cvs` bucket. Called from the admin drawer when a reviewer clicks
// "Download CV" — we never store or return a permanent public URL for this PII.
export async function GET(req: NextRequest) {
  const rawPath = req.nextUrl.searchParams.get('path')
  if (!rawPath) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 })
  }
  const path = normalizeToPath(rawPath)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)

  if (error || !data) {
    console.error('[admin/cv-download] Signed URL error:', error)
    return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}
