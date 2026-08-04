#!/usr/bin/env node
/**
 * Rebuild instructional form SVGs with corrected stick geometry.
 * Run: node scripts/generate-form-guides-all.mjs
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  formGuideSvg,
  stickGroup,
  sideAthlete,
  frontAthlete,
  plankAthlete,
  redDot,
  redArrow,
  equipmentBar,
  PHASE_CX,
  INK,
  GROUND_Y,
} from './form-kit/stickFigure.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'form-guides');
const [c0, c1, c2] = PHASE_CX;

function write(id, title, aria, labels, body) {
  const svg = formGuideSvg({ id, title, ariaLabel: aria, labels, body: body.join('\n') });
  writeFileSync(path.join(outDir, `${id}.svg`), svg);
  console.log(id);
}

const bar = (x1, y, x2) => equipmentBar(x1, y, x2, INK);
const g = (pose) => stickGroup(pose);

// ── Patterns ─────────────────────────────────────────────────────
write('pattern-squat', 'Squat pattern form diagram', 'Shared squat pattern: stand, depth, drive', ['STAND', 'DEPTH', 'DRIVE'], [
  g(sideAthlete(c0, { depth: 0, leanDeg: 5, arms: 'forward' })),
  redDot(c0, 115, 'brace'),
  g(sideAthlete(c1, { depth: 0.85, leanDeg: 12, arms: 'forward' })),
  redDot(c1, 140, 'depth'),
  g(sideAthlete(c2, { depth: 0, leanDeg: 5, arms: 'forward' })),
  redArrow(c2, 150, c2, 120, 'drive'),
]);

write('pattern-hinge', 'Hinge pattern form diagram', 'Shared hinge pattern: setup, hinge, lockout', ['SETUP', 'HINGE', 'LOCK'], [
  g(sideAthlete(c0, { depth: 0, leanDeg: 8, arms: 'down' })),
  bar(c0 - 22, 150, c0 + 22),
  g(sideAthlete(c1, { depth: 0.35, leanDeg: 55, arms: 'down' })),
  bar(c1 - 18, 168, c1 + 28),
  redDot(c1 - 5, 145, 'hips'),
  g(sideAthlete(c2, { depth: 0, leanDeg: 0, arms: 'down' })),
  bar(c2 - 22, 128, c2 + 22),
  redDot(c2, 115, 'lock'),
]);

write('pattern-push', 'Push pattern form diagram', 'Shared push pattern: brace, press, lock', ['BRACE', 'PRESS', 'LOCK'], [
  // Standing press silhouette — distinct from push-up plank pattern
  g(sideAthlete(c0, { depth: 0, leanDeg: 0, arms: 'rack' })),
  bar(c0 - 16, 72, c0 + 16),
  redDot(c0, 100, 'brace'),
  g(sideAthlete(c1, { depth: 0, leanDeg: 0, arms: 'overhead' })),
  bar(c1 - 14, 50, c1 + 14),
  redArrow(c1 + 28, 100, c1 + 28, 60, ''),
  g(sideAthlete(c2, { depth: 0, leanDeg: 0, arms: 'overhead' })),
  bar(c2 - 14, 42, c2 + 14),
  redDot(c2, 42, 'lock'),
]);

write('pattern-pull', 'Pull pattern form diagram', 'Shared pull pattern: hang, pull, lower', ['HANG', 'PULL', 'LOWER'], [
  bar(c0 - 28, 48, c0 + 28),
  g({
    ...frontAthlete(c0, { arms: 'overhead' }),
    leftHand: { x: c0 - 18, y: 52 },
    rightHand: { x: c0 + 18, y: 52 },
    leftElbow: { x: c0 - 20, y: 85 },
    rightElbow: { x: c0 + 20, y: 85 },
  }),
  redDot(c0, 52, 'grip'),
  bar(c1 - 28, 48, c1 + 28),
  g({
    head: { x: c1, y: 72 },
    neck: { x: c1, y: 84 },
    hip: { x: c1, y: 125 },
    leftShoulder: { x: c1 - 14, y: 90 },
    rightShoulder: { x: c1 + 14, y: 90 },
    leftElbow: { x: c1 - 22, y: 70 },
    rightElbow: { x: c1 + 22, y: 70 },
    leftHand: { x: c1 - 16, y: 52 },
    rightHand: { x: c1 + 16, y: 52 },
    leftKnee: { x: c1 - 10, y: 150 },
    rightKnee: { x: c1 + 10, y: 150 },
    leftFoot: { x: c1 - 12, y: GROUND_Y },
    rightFoot: { x: c1 + 12, y: GROUND_Y },
  }),
  redArrow(c1 + 30, 110, c1 + 30, 75, 'pull'),
  bar(c2 - 28, 48, c2 + 28),
  g({
    ...frontAthlete(c2, { arms: 'overhead' }),
    leftHand: { x: c2 - 18, y: 52 },
    rightHand: { x: c2 + 18, y: 52 },
    leftElbow: { x: c2 - 20, y: 95 },
    rightElbow: { x: c2 + 20, y: 95 },
  }),
]);

write('pattern-core', 'Core pattern form diagram', 'Shared core pattern: brace, challenge, hold', ['BRACE', 'CHALLENGE', 'HOLD'], [
  g(plankAthlete(c0, { lowered: false })),
  redDot(c0 - 15, 145, 'brace'),
  g({
    head: { x: c1 + 30, y: 100 },
    neck: { x: c1 + 20, y: 115 },
    hip: { x: c1 - 10, y: 125 },
    side: true,
    leftShoulder: { x: c1 + 18, y: 118 },
    leftHand: { x: c1 + 45, y: 100 },
    rightHand: { x: c1 + 15, y: GROUND_Y },
    leftKnee: { x: c1 - 20, y: 140 },
    rightFoot: { x: c1 - 40, y: 100 },
    leftFoot: { x: c1 - 25, y: GROUND_Y },
  }),
  redDot(c1 - 10, 125, 'level'),
  g(plankAthlete(c2, { lowered: false })),
  redDot(c2 - 15, 145, 'hold'),
]);

write('pattern-loco', 'Locomotion pattern form diagram', 'Shared locomotion pattern: load, drive, recover', ['LOAD', 'DRIVE', 'RECOVER'], [
  g(sideAthlete(c0, { depth: 0.4, leanDeg: 15, arms: 'forward' })),
  g(sideAthlete(c1, { depth: 0.15, leanDeg: 8, arms: 'forward' })),
  redArrow(c1 - 10, 160, c1 + 20, 140, ''),
  g(sideAthlete(c2, { depth: 0, leanDeg: 0, arms: 'down' })),
  redDot(c2, 115, 'reset'),
]);

write('pattern-isolation', 'Isolation pattern form diagram', 'Shared isolation pattern: start, peak, return', ['START', 'PEAK', 'RETURN'], [
  // Slightly different proportions than bicep-curl so uniqueness holds
  g({
    ...frontAthlete(c0, { arms: 'hang' }),
    leftHand: { x: c0 - 24, y: 148 },
    rightHand: { x: c0 + 24, y: 148 },
  }),
  redDot(c0, 105, 'still'),
  g({
    ...frontAthlete(c1, { arms: 'raise' }),
    leftHand: { x: c1 - 48, y: 100 },
    rightHand: { x: c1 + 48, y: 100 },
  }),
  redDot(c1, 88, 'peak'),
  g({
    ...frontAthlete(c2, { arms: 'hang' }),
    leftHand: { x: c2 - 22, y: 140 },
    rightHand: { x: c2 + 22, y: 140 },
  }),
  redArrow(c2 + 30, 95, c2 + 30, 130, 'control'),
]);

// ── Core lifts (side / clear teaching poses) ─────────────────────
write('push-ups', 'Push-up form diagram', 'Push-up form: setup plank, mid lower, lockout', ['SETUP', 'MID', 'LOCKOUT'], [
  g(plankAthlete(c0, { lowered: false })),
  redDot(c0 + 28, 160, 'elbow'),
  g(plankAthlete(c1, { lowered: true })),
  redArrow(c1 + 15, 95, c1 + 15, 125, 'LOWER'),
  g(plankAthlete(c2, { lowered: false })),
  redArrow(c2 + 15, 140, c2 + 15, 110, 'PRESS'),
]);

write('air-squat', 'Air squat form diagram', 'Air squat form: stand, depth, stand', ['STAND', 'DEPTH', 'STAND'], [
  g(sideAthlete(c0, { depth: 0, leanDeg: 5, arms: 'forward' })),
  g(sideAthlete(c1, { depth: 0.9, leanDeg: 15, arms: 'forward' })),
  redDot(c1, 145, 'depth'),
  g(sideAthlete(c2, { depth: 0, leanDeg: 5, arms: 'forward' })),
  redArrow(c2, 150, c2, 120, ''),
]);

write('squats', 'Squat form diagram', 'Squat form: setup, depth, drive', ['SETUP', 'DEPTH', 'DRIVE'], [
  g(sideAthlete(c0, { depth: 0, leanDeg: 8, arms: 'rack' })),
  bar(c0 - 20, 58, c0 + 20),
  g(sideAthlete(c1, { depth: 0.85, leanDeg: 18, arms: 'rack' })),
  bar(c1 - 18, 88, c1 + 22),
  redDot(c1, 145, 'hips'),
  g(sideAthlete(c2, { depth: 0, leanDeg: 5, arms: 'rack' })),
  bar(c2 - 20, 58, c2 + 20),
  redArrow(c2, 150, c2, 120, 'drive'),
]);

write('deadlift', 'Deadlift form diagram', 'Deadlift form: setup, pull, lockout', ['SETUP', 'PULL', 'LOCKOUT'], [
  g(sideAthlete(c0, { depth: 0.45, leanDeg: 50, arms: 'down' })),
  bar(c0 - 20, 170, c0 + 25),
  redDot(c0 - 5, 145, 'hips'),
  g(sideAthlete(c1, { depth: 0.2, leanDeg: 25, arms: 'down' })),
  bar(c1 - 18, 148, c1 + 22),
  redArrow(c1 + 25, 160, c1 + 25, 130, 'push floor'),
  g(sideAthlete(c2, { depth: 0, leanDeg: 0, arms: 'down' })),
  bar(c2 - 22, 125, c2 + 22),
  redDot(c2, 115, 'lock'),
]);

write('romanian-deadlift', 'Romanian deadlift form diagram', 'RDL form: stand, hinge, lockout', ['STAND', 'HINGE', 'LOCKOUT'], [
  g(sideAthlete(c0, { depth: 0, leanDeg: 5, arms: 'down' })),
  bar(c0 - 20, 128, c0 + 20),
  g(sideAthlete(c1, { depth: 0.25, leanDeg: 60, arms: 'down' })),
  bar(c1 - 15, 165, c1 + 30),
  redDot(c1, 140, 'hinge'),
  g(sideAthlete(c2, { depth: 0, leanDeg: 0, arms: 'down' })),
  bar(c2 - 20, 128, c2 + 20),
]);

write('pull-ups', 'Pull-up form diagram', 'Pull-up form: hang, pull, lower', ['HANG', 'PULL', 'LOWER'], [
  bar(c0 - 30, 48, c0 + 30),
  g({
    head: { x: c0, y: 95 },
    neck: { x: c0, y: 108 },
    hip: { x: c0, y: 145 },
    leftShoulder: { x: c0 - 14, y: 112 },
    rightShoulder: { x: c0 + 14, y: 112 },
    leftElbow: { x: c0 - 22, y: 80 },
    rightElbow: { x: c0 + 22, y: 80 },
    leftHand: { x: c0 - 20, y: 52 },
    rightHand: { x: c0 + 20, y: 52 },
    leftKnee: { x: c0 - 8, y: 160 },
    rightKnee: { x: c0 + 8, y: 160 },
    leftFoot: { x: c0 - 10, y: GROUND_Y },
    rightFoot: { x: c0 + 10, y: GROUND_Y },
  }),
  bar(c1 - 30, 48, c1 + 30),
  g({
    head: { x: c1, y: 68 },
    neck: { x: c1, y: 80 },
    hip: { x: c1, y: 120 },
    leftShoulder: { x: c1 - 14, y: 86 },
    rightShoulder: { x: c1 + 14, y: 86 },
    leftElbow: { x: c1 - 24, y: 65 },
    rightElbow: { x: c1 + 24, y: 65 },
    leftHand: { x: c1 - 16, y: 52 },
    rightHand: { x: c1 + 16, y: 52 },
    leftKnee: { x: c1 - 8, y: 145 },
    rightKnee: { x: c1 + 8, y: 145 },
    leftFoot: { x: c1 - 10, y: 165 },
    rightFoot: { x: c1 + 10, y: 165 },
  }),
  redArrow(c1 + 35, 115, c1 + 35, 75, 'pull'),
  bar(c2 - 30, 48, c2 + 30),
  g({
    head: { x: c2, y: 95 },
    neck: { x: c2, y: 108 },
    hip: { x: c2, y: 145 },
    leftShoulder: { x: c2 - 14, y: 112 },
    rightShoulder: { x: c2 + 14, y: 112 },
    leftElbow: { x: c2 - 22, y: 80 },
    rightElbow: { x: c2 + 22, y: 80 },
    leftHand: { x: c2 - 20, y: 52 },
    rightHand: { x: c2 + 20, y: 52 },
    leftKnee: { x: c2 - 8, y: 160 },
    rightKnee: { x: c2 + 8, y: 160 },
    leftFoot: { x: c2 - 10, y: GROUND_Y },
    rightFoot: { x: c2 + 10, y: GROUND_Y },
  }),
]);

write('plank', 'Plank form diagram', 'Plank form: setup, hold, exit', ['SETUP', 'HOLD', 'EXIT'], [
  g(plankAthlete(c0, { lowered: false })),
  redDot(c0 - 15, 145, 'line'),
  g(plankAthlete(c1, { lowered: false })),
  redDot(c1 - 15, 145, 'brace'),
  g(sideAthlete(c2, { depth: 0.2, leanDeg: 10, arms: 'down' })),
]);

write('glute-bridge', 'Glute bridge form diagram', 'Glute bridge: setup, drive, lower', ['SETUP', 'DRIVE', 'LOWER'], [
  // supine bridge
  g({
    head: { x: c0 - 25, y: 130 },
    neck: { x: c0 - 15, y: 140 },
    hip: { x: c0 + 15, y: 160 },
    side: true,
    leftShoulder: { x: c0 - 12, y: 145 },
    leftHand: { x: c0 - 20, y: GROUND_Y },
    leftKnee: { x: c0 + 35, y: 155 },
    leftFoot: { x: c0 + 50, y: GROUND_Y },
    rightFoot: { x: c0 + 45, y: GROUND_Y },
  }),
  g({
    head: { x: c1 - 25, y: 120 },
    neck: { x: c1 - 15, y: 130 },
    hip: { x: c1 + 20, y: 125 },
    side: true,
    leftShoulder: { x: c1 - 12, y: 135 },
    leftHand: { x: c1 - 20, y: GROUND_Y },
    leftKnee: { x: c1 + 40, y: 150 },
    leftFoot: { x: c1 + 55, y: GROUND_Y },
    rightFoot: { x: c1 + 50, y: GROUND_Y },
  }),
  redArrow(c1 + 15, 155, c1 + 15, 130, 'hips'),
  g({
    head: { x: c2 - 25, y: 130 },
    neck: { x: c2 - 15, y: 140 },
    hip: { x: c2 + 15, y: 160 },
    side: true,
    leftShoulder: { x: c2 - 12, y: 145 },
    leftHand: { x: c2 - 20, y: GROUND_Y },
    leftKnee: { x: c2 + 35, y: 155 },
    leftFoot: { x: c2 + 50, y: GROUND_Y },
    rightFoot: { x: c2 + 45, y: GROUND_Y },
  }),
]);

write('lunges', 'Lunge form diagram', 'Lunge form: stand, lower, drive', ['STAND', 'LOWER', 'DRIVE'], [
  g(sideAthlete(c0, { depth: 0, leanDeg: 0, arms: 'down' })),
  g({
    head: { x: c1, y: 70 },
    neck: { x: c1, y: 85 },
    hip: { x: c1, y: 125 },
    side: true,
    leftShoulder: { x: c1, y: 90 },
    leftHand: { x: c1 - 12, y: 130 },
    rightHand: { x: c1 + 12, y: 130 },
    leftKnee: { x: c1 + 25, y: 155 },
    rightKnee: { x: c1 - 20, y: 160 },
    leftFoot: { x: c1 + 40, y: GROUND_Y },
    rightFoot: { x: c1 - 30, y: GROUND_Y },
  }),
  redDot(c1 + 25, 155, 'knee'),
  g(sideAthlete(c2, { depth: 0, leanDeg: 0, arms: 'down' })),
  redArrow(c2, 150, c2, 120, ''),
]);

write('overhead-press', 'Overhead press form diagram', 'OHP form: rack, press, lock', ['RACK', 'PRESS', 'LOCK'], [
  g(sideAthlete(c0, { depth: 0, leanDeg: 0, arms: 'rack' })),
  bar(c0 - 18, 72, c0 + 18),
  g(sideAthlete(c1, { depth: 0, leanDeg: 0, arms: 'overhead' })),
  bar(c1 - 16, 48, c1 + 16),
  redArrow(c1 + 28, 100, c1 + 28, 60, 'up'),
  g(sideAthlete(c2, { depth: 0, leanDeg: 0, arms: 'overhead' })),
  bar(c2 - 16, 42, c2 + 16),
  redDot(c2, 42, 'lock'),
]);

write('barbell-row', 'Barbell row form diagram', 'Row form: hinge, pull, lower', ['HINGE', 'PULL', 'LOWER'], [
  g(sideAthlete(c0, { depth: 0.2, leanDeg: 55, arms: 'down' })),
  bar(c0 - 15, 160, c0 + 28),
  g(sideAthlete(c1, { depth: 0.2, leanDeg: 50, arms: 'down' })),
  // hands higher = pulled
  g({
    ...sideAthlete(c1, { depth: 0.2, leanDeg: 50, arms: 'down' }),
    leftElbow: { x: c1 + 5, y: 120 },
    leftHand: { x: c1 + 15, y: 125 },
    rightElbow: { x: c1 + 10, y: 125 },
    rightHand: { x: c1 + 20, y: 130 },
  }),
  bar(c1 + 5, 128, c1 + 40),
  redArrow(c1 + 45, 150, c1 + 45, 125, 'row'),
  g(sideAthlete(c2, { depth: 0.2, leanDeg: 55, arms: 'down' })),
  bar(c2 - 15, 160, c2 + 28),
]);

write('burpees', 'Burpee form diagram', 'Burpee form: stand, plank, jump', ['STAND', 'PLANK', 'JUMP'], [
  g(sideAthlete(c0, { depth: 0, leanDeg: 0, arms: 'down' })),
  g(plankAthlete(c1, { lowered: false })),
  g(sideAthlete(c2, { depth: 0, leanDeg: 0, arms: 'overhead' })),
  redArrow(c2, 160, c2, 130, 'up'),
]);

write('inverted-row', 'Inverted row form diagram', 'Inverted row: hang, pull, lower', ['HANG', 'PULL', 'LOWER'], [
  bar(c0 - 40, 90, c0 + 40),
  g({
    head: { x: c0 + 40, y: 130 },
    neck: { x: c0 + 28, y: 140 },
    hip: { x: c0 - 20, y: 155 },
    side: true,
    leftShoulder: { x: c0 + 25, y: 142 },
    leftHand: { x: c0 + 20, y: 95 },
    rightHand: { x: c0 + 10, y: 95 },
    leftFoot: { x: c0 - 45, y: GROUND_Y },
    rightFoot: { x: c0 - 40, y: GROUND_Y },
  }),
  bar(c1 - 40, 90, c1 + 40),
  g({
    head: { x: c1 + 35, y: 110 },
    neck: { x: c1 + 22, y: 120 },
    hip: { x: c1 - 20, y: 145 },
    side: true,
    leftShoulder: { x: c1 + 20, y: 122 },
    leftElbow: { x: c1 + 15, y: 105 },
    leftHand: { x: c1 + 18, y: 95 },
    rightHand: { x: c1 + 8, y: 95 },
    leftFoot: { x: c1 - 45, y: GROUND_Y },
    rightFoot: { x: c1 - 40, y: GROUND_Y },
  }),
  redArrow(c1, 150, c1, 120, 'chest'),
  bar(c2 - 40, 90, c2 + 40),
  g({
    head: { x: c2 + 40, y: 130 },
    neck: { x: c2 + 28, y: 140 },
    hip: { x: c2 - 20, y: 155 },
    side: true,
    leftShoulder: { x: c2 + 25, y: 142 },
    leftHand: { x: c2 + 20, y: 95 },
    rightHand: { x: c2 + 10, y: 95 },
    leftFoot: { x: c2 - 45, y: GROUND_Y },
    rightFoot: { x: c2 - 40, y: GROUND_Y },
  }),
]);

write('bench-press', 'Bench press form diagram', 'Bench press: setup, lower, press', ['SETUP', 'LOWER', 'PRESS'], [
  // simplified supine press
  ...[c0, c1, c2].map((cx, i) => {
    const barY = i === 1 ? 95 : 70;
    return [
      `  <rect x="${cx - 40}" y="140" width="80" height="12" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
      g({
        head: { x: cx - 30, y: 125 },
        neck: { x: cx - 20, y: 135 },
        hip: { x: cx + 20, y: 145 },
        side: true,
        leftShoulder: { x: cx - 10, y: 130 },
        leftElbow: { x: cx - 5, y: barY + 15 },
        leftHand: { x: cx, y: barY },
        rightElbow: { x: cx + 15, y: barY + 15 },
        rightHand: { x: cx + 20, y: barY },
        leftKnee: { x: cx + 35, y: 155 },
        leftFoot: { x: cx + 40, y: GROUND_Y },
        rightFoot: { x: cx + 30, y: GROUND_Y },
      }),
      bar(cx - 25, barY, cx + 35),
      i === 1 ? redArrow(cx + 45, 70, cx + 45, 95, 'lower') : '',
      i === 2 ? redArrow(cx + 45, 100, cx + 45, 70, 'press') : '',
    ].join('\n');
  }),
]);

write('hip-thrust', 'Hip thrust form diagram', 'Hip thrust: setup, drive, lower', ['SETUP', 'DRIVE', 'LOWER'], [
  g({
    head: { x: c0 - 10, y: 100 },
    neck: { x: c0, y: 115 },
    hip: { x: c0 + 30, y: 150 },
    side: true,
    leftShoulder: { x: c0 + 2, y: 118 },
    leftHand: { x: c0 + 25, y: 145 },
    leftKnee: { x: c0 + 50, y: 155 },
    leftFoot: { x: c0 + 55, y: GROUND_Y },
    rightFoot: { x: c0 + 48, y: GROUND_Y },
  }),
  `  <rect x="${c0 - 35}" y="125" width="30" height="40" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c1 - 10, y: 95 },
    neck: { x: c1, y: 110 },
    hip: { x: c1 + 35, y: 115 },
    side: true,
    leftShoulder: { x: c1 + 2, y: 112 },
    leftHand: { x: c1 + 30, y: 118 },
    leftKnee: { x: c1 + 55, y: 150 },
    leftFoot: { x: c1 + 60, y: GROUND_Y },
    rightFoot: { x: c1 + 52, y: GROUND_Y },
  }),
  `  <rect x="${c1 - 35}" y="120" width="30" height="40" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  redArrow(c1 + 30, 145, c1 + 30, 120, 'drive'),
  g({
    head: { x: c2 - 10, y: 100 },
    neck: { x: c2, y: 115 },
    hip: { x: c2 + 30, y: 150 },
    side: true,
    leftShoulder: { x: c2 + 2, y: 118 },
    leftHand: { x: c2 + 25, y: 145 },
    leftKnee: { x: c2 + 50, y: 155 },
    leftFoot: { x: c2 + 55, y: GROUND_Y },
    rightFoot: { x: c2 + 48, y: GROUND_Y },
  }),
  `  <rect x="${c2 - 35}" y="125" width="30" height="40" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
]);

// Isolation — each pose distinct (uniqueness guard on joint coords)
write('bicep-curl', 'Bicep curl form diagram', 'Bicep curl: hang, curl, lower', ['HANG', 'CURL', 'LOWER'], [
  g(frontAthlete(c0, { arms: 'hang' })),
  redDot(c0, 100, 'pin'),
  g(frontAthlete(c1, { arms: 'curl' })),
  redDot(c1, 90, 'elbows'),
  g(frontAthlete(c2, { arms: 'hang' })),
  redArrow(c2 + 28, 90, c2 + 28, 125, ''),
]);

write('lateral-raise', 'Lateral raise form diagram', 'Lateral raise: hang, raise, lower', ['HANG', 'RAISE', 'LOWER'], [
  g(frontAthlete(c0, { arms: 'hang' })),
  g(frontAthlete(c1, { arms: 'raise' })),
  redDot(c1 - 45, 95, 'shoulder'),
  redDot(c1 + 45, 95, ''),
  g({
    ...frontAthlete(c2, { arms: 'raise' }),
    leftHand: { x: c2 - 40, y: 115 },
    rightHand: { x: c2 + 40, y: 115 },
    leftElbow: { x: c2 - 30, y: 110 },
    rightElbow: { x: c2 + 30, y: 110 },
  }),
]);

write('tricep-pushdown', 'Tricep pushdown form diagram', 'Tricep pushdown: start, extend, return', ['START', 'EXTEND', 'RETURN'], [
  g({
    ...frontAthlete(c0, { arms: 'curl' }),
    leftElbow: { x: c0 - 12, y: 100 },
    rightElbow: { x: c0 + 12, y: 100 },
    leftHand: { x: c0 - 10, y: 85 },
    rightHand: { x: c0 + 10, y: 85 },
  }),
  bar(c0 - 20, 80, c0 + 20),
  g({
    ...frontAthlete(c1, { arms: 'hang' }),
    leftElbow: { x: c1 - 12, y: 105 },
    rightElbow: { x: c1 + 12, y: 105 },
    leftHand: { x: c1 - 10, y: 145 },
    rightHand: { x: c1 + 10, y: 145 },
  }),
  redDot(c1, 145, 'extend'),
  g({
    ...frontAthlete(c2, { arms: 'curl' }),
    leftElbow: { x: c2 - 12, y: 100 },
    rightElbow: { x: c2 + 12, y: 100 },
    leftHand: { x: c2 - 10, y: 85 },
    rightHand: { x: c2 + 10, y: 85 },
  }),
  bar(c2 - 20, 80, c2 + 20),
]);

write('face-pull', 'Face pull form diagram', 'Face pull: reach, pull, rotate', ['REACH', 'PULL', 'ROTATE'], [
  // 3/4 side — not front raise
  g(sideAthlete(c0, { depth: 0, leanDeg: 5, arms: 'forward' })),
  bar(c0 + 40, 95, c0 + 58),
  redDot(c0 + 38, 100, 'rope'),
  g({
    ...sideAthlete(c1, { depth: 0, leanDeg: 0, arms: 'forward' }),
    leftElbow: { x: c1 - 5, y: 85 },
    rightElbow: { x: c1 + 20, y: 80 },
    leftHand: { x: c1 + 5, y: 78 },
    rightHand: { x: c1 + 18, y: 72 },
  }),
  redArrow(c1 + 40, 110, c1 + 20, 80, 'high'),
  g({
    ...sideAthlete(c2, { depth: 0, leanDeg: 0, arms: 'forward' }),
    leftElbow: { x: c2 - 15, y: 78 },
    rightElbow: { x: c2 + 28, y: 75 },
    leftHand: { x: c2 - 5, y: 65 },
    rightHand: { x: c2 + 20, y: 62 },
  }),
  redDot(c2, 72, 'face'),
]);

write('band-pull-apart', 'Band pull-apart form diagram', 'Band pull-apart: hold, pull, return', ['HOLD', 'PULL', 'RETURN'], [
  g(frontAthlete(c0, { arms: 'forward' })),
  `  <path d="M${c0 - 32} 98 Q${c0} 105 ${c0 + 32} 98" stroke="${INK}" stroke-width="2" fill="none"></path>`,
  redDot(c0, 102, 'band'),
  g({
    ...frontAthlete(c1, { arms: 'raise' }),
    leftHand: { x: c1 - 55, y: 95 },
    rightHand: { x: c1 + 55, y: 95 },
  }),
  `  <path d="M${c1 - 55} 95 Q${c1} 92 ${c1 + 55} 95" stroke="${INK}" stroke-width="2" fill="none"></path>`,
  redArrow(c1 - 35, 110, c1 - 50, 95, ''),
  redArrow(c1 + 35, 110, c1 + 50, 95, ''),
  g(frontAthlete(c2, { arms: 'forward' })),
  `  <path d="M${c2 - 32} 98 Q${c2} 105 ${c2 + 32} 98" stroke="${INK}" stroke-width="2" fill="none"></path>`,
]);

write('kettlebell-swing', 'Kettlebell swing form diagram', 'KB swing: hike, snap, float', ['HIKE', 'SNAP', 'FLOAT'], [
  g(sideAthlete(c0, { depth: 0.4, leanDeg: 55, arms: 'down' })),
  `  <circle cx="${c0 - 5}" cy="168" r="8" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
  redDot(c0, 140, 'hinge'),
  g(sideAthlete(c1, { depth: 0, leanDeg: 0, arms: 'forward' })),
  `  <circle cx="${c1 + 30}" cy="95" r="8" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
  redArrow(c1, 150, c1, 120, 'hips'),
  g(sideAthlete(c2, { depth: 0, leanDeg: 0, arms: 'forward' })),
  `  <circle cx="${c2 + 25}" cy="70" r="8" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
  redDot(c2 + 25, 70, 'float'),
]);

write('front-squat', 'Front squat form diagram', 'Front squat: rack, depth, stand', ['RACK', 'DEPTH', 'STAND'], [
  g(sideAthlete(c0, { depth: 0, leanDeg: 0, arms: 'rack' })),
  bar(c0 - 18, 68, c0 + 18),
  redDot(c0, 72, 'rack'),
  g(sideAthlete(c1, { depth: 0.85, leanDeg: 8, arms: 'rack' })),
  bar(c1 - 16, 95, c1 + 20),
  redDot(c1, 145, 'upright'),
  g(sideAthlete(c2, { depth: 0, leanDeg: 0, arms: 'rack' })),
  bar(c2 - 18, 68, c2 + 18),
  redArrow(c2, 150, c2, 120, 'drive'),
]);

write('goblet-squat', 'Goblet squat form diagram', 'Goblet squat: hold, depth, stand', ['HOLD', 'DEPTH', 'STAND'], [
  g(frontAthlete(c0, { arms: 'curl' })),
  `  <rect x="${c0 - 6}" y="78" width="12" height="18" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  redDot(c0, 85, 'goblet'),
  g(frontAthlete(c1, { depth: 0.9, arms: 'curl' })),
  `  <rect x="${c1 - 6}" y="108" width="12" height="18" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  redDot(c1 - 20, 160, 'elbows in'),
  g(frontAthlete(c2, { arms: 'curl' })),
  `  <rect x="${c2 - 6}" y="78" width="12" height="18" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  redArrow(c2, 150, c2, 120, ''),
]);

write('jump-squats', 'Jump squat form diagram', 'Jump squat: load, explode, land', ['LOAD', 'EXPLODE', 'LAND'], [
  g(sideAthlete(c0, { depth: 0.7, leanDeg: 10, arms: 'down' })),
  redDot(c0, 140, 'load'),
  g({
    ...sideAthlete(c1, { depth: 0, leanDeg: 0, arms: 'overhead' }),
    leftFoot: { x: c1 - 14, y: 150 },
    rightFoot: { x: c1 + 14, y: 150 },
  }),
  redArrow(c1, 170, c1, 140, 'up'),
  `  <line x1="${c1 - 25}" y1="175" x2="${c1 + 25}" y2="175" stroke="${INK}" stroke-width="1.5" stroke-dasharray="4 3"></line>`,
  g(sideAthlete(c2, { depth: 0.45, leanDeg: 8, arms: 'down' })),
  redDot(c2, GROUND_Y, 'soft'),
]);

// Floor / mobility
write('bird-dog', 'Bird-dog form diagram', 'Bird-dog: setup, extend, hold', ['SETUP', 'EXTEND', 'HOLD'], [
  g({
    head: { x: c0 + 25, y: 105 },
    neck: { x: c0 + 15, y: 115 },
    hip: { x: c0 - 10, y: 130 },
    side: true,
    leftShoulder: { x: c0 + 12, y: 118 },
    leftHand: { x: c0 + 30, y: GROUND_Y - 5 },
    rightHand: { x: c0 + 10, y: GROUND_Y - 5 },
    leftKnee: { x: c0 - 15, y: GROUND_Y - 15 },
    rightKnee: { x: c0 - 5, y: GROUND_Y - 15 },
    leftFoot: { x: c0 - 28, y: GROUND_Y },
    rightFoot: { x: c0 - 18, y: GROUND_Y },
  }),
  g({
    head: { x: c1 + 35, y: 95 },
    neck: { x: c1 + 22, y: 110 },
    hip: { x: c1 - 5, y: 128 },
    side: true,
    leftShoulder: { x: c1 + 18, y: 112 },
    leftHand: { x: c1 + 50, y: 100 },
    rightHand: { x: c1 + 10, y: GROUND_Y - 5 },
    leftKnee: { x: c1 - 15, y: GROUND_Y - 15 },
    rightFoot: { x: c1 - 35, y: 100 },
    leftFoot: { x: c1 - 25, y: GROUND_Y },
  }),
  redArrow(c1 + 45, 115, c1 + 55, 95, ''),
  redArrow(c1 - 25, 120, c1 - 40, 100, ''),
  g({
    head: { x: c2 + 35, y: 95 },
    neck: { x: c2 + 22, y: 110 },
    hip: { x: c2 - 5, y: 128 },
    side: true,
    leftShoulder: { x: c2 + 18, y: 112 },
    leftHand: { x: c2 + 50, y: 100 },
    rightHand: { x: c2 + 10, y: GROUND_Y - 5 },
    leftKnee: { x: c2 - 15, y: GROUND_Y - 15 },
    rightFoot: { x: c2 - 35, y: 100 },
    leftFoot: { x: c2 - 25, y: GROUND_Y },
  }),
  redDot(c2 - 5, 128, 'level'),
]);

write('side-plank', 'Side plank form diagram', 'Side plank: setup, lift, hold', ['SETUP', 'LIFT', 'HOLD'], [
  g({
    head: { x: c0 - 15, y: 110 },
    neck: { x: c0 - 5, y: 125 },
    hip: { x: c0 + 20, y: 150 },
    side: true,
    leftShoulder: { x: c0, y: 130 },
    leftElbow: { x: c0 - 5, y: 160 },
    leftHand: { x: c0, y: GROUND_Y },
    leftFoot: { x: c0 + 45, y: GROUND_Y },
    rightFoot: { x: c0 + 40, y: GROUND_Y - 5 },
  }),
  g({
    head: { x: c1 - 15, y: 90 },
    neck: { x: c1 - 5, y: 105 },
    hip: { x: c1 + 25, y: 120 },
    side: true,
    leftShoulder: { x: c1, y: 110 },
    leftElbow: { x: c1 - 5, y: 155 },
    leftHand: { x: c1, y: GROUND_Y },
    rightHand: { x: c1 + 25, y: 80 },
    leftFoot: { x: c1 + 55, y: GROUND_Y },
    rightFoot: { x: c1 + 50, y: GROUND_Y - 5 },
  }),
  redArrow(c1 + 25, 145, c1 + 25, 120, 'hips'),
  g({
    head: { x: c2 - 15, y: 90 },
    neck: { x: c2 - 5, y: 105 },
    hip: { x: c2 + 25, y: 120 },
    side: true,
    leftShoulder: { x: c2, y: 110 },
    leftElbow: { x: c2 - 5, y: 155 },
    leftHand: { x: c2, y: GROUND_Y },
    rightHand: { x: c2 + 25, y: 80 },
    leftFoot: { x: c2 + 55, y: GROUND_Y },
    rightFoot: { x: c2 + 50, y: GROUND_Y - 5 },
  }),
  redDot(c2 + 25, 120, 'line'),
]);

write('mountain-climbers', 'Mountain climbers form diagram', 'Mountain climbers: plank, drive, switch', ['PLANK', 'DRIVE', 'SWITCH'], [
  g(plankAthlete(c0, { lowered: false })),
  g({
    ...plankAthlete(c1, { lowered: false }),
    leftKnee: { x: c1 + 5, y: 155 },
    leftFoot: { x: c1 + 10, y: GROUND_Y - 5 },
  }),
  redArrow(c1 - 20, 150, c1 + 5, 155, 'knee'),
  g({
    ...plankAthlete(c2, { lowered: false }),
    rightKnee: { x: c2 + 5, y: 155 },
    rightFoot: { x: c2 + 10, y: GROUND_Y - 5 },
  }),
]);

write('pike-pushup', 'Pike push-up form diagram', 'Pike push-up: pike, lower, press', ['PIKE', 'LOWER', 'PRESS'], [
  g({
    head: { x: c0 + 25, y: 110 },
    neck: { x: c0 + 15, y: 100 },
    hip: { x: c0 - 5, y: 75 },
    side: true,
    leftShoulder: { x: c0 + 12, y: 105 },
    leftHand: { x: c0 + 30, y: GROUND_Y - 5 },
    rightHand: { x: c0 + 22, y: GROUND_Y - 5 },
    leftFoot: { x: c0 - 35, y: GROUND_Y - 5 },
    rightFoot: { x: c0 - 28, y: GROUND_Y - 5 },
  }),
  redDot(c0 - 5, 75, 'hips high'),
  g({
    head: { x: c1 + 30, y: 140 },
    neck: { x: c1 + 18, y: 125 },
    hip: { x: c1 - 5, y: 80 },
    side: true,
    leftShoulder: { x: c1 + 15, y: 128 },
    leftHand: { x: c1 + 32, y: GROUND_Y - 5 },
    rightHand: { x: c1 + 24, y: GROUND_Y - 5 },
    leftFoot: { x: c1 - 35, y: GROUND_Y - 5 },
    rightFoot: { x: c1 - 28, y: GROUND_Y - 5 },
  }),
  redArrow(c1 + 20, 110, c1 + 20, 135, 'head'),
  g({
    head: { x: c2 + 25, y: 110 },
    neck: { x: c2 + 15, y: 100 },
    hip: { x: c2 - 5, y: 75 },
    side: true,
    leftShoulder: { x: c2 + 12, y: 105 },
    leftHand: { x: c2 + 30, y: GROUND_Y - 5 },
    rightHand: { x: c2 + 22, y: GROUND_Y - 5 },
    leftFoot: { x: c2 - 35, y: GROUND_Y - 5 },
    rightFoot: { x: c2 - 28, y: GROUND_Y - 5 },
  }),
  redArrow(c2 + 20, 135, c2 + 20, 105, 'press'),
]);

write('wall-sit', 'Wall sit form diagram', 'Wall sit: setup, sit, hold', ['SETUP', 'SIT', 'HOLD'], [
  `  <line x1="${c0 - 35}" y1="50" x2="${c0 - 35}" y2="${GROUND_Y}" stroke="${INK}" stroke-width="2"></line>`,
  g(sideAthlete(c0, { depth: 0.7, leanDeg: -5, arms: 'down' })),
  `  <line x1="${c1 - 35}" y1="50" x2="${c1 - 35}" y2="${GROUND_Y}" stroke="${INK}" stroke-width="2"></line>`,
  g(sideAthlete(c1, { depth: 0.85, leanDeg: -5, arms: 'down' })),
  redDot(c1, 145, '90°'),
  `  <line x1="${c2 - 35}" y1="50" x2="${c2 - 35}" y2="${GROUND_Y}" stroke="${INK}" stroke-width="2"></line>`,
  g(sideAthlete(c2, { depth: 0.85, leanDeg: -5, arms: 'down' })),
  redDot(c2, 145, 'hold'),
]);

write('dips-chair', 'Chair dip form diagram', 'Chair dip: support, lower, press', ['SUPPORT', 'LOWER', 'PRESS'], [
  `  <rect x="${c0 - 15}" y="110" width="45" height="10" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c0 - 5, y: 75 },
    neck: { x: c0 - 5, y: 90 },
    hip: { x: c0 + 15, y: 125 },
    side: true,
    leftShoulder: { x: c0 - 2, y: 95 },
    leftHand: { x: c0 + 5, y: 115 },
    rightHand: { x: c0 + 15, y: 115 },
    leftFoot: { x: c0 + 45, y: GROUND_Y - 10 },
    rightFoot: { x: c0 + 50, y: GROUND_Y - 10 },
  }),
  `  <rect x="${c1 - 15}" y="110" width="45" height="10" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c1 - 5, y: 95 },
    neck: { x: c1 - 5, y: 110 },
    hip: { x: c1 + 20, y: 150 },
    side: true,
    leftShoulder: { x: c1 - 2, y: 115 },
    leftHand: { x: c1 + 5, y: 115 },
    rightHand: { x: c1 + 15, y: 115 },
    leftFoot: { x: c1 + 50, y: GROUND_Y - 10 },
    rightFoot: { x: c1 + 55, y: GROUND_Y - 10 },
  }),
  redArrow(c1 + 25, 105, c1 + 25, 135, 'bend'),
  `  <rect x="${c2 - 15}" y="110" width="45" height="10" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c2 - 5, y: 75 },
    neck: { x: c2 - 5, y: 90 },
    hip: { x: c2 + 15, y: 125 },
    side: true,
    leftShoulder: { x: c2 - 2, y: 95 },
    leftHand: { x: c2 + 5, y: 115 },
    rightHand: { x: c2 + 15, y: 115 },
    leftFoot: { x: c2 + 45, y: GROUND_Y - 10 },
    rightFoot: { x: c2 + 50, y: GROUND_Y - 10 },
  }),
  redArrow(c2 + 25, 145, c2 + 25, 120, ''),
]);

write('step-ups', 'Step-up form diagram', 'Step-up: plant, drive, stand', ['PLANT', 'DRIVE', 'STAND'], [
  `  <rect x="${c0 + 15}" y="125" width="40" height="50" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    ...sideAthlete(c0, { depth: 0.2, leanDeg: 5, arms: 'down' }),
    rightKnee: { x: c0 + 25, y: 130 },
    rightFoot: { x: c0 + 30, y: 125 },
  }),
  redDot(c0 + 30, 125, 'box'),
  `  <rect x="${c1 + 15}" y="125" width="40" height="50" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c1, y: 55 },
    neck: { x: c1, y: 70 },
    hip: { x: c1, y: 100 },
    side: true,
    leftShoulder: { x: c1, y: 75 },
    leftHand: { x: c1 - 12, y: 95 },
    rightHand: { x: c1 + 12, y: 95 },
    leftFoot: { x: c1 - 10, y: 125 },
    rightFoot: { x: c1 + 25, y: 125 },
  }),
  redArrow(c1, 150, c1, 115, 'drive'),
  `  <rect x="${c2 + 5}" y="125" width="50" height="50" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c2 + 15, y: 50 },
    neck: { x: c2 + 15, y: 65 },
    hip: { x: c2 + 15, y: 95 },
    side: true,
    leftShoulder: { x: c2 + 15, y: 70 },
    leftFoot: { x: c2 + 5, y: 125 },
    rightFoot: { x: c2 + 30, y: 125 },
    leftHand: { x: c2 + 5, y: 90 },
    rightHand: { x: c2 + 25, y: 90 },
  }),
  redDot(c2 + 15, 95, 'tall'),
]);

// T1 remaining with clear poses
const t1Simple = {
  'dead-bug': () => [
    g({
      head: { x: c0, y: 100 },
      neck: { x: c0, y: 115 },
      hip: { x: c0, y: 150 },
      leftShoulder: { x: c0 - 14, y: 120 },
      rightShoulder: { x: c0 + 14, y: 120 },
      leftHand: { x: c0 - 35, y: 125 },
      rightHand: { x: c0 + 35, y: 125 },
      leftKnee: { x: c0 - 20, y: 165 },
      rightKnee: { x: c0 + 20, y: 165 },
      leftFoot: { x: c0 - 30, y: GROUND_Y },
      rightFoot: { x: c0 + 30, y: GROUND_Y },
    }),
    redDot(c0, 150, 'ribs'),
    g({
      head: { x: c1, y: 100 },
      neck: { x: c1, y: 115 },
      hip: { x: c1, y: 150 },
      leftShoulder: { x: c1 - 14, y: 120 },
      rightShoulder: { x: c1 + 14, y: 120 },
      leftHand: { x: c1 - 40, y: 105 },
      rightHand: { x: c1 + 20, y: 160 },
      leftKnee: { x: c1 - 15, y: 165 },
      rightFoot: { x: c1 + 40, y: GROUND_Y },
      leftFoot: { x: c1 - 25, y: GROUND_Y },
    }),
    g({
      head: { x: c2, y: 100 },
      neck: { x: c2, y: 115 },
      hip: { x: c2, y: 150 },
      leftShoulder: { x: c2 - 14, y: 120 },
      rightShoulder: { x: c2 + 14, y: 120 },
      rightHand: { x: c2 + 40, y: 105 },
      leftHand: { x: c2 - 20, y: 160 },
      rightKnee: { x: c2 + 15, y: 165 },
      leftFoot: { x: c2 - 40, y: GROUND_Y },
      rightFoot: { x: c2 + 25, y: GROUND_Y },
    }),
  ],
  thruster: () => [
    g(sideAthlete(c0, { depth: 0.85, leanDeg: 8, arms: 'rack' })),
    bar(c0 - 16, 95, c0 + 20),
    redDot(c0, 145, 'rack'),
    g(sideAthlete(c1, { depth: 0.2, leanDeg: 0, arms: 'overhead' })),
    bar(c1 - 14, 48, c1 + 14),
    redArrow(c1, 150, c1, 115, 'up'),
    g(sideAthlete(c2, { depth: 0, leanDeg: 0, arms: 'overhead' })),
    bar(c2 - 14, 42, c2 + 14),
    redDot(c2, 42, 'lock'),
  ],
  'cable-row': () => [
    g(sideAthlete(c0, { depth: 0, leanDeg: 15, arms: 'forward' })),
    bar(c0 + 35, 100, c0 + 55),
    g(sideAthlete(c1, { depth: 0, leanDeg: 10, arms: 'down' })),
    g({
      ...sideAthlete(c1, { depth: 0, leanDeg: 10, arms: 'down' }),
      leftElbow: { x: c1 - 5, y: 100 },
      leftHand: { x: c1 + 5, y: 105 },
      rightElbow: { x: c1 + 5, y: 105 },
      rightHand: { x: c1 + 15, y: 108 },
    }),
    redArrow(c1 + 40, 120, c1 + 15, 105, 'ribs'),
    g(sideAthlete(c2, { depth: 0, leanDeg: 15, arms: 'forward' })),
    bar(c2 + 35, 100, c2 + 55),
  ],
  'hanging-leg-raise': () => [
    bar(c0 - 28, 48, c0 + 28),
    g({
      head: { x: c0, y: 72 },
      neck: { x: c0, y: 85 },
      hip: { x: c0, y: 125 },
      leftShoulder: { x: c0 - 12, y: 90 },
      rightShoulder: { x: c0 + 12, y: 90 },
      leftHand: { x: c0 - 18, y: 52 },
      rightHand: { x: c0 + 18, y: 52 },
      leftFoot: { x: c0 - 8, y: GROUND_Y },
      rightFoot: { x: c0 + 8, y: GROUND_Y },
    }),
    bar(c1 - 28, 48, c1 + 28),
    g({
      head: { x: c1, y: 72 },
      neck: { x: c1, y: 85 },
      hip: { x: c1, y: 120 },
      leftShoulder: { x: c1 - 12, y: 90 },
      rightShoulder: { x: c1 + 12, y: 90 },
      leftHand: { x: c1 - 18, y: 52 },
      rightHand: { x: c1 + 18, y: 52 },
      leftKnee: { x: c1 - 20, y: 145 },
      rightKnee: { x: c1 + 20, y: 145 },
      leftFoot: { x: c1 - 25, y: 130 },
      rightFoot: { x: c1 + 25, y: 130 },
    }),
    redArrow(c1, 165, c1, 135, 'legs'),
    bar(c2 - 28, 48, c2 + 28),
    g({
      head: { x: c2, y: 72 },
      neck: { x: c2, y: 85 },
      hip: { x: c2, y: 125 },
      leftShoulder: { x: c2 - 12, y: 90 },
      rightShoulder: { x: c2 + 12, y: 90 },
      leftHand: { x: c2 - 18, y: 52 },
      rightHand: { x: c2 + 18, y: 52 },
      leftFoot: { x: c2 - 8, y: 165 },
      rightFoot: { x: c2 + 8, y: 165 },
    }),
  ],
  'box-jump': () => [
    `  <rect x="${c0 + 25}" y="130" width="40" height="45" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
    g(sideAthlete(c0, { depth: 0.6, leanDeg: 10, arms: 'down' })),
    redDot(c0, 140, 'load'),
    `  <rect x="${c1 + 30}" y="130" width="40" height="45" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
    g({
      ...sideAthlete(c1, { depth: 0, leanDeg: 0, arms: 'overhead' }),
      leftFoot: { x: c1 - 12, y: 140 },
      rightFoot: { x: c1 + 12, y: 140 },
    }),
    redArrow(c1, 165, c1, 130, 'up'),
    `  <rect x="${c2 + 5}" y="130" width="50" height="45" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
    g({
      head: { x: c2 + 20, y: 55 },
      neck: { x: c2 + 20, y: 70 },
      hip: { x: c2 + 20, y: 100 },
      side: true,
      leftShoulder: { x: c2 + 20, y: 75 },
      leftKnee: { x: c2 + 12, y: 120 },
      rightKnee: { x: c2 + 28, y: 120 },
      leftFoot: { x: c2 + 10, y: 130 },
      rightFoot: { x: c2 + 32, y: 130 },
      leftHand: { x: c2 + 8, y: 90 },
      rightHand: { x: c2 + 32, y: 90 },
    }),
    redDot(c2 + 20, 130, 'soft'),
  ],
};

for (const [id, fn] of Object.entries(t1Simple)) {
  const titles = {
    'dead-bug': ['SETUP', 'EXTEND', 'SWITCH'],
    thruster: ['SQUAT', 'DRIVE', 'LOCK'],
    'cable-row': ['REACH', 'PULL', 'RETURN'],
    'hanging-leg-raise': ['HANG', 'RAISE', 'LOWER'],
    'box-jump': ['LOAD', 'JUMP', 'LAND'],
  };
  write(id, `${id} form diagram`, `${id} form phases`, titles[id], fn());
}

// Remaining T1 as clear front/side templates
const rest = [
  ['skull-crusher', ['START', 'BEND', 'EXTEND'], () => [
    `  <rect x="${c0 - 35}" y="140" width="70" height="10" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
    g({
      head: { x: c0 - 25, y: 120 },
      neck: { x: c0 - 15, y: 130 },
      hip: { x: c0 + 20, y: 145 },
      side: true,
      leftShoulder: { x: c0 - 8, y: 128 },
      leftElbow: { x: c0 - 5, y: 95 },
      leftHand: { x: c0, y: 72 },
      rightElbow: { x: c0 + 10, y: 95 },
      rightHand: { x: c0 + 15, y: 72 },
      leftFoot: { x: c0 + 30, y: GROUND_Y },
      rightFoot: { x: c0 + 40, y: GROUND_Y },
    }),
    bar(c0 - 10, 70, c0 + 30),
    `  <rect x="${c1 - 35}" y="140" width="70" height="10" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
    g({
      head: { x: c1 - 25, y: 120 },
      neck: { x: c1 - 15, y: 130 },
      hip: { x: c1 + 20, y: 145 },
      side: true,
      leftShoulder: { x: c1 - 8, y: 128 },
      leftElbow: { x: c1 - 5, y: 100 },
      leftHand: { x: c1 - 15, y: 115 },
      rightElbow: { x: c1 + 10, y: 100 },
      rightHand: { x: c1 + 20, y: 115 },
      leftFoot: { x: c1 + 30, y: GROUND_Y },
      rightFoot: { x: c1 + 40, y: GROUND_Y },
    }),
    bar(c1 - 20, 115, c1 + 30),
    redArrow(c1 + 40, 80, c1 + 40, 110, ''),
    `  <rect x="${c2 - 35}" y="140" width="70" height="10" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
    g({
      head: { x: c2 - 25, y: 120 },
      neck: { x: c2 - 15, y: 130 },
      hip: { x: c2 + 20, y: 145 },
      side: true,
      leftShoulder: { x: c2 - 8, y: 128 },
      leftElbow: { x: c2 - 5, y: 95 },
      leftHand: { x: c2, y: 72 },
      rightElbow: { x: c2 + 10, y: 95 },
      rightHand: { x: c2 + 15, y: 72 },
      leftFoot: { x: c2 + 30, y: GROUND_Y },
      rightFoot: { x: c2 + 40, y: GROUND_Y },
    }),
    bar(c2 - 10, 70, c2 + 30),
  ]],
  ['calf-raise', ['FLAT', 'RISE', 'LOWER'], () => [
    g(frontAthlete(c0, { arms: 'down' })),
    redDot(c0, GROUND_Y, 'full foot'),
    g({
      ...frontAthlete(c1, { arms: 'down' }),
      leftFoot: { x: c1 - 14, y: 165 },
      rightFoot: { x: c1 + 14, y: 165 },
    }),
    redDot(c1, 165, 'toes'),
    g(frontAthlete(c2, { arms: 'down' })),
  ]],
  ['leg-press', ['START', 'BEND', 'PRESS'], () => [
    `  <rect x="${c0 - 30}" y="100" width="50" height="50" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
    g(sideAthlete(c0 + 5, { depth: 0.2, leanDeg: -20, arms: 'down' })),
    `  <rect x="${c0 + 40}" y="100" width="18" height="40" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
    `  <rect x="${c1 - 30}" y="100" width="50" height="50" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
    g(sideAthlete(c1 + 5, { depth: 0.7, leanDeg: -15, arms: 'down' })),
    `  <rect x="${c1 + 40}" y="120" width="18" height="40" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
    redArrow(c1 + 55, 110, c1 + 55, 140, ''),
    `  <rect x="${c2 - 30}" y="100" width="50" height="50" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
    g(sideAthlete(c2 + 5, { depth: 0.2, leanDeg: -20, arms: 'down' })),
    `  <rect x="${c2 + 40}" y="100" width="18" height="40" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
    redArrow(c2 + 55, 145, c2 + 55, 115, 'press'),
  ]],
  ['superman', ['PRONE', 'LIFT', 'HOLD'], () => [
    g({
      head: { x: c0 + 40, y: 140 },
      neck: { x: c0 + 28, y: 145 },
      hip: { x: c0 - 10, y: 150 },
      side: true,
      leftShoulder: { x: c0 + 25, y: 148 },
      leftHand: { x: c0 + 50, y: 152 },
      leftFoot: { x: c0 - 40, y: 155 },
      rightFoot: { x: c0 - 35, y: 158 },
    }),
    g({
      head: { x: c1 + 40, y: 120 },
      neck: { x: c1 + 28, y: 128 },
      hip: { x: c1 - 10, y: 135 },
      side: true,
      leftShoulder: { x: c1 + 25, y: 130 },
      leftHand: { x: c1 + 55, y: 115 },
      leftFoot: { x: c1 - 40, y: 125 },
      rightFoot: { x: c1 - 35, y: 135 },
    }),
    redArrow(c1 - 10, 155, c1 - 10, 135, ''),
    g({
      head: { x: c2 + 40, y: 120 },
      neck: { x: c2 + 28, y: 128 },
      hip: { x: c2 - 10, y: 135 },
      side: true,
      leftShoulder: { x: c2 + 25, y: 130 },
      leftHand: { x: c2 + 55, y: 115 },
      leftFoot: { x: c2 - 40, y: 125 },
      rightFoot: { x: c2 - 35, y: 135 },
    }),
    redDot(c2 - 10, 135, 'squeeze'),
  ]],
  ['negative-pullup', ['TOP', 'LOWER', 'HANG'], () => [
    bar(c0 - 28, 48, c0 + 28),
    g({
      head: { x: c0, y: 68 },
      neck: { x: c0, y: 80 },
      hip: { x: c0, y: 115 },
      leftShoulder: { x: c0 - 14, y: 86 },
      rightShoulder: { x: c0 + 14, y: 86 },
      leftElbow: { x: c0 - 22, y: 65 },
      rightElbow: { x: c0 + 22, y: 65 },
      leftHand: { x: c0 - 16, y: 52 },
      rightHand: { x: c0 + 16, y: 52 },
      leftFoot: { x: c0 - 8, y: 155 },
      rightFoot: { x: c0 + 8, y: 155 },
    }),
    redDot(c0, 52, 'chin over'),
    bar(c1 - 28, 48, c1 + 28),
    g({
      head: { x: c1, y: 85 },
      neck: { x: c1, y: 98 },
      hip: { x: c1, y: 135 },
      leftShoulder: { x: c1 - 14, y: 102 },
      rightShoulder: { x: c1 + 14, y: 102 },
      leftElbow: { x: c1 - 22, y: 75 },
      rightElbow: { x: c1 + 22, y: 75 },
      leftHand: { x: c1 - 18, y: 52 },
      rightHand: { x: c1 + 18, y: 52 },
      leftFoot: { x: c1 - 8, y: 165 },
      rightFoot: { x: c1 + 8, y: 165 },
    }),
    redArrow(c1 + 32, 70, c1 + 32, 105, 'slow'),
    bar(c2 - 28, 48, c2 + 28),
    g({
      head: { x: c2, y: 100 },
      neck: { x: c2, y: 112 },
      hip: { x: c2, y: 150 },
      leftShoulder: { x: c2 - 14, y: 116 },
      rightShoulder: { x: c2 + 14, y: 116 },
      leftElbow: { x: c2 - 22, y: 85 },
      rightElbow: { x: c2 + 22, y: 85 },
      leftHand: { x: c2 - 20, y: 52 },
      rightHand: { x: c2 + 20, y: 52 },
      leftFoot: { x: c2 - 8, y: GROUND_Y },
      rightFoot: { x: c2 + 8, y: GROUND_Y },
    }),
    redDot(c2, 150, 'hang'),
  ]],
  ['crunches', ['SETUP', 'CURL', 'LOWER'], () => [
    g({
      head: { x: c0 - 15, y: 125 },
      neck: { x: c0 - 5, y: 135 },
      hip: { x: c0 + 20, y: 155 },
      side: true,
      leftShoulder: { x: c0, y: 138 },
      leftHand: { x: c0 - 10, y: 120 },
      leftKnee: { x: c0 + 40, y: 155 },
      leftFoot: { x: c0 + 50, y: GROUND_Y },
      rightFoot: { x: c0 + 45, y: GROUND_Y },
    }),
    g({
      head: { x: c1 - 10, y: 105 },
      neck: { x: c1, y: 118 },
      hip: { x: c1 + 25, y: 155 },
      side: true,
      leftShoulder: { x: c1 + 5, y: 122 },
      leftHand: { x: c1 - 5, y: 105 },
      leftKnee: { x: c1 + 45, y: 155 },
      leftFoot: { x: c1 + 55, y: GROUND_Y },
      rightFoot: { x: c1 + 50, y: GROUND_Y },
    }),
    redArrow(c1 - 5, 130, c1 - 5, 110, 'ribs'),
    g({
      head: { x: c2 - 15, y: 125 },
      neck: { x: c2 - 5, y: 135 },
      hip: { x: c2 + 20, y: 155 },
      side: true,
      leftShoulder: { x: c2, y: 138 },
      leftHand: { x: c2 - 10, y: 120 },
      leftKnee: { x: c2 + 40, y: 155 },
      leftFoot: { x: c2 + 50, y: GROUND_Y },
      rightFoot: { x: c2 + 45, y: GROUND_Y },
    }),
  ]],
  ['lat-pulldown', ['REACH', 'PULL', 'RETURN'], () => [
    bar(c0 - 30, 48, c0 + 30),
    g(frontAthlete(c0, { arms: 'overhead' })),
    g({
      head: { x: c1, y: 70 },
      neck: { x: c1, y: 84 },
      hip: { x: c1, y: 130 },
      leftShoulder: { x: c1 - 16, y: 90 },
      rightShoulder: { x: c1 + 16, y: 90 },
      leftElbow: { x: c1 - 28, y: 105 },
      rightElbow: { x: c1 + 28, y: 105 },
      leftHand: { x: c1 - 20, y: 85 },
      rightHand: { x: c1 + 20, y: 85 },
      leftKnee: { x: c1 - 12, y: 155 },
      rightKnee: { x: c1 + 12, y: 155 },
      leftFoot: { x: c1 - 14, y: GROUND_Y },
      rightFoot: { x: c1 + 14, y: GROUND_Y },
    }),
    bar(c1 - 28, 82, c1 + 28),
    redArrow(c1 + 40, 70, c1 + 40, 100, 'pull'),
    bar(c2 - 30, 48, c2 + 30),
    g(frontAthlete(c2, { arms: 'overhead' })),
  ]],
];

for (const [id, labels, fn] of rest) {
  write(id, `${id} form diagram`, `${id} form`, labels, fn());
}

// Mobility pack
const mobility = [
  ['cat-camel', ['NEUTRAL', 'CAT', 'CAMEL']],
  ['couch-stretch', ['SETUP', 'UPRIGHT', 'HOLD']],
  ['bear-crawl', ['HOVER', 'STEP', 'ADVANCE']],
  ['inchworm', ['STAND', 'WALK OUT', 'WALK IN']],
  ['single-leg-glute', ['SETUP', 'DRIVE', 'LOWER']],
  ['wall-angels', ['CONTACT', 'SLIDE UP', 'RETURN']],
  ['thread-needle', ['SETUP', 'THREAD', 'OPEN']],
  ['frog-pose', ['WIDE', 'SETTLE', 'HOLD']],
  ['sled-push', ['LEAN', 'DRIVE', 'FINISH']],
];

// Use side athlete variants for remaining mobility
write('cat-camel', 'Cat-camel form diagram', 'Cat-camel: neutral, round, arch', ['NEUTRAL', 'CAT', 'CAMEL'], [
  g({ head: { x: c0 + 20, y: 105 }, neck: { x: c0 + 10, y: 115 }, hip: { x: c0 - 15, y: 130 }, side: true, leftShoulder: { x: c0 + 8, y: 118 }, leftHand: { x: c0 + 28, y: GROUND_Y - 5 }, rightHand: { x: c0 + 12, y: GROUND_Y - 5 }, leftKnee: { x: c0 - 20, y: GROUND_Y - 15 }, rightKnee: { x: c0 - 8, y: GROUND_Y - 15 }, leftFoot: { x: c0 - 32, y: GROUND_Y }, rightFoot: { x: c0 - 20, y: GROUND_Y } }),
  redDot(c0 - 15, 130, 'neutral'),
  g({ head: { x: c1 + 22, y: 120 }, neck: { x: c1 + 12, y: 110 }, hip: { x: c1 - 12, y: 100 }, side: true, leftShoulder: { x: c1 + 10, y: 115 }, leftHand: { x: c1 + 30, y: GROUND_Y - 5 }, rightHand: { x: c1 + 14, y: GROUND_Y - 5 }, leftKnee: { x: c1 - 18, y: GROUND_Y - 15 }, rightKnee: { x: c1 - 6, y: GROUND_Y - 15 }, leftFoot: { x: c1 - 30, y: GROUND_Y }, rightFoot: { x: c1 - 18, y: GROUND_Y } }),
  redDot(c1 - 12, 100, 'round'),
  g({ head: { x: c2 + 22, y: 100 }, neck: { x: c2 + 12, y: 115 }, hip: { x: c2 - 12, y: 140 }, side: true, leftShoulder: { x: c2 + 10, y: 118 }, leftHand: { x: c2 + 30, y: GROUND_Y - 5 }, rightHand: { x: c2 + 14, y: GROUND_Y - 5 }, leftKnee: { x: c2 - 18, y: GROUND_Y - 15 }, rightKnee: { x: c2 - 6, y: GROUND_Y - 15 }, leftFoot: { x: c2 - 30, y: GROUND_Y }, rightFoot: { x: c2 - 18, y: GROUND_Y } }),
  redDot(c2 - 12, 140, 'arch'),
]);

write('couch-stretch', 'Couch stretch form diagram', 'Couch stretch: setup, upright, hold', ['SETUP', 'UPRIGHT', 'HOLD'], [
  `  <rect x="${c0 + 15}" y="100" width="35" height="75" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({ head: { x: c0 - 10, y: 80 }, neck: { x: c0 - 5, y: 95 }, hip: { x: c0 + 5, y: 130 }, side: true, leftShoulder: { x: c0, y: 100 }, leftKnee: { x: c0 + 25, y: 150 }, leftFoot: { x: c0 + 40, y: 120 }, rightKnee: { x: c0 - 5, y: 155 }, rightFoot: { x: c0 - 10, y: GROUND_Y }, leftHand: { x: c0 - 15, y: 120 }, rightHand: { x: c0 + 10, y: 120 } }),
  `  <rect x="${c1 + 15}" y="100" width="35" height="75" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({ head: { x: c1 - 10, y: 60 }, neck: { x: c1 - 5, y: 75 }, hip: { x: c1 + 5, y: 120 }, side: true, leftShoulder: { x: c1, y: 80 }, leftKnee: { x: c1 + 25, y: 150 }, leftFoot: { x: c1 + 40, y: 120 }, rightKnee: { x: c1 - 10, y: 150 }, rightFoot: { x: c1 - 15, y: GROUND_Y }, leftHand: { x: c1 - 12, y: 100 }, rightHand: { x: c1 + 8, y: 100 } }),
  redDot(c1 - 5, 60, 'tall'),
  `  <rect x="${c2 + 15}" y="100" width="35" height="75" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({ head: { x: c2 - 10, y: 60 }, neck: { x: c2 - 5, y: 75 }, hip: { x: c2 + 5, y: 120 }, side: true, leftShoulder: { x: c2, y: 80 }, leftKnee: { x: c2 + 25, y: 150 }, leftFoot: { x: c2 + 40, y: 120 }, rightKnee: { x: c2 - 10, y: 150 }, rightFoot: { x: c2 - 15, y: GROUND_Y }, leftHand: { x: c2 - 12, y: 100 }, rightHand: { x: c2 + 8, y: 100 } }),
  redDot(c2 + 5, 120, 'breathe'),
]);

write('bear-crawl', 'Bear crawl form diagram', 'Bear crawl: hover, step, advance', ['HOVER', 'STEP', 'ADVANCE'], [
  g({ head: { x: c0 + 25, y: 100 }, neck: { x: c0 + 15, y: 112 }, hip: { x: c0 - 10, y: 125 }, side: true, leftShoulder: { x: c0 + 12, y: 115 }, leftHand: { x: c0 + 30, y: GROUND_Y - 5 }, rightHand: { x: c0 + 10, y: GROUND_Y - 5 }, leftKnee: { x: c0 - 15, y: 145 }, rightKnee: { x: c0 - 5, y: 145 }, leftFoot: { x: c0 - 28, y: 160 }, rightFoot: { x: c0 - 12, y: 160 } }),
  redDot(c0 - 10, 145, 'knees off'),
  g({ head: { x: c1 + 30, y: 100 }, neck: { x: c1 + 18, y: 112 }, hip: { x: c1 - 5, y: 125 }, side: true, leftShoulder: { x: c1 + 15, y: 115 }, leftHand: { x: c1 + 40, y: GROUND_Y - 5 }, rightHand: { x: c1 + 8, y: GROUND_Y - 5 }, leftKnee: { x: c1 - 20, y: 145 }, rightFoot: { x: c1 - 5, y: 160 }, leftFoot: { x: c1 - 30, y: 160 } }),
  redArrow(c1 + 25, 140, c1 + 40, 155, ''),
  g({ head: { x: c2 + 30, y: 100 }, neck: { x: c2 + 18, y: 112 }, hip: { x: c2 - 5, y: 125 }, side: true, leftShoulder: { x: c2 + 15, y: 115 }, leftHand: { x: c2 + 35, y: GROUND_Y - 5 }, rightHand: { x: c2 + 15, y: GROUND_Y - 5 }, rightKnee: { x: c2 - 20, y: 145 }, leftFoot: { x: c2 - 5, y: 160 }, rightFoot: { x: c2 - 30, y: 160 } }),
  redArrow(c2, 130, c2 + 15, 125, 'crawl'),
]);

write('inchworm', 'Inchworm form diagram', 'Inchworm: stand, walk out, walk in', ['STAND', 'WALK OUT', 'WALK IN'], [
  g(sideAthlete(c0, { depth: 0, leanDeg: 0, arms: 'down' })),
  g({ head: { x: c1 + 40, y: 110 }, neck: { x: c1 + 28, y: 115 }, hip: { x: c1 - 15, y: 130 }, side: true, leftShoulder: { x: c1 + 25, y: 118 }, leftHand: { x: c1 + 50, y: GROUND_Y - 5 }, rightHand: { x: c1 + 42, y: GROUND_Y - 5 }, leftFoot: { x: c1 - 30, y: GROUND_Y }, rightFoot: { x: c1 - 22, y: GROUND_Y } }),
  redArrow(c1 + 20, 140, c1 + 45, 155, 'hands'),
  g({ head: { x: c2 + 30, y: 95 }, neck: { x: c2 + 18, y: 105 }, hip: { x: c2 - 5, y: 120 }, side: true, leftShoulder: { x: c2 + 15, y: 108 }, leftHand: { x: c2 + 40, y: GROUND_Y - 5 }, rightHand: { x: c2 + 32, y: GROUND_Y - 5 }, leftFoot: { x: c2 - 15, y: GROUND_Y - 10 }, rightFoot: { x: c2 - 8, y: GROUND_Y - 10 } }),
  redArrow(c2 - 20, 160, c2 - 5, 150, 'feet'),
]);

write('single-leg-glute', 'Single-leg glute bridge form diagram', 'Single-leg bridge: setup, drive, lower', ['SETUP', 'DRIVE', 'LOWER'], [
  g({ head: { x: c0 - 20, y: 125 }, neck: { x: c0 - 10, y: 138 }, hip: { x: c0 + 15, y: 155 }, side: true, leftShoulder: { x: c0 - 8, y: 140 }, leftHand: { x: c0 - 25, y: GROUND_Y }, leftKnee: { x: c0 + 35, y: 155 }, leftFoot: { x: c0 + 45, y: GROUND_Y }, rightFoot: { x: c0 + 30, y: 140 } }),
  redDot(c0 + 15, 155, 'one leg'),
  g({ head: { x: c1 - 20, y: 115 }, neck: { x: c1 - 10, y: 128 }, hip: { x: c1 + 20, y: 128 }, side: true, leftShoulder: { x: c1 - 8, y: 130 }, leftHand: { x: c1 - 25, y: GROUND_Y }, leftKnee: { x: c1 + 40, y: 150 }, leftFoot: { x: c1 + 50, y: GROUND_Y }, rightFoot: { x: c1 + 35, y: 110 } }),
  redArrow(c1 + 15, 155, c1 + 15, 128, 'hips'),
  g({ head: { x: c2 - 20, y: 125 }, neck: { x: c2 - 10, y: 138 }, hip: { x: c2 + 15, y: 155 }, side: true, leftShoulder: { x: c2 - 8, y: 140 }, leftHand: { x: c2 - 25, y: GROUND_Y }, leftKnee: { x: c2 + 35, y: 155 }, leftFoot: { x: c2 + 45, y: GROUND_Y }, rightFoot: { x: c2 + 30, y: 140 } }),
]);

write('wall-angels', 'Wall angels form diagram', 'Wall angels: contact, slide up, return', ['CONTACT', 'SLIDE UP', 'RETURN'], [
  `  <line x1="${c0 - 30}" y1="50" x2="${c0 - 30}" y2="${GROUND_Y}" stroke="${INK}" stroke-width="2"></line>`,
  g(frontAthlete(c0, { arms: 'curl' })),
  redDot(c0 - 18, 100, 'wall'),
  `  <line x1="${c1 - 30}" y1="50" x2="${c1 - 30}" y2="${GROUND_Y}" stroke="${INK}" stroke-width="2"></line>`,
  g(frontAthlete(c1, { arms: 'overhead' })),
  redArrow(c1, 110, c1, 75, 'up'),
  `  <line x1="${c2 - 30}" y1="50" x2="${c2 - 30}" y2="${GROUND_Y}" stroke="${INK}" stroke-width="2"></line>`,
  g(frontAthlete(c2, { arms: 'curl' })),
  redArrow(c2, 75, c2, 105, ''),
]);

write('thread-needle', 'Thread the needle form diagram', 'Thread needle: setup, thread, open', ['SETUP', 'THREAD', 'OPEN'], [
  g({ head: { x: c0 + 22, y: 105 }, neck: { x: c0 + 12, y: 115 }, hip: { x: c0 - 12, y: 128 }, side: true, leftShoulder: { x: c0 + 10, y: 118 }, leftHand: { x: c0 + 28, y: GROUND_Y - 5 }, rightHand: { x: c0 + 8, y: GROUND_Y - 5 }, leftKnee: { x: c0 - 18, y: GROUND_Y - 15 }, rightKnee: { x: c0 - 5, y: GROUND_Y - 15 }, leftFoot: { x: c0 - 30, y: GROUND_Y }, rightFoot: { x: c0 - 15, y: GROUND_Y } }),
  g({ head: { x: c1 + 5, y: 145 }, neck: { x: c1, y: 135 }, hip: { x: c1 - 10, y: 130 }, side: true, leftShoulder: { x: c1 + 2, y: 138 }, leftHand: { x: c1 - 25, y: GROUND_Y - 5 }, rightHand: { x: c1 + 30, y: GROUND_Y - 5 }, leftKnee: { x: c1 - 15, y: GROUND_Y - 15 }, rightKnee: { x: c1 - 2, y: GROUND_Y - 15 }, leftFoot: { x: c1 - 28, y: GROUND_Y }, rightFoot: { x: c1 - 12, y: GROUND_Y } }),
  redArrow(c1 + 20, 140, c1 - 15, 155, 'under'),
  g({ head: { x: c2 + 15, y: 90 }, neck: { x: c2 + 8, y: 110 }, hip: { x: c2 - 10, y: 128 }, side: true, leftShoulder: { x: c2 + 5, y: 112 }, leftHand: { x: c2 + 35, y: 75 }, rightHand: { x: c2 - 5, y: GROUND_Y - 5 }, leftKnee: { x: c2 - 18, y: GROUND_Y - 15 }, rightKnee: { x: c2 - 5, y: GROUND_Y - 15 }, leftFoot: { x: c2 - 30, y: GROUND_Y }, rightFoot: { x: c2 - 15, y: GROUND_Y } }),
  redDot(c2 + 35, 75, 'open'),
]);

write('frog-pose', 'Frog pose form diagram', 'Frog pose: wide, settle, hold', ['WIDE', 'SETTLE', 'HOLD'], [
  g({ head: { x: c0, y: 100 }, neck: { x: c0, y: 115 }, hip: { x: c0, y: 145 }, leftShoulder: { x: c0 - 14, y: 120 }, rightShoulder: { x: c0 + 14, y: 120 }, leftElbow: { x: c0 - 20, y: 140 }, rightElbow: { x: c0 + 20, y: 140 }, leftHand: { x: c0 - 25, y: 155 }, rightHand: { x: c0 + 25, y: 155 }, leftKnee: { x: c0 - 40, y: 160 }, rightKnee: { x: c0 + 40, y: 160 }, leftFoot: { x: c0 - 45, y: GROUND_Y }, rightFoot: { x: c0 + 45, y: GROUND_Y } }),
  redDot(c0 - 40, 160, 'knees'),
  g({ head: { x: c1, y: 110 }, neck: { x: c1, y: 125 }, hip: { x: c1, y: 150 }, leftShoulder: { x: c1 - 14, y: 130 }, rightShoulder: { x: c1 + 14, y: 130 }, leftElbow: { x: c1 - 18, y: 148 }, rightElbow: { x: c1 + 18, y: 148 }, leftHand: { x: c1 - 22, y: 160 }, rightHand: { x: c1 + 22, y: 160 }, leftKnee: { x: c1 - 45, y: 162 }, rightKnee: { x: c1 + 45, y: 162 }, leftFoot: { x: c1 - 50, y: GROUND_Y }, rightFoot: { x: c1 + 50, y: GROUND_Y } }),
  redArrow(c1, 125, c1, 145, 'hips'),
  g({ head: { x: c2, y: 110 }, neck: { x: c2, y: 125 }, hip: { x: c2, y: 150 }, leftShoulder: { x: c2 - 14, y: 130 }, rightShoulder: { x: c2 + 14, y: 130 }, leftElbow: { x: c2 - 18, y: 148 }, rightElbow: { x: c2 + 18, y: 148 }, leftHand: { x: c2 - 22, y: 160 }, rightHand: { x: c2 + 22, y: 160 }, leftKnee: { x: c2 - 45, y: 162 }, rightKnee: { x: c2 + 45, y: 162 }, leftFoot: { x: c2 - 50, y: GROUND_Y }, rightFoot: { x: c2 + 50, y: GROUND_Y } }),
  redDot(c2, 150, 'breathe'),
]);

write('sled-push', 'Sled push form diagram', 'Sled push: lean, drive, finish', ['LEAN', 'DRIVE', 'FINISH'], [
  `  <rect x="${c0 + 20}" y="120" width="40" height="35" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g(sideAthlete(c0, { depth: 0.3, leanDeg: 40, arms: 'forward' })),
  redDot(c0, 130, 'lean'),
  `  <rect x="${c1 + 25}" y="120" width="40" height="35" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g(sideAthlete(c1, { depth: 0.35, leanDeg: 35, arms: 'forward' })),
  redArrow(c1 + 10, 155, c1 + 30, 140, 'drive'),
  `  <rect x="${c2 + 25}" y="120" width="40" height="35" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g(sideAthlete(c2, { depth: 0.2, leanDeg: 30, arms: 'forward' })),
  redDot(c2, 120, 'long'),
]);

console.log('Rebuilt all form guides with corrected geometry.');
