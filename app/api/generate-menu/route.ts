import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { z } from 'zod'
import pricebookCO from '@/data/pricebook.co.json' assert { type: 'json' }

export const runtime = 'nodejs'

type Unit = 'g' | 'ml' | 'ud'
type ItemQty = { name: string; qty: number; unit: Unit; estCOP?: number }

// ===================== ZOD SCHEMAS =====================
const ItemQtySchema = z.object({
  name: z.string().min(1),
  qty: z.number().positive(),
  unit: z.enum(['g','ml','ud']),
  estCOP: z.number().optional()
})

const DaySchema = z.object({
  dia: z.number().int().min(1).max(7),
  plato: z.string(),
  ingredientes: z.array(ItemQtySchema).min(1),
  pasos: z.array(z.string()).min(1),
  tip: z.string().optional().default('')
})

const PlanSchema = z.object({
  menu: z.array(DaySchema).length(7),
  lista: z.record(z.array(ItemQtySchema)).default({}),
  batch: z.object({
    baseA: z.string().default(''),
    baseB: z.string().default('')
  }).default({ baseA: '', baseB: '' }),
  sobrantes: z.array(z.string()).default([]),
  meta: z.object({
    ciudad: z.string().default(''),
    personas: z.number().int().positive().default(2),
    modo: z.string().default('Almuerzos'),
    moneda: z.enum(['COP']).default('COP')
  }),
  costos: z.object({
    porCategoria: z.record(z.number()).default({}),
    total: z.number().default(0),
    nota: z.string().default('Precios estimados según ciudad')
  })
})

type Plan = z.infer<typeof PlanSchema>

// ===================== HELPERS =====================
function roundFriendly(q: number, u: Unit) {
  if (u === 'ud') return Math.round(q)
  if (q < 100) return Math.round(q/25)*25 // g/ml
  return Math.round(q/50)*50
}

function normalizeUnit(name: string, qty: number, unit: string): ItemQty {
  const u = (unit || '').toLowerCase()
  const spoonG = 5
  const cupG = 230
  const cupMl = 240

  if (['unidad','unidades','u','ud'].includes(u) || ['huevo','pan'].includes(name.toLowerCase())) {
    return { name, qty: roundFriendly(qty, 'ud'), unit: 'ud' }
  }
  if (['gr','gramo','gramos','g'].includes(u)) {
    return { name, qty: roundFriendly(qty, 'g'), unit: 'g' }
  }
  if (['ml','mililitro','mililitros'].includes(u)) {
    return { name, qty: roundFriendly(qty, 'ml'), unit: 'ml' }
  }
  if (['cda','cucharada','cucharadita'].includes(u)) {
    return { name, qty: roundFriendly(qty*spoonG, 'g'), unit: 'g' }
  }
  if (['taza','tazas','cup','cups'].includes(u)) {
    const liquid = /leche|agua|caldo|aceite/.test(name.toLowerCase())
    return liquid
      ? { name, qty: roundFriendly(qty*cupMl, 'ml'), unit: 'ml' }
      : { name, qty: roundFriendly(qty*cupG, 'g'), unit: 'g' }
  }
  // por defecto g
  return { name, qty: roundFriendly(qty, 'g'), unit: 'g' }
}

function unitPriceCOP(item: string, ciudad: string) {
  const key = item.toLowerCase()
  const row = (pricebookCO as any)[key] || {}
  const city = row[ciudad] || row['Bogotá, CO'] || {}
  return {
    perGram: typeof city.perGram === 'number' ? city.perGram : undefined,
    perMl:   typeof city.perMl   === 'number' ? city.perMl   : undefined,
    perUnit: typeof city.perUnit === 'number' ? city.perUnit : undefined,
  }
}

function estimateItemCOP(it: ItemQty, ciudad: string) {
  const p = unitPriceCOP(it.name, ciudad)
  if (it.unit === 'g' && p.perGram) return it.qty * p.perGram
  if (it.unit === 'ml' && p.perMl) return it.qty * p.perMl
  if (it.unit === 'ud' && p.perUnit) return it.qty * p.perUnit
  return undefined
}

function consolidate(items: ItemQty[]) {
  const map = new Map<string, ItemQty>()
  for (const it of items) {
    const key = `${it.name.toLowerCase()}__${it.unit}`
    const prev = map.get(key)
    if (!prev) map.set(key, { ...it })
    else prev.qty += it.qty
  }
  return [...map.values()]
}

