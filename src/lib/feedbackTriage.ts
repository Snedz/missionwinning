/**
 * Classify a tester note so the founder can rate it.
 *
 * Notes already land in `leads`. Rules only — no Grok spend, no PII in tickets.
 */

export const FEEDBACK_CLASSES = [
  'wedge-bug',
  'wedge-confusion',
  'voice',
  'planner',
  'feature-ask',
  'off-horizon',
  'medical-legal',
  'abuse-spam',
] as const;

export type FeedbackClass = (typeof FEEDBACK_CLASSES)[number];

export const FEEDBACK_DESTS = ['craft', 'voice', 'park', 'done'] as const;

export type FeedbackDest = (typeof FEEDBACK_DESTS)[number];

export function isFeedbackClass(value: string): value is FeedbackClass {
  return (FEEDBACK_CLASSES as readonly string[]).includes(value);
}

export function isFeedbackDest(value: string): value is FeedbackDest {
  return (FEEDBACK_DESTS as readonly string[]).includes(value);
}

export const VOICE_SNIPPET_CHARS = 280;

const WEDGE_SCREENS = new Set([
  '/active',
  '/log',
  '/coach',
  '/victory',
  '/welcome',
  '/feedback',
  '/account',
  '/profile',
]);

const MEDICAL = [
  /chest pain/,
  /diagnos(?:is|ed|e)\b/,
  /\bpregnan/,
  /miscarriage/,
  /postpartum/,
  /depress(?:ion|ed)\b/,
  /suicid/,
  /clinician/,
  /herniated/,
  /\bfracture\b/,
  /torn acl/,
  /doctor said/,
  /medical advice/,
  /treat my /,
  /caused a loss/,
  /through (?:the )?pain/,
];

const OFF_HORIZON = [
  /\bios\b/,
  /iphone app/,
  /apple watch/,
  /wearable(?:s)? as score/,
  /strava as score/,
  /america track/,
  /\bpft class\b/,
  /school class/,
  /new language/,
  /another locale/,
  /everything app/,
  /add a pillar/,
  /yoga studio/,
];

