#!/usr/bin/env node
/**
 * Shared movement-pattern form diagrams for long-tail exercises.
 * Ship under public/form-guides/pattern-*.svg — never claim exercise-specific art.
 *
 * Run: node scripts/generate-form-patterns.mjs
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
  INK,
} from './form-kit/stickFigure.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'form-guides');

function write(id, title, aria, labels, body) {
  const svg = formGuideSvg({
    id,
    title,
    ariaLabel: aria,
    labels,
    body: body.join('\n'),
  });
  writeFileSync(path.join(outDir, `${id}.svg`), svg);
  console.log('wrote', id, Buffer.byteLength(svg), 'B');
}

const bar = (x1, y, x2) => equipmentBar(x1, y, x2, INK);

// Squat pattern — stand → sit → drive
write(
  'pattern-squat',
  'Squat pattern form diagram',
  'Shared squat pattern: stand, depth, drive',
  ['STAND', 'DEPTH', 'DRIVE'],
  [
    stickGroup({
      head: { x: 60, y: 55 },
      hip: { x: 60, y: 115 },
      leftFoot: { x: 48, y: 175 },
      rightFoot: { x: 72, y: 175 },
      leftHand: { x: 45, y: 100 },
      rightHand: { x: 75, y: 100 },
    }),
    redDot(60, 115, 'brace'),
    stickGroup({
      head: { x: 180, y: 90 },
      hip: { x: 180, y: 145 },
      leftKnee: { x: 160, y: 165 },
      rightKnee: { x: 200, y: 165 },
      leftFoot: { x: 155, y: 175 },
      rightFoot: { x: 205, y: 175 },
      leftHand: { x: 165, y: 120 },
      rightHand: { x: 195, y: 120 },
    }),
    redDot(180, 145, 'hips'),
    stickGroup({
      head: { x: 300, y: 55 },
      hip: { x: 300, y: 115 },
      leftFoot: { x: 288, y: 175 },
      rightFoot: { x: 312, y: 175 },
      leftHand: { x: 285, y: 100 },
      rightHand: { x: 315, y: 100 },
    }),
    redArrow(300, 150, 300, 120, 'drive'),
  ]
);

// Hinge pattern
write(
  'pattern-hinge',
  'Hinge pattern form diagram',
  'Shared hinge pattern: setup, hinge, lockout',
  ['SETUP', 'HINGE', 'LOCK'],
  [
    stickGroup({
      head: { x: 60, y: 60 },
      hip: { x: 60, y: 115 },
      leftHand: { x: 50, y: 145 },
      rightHand: { x: 70, y: 145 },
      leftFoot: { x: 48, y: 175 },
      rightFoot: { x: 72, y: 175 },
    }),
    bar(40, 150, 80),
    redDot(60, 115, 'soft knee'),
    stickGroup({
      head: { x: 185, y: 85 },
      hip: { x: 170, y: 140 },
      leftHand: { x: 160, y: 155 },
      rightHand: { x: 180, y: 155 },
      leftFoot: { x: 160, y: 175 },
      rightFoot: { x: 190, y: 175 },
    }),
    bar(150, 160, 195),
    redDot(170, 140, 'hips back'),
    stickGroup({
      head: { x: 300, y: 55 },
      hip: { x: 300, y: 115 },
      leftHand: { x: 290, y: 125 },
      rightHand: { x: 310, y: 125 },
      leftFoot: { x: 288, y: 175 },
      rightFoot: { x: 312, y: 175 },
    }),
    bar(280, 128, 320),
    redDot(300, 115, 'lock'),
  ]
);

// Push pattern (horizontal/vertical generic)
write(
  'pattern-push',
  'Push pattern form diagram',
  'Shared push pattern: setup, lower, press',
  ['SETUP', 'LOWER', 'PRESS'],
  [
    stickGroup({
      head: { x: 80, y: 95 },
      hip: { x: 50, y: 125 },
      leftHand: { x: 95, y: 155 },
      rightHand: { x: 85, y: 155 },
      leftFoot: { x: 30, y: 155 },
      rightFoot: { x: 40, y: 155 },
    }),
    redDot(50, 125, 'line'),
    stickGroup({
      head: { x: 200, y: 115 },
      hip: { x: 170, y: 135 },
      leftHand: { x: 215, y: 155 },
      rightHand: { x: 205, y: 155 },
      leftFoot: { x: 150, y: 155 },
      rightFoot: { x: 160, y: 155 },
    }),
    redArrow(190, 100, 190, 125, ''),
    stickGroup({
      head: { x: 320, y: 95 },
      hip: { x: 290, y: 125 },
      leftHand: { x: 335, y: 155 },
      rightHand: { x: 325, y: 155 },
      leftFoot: { x: 270, y: 155 },
      rightFoot: { x: 280, y: 155 },
    }),
    redArrow(310, 140, 310, 110, 'press'),
  ]
);

// Pull pattern
write(
  'pattern-pull',
  'Pull pattern form diagram',
  'Shared pull pattern: hang, pull, lower',
  ['HANG', 'PULL', 'LOWER'],
  [
    bar(30, 50, 90),
    stickGroup({
      head: { x: 60, y: 95 },
      hip: { x: 60, y: 145 },
      leftHand: { x: 45, y: 55 },
      rightHand: { x: 75, y: 55 },
      leftFoot: { x: 52, y: 175 },
      rightFoot: { x: 68, y: 175 },
    }),
    redDot(60, 55, 'grip'),
    bar(150, 50, 210),
    stickGroup({
      head: { x: 180, y: 70 },
      hip: { x: 180, y: 120 },
      leftHand: { x: 165, y: 55 },
      rightHand: { x: 195, y: 55 },
      leftElbow: { x: 160, y: 85 },
      rightElbow: { x: 200, y: 85 },
      leftFoot: { x: 172, y: 165 },
      rightFoot: { x: 188, y: 165 },
    }),
    redArrow(200, 100, 200, 75, 'pull'),
    bar(270, 50, 330),
    stickGroup({
      head: { x: 300, y: 95 },
      hip: { x: 300, y: 145 },
      leftHand: { x: 285, y: 55 },
      rightHand: { x: 315, y: 55 },
      leftFoot: { x: 292, y: 175 },
      rightFoot: { x: 308, y: 175 },
    }),
    redArrow(315, 70, 315, 100, ''),
  ]
);

// Core pattern
write(
  'pattern-core',
  'Core pattern form diagram',
  'Shared core pattern: brace, challenge, hold',
  ['BRACE', 'CHALLENGE', 'HOLD'],
  [
    stickGroup({
      head: { x: 80, y: 100 },
      hip: { x: 50, y: 125 },
      leftHand: { x: 90, y: 155 },
      rightHand: { x: 70, y: 155 },
      leftFoot: { x: 30, y: 155 },
      rightFoot: { x: 40, y: 155 },
    }),
    redDot(50, 125, 'ribs'),
    stickGroup({
      head: { x: 200, y: 95 },
      hip: { x: 170, y: 125 },
      leftHand: { x: 230, y: 100 },
      rightHand: { x: 185, y: 155 },
      leftFoot: { x: 150, y: 155 },
      rightFoot: { x: 165, y: 100 },
    }),
    redDot(170, 125, 'level'),
    stickGroup({
      head: { x: 320, y: 95 },
      hip: { x: 290, y: 125 },
      leftHand: { x: 350, y: 100 },
      rightHand: { x: 305, y: 155 },
      leftFoot: { x: 270, y: 155 },
      rightFoot: { x: 285, y: 100 },
    }),
    redDot(290, 125, 'hold'),
  ]
);

// Locomotion / conditioning
write(
  'pattern-loco',
  'Locomotion pattern form diagram',
  'Shared locomotion pattern: load, drive, recover',
  ['LOAD', 'DRIVE', 'RECOVER'],
  [
    stickGroup({
      head: { x: 55, y: 70 },
      hip: { x: 55, y: 120 },
      leftKnee: { x: 45, y: 155 },
      rightKnee: { x: 70, y: 145 },
      leftFoot: { x: 42, y: 175 },
      rightFoot: { x: 75, y: 175 },
      leftHand: { x: 40, y: 95 },
      rightHand: { x: 70, y: 100 },
    }),
    redDot(55, 120, ''),
    stickGroup({
      head: { x: 180, y: 55 },
      hip: { x: 180, y: 110 },
      leftKnee: { x: 165, y: 145 },
      rightFoot: { x: 200, y: 140 },
      leftFoot: { x: 160, y: 175 },
      rightKnee: { x: 195, y: 130 },
      leftHand: { x: 160, y: 80 },
      rightHand: { x: 200, y: 90 },
    }),
    redArrow(180, 160, 200, 145, ''),
    stickGroup({
      head: { x: 300, y: 70 },
      hip: { x: 300, y: 120 },
      leftFoot: { x: 288, y: 175 },
      rightFoot: { x: 312, y: 175 },
      leftHand: { x: 285, y: 100 },
      rightHand: { x: 315, y: 100 },
    }),
    redDot(300, 120, 'reset'),
  ]
);

// Isolation / arm raise generic
write(
  'pattern-isolation',
  'Isolation pattern form diagram',
  'Shared isolation pattern: start, peak contraction, control return',
  ['START', 'PEAK', 'RETURN'],
  [
    stickGroup({
      head: { x: 60, y: 58 },
      hip: { x: 60, y: 115 },
      leftHand: { x: 48, y: 145 },
      rightHand: { x: 72, y: 145 },
      leftFoot: { x: 50, y: 175 },
      rightFoot: { x: 70, y: 175 },
    }),
    redDot(60, 100, 'still'),
    stickGroup({
      head: { x: 180, y: 58 },
      hip: { x: 180, y: 115 },
      leftElbow: { x: 168, y: 100 },
      rightElbow: { x: 192, y: 100 },
      leftHand: { x: 155, y: 80 },
      rightHand: { x: 205, y: 80 },
      leftFoot: { x: 170, y: 175 },
      rightFoot: { x: 190, y: 175 },
    }),
    redDot(180, 90, 'squeeze'),
    stickGroup({
      head: { x: 300, y: 58 },
      hip: { x: 300, y: 115 },
      leftHand: { x: 288, y: 140 },
      rightHand: { x: 312, y: 140 },
      leftFoot: { x: 290, y: 175 },
      rightFoot: { x: 310, y: 175 },
    }),
    redArrow(300, 95, 300, 125, 'control'),
  ]
);

console.log('Pattern pack written (7).');
