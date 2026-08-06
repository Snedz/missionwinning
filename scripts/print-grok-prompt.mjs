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
  'grok-mascot-kalligator-idle': {
    aspect: '1:1',
    file: 'media/inbox/mascot-kalligator-idle-frame.png',
    body: `Mission Winning brand mascot Kalligator. Cute cartoon crocodile/alligator,
flat sticker shapes, teal body, cream belly, red back spines,
ink outlines, paper ground. Calm composed pose, X-eye optional soft
expression, mission briefing companion. Centered, full character in frame. No text,
no logos, no photoreal scales, no purple. Readable silhouette for app empty states.`,
  },
  'grok-mascot-kalligator-invite': {
    aspect: '1:1',
    file: 'media/inbox/mascot-kalligator-invite-frame.png',
    body: `Mission Winning brand mascot Kalligator. Same crocodile proportions as idle kit.
Invite / ready pose: slight forward energy, fist pump or open arms beckon, calm friendly
attention — not desperate. Teal body, cream belly, red spines, paper canvas.
No text, no logos, no photoreal, no guilt-trip face.`,
  },
  'grok-mascot-kalligator-celebrate': {
    aspect: '1:1',
    file: 'media/inbox/mascot-kalligator-celebrate-frame.png',
    body: `Mission Winning brand mascot Kalligator. Same crocodile proportions. Celebrate /
joyful "crash-out" pose: big smile, arms up, optional small red stars — victory joy not rage.
"Set locked" energy. Teal body, cream belly, red spines, paper canvas. No text,
no logos, no streak-shame expression.`,
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
