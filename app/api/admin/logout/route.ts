import { NextResponse } from 'next/server'
export async function POST() {
  const res = NextResponse.json({ ok:true })
  res.cookies.set('platy_admin','',{ httpOnly:true, maxAge:0, sameSite:'lax' })
  return res
}
