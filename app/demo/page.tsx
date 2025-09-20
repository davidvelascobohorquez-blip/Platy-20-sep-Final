'use client'

import { useEffect, useMemo, useState } from 'react'
import Brand from '@/components/Brand'
import Button from '@/components/Button'
import StepperDots from '@/components/StepperDots'
import PlanPDF, { makePlanPdf } from '@/components/PlanPDF'
import { site } from '@/site.config'

/* =========================
   Tipos (alineados con /api)
========================= */
type Unit = 'g' | 'ml' | 'ud'
type ItemQty = { name: string; qty: number; unit: Unit; estCOP?: number }
type StoreOpt = { nombre: string; tipo: 'hard-discount' | 'supermercado' }
type Plan = {
  menu: { dia: number; plato: string; ingredientes: ItemQty[]; pasos: string[]; tip: string }[]
  lista: Record<string, ItemQty[]>
  batch: { baseA: string; baseB: string }
  sobrantes: string[]
  meta: { ciudad: string; personas: number; modo: string; moneda: 'COP'; meal: string }
  costos: {
    porCategoria: Record<string, number>
    total: number
    nota: string
    detalle: { name: string; qty: number; unit: Unit; estCOP?: number }[]
  }
  tiendas: { sugerida: StoreOpt; opciones: StoreOpt[]; mapsUrl: string }
}

/* =========================
   Utils
========================= */
function fmtCOP(n?: number) {
  if (typeof n !== 'number') return '-'
  return n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
}

