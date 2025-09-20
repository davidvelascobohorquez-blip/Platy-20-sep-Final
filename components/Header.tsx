'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)
  const GPT_LINK = "https://chatgpt.com/g/g-68c9a24d35d88191b6d6750c86a6241f-platy"

  const nav = (
    <nav className="flex items-center gap-6 text-sm text-slate-600">
      <a href="#como" className="hover:text-slate-900">Cómo funciona</a>
      <a href="#para-quien" className="hover:text-slate-900">Para quién</a>
      <a href="#oferta" className="hover:text-slate-900">Precios</a>
      <a href={GPT_LINK} className="hidden md:inline-flex rounded-lg border px-3 py-1.5 hover:bg-slate-50">Probar gratis</a>
      <Link href="/checkout" className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">Comprar</Link>
    </nav>
  )

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg">
          <span className="inline-block h-6 w-6 rounded-full bg-amber-400" />
          <span>platy</span>
        </Link>
        <div className="hidden md:block">{nav}</div>

        {/* Mobile hamburger */}
        <button className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border" onClick={() => setOpen(v=>!v)} aria-label="Abrir menú">
          ☰
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-col gap-3 text-slate-700">
            <a href="#como" onClick={()=>setOpen(false)} className="py-1.5">Cómo funciona</a>
            <a href="#para-quien" onClick={()=>setOpen(false)} className="py-1.5">Para quién</a>
            <a href="#oferta" onClick={()=>setOpen(false)} className="py-1.5">Precios</a>
            <a href={GPT_LINK} onClick={()=>setOpen(false)} className="py-1.5 rounded-lg border px-3">Probar gratis</a>
            <Link href="/checkout" onClick={()=>setOpen(false)} className="py-2 text-center rounded-lg bg-emerald-600 text-white font-semibold">Comprar</Link>
          </div>
        </div>
      )}
    </header>
  )
}