function buildCosts(lista: Record<string, ItemQty[]>, ciudad: string) {
  const porCategoria: Record<string, number> = {}
  let total = 0
  for (const [cat, arr] of Object.entries(lista)) {
    let sum = 0
    for (const it of arr) {
      const est = estimateItemCOP(it, ciudad)
      if (est) sum += est
    }
    porCategoria[cat] = Math.round(sum)
    total += sum
  }
  return { porCategoria, total: Math.round(total) }
}

// fallback súper estable si el modelo falla
function fallbackPlan(ciudad: string, personas: number, modo: string): Plan {
  const base = [
    { dia: 1, plato: 'Arroz con pollo', receta: [{ n: 'arroz', u: 'g', pp: 90 }, { n: 'pollo pechuga', u: 'g', pp: 120 }, { n: 'cebolla', u: 'g', pp: 50 }, { n: 'aceite', u: 'ml', pp: 8 }] },
    { dia: 2, plato: 'Pasta con tomate', receta: [{ n: 'pasta', u: 'g', pp: 110 }, { n: 'tomate', u: 'g', pp: 120 }, { n: 'ajo', u: 'g', pp: 6 }, { n: 'aceite', u: 'ml', pp: 8 }] },
    { dia: 3, plato: 'Arepa con queso y huevo', receta: [{ n: 'arepa', u: 'ud', pp: 1 }, { n: 'queso', u: 'g', pp: 35 }, { n: 'huevo', u: 'ud', pp: 1 }] },
    { dia: 4, plato: 'Salteado de verduras', receta: [{ n: 'brocoli', u: 'g', pp: 120 }, { n: 'zanahoria', u: 'g', pp: 80 }, { n: 'cebolla', u: 'g', pp: 50 }, { n: 'aceite', u: 'ml', pp: 8 }] },
    { dia: 5, plato: 'Sopa casera', receta: [{ n: 'zanahoria', u: 'g', pp: 70 }, { n: 'papa', u: 'g', pp: 150 }, { n: 'cebolla', u: 'g', pp: 50 }, { n: 'ajo', u: 'g', pp: 6 }] },
    { dia: 6, plato: 'Tacos rápidos', receta: [{ n: 'tortilla', u: 'ud', pp: 2 }, { n: 'queso', u: 'g', pp: 25 }, { n: 'pimentón', u: 'g', pp: 60 }, { n: 'cebolla', u: 'g', pp: 50 }] },
    { dia: 7, plato: 'Arroz frito con sobrantes', receta: [{ n: 'arroz', u: 'g', pp: 80 }, { n: 'huevo', u: 'ud', pp: 1 }, { n: 'cebolla', u: 'g', pp: 40 }] }
  ]

  const menu = base.map(d => {
    const ingredientes: ItemQty[] = d.receta.map(r => ({
      name: r.n,
      unit: r.u as Unit,
      qty: roundFriendly(r.pp * personas, r.u as Unit)
    }))
    return { dia: d.dia, plato: d.plato, ingredientes, pasos: ['Preparar', 'Cocer', 'Servir'], tip: 'Aprovecha bases para otros días' }
  })

  const cats: Record<string, string[]> = {
    Verduras: ['tomate', 'cebolla', 'pimentón', 'zanahoria', 'brocoli', 'papa'],
    Proteína: ['pollo pechuga', 'huevo', 'queso'],
    Granos: ['arroz', 'pasta', 'tortilla', 'arepa'],
    Abarrotes: ['aceite', 'ajo']
  }

  const all = consolidate(menu.flatMap(m => m.ingredientes))
  const lista: Record<string, ItemQty[]> = {}
  for (const it of all) {
    const cat = Object.keys(cats).find(k => cats[k].includes(it.name)) || 'Otros'
    if (!lista[cat]) lista[cat] = []
    lista[cat].push({ ...it, estCOP: estimateItemCOP(it, ciudad) })
  }
  const costos = buildCosts(lista, ciudad)

  return {
    menu,
    lista,
    batch: { baseA: 'Cocina arroz para 3 días', baseB: 'Pica sofrito para 2 preparaciones' },
    sobrantes: ['Usa el pollo del lunes para tacos el sábado'],
    meta: { ciudad, personas, modo, moneda: 'COP' },
    costos: { porCategoria: costos.porCategoria, total: costos.total, nota: 'Precios estimados según ciudad' }
  }
}

