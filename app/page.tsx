// app/page.tsx
import Link from 'next/link'
import Brand from '@/components/Brand'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              ¿Pierdes tiempo pensando <span className="whitespace-nowrap">qué cocinar</span>?
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-prose">
              Platy te arma <span className="font-semibold">tu menú semanal perfecto</span> con IA: recetas
              adaptadas a tus gustos, lista de compras inteligente y costos estimados por ciudad. Tú solo cocinas y
              disfrutas.
            </p>
            <ul className="mt-4 space-y-2 text-slate-700">
              <li className="flex items-start gap-2"><CheckIcon/><span>Ahorra <b>10+ horas</b> a la semana en planificación.</span></li>
              <li className="flex items-start gap-2"><CheckIcon/><span>Optimiza tu <b>presupuesto</b> con precios estimados por ciudad.</span></li>
              <li className="flex items-start gap-2"><CheckIcon/><span>Menús para familias, solteros ocupados y quien quiere <b>orden</b>.</span></li>
            </ul>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href="https://chatgpt.com/g/g-68c9a24d35d88191b6d6750c86a6241f-platy"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-white font-semibold shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Probar gratis <span className="ml-2 text-xs opacity-80">(demo en ChatGPT)</span>
              </a>
              <a
                href="#oferta"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold shadow hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Comprar acceso de por vida
              </a>
              <a
                href="https://wa.me/573001234567?text=Hola%20Platy%20%F0%9F%8D%B3%20quiero%20saber%20m%C3%A1s"
                target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 font-semibold text-emerald-800 shadow hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                Hablar por WhatsApp
              </a>
            </div>
            <p className="mt-3 text-xs text-slate-500">Pago único • Sin mensualidades • Garantía 7 días</p>
          </div>

          {/* Mock visual */}
          <div className="relative order-first md:order-last">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"/>
                <span>⏳ Generando tu menú… <b>aguanta que viene calentico</b> 🍲</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                {[
                  "Lunes: Arroz con pollo",
                  "Martes: Pasta al pesto",
                  "Miércoles: Ajiaco",
                  "Jueves: Ensalada + atún",
                  "Viernes: Arepas rellenas",
                  "Sábado: Bandeja budget",
                ].map((t) => (
                  <div key={t} className="rounded-xl border border-slate-200 p-3 hover:shadow-sm">
                    <p className="font-medium">{t.split(": ")[0]}</p>
                    <p className="text-slate-600">{t.split(": ")[1]}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <b>Lista de compras:</b> pollo (1.2 kg), arroz (1 kg), papa criolla (600 g), pasta (500 g), queso (300 g)…
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARA QUIÉN */}
      <section id="para-quien" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold">¿Para quién es Platy?</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card title="Mamá 6pm mode" desc="Cero ganas de pensar. Platy decide por ti y te deja la lista lista." icon={<HeartIcon/>} />
          <Card title="Soltero ocupado" desc="Menú rico en 5 min de planificación. Practicidad sin drama." icon={<BoltIcon/>} />
          <Card title="Ahorradores" desc="Compra exacta, cero desperdicio y precios estimados por ciudad." icon={<WalletIcon/>} />
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold">¿Cómo funciona?</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Step title="Elige tu modo" text="Semanal, plato del día o presupuesto." />
          <Step title="Responde 5 preguntas" text="Personas, tiempo, equipo, preferencias y ciudad." />
          <Step title="Descarga tu PDF" text="Menú, lista de compras, batch cooking y costos." />
        </div>
        <p className="mt-4 text-sm text-slate-600">Tip: si tarda unos segundos, verás el mensaje de carga «⏳ Generando tu menú… aguanta que viene calentico 🍲».</p>
      </section>

      {/* OFERTA */}
      <section id="oferta" className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Acceso de por vida</h2>
              <p className="mt-3 text-slate-600">Paga una sola vez y usa Platy para siempre. Incluye 2 eBooks de regalo y nuestro GPT personalizado.</p>
              <ul className="mt-4 space-y-2 text-slate-700">
                <li className="flex items-start gap-2"><CheckIcon/><span>Menús <b>ilimitados</b> y lista de compras inteligente.</span></li>
                <li className="flex items-start gap-2"><CheckIcon/><span>Costos estimados por ciudad y <b>batch cooking</b>.</span></li>
                <li className="flex items-start gap-2"><CheckIcon/><span>Pago único • <b>Garantía 7 días</b> • Sin mensualidades.</span></li>
              </ul>
            </div>
            <div className="md:pl-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-600">Precio promocional</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-3xl font-extrabold">{PRICE_USD}</span>
                  <span className="text-slate-500">/ {PRICE_COP}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600 line-through">Antes: $149.900 COP</p>
                <a href="/demo" className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-white font-semibold shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  ¡Quiero mi acceso vitalicio!
                </a>
                <a href="https://chatgpt.com/g/g-68c9a24d35d88191b6d6750c86a6241f-platy" className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold shadow hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300">
                  Probar gratis (demo en ChatGPT)
                </a>
                <p className="mt-3 text-xs text-slate-500">Nequi · PSE · Tarjeta • Pago seguro</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRUEBA SOCIAL */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold">Lo que dice la gente</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              name: "Ana María – Bogotá",
              text:
                "Ahorro $80.000 al mes y planifico en minutos. Mi familia come variado sin estrés.",
            },
            {
              name: "Carlos – Medellín",
              text:
                "Un pago y listo. En 5 minutos tengo menú y lista de mercado optimizada.",
            },
            {
              name: "Juliana – Cali",
              text:
                "Más sano y menos desperdicio. ¡La función de costos por ciudad es oro!",
            },
          ].map((t) => (
            <Testimonial key={t.name} name={t.name} text={t.text} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold">Preguntas frecuentes</h2>
        <div className="mt-6 grid gap-3">
          <Faq q="¿Es pago único o suscripción?" a="Pago único. Acceso de por vida. Sin mensualidades ni sorpresas." />
          <Faq q="¿Cuántas veces puedo generar menús?" a="Ilimitadas. Úsalo cada semana o cada día si quieres." />
          <Faq q="¿Funciona con ingredientes locales?" a="Sí. Adaptamos recetas y precios estimados a tu ciudad." />
          <Faq q="¿Qué pasa si no me gusta?" a="Tienes garantía de 7 días. Si no te convence, te devolvemos el dinero." />
        </div>
        <div className="mt-8 text-center">
          <a href="#oferta" className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-white font-semibold shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400">
            Comprar acceso de por vida
          </a>
        </div>
      </section>

      <FloatingCTA />

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
          <div className="md:flex md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Platy · Todos los derechos reservados</p>
            <div className="mt-3 md:mt-0 flex items-center gap-4">
              <a href="#" className="hover:underline">Términos</a>
              <a href="#" className="hover:underline">Privacidad</a>
              <a href="https://wa.me/573001234567?text=Hola%20Platy%20%F0%9F%8D%B3%20quiero%20saber%20m%C3%A1s" target="_blank" rel="noreferrer" className="hover:underline">Soporte</a>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">* Precios estimados según ciudad. Los valores pueden variar por temporada y supermercado.</p>
        </div>
      </footer>
    </main>
  );
}
