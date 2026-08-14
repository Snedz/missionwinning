/**
 * Uncontested example public parks — catalog, not territory.
 * See docs/places/PLAN.md §5.
 */

import type { PlacePin } from './types';

export const EXAMPLE_PUBLIC_PLACES: readonly PlacePin[] = [
  {
    id: 'example-central-park',
    name: 'Central Park (example)',
    lat: 40.7829,
    lng: -73.9654,
    kind: 'example-public',
  },
  {
    id: 'example-hyde-park',
    name: 'Hyde Park (example)',
    lat: 51.5073,
    lng: -0.1657,
    kind: 'example-public',
  },
  {
    id: 'example-yoyogi-park',
    name: 'Yoyogi Park (example)',
    lat: 35.6717,
    lng: 139.6949,
    kind: 'example-public',
  },
  {
    id: 'example-ibirapuera',
    name: 'Ibirapuera Park (example)',
    lat: -23.5874,
    lng: -46.6576,
    kind: 'example-public',
  },
];