const PLANNER = [
  /week ignored/,
  /ignored my miss/,
  /missed day/,
  /did(?: not|n't) adapt/,
  /\bdeload\b/,
  /\bprogression\b/,
  /plan did(?: not|n't)/,
  /unearned week/,
  /ignored my missed/,
];

const VOICE = [
  /coach (?:said|told|chat)/,
  /chat said/,
  /\bgrok\b/,
  /briefing/,
  /\btone\b/,
  /voice briefing/,
];

const BUG = [
  /\bbroke\b/,
  /\bjumped\b/,
  /\bcrash(?:ed|es)?\b/,
  /did(?: not|n't) save/,
  /\bblank\b/,
  /\b500\b/,
  /button did nothing/,
  /\btimer\b/,
  /would(?: not|n't) log/,
  /did nothing/,
];

const CONFUSION = [
  /confus/,
  /did(?: not|n't) understand/,
  /where(?:'s| is)\b/,
  /could(?: not|n't) find/,
  /\bunclear\b/,
];

const FEATURE = [
  /want next/,
  /wish it/,
  /please add/,
  /would be nice/,
  /should have/,
  /add an? /,
];

const EMPTYISH = [
  /^(?:test|ok|hi|hey|asdf|spam)?$/i,
  /^love it[.!]?$/i,
  /^great(?: app)?[.!]?$/i,
  /^awesome[.!]?$/i,
];

const UNALIGNED = [
  /gate the (?:free )?logger/,
  /paywall the logger/,
  /streak shame/,
  /guilt streak/,
  /treat depression/,
  /rank the week/,
];

const WEDGE_VERB = [
  /\blog\b/,
  /\bset\b/,
  /\brest\b/,
  /\btimer\b/,
  /\bweek\b/,
  /\btoday\b/,
  /\bcoach\b/,
  /\btrain\b/,
  /\bworkout\b/,
  /\bvictory\b/,
];

export type FeedbackTriage = {
  class: FeedbackClass;
  destEligible: FeedbackDest[];
  applicable: boolean;
  relevant: boolean;
  aligned: boolean;
  safeForVoice: boolean;
  reasons: string[];
};

function norm(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function anyMatch(hay: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((p) => p.test(hay));
}

export function redactFeedbackText(text: string): string {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/\+?\d[\d\s().-]{8,}\d/g, '[phone]');
}

export function hasResidualPii(text: string): boolean {
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) return true;
  if (/\+?\d[\d\s().-]{8,}\d/.test(text)) return true;
  return false;
}

export function classifyFeedbackNote(input: {
  text: string;
  screen?: string | null;
}): FeedbackTriage {
  const reasons: string[] = [];
  const body = input.text.trim();
  const hay = norm(body);
  const screen = (input.screen ?? '').split(',')[0]?.trim() || '';

  const applicable = body.length >= 12 && !EMPTYISH.some((p) => p.test(body.trim()));
  if (!applicable) reasons.push('not a concrete report');

  const relevant = WEDGE_SCREENS.has(screen) || anyMatch(hay, WEDGE_VERB);
  if (!relevant) reasons.push('no wedge screen or verb');

  const aligned = !anyMatch(hay, UNALIGNED);
  if (!aligned) reasons.push('asks to break a standing tradeoff');

  let cls: FeedbackClass;
  if (anyMatch(hay, MEDICAL)) {
    cls = 'medical-legal';
    reasons.push('medical or legal content');
  } else if (!applicable && body.length < 12) {
    cls = 'abuse-spam';
    reasons.push('empty or too short');
  } else if (anyMatch(hay, OFF_HORIZON)) {
    cls = 'off-horizon';
    reasons.push('outside Horizon W');
  } else if (anyMatch(hay, PLANNER)) {
    cls = 'planner';
    reasons.push('week / adapt, not chat');
  } else if (anyMatch(hay, VOICE)) {
    cls = 'voice';
    reasons.push('coach chat / briefing');
  } else if (anyMatch(hay, BUG)) {
    cls = 'wedge-bug';
    reasons.push('something broke');
  } else if (anyMatch(hay, CONFUSION)) {
    cls = 'wedge-confusion';
    reasons.push('something was unclear');
  } else if (anyMatch(hay, FEATURE) || hay.includes('want next:')) {
    cls = 'feature-ask';
    reasons.push('want-next');
  } else if (!applicable) {
    cls = 'abuse-spam';
  } else {
    cls = relevant ? 'wedge-confusion' : 'feature-ask';
    reasons.push(relevant ? 'wedge prose, no sharper class' : 'no wedge hook');
  }

  const redacted = redactFeedbackText(body);
  const clean = !hasResidualPii(redacted);
  const parkOnly =
    cls === 'medical-legal' || cls === 'abuse-spam' || cls === 'off-horizon' || !aligned;

  const destEligible: FeedbackDest[] = [];
  const craftOk =
    !parkOnly &&
    applicable &&
    (relevant || cls === 'planner' || cls === 'feature-ask') &&
    (cls === 'wedge-bug' ||
      cls === 'wedge-confusion' ||
      cls === 'voice' ||
      cls === 'planner' ||
      cls === 'feature-ask');
  if (craftOk) destEligible.push('craft');

  const voiceOk =
    !parkOnly &&
    applicable &&
    relevant &&
    aligned &&
    clean &&
    (cls === 'voice' || cls === 'wedge-confusion');
  if (voiceOk) destEligible.push('voice');
  else if ((cls === 'voice' || cls === 'wedge-confusion') && !clean) {
    reasons.push('PII still present after redact');
  }

  return {
    class: cls,
    destEligible,
    applicable,
    relevant,
    aligned,
    safeForVoice: voiceOk,
    reasons,
  };
}

export function canAssignDest(
  triage: FeedbackTriage,
  dest: FeedbackDest,
  opts?: { founderOverride?: boolean }
): boolean {
  if (dest === 'park' || dest === 'done') return true;
  if (dest === 'voice') return triage.safeForVoice && triage.destEligible.includes('voice');
  if (dest === 'craft') {
    if (triage.destEligible.includes('craft')) return true;
    if (
      opts?.founderOverride &&
      triage.aligned &&
      triage.class !== 'medical-legal' &&
      triage.class !== 'abuse-spam' &&
      triage.class !== 'off-horizon'
    ) {
      return true;
    }
  }
  return false;
}

export function frictionBody(goals: string): string {
  const idx = goals.lastIndexOf('\n---\n');
  if (idx === -1) return goals.trim();
  return goals.slice(0, idx).trim();
}

export function voiceSnippet(text: string): string | null {
  const redacted = redactFeedbackText(frictionBody(text));
  if (hasResidualPii(redacted)) return null;
  const clipped = redacted.slice(0, VOICE_SNIPPET_CHARS).trim();
  return clipped.length > 0 ? clipped : null;
}

export function formatFeedbackTicket(input: {
  class: FeedbackClass;
  dest: FeedbackDest;
  text: string;
  screen?: string | null;
  previousScreen?: string | null;
  buildLabel?: string | null;
  aligned: boolean;
}): string {
  const body = redactFeedbackText(frictionBody(input.text));
  const from = input.previousScreen ? `  (from: ${input.previousScreen})` : '';
  return [
    '## Feedback ticket',
    `- class: ${input.class}`,
    `- dest: ${input.dest}`,
    `- screen: ${input.screen ?? 'unknown'}${from}`,
    `- build: ${input.buildLabel ?? 'unknown'}`,
    `- aligned: ${input.aligned ? 'yes' : 'no'}`,
    '### Friction',
    body || '(empty)',
  ].join('\n');
}

export function ticketContainsEmail(ticket: string): boolean {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(ticket);
}

export function countFeedbackDests(
  notes: ReadonlyArray<{ review?: { dest: string } | null }>
): { craft: number; voice: number; park: number; done: number; unrated: number } {
  const counts = { craft: 0, voice: 0, park: 0, done: 0, unrated: 0 };
  for (const note of notes) {
    const dest = note.review?.dest;
    if (dest === 'craft' || dest === 'voice' || dest === 'park' || dest === 'done') {
      counts[dest] += 1;
    } else {
      counts.unrated += 1;
    }
  }
  return counts;
}

export function formatDestCounts(counts: ReturnType<typeof countFeedbackDests>): string {
  return `${counts.craft} craft · ${counts.voice} voice · ${counts.park} parked · ${counts.done} done · ${counts.unrated} unrated`;
}

export function autoCraftFlagOn(env: { FEEDBACK_AUTO_CRAFT?: string | undefined }): boolean {
  return env.FEEDBACK_AUTO_CRAFT === 'true';
}
