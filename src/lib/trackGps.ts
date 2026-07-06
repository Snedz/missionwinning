export type GpsPoint = { lat: number; lng: number; at: number };

/** Great-circle distance in km between two GPS points. */
export function haversineKm(a: GpsPoint, b: GpsPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

/** Sum haversine segments for a GPS track. */
export function totalTrackDistanceKm(points: GpsPoint[]): number {
  let distanceKm = 0;
  for (let i = 1; i < points.length; i++) {
    distanceKm += haversineKm(points[i - 1], points[i]);
  }
  return Math.round(distanceKm * 100) / 100;
}

/** Minutes per km — null when distance or time is zero. */
export function paceMinPerKm(distanceKm: number, durationMin: number): number | null {
  if (distanceKm <= 0 || durationMin <= 0) return null;
  return durationMin / distanceKm;
}

export function formatPaceMinPerKm(pace: number): string {
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}/km`;
}

/** Rolling pace from the last few GPS points (live display). */
export function livePaceFromPoints(points: GpsPoint[], windowSize = 5): number | null {
  if (points.length < 2) return null;
  const window = points.slice(-Math.min(windowSize, points.length));
  const dist = totalTrackDistanceKm(window);
  const durationMin = (window[window.length - 1].at - window[0].at) / 60_000;
  return paceMinPerKm(dist, durationMin);
}

/** Per-segment pace series for charts (filters outliers above 30 min/km). */
export function segmentPaceSeries(points: GpsPoint[]): { index: number; pace: number }[] {
  const out: { index: number; pace: number }[] = [];
  for (let i = 1; i < points.length; i++) {
    const dist = haversineKm(points[i - 1], points[i]);
    const durationMin = (points[i].at - points[i - 1].at) / 60_000;
    const pace = paceMinPerKm(dist, durationMin);
    if (pace != null && pace < 30) {
      out.push({ index: i, pace: Math.round(pace * 10) / 10 });
    }
  }
  return out;
}
