"use client";

import { useEffect, useRef, useState } from "react";

let scriptLoadingPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window !== "undefined" && window.google?.maps?.places) {
    return Promise.resolve();
  }
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Google Maps"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

/**
 * El input NO es un componente controlado por React (no recibe `value`): el widget de
 * Google Places manipula el DOM del input directamente, y si React también fuerza su
 * valor en cada tecla (patrón controlado), ambos compiten y solo queda el último
 * carácter escrito. Por eso aquí se usa `defaultValue` + lectura por ref, y el padre
 * limpia el campo cambiando `resetKey` para forzar un remount en vez de resetear `value`.
 */
export default function AddressAutocomplete({
  defaultValue = "",
  resetKey,
  onChange,
  onSelect
}: {
  defaultValue?: string;
  resetKey?: string | number;
  onChange: (value: string) => void;
  onSelect: (place: { address: string; lat: number; lng: number }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Autocompletado no disponible (falta configurar la llave de Google Maps).");
      return;
    }

    let cancelled = false;
    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (cancelled || !inputRef.current) return;
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "geometry"],
          componentRestrictions: { country: "us" },
          types: ["address"]
        });
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          if (!place?.geometry?.location || !place.formatted_address) return;
          const address = place.formatted_address;
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          if (inputRef.current) inputRef.current.value = address;
          onChange(address);
          onSelect({ address, lat, lng });
        });
        setReady(true);
      })
      .catch(() => setError("No se pudo cargar el autocompletado de direcciones."));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return (
    <div>
      <input
        key={resetKey}
        ref={inputRef}
        required
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={ready ? "Empieza a escribir la dirección..." : "Dirección"}
        className="w-full rounded-md border border-neutral-300 px-3 py-2"
        autoComplete="off"
      />
      {error && <p className="mt-1 text-xs text-amber-600">{error}</p>}
    </div>
  );
}
