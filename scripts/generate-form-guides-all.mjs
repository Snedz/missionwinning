#!/usr/bin/env node
/**
 * Rebuild ALL instructional form SVGs with hand-tuned poses.
 * Run: npm run media:form-all
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  formGuideSvg,
  stickGroup,
  redDot,
  redArrow,
  equipmentBar,
  PHASE_CX,
  INK,
  GROUND_Y,
} from './form-kit/stickFigure.mjs';
import {
  posePlank,
  poseSquat,
  poseHinge,
  poseFront,
  poseHang,
} from './form-kit/poses.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'form-guides');
const [c0, c1, c2] = PHASE_CX;
const G = GROUND_Y;

function write(id, title, aria, labels, body) {
  writeFileSync(
    path.join(outDir, `${id}.svg`),
    formGuideSvg({ id, title, ariaLabel: aria, labels, body: body.join('\n') })
  );
  process.stdout.write(`${id} `);
}

const g = (p) => stickGroup(p);
const bar = (x1, y, x2) => equipmentBar(x1, y, x2, INK);

// ── Patterns ─────────────────────────────────────────────────────
write('pattern-squat', 'Squat pattern', 'Shared squat: stand, depth, drive', ['STAND', 'DEPTH', 'DRIVE'], [
  g(poseSquat(c0, { depth: 0 })),
  redDot(c0, 118, 'brace'),
  g(poseSquat(c1, { depth: 0.9 })),
  redDot(c1, 150, 'depth'),
  g(poseSquat(c2, { depth: 0 })),
  redArrow(c2, 155, c2, 125, 'drive'),
]);

write('pattern-hinge', 'Hinge pattern', 'Shared hinge: setup, hinge, lock', ['SETUP', 'HINGE', 'LOCK'], [
  g(poseHinge(c0, { lean: 0.15, barY: 135 })),
  bar(c0 - 20, 135, c0 + 22),
  g(poseHinge(c1, { lean: 0.7, barY: 168 })),
  bar(c1 - 12, 168, c1 + 28),
  redDot(c1, 128, 'hips'),
  g(poseHinge(c2, { lean: 0, barY: 125 })),
  bar(c2 - 22, 125, c2 + 22),
  redDot(c2, 118, 'lock'),
]);

// Pattern push = horizontal floor press silhouette (not standing OHP — that is overhead-press.svg).
write('pattern-push', 'Push pattern', 'Shared push: brace, press, lock', ['BRACE', 'PRESS', 'LOCK'], [
  g(posePlank(c0, { lowered: true })),
  redDot(c0 - 8, 160, 'brace'),
  g(posePlank(c1, { lowered: false })),
  redArrow(c1 + 22, 150, c1 + 22, 120, 'press'),
  g(posePlank(c2, { lowered: false })),
  redDot(c2 + 22, 128, 'lock'),
]);

// Pattern pull = hinged row (not vertical hang — that is pull-ups.svg).
write('pattern-pull', 'Pull pattern', 'Shared pull: set, pull, lower', ['SET', 'PULL', 'LOWER'], [
  g(poseHinge(c0, { lean: 0.6, barY: 160 })),
  bar(c0 - 8, 160, c0 + 28),
  redDot(c0, 128, 'brace'),
  g({
    ...poseHinge(c1, { lean: 0.55, barY: 125 }),
    leftElbow: { x: c1 + 6, y: 108 },
    rightElbow: { x: c1 + 12, y: 112 },
    leftHand: { x: c1 + 16, y: 125 },
    rightHand: { x: c1 + 24, y: 128 },
  }),
  bar(c1 + 6, 125, c1 + 38),
  redArrow(c1 + 42, 155, c1 + 42, 128, 'pull'),
  g(poseHinge(c2, { lean: 0.6, barY: 160 })),
  bar(c2 - 8, 160, c2 + 28),
]);

write('pattern-core', 'Core pattern', 'Shared core: brace, challenge, hold', ['BRACE', 'CHALLENGE', 'HOLD'], [
  g(posePlank(c0, { lowered: false })),
  redDot(c0 - 10, 130, 'brace'),
  g(posePlank(c1, { lowered: false })),
  redDot(c1 - 10, 130, 'line'),
  g(posePlank(c2, { lowered: false })),
  redDot(c2 - 10, 130, 'hold'),
]);

write('pattern-loco', 'Locomotion pattern', 'Shared loco: load, drive, recover', ['LOAD', 'DRIVE', 'RECOVER'], [
  g(poseSquat(c0, { depth: 0.45 })),
  g(poseSquat(c1, { depth: 0.1 })),
  redArrow(c1 - 5, 160, c1 + 20, 140, ''),
  g(poseSquat(c2, { depth: 0 })),
  redDot(c2, 118, 'reset'),
]);

// Pattern isolation uses a lateral raise arc (not curl — that is bicep-curl.svg).
write('pattern-isolation', 'Isolation pattern', 'Shared isolation: start, peak, return', ['START', 'PEAK', 'RETURN'], [
  g(poseFront(c0, { arms: 'down' })),
  redDot(c0, 100, 'still'),
  g(poseFront(c1, { arms: 'raise' })),
  redDot(c1 - 48, 82, 'peak'),
  g(poseFront(c2, { arms: 'down' })),
  redArrow(c2 + 28, 90, c2 + 28, 125, 'control'),
]);

// ── Core teaching set ────────────────────────────────────────────
write('push-ups', 'Push-up form diagram', 'Push-up: setup plank, mid lower, lockout', ['SETUP', 'MID', 'LOCKOUT'], [
  g(posePlank(c0, { lowered: false })),
  redDot(c0 + 24, 155, 'elbow'),
  g(posePlank(c1, { lowered: true })),
  redArrow(c1 + 20, 105, c1 + 20, 140, 'LOWER'),
  g(posePlank(c2, { lowered: false })),
  redArrow(c2 + 20, 150, c2 + 20, 115, 'PRESS'),
]);

write('air-squat', 'Air squat form diagram', 'Air squat: stand, depth, stand', ['STAND', 'DEPTH', 'STAND'], [
  g(poseSquat(c0, { depth: 0 })),
  g(poseSquat(c1, { depth: 0.95 })),
  redDot(c1, 152, 'depth'),
  g(poseSquat(c2, { depth: 0 })),
  redArrow(c2, 155, c2, 125, ''),
]);

write('squats', 'Squat form diagram', 'Squat: setup, depth, drive', ['SETUP', 'DEPTH', 'DRIVE'], [
  g(poseSquat(c0, { depth: 0, arms: 'rack' })),
  bar(c0 - 18, 72, c0 + 18),
  g(poseSquat(c1, { depth: 0.9, arms: 'rack' })),
  bar(c1 - 16, 100, c1 + 20),
  redDot(c1, 150, 'hips'),
  g(poseSquat(c2, { depth: 0, arms: 'rack' })),
  bar(c2 - 18, 72, c2 + 18),
  redArrow(c2, 155, c2, 125, 'drive'),
]);

write('front-squat', 'Front squat form diagram', 'Front squat: rack, depth, stand', ['RACK', 'DEPTH', 'STAND'], [
  g(poseSquat(c0, { depth: 0, arms: 'rack' })),
  bar(c0 - 16, 70, c0 + 16),
  redDot(c0, 72, 'rack'),
  g(poseSquat(c1, { depth: 0.9, arms: 'rack' })),
  bar(c1 - 14, 98, c1 + 18),
  redDot(c1, 150, 'upright'),
  g(poseSquat(c2, { depth: 0, arms: 'rack' })),
  bar(c2 - 16, 70, c2 + 16),
  redArrow(c2, 155, c2, 125, 'drive'),
]);

write('goblet-squat', 'Goblet squat form diagram', 'Goblet squat: hold, depth, stand', ['HOLD', 'DEPTH', 'STAND'], [
  g(poseFront(c0, { arms: 'curl' })),
  `  <rect x="${c0 - 6}" y="78" width="12" height="16" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  redDot(c0, 85, 'goblet'),
  g(poseFront(c1, { arms: 'curl' })),
  // deepen by shifting - use squat-like feet wider via manual hip - keep front with lower head
  g({
    ...poseFront(c1, { arms: 'curl' }),
    head: { x: c1, y: 78 },
    neck: { x: c1, y: 92 },
    hip: { x: c1, y: 145 },
    leftKnee: { x: c1 - 22, y: 160 },
    rightKnee: { x: c1 + 22, y: 160 },
    leftShoulder: { x: c1 - 16, y: 98 },
    rightShoulder: { x: c1 + 16, y: 98 },
    leftElbow: { x: c1 - 14, y: 125 },
    rightElbow: { x: c1 + 14, y: 125 },
    leftHand: { x: c1 - 8, y: 108 },
    rightHand: { x: c1 + 8, y: 108 },
  }),
  `  <rect x="${c1 - 6}" y="108" width="12" height="16" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  redDot(c1 - 22, 160, 'elbows in'),
  g(poseFront(c2, { arms: 'curl' })),
  `  <rect x="${c2 - 6}" y="78" width="12" height="16" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  redArrow(c2, 155, c2, 125, ''),
]);

write('deadlift', 'Deadlift form diagram', 'Deadlift: setup, pull, lockout', ['SETUP', 'PULL', 'LOCKOUT'], [
  g(poseHinge(c0, { lean: 0.65, barY: 170 })),
  bar(c0 - 18, 170, c0 + 26),
  redDot(c0, 128, 'hips'),
  g(poseHinge(c1, { lean: 0.3, barY: 145 })),
  bar(c1 - 16, 145, c1 + 24),
  redArrow(c1 + 30, 165, c1 + 30, 135, 'push floor'),
  g(poseHinge(c2, { lean: 0, barY: 122 })),
  bar(c2 - 22, 122, c2 + 22),
  redDot(c2, 118, 'lock'),
]);

write('romanian-deadlift', 'Romanian deadlift form diagram', 'RDL: stand, hinge, lockout', ['STAND', 'HINGE', 'LOCKOUT'], [
  g(poseHinge(c0, { lean: 0.05, barY: 128 })),
  bar(c0 - 20, 128, c0 + 20),
  g(poseHinge(c1, { lean: 0.75, barY: 165 })),
  bar(c1 - 12, 165, c1 + 28),
  redDot(c1, 128, 'hinge'),
  g(poseHinge(c2, { lean: 0.05, barY: 128 })),
  bar(c2 - 20, 128, c2 + 20),
]);

write('pull-ups', 'Pull-up form diagram', 'Pull-up: hang, pull, lower', ['HANG', 'PULL', 'LOWER'], [
  bar(c0 - 28, 48, c0 + 28),
  g(poseHang(c0, { chinOver: false })),
  redDot(c0, 50, 'dead hang'),
  bar(c1 - 28, 48, c1 + 28),
  g(poseHang(c1, { chinOver: true })),
  redArrow(c1 + 32, 120, c1 + 32, 72, 'pull'),
  redDot(c1, 58, 'chin'),
  bar(c2 - 28, 48, c2 + 28),
  g(poseHang(c2, { chinOver: false })),
  redArrow(c2 + 32, 70, c2 + 32, 115, 'lower'),
]);

write('negative-pullup', 'Negative pull-up form diagram', 'Negative: top, lower, hang', ['TOP', 'LOWER', 'HANG'], [
  bar(c0 - 28, 48, c0 + 28),
  g(poseHang(c0, { chinOver: true })),
  redDot(c0, 50, 'chin over'),
  bar(c1 - 28, 48, c1 + 28),
  g(poseHang(c1, { chinOver: false })),
  redArrow(c1 + 32, 70, c1 + 32, 110, 'slow'),
  bar(c2 - 28, 48, c2 + 28),
  g(poseHang(c2, { chinOver: false })),
  redDot(c2, 145, 'hang'),
]);

write('plank', 'Plank form diagram', 'Plank: setup, hold, exit', ['SETUP', 'HOLD', 'EXIT'], [
  g(posePlank(c0, { lowered: false })),
  redDot(c0 - 12, 130, 'line'),
  g(posePlank(c1, { lowered: false })),
  redDot(c1 - 12, 130, 'brace'),
  g(poseSquat(c2, { depth: 0.15 })),
]);

write('side-plank', 'Side plank form diagram', 'Side plank: setup, lift, hold', ['SETUP', 'LIFT', 'HOLD'], [
  // on side — elbow under shoulder, body line
  g({
    head: { x: c0 - 20, y: 105 },
    neck: { x: c0 - 8, y: 120 },
    hip: { x: c0 + 30, y: 155 },
    side: true,
    leftShoulder: { x: c0 - 5, y: 125 },
    leftElbow: { x: c0 - 8, y: 160 },
    leftHand: { x: c0 - 5, y: G },
    leftFoot: { x: c0 + 55, y: G },
    rightFoot: { x: c0 + 50, y: G - 4 },
  }),
  g({
    head: { x: c1 - 20, y: 88 },
    neck: { x: c1 - 8, y: 102 },
    hip: { x: c1 + 32, y: 118 },
    side: true,
    leftShoulder: { x: c1 - 5, y: 108 },
    leftElbow: { x: c1 - 8, y: 155 },
    leftHand: { x: c1 - 5, y: G },
    rightHand: { x: c1 + 28, y: 78 },
    leftFoot: { x: c1 + 58, y: G },
    rightFoot: { x: c1 + 52, y: G - 4 },
  }),
  redArrow(c1 + 30, 150, c1 + 30, 120, 'hips'),
  g({
    head: { x: c2 - 20, y: 88 },
    neck: { x: c2 - 8, y: 102 },
    hip: { x: c2 + 32, y: 118 },
    side: true,
    leftShoulder: { x: c2 - 5, y: 108 },
    leftElbow: { x: c2 - 8, y: 155 },
    leftHand: { x: c2 - 5, y: G },
    rightHand: { x: c2 + 28, y: 78 },
    leftFoot: { x: c2 + 58, y: G },
    rightFoot: { x: c2 + 52, y: G - 4 },
  }),
  redDot(c2 + 32, 118, 'line'),
]);

write('overhead-press', 'Overhead press form diagram', 'OHP: rack, press, lock', ['RACK', 'PRESS', 'LOCK'], [
  g(poseSquat(c0, { depth: 0, arms: 'rack' })),
  bar(c0 - 16, 72, c0 + 16),
  redDot(c0, 100, 'brace'),
  g(poseSquat(c1, { depth: 0, arms: 'overhead' })),
  bar(c1 - 12, 42, c1 + 12),
  redArrow(c1 + 28, 100, c1 + 28, 55, 'up'),
  g(poseSquat(c2, { depth: 0, arms: 'overhead' })),
  bar(c2 - 12, 38, c2 + 12),
  redDot(c2, 38, 'lock'),
]);

write('thruster', 'Thruster form diagram', 'Thruster: squat, drive, lock', ['SQUAT', 'DRIVE', 'LOCK'], [
  g(poseSquat(c0, { depth: 0.9, arms: 'rack' })),
  bar(c0 - 14, 100, c0 + 18),
  redDot(c0, 150, 'rack'),
  g(poseSquat(c1, { depth: 0.15, arms: 'overhead' })),
  bar(c1 - 12, 48, c1 + 12),
  redArrow(c1, 155, c1, 120, 'up'),
  g(poseSquat(c2, { depth: 0, arms: 'overhead' })),
  bar(c2 - 12, 38, c2 + 12),
  redDot(c2, 38, 'lock'),
]);

write('lunges', 'Lunge form diagram', 'Lunge: stand, lower, drive', ['STAND', 'LOWER', 'DRIVE'], [
  g(poseSquat(c0, { depth: 0 })),
  g({
    head: { x: c1, y: 68 },
    neck: { x: c1, y: 82 },
    hip: { x: c1, y: 125 },
    side: true,
    leftShoulder: { x: c1, y: 86 },
    leftHand: { x: c1 - 12, y: 125 },
    rightHand: { x: c1 + 12, y: 125 },
    leftKnee: { x: c1 + 28, y: 155 },
    rightKnee: { x: c1 - 22, y: 162 },
    leftFoot: { x: c1 + 42, y: G },
    rightFoot: { x: c1 - 32, y: G },
  }),
  redDot(c1 + 28, 155, 'knee'),
  g(poseSquat(c2, { depth: 0 })),
  redArrow(c2, 155, c2, 125, ''),
]);

write('barbell-row', 'Barbell row form diagram', 'Row: hinge, pull, lower', ['HINGE', 'PULL', 'LOWER'], [
  g(poseHinge(c0, { lean: 0.65, barY: 162 })),
  bar(c0 - 10, 162, c0 + 30),
  g({
    ...poseHinge(c1, { lean: 0.55, barY: 128 }),
    leftElbow: { x: c1 + 8, y: 115 },
    rightElbow: { x: c1 + 14, y: 118 },
    leftHand: { x: c1 + 18, y: 128 },
    rightHand: { x: c1 + 26, y: 130 },
  }),
  bar(c1 + 8, 128, c1 + 40),
  redArrow(c1 + 45, 155, c1 + 45, 130, 'row'),
  g(poseHinge(c2, { lean: 0.65, barY: 162 })),
  bar(c2 - 10, 162, c2 + 30),
]);

write('burpees', 'Burpee form diagram', 'Burpee: stand, plank, jump', ['STAND', 'PLANK', 'JUMP'], [
  g(poseSquat(c0, { depth: 0 })),
  g(posePlank(c1, { lowered: false })),
  g(poseSquat(c2, { depth: 0, arms: 'overhead' })),
  redArrow(c2, 160, c2, 130, 'up'),
]);

write('inverted-row', 'Inverted row form diagram', 'Inverted row: hang, pull, lower', ['HANG', 'PULL', 'LOWER'], [
  bar(c0 - 40, 95, c0 + 40),
  g({
    head: { x: c0 + 38, y: 135 },
    neck: { x: c0 + 26, y: 142 },
    hip: { x: c0 - 20, y: 158 },
    side: true,
    leftShoulder: { x: c0 + 22, y: 144 },
    leftHand: { x: c0 + 18, y: 98 },
    rightHand: { x: c0 + 8, y: 98 },
    leftFoot: { x: c0 - 48, y: G },
    rightFoot: { x: c0 - 40, y: G },
  }),
  bar(c1 - 40, 95, c1 + 40),
  g({
    head: { x: c1 + 32, y: 115 },
    neck: { x: c1 + 20, y: 122 },
    hip: { x: c1 - 20, y: 148 },
    side: true,
    leftShoulder: { x: c1 + 16, y: 124 },
    leftElbow: { x: c1 + 12, y: 108 },
    leftHand: { x: c1 + 16, y: 98 },
    rightHand: { x: c1 + 6, y: 98 },
    leftFoot: { x: c1 - 48, y: G },
    rightFoot: { x: c1 - 40, y: G },
  }),
  redArrow(c1, 155, c1, 125, 'chest'),
  bar(c2 - 40, 95, c2 + 40),
  g({
    head: { x: c2 + 38, y: 135 },
    neck: { x: c2 + 26, y: 142 },
    hip: { x: c2 - 20, y: 158 },
    side: true,
    leftShoulder: { x: c2 + 22, y: 144 },
    leftHand: { x: c2 + 18, y: 98 },
    rightHand: { x: c2 + 8, y: 98 },
    leftFoot: { x: c2 - 48, y: G },
    rightFoot: { x: c2 - 40, y: G },
  }),
]);

write('bench-press', 'Bench press form diagram', 'Bench: setup, lower, press', ['SETUP', 'LOWER', 'PRESS'], [
  ...[c0, c1, c2].flatMap((cx, i) => {
    const barY = i === 1 ? 100 : 72;
    return [
      `  <rect x="${cx - 42}" y="145" width="84" height="12" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
      g({
        head: { x: cx - 32, y: 128 },
        neck: { x: cx - 20, y: 138 },
        hip: { x: cx + 22, y: 148 },
        side: true,
        leftShoulder: { x: cx - 8, y: 132 },
        leftElbow: { x: cx - 2, y: barY + 18 },
        leftHand: { x: cx + 4, y: barY },
        rightElbow: { x: cx + 18, y: barY + 18 },
        rightHand: { x: cx + 24, y: barY },
        leftKnee: { x: cx + 38, y: 158 },
        leftFoot: { x: cx + 42, y: G },
        rightFoot: { x: cx + 32, y: G },
      }),
      bar(cx - 22, barY, cx + 38),
      i === 1 ? redArrow(cx + 48, 75, cx + 48, 100, 'lower') : '',
      i === 2 ? redArrow(cx + 48, 105, cx + 48, 75, 'press') : '',
    ];
  }),
]);

write('hip-thrust', 'Hip thrust form diagram', 'Hip thrust: setup, drive, lower', ['SETUP', 'DRIVE', 'LOWER'], [
  `  <rect x="${c0 - 40}" y="125" width="28" height="40" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c0 - 20, y: 100 },
    neck: { x: c0 - 8, y: 115 },
    hip: { x: c0 + 28, y: 152 },
    side: true,
    leftShoulder: { x: c0 - 5, y: 118 },
    leftHand: { x: c0 + 22, y: 148 },
    leftKnee: { x: c0 + 48, y: 158 },
    leftFoot: { x: c0 + 55, y: G },
    rightFoot: { x: c0 + 48, y: G },
  }),
  `  <rect x="${c1 - 40}" y="120" width="28" height="40" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c1 - 20, y: 95 },
    neck: { x: c1 - 8, y: 110 },
    hip: { x: c1 + 32, y: 118 },
    side: true,
    leftShoulder: { x: c1 - 5, y: 112 },
    leftHand: { x: c1 + 28, y: 120 },
    leftKnee: { x: c1 + 52, y: 152 },
    leftFoot: { x: c1 + 58, y: G },
    rightFoot: { x: c1 + 50, y: G },
  }),
  redArrow(c1 + 28, 150, c1 + 28, 120, 'drive'),
  `  <rect x="${c2 - 40}" y="125" width="28" height="40" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c2 - 20, y: 100 },
    neck: { x: c2 - 8, y: 115 },
    hip: { x: c2 + 28, y: 152 },
    side: true,
    leftShoulder: { x: c2 - 5, y: 118 },
    leftHand: { x: c2 + 22, y: 148 },
    leftKnee: { x: c2 + 48, y: 158 },
    leftFoot: { x: c2 + 55, y: G },
    rightFoot: { x: c2 + 48, y: G },
  }),
]);

write('glute-bridge', 'Glute bridge form diagram', 'Bridge: setup, drive, lower', ['SETUP', 'DRIVE', 'LOWER'], [
  g({
    head: { x: c0 - 28, y: 132 },
    neck: { x: c0 - 16, y: 142 },
    hip: { x: c0 + 20, y: 162 },
    side: true,
    leftShoulder: { x: c0 - 12, y: 145 },
    leftHand: { x: c0 - 22, y: G },
    leftKnee: { x: c0 + 40, y: 158 },
    leftFoot: { x: c0 + 52, y: G },
    rightFoot: { x: c0 + 45, y: G },
  }),
  g({
    head: { x: c1 - 28, y: 122 },
    neck: { x: c1 - 16, y: 132 },
    hip: { x: c1 + 24, y: 128 },
    side: true,
    leftShoulder: { x: c1 - 12, y: 135 },
    leftHand: { x: c1 - 22, y: G },
    leftKnee: { x: c1 + 42, y: 155 },
    leftFoot: { x: c1 + 55, y: G },
    rightFoot: { x: c1 + 48, y: G },
  }),
  redArrow(c1 + 18, 160, c1 + 18, 130, 'hips'),
  g({
    head: { x: c2 - 28, y: 132 },
    neck: { x: c2 - 16, y: 142 },
    hip: { x: c2 + 20, y: 162 },
    side: true,
    leftShoulder: { x: c2 - 12, y: 145 },
    leftHand: { x: c2 - 22, y: G },
    leftKnee: { x: c2 + 40, y: 158 },
    leftFoot: { x: c2 + 52, y: G },
    rightFoot: { x: c2 + 45, y: G },
  }),
]);

write('kettlebell-swing', 'Kettlebell swing form diagram', 'KB swing: hike, snap, float', ['HIKE', 'SNAP', 'FLOAT'], [
  g(poseHinge(c0, { lean: 0.7, barY: 168 })),
  `  <circle cx="${c0 + 5}" cy="172" r="9" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
  redDot(c0, 128, 'hinge'),
  g(poseSquat(c1, { depth: 0, arms: 'forward' })),
  `  <circle cx="${c1 + 38}" cy="95" r="9" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
  redArrow(c1, 155, c1, 125, 'hips'),
  g(poseSquat(c2, { depth: 0, arms: 'forward' })),
  `  <circle cx="${c2 + 32}" cy="68" r="9" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
  redDot(c2 + 32, 68, 'float'),
]);

write('jump-squats', 'Jump squat form diagram', 'Jump squat: load, explode, land', ['LOAD', 'EXPLODE', 'LAND'], [
  g(poseSquat(c0, { depth: 0.75 })),
  redDot(c0, 145, 'load'),
  g({
    ...poseSquat(c1, { depth: 0, arms: 'overhead' }),
    leftFoot: { x: c1 - 14, y: 148 },
    rightFoot: { x: c1 + 16, y: 148 },
  }),
  redArrow(c1, 170, c1, 140, 'up'),
  `  <line x1="${c1 - 28}" y1="178" x2="${c1 + 28}" y2="178" stroke="${INK}" stroke-width="1.5" stroke-dasharray="4 3"></line>`,
  g(poseSquat(c2, { depth: 0.5 })),
  redDot(c2, G, 'soft'),
]);

// Isolation
write('bicep-curl', 'Bicep curl form diagram', 'Curl: hang, curl, lower', ['HANG', 'CURL', 'LOWER'], [
  g(poseFront(c0, { arms: 'down' })),
  redDot(c0 - 18, 105, 'pin'),
  // dumbbell dots at hands
  `  <circle cx="${c0 - 20}" cy="132" r="5" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
  `  <circle cx="${c0 + 20}" cy="132" r="5" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
  g(poseFront(c1, { arms: 'curl' })),
  `  <circle cx="${c1 - 12}" cy="84" r="5" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
  `  <circle cx="${c1 + 12}" cy="84" r="5" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
  redDot(c1, 105, 'elbows'),
  g(poseFront(c2, { arms: 'down' })),
  `  <circle cx="${c2 - 20}" cy="132" r="5" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
  `  <circle cx="${c2 + 20}" cy="132" r="5" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
  redArrow(c2 + 32, 88, c2 + 32, 128, ''),
]);

write('lateral-raise', 'Lateral raise form diagram', 'Raise: hang, raise, lower', ['HANG', 'RAISE', 'LOWER'], [
  g(poseFront(c0, { arms: 'down' })),
  g(poseFront(c1, { arms: 'raise' })),
  redDot(c1 - 48, 82, 'shoulder'),
  g({
    ...poseFront(c2, { arms: 'raise' }),
    leftHand: { x: c2 - 42, y: 110 },
    rightHand: { x: c2 + 42, y: 110 },
    leftElbow: { x: c2 - 32, y: 105 },
    rightElbow: { x: c2 + 32, y: 105 },
  }),
]);

write('tricep-pushdown', 'Tricep pushdown form diagram', 'Pushdown: start, extend, return', ['START', 'EXTEND', 'RETURN'], [
  g({
    ...poseFront(c0, { arms: 'curl' }),
    leftElbow: { x: c0 - 12, y: 98 },
    rightElbow: { x: c0 + 12, y: 98 },
    leftHand: { x: c0 - 8, y: 82 },
    rightHand: { x: c0 + 8, y: 82 },
  }),
  bar(c0 - 18, 78, c0 + 18),
  g({
    ...poseFront(c1, { arms: 'down' }),
    leftElbow: { x: c1 - 12, y: 100 },
    rightElbow: { x: c1 + 12, y: 100 },
    leftHand: { x: c1 - 10, y: 148 },
    rightHand: { x: c1 + 10, y: 148 },
  }),
  redDot(c1, 148, 'extend'),
  g({
    ...poseFront(c2, { arms: 'curl' }),
    leftElbow: { x: c2 - 12, y: 98 },
    rightElbow: { x: c2 + 12, y: 98 },
    leftHand: { x: c2 - 8, y: 82 },
    rightHand: { x: c2 + 8, y: 82 },
  }),
  bar(c2 - 18, 78, c2 + 18),
]);

write('face-pull', 'Face pull form diagram', 'Face pull: reach, pull, rotate', ['REACH', 'PULL', 'ROTATE'], [
  g(poseSquat(c0, { depth: 0, arms: 'forward' })),
  bar(c0 + 42, 95, c0 + 58),
  redDot(c0 + 40, 98, 'rope'),
  g({
    ...poseSquat(c1, { depth: 0, arms: 'forward' }),
    leftElbow: { x: c1 - 8, y: 82 },
    rightElbow: { x: c1 + 22, y: 78 },
    leftHand: { x: c1 + 4, y: 72 },
    rightHand: { x: c1 + 16, y: 68 },
  }),
  redArrow(c1 + 38, 110, c1 + 18, 78, 'high'),
  g({
    ...poseSquat(c2, { depth: 0, arms: 'forward' }),
    leftElbow: { x: c2 - 18, y: 75 },
    rightElbow: { x: c2 + 28, y: 72 },
    leftHand: { x: c2 - 6, y: 62 },
    rightHand: { x: c2 + 18, y: 58 },
  }),
  redDot(c2, 68, 'face'),
]);

write('band-pull-apart', 'Band pull-apart form diagram', 'Band pull-apart: hold, pull, return', ['HOLD', 'PULL', 'RETURN'], [
  g({
    ...poseFront(c0, { arms: 'down' }),
    leftElbow: { x: c0 - 28, y: 98 },
    rightElbow: { x: c0 + 28, y: 98 },
    leftHand: { x: c0 - 32, y: 96 },
    rightHand: { x: c0 + 32, y: 96 },
  }),
  `  <path d="M${c0 - 32} 96 Q${c0} 104 ${c0 + 32} 96" stroke="${INK}" stroke-width="2" fill="none"></path>`,
  redDot(c0, 100, 'band'),
  g(poseFront(c1, { arms: 'raise' })),
  `  <path d="M${c1 - 52} 78 Q${c1} 88 ${c1 + 52} 78" stroke="${INK}" stroke-width="2" fill="none"></path>`,
  redArrow(c1 - 30, 105, c1 - 48, 82, ''),
  redArrow(c1 + 30, 105, c1 + 48, 82, ''),
  g({
    ...poseFront(c2, { arms: 'down' }),
    leftElbow: { x: c2 - 28, y: 98 },
    rightElbow: { x: c2 + 28, y: 98 },
    leftHand: { x: c2 - 32, y: 96 },
    rightHand: { x: c2 + 32, y: 96 },
  }),
  `  <path d="M${c2 - 32} 96 Q${c2} 104 ${c2 + 32} 96" stroke="${INK}" stroke-width="2" fill="none"></path>`,
]);

write('lat-pulldown', 'Lat pulldown form diagram', 'Lat pulldown: reach, pull, return', ['REACH', 'PULL', 'RETURN'], [
  bar(c0 - 30, 48, c0 + 30),
  g(poseFront(c0, { arms: 'overhead' })),
  g({
    head: { x: c1, y: 68 },
    neck: { x: c1, y: 82 },
    hip: { x: c1, y: 128 },
    leftShoulder: { x: c1 - 16, y: 88 },
    rightShoulder: { x: c1 + 16, y: 88 },
    leftElbow: { x: c1 - 30, y: 108 },
    rightElbow: { x: c1 + 30, y: 108 },
    leftHand: { x: c1 - 18, y: 88 },
    rightHand: { x: c1 + 18, y: 88 },
    leftKnee: { x: c1 - 12, y: 152 },
    rightKnee: { x: c1 + 12, y: 152 },
    leftFoot: { x: c1 - 14, y: G },
    rightFoot: { x: c1 + 14, y: G },
  }),
  bar(c1 - 26, 85, c1 + 26),
  redArrow(c1 + 40, 70, c1 + 40, 105, 'pull'),
  bar(c2 - 30, 48, c2 + 30),
  g(poseFront(c2, { arms: 'overhead' })),
]);

write('cable-row', 'Cable row form diagram', 'Cable row: reach, pull, return', ['REACH', 'PULL', 'RETURN'], [
  g(poseSquat(c0, { depth: 0, arms: 'forward' })),
  bar(c0 + 40, 100, c0 + 58),
  g({
    ...poseSquat(c1, { depth: 0 }),
    leftElbow: { x: c1 - 8, y: 100 },
    rightElbow: { x: c1 + 8, y: 100 },
    leftHand: { x: c1 + 4, y: 108 },
    rightHand: { x: c1 + 14, y: 110 },
  }),
  redArrow(c1 + 40, 125, c1 + 15, 108, 'ribs'),
  g(poseSquat(c2, { depth: 0, arms: 'forward' })),
  bar(c2 + 40, 100, c2 + 58),
]);

// Floor / mobility
write('bird-dog', 'Bird-dog form diagram', 'Bird-dog: setup, extend, hold', ['SETUP', 'EXTEND', 'HOLD'], [
  g({
    head: { x: c0 + 28, y: 108 },
    neck: { x: c0 + 16, y: 118 },
    hip: { x: c0 - 12, y: 132 },
    side: true,
    leftShoulder: { x: c0 + 12, y: 120 },
    leftHand: { x: c0 + 32, y: G - 4 },
    rightHand: { x: c0 + 10, y: G - 4 },
    leftKnee: { x: c0 - 18, y: G - 18 },
    rightKnee: { x: c0 - 4, y: G - 18 },
    leftFoot: { x: c0 - 30, y: G },
    rightFoot: { x: c0 - 16, y: G },
  }),
  g({
    head: { x: c1 + 40, y: 98 },
    neck: { x: c1 + 26, y: 112 },
    hip: { x: c1 - 8, y: 130 },
    side: true,
    leftShoulder: { x: c1 + 20, y: 114 },
    leftHand: { x: c1 + 55, y: 100 },
    rightHand: { x: c1 + 8, y: G - 4 },
    leftKnee: { x: c1 - 18, y: G - 18 },
    rightFoot: { x: c1 - 40, y: 100 },
    leftFoot: { x: c1 - 28, y: G },
  }),
  redArrow(c1 + 48, 115, c1 + 58, 98, ''),
  redArrow(c1 - 28, 125, c1 - 42, 105, ''),
  g({
    head: { x: c2 + 40, y: 98 },
    neck: { x: c2 + 26, y: 112 },
    hip: { x: c2 - 8, y: 130 },
    side: true,
    leftShoulder: { x: c2 + 20, y: 114 },
    leftHand: { x: c2 + 55, y: 100 },
    rightHand: { x: c2 + 8, y: G - 4 },
    leftKnee: { x: c2 - 18, y: G - 18 },
    rightFoot: { x: c2 - 40, y: 100 },
    leftFoot: { x: c2 - 28, y: G },
  }),
  redDot(c2 - 8, 130, 'level'),
]);

write('mountain-climbers', 'Mountain climbers form diagram', 'Climbers: plank, drive, switch', ['PLANK', 'DRIVE', 'SWITCH'], [
  g(posePlank(c0, { lowered: false })),
  g({
    ...posePlank(c1, { lowered: false }),
    leftKnee: { x: c1 + 8, y: 155 },
    leftFoot: { x: c1 + 14, y: G - 4 },
  }),
  redArrow(c1 - 25, 150, c1 + 5, 155, 'knee'),
  g({
    ...posePlank(c2, { lowered: false }),
    rightKnee: { x: c2 + 8, y: 155 },
    rightFoot: { x: c2 + 14, y: G - 4 },
  }),
]);

write('pike-pushup', 'Pike push-up form diagram', 'Pike: pike, lower, press', ['PIKE', 'LOWER', 'PRESS'], [
  g({
    head: { x: c0 + 30, y: 115 },
    neck: { x: c0 + 18, y: 105 },
    hip: { x: c0 - 8, y: 78 },
    side: true,
    leftShoulder: { x: c0 + 14, y: 108 },
    leftHand: { x: c0 + 32, y: G - 4 },
    rightHand: { x: c0 + 24, y: G - 4 },
    leftFoot: { x: c0 - 38, y: G - 4 },
    rightFoot: { x: c0 - 30, y: G - 4 },
  }),
  redDot(c0 - 8, 78, 'hips high'),
  g({
    head: { x: c1 + 35, y: 145 },
    neck: { x: c1 + 20, y: 128 },
    hip: { x: c1 - 8, y: 82 },
    side: true,
    leftShoulder: { x: c1 + 16, y: 132 },
    leftHand: { x: c1 + 34, y: G - 4 },
    rightHand: { x: c1 + 26, y: G - 4 },
    leftFoot: { x: c1 - 38, y: G - 4 },
    rightFoot: { x: c1 - 30, y: G - 4 },
  }),
  redArrow(c1 + 22, 110, c1 + 22, 140, 'head'),
  g({
    head: { x: c2 + 30, y: 115 },
    neck: { x: c2 + 18, y: 105 },
    hip: { x: c2 - 8, y: 78 },
    side: true,
    leftShoulder: { x: c2 + 14, y: 108 },
    leftHand: { x: c2 + 32, y: G - 4 },
    rightHand: { x: c2 + 24, y: G - 4 },
    leftFoot: { x: c2 - 38, y: G - 4 },
    rightFoot: { x: c2 - 30, y: G - 4 },
  }),
  redArrow(c2 + 22, 140, c2 + 22, 108, 'press'),
]);

write('wall-sit', 'Wall sit form diagram', 'Wall sit: setup, sit, hold', ['SETUP', 'SIT', 'HOLD'], [
  `  <line x1="${c0 - 32}" y1="50" x2="${c0 - 32}" y2="${G}" stroke="${INK}" stroke-width="2"></line>`,
  g(poseSquat(c0, { depth: 0.7 })),
  `  <line x1="${c1 - 32}" y1="50" x2="${c1 - 32}" y2="${G}" stroke="${INK}" stroke-width="2"></line>`,
  g(poseSquat(c1, { depth: 0.9 })),
  redDot(c1, 150, '90°'),
  `  <line x1="${c2 - 32}" y1="50" x2="${c2 - 32}" y2="${G}" stroke="${INK}" stroke-width="2"></line>`,
  g(poseSquat(c2, { depth: 0.9 })),
  redDot(c2, 150, 'hold'),
]);

write('dips-chair', 'Chair dip form diagram', 'Dip: support, lower, press', ['SUPPORT', 'LOWER', 'PRESS'], [
  `  <rect x="${c0 - 8}" y="112" width="42" height="10" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c0 - 8, y: 72 },
    neck: { x: c0 - 8, y: 88 },
    hip: { x: c0 + 18, y: 128 },
    side: true,
    leftShoulder: { x: c0 - 4, y: 92 },
    leftHand: { x: c0 + 8, y: 116 },
    rightHand: { x: c0 + 18, y: 116 },
    leftFoot: { x: c0 + 48, y: G - 8 },
    rightFoot: { x: c0 + 55, y: G - 8 },
  }),
  `  <rect x="${c1 - 8}" y="112" width="42" height="10" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c1 - 8, y: 95 },
    neck: { x: c1 - 8, y: 110 },
    hip: { x: c1 + 22, y: 155 },
    side: true,
    leftShoulder: { x: c1 - 4, y: 114 },
    leftHand: { x: c1 + 8, y: 116 },
    rightHand: { x: c1 + 18, y: 116 },
    leftFoot: { x: c1 + 52, y: G - 8 },
    rightFoot: { x: c1 + 58, y: G - 8 },
  }),
  redArrow(c1 + 28, 105, c1 + 28, 140, 'bend'),
  `  <rect x="${c2 - 8}" y="112" width="42" height="10" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c2 - 8, y: 72 },
    neck: { x: c2 - 8, y: 88 },
    hip: { x: c2 + 18, y: 128 },
    side: true,
    leftShoulder: { x: c2 - 4, y: 92 },
    leftHand: { x: c2 + 8, y: 116 },
    rightHand: { x: c2 + 18, y: 116 },
    leftFoot: { x: c2 + 48, y: G - 8 },
    rightFoot: { x: c2 + 55, y: G - 8 },
  }),
  redArrow(c2 + 28, 150, c2 + 28, 120, ''),
]);

write('step-ups', 'Step-up form diagram', 'Step-up: plant, drive, stand', ['PLANT', 'DRIVE', 'STAND'], [
  `  <rect x="${c0 + 18}" y="128" width="40" height="48" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    ...poseSquat(c0, { depth: 0.2 }),
    rightKnee: { x: c0 + 28, y: 132 },
    rightFoot: { x: c0 + 34, y: 128 },
  }),
  redDot(c0 + 34, 128, 'box'),
  `  <rect x="${c1 + 18}" y="128" width="40" height="48" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c1 + 10, y: 52 },
    neck: { x: c1 + 10, y: 68 },
    hip: { x: c1 + 10, y: 100 },
    side: true,
    leftShoulder: { x: c1 + 10, y: 72 },
    leftHand: { x: c1 - 5, y: 95 },
    rightHand: { x: c1 + 22, y: 95 },
    leftFoot: { x: c1 - 5, y: 128 },
    rightFoot: { x: c1 + 30, y: 128 },
  }),
  redArrow(c1 + 10, 155, c1 + 10, 115, 'drive'),
  `  <rect x="${c2 + 5}" y="128" width="50" height="48" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c2 + 22, y: 48 },
    neck: { x: c2 + 22, y: 64 },
    hip: { x: c2 + 22, y: 95 },
    side: true,
    leftShoulder: { x: c2 + 22, y: 68 },
    leftFoot: { x: c2 + 10, y: 128 },
    rightFoot: { x: c2 + 36, y: 128 },
    leftHand: { x: c2 + 10, y: 90 },
    rightHand: { x: c2 + 34, y: 90 },
  }),
  redDot(c2 + 22, 95, 'tall'),
]);

write('dead-bug', 'Dead-bug form diagram', 'Dead-bug: setup, extend, switch', ['SETUP', 'EXTEND', 'SWITCH'], [
  g({
    head: { x: c0, y: 100 },
    neck: { x: c0, y: 114 },
    hip: { x: c0, y: 150 },
    leftShoulder: { x: c0 - 14, y: 118 },
    rightShoulder: { x: c0 + 14, y: 118 },
    leftHand: { x: c0 - 36, y: 122 },
    rightHand: { x: c0 + 36, y: 122 },
    leftKnee: { x: c0 - 20, y: 165 },
    rightKnee: { x: c0 + 20, y: 165 },
    leftFoot: { x: c0 - 28, y: G },
    rightFoot: { x: c0 + 28, y: G },
  }),
  redDot(c0, 150, 'ribs'),
  g({
    head: { x: c1, y: 100 },
    neck: { x: c1, y: 114 },
    hip: { x: c1, y: 150 },
    leftShoulder: { x: c1 - 14, y: 118 },
    rightShoulder: { x: c1 + 14, y: 118 },
    leftHand: { x: c1 - 42, y: 105 },
    rightHand: { x: c1 + 18, y: 162 },
    leftKnee: { x: c1 - 14, y: 165 },
    rightFoot: { x: c1 + 42, y: G },
    leftFoot: { x: c1 - 22, y: G },
  }),
  g({
    head: { x: c2, y: 100 },
    neck: { x: c2, y: 114 },
    hip: { x: c2, y: 150 },
    leftShoulder: { x: c2 - 14, y: 118 },
    rightShoulder: { x: c2 + 14, y: 118 },
    rightHand: { x: c2 + 42, y: 105 },
    leftHand: { x: c2 - 18, y: 162 },
    rightKnee: { x: c2 + 14, y: 165 },
    leftFoot: { x: c2 - 42, y: G },
    rightFoot: { x: c2 + 22, y: G },
  }),
]);

write('crunches', 'Crunches form diagram', 'Crunch: setup, curl, lower', ['SETUP', 'CURL', 'LOWER'], [
  g({
    head: { x: c0 - 18, y: 128 },
    neck: { x: c0 - 6, y: 138 },
    hip: { x: c0 + 22, y: 158 },
    side: true,
    leftShoulder: { x: c0, y: 140 },
    leftHand: { x: c0 - 12, y: 122 },
    leftKnee: { x: c0 + 42, y: 158 },
    leftFoot: { x: c0 + 52, y: G },
    rightFoot: { x: c0 + 45, y: G },
  }),
  g({
    head: { x: c1 - 12, y: 108 },
    neck: { x: c1, y: 120 },
    hip: { x: c1 + 28, y: 158 },
    side: true,
    leftShoulder: { x: c1 + 4, y: 124 },
    leftHand: { x: c1 - 8, y: 108 },
    leftKnee: { x: c1 + 48, y: 158 },
    leftFoot: { x: c1 + 58, y: G },
    rightFoot: { x: c1 + 50, y: G },
  }),
  redArrow(c1 - 5, 135, c1 - 5, 112, 'ribs'),
  g({
    head: { x: c2 - 18, y: 128 },
    neck: { x: c2 - 6, y: 138 },
    hip: { x: c2 + 22, y: 158 },
    side: true,
    leftShoulder: { x: c2, y: 140 },
    leftHand: { x: c2 - 12, y: 122 },
    leftKnee: { x: c2 + 42, y: 158 },
    leftFoot: { x: c2 + 52, y: G },
    rightFoot: { x: c2 + 45, y: G },
  }),
]);

write('hanging-leg-raise', 'Hanging leg raise form diagram', 'Leg raise: hang, raise, lower', ['HANG', 'RAISE', 'LOWER'], [
  bar(c0 - 28, 48, c0 + 28),
  g(poseHang(c0, { chinOver: false })),
  bar(c1 - 28, 48, c1 + 28),
  g({
    ...poseHang(c1, { chinOver: false }),
    leftKnee: { x: c1 - 22, y: 140 },
    rightKnee: { x: c1 + 22, y: 140 },
    leftFoot: { x: c1 - 28, y: 125 },
    rightFoot: { x: c1 + 28, y: 125 },
  }),
  redArrow(c1, 165, c1, 135, 'legs'),
  bar(c2 - 28, 48, c2 + 28),
  g(poseHang(c2, { chinOver: false })),
]);

write('box-jump', 'Box jump form diagram', 'Box jump: load, jump, land', ['LOAD', 'JUMP', 'LAND'], [
  `  <rect x="${c0 + 28}" y="132" width="40" height="45" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g(poseSquat(c0, { depth: 0.65 })),
  redDot(c0, 145, 'load'),
  `  <rect x="${c1 + 32}" y="132" width="40" height="45" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    ...poseSquat(c1, { depth: 0, arms: 'overhead' }),
    leftFoot: { x: c1 - 12, y: 138 },
    rightFoot: { x: c1 + 14, y: 138 },
  }),
  redArrow(c1, 168, c1, 138, 'up'),
  `  <rect x="${c2 + 8}" y="132" width="50" height="45" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c2 + 22, y: 52 },
    neck: { x: c2 + 22, y: 68 },
    hip: { x: c2 + 22, y: 100 },
    side: true,
    leftShoulder: { x: c2 + 22, y: 72 },
    leftKnee: { x: c2 + 14, y: 122 },
    rightKnee: { x: c2 + 30, y: 122 },
    leftFoot: { x: c2 + 12, y: 132 },
    rightFoot: { x: c2 + 34, y: 132 },
    leftHand: { x: c2 + 10, y: 90 },
    rightHand: { x: c2 + 34, y: 90 },
  }),
  redDot(c2 + 22, 132, 'soft'),
]);

write('skull-crusher', 'Skull crusher form diagram', 'Skull crusher: start, bend, extend', ['START', 'BEND', 'EXTEND'], [
  `  <rect x="${c0 - 38}" y="148" width="76" height="10" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c0 - 28, y: 125 },
    neck: { x: c0 - 16, y: 135 },
    hip: { x: c0 + 24, y: 150 },
    side: true,
    leftShoulder: { x: c0 - 6, y: 130 },
    leftElbow: { x: c0, y: 95 },
    leftHand: { x: c0 + 6, y: 72 },
    rightElbow: { x: c0 + 14, y: 95 },
    rightHand: { x: c0 + 20, y: 72 },
    leftFoot: { x: c0 + 32, y: G },
    rightFoot: { x: c0 + 42, y: G },
  }),
  bar(c0 - 8, 70, c0 + 32),
  `  <rect x="${c1 - 38}" y="148" width="76" height="10" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c1 - 28, y: 125 },
    neck: { x: c1 - 16, y: 135 },
    hip: { x: c1 + 24, y: 150 },
    side: true,
    leftShoulder: { x: c1 - 6, y: 130 },
    leftElbow: { x: c1, y: 100 },
    leftHand: { x: c1 - 12, y: 118 },
    rightElbow: { x: c1 + 14, y: 100 },
    rightHand: { x: c1 + 22, y: 118 },
    leftFoot: { x: c1 + 32, y: G },
    rightFoot: { x: c1 + 42, y: G },
  }),
  bar(c1 - 18, 118, c1 + 32),
  redArrow(c1 + 42, 80, c1 + 42, 112, ''),
  `  <rect x="${c2 - 38}" y="148" width="76" height="10" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({
    head: { x: c2 - 28, y: 125 },
    neck: { x: c2 - 16, y: 135 },
    hip: { x: c2 + 24, y: 150 },
    side: true,
    leftShoulder: { x: c2 - 6, y: 130 },
    leftElbow: { x: c2, y: 95 },
    leftHand: { x: c2 + 6, y: 72 },
    rightElbow: { x: c2 + 14, y: 95 },
    rightHand: { x: c2 + 20, y: 72 },
    leftFoot: { x: c2 + 32, y: G },
    rightFoot: { x: c2 + 42, y: G },
  }),
  bar(c2 - 8, 70, c2 + 32),
]);

write('calf-raise', 'Calf raise form diagram', 'Calf raise: flat, rise, lower', ['FLAT', 'RISE', 'LOWER'], [
  g(poseFront(c0, { arms: 'down' })),
  redDot(c0, G, 'full foot'),
  g({
    ...poseFront(c1, { arms: 'down' }),
    leftFoot: { x: c1 - 14, y: 168 },
    rightFoot: { x: c1 + 14, y: 168 },
    hip: { x: c1, y: 112 },
    head: { x: c1, y: 50 },
    neck: { x: c1, y: 65 },
  }),
  redDot(c1, 168, 'toes'),
  g(poseFront(c2, { arms: 'down' })),
]);

write('leg-press', 'Leg press form diagram', 'Leg press: start, bend, press', ['START', 'BEND', 'PRESS'], [
  `  <rect x="${c0 - 32}" y="100" width="48" height="48" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g(poseSquat(c0 + 8, { depth: 0.25 })),
  `  <rect x="${c0 + 42}" y="105" width="16" height="38" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  `  <rect x="${c1 - 32}" y="100" width="48" height="48" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g(poseSquat(c1 + 8, { depth: 0.75 })),
  `  <rect x="${c1 + 42}" y="125" width="16" height="38" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  redArrow(c1 + 58, 115, c1 + 58, 145, ''),
  `  <rect x="${c2 - 32}" y="100" width="48" height="48" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g(poseSquat(c2 + 8, { depth: 0.25 })),
  `  <rect x="${c2 + 42}" y="105" width="16" height="38" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  redArrow(c2 + 58, 150, c2 + 58, 115, 'press'),
]);

write('superman', 'Superman form diagram', 'Superman: prone, lift, hold', ['PRONE', 'LIFT', 'HOLD'], [
  g({
    head: { x: c0 + 42, y: 142 },
    neck: { x: c0 + 28, y: 148 },
    hip: { x: c0 - 12, y: 152 },
    side: true,
    leftShoulder: { x: c0 + 24, y: 150 },
    leftHand: { x: c0 + 52, y: 155 },
    leftFoot: { x: c0 - 42, y: 158 },
    rightFoot: { x: c0 - 35, y: 160 },
  }),
  g({
    head: { x: c1 + 42, y: 122 },
    neck: { x: c1 + 28, y: 130 },
    hip: { x: c1 - 12, y: 138 },
    side: true,
    leftShoulder: { x: c1 + 24, y: 132 },
    leftHand: { x: c1 + 58, y: 118 },
    leftFoot: { x: c1 - 42, y: 128 },
    rightFoot: { x: c1 - 35, y: 138 },
  }),
  redArrow(c1 - 12, 160, c1 - 12, 138, ''),
  g({
    head: { x: c2 + 42, y: 122 },
    neck: { x: c2 + 28, y: 130 },
    hip: { x: c2 - 12, y: 138 },
    side: true,
    leftShoulder: { x: c2 + 24, y: 132 },
    leftHand: { x: c2 + 58, y: 118 },
    leftFoot: { x: c2 - 42, y: 128 },
    rightFoot: { x: c2 - 35, y: 138 },
  }),
  redDot(c2 - 12, 138, 'squeeze'),
]);

// Mobility pack
write('cat-camel', 'Cat-camel form diagram', 'Cat-camel: neutral, cat, camel', ['NEUTRAL', 'CAT', 'CAMEL'], [
  g({ head: { x: c0 + 24, y: 108 }, neck: { x: c0 + 12, y: 118 }, hip: { x: c0 - 14, y: 132 }, side: true, leftShoulder: { x: c0 + 10, y: 120 }, leftHand: { x: c0 + 30, y: G - 4 }, rightHand: { x: c0 + 12, y: G - 4 }, leftKnee: { x: c0 - 18, y: G - 18 }, rightKnee: { x: c0 - 4, y: G - 18 }, leftFoot: { x: c0 - 30, y: G }, rightFoot: { x: c0 - 16, y: G } }),
  redDot(c0 - 14, 132, 'neutral'),
  g({ head: { x: c1 + 24, y: 122 }, neck: { x: c1 + 12, y: 112 }, hip: { x: c1 - 14, y: 102 }, side: true, leftShoulder: { x: c1 + 10, y: 116 }, leftHand: { x: c1 + 30, y: G - 4 }, rightHand: { x: c1 + 12, y: G - 4 }, leftKnee: { x: c1 - 18, y: G - 18 }, rightKnee: { x: c1 - 4, y: G - 18 }, leftFoot: { x: c1 - 30, y: G }, rightFoot: { x: c1 - 16, y: G } }),
  redDot(c1 - 14, 102, 'round'),
  g({ head: { x: c2 + 24, y: 100 }, neck: { x: c2 + 12, y: 116 }, hip: { x: c2 - 14, y: 142 }, side: true, leftShoulder: { x: c2 + 10, y: 118 }, leftHand: { x: c2 + 30, y: G - 4 }, rightHand: { x: c2 + 12, y: G - 4 }, leftKnee: { x: c2 - 18, y: G - 18 }, rightKnee: { x: c2 - 4, y: G - 18 }, leftFoot: { x: c2 - 30, y: G }, rightFoot: { x: c2 - 16, y: G } }),
  redDot(c2 - 14, 142, 'arch'),
]);

write('couch-stretch', 'Couch stretch form diagram', 'Couch stretch: setup, upright, hold', ['SETUP', 'UPRIGHT', 'HOLD'], [
  `  <rect x="${c0 + 18}" y="100" width="32" height="75" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({ head: { x: c0 - 8, y: 78 }, neck: { x: c0 - 2, y: 94 }, hip: { x: c0 + 8, y: 130 }, side: true, leftShoulder: { x: c0, y: 98 }, leftKnee: { x: c0 + 28, y: 152 }, leftFoot: { x: c0 + 42, y: 118 }, rightKnee: { x: c0 - 5, y: 158 }, rightFoot: { x: c0 - 12, y: G }, leftHand: { x: c0 - 14, y: 120 }, rightHand: { x: c0 + 12, y: 120 } }),
  `  <rect x="${c1 + 18}" y="100" width="32" height="75" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({ head: { x: c1 - 8, y: 58 }, neck: { x: c1 - 2, y: 74 }, hip: { x: c1 + 8, y: 120 }, side: true, leftShoulder: { x: c1, y: 78 }, leftKnee: { x: c1 + 28, y: 152 }, leftFoot: { x: c1 + 42, y: 118 }, rightKnee: { x: c1 - 8, y: 152 }, rightFoot: { x: c1 - 14, y: G }, leftHand: { x: c1 - 12, y: 100 }, rightHand: { x: c1 + 10, y: 100 } }),
  redDot(c1 - 5, 58, 'tall'),
  `  <rect x="${c2 + 18}" y="100" width="32" height="75" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g({ head: { x: c2 - 8, y: 58 }, neck: { x: c2 - 2, y: 74 }, hip: { x: c2 + 8, y: 120 }, side: true, leftShoulder: { x: c2, y: 78 }, leftKnee: { x: c2 + 28, y: 152 }, leftFoot: { x: c2 + 42, y: 118 }, rightKnee: { x: c2 - 8, y: 152 }, rightFoot: { x: c2 - 14, y: G }, leftHand: { x: c2 - 12, y: 100 }, rightHand: { x: c2 + 10, y: 100 } }),
  redDot(c2 + 8, 120, 'breathe'),
]);

write('bear-crawl', 'Bear crawl form diagram', 'Bear crawl: hover, step, advance', ['HOVER', 'STEP', 'ADVANCE'], [
  g({ head: { x: c0 + 28, y: 102 }, neck: { x: c0 + 16, y: 114 }, hip: { x: c0 - 12, y: 128 }, side: true, leftShoulder: { x: c0 + 12, y: 116 }, leftHand: { x: c0 + 32, y: G - 4 }, rightHand: { x: c0 + 10, y: G - 4 }, leftKnee: { x: c0 - 16, y: 148 }, rightKnee: { x: c0 - 4, y: 148 }, leftFoot: { x: c0 - 28, y: 162 }, rightFoot: { x: c0 - 12, y: 162 } }),
  redDot(c0 - 12, 148, 'knees off'),
  g({ head: { x: c1 + 32, y: 102 }, neck: { x: c1 + 18, y: 114 }, hip: { x: c1 - 8, y: 128 }, side: true, leftShoulder: { x: c1 + 14, y: 116 }, leftHand: { x: c1 + 42, y: G - 4 }, rightHand: { x: c1 + 6, y: G - 4 }, leftKnee: { x: c1 - 22, y: 148 }, rightFoot: { x: c1 - 4, y: 162 }, leftFoot: { x: c1 - 32, y: 162 } }),
  redArrow(c1 + 28, 145, c1 + 42, 160, ''),
  g({ head: { x: c2 + 32, y: 102 }, neck: { x: c2 + 18, y: 114 }, hip: { x: c2 - 8, y: 128 }, side: true, leftShoulder: { x: c2 + 14, y: 116 }, leftHand: { x: c2 + 36, y: G - 4 }, rightHand: { x: c2 + 16, y: G - 4 }, rightKnee: { x: c2 - 22, y: 148 }, leftFoot: { x: c2 - 4, y: 162 }, rightFoot: { x: c2 - 32, y: 162 } }),
  redArrow(c2, 132, c2 + 16, 126, 'crawl'),
]);

write('inchworm', 'Inchworm form diagram', 'Inchworm: stand, walk out, walk in', ['STAND', 'WALK OUT', 'WALK IN'], [
  g(poseSquat(c0, { depth: 0 })),
  g({ head: { x: c1 + 42, y: 112 }, neck: { x: c1 + 28, y: 118 }, hip: { x: c1 - 18, y: 132 }, side: true, leftShoulder: { x: c1 + 24, y: 120 }, leftHand: { x: c1 + 52, y: G - 4 }, rightHand: { x: c1 + 44, y: G - 4 }, leftFoot: { x: c1 - 32, y: G }, rightFoot: { x: c1 - 24, y: G } }),
  redArrow(c1 + 22, 145, c1 + 48, 160, 'hands'),
  g({ head: { x: c2 + 32, y: 98 }, neck: { x: c2 + 18, y: 108 }, hip: { x: c2 - 6, y: 122 }, side: true, leftShoulder: { x: c2 + 14, y: 110 }, leftHand: { x: c2 + 42, y: G - 4 }, rightHand: { x: c2 + 34, y: G - 4 }, leftFoot: { x: c2 - 16, y: G - 8 }, rightFoot: { x: c2 - 8, y: G - 8 } }),
  redArrow(c2 - 22, 165, c2 - 6, 150, 'feet'),
]);

write('single-leg-glute', 'Single-leg glute bridge form diagram', 'Single-leg bridge: setup, drive, lower', ['SETUP', 'DRIVE', 'LOWER'], [
  g({ head: { x: c0 - 22, y: 128 }, neck: { x: c0 - 10, y: 140 }, hip: { x: c0 + 18, y: 158 }, side: true, leftShoulder: { x: c0 - 6, y: 142 }, leftHand: { x: c0 - 24, y: G }, leftKnee: { x: c0 + 38, y: 158 }, leftFoot: { x: c0 + 48, y: G }, rightFoot: { x: c0 + 32, y: 142 } }),
  redDot(c0 + 18, 158, 'one leg'),
  g({ head: { x: c1 - 22, y: 118 }, neck: { x: c1 - 10, y: 130 }, hip: { x: c1 + 22, y: 130 }, side: true, leftShoulder: { x: c1 - 6, y: 132 }, leftHand: { x: c1 - 24, y: G }, leftKnee: { x: c1 + 42, y: 152 }, leftFoot: { x: c1 + 52, y: G }, rightFoot: { x: c1 + 36, y: 112 } }),
  redArrow(c1 + 18, 158, c1 + 18, 132, 'hips'),
  g({ head: { x: c2 - 22, y: 128 }, neck: { x: c2 - 10, y: 140 }, hip: { x: c2 + 18, y: 158 }, side: true, leftShoulder: { x: c2 - 6, y: 142 }, leftHand: { x: c2 - 24, y: G }, leftKnee: { x: c2 + 38, y: 158 }, leftFoot: { x: c2 + 48, y: G }, rightFoot: { x: c2 + 32, y: 142 } }),
]);

write('wall-angels', 'Wall angels form diagram', 'Wall angels: contact, slide up, return', ['CONTACT', 'SLIDE UP', 'RETURN'], [
  `  <line x1="${c0 - 30}" y1="50" x2="${c0 - 30}" y2="${G}" stroke="${INK}" stroke-width="2"></line>`,
  g(poseFront(c0, { arms: 'curl' })),
  redDot(c0 - 18, 100, 'wall'),
  `  <line x1="${c1 - 30}" y1="50" x2="${c1 - 30}" y2="${G}" stroke="${INK}" stroke-width="2"></line>`,
  g(poseFront(c1, { arms: 'overhead' })),
  redArrow(c1, 110, c1, 72, 'up'),
  `  <line x1="${c2 - 30}" y1="50" x2="${c2 - 30}" y2="${G}" stroke="${INK}" stroke-width="2"></line>`,
  g(poseFront(c2, { arms: 'curl' })),
  redArrow(c2, 72, c2, 108, ''),
]);

write('thread-needle', 'Thread the needle form diagram', 'Thread needle: setup, thread, open', ['SETUP', 'THREAD', 'OPEN'], [
  g({ head: { x: c0 + 24, y: 108 }, neck: { x: c0 + 12, y: 118 }, hip: { x: c0 - 12, y: 130 }, side: true, leftShoulder: { x: c0 + 10, y: 120 }, leftHand: { x: c0 + 30, y: G - 4 }, rightHand: { x: c0 + 8, y: G - 4 }, leftKnee: { x: c0 - 18, y: G - 18 }, rightKnee: { x: c0 - 4, y: G - 18 }, leftFoot: { x: c0 - 30, y: G }, rightFoot: { x: c0 - 14, y: G } }),
  g({ head: { x: c1 + 5, y: 148 }, neck: { x: c1, y: 138 }, hip: { x: c1 - 10, y: 132 }, side: true, leftShoulder: { x: c1 + 2, y: 140 }, leftHand: { x: c1 - 28, y: G - 4 }, rightHand: { x: c1 + 32, y: G - 4 }, leftKnee: { x: c1 - 16, y: G - 18 }, rightKnee: { x: c1 - 2, y: G - 18 }, leftFoot: { x: c1 - 28, y: G }, rightFoot: { x: c1 - 12, y: G } }),
  redArrow(c1 + 22, 142, c1 - 18, 158, 'under'),
  g({ head: { x: c2 + 16, y: 90 }, neck: { x: c2 + 8, y: 112 }, hip: { x: c2 - 10, y: 130 }, side: true, leftShoulder: { x: c2 + 4, y: 114 }, leftHand: { x: c2 + 38, y: 75 }, rightHand: { x: c2 - 6, y: G - 4 }, leftKnee: { x: c2 - 18, y: G - 18 }, rightKnee: { x: c2 - 4, y: G - 18 }, leftFoot: { x: c2 - 30, y: G }, rightFoot: { x: c2 - 14, y: G } }),
  redDot(c2 + 38, 75, 'open'),
]);

write('frog-pose', 'Frog pose form diagram', 'Frog pose: wide, settle, hold', ['WIDE', 'SETTLE', 'HOLD'], [
  g({ head: { x: c0, y: 100 }, neck: { x: c0, y: 114 }, hip: { x: c0, y: 148 }, leftShoulder: { x: c0 - 14, y: 118 }, rightShoulder: { x: c0 + 14, y: 118 }, leftElbow: { x: c0 - 20, y: 142 }, rightElbow: { x: c0 + 20, y: 142 }, leftHand: { x: c0 - 24, y: 158 }, rightHand: { x: c0 + 24, y: 158 }, leftKnee: { x: c0 - 42, y: 162 }, rightKnee: { x: c0 + 42, y: 162 }, leftFoot: { x: c0 - 48, y: G }, rightFoot: { x: c0 + 48, y: G } }),
  redDot(c0 - 42, 162, 'knees'),
  g({ head: { x: c1, y: 110 }, neck: { x: c1, y: 124 }, hip: { x: c1, y: 152 }, leftShoulder: { x: c1 - 14, y: 128 }, rightShoulder: { x: c1 + 14, y: 128 }, leftElbow: { x: c1 - 18, y: 150 }, rightElbow: { x: c1 + 18, y: 150 }, leftHand: { x: c1 - 22, y: 162 }, rightHand: { x: c1 + 22, y: 162 }, leftKnee: { x: c1 - 48, y: 164 }, rightKnee: { x: c1 + 48, y: 164 }, leftFoot: { x: c1 - 52, y: G }, rightFoot: { x: c1 + 52, y: G } }),
  redArrow(c1, 128, c1, 148, 'hips'),
  g({ head: { x: c2, y: 110 }, neck: { x: c2, y: 124 }, hip: { x: c2, y: 152 }, leftShoulder: { x: c2 - 14, y: 128 }, rightShoulder: { x: c2 + 14, y: 128 }, leftElbow: { x: c2 - 18, y: 150 }, rightElbow: { x: c2 + 18, y: 150 }, leftHand: { x: c2 - 22, y: 162 }, rightHand: { x: c2 + 22, y: 162 }, leftKnee: { x: c2 - 48, y: 164 }, rightKnee: { x: c2 + 48, y: 164 }, leftFoot: { x: c2 - 52, y: G }, rightFoot: { x: c2 + 52, y: G } }),
  redDot(c2, 152, 'breathe'),
]);

write('sled-push', 'Sled push form diagram', 'Sled push: lean, drive, finish', ['LEAN', 'DRIVE', 'FINISH'], [
  `  <rect x="${c0 + 28}" y="122" width="38" height="32" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g(poseHinge(c0, { lean: 0.45, barY: 120 })),
  redDot(c0, 128, 'lean'),
  `  <rect x="${c1 + 32}" y="122" width="38" height="32" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g(poseHinge(c1, { lean: 0.4, barY: 118 })),
  redArrow(c1 + 12, 158, c1 + 32, 140, 'drive'),
  `  <rect x="${c2 + 32}" y="122" width="38" height="32" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
  g(poseHinge(c2, { lean: 0.3, barY: 115 })),
  redDot(c2, 120, 'long'),
]);

console.log('\nRebuilt all form guides (hand-tuned poses).');
