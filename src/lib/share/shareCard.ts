/**
 * Share cards: the session or the week as an image the athlete chooses to send.
 *
 * This is the growth surface a privacy-first logger is allowed to have. Hevy's loop
 * is an in-app social feed; ours is share OUT — the workout content stays on this
 * device, and what leaves is a PNG the athlete deliberately hands to their group
 * chat, with their referral link riding along. Nothing here talks to a server.
 *
 * Split on the same seam as everything else in this repo: the card DATA builders are
 * pure and tested (what is claimed on the card is exactly the kind of thing that can
 * quietly lie — an invented PR line is the `.179` counter bug wearing a nicer shirt),
 * while the canvas renderer is a thin DOM-only painter.
 *
 * Brand values duplicate `scripts/check-token-sync.mjs` BRAND_HEX by necessity —
 * canvas cannot read CSS custom properties from a detached context. If the brand
 * moves, `check-token-sync` breaks the build and this file is on its grep list.
 */

import type { PersonalRecord } from '@/lib/coach/progress';
import type { WorkoutVictorySummary } from '@/lib/workout/workoutVictory';
import type { WeeklyDebrief } from '@/lib/weeklyDebrief';
import { EN_ONLY_SURFACE, formatLocalNumber } from '@/lib/i18n/formatLocale';

/** From BRAND_HEX in scripts/check-token-sync.mjs — paper/ink/poster/red-700. */
const PAPER = '#f3f2f2';
const INK = '#201e1d';
const POSTER = '#ec3013';
const RED_700 = '#ae1800';
const MUTED = '#5f5e5d';

export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1350;

export interface ShareCardStat {
  label: string;
  value: string;
}

