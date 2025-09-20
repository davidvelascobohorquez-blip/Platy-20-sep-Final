// app/thanks/page.tsx
'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Fuerza dinámico y desactiva ISR en esta ruta
export const dynamic = 'force-dynamic'
export const revalidate = 0 // <-- número, no objeto
export const fetchCache = 'force-no-store'

function ThanksContent() {
  const sp = useSearchParams()
  const [state, setState] = useState<'loading' | 'ok' | 'fail'>('loading')
  const id = sp.get('id') || ''

  useEffect(() => {
    async function verifyById(txid: string) {
      try {
        const res = await fetch(`/api/wompi/verify?id=${encodeURIComponent(txid)}`, { cache: 'no-store' })
        if (res.ok) { setState('ok'); return true }
      } catch {}
      return false
    }
    async function fallbackRecent() {
      try {
        const res = await fetch('/api/wompi/recent?per=5', { cache: 'no-store' })
        const data = await res.json()
        const txs = Array.isArray(data?.data) ? data.data : []
        const ok = txs.find((t: any) => t.status === 'APPROVED')
        if (ok?.id) return verifyById(ok.id)
      } catch {}
      return false
    }
    (async () => {
      if (id) {
        const ok = await verifyById(id)
        if (!ok) setState('fail')
      } else {
        const ok = await fallbackRecent()
        setState(ok ? 'ok' : 'fail')
      }
    })()
  }, [id])

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        {state === 'loading' && <h1 className="text-2xl font-extrabold">Confirmando tu pago…</h1>}

        {state === 'ok' && (
          <div>
            <h1 className="text-3xl font-extrabold">¡Acceso activado! 🎉</h1>
            <p className="mt-3 text-slate-600">Ya puedes usar Platy con acceso vitalicio.</p>
            <Link
              href="/pro"
              className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
            >
              Ir a Platy Pro
            </Link>
          </div>
        )}

        {state === 'fail' && (
          <div>
            <h1 className="text-3xl font-extrabold">No pudimos confirmar el pago</h1>
            <p className="mt-3 text-slate-600">
              Si tu pago fue aprobado, vuelve a abrir este enlace desde el mismo navegador o escríbenos para activarte manualmente.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/admin" className="rounded border px-4 py-2 text-sm">Contactar soporte</Link>
              <Link href="/" className="rounded border px-4 py-2 text-sm">Volver</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function ThanksPage() {
  return (
    <Suspense fallback={<main className="min-h-screen grid place-items-center">Cargando…</main>}>
      <ThanksContent />
    </Suspense>
  )
}

