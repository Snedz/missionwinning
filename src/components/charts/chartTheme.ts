/**
 * One definition of chart chrome.
 *
 * `.244` — four recharts files each re-declared their own grid, axes and
 * tooltip, and they had already drifted three ways:
 *
 * - `TrackPaceChart` drew `rgba(255,255,255,…)` grid lines and axis labels —
 *   the pre-rebrand dark theme, left on a **paper** ground, so both were
 *   effectively invisible. `check-design-system` matched hex only and could
 *   not see them.
 * - `BodyMetricsCard`'s `<Tooltip>` carried **no `contentStyle` at all**, so it
 *   rendered recharts' stock white-on-`#ccc` box with the library's own radius
 *   — styling that is *absent* rather than wrong, which no colour scan can
 *   catch by construction.
 * - `History1RMChart` and `Benchmarks1RMChart` plot the **same two series** and
 *   assigned them opposite colours: red meant *actual* on one screen and
 *   *estimated* on the other.
 *
 * That last one is why this file exports a **semantic** series pair rather than
 * a palette. `.221` gave the rebrand one hue, so two lines cannot be told apart
 * by colour — they are split by **dash**, which WCAG 1.4.1 asks for anyway. The
 * meaning rides with the stroke: what the athlete actually lifted is solid and
 * takes the one accent; what the app inferred is dashed and quiet. Naming them
 * `measured`/`derived` instead of `red`/`grey` is what stops the next chart
 * from picking the assignment afresh.
 *
 * ## Why props objects and not a `<ChartTooltip>` component
 *
 * A wrapper component would make the unstyled tooltip unrepresentable, which is
 * the stronger design — and recharts cannot accept one. `findAllByType` matches
 * chart children on `displayName || name` and then reads props off **that**
 * element (`recharts/lib/util/ReactUtils.js:96,127`). A `<ChartTooltip>` is
 * either ignored outright, or — if its `displayName` is faked to `'Tooltip'` —
 * matched with the defaults still sitting unread in the inner element. Verified
 * against the installed 2.15.4 source, not assumed.
 *
 * So the guard does the work instead: `unstyled-chart-tooltip` in
 * `check-design-system.mjs` fails any `<Tooltip>` that does not spread
 * `CHART_TOOLTIP`.
 */

/** Grid lines. Ink at low weight — never a white that only existed on the dark theme. */
export const CHART_GRID = {
  strokeDasharray: '3 3',
  stroke: 'hsl(var(--border))',
} as const;

/** Axis tick labels. */
export const CHART_TICK = {
  fontSize: 10,
  fill: 'hsl(var(--muted-foreground))',
} as const;

/** Axis lines themselves. */
export const CHART_AXIS_STROKE = 'hsl(var(--border))';

/**
 * The tooltip surface: card fill, 2px rule, radius 0 — the Modernist panel.
 * Spread it (`<Tooltip {...CHART_TOOLTIP} />`); the guard fails a bare one.
 */
export const CHART_TOOLTIP = {
  contentStyle: {
    background: 'hsl(var(--card))',
    border: '2px solid hsl(var(--border))',
    borderRadius: 0,
    fontSize: 12,
  },
  labelStyle: { color: 'hsl(var(--foreground))' },
} as const;

/**
 * The two-series convention, by meaning rather than colour.
 *
 * `measured` — what the athlete actually did. Solid, one accent.
 * `derived`  — what the app inferred. Dashed, quiet.
 *
 * Any chart drawing an observed quantity against a computed one uses this pair,
 * so red never changes meaning between two screens again.
 */
export const CHART_SERIES = {
  measured: {
    stroke: 'hsl(var(--accent-poster))',
    strokeWidth: 2,
    dot: { fill: 'hsl(var(--accent-poster))', r: 4 },
  },
  derived: {
    stroke: 'hsl(var(--muted-foreground))',
    strokeWidth: 2,
    strokeDasharray: '5 4',
    dot: { fill: 'hsl(var(--muted-foreground))', r: 3 },
  },
} as const;

/** A single-series chart (pace, body weight) takes the accent — nothing to contrast against. */
export const CHART_SERIES_SOLO = {
  stroke: 'hsl(var(--accent-poster))',
  strokeWidth: 2,
} as const;
