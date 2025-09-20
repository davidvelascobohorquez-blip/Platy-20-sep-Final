'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function FloatingCTA() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (!show) return null
  return (
    <div className="fixed inset-x-0 bottom-4 z-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-slate-700">Acceso de por vida · Garantía 7 días</div>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="hidden sm:inline-flex rounded-xl border px-4 py-2 font-semibold hover:bg-slate-50">Ver demo</Link>
            <Link href="/checkout" className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">Comprar ahora</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
