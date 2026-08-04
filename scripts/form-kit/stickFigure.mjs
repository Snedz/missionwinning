/**
 * Stick-figure primitives for Mission Winning form-guide SVGs.
 * Palette: paper #f3f2f2 · ink #201e1d · muted #6f6b69 · red #ec3013
 *
 * Geometry rules (why earlier kit output looked broken):
 * - Never draw zero-length segments (shoulder defaulted to neck → garbage lines).
 * - Default shoulders offset left/right of neck so arms read as limbs.
 * - Prefer full chains: head→neck→hip, neck→shoulder→elbow→hand, hip→knee→foot.
 */

export const PAPER = '#f3f2f2';
export const INK = '#201e1d';
export const MUTED = '#6f6b69';
export const RED = '#ec3013';

export const VIEW_W = 360;
export const VIEW_H = 220;
export const GROUND_Y = 185;
export const PHASE_CX = [60, 180, 300];

/**
 * @typedef {{ x: number, y: number }} Pt
 * @typedef {{
 *   head: Pt,
 *   neck?: Pt,
 *   hip: Pt,
 *   leftShoulder?: Pt,
 *   rightShoulder?: Pt,
 *   leftElbow?: Pt,
 *   rightElbow?: Pt,
 *   leftHand?: Pt,
 *   rightHand?: Pt,
 *   leftKnee?: Pt,
 *   rightKnee?: Pt,
 *   leftFoot?: Pt,
 *   rightFoot?: Pt,
 *   side?: boolean,
 * }} StickPose
 */

const EPS = 0.5;

function same(a, b) {
  return Math.abs(a.x - b.x) < EPS && Math.abs(a.y - b.y) < EPS;
}

function rnd(n) {
  return Math.round(n * 10) / 10;
}
function pt(p) {
  return p ? { x: rnd(p.x), y: rnd(p.y) } : p;
}

/** Round head + limb polylines. */
export function stickGroup(pose, { r = 9, stroke = INK, strokeWidth = 2.5 } = {}) {
  const lines = [];
  const h = pt(pose.head);
  lines.push(`    <circle cx="${h.x}" cy="${h.y}" r="${r}"></circle>`);

  const join = (a, b) => {
    if (!a || !b || same(a, b)) return;
    const A = pt(a);
    const B = pt(b);
    lines.push(`    <line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}"></line>`);
  };

  const neck = pose.neck ?? { x: h.x, y: h.y + r + 3 };
  join(h, neck);
  join(neck, pose.hip);

  // Shoulders: explicit, or offset from neck so arms have a real origin.
  const shoulderSpread = pose.side ? 0 : 14;
  const ls =
    pose.leftShoulder ??
    (pose.side ? { x: neck.x, y: neck.y + 6 } : { x: neck.x - shoulderSpread, y: neck.y + 6 });
  const rs =
    pose.rightShoulder ??
    (pose.side ? { x: neck.x, y: neck.y + 6 } : { x: neck.x + shoulderSpread, y: neck.y + 6 });

  if (!pose.side) {
    join(neck, ls);
    join(neck, rs);
  } else {
    join(neck, ls);
  }

  // Arms: shoulder → elbow → hand (or shoulder → hand)
  const arm = (shoulder, elbow, hand) => {
    if (elbow && hand) {
      join(shoulder, elbow);
      join(elbow, hand);
    } else if (hand) {
      join(shoulder, hand);
    } else if (elbow) {
      join(shoulder, elbow);
    }
  };
  arm(ls, pose.leftElbow, pose.leftHand);
  if (!pose.side) arm(rs, pose.rightElbow, pose.rightHand);
  else arm(ls, pose.rightElbow, pose.rightHand); // second arm also from front shoulder in side view

  // Legs: hip → knee → foot
  const leg = (knee, foot) => {
    if (knee && foot) {
      join(pose.hip, knee);
      join(knee, foot);
    } else if (foot) {
      join(pose.hip, foot);
    } else if (knee) {
      join(pose.hip, knee);
    }
  };
  leg(pose.leftKnee, pose.leftFoot);
  leg(pose.rightKnee, pose.rightFoot);

  return `  <g stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none">\n${lines.join('\n')}\n  </g>`;
}

/**
 * Side-view athletic stick at phase center `cx`.
 * depth 0 = standing tall, 1 = deep squat/hinge.
 * leanDeg: torso lean from vertical (positive = lean forward for hinge).
 */
