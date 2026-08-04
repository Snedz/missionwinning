/**
 * Hand-tuned instructional stick poses (side / front).
 * Coordinates are explicit — no parametric lean math that draws through the head.
 *
 * Side views face right. Ground ≈ y=175. Phase centers: 60 / 180 / 300.
 */

import { GROUND_Y } from './stickFigure.mjs';

const G = GROUND_Y; // 185

/** Side plank (push-up family). lowered=true = mid-rep. */
export function posePlank(cx, { lowered = false } = {}) {
  const bodyY = lowered ? 158 : 128;
  const headX = cx + 42;
  const shoulderX = cx + 22;
  const hipX = cx - 18;
  const handX = cx + 28;
  const footX = cx - 48;
  return {
    head: { x: headX, y: bodyY - 6 },
    neck: { x: shoulderX + 8, y: bodyY },
    hip: { x: hipX, y: bodyY + 2 },
    side: true,
    leftShoulder: { x: shoulderX, y: bodyY + 2 },
    leftElbow: { x: handX - 4, y: lowered ? G - 22 : G - 35 },
    leftHand: { x: handX, y: G - 2 },
    rightElbow: { x: handX - 10, y: lowered ? G - 18 : G - 30 },
    rightHand: { x: handX - 8, y: G - 2 },
    leftKnee: { x: hipX - 12, y: bodyY + 4 },
    rightKnee: { x: hipX - 18, y: bodyY + 6 },
    leftFoot: { x: footX, y: G - 2 },
    rightFoot: { x: footX + 8, y: G - 2 },
  };
}

/** Side squat. depth 0 standing … 1 deep. barY optional absolute. */
export function poseSquat(cx, { depth = 0, barAt = null, arms = 'forward' } = {}) {
  const hipY = 118 + depth * 38;
  const headY = 55 + depth * 32;
  const kneeY = 145 + depth * 12;
  const footL = cx - 16 - depth * 6;
  const footR = cx + 18 + depth * 8;
  const neck = { x: cx + depth * 4, y: headY + 14 };
  const hip = { x: cx, y: hipY };
  let leftElbow, rightElbow, leftHand, rightHand;
  if (arms === 'rack') {
    leftElbow = { x: cx - 14, y: neck.y + 14 };
    rightElbow = { x: cx + 14, y: neck.y + 14 };
    leftHand = { x: cx - 10, y: neck.y + 2 };
    rightHand = { x: cx + 10, y: neck.y + 2 };
  } else if (arms === 'overhead') {
    leftElbow = { x: cx - 10, y: headY - 8 };
    rightElbow = { x: cx + 10, y: headY - 8 };
    leftHand = { x: cx - 8, y: headY - 28 };
    rightHand = { x: cx + 8, y: headY - 28 };
  } else {
    // arms forward for balance
    leftElbow = { x: cx + 18, y: neck.y + 10 };
    rightElbow = { x: cx + 22, y: neck.y + 16 };
    leftHand = { x: cx + 36, y: neck.y + 8 };
    rightHand = { x: cx + 40, y: neck.y + 14 };
  }
  return {
    head: { x: neck.x, y: headY },
    neck,
    hip,
    side: true,
    leftShoulder: { x: neck.x - 2, y: neck.y + 4 },
    leftElbow,
    rightElbow,
    leftHand,
    rightHand,
    leftKnee: { x: cx - 8 - depth * 10, y: kneeY },
    rightKnee: { x: cx + 14 + depth * 6, y: kneeY + 2 },
    leftFoot: { x: footL, y: G },
    rightFoot: { x: footR, y: G },
    _barY: barAt ?? (arms === 'rack' ? neck.y + 2 : arms === 'overhead' ? headY - 30 : null),
  };
}

/** Side hinge / deadlift. */
export function poseHinge(cx, { lean = 0.55, barY = null } = {}) {
  // lean 0 upright, 1 deep hinge
  const hip = { x: cx, y: 128 };
  const neck = { x: cx + 8 + lean * 28, y: 128 - 42 + lean * 8 };
  const head = { x: neck.x + 6, y: neck.y - 14 };
  const handsY = barY ?? 128 + lean * 40;
  return {
    head,
    neck,
    hip,
    side: true,
    leftShoulder: { x: neck.x - 2, y: neck.y + 4 },
    leftElbow: { x: neck.x + 8, y: neck.y + 22 },
    rightElbow: { x: neck.x + 12, y: neck.y + 26 },
    leftHand: { x: cx + 4, y: handsY },
    rightHand: { x: cx + 14, y: handsY },
    leftKnee: { x: cx - 10, y: 155 },
    rightKnee: { x: cx + 12, y: 155 },
    leftFoot: { x: cx - 18, y: G },
    rightFoot: { x: cx + 20, y: G },
    _barY: handsY,
  };
}

/** Front standing isolation. */
export function poseFront(cx, { arms = 'down' } = {}) {
  const head = { x: cx, y: 55 };
  const neck = { x: cx, y: 70 };
  const hip = { x: cx, y: 118 };
  const ls = { x: cx - 16, y: 76 };
  const rs = { x: cx + 16, y: 76 };
  let leftElbow, rightElbow, leftHand, rightHand;
  if (arms === 'curl') {
    leftElbow = { x: cx - 18, y: 105 };
    rightElbow = { x: cx + 18, y: 105 };
    leftHand = { x: cx - 12, y: 82 };
    rightHand = { x: cx + 12, y: 82 };
  } else if (arms === 'raise') {
    leftElbow = { x: cx - 38, y: 88 };
    rightElbow = { x: cx + 38, y: 88 };
    leftHand = { x: cx - 52, y: 78 };
    rightHand = { x: cx + 52, y: 78 };
  } else if (arms === 'overhead') {
    leftElbow = { x: cx - 12, y: 55 };
    rightElbow = { x: cx + 12, y: 55 };
    leftHand = { x: cx - 8, y: 38 };
    rightHand = { x: cx + 8, y: 38 };
  } else {
    leftElbow = { x: cx - 18, y: 100 };
    rightElbow = { x: cx + 18, y: 100 };
    leftHand = { x: cx - 20, y: 130 };
    rightHand = { x: cx + 20, y: 130 };
  }
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
    leftKnee: { x: cx - 12, y: 150 },
    rightKnee: { x: cx + 12, y: 150 },
    leftFoot: { x: cx - 16, y: G },
    rightFoot: { x: cx + 16, y: G },
  };
}

/** Dead hang / pull-up. chinOver = top position. */
export function poseHang(cx, { chinOver = false } = {}) {
  const headY = chinOver ? 62 : 95;
  const hipY = chinOver ? 115 : 145;
  return {
    head: { x: cx, y: headY },
    neck: { x: cx, y: headY + 14 },
    hip: { x: cx, y: hipY },
    leftShoulder: { x: cx - 14, y: headY + 18 },
    rightShoulder: { x: cx + 14, y: headY + 18 },
    leftElbow: { x: cx - 22, y: chinOver ? 58 : 78 },
    rightElbow: { x: cx + 22, y: chinOver ? 58 : 78 },
    leftHand: { x: cx - 18, y: 50 },
    rightHand: { x: cx + 18, y: 50 },
    leftKnee: { x: cx - 8, y: hipY + 20 },
    rightKnee: { x: cx + 8, y: hipY + 20 },
    leftFoot: { x: cx - 10, y: chinOver ? 155 : G },
    rightFoot: { x: cx + 10, y: chinOver ? 155 : G },
  };
}
