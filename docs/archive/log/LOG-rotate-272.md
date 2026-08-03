# Rotated for .272

## 2026-08-01 — Opacity is not a state, it is a contrast reduction (`.256`)

> **Merge correction, written when this branch landed.** `.240` reached `master`
> first with the same fix in `PlanSessionCard` — the same defect, the same
> `WeekStrip` precedent cited, a second independent pair of axe numbers. Two
> lanes converged on it, which is worth recording rather than tidying away.
>
> `master`'s treatment stands in the code, and `dashed` is the better of the
> two borders: a plain 2px border is what every other card on that grid already
> draws, so it said "missed" in the language the screen was using for "normal".
>
> What survives from here is the half neither border covers — the **`Missed`
> Badge**, and the **guard**. `.240` fixed one component; `stateOpacityContrast.test.ts`
> bans bare `opacity-{40..80}` across `src/components` and `src/page-components`
> so the next one is caught rather than found. That is the difference between
> fixing an instance and closing a class.

`npm run gate` went red on `/coach`:

```
Element has insufficient color contrast of 2.97
(foreground #8a8888, background #eeebeb, 10px, normal weight)
<div class="… bg-neutral-200 text-neutral-800 text-[10px]">Shoulders</div>
target: .opacity-60.rounded-2xl.bg-card … 
```

One class caused it:

```tsx
// PlanSessionCard.tsx, before
session.status === 'missed' && 'opacity-60',
```

Container opacity composites **every descendant** toward the ground, so dimming
a card dims its text with it. `bg-neutral-200 text-neutral-800` is a perfectly
legible pairing on its own; at 60% over paper it is `#8a8888` on `#eeebeb`, less
than two thirds of the ratio WCAG 1.4.3 requires.

### The rule was already written down, three files away

```tsx
// WeekStrip.tsx:85 — the missed cell of the very same plan
// Quieter via border + no glyph, not opacity — dimming the
// container also dims the day label past 4.5:1 at 10px.
missed && 'border-border bg-transparent',
```

Two components, one concept, opposite treatments. `.178` again — and the more
useful lesson is about where the correct answer lived: in a comment, which
protects the file it is in and nothing else.

The card now uses the strip's treatment, and it also says **"Missed" in words**
via `coachSessionMissed` — the key `WeekStrip` has used since it was written, so
this costs no translation. Worth stating plainly: opacity conveyed the status to
sighted users only, and a border conveys it to nobody at all. The status was
never in the accessibility tree.

### Why no test caught it, and why the new one reads source

Every offender here renders only in a state the a11y suite never reaches. This
markup needed `.207` — the fix for *"no session was ever marked missed"* — so it
was literally unreachable for as long as it was wrong. `/coach` has been in
`GATED_ROUTES` the whole time and passed.

So `src/lib/stateOpacityContrast.test.ts` does not wait for a render. No **bare**
`opacity-{40,50,60,70,80}` in `src/components` or `src/page-components`.
Prefixed variants are deliberately out of scope: `disabled:opacity-50` is the
shadcn idiom and WCAG 1.4.3 exempts inactive controls, and `hover:`/`group-`
states are transient. What is dangerous is the unprefixed kind, which is on the
element for as long as the element exists.

Ten exemptions, each with a reason, plus a staleness test. Four are paywall
previews blurred by design, four are icons with no text node, one is a disabled
drop zone that cannot use the `disabled:` variant because it is a div, and one
is an `aria-hidden` background photograph.

### It found two more, and arithmetic settled both

Neither was assumed. Both were computed from the tokens the components actually
resolve to.

**`MuscleHeatmap`** put `opacity-70` on the volume percentage. `heatColor` gives
the hottest cell `text-accent-900` (#4d170e) on `bg-accent-400` (#ff9783):

| cell fill | full | @0.70 | @0.80 |
|---|---|---|---|
| accent-100 | 13.29 | 5.49 | 7.48 |
| accent-200 | 11.71 | 5.14 | 6.85 |
| accent-300 | 9.58 | 4.56 | 5.89 |
| **accent-400** | 6.93 | **3.76** | 4.62 |

The busiest muscle group — the one an athlete most wants to read — was the only
one below the line. axe never saw it because that span needs `cell.intensity > 0`
and the suite seeds onboarding with no history, so `/history` passes with the
element absent. The `opacity-80` body copy beneath it cleared the bar by 0.12,
which is a rounding error rather than a margin; both are gone.

**`TodayDashboardHeader`** dimmed the Trends disclosure caret to `opacity-60`.
`text-muted-foreground` (#484747) is 8.29:1 on paper and **3.04:1** at 60% — on
`/`, the most-visited screen in the product, and hidden from axe for the same
reason: the block renders only when `trends` exists.

A route being in `GATED_ROUTES` is not the same as the states on that route
being covered. That is the gap this check exists to cover, and it is why it
reads source rather than pixels.