// ===================== HANDLER =====================
export async function POST(req: NextRequest) {
  const body = await req.json()
  const trials = Number(cookies().get('platy_trials')?.value || '0')
  const hasAccess = Boolean(cookies().get('platy_access')?.value)

  // 3 intentos gratis si no hay acceso vitalicio
  if (!hasAccess && trials >= 3) {
    return NextResponse.json({ error: 'TRIALS_LIMIT' }, { status: 402 })
  }

  const ciudad: string = body?.ciudad || 'Bogotá, CO'
  const personas: number = Number(body?.personas || 2)
  const modo: string = (body?.modo || 'Almuerzos')

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // Prompt (se removió el PlanSchema.describe() que causaba el error de tipos)
  const userPrompt = [
    `Genera un plan semanal (7 días) en ESPAÑOL para ${personas} persona(s) en ${ciudad}.`,
    `Modo: ${modo}. Respeta dietas/equipos/alergias si vienen en el payload.`,
    `Debes devolver **solo JSON** con el siguiente esquema (campos y tipos):`,
    `menu[7]{dia 1..7, plato, ingredientes[{name, qty, unit('g'|'ml'|'ud')}], pasos[], tip}`,
    `lista{Categoria: ItemQty[]}, batch{baseA, baseB}, sobrantes[], meta{ciudad, personas, modo, moneda:'COP'}`,
    `NO agregues texto fuera de JSON.`
  ].join('\n')

  async function askModel(): Promise<Plan | null> {
    const chat = await openai.chat.completions.create({
      model: process.env.OPENAI_API_MODEL || 'gpt-4o-mini',
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Eres un chef planificador que devuelve estrictamente JSON válido.' },
        { role: 'user', content: userPrompt }
      ]
    })
    const content = chat.choices?.[0]?.message?.content?.trim() || '{}'
    let ai: any
    try { ai = JSON.parse(content) } catch { return null }
    // Normaliza ingredientes (unidades) y valida
    if (ai?.menu) {
      for (const d of ai.menu) {
        if (Array.isArray(d.ingredientes)) {
          d.ingredientes = d.ingredientes.map((it: any) =>
            normalizeUnit(String(it.name ?? ''), Number(it.qty ?? 0), String(it.unit ?? 'g'))
          )
        }
      }
    }
    const parsed = PlanSchema.safeParse(ai)
    return parsed.success ? parsed.data : null
  }

  let plan: Plan | null = null
  for (let i=0; i<2 && !plan; i++) {
    try { plan = await askModel() } catch {}
  }
  if (!plan) {
    plan = fallbackPlan(ciudad, personas, modo)
  } else {
    // Recalcular lista consolidada y costos con tipado estricto
    const cats: Record<string, string[]> = {
      Verduras: ['tomate', 'cebolla', 'pimentón', 'zanahoria', 'brocoli', 'papa'],
      Proteína: ['pollo pechuga', 'huevo', 'queso'],
      Granos: ['arroz', 'pasta', 'tortilla', 'arepa'],
      Abarrotes: ['aceite', 'ajo']
    }

    // 1) Aseguramos que TODO lo que usamos es ItemQty bien formado
    const flat: ItemQty[] = plan.menu.flatMap((m) =>
      Array.isArray(m.ingredientes)
        ? m.ingredientes.map((it) =>
            normalizeUnit(String(it.name ?? ''), Number(it.qty ?? 0), String((it as any).unit ?? 'g'))
          )
        : []
    )

    // 2) Redondeamos y consolidamos con tipos fuertes
    const all: ItemQty[] = consolidate(
      flat.map((it) => ({ ...it, qty: roundFriendly(it.qty, it.unit) }))
    )

    // 3) Armamos lista por categoría
    const lista: Record<string, ItemQty[]> = {}
    for (const it of all) {
      const cat = Object.keys(cats).find((k) => cats[k].includes(it.name)) || 'Otros'
      if (!lista[cat]) lista[cat] = []
      lista[cat].push({ ...it, estCOP: estimateItemCOP(it, ciudad) })
    }

    const costos = buildCosts(lista, ciudad)
    plan.lista = lista
    plan.costos = { porCategoria: costos.porCategoria, total: costos.total, nota: 'Precios estimados según ciudad' }
    plan.meta = { ciudad, personas, modo, moneda: 'COP' }
  }

  const res = NextResponse.json(plan, {
    headers: { 'x-platy-has-access': String(hasAccess), 'x-platy-trials': String(trials) }
  })
  if (!hasAccess) {
    res.cookies.set('platy_trials', String(trials + 1), {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60*60*24*365
    })
  }
  return res
}

