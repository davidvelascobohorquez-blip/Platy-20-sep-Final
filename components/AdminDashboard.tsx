"use client";

import { useEffect, useState } from "react";

type VendorStat = {
  id: string;
  name: string;
  active: boolean;
  locationUpdatedAt: string | null;
  completedCount: number;
  pendingQueue: number;
  minutesOnCurrent: number | null;
  estimatedFreeInMinutes: number;
  usesRealTravelTimes: boolean;
  closingRate: number | null;
};

type Overview = {
  vendors: VendorStat[];
  summary: {
    totalCompleted: number;
    totalSold: number;
    closingRate: number | null;
    totalRevenue: number;
  };
};

export default function AdminDashboard() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/overview");
      setData(await res.json());
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="p-4 text-neutral-500">Cargando...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Estimados completados" value={data.summary.totalCompleted} />
        <StatCard label="Vendidos" value={data.summary.totalSold} />
        <StatCard
          label="Tasa de cierre"
          value={data.summary.closingRate != null ? `${data.summary.closingRate}%` : "—"}
        />
        <StatCard label="Ventas totales" value={`$${data.summary.totalRevenue.toLocaleString()}`} />
      </section>

      <section className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left">
            <tr>
              <th className="px-3 py-2">Vendedor</th>
              <th className="px-3 py-2">Ubicación</th>
              <th className="px-3 py-2">Completados</th>
              <th className="px-3 py-2">En cola</th>
              <th className="px-3 py-2">Tiempo en estimado actual</th>
              <th className="px-3 py-2">Libre en (aprox.)</th>
              <th className="px-3 py-2">Tasa de cierre</th>
            </tr>
          </thead>
          <tbody>
            {data.vendors.map((v) => (
              <tr key={v.id} className="border-t border-neutral-100">
                <td className="px-3 py-2 font-medium">{v.name}</td>
                <td className="px-3 py-2">
                  {v.locationUpdatedAt ? (
                    <span className="text-green-700">Activa</span>
                  ) : (
                    <span className="text-neutral-400">Sin ubicación</span>
                  )}
                </td>
                <td className="px-3 py-2">{v.completedCount}</td>
                <td className="px-3 py-2">{v.pendingQueue}</td>
                <td className="px-3 py-2">
                  {v.minutesOnCurrent != null ? `${v.minutesOnCurrent} min` : "—"}
                </td>
                <td className="px-3 py-2">
                  {v.estimatedFreeInMinutes} min
                  {v.usesRealTravelTimes && (
                    <span className="ml-1 text-xs text-green-700" title="Incluye tiempo de viaje real (Google Maps)">
                      ✓
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">{v.closingRate != null ? `${v.closingRate}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="text-xs text-neutral-400">
        * "Libre en" = 20 min por visita + tiempo de viaje. El check verde (✓) indica que el tiempo de viaje
        es real (Google Maps con tráfico); sin el check, es una aproximación porque aún no hay tiempo de viaje
        calculado para esa cola.
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="text-2xl font-semibold text-brand-dark">{value}</p>
    </div>
  );
}
