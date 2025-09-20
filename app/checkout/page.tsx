'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function CheckoutPage() {
  const WOMPI_LINK = process.env.NEXT_PUBLIC_WOMPI_LINK
  useEffect(() => {
    if (WOMPI_LINK) {
      window.location.href = WOMPI_LINK as string
    }
  }, [WOMPI_LINK])

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold">Redirigiendo al pago seguro…</h1>
        <p className="mt-3 text-slate-600">Si no avanza automáticamente, toca el botón:</p>
        {WOMPI_LINK ? (
          <a href={WOMPI_LINK as string} className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">Ir a pagar en Wompi</a>
        ) : (
          <div className="mt-6">
            <p className="text-slate-600">Configura <code className="px-1 rounded bg-slate-100">NEXT_PUBLIC_WOMPI_LINK</code> en Vercel con tu enlace de pago de Wompi.</p>
            <Link href="/" className="mt-4 inline-flex rounded-xl border px-5 py-3">Volver</Link>
          </div>
        )}
        <p className="mt-8 text-xs text-slate-500">Pago único · Sin mensualidades · Garantía de 7 días</p>
      </div>
    </main>
  )
}
