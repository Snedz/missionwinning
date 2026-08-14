/**
 * Five-event field test — public strings. Not a CORE namespace.
 * Other langs spread English until pack overlays land.
 */

const FIELD_TEST_EN: Record<string, string> = {
  fieldTestName: 'Five-event field test',
  fieldTestShort: 'Field test',
  fieldTestStartLink: 'Five-event field test',
  fieldTestStartHint:
    'Optional: pick a published scale column on the receipt to see points.',
  fieldTestEventMdl: '3-rep max deadlift',
  fieldTestEventHrp: 'Hand-release push-up',
  fieldTestEventSdc: 'Sprint-drag-carry',
  fieldTestEventGarage: 'Shuttle + farmer carry',
  fieldTestEventPlk: 'Plank',
  fieldTestEventRun: '2-mile run',
  fieldTestGarageAction: 'No sled — shuttle + farmer carry',
  fieldTestSkipAction: 'Skip this event',
  fieldTestGarageHint: 'Unscored. Drops the 0–500 total.',
  fieldTestSkipHint: 'Unscored. Drops the 0–500 total.',
  fieldTestReceiptTitle: 'Field test',
  fieldTestScaleLabel: 'Published scale column',
  fieldTestScaleNone: 'Not set — raw only',
  fieldTestScaleColumnM: 'Column M',
  fieldTestScaleColumnF: 'Column F',
  fieldTestBandUnscored: 'Unscored',
  fieldTestBandUnscoredGarage: 'Unscored (garage)',
  fieldTestBandUnscoredSkipped: 'Unscored (skipped)',
  fieldTestBandBelow: 'Below 60',
  fieldTestBandMinimum: 'Minimum',
  fieldTestBandStrong: 'Strong',
  fieldTestBandMaximum: 'Maximum',
  fieldTestBandMap:
    'Bands are Mission Winning labels on the published 0–100 point rows (60 / 70–89 / 90–100).',
  fieldTestScoreCite: 'Points from the published ACFT scoring tables (23 March 2022).',
  fieldTestPoints: '{{points}} / 100',
  fieldTestTotal: '{{total}} / 500',
  fieldTestVsLast: 'vs last field test',
  fieldTestRunAgain: 'Run again',
  fieldTestRawReps: '{{value}} reps',
  fieldTestAgeBand: '{{band}}',
};

const BY_LANG: Record<string, Record<string, string>> = {
  en: FIELD_TEST_EN,
  es: { ...FIELD_TEST_EN },
  fr: { ...FIELD_TEST_EN },
  pt: { ...FIELD_TEST_EN },
  ru: { ...FIELD_TEST_EN },
  de: { ...FIELD_TEST_EN },
  it: { ...FIELD_TEST_EN },
  ko: { ...FIELD_TEST_EN },
  ja: { ...FIELD_TEST_EN },
  th: { ...FIELD_TEST_EN },
  vi: { ...FIELD_TEST_EN },
  hi: { ...FIELD_TEST_EN },
  zh: { ...FIELD_TEST_EN },
  id: { ...FIELD_TEST_EN },
  ar: { ...FIELD_TEST_EN },
};

export function fieldTestStringsFor(lang: string): Record<string, string> {
  return BY_LANG[lang] ?? FIELD_TEST_EN;
}

export function mergeFieldTestStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, fieldTestStringsFor(lang));
}
