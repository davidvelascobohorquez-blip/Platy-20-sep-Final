import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/utils/signature'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token') || ''
  const payload:any = verifyToken(token)
  if (!payload || payload.plan !== 'lifetime') return NextResponse.json({ ok:false }, { status: 401 })
  if (payload.exp && Date.now() > payload.exp) return NextResponse.json({ ok:false, error:'expired' }, { status: 401 })
  const res = NextResponse.redirect(new URL('/pro', req.url))
  res.cookies.set('platy_access', token, { httpOnly:true, sameSite:'lax', secure:true, maxAge: 60*60*24*365*10 })
  return res
}
