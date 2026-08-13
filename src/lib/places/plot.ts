/** Project WGS84 onto a paper rectangle. No tiles. */

export type PlotPct = { xPct: number; yPct: number };

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function plotLngLat(lat: number, lng: number): PlotPct {
  return {
    xPct: clamp(((lng + 180) / 360) * 100, 2, 98),
    yPct: clamp(((90 - lat) / 180) * 100, 2, 98),
  };
}
