#!/usr/bin/env node
/**
 * Print a paste-ready Grok Imagine prompt + export filename.
 * Usage: node scripts/print-grok-prompt.mjs <promptId>
 * Example: node scripts/print-grok-prompt.mjs grok-social-invite
 */
const BRAND = `Mission Winning brand imagery. Modernist poster: paper ground #f3f2f2, ink #201e1d,
and exactly one accent — vermillion red #ec3013, used sparingly. Flat printed
surfaces, hard geometric edges, square corners, generous negative space. No
gradients, no glow, no drop shadows, no dark backgrounds, no second accent hue.
Clinical athletic clarity — not gym-bro hype, not medical.
No logos invented; no competitor blue/violet identity; no cream/terracotta editorial look.
Atmosphere: mission briefing, train-anywhere athlete, calm competence.
Decorative or marketing only — not instructional form diagrams (those are SVG stick figures).
No text in the image unless explicitly requested. No crisis or clinical depression framing.
No readable UI chrome, no fake app screenshots unless asked.`;

/** @type {Record<string, { aspect: string, file: string, body: string }>} */
const JOBS = {
  'grok-social-invite': {
    aspect: '1:1',
    file: 'media/inbox/social-invite-square-frame.png',
    body: `Empty outdoor training spot at soft dawn on paper-colored ground. Chalk marks on
asphalt, one kettlebell silhouette, thin vermillion red rim light #ec3013, mid-grey
dust #6f6b69. Train-anywhere mood, calm competence. No people faces, no logos,
no text, no purple glow. Square composition for invite / beta DM.`,
  },
  'grok-social-coach': {
    aspect: '1:1',
    file: 'media/inbox/social-coach-story-frame.png',
    body: `Abstract mission-briefing field on paper ground: faint weekly-plan grid, soft
vermillion red arcs suggesting progressive load, mid-grey detail marks. Clinical
telemetry mood — not gamification fireworks. No readable text, no logos, no faces,
no gym-bro, no medical charts. Square composition for Coach / plan story.`,
  },
  'grok-mascot-idle': {
    aspect: '1:1',
    file: 'media/inbox/mascot-scout-idle-frame.png',
    body: `Mission Winning brand mascot Scout. Small geometric falcon/kestrel character,
flat 2D shapes, paper body #f3f2f2, ink edge lines #201e1d, the one red accent
#ec3013, mid-grey chest chevron #6f6b69. Neutral attention pose, calm competence,
mission briefing companion. Centered on solid paper ground. No text, no logos,
no photoreal feathers, no purple, no cute crying face. Readable silhouette for
app empty states. Three-quarter front view.`,
  },
  'grok-mascot-invite': {
    aspect: '1:1',
    file: 'media/inbox/mascot-scout-invite-frame.png',
    body: `Mission Winning brand mascot Scout. Same geometric falcon/kestrel as idle —
identical proportions. Invite pose: one wing slightly open as a beckon, calm
friendly attention, vermillion red #ec3013, mid grey chevron #6f6b69. Paper
canvas #f3f2f2. Not desperate, not guilt-tripping. No text, no logos, no photoreal.`,
  },
  'grok-mascot-celebrate': {
    aspect: '1:1',
    file: 'media/inbox/mascot-scout-celebrate-frame.png',
    body: `Mission Winning brand mascot Scout. Same geometric falcon/kestrel — identical
proportions. Celebrate pose: subtle lift, mid-grey detail flash #6f6b69, vermillion
red rim #ec3013, victory without fireworks spam. Paper canvas #f3f2f2. "Set locked"
energy. No text, no logos, no photoreal, no streak-shame expression.`,
  },
};

const id = process.argv[2];
if (!id || !JOBS[id]) {
  console.error('Usage: node scripts/print-grok-prompt.mjs <promptId>\n');
  console.error('Ids:\n  ' + Object.keys(JOBS).join('\n  '));
  process.exit(1);
}

const job = JOBS[id];
const full = `${BRAND}\n\n${job.body}`;
const url = `https://grok.com/imagine?prompt=${encodeURIComponent(full)}`;

console.log(`# ${id}`);
console.log(`Aspect: ${job.aspect}`);
console.log(`Export: ${job.file}`);
console.log('');
console.log('--- PASTE INTO GROK IMAGINE ---');
console.log(full);
console.log('--- END PASTE ---');
console.log('');
console.log('Deep link (may be long):');
console.log(url);
