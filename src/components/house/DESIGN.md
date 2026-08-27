# House design system

Signed-in product chrome. Runtime: [`house.css`](house.css), scoped to `.mw-house`.

The field-manual (`src/index.css`, [`docs/DESIGN_SYSTEM.md`](../../../docs/DESIGN_SYSTEM.md)) stays on `/private`, landing, and www. Do not copy house tokens there. Do not load a second typeface in `app/layout.tsx`.

## Tokens

| Token | Value | Role |
|-------|--------|------|
| `--house-paper` | `#ffffff` | Canvas, cards, rail |
| `--house-stage` | `#f4f4f5` | Area behind the canvas |
| `--house-ink` | `#18181b` | Text |
| `--house-muted` | `#71717a` | Secondary |
| `--house-faint` | `#a1a1aa` | Disabled |
| `--house-line` | `#e4e4e7` | 1px hairline |
| `--house-soft` | `#fafafa` | Soft fill |
| `--house-chip` | `#f4f4f5` | Hover / selected row |
| `--house-press` | `#18181b` | Primary pill |
| `--house-press-ink` | `#fafafa` | Text on press |
| `--house-live` | `#ae1800` | Train pulse only |
| `--house-radius` | `16px` | Cards |
| `--house-radius-sm` | `10px` | Inputs / small |
| `--house-pill` | `999px` | Buttons, second-bar rows, chips |
| `--house-rail` | `72px` | Icon column |
| `--house-second` | `264px` | Adjacent bar |
| `--house-side` | `300px` | Sidecar |
| `--house-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default |
| `--house-dur` | `180ms` | Chips, hover |
| `--house-dur-slow` | `260ms` | Column, pane, canvas |

Inherited shadcn tokens inside `.mw-house` remap to the same white / zinc / 1rem radius so History, Library, Coach, and the set table pick this up without a second copy of each page.

## Type

`ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif`. Features `ss01` + `cv11`. Tracking `-0.011em` body, `-0.03em` display. Weights 500–700. Sizes: 13 chip / 14 second-bar / 15 body / 22 pane title / 28–32 canvas title. No Archivo. No caps kickers.

## Layout

Desktop `≥723px`: `grid-template-columns: 72 + second-width + 1fr`. Home and Library set `--house-second-w: 264px`. Train compose is one column. Compact `<723` hides rail and second bar; floor icons stay.

Second bar is **column 2**, immediately right of the rail. Never a far-right Home sheet. More leftover may stay a right sheet.

## Motion

Column width eases `260ms`. Second-bar rows stagger `40ms` (cap `160ms`). Chips `180–220ms` opacity + translate. Canvas fades up `8px`. `prefers-reduced-motion: reduce` still kills animation. No shadows. No dotted texture.

## Components

| Piece | Class | Rule |
|-------|--------|------|
| Icon rail | `.house-rail` | 48px marks, hover chip to the **right** |
| Hover chip | `.house-rail-tip` | Black, 13px, 8px radius |
| Second bar | `.house-second` | Kicker + pill rows; pane has back chevron |
| Card | `.house-card` | Paper, 1px line, 16px radius |
| Primary | `.house-btn-primary` | Black pill. One filled action |
| Guide | `.house-guide` | One Got it. No chain |
| First rooms | `.house-first-rooms` | N-of-N under Start |
| More leftover | `.house-more-panel` | Fuel / You / Account + quiet foot |

## Rooms (existing engines)

Today Start → `/active`. This week pane shows the real week; `generateWeek` writes only on `/coach`. History and Weekly plan are the real pages. Library \| Builder. More leftover: Fuel, You, Account, Move, Mind, Track, Learn, Feedback, Garage. `/server` is quiet More only.

Transferred rooms hide `data-house-costume="pillar-header"`. The second bar names the room. Canvas keeps an `sr-only` title.

## Do not

Mint Studio. Put chat or a bell on Today. Make Today a feed. Gate `logSet`. Restyle `/private`, landing, or www. Ship a licensed display face. Use poster red except the Train pulse.
