import { getSession } from "@/lib/auth";
import TopBar from "@/components/TopBar";

export default async function CuadrillaPage() {
  const session = await getSession();
  return (
    <main className="min-h-screen bg-neutral-50">
      <TopBar title="Trabajos programados" name={session?.name || ""} />
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-6 text-center text-neutral-500">
          <p className="font-medium text-neutral-700">Próximamente</p>
          <p className="mt-1 text-sm">
            Aquí verás los trabajos programados para el día siguiente, qué hacer en cada uno y cómo cobrar
            (cash, cheque o tarjeta con 5% adicional). Este módulo se construye en la Fase 3.
          </p>
        </div>
      </div>
    </main>
  );
}
