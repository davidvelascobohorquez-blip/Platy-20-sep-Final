import { NextRequest, NextResponse } from 'next/server'
import { signPayload, verifyToken } from '@/utils/signature'

function isAdmin(req: NextRequest) {
  const cookie = req.headers.get('cookie') || ''
  const match = /platy_admin=([^;]+)/.exec(cookie)
  if (!match) return false
  try {
    const jwt = decodeURIComponent(match[1])
    const payload = verifyToken(jwt)
    return payload && payload.role === 'admin'
  } catch { return false }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok:false }, { status: 401 })
  const { email } = await req.json()
  if (!email) return NextResponse.json({ ok:false, error:'email_required' }, { status: 400 })
  const token = signPayload({ plan:'lifetime', email, iat: Date.now(), exp: Date.now() + 1000*60*60*24*2 })
  const url = new URL('/activate', req.url)
  url.searchParams.set('token', token)
  return NextResponse.json({ ok:true, link: url.toString() })
}
