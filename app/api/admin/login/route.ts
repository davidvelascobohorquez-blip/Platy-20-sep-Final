import { NextResponse } from 'next/server'
import { signPayload } from '@/utils/signature'

export async function POST(req: Request) {
  const { password } = await req.json()
  const ok = password && password === process.env.ADMIN_PASSWORD
  if (!ok) return NextResponse.json({ ok:false }, { status: 401 })
  const token = signPayload({ role:'admin', iat: Date.now() })
  const res = NextResponse.json({ ok:true })
  res.cookies.set('platy_admin', token, { httpOnly:true, sameSite:'lax', secure:true, maxAge: 60*60*24*2 })
  return res
}
