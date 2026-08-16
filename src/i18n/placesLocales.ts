/** Explore places UI — merged into i18n `common` namespace. */

const EN: Record<string, string> = {
  navExplore: 'Explore',
  moreExploreDesc: 'Places you have tagged',
  exploreEyebrow: 'Places',
  exploreTitle: 'Explore',
  exploreSubtitle:
    'Pins you have tagged, plus a few example public parks. Optional nearby — logging never needs GPS.',
  exploreNotContested: 'Example parks are a catalog, not a contest. Nothing here is owned.',
  exploreNearby: 'Show nearby',
  exploreNearbyDenied: 'Location skipped — roam the list instead.',
  exploreGpsOptional: 'GPS is optional. Deny it and the board still works.',
  exploreRoam: 'Sorted by distance. Pan the list to roam.',
  explorePersonal: 'Yours',
  exploreExamplePublic: 'Example public',
  exploreDistanceKm: '{{km}} km',
  exploreOpenMaps: 'Open in maps',
  exploreAddPlace: 'Add a place',
  explorePlaceName: 'Name',
  exploreSavePlace: 'Save to place-dex',
  exploreUseLocation: 'Save with my location',
  exploreTagLastSession: 'Tag last session here',
  exploreTagHint: 'Place is optional and added after the set.',
  exploreTagged: 'Last session tagged on this place.',
  exploreNoSessions: 'Log a set first — then you can tag it here.',
  exploreBoardAria: 'Place pins on a paper map',
  accountExploreTitle: 'Explore places',
  accountExploreLead: 'A quiet map of pins you have tagged. GPS is optional.',
  accountExploreCta: 'Open Explore',
};

const ES: Record<string, string> = {
  ...EN,
  navExplore: 'Explorar',
  exploreTitle: 'Explorar',
  exploreNearby: 'Ver cerca',
  exploreOpenMaps: 'Abrir en mapas',
  exploreAddPlace: 'Añadir un lugar',
  accountExploreCta: 'Abrir Explorar',
};

function pack(partial: Record<string, string>): Record<string, string> {
  return { ...EN, ...partial };
}

const LOCALES: Partial<Record<string, Record<string, string>>> = {
  en: EN,
  es: ES,
  zh: pack({ navExplore: '探索', exploreTitle: '探索' }),
  id: pack({ navExplore: 'Jelajah', exploreTitle: 'Jelajah' }),
  th: pack({ navExplore: 'สำรวจ', exploreTitle: 'สำรวจ' }),
  ar: pack({ navExplore: 'استكشف', exploreTitle: 'استكشف' }),
  de: pack({ navExplore: 'Entdecken', exploreTitle: 'Entdecken' }),
  it: pack({ navExplore: 'Esplora', exploreTitle: 'Esplora' }),
  pt: pack({ navExplore: 'Explorar', exploreTitle: 'Explorar' }),
  ja: pack({ navExplore: '探索', exploreTitle: '探索' }),
  ko: pack({ navExplore: '탐색', exploreTitle: '탐색' }),
  ru: pack({ navExplore: 'Обзор', exploreTitle: 'Обзор' }),
  vi: pack({ navExplore: 'Khám phá', exploreTitle: 'Khám phá' }),
  hi: pack({ navExplore: 'खोजें', exploreTitle: 'खोजें' }),
};

export function placesStringsFor(lang: string): Record<string, string> {
  return LOCALES[lang.split('-')[0]] ?? EN;
}

export function mergePlacesStrings(target: Record<string, string>, lang: string): void {
  Object.assign(target, placesStringsFor(lang));
}
