// app/thanks/layout.tsx  (SERVER)
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gracias — PLATY',
  description: 'Confirmación de pago y activación de acceso.',
  openGraph: {
    title: 'Gracias — PLATY',
    description: 'Confirmación de pago y activación de acceso.',
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gracias — PLATY',
    images: ['/og.jpg'],
  },
}

export default function ThanksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
