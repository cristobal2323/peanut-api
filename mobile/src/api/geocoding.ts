export type GeocodingResult = {
  id: string;
  primary: string;
  secondary: string;
  latitude: number;
  longitude: number;
};

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

type NominatimItem = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
};

export async function searchAddresses(
  query: string,
  signal?: AbortSignal,
  language: string = "es"
): Promise<GeocodingResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = `${NOMINATIM_BASE}?q=${encodeURIComponent(q)}&format=json&limit=8&addressdetails=0`;
  const res = await fetch(url, {
    signal,
    headers: {
      "User-Agent": "TrufaID/1.0 (mobile)",
      "Accept-Language": `${language},en`,
    },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimItem[];
  return data
    .map((it) => {
      const lat = parseFloat(it.lat);
      const lon = parseFloat(it.lon);
      if (!isFinite(lat) || !isFinite(lon)) return null;
      const parts = it.display_name.split(",").map((s) => s.trim());
      const primary = it.name ?? parts[0] ?? it.display_name;
      const secondary = parts.slice(1).join(", ");
      return {
        id: String(it.place_id),
        primary,
        secondary,
        latitude: lat,
        longitude: lon,
      } as GeocodingResult;
    })
    .filter((x): x is GeocodingResult => x !== null);
}
