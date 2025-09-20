import { NextResponse } from 'next/server'
import { signPayload } from '@/utils/signature'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const email = searchParams.get('email') || ''
  if (!id) return NextResponse.json({ ok:false, error:'Missing id' }, { status: 400 })

  const base = process.env.WOMPI_API_BASE || 'https://production.wompi.co'
  const key = process.env.WOMPI_PRIVATE_KEY || ''
  try {
    const res = await fetch(`${base}/v1/transactions/${id}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: 'no-store',
    })
    const data = await res.json()
    const status = data?.data?.status || data?.status
    if (status === 'APPROVED' || status === 'APPROVED_PARTIAL') {
      const token = signPayload({ plan:'lifetime', email, iat: Date.now() })
      const resp = NextResponse.json({ ok:true })
      resp.cookies.set('platy_access', token, { httpOnly: true, sameSite: 'lax', secure: true, maxAge: 60*60*24*365*10 })
      return resp
    }
    return NextResponse.json({ ok:false, status }, { status: 402 })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || 'verify_failed' }, { status: 500 })
  }
}