export function sideAthlete(cx, { depth = 0, leanDeg = 0, arms = 'down', r = 9 } = {}) {
  const ground = GROUND_Y;
  const hipY = 115 + depth * 30;
  const headY = 52 + depth * 28 + Math.sin((leanDeg * Math.PI) / 180) * 10;
  const lean = (leanDeg * Math.PI) / 180;
  const torsoLen = 48;
  const hip = { x: cx, y: hipY };
  const neck = {
    x: cx + Math.sin(lean) * torsoLen,
    y: hipY - Math.cos(lean) * torsoLen,
  };
  const head = { x: neck.x, y: neck.y - r - 4 };

  let leftHand;
  let rightHand;
  let leftElbow;
  let rightElbow;
  if (arms === 'forward') {
    leftElbow = { x: neck.x + 22, y: neck.y + 8 };
    leftHand = { x: neck.x + 38, y: neck.y + 18 };
    rightElbow = { x: neck.x + 18, y: neck.y + 14 };
    rightHand = { x: neck.x + 32, y: neck.y + 28 };
  } else if (arms === 'overhead') {
    leftElbow = { x: neck.x - 6, y: neck.y - 22 };
    leftHand = { x: neck.x - 4, y: neck.y - 42 };
    rightElbow = { x: neck.x + 6, y: neck.y - 22 };
    rightHand = { x: neck.x + 4, y: neck.y - 42 };
  } else if (arms === 'rack') {
    leftElbow = { x: neck.x - 10, y: neck.y + 12 };
    leftHand = { x: neck.x - 8, y: neck.y - 2 };
    rightElbow = { x: neck.x + 10, y: neck.y + 12 };
    rightHand = { x: neck.x + 8, y: neck.y - 2 };
  } else if (arms === 'plank') {
    // horizontal body — caller should pass custom pose instead
    leftHand = { x: neck.x + 40, y: ground - 5 };
    rightHand = { x: neck.x + 35, y: ground - 5 };
  } else {
    // arms down
    leftElbow = { x: neck.x - 8, y: neck.y + 22 };
    leftHand = { x: neck.x - 10, y: neck.y + 40 };
    rightElbow = { x: neck.x + 8, y: neck.y + 22 };
    rightHand = { x: neck.x + 10, y: neck.y + 40 };
  }

  const kneeY = hipY + 28 + depth * 8;
  const footSpread = 14 + depth * 10;
  return {
    head,
    neck,
    hip,
    side: true,
    leftShoulder: { x: neck.x, y: neck.y + 4 },
    leftElbow,
    rightElbow,
    leftHand,
    rightHand,
    leftKnee: { x: cx - 10 - depth * 8, y: kneeY },
    rightKnee: { x: cx + 8 + depth * 6, y: kneeY + 2 },
    leftFoot: { x: cx - footSpread, y: ground },
    rightFoot: { x: cx + footSpread - 4, y: ground },
  };
}

/** Front-view athlete at cx. */
export function frontAthlete(cx, { depth = 0, arms = 'down', r = 9 } = {}) {
  const ground = GROUND_Y;
  const hipY = 115 + depth * 32;
  const headY = 52 + depth * 30;
  const head = { x: cx, y: headY };
  const neck = { x: cx, y: headY + r + 3 };
  const hip = { x: cx, y: hipY };
  const ls = { x: cx - 16, y: neck.y + 6 };
  const rs = { x: cx + 16, y: neck.y + 6 };

  let leftElbow, rightElbow, leftHand, rightHand;
  if (arms === 'curl') {
    leftElbow = { x: cx - 18, y: neck.y + 28 };
    rightElbow = { x: cx + 18, y: neck.y + 28 };
    leftHand = { x: cx - 14, y: neck.y + 8 };
    rightHand = { x: cx + 14, y: neck.y + 8 };
  } else if (arms === 'raise') {
    leftElbow = { x: cx - 36, y: neck.y + 10 };
    rightElbow = { x: cx + 36, y: neck.y + 10 };
    leftHand = { x: cx - 52, y: neck.y + 4 };
    rightHand = { x: cx + 52, y: neck.y + 4 };
  } else if (arms === 'overhead') {
    leftElbow = { x: cx - 12, y: neck.y - 18 };
    rightElbow = { x: cx + 12, y: neck.y - 18 };
    leftHand = { x: cx - 8, y: neck.y - 38 };
    rightHand = { x: cx + 8, y: neck.y - 38 };
  } else if (arms === 'hang') {
    leftElbow = { x: cx - 20, y: neck.y + 30 };
    rightElbow = { x: cx + 20, y: neck.y + 30 };
    leftHand = { x: cx - 22, y: neck.y + 48 };
    rightHand = { x: cx + 22, y: neck.y + 48 };
  } else if (arms === 'forward') {
    leftElbow = { x: cx - 28, y: neck.y + 18 };
    rightElbow = { x: cx + 28, y: neck.y + 18 };
    leftHand = { x: cx - 32, y: neck.y + 16 };
    rightHand = { x: cx + 32, y: neck.y + 16 };
  } else {
    leftElbow = { x: cx - 18, y: neck.y + 24 };
    rightElbow = { x: cx + 18, y: neck.y + 24 };
    leftHand = { x: cx - 20, y: neck.y + 44 };
    rightHand = { x: cx + 20, y: neck.y + 44 };
  }

  const kneeY = hipY + 30;
  const footW = 16 + depth * 12;
  return {
    head,
    neck,
    hip,
    leftShoulder: ls,
    rightShoulder: rs,
    leftElbow,
    rightElbow,
    leftHand,
    rightHand,
    leftKnee: { x: cx - 12 - depth * 8, y: kneeY },
    rightKnee: { x: cx + 12 + depth * 8, y: kneeY },
    leftFoot: { x: cx - footW, y: ground },
    rightFoot: { x: cx + footW, y: ground },
  };
}

