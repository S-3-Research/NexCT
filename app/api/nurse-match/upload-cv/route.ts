import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Supabase Storage bucket used to store applicant CVs.
// NOTE: this bucket must be created in the Supabase dashboard (Storage → New bucket),
// named exactly `nexct-nursematch-cvs`, and kept **private**. CVs contain PII, so we never
// expose a public URL — instead we store the storage path and generate short-lived signed
// URLs on demand for admins (see /api/nurse-match/admin/cv-download).
const BUCKET = 'nexct-nursematch-cvs'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`
    const typeOk = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(ext)
    if (!typeOk) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a PDF, DOC, or DOCX file.' },
        { status: 400 },
      )
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File is too large. Maximum size is 5MB.' },
        { status: 400 },
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${crypto.randomUUID()}-${safeName}`
    const bytes = new Uint8Array(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadError) {
      console.error('[upload-cv] Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file. Please try again.' }, { status: 500 })
    }

    // Bucket is private — store only the storage path. Never persist a public URL for PII.
    return NextResponse.json({
      path,
      fileName: file.name,
    })
  } catch (err) {
    console.error('[upload-cv] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