export interface ShareCardData {
  kicker: string;
  title: string;
  stats: ShareCardStat[];
  /** Present only when a genuine record exists — never invented. */
  prLine: string | null;
  footer: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.max(1, Math.round(seconds / 60));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m`;
}

function exerciseLabel(id: string): string {
  return id.replace(/-/g, ' ');
}

/**
 * The one PR the card leads with: heaviest-weight record first, else the first
 * record of any kind. No records → no line. The debrief's rule holds here: nothing
 * is said that is not known.
 */
export function pickHeadlinePr(records: PersonalRecord[], unitLabel: string): string | null {
  if (records.length === 0) return null;
  const eligible = records.filter((r) => r.previous !== null);
  if (eligible.length === 0) return null;
  const weightPr = eligible.find((r) => r.kind === 'weight');
  const pr = weightPr ?? eligible[0];
  const name = exerciseLabel(pr.exerciseId);
  if (pr.kind === 'weight') return `New best: ${name} ${pr.value} ${unitLabel}`;
  if (pr.kind === 'reps') return `New best: ${name} × ${pr.value}`;
  return `New best: ${name} e1RM ${pr.value} ${unitLabel}`;
}

export function buildVictoryCardData(
  summary: WorkoutVictorySummary,
  records: PersonalRecord[],
  unitLabel: string
): ShareCardData {
  const stats: ShareCardStat[] = [
    { label: 'Volume', value: `${formatLocalNumber(summary.totalVolume, EN_ONLY_SURFACE)} ${unitLabel}` },
    { label: 'Sets', value: String(summary.setCount) },
    { label: 'Time', value: formatDuration(summary.durationSeconds) },
  ];
  if (summary.streak > 1) stats.push({ label: 'Streak', value: `${summary.streak} days` });
  return {
    kicker: 'SESSION LOCKED',
    title: summary.workoutName,
    stats,
    prLine: pickHeadlinePr(records, unitLabel),
    footer: 'missionwinning.com — free logger, no account',
  };
}

export function buildRecapCardData(debrief: WeeklyDebrief, unitLabel: string): ShareCardData {
  const stats: ShareCardStat[] = [
    { label: 'Sessions', value: String(debrief.train.sessions) },
    { label: 'Sets', value: String(debrief.train.sets) },
    { label: 'Volume', value: `${formatLocalNumber(debrief.train.volume, EN_ONLY_SURFACE)} ${unitLabel}` },
  ];
  return {
    kicker: 'WEEK IN THE BOOKS',
    title: `Week of ${debrief.weekStart}`,
    stats,
    /*
     * `.223` — no PR line on the recap card.
     *
     * This read `debrief.train.prs`, which was sourced from a field nothing has
     * ever written, so the line could not render for anyone. The victory card's
     * `prLine` is unaffected: it comes from `pickHeadlinePr` over real records.
     *
     * It comes back when `isPr` survives session completion — today
     * `CompletedWorkoutLog` drops it, so a week's records are not on the record.
     */
    prLine: null,
    footer: 'missionwinning.com — free logger, no account',
  };
}

const FOOTER_BASELINE = SHARE_CARD_HEIGHT - 80;
const STATS_TOP = 500;
const STAT_ROW_HEIGHT = 190;
const COLUMN_X = [72, SHARE_CARD_WIDTH / 2 + 12];

export interface CardLayout {
  /** Baseline y for each stat's label; value sits 86px below. */
  stats: { x: number; y: number }[];
  prY: number | null;
  footerY: number;
}

/**
 * Where everything sits — pure, because the first version of this card computed
 * positions inline and **overflowed**: four stats plus a PR line put the PR text at
 * y=1280 with the footer at 1270, so they printed on top of each other. Every unit
 * test passed, because they all asserted the card's *data*. The bug was only visible
 * in a rendered PNG, and it appeared exactly in the best case — a streak *and* a
 * record, i.e. the session most worth sharing.
 *
 * Stats lay out in two columns, so four fit in two rows instead of a column that
 * walks off the bottom. The invariant this exists to make testable: nothing is ever
 * drawn below `FOOTER_BASELINE`.
 */
export function computeCardLayout(statCount: number, hasPr: boolean): CardLayout {
  const rows = Math.ceil(statCount / 2);
  const stats = Array.from({ length: statCount }, (_, i) => ({
    x: COLUMN_X[i % 2],
    y: STATS_TOP + Math.floor(i / 2) * STAT_ROW_HEIGHT,
  }));
  const statsBottom = STATS_TOP + rows * STAT_ROW_HEIGHT;
  return {
    stats,
    prY: hasPr ? statsBottom + 40 : null,
    footerY: FOOTER_BASELINE,
  };
}

/**
 * Paint the card. 1080×1350 (portrait 4:5 — the share-sheet-friendly ratio), paper
 * ground, ink type, one poster-red band. Small text never uses poster red — 3.78:1
 * on paper — the same contrast rule the app's stylesheet documents; the red band
 * carries paper text instead.
 */
export function renderShareCard(data: ShareCardData): Promise<Blob | null> {
  if (typeof document === 'undefined') return Promise.resolve(null);
  const canvas = document.createElement('canvas');
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);

  const font = (px: number, weight = 700) =>
    `${weight} ${px}px Archivo, system-ui, -apple-system, sans-serif`;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);

  // Poster-red kicker band with paper text (large type — poster red is legal here).
  ctx.fillStyle = POSTER;
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, 140);
  ctx.fillStyle = PAPER;
  ctx.font = font(44);
  ctx.textBaseline = 'middle';
  ctx.fillText(data.kicker, 72, 74);

  // Title — ink, condensed-feel weight.
  ctx.fillStyle = INK;
  ctx.font = font(88, 800);
  ctx.textBaseline = 'alphabetic';
  const title = data.title.length > 22 ? `${data.title.slice(0, 21)}…` : data.title;
  ctx.fillText(title, 72, 320);

  // Rule under the title — 2px ink, the system's hairline.
  ctx.fillRect(72, 368, SHARE_CARD_WIDTH - 144, 2);

  // Positions come from the pure layout so overflow is a test failure, not a
  // surprise in someone's group chat.
  const layout = computeCardLayout(data.stats.length, data.prLine !== null);

  data.stats.forEach((stat, i) => {
    const { x, y } = layout.stats[i];
    ctx.fillStyle = MUTED;
    ctx.font = font(38, 600);
    ctx.fillText(stat.label.toUpperCase(), x, y);
    ctx.fillStyle = INK;
    ctx.font = font(72, 800);
    ctx.fillText(stat.value, x, y + 86);
  });

  // PR line — red-700 (small-text-legal red), only when real.
  if (data.prLine && layout.prY !== null) {
    ctx.fillStyle = RED_700;
    ctx.font = font(48, 800);
    ctx.fillText(data.prLine, 72, layout.prY);
  }

  // Footer.
  ctx.fillStyle = MUTED;
  ctx.font = font(34, 600);
  ctx.fillText(data.footer, 72, layout.footerY);

  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    } catch {
      resolve(null);
    }
  });
}

/**
 * Share the card: files-capable share sheet when the platform has one, else
 * download the PNG and put the text on the clipboard. Returns how it went, for
 * analytics — the caller tracks, this module stays DOM-only.
 */
export async function shareCardImage(
  blob: Blob,
  text: string,
  url: string,
  filename = 'mission-winning.png'
): Promise<'shared' | 'downloaded' | 'failed'> {
  const file = new File([blob], filename, { type: 'image/png' });
  if (
    typeof navigator !== 'undefined' &&
    navigator.canShare?.({ files: [file] }) &&
    navigator.share
  ) {
    try {
      await navigator.share({ files: [file], text: `${text} ${url}` });
      return 'shared';
    } catch {
      /* cancelled — fall through to download */
    }
  }
  try {
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(`${text} ${url}`);
    return 'downloaded';
  } catch {
    return 'failed';
  }
}
