import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ ok:false, error:'Missing id' }, { status: 400 })
  const base = process.env.WOMPI_API_BASE || 'https://production.wompi.co'
  const key = process.env.WOMPI_PRIVATE_KEY || ''
  const res = await fetch(`${base}/v1/transactions/${id}`, { headers: { Authorization: `Bearer ${key}` }, cache:'no-store' })
  const data = await res.json()
  return NextResponse.json(data)
}