/* =========================
   Página
========================= */
export default function DemoPage() {
  // Wizard
  const [step, setStep] = useState(1)
  const totalSteps = 7

  // Estado del formulario
  const [ciudad, setCiudad] = useState('Bogotá, CO')
  const [personas, setPersonas] = useState<number | null>(2)
  const [comidas, setComidas] = useState<string[]>(['Almuerzos']) // puede varias
  const [modo, setModo] = useState<'30 min' | '45 min' | 'Sin preferencia' | null>('30 min')
  const [equipo, setEquipo] = useState<'Todo ok' | 'Sin horno' | 'Sin licuadora' | 'Sin airfryer' | null>('Todo ok')
  const [dieta, setDieta] = useState<'Ninguna' | 'Vegetariana' | 'Vegana' | 'Baja en carbohidratos' | 'Alta en proteína'>('Ninguna')
  const [alergias, setAlergias] = useState<string[]>([])
  const [objetivo, setObjetivo] = useState<'Ahorrar' | 'Variedad' | 'Rápido' | 'Balanceado'>('Ahorrar')
  const [presupuesto, setPresupuesto] = useState<string>('') // opcional (COP aprox)
  const [prefs, setPrefs] = useState<string[]>(['Económico'])

  // Resultado
  const [plan, setPlan] = useState<Plan | null>(null)

  // Loading / overlays
  const [generating, setGenerating] = useState(false)
  const [pdfGenerating, setPdfGenerating] = useState(false)

  // PDF preview
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  // Validaciones por paso (para habilitar Siguiente)
  const canNext = useMemo(() => {
    if (step === 1) return ciudad.trim().length > 1
    if (step === 2) return !!personas
    if (step === 3) return comidas.length > 0
    if (step === 4) return !!modo
    if (step === 5) return !!equipo
    if (step === 6) return true // dieta/alergias siempre válidas
    if (step === 7) return true // prefs/presupuesto
    return false
  }, [step, ciudad, personas, comidas, modo, equipo])

  // WhatsApp
  const whatsUrl = useMemo(() => {
    if (!plan) return '#'
    const totalTxt = plan.costos?.total ? ` · Total aprox: ${fmtCOP(plan.costos.total)}` : ''
    const tienda = plan.tiendas?.sugerida?.nombre ? ` · Sugerencia: ${plan.tiendas.sugerida.nombre}` : ''
    const msg =
      `Menú semanal ${site.brand} — ${plan.meta.ciudad} · ${plan.meta.meal} · ${plan.meta.personas} pers · ${plan.meta.modo}${totalTxt}${tienda}. ` +
      `Incluye cantidades y costo por categoría. Haz el tuyo en ${site.domain}`
    return `https://wa.me/?text=${encodeURIComponent(msg)}`
  }, [plan])

  // Progreso %
  const progressPct = Math.min(100, Math.round((Math.min(step, totalSteps) / totalSteps) * 100))
  const ready = step > totalSteps && !!plan

  async function generarPlan() {
    setGenerating(true)
    setPlan(null)
    setPdfUrl(null)
    try {
      const res = await fetch('/api/generate-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ciudad,
          personas,
          modo,
          equipo,
          prefs,
          comidas,
          dieta,
          alergias,
          objetivo,
          presupuesto: presupuesto ? Number(presupuesto.replace(/[^\d]/g, '')) : undefined,
        }),
      })
      const j = await res.json()
      if (res.ok) {
        setPlan(j)
        setStep(totalSteps + 1)
      } else {
        alert(j?.error || 'No se pudo generar el plan. Intenta de nuevo.')
      }
    } catch (e) {
      alert('Ups… algo falló. Verifica tu conexión e intenta otra vez.')
    } finally {
      setGenerating(false)
    }
  }

  async function generarYPrevisualizarPDF() {
    if (!plan) return
    setPdfGenerating(true)
    try {
      // ⬇️ FIX: makePlanPdf ahora recibe un objeto de opciones
      const blob = await makePlanPdf(plan, {
        lang: 'es',
        brand: site.brand ?? 'Platy',
        city: plan.meta.ciudad,
      })
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
    } catch (e) {
      alert('No pudimos generar el PDF. Intenta de nuevo.')
    } finally {
      setPdfGenerating(false)
    }
  }

  // Limpieza del objectURL del PDF
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [pdfUrl])

  // Helpers UI toggles
  const toggleFromArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]

  return (
    <main className="container py-6 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 md:mb-8">
        <Brand />
        <div className="hidden sm:block min-w-[220px]">
          <StepperDots step={Math.min(step, totalSteps)} total={totalSteps} />
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-full h-2 rounded-full bg-black/5 overflow-hidden mb-6">
        <div
          className="h-full bg-amber transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Botón volver */}
      {step > 1 && step <= totalSteps && (
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="mb-3 inline-flex items-center gap-2 text-sm text-graphite hover:text-charcoal transition-colors"
        >
          <span aria-hidden>←</span> Volver
        </button>
      )}

      {/* Contenido por pasos */}
      {step <= totalSteps && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Columna preguntas */}
          <div className="md:col-span-2 space-y-6" style={{ animation: 'fadeIn .25s ease' }}>
            {/* Paso 1: Ciudad */}
            {step === 1 && (
              <div className="bg-card rounded-3xl shadow-soft border border-line p-6">
                <h2 className="text-2xl font-bold">¿En qué ciudad/país estás?</h2>
                <p className="text-sm text-stone mt-1">
                  Usamos tu ciudad para estimar precios locales y sugerir tiendas cercanas.
                </p>
                <input
                  className="mt-4 w-full rounded-2xl border border-line px-4 py-3"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  placeholder="Ej: Bogotá, CO"
                />
                <div className="mt-6 flex gap-3">
                  <Button onClick={() => setStep(2)} disabled={!canNext}>
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 2: Personas */}
            {step === 2 && (
              <div className="bg-card rounded-3xl shadow-soft border border-line p-6">
                <h2 className="text-2xl font-bold">¿Para cuántas personas cocinamos?</h2>
                <p className="text-sm text-stone mt-1">
                  Escalaremos cantidades (g/ml/ud) por persona.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      onClick={() => setPersonas(n)}
                      className={`px-4 py-2 rounded-2xl border transition-colors ${
                        personas === n
                          ? 'bg-amber border-amber text-charcoal'
                          : 'border-line hover:border-amber'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <Button onClick={() => setStep(3)} disabled={!canNext}>
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 3: Tipo de comida */}
            {step === 3 && (
              <div className="bg-card rounded-3xl shadow-soft border border-line p-6">
                <h2 className="text-2xl font-bold">¿Qué quieres planear?</h2>
                <p className="text-sm text-stone mt-1">
                  Puedes elegir <strong>una o varias</strong> (usaremos la primera para esta semana).
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Desayunos', 'Almuerzos', 'Cenas'].map((m) => {
                    const on = comidas.includes(m)
                    return (
                      <button
                        key={m}
                        onClick={() => setComidas((prev) => toggleFromArray(prev, m))}
                        className={`px-4 py-2 rounded-2xl border transition-colors ${
                          on ? 'bg-amber border-amber text-charcoal' : 'border-line hover:border-amber'
                        }`}
                      >
                        {m}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-6 flex gap-3">
                  <Button onClick={() => setStep(4)} disabled={!canNext}>
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 4: Tiempo */}
            {step === 4 && (
              <div className="bg-card rounded-3xl shadow-soft border border-line p-6">
                <h2 className="text-2xl font-bold">Tiempo</h2>
                <p className="text-sm text-stone mt-1">
                  ¿Cuánto tiempo quieres invertir <strong>cada día</strong>? (elige <strong>una</strong>)
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {(['30 min', '45 min', 'Sin preferencia'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setModo(m)}
                      className={`px-4 py-2 rounded-2xl border transition-colors ${
                        modo === m ? 'bg-amber border-amber text-charcoal' : 'border-line hover:border-amber'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <Button onClick={() => setStep(5)} disabled={!canNext}>
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 5: Equipo */}
            {step === 5 && (
              <div className="bg-card rounded-3xl shadow-soft border border-line p-6">
                <h2 className="text-2xl font-bold">Equipo disponible</h2>
                <p className="text-sm text-stone mt-1">
                  Indica limitaciones para que evitemos recetas que no puedas hacer (elige <strong>una</strong>).
                </p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['Todo ok', 'Sin horno', 'Sin licuadora', 'Sin airfryer'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setEquipo(m)}
                      className={`px-4 py-2 rounded-2xl border transition-colors ${
                        equipo === m ? 'bg-amber border-amber text-charcoal' : 'border-line hover:border-amber'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <Button onClick={() => setStep(6)} disabled={!canNext}>
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 6: Dieta y alergias */}
            {step === 6 && (
              <div className="bg-card rounded-3xl shadow-soft border border-line p-6">
                <h2 className="text-2xl font-bold">Dieta y alergias</h2>
                <p className="text-sm text-stone mt-1">
                  Personalizamos el menú respetando tu estilo y evitando lo que no puedas consumir.
                </p>

                <div className="mt-3">
                  <div className="text-sm text-stone mb-1">Dieta</div>
                  <div className="flex flex-wrap gap-2">
                    {(['Ninguna', 'Vegetariana', 'Vegana', 'Baja en carbohidratos', 'Alta en proteína'] as const).map(
                      (d) => (
                        <button
                          key={d}
                          onClick={() => setDieta(d)}
                          className={`px-4 py-2 rounded-2xl border transition-colors ${
                            dieta === d ? 'bg-amber border-amber text-charcoal' : 'border-line hover:border-amber'
                          }`}
                        >
                          {d}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-stone mb-1">Alergias / Evitar (elige varias si aplica)</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Lácteos', 'Gluten', 'Frutos secos', 'Mariscos', 'Huevo', 'Soya'].map((a) => {
                      const on = alergias.includes(a)
                      return (
                        <button
                          key={a}
                          onClick={() => setAlergias((prev) => toggleFromArray(prev, a))}
                          className={`px-4 py-2 rounded-2xl border transition-colors ${
                            on ? 'bg-amber border-amber text-charcoal' : 'border-line hover:border-amber'
                          }`}
                        >
                          {a}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button onClick={() => setStep(7)} disabled={!canNext}>
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {/* Paso 7: Preferencias y presupuesto */}
            {step === 7 && (
              <div className="bg-card rounded-3xl shadow-soft border border-line p-6">
                <h2 className="text-2xl font-bold">Preferencias y presupuesto</h2>
                <p className="text-sm text-stone mt-1">Puedes seleccionar varias preferencias y un presupuesto objetivo.</p>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Económico', 'Variado', 'Sin picante', 'Bajo sodio', 'Fácil limpieza', 'Rápido'].map((p) => {
                    const on = prefs.includes(p)
                    return (
                      <button
                        key={p}
                        onClick={() => setPrefs((prev) => toggleFromArray(prev, p))}
                        className={`px-4 py-2 rounded-2xl border transition-colors ${
                          on ? 'bg-amber border-amber text-charcoal' : 'border-line hover:border-amber'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 grid sm:grid-cols-[220px,1fr] gap-3 items-center">
                  <label className="text-sm text-stone">Objetivo principal</label>
                  <div className="flex flex-wrap gap-2">
                    {(['Ahorrar', 'Variedad', 'Rápido', 'Balanceado'] as const).map((o) => (
                      <button
                        key={o}
                       

