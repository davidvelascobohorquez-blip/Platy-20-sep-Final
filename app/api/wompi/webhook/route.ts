import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Webhook de Wompi para confirmar pagos.
// Configura en Wompi → Programadores → URL de eventos: /api/wompi/webhook
// Requiere: WOMPI_EVENTS_SECRET

function verifySignature(raw: string, signature: string | null, secret?: string) {
  if (!signature || !secret) return false
  try {
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')
    const got = signature.replace(/^sha256=/i,'').trim()
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(got))
  } catch { return false }
}

export async function POST(req: NextRequest) {
  const secret = process.env.WOMPI_EVENTS_SECRET
  const rawBody = await req.text()
  const signature = req.headers.get('x-event-signature') || req.headers.get('x-signature')
  const signatureOk = verifySignature(rawBody, signature, secret)

  let payload: any = null
  try { payload = JSON.parse(rawBody) } catch {}

  if (!payload) return NextResponse.json({ ok:false, error:'bad_json' }, { status: 400 })

  const event = String(payload?.event || payload?.data?.event || '').toUpperCase()
  const txId = payload?.data?.transaction?.id || payload?.data?.id || payload?.transaction?.id

  // Consulta de respaldo para verificar estado real
  let verified = false
  if (txId) {
    try {
      const url = new URL(req.url)
      const origin = url.origin
      const r = await fetch(`${origin}/api/wompi/tx?id=${encodeURIComponent(txId)}`, { cache:'no-store' })
      const d = await r.json()
      verified = d?.data?.status === 'APPROVED' || d?.status === 'APPROVED'
    } catch {}
  }

  return NextResponse.json({ ok:true, event, id: txId, verified, signature: signatureOk })
}
