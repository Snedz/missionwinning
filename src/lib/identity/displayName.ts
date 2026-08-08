/**
 * What a display name may be before it reaches a board (`.611`).
 *
 * `/leaderboard` has published a 24-character free-text name to every signed-in
 * user since the full-launch override, with **no validation of any kind** —
 * `saveOperatorName` truncated to 24 characters and did nothing else. There is no
 * moderation infrastructure anywhere in `src/`; `CLUB_PLAN.md:188` says a
 * reserved-word list and a report flow *"must ship with the first public board"*,
 * and they did not.
 *
 * **What this is honestly for, and what it is not.**
 *
 * It is not a profanity filter. A word list that pretended to catch slurs across
 * the fifteen languages this app ships would be theatre — it would miss most of
 * them, flag innocent words in languages nobody here reads, and create a false
 * sense that names are screened. Saying "we filter names" while shipping an English
 * word list is the `.219` failure: a check that exists, is documented, and cannot
 * do the job it is named for.
 *
 * What it *can* do reliably is the tractable half — the two classes that are
 * mechanically detectable and are what actually hurt at small N:
 *
 * 1. **Impersonation.** A name claiming to be the app, its staff, or a system
 *    message. This is the one that does real damage on a board of strangers: "Mission
 *    Winning Support" next to a score is a phishing surface, not a rude word.
 * 2. **Injection and spoofing.** URLs, emails, control characters, zero-width
 *    joiners, right-to-left overrides, and homoglyph padding — the things that let a
 *    name break a layout, smuggle a link into a leaderboard, or impersonate another
 *    row.
 *
 * The actual defence against abusive *content* is structural and lives elsewhere:
 * a custom name does not publish until the athlete is board-eligible (14 days, 8
 * sessions across 6 days), so a drive-by never lands one; and a reported name is
 * hidden first and reviewed second. Prevention beats a queue nobody staffs.
 *
 * Matching normalises first, because `M1SS10N` and `Мission` (Cyrillic М) defeat a
 * naive `includes()` and are exactly what someone impersonating support would type.
 */

/**
 * Two lists, matched two different ways — because one way is wrong.
 *
 * The first draft matched every term as a substring, and this module's own
 * over-blocking test caught it immediately: `Rooted Oak` contains `root`,
 * `Officially Tired` contains `official`. Telling a real person their name is
 * reserved is its own failure, and a filter that does it will be turned off.
 *
 * So generic authority words match on **word boundaries**, and only the brand terms
 * — long and distinctive enough not to collide with real words — match on the
 * fully collapsed form, because `MissionWinningSupport` has no spaces to bound.
 */
const RESERVED_WORDS = [
  'admin',
  'administrator',
  'moderator',
  'mod team',
  'official',
  'support',
  'staff',
  'system',
  'root',
  'operator team',
  'help desk',
  'helpdesk',
  'customer service',
  'security',
  'verified',
];

const RESERVED_BRAND = ['missionwinning', 'missionwin', 'mwteam', 'mwstaff'];

/** Latin lookalikes for Cyrillic/Greek homoglyphs commonly used to dodge filters. */
const HOMOGLYPHS: Record<string, string> = {
  а: 'a', е: 'e', о: 'o', р: 'p', с: 'c', у: 'y', х: 'x', і: 'i', ѕ: 's', ⅿ: 'm',
  α: 'a', ε: 'e', ο: 'o', ρ: 'p', ѵ: 'v', м: 'm', н: 'h', т: 't', в: 'b', к: 'k',
};

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's' };

/**
 * Fold a name to the form reserved words are matched against: lowercase, homoglyphs
 * and leetspeak resolved, diacritics stripped, everything that is not a letter
 * collapsed to a single space.
 *
 * Exported because the server-side check must fold identically — two normalisers
 * that disagree is a filter with a documented bypass.
 */
export function foldForMatch(input: string): string {
  const lowered = input.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
  let out = '';
  for (const ch of lowered) out += HOMOGLYPHS[ch] ?? LEET[ch] ?? ch;
  return out.replace(/[^a-z]+/g, ' ').trim();
}

export type DisplayNameRejection =
  | 'empty'
  | 'too-long'
  | 'reserved'
  | 'link'
  | 'unsafe-characters';

export interface DisplayNameCheck {
  ok: boolean;
  reason?: DisplayNameRejection;
}

export const DISPLAY_NAME_MAX = 24;

/**
 * Characters that must never reach a shared surface: C0/C1 controls, zero-width
 * joiners and non-joiners, bidi overrides, and the object-replacement character.
 * A right-to-left override in a leaderboard row reverses everything after it.
 */
// Built from escaped strings rather than a regex literal: `no-control-regex` fires
// on literals, and matching control characters is the entire point here.
const UNSAFE = new RegExp(
  '[\\u0000-\\u001f\\u007f-\\u009f' + // C0 / C1 controls
    '\\u200b-\\u200f' +                  // zero-width space … RTL mark
    '\\u202a-\\u202e' +                  // bidi embedding / override
    '\\u2066-\\u2069' +                  // bidi isolates
    '\\ufeff\\ufffc]'                    // BOM, object replacement
);

export function checkDisplayName(raw: string): DisplayNameCheck {
  const name = raw.trim();
  if (name.length === 0) return { ok: false, reason: 'empty' };
  if (name.length > DISPLAY_NAME_MAX) return { ok: false, reason: 'too-long' };
  if (UNSAFE.test(name)) return { ok: false, reason: 'unsafe-characters' };
  // A name is not a place to put a URL or an address.
  if (/https?:\/\/|www\.|@[a-z0-9-]+\.[a-z]{2,}|\.[a-z]{2,}\//i.test(name)) {
    return { ok: false, reason: 'link' };
  }

  const folded = foldForMatch(name);
  // `s u p p o r t` folds to single-letter tokens, so runs of them are re-joined
  // before word matching — spacing out a word is the cheapest possible evasion.
  const rejoined = folded.replace(/\b(?:[a-z] )+[a-z]\b/g, (m) => m.replace(/ /g, ''));
  const collapsed = folded.replace(/\s+/g, '');

  for (const brand of RESERVED_BRAND) {
    if (collapsed.includes(brand)) return { ok: false, reason: 'reserved' };
  }
  for (const word of RESERVED_WORDS) {
    // Word-boundary, not substring — see the note on the lists above.
    const pattern = new RegExp(`(?:^| )${word.replace(/ /g, ' ')}(?: |$)`);
    if (pattern.test(folded) || pattern.test(rejoined)) {
      return { ok: false, reason: 'reserved' };
    }
  }
  return { ok: true };
}

/** The name a rejected or absent choice falls back to. Never empty, never a lie. */
export const GENERATED_NAME_FALLBACK = 'Mission Operator';
