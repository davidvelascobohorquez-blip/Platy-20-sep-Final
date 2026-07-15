"use client";

import { useEffect, useState } from "react";
import { EstimateDTO, STATUS_LABEL } from "@/lib/types";

type NearbyVendor = {
  id: string;
  name: string;
  queue: number;
  travelMinutes: number | null;
  distanceKm: number | null;
  estimated: boolean;
};

export default function SecretariaDashboard() {
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [timeWindow, setTimeWindow] = useState("Todo el día");
  const [customWindow, setCustomWindow] = useState("");
  const [estimates, setEstimates] = useState<EstimateDTO[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const eRes = await fetch("/api/estimates");
    const eData = await eRes.json();
    setEstimates(eData.estimates || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const finalWindow = timeWindow === "Todo el día" ? timeWindow : customWindow;
    const res = await fetch("/api/estimates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName, address, timeWindow: finalWindow })
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al crear el estimado");
      return;
    }
    setClientName("");
    setAddress("");
    setTimeWindow("Todo el día");
    setCustomWindow("");
    load();
  }

  async function assign(estimateId: string, vendorId: string) {
    await fetch(`/api/estimates/${estimateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId })
    });
    load();
  }

  const pending = estimates.filter((e) => e.status === "PENDING");
  const others = estimates.filter((e) => e.status !== "PENDING");

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4">
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 font-semibold text-brand-dark">Nuevo estimado</h2>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del cliente</label>
            <input
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Franja horaria</label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            >
              <option>Todo el día</option>
              <option value="custom">Rango específico</option>
            </select>
          </div>
          {timeWindow === "custom" && (
            <div>
              <label className="block text-sm font-medium mb-1">Rango (ej. 4pm-5pm)</label>
              <input
                required
                value={customWindow}
                onChange={(e) => setCustomWindow(e.target.value)}
                className="w-full rounded-md border border-neutral-300 px-3 py-2"
              />
            </div>
          )}
          <div className="sm:col-span-2">
            {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-brand px-4 py-2 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {submitting ? "Creando..." : "Crear estimado"}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-brand-dark">Pendientes de asignar ({pending.length})</h2>
        <div className="space-y-3">
          {pending.map((estimate) => (
            <div key={estimate.id} className="rounded-lg border border-amber-300 bg-amber-50 p-4">
              <p className="font-medium">{estimate.clientName}</p>
              <p className="text-sm text-neutral-600">{estimate.address}</p>
              <p className="text-sm text-neutral-600">Franja: {estimate.timeWindow}</p>
              <AssignVendorPicker estimate={estimate} onAssign={(vendorId) => assign(estimate.id, vendorId)} />
            </div>
          ))}
          {pending.length === 0 && <p className="text-sm text-neutral-500">No hay estimados pendientes.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-brand-dark">Historial</h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 text-left">
              <tr>
                <th className="px-3 py-2">Cliente</th>
                <th className="px-3 py-2">Dirección</th>
                <th className="px-3 py-2">Vendedor</th>
                <th className="px-3 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {others.map((e) => (
                <tr key={e.id} className="border-t border-neutral-100">
                  <td className="px-3 py-2">{e.clientName}</td>
                  <td className="px-3 py-2">{e.address}</td>
                  <td className="px-3 py-2">{e.vendor?.user.name || "—"}</td>
                  <td className="px-3 py-2">{STATUS_LABEL[e.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AssignVendorPicker({
  estimate,
  onAssign
}: {
  estimate: EstimateDTO;
  onAssign: (vendorId: string) => void;
}) {
  const [nearby, setNearby] = useState<NearbyVendor[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/estimates/${estimate.id}/nearby-vendors`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setNearby(data.vendors || []);
      });
    return () => {
      cancelled = true;
    };
  }, [estimate.id]);

  return (
    <div className="mt-2">
      <label className="block text-sm font-medium mb-1">Asignar a vendedor (más cercano primero)</label>
      {nearby == null ? (
        <p className="text-sm text-neutral-500">Calculando tiempos de viaje...</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {nearby.map((v) => (
            <button
              key={v.id}
              onClick={() => onAssign(v.id)}
              className="rounded-md border border-brand bg-white px-3 py-1 text-sm hover:bg-brand-light"
            >
              {v.name}
              {v.travelMinutes != null ? ` · ${Math.round(v.travelMinutes)} min${v.estimated ? " (aprox.)" : ""}` : ""}
              {` · cola: ${v.queue}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
