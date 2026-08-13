/** External OSM query — leaves the app. No embed, no tile engine. */

export function openStreetMapUrl(lat: number, lng: number): string {
  const mlat = lat.toFixed(5);
  const mlon = lng.toFixed(5);
  return `https://www.openstreetmap.org/?mlat=${mlat}&mlon=${mlon}#map=16/${mlat}/${mlon}`;
}
