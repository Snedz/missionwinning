/**
 * Stick-figure primitives for Mission Winning form-guide SVGs.
 * Palette matches public/form-guides + src/index.css modernist tokens.
 *
 * Agents: compose poses with these helpers; do not freehand off-palette hex.
 */

export const PAPER = '#f3f2f2';
export const INK = '#201e1d';
export const MUTED = '#6f6b69';
export const RED = '#ec3013';

/** Standard form-guide canvas */
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
 * }} StickPose
 */

/** Round head + polyline limbs (missing joints are skipped). */
export function stickGroup(pose, { r = 9, stroke = INK, strokeWidth = 2.5 } = {}) {
  const lines = [];
  const h = pose.head;
  lines.push(`    <circle cx="${h.x}" cy="${h.y}" r="${r}"></circle>`);

  const join = (a, b) => {
    if (!a || !b) return;
    lines.push(`    <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>`);
  };

  const neck = pose.neck ?? { x: h.x, y: h.y + r + 2 };
  join(h, neck);
  join(neck, pose.hip);

  const ls = pose.leftShoulder ?? neck;
  const rs = pose.rightShoulder ?? neck;
  join(neck, ls);
  join(neck, rs);
  join(ls, pose.leftElbow);
  join(pose.leftElbow, pose.leftHand);
  join(rs, pose.rightElbow);
  join(pose.rightElbow, pose.rightHand);
  // if elbows omitted but hands present
  if (!pose.leftElbow) join(ls, pose.leftHand);
  if (!pose.rightElbow) join(rs, pose.rightHand);

  join(pose.hip, pose.leftKnee);
  join(pose.leftKnee, pose.leftFoot);
  join(pose.hip, pose.rightKnee);
  join(pose.rightKnee, pose.rightFoot);
  if (!pose.leftKnee) join(pose.hip, pose.leftFoot);
  if (!pose.rightKnee) join(pose.hip, pose.rightFoot);

  return `  <g stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none">\n${lines.join('\n')}\n  </g>`;
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
  // simple line + polygon head
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

/**
 * Assemble a full form-guide SVG document.
 * @param {{ id: string, title: string, ariaLabel: string, labels: string[], body: string }} opts
 */
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
