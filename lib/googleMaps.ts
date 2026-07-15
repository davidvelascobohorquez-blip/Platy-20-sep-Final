const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export function hasGoogleMaps() {
  return Boolean(GOOGLE_MAPS_API_KEY);
}

export async function geocodeWithGoogle(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${GOOGLE_MAPS_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== "OK" || !data.results?.length) return null;

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

export async function getTravelMinutes(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<{ minutes: number; km: number } | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;

  const url =
    `https://maps.googleapis.com/maps/api/distancematrix/json` +
    `?origins=${origin.lat},${origin.lng}` +
    `&destinations=${destination.lat},${destination.lng}` +
    `&departure_time=now` +
    `&key=${GOOGLE_MAPS_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const element = data.rows?.[0]?.elements?.[0];
  if (data.status !== "OK" || !element || element.status !== "OK") return null;

  const seconds = (element.duration_in_traffic ?? element.duration).value;
  const meters = element.distance.value;

  return { minutes: seconds / 60, km: meters / 1000 };
}
