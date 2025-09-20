'use client'
import { useEffect, useMemo, useState } from 'react'

type Tx = any

export default function AdminPage() {
  const [logged, setLogged] = useState(false)
  const [pwd, setPwd] = useState('')
  const [recent, setRecent] = useState<Tx[]>([])
  const [email, setEmail] = useState('')
  const [grantLink, setGrantLink] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // naive check: try list recent; if 401 -> not logged
    fetch('/api/wompi/recent?per=20').then(r=>{
      if (r.ok) setLogged(true)
    })
  }, [])

  async function login() {
    const res = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password: pwd }) })
    if (res.ok) setLogged(true)
  }

  async function loadRecent() {
    setLoading(true)
    const r = await fetch('/api/wompi/recent?per=20', { cache:'no-store' })
    const d = await r.json()
    setRecent(Array.isArray(d?.data) ? d.data : [])
    setLoading(false)
  }

  async function grant() {
    setLoading(true)
    const r = await fetch('/api/admin/grant', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) })
    const d = await r.json()
    setGrantLink(d?.link || '')
    setLoading(false)
  }

  if (!logged) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-md px-4 py-16">
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="mt-2 text-slate-600">Ingresa tu clave de administrador</p>
          <input className="mt-4 w-full rounded border px-3 py-2" placeholder="Password" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} />
          <button onClick={login} className="mt-4 inline-flex rounded bg-slate-900 px-4 py-2 text-white">Entrar</button>
          <p className="mt-4 text-xs text-slate-500">La sesión dura 48h en este dispositivo.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Panel Admin</h1>
          <form action="/api/admin/logout" method="post"><button className="rounded border px-3 py-1.5">Salir</button></form>
        </div>

        <section className="mt-8 rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Transacciones recientes (Wompi)</h2>
          <button onClick={loadRecent} className="mt-3 rounded bg-emerald-600 px-3 py-1.5 text-white">Cargar últimas 20</button>
          {loading && <p className="mt-3 text-slate-500">Cargando…</p>}
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="text-left text-slate-500"><th className="py-2 pr-6">ID</th><th className="py-2 pr-6">Email</th><th className="py-2 pr-6">Monto</th><th className="py-2 pr-6">Estado</th><th className="py-2 pr-6">Fecha</th></tr></thead>
              <tbody>
              {recent.map((t:any)=> (
                <tr key={t.id} className="border-t">
                  <td className="py-2 pr-6">{t.id}</td>
                  <td className="py-2 pr-6">{t.customer_email || t.customer?.email || '-'}</td>
                  <td className="py-2 pr-6">{t.amount_in_cents ? (t.amount_in_cents/100).toLocaleString('es-CO',{style:'currency',currency: t.currency || 'COP'}) : '-'}</td>
                  <td className="py-2 pr-6">{t.status}</td>
                  <td className="py-2 pr-6">{t.created_at}</td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Generar acceso manual</h2>
          <p className="mt-1 text-slate-600">Crea un link de activación para un email (útil si pagó por otro medio).</p>
          <div className="mt-3 flex gap-2">
            <input className="w-full rounded border px-3 py-2" placeholder="email@cliente.com" value={email} onChange={e=>setEmail(e.target.value)} />
            <button onClick={grant} className="rounded bg-slate-900 px-4 py-2 text-white">Generar</button>
          </div>
          {grantLink && (
            <div className="mt-3 rounded border bg-slate-50 p-3 break-all">
              <div className="text-xs text-slate-500">Link de activación (vence en 48h):</div>
              <a className="text-blue-600 underline" href={grantLink}>{grantLink}</a>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
