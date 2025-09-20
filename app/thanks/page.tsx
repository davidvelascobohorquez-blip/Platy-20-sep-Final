// app/thanks/page.tsx  (SERVER)
import { Suspense } from 'react'
import ClientThanks from './ClientThanks'

// ⚙️ Config SOLO en server components:
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default function ThanksPage() {
  return (
    <Suspense fallback={<main className="min-h-screen grid place-items-center">Cargando…</main>}>
      <ClientThanks />
    </Suspense>
  )
}

