import { geocodeWithGoogle, getTravelMinutes, hasGoogleMaps } from "./googleMaps";

const AVERAGE_SPEED_KMH = 40;

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function geocodeWithNominatim(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    address
  )}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "chip-and-weight-app/0.1 (estimates geocoding)" }
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (hasGoogleMaps()) {
    const googleResult = await geocodeWithGoogle(address);
    if (googleResult) return googleResult;
  }
  return geocodeWithNominatim(address);
}

/**
 * Tiempo de viaje entre dos puntos. Usa Google Distance Matrix (con tráfico) si hay
 * API key configurada; si no, aproxima con distancia en línea recta a una velocidad
 * promedio fija (menos preciso, solo para no bloquear el flujo sin la key).
 */
export async function getTravelInfo(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ minutes: number; km: number; estimated: boolean }> {
  if (hasGoogleMaps()) {
    const result = await getTravelMinutes(origin, destination);
    if (result) return { ...result, estimated: false };
  }
  const km = haversineKm(origin.lat, origin.lng, destination.lat, destination.lng);
  return { km, minutes: (km / AVERAGE_SPEED_KMH) * 60, estimated: true };
}
