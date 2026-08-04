#!/usr/bin/env node
/**
 * T0 craft pass — rewrite clone-cluster form guides as unique poses.
 * Run: node scripts/generate-form-guides-t0.mjs
 *
 * Uses scripts/form-kit/stickFigure.mjs. Does not replace the whole catalog —
 * only the pairs that failed structural uniqueness (template clones).
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

function write(id, svg) {
  const p = path.join(outDir, `${id}.svg`);
  writeFileSync(p, svg);
  console.log('wrote', path.relative(root, p), `(${Buffer.byteLength(svg)} B)`);
}

// ─── bicep-curl: hang → curl → lower (elbows pinned, dumbbell arcs) ───
write(
  'bicep-curl',
  formGuideSvg({
    id: 'bicep-curl',
    title: 'Bicep curl form diagram',
    ariaLabel: 'Bicep curl form: hang, curl, lower',
    labels: ['HANG', 'CURL', 'LOWER'],
    body: [
      // Hang — arms long at sides, dumbbells at thighs
      stickGroup({
        head: { x: 60, y: 58 },
        hip: { x: 60, y: 115 },
        leftHand: { x: 48, y: 145 },
        rightHand: { x: 72, y: 145 },
        leftFoot: { x: 50, y: 175 },
        rightFoot: { x: 70, y: 175 },
      }),
      `  <circle cx="48" cy="150" r="5" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
      `  <circle cx="72" cy="150" r="5" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
      redDot(60, 100, 'pin'),
      // Curl — forearms up, elbows at ribs
      stickGroup({
        head: { x: 180, y: 58 },
        hip: { x: 180, y: 115 },
        leftElbow: { x: 168, y: 100 },
        rightElbow: { x: 192, y: 100 },
        leftHand: { x: 162, y: 72 },
        rightHand: { x: 198, y: 72 },
        leftFoot: { x: 170, y: 175 },
        rightFoot: { x: 190, y: 175 },
      }),
      `  <circle cx="162" cy="68" r="5" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
      `  <circle cx="198" cy="68" r="5" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
      redArrow(168, 130, 168, 95, 'curl'),
      // Lower — controlled return
      stickGroup({
        head: { x: 300, y: 58 },
        hip: { x: 300, y: 115 },
        leftElbow: { x: 288, y: 108 },
        rightElbow: { x: 312, y: 108 },
        leftHand: { x: 282, y: 135 },
        rightHand: { x: 318, y: 135 },
        leftFoot: { x: 290, y: 175 },
        rightFoot: { x: 310, y: 175 },
      }),
      `  <circle cx="282" cy="140" r="5" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
      `  <circle cx="318" cy="140" r="5" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
      redArrow(312, 95, 312, 128, ''),
    ].join('\n'),
  })
);

// ─── face-pull: reach → pull → rotate (elbows high, rope to face) ───
write(
  'face-pull',
  formGuideSvg({
    id: 'face-pull',
    title: 'Face pull form diagram',
    ariaLabel: 'Face pull form: reach, pull, rotate',
    labels: ['REACH', 'PULL', 'ROTATE'],
    body: [
      // Reach — arms forward toward cable
      stickGroup({
        head: { x: 52, y: 70 },
        hip: { x: 58, y: 125 },
        leftShoulder: { x: 50, y: 88 },
        rightShoulder: { x: 58, y: 88 },
        leftHand: { x: 95, y: 82 },
        rightHand: { x: 95, y: 90 },
        leftFoot: { x: 45, y: 175 },
        rightFoot: { x: 72, y: 175 },
      }),
      equipmentBar(100, 86, 118, INK),
      redDot(95, 86, 'rope'),
      // Pull — elbows high, rope to face
      stickGroup({
        head: { x: 175, y: 68 },
        hip: { x: 180, y: 125 },
        leftElbow: { x: 155, y: 78 },
        rightElbow: { x: 205, y: 78 },
        leftHand: { x: 168, y: 72 },
        rightHand: { x: 192, y: 72 },
        leftFoot: { x: 168, y: 175 },
        rightFoot: { x: 195, y: 175 },
      }),
      redArrow(210, 100, 195, 80, 'high'),
      // Rotate — external rotation end
      stickGroup({
        head: { x: 295, y: 68 },
        hip: { x: 300, y: 125 },
        leftElbow: { x: 268, y: 70 },
        rightElbow: { x: 332, y: 70 },
        leftHand: { x: 282, y: 58 },
        rightHand: { x: 318, y: 58 },
        leftFoot: { x: 288, y: 175 },
        rightFoot: { x: 315, y: 175 },
      }),
      redDot(300, 72, 'face'),
    ].join('\n'),
  })
);

// ─── bird-dog: setup → extend → hold ───
write(
  'bird-dog',
  formGuideSvg({
    id: 'bird-dog',
    title: 'Bird-dog form diagram',
    ariaLabel: 'Bird-dog form: setup, extend opposite arm and leg, hold',
    labels: ['SETUP', 'EXTEND', 'HOLD'],
    body: [
      // Setup — hands and knees
      stickGroup({
        head: { x: 78, y: 95 },
        hip: { x: 50, y: 125 },
        leftHand: { x: 90, y: 155 },
        rightHand: { x: 70, y: 155 },
        leftKnee: { x: 40, y: 145 },
        rightKnee: { x: 55, y: 145 },
        leftFoot: { x: 28, y: 165 },
        rightFoot: { x: 48, y: 165 },
      }),
      redDot(50, 125, 'brace'),
      // Extend — opposite arm + leg
      stickGroup({
        head: { x: 210, y: 88 },
        hip: { x: 175, y: 125 },
        leftHand: { x: 230, y: 95 },
        rightHand: { x: 195, y: 155 },
        leftKnee: { x: 160, y: 145 },
        rightFoot: { x: 145, y: 95 },
        leftFoot: { x: 150, y: 165 },
      }),
      redArrow(230, 110, 245, 90, ''),
      redArrow(145, 115, 130, 95, ''),
      // Hold — level hips
      stickGroup({
        head: { x: 325, y: 88 },
        hip: { x: 295, y: 125 },
        leftHand: { x: 345, y: 95 },
        rightHand: { x: 315, y: 155 },
        leftKnee: { x: 280, y: 145 },
        rightFoot: { x: 265, y: 95 },
        leftFoot: { x: 270, y: 165 },
      }),
      redDot(295, 125, 'level'),
    ].join('\n'),
  })
);

// ─── mountain-climbers: plank → drive knee → switch ───
write(
  'mountain-climbers',
  formGuideSvg({
    id: 'mountain-climbers',
    title: 'Mountain climbers form diagram',
    ariaLabel: 'Mountain climbers form: plank, drive knee, switch',
    labels: ['PLANK', 'DRIVE', 'SWITCH'],
    body: [
      // High plank
      stickGroup({
        head: { x: 95, y: 95 },
        hip: { x: 55, y: 120 },
        leftHand: { x: 100, y: 155 },
        rightHand: { x: 88, y: 155 },
        leftFoot: { x: 30, y: 155 },
        rightFoot: { x: 40, y: 155 },
      }),
      redDot(55, 120, 'line'),
      // Drive one knee under
      stickGroup({
        head: { x: 215, y: 95 },
        hip: { x: 175, y: 125 },
        leftHand: { x: 220, y: 155 },
        rightHand: { x: 208, y: 155 },
        leftKnee: { x: 175, y: 145 },
        leftFoot: { x: 165, y: 155 },
        rightFoot: { x: 145, y: 155 },
      }),
      redArrow(155, 140, 175, 148, 'knee'),
      // Switch
      stickGroup({
        head: { x: 330, y: 95 },
        hip: { x: 295, y: 125 },
        leftHand: { x: 335, y: 155 },
        rightHand: { x: 323, y: 155 },
        rightKnee: { x: 295, y: 145 },
        rightFoot: { x: 285, y: 155 },
        leftFoot: { x: 265, y: 155 },
      }),
      redArrow(305, 140, 290, 148, ''),
    ].join('\n'),
  })
);

// ─── front-squat: rack → depth → stand ───
write(
  'front-squat',
  formGuideSvg({
    id: 'front-squat',
    title: 'Front squat form diagram',
    ariaLabel: 'Front squat form: rack, depth, stand',
    labels: ['RACK', 'DEPTH', 'STAND'],
    body: [
      stickGroup({
        head: { x: 60, y: 55 },
        hip: { x: 60, y: 115 },
        leftElbow: { x: 48, y: 78 },
        rightElbow: { x: 72, y: 78 },
        leftHand: { x: 42, y: 70 },
        rightHand: { x: 78, y: 70 },
        leftFoot: { x: 48, y: 175 },
        rightFoot: { x: 72, y: 175 },
      }),
      equipmentBar(40, 68, 80, INK),
      redDot(60, 70, 'rack'),
      stickGroup({
        head: { x: 180, y: 85 },
        hip: { x: 180, y: 145 },
        leftElbow: { x: 168, y: 105 },
        rightElbow: { x: 192, y: 105 },
        leftHand: { x: 162, y: 98 },
        rightHand: { x: 198, y: 98 },
        leftKnee: { x: 160, y: 165 },
        rightKnee: { x: 200, y: 165 },
        leftFoot: { x: 155, y: 175 },
        rightFoot: { x: 205, y: 175 },
      }),
      equipmentBar(160, 96, 200, INK),
      redDot(180, 145, 'upright'),
      stickGroup({
        head: { x: 300, y: 55 },
        hip: { x: 300, y: 115 },
        leftElbow: { x: 288, y: 78 },
        rightElbow: { x: 312, y: 78 },
        leftHand: { x: 282, y: 70 },
        rightHand: { x: 318, y: 70 },
        leftFoot: { x: 288, y: 175 },
        rightFoot: { x: 312, y: 175 },
      }),
      equipmentBar(280, 68, 320, INK),
      redArrow(300, 150, 300, 125, 'drive'),
    ].join('\n'),
  })
);

// ─── goblet-squat: hold DB at chest → sit between hips → stand ───
write(
  'goblet-squat',
  formGuideSvg({
    id: 'goblet-squat',
    title: 'Goblet squat form diagram',
    ariaLabel: 'Goblet squat form: hold, depth, stand',
    labels: ['HOLD', 'DEPTH', 'STAND'],
    body: [
      stickGroup({
        head: { x: 60, y: 55 },
        hip: { x: 60, y: 115 },
        leftElbow: { x: 50, y: 88 },
        rightElbow: { x: 70, y: 88 },
        leftHand: { x: 55, y: 78 },
        rightHand: { x: 65, y: 78 },
        leftFoot: { x: 48, y: 175 },
        rightFoot: { x: 72, y: 175 },
      }),
      `  <rect x="54" y="72" width="12" height="16" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
      redDot(60, 80, 'goblet'),
      stickGroup({
        head: { x: 180, y: 90 },
        hip: { x: 180, y: 148 },
        leftElbow: { x: 168, y: 118 },
        rightElbow: { x: 192, y: 118 },
        leftHand: { x: 174, y: 108 },
        rightHand: { x: 186, y: 108 },
        leftKnee: { x: 158, y: 165 },
        rightKnee: { x: 202, y: 165 },
        leftFoot: { x: 152, y: 175 },
        rightFoot: { x: 208, y: 175 },
      }),
      `  <rect x="174" y="102" width="12" height="16" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
      redDot(168, 160, 'elbows in'),
      stickGroup({
        head: { x: 300, y: 55 },
        hip: { x: 300, y: 115 },
        leftElbow: { x: 290, y: 88 },
        rightElbow: { x: 310, y: 88 },
        leftHand: { x: 295, y: 78 },
        rightHand: { x: 305, y: 78 },
        leftFoot: { x: 288, y: 175 },
        rightFoot: { x: 312, y: 175 },
      }),
      `  <rect x="294" y="72" width="12" height="16" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
      redArrow(300, 150, 300, 125, ''),
    ].join('\n'),
  })
);

// ─── pike-pushup: pike → lower head → press ───
write(
  'pike-pushup',
  formGuideSvg({
    id: 'pike-pushup',
    title: 'Pike push-up form diagram',
    ariaLabel: 'Pike push-up form: pike, lower, press',
    labels: ['PIKE', 'LOWER', 'PRESS'],
    body: [
      // Inverted V
      stickGroup({
        head: { x: 75, y: 100 },
        hip: { x: 55, y: 70 },
        leftHand: { x: 90, y: 155 },
        rightHand: { x: 80, y: 155 },
        leftFoot: { x: 30, y: 155 },
        rightFoot: { x: 38, y: 155 },
      }),
      redDot(55, 70, 'hips high'),
      // Lower head toward floor
      stickGroup({
        head: { x: 200, y: 130 },
        hip: { x: 175, y: 75 },
        leftHand: { x: 210, y: 155 },
        rightHand: { x: 200, y: 155 },
        leftFoot: { x: 150, y: 155 },
        rightFoot: { x: 158, y: 155 },
      }),
      redArrow(195, 110, 195, 135, 'head'),
      // Press back up
      stickGroup({
        head: { x: 315, y: 100 },
        hip: { x: 295, y: 70 },
        leftHand: { x: 330, y: 155 },
        rightHand: { x: 320, y: 155 },
        leftFoot: { x: 270, y: 155 },
        rightFoot: { x: 278, y: 155 },
      }),
      redArrow(310, 125, 310, 100, 'press'),
    ].join('\n'),
  })
);

// ─── side-plank: setup → lift hips → hold line ───
write(
  'side-plank',
  formGuideSvg({
    id: 'side-plank',
    title: 'Side plank form diagram',
    ariaLabel: 'Side plank form: setup, lift, hold',
    labels: ['SETUP', 'LIFT', 'HOLD'],
    body: [
      // Side-lying prep
      stickGroup({
        head: { x: 40, y: 100 },
        hip: { x: 70, y: 140 },
        leftElbow: { x: 45, y: 145 },
        leftHand: { x: 48, y: 155 },
        leftFoot: { x: 100, y: 155 },
        rightFoot: { x: 100, y: 150 },
      }),
      redDot(45, 145, 'elbow'),
      // Hips lifted — full side plank
      stickGroup({
        head: { x: 150, y: 85 },
        hip: { x: 190, y: 115 },
        leftElbow: { x: 155, y: 145 },
        leftHand: { x: 158, y: 155 },
        rightHand: { x: 190, y: 70 },
        leftFoot: { x: 230, y: 155 },
        rightFoot: { x: 230, y: 150 },
      }),
      redArrow(190, 140, 190, 115, 'hips'),
      // Hold straight line
      stickGroup({
        head: { x: 270, y: 85 },
        hip: { x: 310, y: 115 },
        leftElbow: { x: 275, y: 145 },
        leftHand: { x: 278, y: 155 },
        rightHand: { x: 310, y: 70 },
        leftFoot: { x: 350, y: 155 },
        rightFoot: { x: 350, y: 150 },
      }),
      redDot(310, 115, 'line'),
    ].join('\n'),
  })
);

// Also de-clone remaining close pairs from inventory if still similar after:
// dips-chair vs step-ups — rewrite both for clarity
write(
  'dips-chair',
  formGuideSvg({
    id: 'dips-chair',
    title: 'Chair dip form diagram',
    ariaLabel: 'Chair dip form: support, lower, press',
    labels: ['SUPPORT', 'LOWER', 'PRESS'],
    body: [
      // Hands on seat edge, legs out
      stickGroup({
        head: { x: 55, y: 70 },
        hip: { x: 70, y: 120 },
        leftHand: { x: 45, y: 110 },
        rightHand: { x: 55, y: 110 },
        leftFoot: { x: 100, y: 155 },
        rightFoot: { x: 110, y: 155 },
      }),
      `  <rect x="30" y="110" width="40" height="8" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
      redDot(50, 110, 'edge'),
      stickGroup({
        head: { x: 175, y: 90 },
        hip: { x: 190, y: 145 },
        leftHand: { x: 165, y: 110 },
        rightHand: { x: 175, y: 110 },
        leftFoot: { x: 220, y: 155 },
        rightFoot: { x: 230, y: 155 },
      }),
      `  <rect x="150" y="110" width="40" height="8" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
      redArrow(185, 100, 185, 125, 'bend'),
      stickGroup({
        head: { x: 295, y: 70 },
        hip: { x: 310, y: 120 },
        leftHand: { x: 285, y: 110 },
        rightHand: { x: 295, y: 110 },
        leftFoot: { x: 340, y: 155 },
        rightFoot: { x: 350, y: 155 },
      }),
      `  <rect x="270" y="110" width="40" height="8" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
      redArrow(305, 135, 305, 115, ''),
    ].join('\n'),
  })
);

write(
  'step-ups',
  formGuideSvg({
    id: 'step-ups',
    title: 'Step-up form diagram',
    ariaLabel: 'Step-up form: plant, drive, stand',
    labels: ['PLANT', 'DRIVE', 'STAND'],
    body: [
      stickGroup({
        head: { x: 55, y: 70 },
        hip: { x: 55, y: 120 },
        leftFoot: { x: 50, y: 155 },
        rightKnee: { x: 80, y: 130 },
        rightFoot: { x: 85, y: 120 },
      }),
      `  <rect x="70" y="120" width="40" height="35" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
      redDot(85, 120, 'box'),
      stickGroup({
        head: { x: 175, y: 55 },
        hip: { x: 175, y: 105 },
        leftFoot: { x: 165, y: 140 },
        rightFoot: { x: 200, y: 120 },
      }),
      `  <rect x="185" y="120" width="40" height="35" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
      redArrow(175, 145, 175, 115, 'drive'),
      stickGroup({
        head: { x: 300, y: 45 },
        hip: { x: 300, y: 90 },
        leftFoot: { x: 290, y: 120 },
        rightFoot: { x: 310, y: 120 },
      }),
      `  <rect x="275" y="120" width="50" height="35" fill="none" stroke="${INK}" stroke-width="2"></rect>`,
      redDot(300, 90, 'tall'),
    ].join('\n'),
  })
);

// kettlebell-swing vs jump-squats were also near-clones
write(
  'kettlebell-swing',
  formGuideSvg({
    id: 'kettlebell-swing',
    title: 'Kettlebell swing form diagram',
    ariaLabel: 'Kettlebell swing form: hike, snap, float',
    labels: ['HIKE', 'SNAP', 'FLOAT'],
    body: [
      stickGroup({
        head: { x: 70, y: 85 },
        hip: { x: 55, y: 130 },
        leftHand: { x: 45, y: 155 },
        rightHand: { x: 55, y: 155 },
        leftFoot: { x: 40, y: 175 },
        rightFoot: { x: 75, y: 175 },
      }),
      `  <circle cx="50" cy="160" r="8" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
      redDot(55, 130, 'hinge'),
      stickGroup({
        head: { x: 185, y: 55 },
        hip: { x: 185, y: 115 },
        leftHand: { x: 175, y: 95 },
        rightHand: { x: 195, y: 95 },
        leftFoot: { x: 170, y: 175 },
        rightFoot: { x: 200, y: 175 },
      }),
      `  <circle cx="185" cy="88" r="8" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
      redArrow(185, 145, 185, 120, 'hips'),
      stickGroup({
        head: { x: 300, y: 55 },
        hip: { x: 300, y: 115 },
        leftHand: { x: 290, y: 70 },
        rightHand: { x: 310, y: 70 },
        leftFoot: { x: 288, y: 175 },
        rightFoot: { x: 312, y: 175 },
      }),
      `  <circle cx="300" cy="58" r="8" fill="none" stroke="${INK}" stroke-width="2"></circle>`,
      redDot(300, 58, 'float'),
    ].join('\n'),
  })
);

write(
  'jump-squats',
  formGuideSvg({
    id: 'jump-squats',
    title: 'Jump squat form diagram',
    ariaLabel: 'Jump squat form: load, explode, soft land',
    labels: ['LOAD', 'EXPLODE', 'LAND'],
    body: [
      stickGroup({
        head: { x: 60, y: 90 },
        hip: { x: 60, y: 145 },
        leftKnee: { x: 45, y: 165 },
        rightKnee: { x: 75, y: 165 },
        leftFoot: { x: 42, y: 175 },
        rightFoot: { x: 78, y: 175 },
        leftHand: { x: 40, y: 120 },
        rightHand: { x: 80, y: 120 },
      }),
      redDot(60, 145, 'load'),
      stickGroup({
        head: { x: 180, y: 40 },
        hip: { x: 180, y: 95 },
        leftFoot: { x: 165, y: 140 },
        rightFoot: { x: 195, y: 140 },
        leftHand: { x: 160, y: 70 },
        rightHand: { x: 200, y: 70 },
      }),
      redArrow(180, 155, 180, 125, 'up'),
      // dashed ground contact absent = in air
      `  <line x1="160" y1="155" x2="200" y2="155" stroke="${RED}" stroke-width="1.5" stroke-dasharray="4 3"></line>`,
      stickGroup({
        head: { x: 300, y: 75 },
        hip: { x: 300, y: 130 },
        leftKnee: { x: 288, y: 155 },
        rightKnee: { x: 312, y: 155 },
        leftFoot: { x: 285, y: 175 },
        rightFoot: { x: 315, y: 175 },
        leftHand: { x: 280, y: 105 },
        rightHand: { x: 320, y: 105 },
      }),
      redDot(300, 175, 'soft'),
    ].join('\n'),
  })
);

console.log('T0 form guides regenerated.');
