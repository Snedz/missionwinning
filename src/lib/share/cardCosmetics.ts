/**
 * The earned frames and backdrops, and the only place they are painted (`.612`).
 *
 * **Why this is its own module rather than three branches inside `renderShareCard`.**
 *
 * `.610` shipped these as `if (backdrop === 'grid') …` chains in `shareCard.ts`.
 * That file is imported by `WorkoutVictorySheet`, which renders on `/active`, so
 * webpack compiled the whole catalog into `/active`'s entry — 1.1 KB gzipped of
 * frames and backdrops that a victory card, which passes no cosmetics at all,
 * can never reach. `/active` is already over its bundle budget, and the repo's
 * standing rule is that initial JS only ratchets down. Measured, not assumed:
 * `/active` went 443.5 → 444.6 KB across `.610`, and the `rule-field` and
 * `poster-block` string literals were greppable in
 * `.next/static/chunks/app/(app)/active/page-*.js`.
 *
 * The dependency runs one way — this module imports `shareCard`, never the
 * reverse — which is what keeps the catalog out of the victory path. A guard in
 * `cardCosmetics.test.ts` fails if that edge is ever added back.
 *
 * Brand values are imported rather than re-declared: `check-token-sync` greps
 * `shareCard.ts` for them and `check-design-system` allowlists that one path for
 * raw hex, so a second copy here would sit outside both guards.
 */

import type { CardBackdropId, CardFrameId } from '../../../packages/mw-core/src/identity/athleteCard';
import {
  FOOTER_BASELINE,
  INK,
  MUTED,
  POSTER,
  RED_700,
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
  type ShareCardCosmetics,
} from './shareCard';

/**
 * Earned backdrops. Paper is the default and paints nothing extra.
 *
 * Structural, never ornamental: the design system allows no gradients, glows or
 * shadows, so what an athlete unlocks is the system's own vocabulary getting
 * denser — a grid, then a rule field, then a poster block.
 */
function paintBackdrop(ctx: CanvasRenderingContext2D, backdrop: CardBackdropId): void {
  if (backdrop === 'paper') return;
  ctx.save();
  if (backdrop === 'grid') {
    ctx.strokeStyle = MUTED;
    ctx.globalAlpha = 0.14;
    ctx.lineWidth = 2;
    for (let x = 72; x < SHARE_CARD_WIDTH; x += 108) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, SHARE_CARD_HEIGHT);
      ctx.stroke();
    }
  } else if (backdrop === 'rule-field') {
    ctx.fillStyle = MUTED;
    ctx.globalAlpha = 0.12;
    for (let y = 420; y < FOOTER_BASELINE; y += 54) ctx.fillRect(0, y, SHARE_CARD_WIDTH, 2);
  } else if (backdrop === 'poster-block') {
    ctx.fillStyle = POSTER;
    ctx.globalAlpha = 0.1;
    ctx.fillRect(0, SHARE_CARD_HEIGHT - 420, SHARE_CARD_WIDTH, 420);
  }
  ctx.restore();
}

/** Earned frames. Hairline is the default and paints nothing extra. */
function paintFrame(ctx: CanvasRenderingContext2D, frame: CardFrameId): void {
  if (frame === 'hairline') return;
  ctx.save();
  if (frame === 'rule') {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, SHARE_CARD_WIDTH - 48, SHARE_CARD_HEIGHT - 48);
  } else if (frame === 'double-rule') {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, SHARE_CARD_WIDTH - 48, SHARE_CARD_HEIGHT - 48);
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, SHARE_CARD_WIDTH - 80, SHARE_CARD_HEIGHT - 80);
  } else if (frame === 'poster') {
    ctx.strokeStyle = RED_700;
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, SHARE_CARD_WIDTH - 40, SHARE_CARD_HEIGHT - 40);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.strokeRect(44, 44, SHARE_CARD_WIDTH - 88, SHARE_CARD_HEIGHT - 88);
  }
  ctx.restore();
}

/**
 * Bind a resolved pick to its painters.
 *
 * Takes ids that have already been clamped by `resolveCardCosmetics` — this does
 * not re-check entitlement, and must not be handed raw stored picks.
 */
export function cardCosmetics(frame: CardFrameId, backdrop: CardBackdropId): ShareCardCosmetics {
  return {
    frame,
    backdrop,
    paintBackdrop: (ctx) => paintBackdrop(ctx, backdrop),
    paintFrame: (ctx) => paintFrame(ctx, frame),
  };
}
