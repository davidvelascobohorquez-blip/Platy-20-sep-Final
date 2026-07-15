"use client";

import { useEffect, useState } from "react";
import { EstimateDTO, STATUS_LABEL } from "@/lib/types";

export default function VendedorDashboard() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [estimates, setEstimates] = useState<EstimateDTO[]>([]);
  const [locationOn, setLocationOn] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  async function load(vId: string) {
    const res = await fetch(`/api/estimates?vendorId=${vId}`);
    const data = await res.json();
    setEstimates(data.estimates || []);
  }

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/vendors/me");
      const data = await res.json();
      if (data.vendor) {
        setVendorId(data.vendor.id);
        load(data.vendor.id);
      }
    })();
  }, []);

  function toggleLocation() {
    if (locationOn) {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setLocationOn(false);
      return;
    }
    if (!("geolocation" in navigator)) {
      setLocationError("Este dispositivo no soporta geolocalización.");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        setLocationError(null);
        await fetch("/api/vendors/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        });
      },
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, maximumAge: 30000 }
    );
    setWatchId(id);
    setLocationOn(true);
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/estimates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (vendorId) load(vendorId);
  }

  async function submitCompletion(id: string, form: HTMLFormElement) {
    const data = new FormData(form);
    const sold = data.get("sold") === "on";
    const scopeOfWork = String(data.get("scopeOfWork") || "");
    const quoteAmount = data.get("quoteAmount") ? Number(data.get("quoteAmount")) : undefined;
    const notes = String(data.get("notes") || "");

    await fetch(`/api/estimates/${id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sold, scopeOfWork, quoteAmount, notes })
    });
    setCompletingId(null);
    if (vendorId) load(vendorId);
  }

  const active = estimates.filter((e) => e.status === "ASSIGNED" || e.status === "IN_PROGRESS");
  const done = estimates.filter((e) => e.status === "COMPLETED");

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <section className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4">
        <div>
          <p className="font-medium">Ubicación en vivo</p>
          <p className="text-sm text-neutral-500">
            {locationOn ? "Compartiendo ubicación con la oficina" : "Ubicación desactivada"}
          </p>
          {locationError && <p className="text-sm text-red-600">{locationError}</p>}
        </div>
        <button
          onClick={toggleLocation}
          className={`rounded-md px-4 py-2 font-medium text-white ${
            locationOn ? "bg-red-600 hover:bg-red-700" : "bg-brand hover:bg-brand-dark"
          }`}
        >
          {locationOn ? "Desactivar" : "Activar ubicación"}
        </button>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-brand-dark">Mis estimados ({active.length})</h2>
        <div className="space-y-3">
          {active.map((e) => (
            <div key={e.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{e.clientName}</p>
                  <p className="text-sm text-neutral-600">{e.address}</p>
                  <p className="text-sm text-neutral-600">Franja: {e.timeWindow}</p>
                  <p className="text-sm text-neutral-500">{STATUS_LABEL[e.status]}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {e.status === "ASSIGNED" && (
                    <button
                      onClick={() => updateStatus(e.id, "IN_PROGRESS")}
                      className="rounded-md bg-brand px-3 py-1 text-sm text-white hover:bg-brand-dark"
                    >
                      Iniciar visita
                    </button>
                  )}
                  {e.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => setCompletingId(completingId === e.id ? null : e.id)}
                      className="rounded-md bg-brand px-3 py-1 text-sm text-white hover:bg-brand-dark"
                    >
                      Completar
                    </button>
                  )}
                </div>
              </div>

              {completingId === e.id && (
                <form
                  onSubmit={(ev) => {
                    ev.preventDefault();
                    submitCompletion(e.id, ev.currentTarget);
                  }}
                  className="mt-4 space-y-3 border-t border-neutral-100 pt-4"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="sold" /> Se vendió el trabajo
                  </label>
                  <div>
                    <label className="block text-sm font-medium mb-1">Qué se va a hacer</label>
                    <textarea name="scopeOfWork" className="w-full rounded-md border border-neutral-300 px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Monto cobrado (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="quoteAmount"
                      className="w-full rounded-md border border-neutral-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Notas / observaciones</label>
                    <textarea name="notes" className="w-full rounded-md border border-neutral-300 px-3 py-2" />
                  </div>
                  <button
                    type="submit"
                    className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark"
                  >
                    Guardar
                  </button>
                </form>
              )}
            </div>
          ))}
          {active.length === 0 && <p className="text-sm text-neutral-500">No tienes estimados activos.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-brand-dark">Completados ({done.length})</h2>
        <div className="space-y-2">
          {done.map((e) => (
            <div key={e.id} className="rounded-lg border border-neutral-200 bg-white p-3 text-sm">
              <p className="font-medium">{e.clientName}</p>
              <p className="text-neutral-500">
                {e.result?.sold ? "Vendido" : "No vendido"}
                {e.result?.quoteAmount ? ` · $${e.result.quoteAmount}` : ""}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
