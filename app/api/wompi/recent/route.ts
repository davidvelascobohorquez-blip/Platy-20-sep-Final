import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const per = url.searchParams.get('per') || '20'
  const base = process.env.WOMPI_API_BASE || 'https://production.wompi.co'
  const key = process.env.WOMPI_PRIVATE_KEY || ''
  const res = await fetch(`${base}/v1/transactions?per_page=${per}`, { headers: { Authorization: `Bearer ${key}` }, cache:'no-store' })
  const data = await res.json()
  return NextResponse.json(data)
}
