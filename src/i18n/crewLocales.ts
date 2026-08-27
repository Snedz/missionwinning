/** Crew board + founder gate — merged into i18n `common` namespace. */

const CREW_EN: Record<string, string> = {
  navCrew: 'Crew',
  moreCrewDesc: 'Charters and the founder gate',
  crewBrand: 'House',
  crewRoom: 'Crew',
  crewGateOnYou: 'GATE IS ON YOU',
  crewGateMark: 'GATE @founder',
  crewDay: 'DAY {{n}}',
  crewHeld: 'HELD {{n}}',
  crewCrew: 'CREW 6',
  crewCharters: 'CHARTERS {{n}}/6',
  crewVotesLocked: 'NO CHARTER — NO VOTE',
  crewVotesOpen: 'VOTES OPEN',
  crewVotesPartial: 'VOTES {{n}}/6 OPEN',
  crewOwns: 'Owns',
  crewStops: 'Stops',
  crewSigned: 'SIGNED',
  crewUnsigned: 'UNSIGNED',
  crewVoteLocked: 'VOTE LOCKED',
  crewVoteAye: 'Aye',
  crewVoteNay: 'Nay',
  crewAssign: 'Assign charter',
  crewSetOwns: 'Set owns',
  crewSetStops: 'Set stops',
  crewSignRole: 'Sign role',
  crewNeedOwns: 'Set owns first',
  crewNeedStops: 'Set stops first',
  crewNeedAssign: 'Assign the charter first',
  crewFlow: 'assign → owns → stops → sign → vote',
  crewAgents: 'Crew',
  crewCharterPills: 'Charters',
  crewNotes: 'Case notes',
  crewGate: 'Founder gate',
  crewIrreversible: 'send · delete · publish · promote',
  crewNeedSign: '{{n}} NEED YOUR SIGNATURE',
  crewNoUndo: 'NO UNDO — a signature does not reverse',
  crewSignHold: 'Sign',
  crewSignedHold: 'Signed',
  crewHoldPromote: 'Hold promote',
  crewReset: 'Reset board',
  crewSignedCheck: 'SIGNED ✓',
  crewGateLocked: 'GATE LOCKED',
  crewGateSigned: 'GATE SIGNED',
  crewYourSignature: 'YOUR SIGNATURE',
  crewSignFounder: 'Sign the gate',
  crewChartersFirst: 'CHARTERS FIRST — {{n}}/6',
  crewReversible: 'Reversible?',
  crewNo: 'No',
  crewSelectSeat: 'Seat',
  crewOwnsPh: 'one line this seat owns',
  crewStopsPh: 'hard stopline',
};

const BY_LANG: Record<string, Record<string, string>> = {
  en: CREW_EN,
  es: { ...CREW_EN, navCrew: 'Tripulación', crewAssign: 'Asignar carta', crewSignRole: 'Firmar rol' },
  pt: { ...CREW_EN, navCrew: 'Equipe', crewAssign: 'Atribuir carta', crewSignRole: 'Assinar função' },
  ru: { ...CREW_EN },
  de: { ...CREW_EN, navCrew: 'Crew', crewAssign: 'Charta zuweisen', crewSignRole: 'Rolle signieren' },
  it: { ...CREW_EN, navCrew: 'Equipaggio' },
  ko: { ...CREW_EN },
  ja: { ...CREW_EN },
  th: { ...CREW_EN },
  vi: { ...CREW_EN },
  hi: { ...CREW_EN },
  zh: { ...CREW_EN, navCrew: '机组' },
  id: { ...CREW_EN },
  ar: { ...CREW_EN },
};

export function crewStringsFor(lang: string): Record<string, string> {
  const code = lang.split('-')[0];
  return BY_LANG[code] ?? CREW_EN;
}

export function mergeCrewStrings(common: Record<string, string>, lang: string): void {
  Object.assign(common, crewStringsFor(lang));
}