/** Horizontal plank-style body (side), hands under shoulders, feet back. */
export function plankAthlete(cx, { lowered = false } = {}) {
  const ground = GROUND_Y - 5;
  const bodyY = lowered ? ground - 18 : ground - 42;
  const head = { x: cx + 48, y: bodyY - 4 };
  const neck = { x: cx + 36, y: bodyY };
  const hip = { x: cx - 20, y: bodyY + 4 };
  return {
    head,
    neck,
    hip,
    side: true,
    leftShoulder: { x: neck.x - 4, y: bodyY + 2 },
    leftElbow: { x: cx + 28, y: ground - 12 },
    leftHand: { x: cx + 30, y: ground },
    rightElbow: { x: cx + 22, y: ground - 10 },
    rightHand: { x: cx + 24, y: ground },
    leftKnee: { x: cx - 35, y: bodyY + 6 },
    rightKnee: { x: cx - 40, y: bodyY + 8 },
    leftFoot: { x: cx - 55, y: ground },
    rightFoot: { x: cx - 50, y: ground },
  };
}

export function groundLine(x1, x2, y = GROUND_Y) {
  return `  <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${INK}" stroke-width="2"></line>`;
}

export function phaseLabels(labels) {
  return labels
    .map(
      (label, i) =>
        `  <text x="${PHASE_CX[i]}" y="28" text-anchor="middle" fill="${MUTED}" font-family="Archivo, system-ui, sans-serif" font-size="11" letter-spacing="0.5">${escapeXml(label)}</text>`
    )
    .join('\n');
}

export function redDot(x, y, label) {
  let s = `  <circle cx="${x}" cy="${y}" r="3.5" fill="${RED}"></circle>`;
  if (label) {
    s += `\n  <text x="${x}" y="${y - 8}" text-anchor="middle" fill="${RED}" font-family="Archivo, system-ui, sans-serif" font-size="8">${escapeXml(label)}</text>`;
  }
  return s;
}

export function redArrow(x1, y1, x2, y2, label) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const bx = x2 - ux * 8;
  const by = y2 - uy * 8;
  let s = `  <path d="M${x1} ${y1} L${x2} ${y2}" stroke="${RED}" stroke-width="2" stroke-linecap="round"></path>`;
  s += `\n  <polygon points="${x2},${y2} ${bx + px * 4},${by + py * 4} ${bx - px * 4},${by - py * 4}" fill="${RED}"></polygon>`;
  if (label) {
    s += `\n  <text x="${(x1 + x2) / 2 + 10}" y="${(y1 + y2) / 2}" fill="${RED}" font-family="Archivo, system-ui, sans-serif" font-size="9">${escapeXml(label)}</text>`;
  }
  return s;
}

export function equipmentBar(x1, y, x2, stroke = INK) {
  return `  <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${stroke}" stroke-width="3" stroke-linecap="round"></line>`;
}

export function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formGuideSvg({ id: _id, title, ariaLabel, labels, body }) {
  const grounds = PHASE_CX.map((cx) => groundLine(cx - 40, cx + 40)).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" fill="none" role="img" aria-label="${escapeXml(ariaLabel)}">
  <title>${escapeXml(title)}</title>
  <rect width="${VIEW_W}" height="${VIEW_H}" fill="${PAPER}"></rect>
${phaseLabels(labels)}
${grounds}
${body}
</svg>
`;
}
