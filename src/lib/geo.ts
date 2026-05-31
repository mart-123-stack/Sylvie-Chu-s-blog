interface GeoResult {
  country: string;
  city: string;
  lat: number;
  lon: number;
  countryCode: string;
}

const cache = new Map<string, GeoResult>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h
const cacheTime = new Map<string, number>();

export async function lookupIP(ip: string): Promise<GeoResult | null> {
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return null;

  const cached = cache.get(ip);
  if (cached && Date.now() - (cacheTime.get(ip) || 0) < CACHE_TTL) {
    return cached;
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,lat,lon,countryCode`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    if (data.status === 'success') {
      const result: GeoResult = {
        country: data.country,
        city: data.city,
        lat: data.lat,
        lon: data.lon,
        countryCode: data.countryCode,
      };
      cache.set(ip, result);
      cacheTime.set(ip, Date.now());
      return result;
    }
  } catch {
    // Fail silently — geo is a nice-to-have
  }
  return null;
}
