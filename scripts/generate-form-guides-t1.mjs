#!/usr/bin/env node
/**
 * T1 — form SVGs for every structured guide that lacked media.
 * Run: node scripts/generate-form-guides-t1.mjs
 * Then wire ids into FORM_MEDIA_IDS + media/manifest.json.
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

function write(id, title, ariaLabel, labels, bodyParts) {
  const svg = formGuideSvg({
    id,
    title,
    ariaLabel,
    labels,
    body: bodyParts.join('\n'),
  });
  writeFileSync(path.join(outDir, `${id}.svg`), svg);
  console.log('wrote', id, `(${Buffer.byteLength(svg)} B)`);
}

const db = (x, y, r = 5) =>
  `  <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${INK}" stroke-width="2"></circle>`;
const box = (x, y, w, h) =>
  `  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="2"></rect>`;
const bar = (x1, y, x2) => equipmentBar(x1, y, x2, INK);

// ─── strength / gym ───────────────────────────────────────────────

write(
  'dead-bug',
  'Dead-bug form diagram',
  'Dead-bug form: setup, extend, switch',
  ['SETUP', 'EXTEND', 'SWITCH'],
  [
    stickGroup({
      head: { x: 55, y: 95 },
      hip: { x: 55, y: 145 },
      leftHand: { x: 35, y: 120 },
      rightHand: { x: 75, y: 120 },
      leftKnee: { x: 40, y: 160 },
      rightKnee: { x: 70, y: 160 },
      leftFoot: { x: 35, y: 175 },
      rightFoot: { x: 75, y: 175 },
    }),
    redDot(55, 145, 'ribs down'),
    stickGroup({
      head: { x: 180, y: 95 },
      hip: { x: 180, y: 145 },
      leftHand: { x: 155, y: 100 },
      rightHand: { x: 205, y: 155 },
      leftKnee: { x: 165, y: 160 },
      rightFoot: { x: 210, y: 175 },
      leftFoot: { x: 160, y: 175 },
    }),
    redArrow(200, 160, 215, 175, ''),
    stickGroup({
      head: { x: 300, y: 95 },
      hip: { x: 300, y: 145 },
      rightHand: { x: 325, y: 100 },
      leftHand: { x: 275, y: 155 },
      rightKnee: { x: 315, y: 160 },
      leftFoot: { x: 270, y: 175 },
      rightFoot: { x: 320, y: 175 },
    }),
    redDot(300, 145, 'switch'),
  ]
);

write(
  'thruster',
  'Thruster form diagram',
  'Thruster form: front rack squat, drive, overhead lockout',
  ['SQUAT', 'DRIVE', 'LOCK'],
  [
    stickGroup({
      head: { x: 60, y: 95 },
      hip: { x: 60, y: 145 },
      leftElbow: { x: 48, y: 105 },
      rightElbow: { x: 72, y: 105 },
      leftHand: { x: 42, y: 98 },
      rightHand: { x: 78, y: 98 },
      leftKnee: { x: 45, y: 165 },
      rightKnee: { x: 75, y: 165 },
      leftFoot: { x: 42, y: 175 },
      rightFoot: { x: 78, y: 175 },
    }),
    bar(40, 96, 80),
    redDot(60, 145, 'rack'),
    stickGroup({
      head: { x: 180, y: 60 },
      hip: { x: 180, y: 115 },
      leftElbow: { x: 168, y: 75 },
      rightElbow: { x: 192, y: 75 },
      leftHand: { x: 165, y: 55 },
      rightHand: { x: 195, y: 55 },
      leftFoot: { x: 168, y: 175 },
      rightFoot: { x: 192, y: 175 },
    }),
    bar(162, 52, 198),
    redArrow(180, 150, 180, 120, 'up'),
    stickGroup({
      head: { x: 300, y: 55 },
      hip: { x: 300, y: 115 },
      leftHand: { x: 290, y: 40 },
      rightHand: { x: 310, y: 40 },
      leftFoot: { x: 288, y: 175 },
      rightFoot: { x: 312, y: 175 },
    }),
    bar(285, 38, 315),
    redDot(300, 40, 'lock'),
  ]
);

write(
  'cable-row',
  'Cable row form diagram',
  'Cable row form: reach, pull, control return',
  ['REACH', 'PULL', 'RETURN'],
  [
    stickGroup({
      head: { x: 50, y: 70 },
      hip: { x: 70, y: 130 },
      leftHand: { x: 100, y: 100 },
      rightHand: { x: 100, y: 108 },
      leftFoot: { x: 55, y: 175 },
      rightFoot: { x: 85, y: 175 },
    }),
    bar(105, 104, 125),
    redDot(100, 104, 'arms long'),
    stickGroup({
      head: { x: 175, y: 70 },
      hip: { x: 190, y: 130 },
      leftElbow: { x: 160, y: 95 },
      rightElbow: { x: 200, y: 95 },
      leftHand: { x: 170, y: 100 },
      rightHand: { x: 190, y: 100 },
      leftFoot: { x: 175, y: 175 },
      rightFoot: { x: 205, y: 175 },
    }),
    redArrow(210, 110, 185, 100, 'ribs'),
    stickGroup({
      head: { x: 295, y: 70 },
      hip: { x: 310, y: 130 },
      leftHand: { x: 340, y: 100 },
      rightHand: { x: 340, y: 108 },
      leftFoot: { x: 295, y: 175 },
      rightFoot: { x: 325, y: 175 },
    }),
    bar(345, 104, 355),
    redArrow(325, 100, 340, 104, ''),
  ]
);

write(
  'lateral-raise',
  'Lateral raise form diagram',
  'Lateral raise form: hang, raise to side, lower',
  ['HANG', 'RAISE', 'LOWER'],
  [
    stickGroup({
      head: { x: 60, y: 58 },
      hip: { x: 60, y: 115 },
      leftHand: { x: 48, y: 145 },
      rightHand: { x: 72, y: 145 },
      leftFoot: { x: 50, y: 175 },
      rightFoot: { x: 70, y: 175 },
    }),
    db(48, 150),
    db(72, 150),
    redDot(60, 100, 'still'),
    stickGroup({
      head: { x: 180, y: 58 },
      hip: { x: 180, y: 115 },
      leftHand: { x: 140, y: 95 },
      rightHand: { x: 220, y: 95 },
      leftElbow: { x: 155, y: 100 },
      rightElbow: { x: 205, y: 100 },
      leftFoot: { x: 170, y: 175 },
      rightFoot: { x: 190, y: 175 },
    }),
    db(140, 95),
    db(220, 95),
    redDot(180, 95, 'shoulder'),
    stickGroup({
      head: { x: 300, y: 58 },
      hip: { x: 300, y: 115 },
      leftHand: { x: 275, y: 130 },
      rightHand: { x: 325, y: 130 },
      leftElbow: { x: 285, y: 115 },
      rightElbow: { x: 315, y: 115 },
      leftFoot: { x: 290, y: 175 },
      rightFoot: { x: 310, y: 175 },
    }),
    db(275, 135),
    db(325, 135),
    redArrow(300, 90, 300, 120, ''),
  ]
);

write(
  'hanging-leg-raise',
  'Hanging leg raise form diagram',
  'Hanging leg raise form: hang, raise legs, lower',
  ['HANG', 'RAISE', 'LOWER'],
  [
    bar(30, 45, 90),
    stickGroup({
      head: { x: 60, y: 70 },
      hip: { x: 60, y: 120 },
      leftHand: { x: 45, y: 50 },
      rightHand: { x: 75, y: 50 },
      leftFoot: { x: 52, y: 175 },
      rightFoot: { x: 68, y: 175 },
    }),
    redDot(60, 50, 'grip'),
    bar(150, 45, 210),
    stickGroup({
      head: { x: 180, y: 70 },
      hip: { x: 180, y: 115 },
      leftHand: { x: 165, y: 50 },
      rightHand: { x: 195, y: 50 },
      leftKnee: { x: 165, y: 145 },
      rightKnee: { x: 195, y: 145 },
      leftFoot: { x: 155, y: 130 },
      rightFoot: { x: 205, y: 130 },
    }),
    redArrow(180, 155, 180, 130, 'legs'),
    bar(270, 45, 330),
    stickGroup({
      head: { x: 300, y: 70 },
      hip: { x: 300, y: 120 },
      leftHand: { x: 285, y: 50 },
      rightHand: { x: 315, y: 50 },
      leftFoot: { x: 292, y: 165 },
      rightFoot: { x: 308, y: 165 },
    }),
    redArrow(300, 130, 300, 155, ''),
  ]
);

write(
  'box-jump',
  'Box jump form diagram',
  'Box jump form: load, explode onto box, soft land',
  ['LOAD', 'JUMP', 'LAND'],
  [
    stickGroup({
      head: { x: 50, y: 85 },
      hip: { x: 50, y: 140 },
      leftKnee: { x: 38, y: 160 },
      rightKnee: { x: 62, y: 160 },
      leftFoot: { x: 35, y: 175 },
      rightFoot: { x: 65, y: 175 },
      leftHand: { x: 35, y: 115 },
      rightHand: { x: 65, y: 115 },
    }),
    box(85, 130, 40, 45),
    redDot(50, 140, 'load'),
    stickGroup({
      head: { x: 175, y: 45 },
      hip: { x: 175, y: 95 },
      leftFoot: { x: 160, y: 130 },
      rightFoot: { x: 190, y: 130 },
      leftHand: { x: 155, y: 70 },
      rightHand: { x: 195, y: 70 },
    }),
    box(200, 130, 40, 45),
    redArrow(175, 150, 175, 115, 'up'),
    stickGroup({
      head: { x: 295, y: 55 },
      hip: { x: 295, y: 100 },
      leftKnee: { x: 285, y: 120 },
      rightKnee: { x: 305, y: 120 },
      leftFoot: { x: 282, y: 130 },
      rightFoot: { x: 308, y: 130 },
      leftHand: { x: 275, y: 80 },
      rightHand: { x: 315, y: 80 },
    }),
    box(270, 130, 55, 45),
    redDot(295, 130, 'soft'),
  ]
);

write(
  'skull-crusher',
  'Skull crusher form diagram',
  'Skull crusher form: start, bend elbows, extend',
  ['START', 'BEND', 'EXTEND'],
  [
    stickGroup({
      head: { x: 60, y: 95 },
      hip: { x: 60, y: 145 },
      leftHand: { x: 45, y: 70 },
      rightHand: { x: 75, y: 70 },
      leftElbow: { x: 50, y: 90 },
      rightElbow: { x: 70, y: 90 },
      leftFoot: { x: 40, y: 175 },
      rightFoot: { x: 80, y: 145 },
    }),
    // lying on bench
    box(25, 140, 70, 10),
    bar(40, 68, 80),
    redDot(60, 90, 'elbows'),
    stickGroup({
      head: { x: 180, y: 95 },
      hip: { x: 180, y: 145 },
      leftElbow: { x: 168, y: 90 },
      rightElbow: { x: 192, y: 90 },
      leftHand: { x: 160, y: 110 },
      rightHand: { x: 200, y: 110 },
      leftFoot: { x: 160, y: 175 },
      rightFoot: { x: 200, y: 145 },
    }),
    box(145, 140, 70, 10),
    bar(155, 112, 205),
    redArrow(180, 75, 180, 105, 'down'),
    stickGroup({
      head: { x: 300, y: 95 },
      hip: { x: 300, y: 145 },
      leftHand: { x: 285, y: 70 },
      rightHand: { x: 315, y: 70 },
      leftElbow: { x: 290, y: 90 },
      rightElbow: { x: 310, y: 90 },
      leftFoot: { x: 280, y: 175 },
      rightFoot: { x: 320, y: 145 },
    }),
    box(265, 140, 70, 10),
    bar(280, 68, 320),
    redArrow(300, 105, 300, 75, ''),
  ]
);

write(
  'calf-raise',
  'Calf raise form diagram',
  'Calf raise form: flat, rise on toes, lower',
  ['FLAT', 'RISE', 'LOWER'],
  [
    stickGroup({
      head: { x: 60, y: 55 },
      hip: { x: 60, y: 115 },
      leftFoot: { x: 52, y: 175 },
      rightFoot: { x: 68, y: 175 },
      leftHand: { x: 48, y: 100 },
      rightHand: { x: 72, y: 100 },
    }),
    redDot(60, 175, 'full foot'),
    stickGroup({
      head: { x: 180, y: 48 },
      hip: { x: 180, y: 108 },
      leftFoot: { x: 172, y: 165 },
      rightFoot: { x: 188, y: 165 },
      leftHand: { x: 168, y: 95 },
      rightHand: { x: 192, y: 95 },
    }),
    // heel lift lines
    `  <line x1="168" y1="175" x2="172" y2="165" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 2"></line>`,
    `  <line x1="192" y1="175" x2="188" y2="165" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 2"></line>`,
    redDot(180, 165, 'toes'),
    stickGroup({
      head: { x: 300, y: 55 },
      hip: { x: 300, y: 115 },
      leftFoot: { x: 292, y: 175 },
      rightFoot: { x: 308, y: 175 },
      leftHand: { x: 288, y: 100 },
      rightHand: { x: 312, y: 100 },
    }),
    redArrow(300, 155, 300, 170, ''),
  ]
);

write(
  'leg-press',
  'Leg press form diagram',
  'Leg press form: start, bend knees, press',
  ['START', 'BEND', 'PRESS'],
  [
    // seated on sled - simplified
    box(25, 100, 55, 50),
    stickGroup({
      head: { x: 45, y: 85 },
      hip: { x: 55, y: 130 },
      leftKnee: { x: 75, y: 120 },
      rightKnee: { x: 80, y: 130 },
      leftFoot: { x: 100, y: 110 },
      rightFoot: { x: 100, y: 125 },
    }),
    box(95, 100, 20, 40),
    redDot(100, 118, 'feet'),
    box(145, 100, 55, 50),
    stickGroup({
      head: { x: 165, y: 85 },
      hip: { x: 175, y: 130 },
      leftKnee: { x: 200, y: 145 },
      rightKnee: { x: 205, y: 150 },
      leftFoot: { x: 220, y: 130 },
      rightFoot: { x: 220, y: 145 },
    }),
    box(215, 120, 20, 40),
    redArrow(195, 115, 210, 130, ''),
    box(265, 100, 55, 50),
    stickGroup({
      head: { x: 285, y: 85 },
      hip: { x: 295, y: 130 },
      leftKnee: { x: 315, y: 120 },
      rightKnee: { x: 320, y: 130 },
      leftFoot: { x: 340, y: 110 },
      rightFoot: { x: 340, y: 125 },
    }),
    box(335, 100, 20, 40),
    redArrow(325, 140, 335, 120, 'press'),
  ]
);

write(
  'band-pull-apart',
  'Band pull-apart form diagram',
  'Band pull-apart form: hold, pull apart, return',
  ['HOLD', 'PULL', 'RETURN'],
  [
    stickGroup({
      head: { x: 60, y: 58 },
      hip: { x: 60, y: 115 },
      leftHand: { x: 40, y: 95 },
      rightHand: { x: 80, y: 95 },
      leftFoot: { x: 50, y: 175 },
      rightFoot: { x: 70, y: 175 },
    }),
    `  <path d="M40 95 Q60 100 80 95" stroke="${INK}" stroke-width="2" fill="none"></path>`,
    redDot(60, 98, 'band'),
    stickGroup({
      head: { x: 180, y: 58 },
      hip: { x: 180, y: 115 },
      leftHand: { x: 140, y: 90 },
      rightHand: { x: 220, y: 90 },
      leftFoot: { x: 170, y: 175 },
      rightFoot: { x: 190, y: 175 },
    }),
    `  <path d="M140 90 Q180 88 220 90" stroke="${INK}" stroke-width="2" fill="none"></path>`,
    redArrow(155, 100, 145, 90, ''),
    redArrow(205, 100, 215, 90, ''),
    stickGroup({
      head: { x: 300, y: 58 },
      hip: { x: 300, y: 115 },
      leftHand: { x: 280, y: 95 },
      rightHand: { x: 320, y: 95 },
      leftFoot: { x: 290, y: 175 },
      rightFoot: { x: 310, y: 175 },
    }),
    `  <path d="M280 95 Q300 100 320 95" stroke="${INK}" stroke-width="2" fill="none"></path>`,
    redDot(300, 98, 'control'),
  ]
);

write(
  'superman',
  'Superman form diagram',
  'Superman form: prone, lift limbs, hold',
  ['PRONE', 'LIFT', 'HOLD'],
  [
    stickGroup({
      head: { x: 95, y: 130 },
      hip: { x: 55, y: 145 },
      leftHand: { x: 110, y: 145 },
      rightHand: { x: 105, y: 150 },
      leftFoot: { x: 25, y: 150 },
      rightFoot: { x: 30, y: 155 },
    }),
    redDot(55, 145, 'floor'),
    stickGroup({
      head: { x: 215, y: 110 },
      hip: { x: 175, y: 130 },
      leftHand: { x: 240, y: 105 },
      rightHand: { x: 235, y: 115 },
      leftFoot: { x: 145, y: 120 },
      rightFoot: { x: 150, y: 130 },
    }),
    redArrow(175, 150, 175, 130, ''),
    stickGroup({
      head: { x: 330, y: 110 },
      hip: { x: 295, y: 130 },
      leftHand: { x: 355, y: 105 },
      rightHand: { x: 350, y: 115 },
      leftFoot: { x: 265, y: 120 },
      rightFoot: { x: 270, y: 130 },
    }),
    redDot(295, 130, 'squeeze'),
  ]
);

write(
  'negative-pullup',
  'Negative pull-up form diagram',
  'Negative pull-up form: chin over, slow lower, hang',
  ['TOP', 'LOWER', 'HANG'],
  [
    bar(30, 50, 90),
    stickGroup({
      head: { x: 60, y: 65 },
      hip: { x: 60, y: 115 },
      leftHand: { x: 45, y: 55 },
      rightHand: { x: 75, y: 55 },
      leftFoot: { x: 52, y: 155 },
      rightFoot: { x: 68, y: 155 },
    }),
    redDot(60, 55, 'chin over'),
    bar(150, 50, 210),
    stickGroup({
      head: { x: 180, y: 85 },
      hip: { x: 180, y: 135 },
      leftHand: { x: 165, y: 55 },
      rightHand: { x: 195, y: 55 },
      leftElbow: { x: 165, y: 90 },
      rightElbow: { x: 195, y: 90 },
      leftFoot: { x: 172, y: 165 },
      rightFoot: { x: 188, y: 165 },
    }),
    redArrow(200, 70, 200, 100, 'slow'),
    bar(270, 50, 330),
    stickGroup({
      head: { x: 300, y: 100 },
      hip: { x: 300, y: 150 },
      leftHand: { x: 285, y: 55 },
      rightHand: { x: 315, y: 55 },
      leftFoot: { x: 292, y: 175 },
      rightFoot: { x: 308, y: 175 },
    }),
    redDot(300, 150, 'full hang'),
  ]
);

write(
  'crunches',
  'Crunches form diagram',
  'Crunches form: setup, curl ribs, lower',
  ['SETUP', 'CURL', 'LOWER'],
  [
    stickGroup({
      head: { x: 55, y: 115 },
      hip: { x: 55, y: 150 },
      leftHand: { x: 45, y: 105 },
      rightHand: { x: 65, y: 105 },
      leftKnee: { x: 75, y: 155 },
      rightKnee: { x: 80, y: 160 },
      leftFoot: { x: 90, y: 175 },
      rightFoot: { x: 95, y: 175 },
    }),
    redDot(55, 150, 'low back'),
    stickGroup({
      head: { x: 175, y: 95 },
      hip: { x: 180, y: 150 },
      leftHand: { x: 165, y: 90 },
      rightHand: { x: 185, y: 90 },
      leftKnee: { x: 200, y: 155 },
      rightKnee: { x: 205, y: 160 },
      leftFoot: { x: 215, y: 175 },
      rightFoot: { x: 220, y: 175 },
    }),
    redArrow(175, 120, 175, 100, 'ribs'),
    stickGroup({
      head: { x: 295, y: 115 },
      hip: { x: 300, y: 150 },
      leftHand: { x: 285, y: 105 },
      rightHand: { x: 305, y: 105 },
      leftKnee: { x: 320, y: 155 },
      rightKnee: { x: 325, y: 160 },
      leftFoot: { x: 335, y: 175 },
      rightFoot: { x: 340, y: 175 },
    }),
    redArrow(295, 100, 295, 115, ''),
  ]
);

// ─── mobility / floor ─────────────────────────────────────────────

write(
  'cat-camel',
  'Cat-camel form diagram',
  'Cat-camel form: neutral, cat round, camel arch',
  ['NEUTRAL', 'CAT', 'CAMEL'],
  [
    stickGroup({
      head: { x: 80, y: 100 },
      hip: { x: 50, y: 125 },
      leftHand: { x: 90, y: 155 },
      rightHand: { x: 70, y: 155 },
      leftKnee: { x: 40, y: 155 },
      rightKnee: { x: 55, y: 155 },
      leftFoot: { x: 30, y: 165 },
      rightFoot: { x: 48, y: 165 },
    }),
    redDot(50, 125, 'neutral'),
    stickGroup({
      head: { x: 200, y: 115 },
      hip: { x: 170, y: 100 },
      leftHand: { x: 210, y: 155 },
      rightHand: { x: 190, y: 155 },
      leftKnee: { x: 160, y: 155 },
      rightKnee: { x: 175, y: 155 },
      leftFoot: { x: 150, y: 165 },
      rightFoot: { x: 168, y: 165 },
    }),
    redDot(170, 100, 'round'),
    stickGroup({
      head: { x: 320, y: 95 },
      hip: { x: 290, y: 140 },
      leftHand: { x: 330, y: 155 },
      rightHand: { x: 310, y: 155 },
      leftKnee: { x: 280, y: 155 },
      rightKnee: { x: 295, y: 155 },
      leftFoot: { x: 270, y: 165 },
      rightFoot: { x: 288, y: 165 },
    }),
    redDot(290, 140, 'arch'),
  ]
);

write(
  'couch-stretch',
  'Couch stretch form diagram',
  'Couch stretch form: setup, upright, hold',
  ['SETUP', 'UPRIGHT', 'HOLD'],
  [
    box(70, 100, 35, 75),
    stickGroup({
      head: { x: 50, y: 80 },
      hip: { x: 55, y: 130 },
      leftKnee: { x: 80, y: 150 },
      leftFoot: { x: 95, y: 120 },
      rightKnee: { x: 45, y: 155 },
      rightFoot: { x: 40, y: 175 },
      leftHand: { x: 40, y: 110 },
      rightHand: { x: 60, y: 110 },
    }),
    redDot(80, 150, 'rear knee'),
    box(190, 100, 35, 75),
    stickGroup({
      head: { x: 170, y: 60 },
      hip: { x: 175, y: 120 },
      leftKnee: { x: 200, y: 150 },
      leftFoot: { x: 215, y: 120 },
      rightKnee: { x: 160, y: 150 },
      rightFoot: { x: 155, y: 175 },
      leftHand: { x: 160, y: 90 },
      rightHand: { x: 180, y: 90 },
    }),
    redDot(175, 60, 'tall'),
    box(310, 100, 35, 75),
    stickGroup({
      head: { x: 290, y: 60 },
      hip: { x: 295, y: 120 },
      leftKnee: { x: 320, y: 150 },
      leftFoot: { x: 335, y: 120 },
      rightKnee: { x: 280, y: 150 },
      rightFoot: { x: 275, y: 175 },
      leftHand: { x: 280, y: 90 },
      rightHand: { x: 300, y: 90 },
    }),
    redDot(295, 120, 'breathe'),
  ]
);

write(
  'bear-crawl',
  'Bear crawl form diagram',
  'Bear crawl form: hover, step, advance',
  ['HOVER', 'STEP', 'ADVANCE'],
  [
    stickGroup({
      head: { x: 80, y: 95 },
      hip: { x: 50, y: 120 },
      leftHand: { x: 90, y: 155 },
      rightHand: { x: 70, y: 155 },
      leftKnee: { x: 40, y: 145 },
      rightKnee: { x: 55, y: 145 },
      leftFoot: { x: 30, y: 160 },
      rightFoot: { x: 48, y: 160 },
    }),
    redDot(50, 145, 'knees off'),
    stickGroup({
      head: { x: 200, y: 95 },
      hip: { x: 170, y: 120 },
      leftHand: { x: 220, y: 155 },
      rightHand: { x: 185, y: 155 },
      leftKnee: { x: 155, y: 145 },
      rightFoot: { x: 175, y: 160 },
      leftFoot: { x: 145, y: 160 },
    }),
    redArrow(210, 145, 225, 155, ''),
    stickGroup({
      head: { x: 320, y: 95 },
      hip: { x: 290, y: 120 },
      leftHand: { x: 330, y: 155 },
      rightHand: { x: 310, y: 155 },
      rightKnee: { x: 275, y: 145 },
      leftFoot: { x: 300, y: 160 },
      rightFoot: { x: 265, y: 160 },
    }),
    redArrow(295, 130, 310, 125, 'crawl'),
  ]
);

write(
  'inchworm',
  'Inchworm form diagram',
  'Inchworm form: stand, walk hands out, walk feet in',
  ['STAND', 'WALK OUT', 'WALK IN'],
  [
    stickGroup({
      head: { x: 60, y: 55 },
      hip: { x: 60, y: 115 },
      leftHand: { x: 50, y: 100 },
      rightHand: { x: 70, y: 100 },
      leftFoot: { x: 50, y: 175 },
      rightFoot: { x: 70, y: 175 },
    }),
    redDot(60, 115, ''),
    stickGroup({
      head: { x: 210, y: 100 },
      hip: { x: 160, y: 125 },
      leftHand: { x: 230, y: 155 },
      rightHand: { x: 220, y: 155 },
      leftFoot: { x: 145, y: 175 },
      rightFoot: { x: 155, y: 175 },
    }),
    redArrow(200, 140, 225, 155, 'hands'),
    stickGroup({
      head: { x: 310, y: 85 },
      hip: { x: 290, y: 115 },
      leftHand: { x: 330, y: 155 },
      rightHand: { x: 320, y: 155 },
      leftFoot: { x: 275, y: 155 },
      rightFoot: { x: 285, y: 155 },
    }),
    redArrow(280, 160, 290, 155, 'feet'),
  ]
);

write(
  'single-leg-glute',
  'Single-leg glute bridge form diagram',
  'Single-leg glute bridge form: setup, drive, lower',
  ['SETUP', 'DRIVE', 'LOWER'],
  [
    stickGroup({
      head: { x: 50, y: 120 },
      hip: { x: 70, y: 150 },
      leftKnee: { x: 90, y: 155 },
      leftFoot: { x: 100, y: 175 },
      rightFoot: { x: 85, y: 140 },
      leftHand: { x: 40, y: 155 },
      rightHand: { x: 55, y: 155 },
    }),
    redDot(70, 150, 'one leg'),
    stickGroup({
      head: { x: 170, y: 110 },
      hip: { x: 195, y: 125 },
      leftKnee: { x: 215, y: 150 },
      leftFoot: { x: 225, y: 175 },
      rightFoot: { x: 210, y: 105 },
      leftHand: { x: 160, y: 155 },
      rightHand: { x: 175, y: 155 },
    }),
    redArrow(195, 150, 195, 125, 'hips'),
    stickGroup({
      head: { x: 290, y: 120 },
      hip: { x: 310, y: 150 },
      leftKnee: { x: 330, y: 155 },
      leftFoot: { x: 340, y: 175 },
      rightFoot: { x: 325, y: 140 },
      leftHand: { x: 280, y: 155 },
      rightHand: { x: 295, y: 155 },
    }),
    redArrow(310, 130, 310, 148, ''),
  ]
);

write(
  'wall-angels',
  'Wall angels form diagram',
  'Wall angels form: contact, slide up, return',
  ['CONTACT', 'SLIDE UP', 'RETURN'],
  [
    // wall line
    `  <line x1="25" y1="50" x2="25" y2="175" stroke="${INK}" stroke-width="2"></line>`,
    stickGroup({
      head: { x: 50, y: 70 },
      hip: { x: 55, y: 130 },
      leftElbow: { x: 40, y: 100 },
      rightElbow: { x: 70, y: 100 },
      leftHand: { x: 35, y: 85 },
      rightHand: { x: 75, y: 85 },
      leftFoot: { x: 48, y: 175 },
      rightFoot: { x: 65, y: 175 },
    }),
    redDot(40, 100, 'wall'),
    `  <line x1="145" y1="50" x2="145" y2="175" stroke="${INK}" stroke-width="2"></line>`,
    stickGroup({
      head: { x: 170, y: 70 },
      hip: { x: 175, y: 130 },
      leftElbow: { x: 155, y: 75 },
      rightElbow: { x: 195, y: 75 },
      leftHand: { x: 150, y: 55 },
      rightHand: { x: 200, y: 55 },
      leftFoot: { x: 168, y: 175 },
      rightFoot: { x: 185, y: 175 },
    }),
    redArrow(175, 100, 175, 70, 'up'),
    `  <line x1="265" y1="50" x2="265" y2="175" stroke="${INK}" stroke-width="2"></line>`,
    stickGroup({
      head: { x: 290, y: 70 },
      hip: { x: 295, y: 130 },
      leftElbow: { x: 280, y: 100 },
      rightElbow: { x: 310, y: 100 },
      leftHand: { x: 275, y: 85 },
      rightHand: { x: 315, y: 85 },
      leftFoot: { x: 288, y: 175 },
      rightFoot: { x: 305, y: 175 },
    }),
    redArrow(295, 70, 295, 95, ''),
  ]
);

write(
  'thread-needle',
  'Thread the needle form diagram',
  'Thread the needle form: setup, reach under, open',
  ['SETUP', 'THREAD', 'OPEN'],
  [
    stickGroup({
      head: { x: 80, y: 100 },
      hip: { x: 50, y: 125 },
      leftHand: { x: 90, y: 155 },
      rightHand: { x: 70, y: 155 },
      leftKnee: { x: 40, y: 155 },
      rightKnee: { x: 55, y: 155 },
      leftFoot: { x: 30, y: 165 },
      rightFoot: { x: 48, y: 165 },
    }),
    redDot(50, 125, ''),
    stickGroup({
      head: { x: 175, y: 140 },
      hip: { x: 170, y: 130 },
      leftHand: { x: 140, y: 155 },
      rightHand: { x: 210, y: 155 },
      leftKnee: { x: 160, y: 155 },
      rightKnee: { x: 175, y: 155 },
      leftFoot: { x: 150, y: 165 },
      rightFoot: { x: 168, y: 165 },
    }),
    redArrow(190, 140, 155, 150, 'under'),
    stickGroup({
      head: { x: 300, y: 85 },
      hip: { x: 290, y: 125 },
      leftHand: { x: 330, y: 70 },
      rightHand: { x: 280, y: 155 },
      leftKnee: { x: 280, y: 155 },
      rightKnee: { x: 295, y: 155 },
      leftFoot: { x: 270, y: 165 },
      rightFoot: { x: 288, y: 165 },
    }),
    redDot(330, 70, 'open'),
  ]
);

write(
  'frog-pose',
  'Frog pose form diagram',
  'Frog pose form: knees wide, settle, hold',
  ['WIDE', 'SETTLE', 'HOLD'],
  [
    stickGroup({
      head: { x: 60, y: 95 },
      hip: { x: 60, y: 140 },
      leftElbow: { x: 50, y: 130 },
      rightElbow: { x: 70, y: 130 },
      leftHand: { x: 45, y: 145 },
      rightHand: { x: 75, y: 145 },
      leftKnee: { x: 30, y: 155 },
      rightKnee: { x: 90, y: 155 },
      leftFoot: { x: 25, y: 175 },
      rightFoot: { x: 95, y: 175 },
    }),
    redDot(30, 155, 'knees'),
    stickGroup({
      head: { x: 180, y: 105 },
      hip: { x: 180, y: 145 },
      leftElbow: { x: 170, y: 140 },
      rightElbow: { x: 190, y: 140 },
      leftHand: { x: 165, y: 155 },
      rightHand: { x: 195, y: 155 },
      leftKnee: { x: 145, y: 160 },
      rightKnee: { x: 215, y: 160 },
      leftFoot: { x: 140, y: 175 },
      rightFoot: { x: 220, y: 175 },
    }),
    redArrow(180, 120, 180, 140, 'hips'),
    stickGroup({
      head: { x: 300, y: 105 },
      hip: { x: 300, y: 145 },
      leftElbow: { x: 290, y: 140 },
      rightElbow: { x: 310, y: 140 },
      leftHand: { x: 285, y: 155 },
      rightHand: { x: 315, y: 155 },
      leftKnee: { x: 265, y: 160 },
      rightKnee: { x: 335, y: 160 },
      leftFoot: { x: 260, y: 175 },
      rightFoot: { x: 340, y: 175 },
    }),
    redDot(300, 145, 'breathe'),
  ]
);

write(
  'sled-push',
  'Sled push form diagram',
  'Sled push form: lean, drive, finish',
  ['LEAN', 'DRIVE', 'FINISH'],
  [
    box(70, 120, 40, 35),
    stickGroup({
      head: { x: 45, y: 85 },
      hip: { x: 40, y: 130 },
      leftHand: { x: 75, y: 115 },
      rightHand: { x: 85, y: 125 },
      leftFoot: { x: 30, y: 175 },
      rightFoot: { x: 50, y: 175 },
    }),
    redDot(40, 130, 'lean'),
    box(190, 120, 40, 35),
    stickGroup({
      head: { x: 160, y: 80 },
      hip: { x: 155, y: 125 },
      leftHand: { x: 195, y: 115 },
      rightHand: { x: 205, y: 125 },
      leftKnee: { x: 145, y: 155 },
      rightFoot: { x: 175, y: 175 },
      leftFoot: { x: 140, y: 175 },
    }),
    redArrow(170, 150, 190, 140, 'drive'),
    box(310, 120, 40, 35),
    stickGroup({
      head: { x: 280, y: 75 },
      hip: { x: 275, y: 120 },
      leftHand: { x: 315, y: 115 },
      rightHand: { x: 325, y: 125 },
      leftFoot: { x: 260, y: 175 },
      rightFoot: { x: 285, y: 175 },
    }),
    redDot(275, 120, 'long'),
  ]
);

console.log('T1 form guides written (22).');
