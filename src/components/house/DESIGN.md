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
| `--house-chip` | `#f4f4f5` | Hover fill |
| `--house-selected` | `#eeeeee` | Selected row / rail mark |
| `--house-press` | `#18181b` | Primary pill |
| `--house-press-ink` | `#fafafa` | Text on press |
| `--house-live` | `#ae1800` | Train pulse only |
| `--house-radius` | `16px` | Cards |
| `--house-radius-sm` | `10px` | Inputs / small |
| `--house-radius-row` | `12px` | Second-bar rows |
| `--house-radius-rail` | `8px` | Rail marks, filters, empty CTA |
| `--house-radius-sheet` | `12px` | White panel wrapping second + canvas |
| `--house-pill` | `999px` | Primary buttons, plus circle |
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

Desktop `≥723px`: frame is `72 + 1fr` on a grey stage. Second bar and canvas sit in one white `.house-sheet` (`12px` radius, `8px` inset on top/right/bottom, flush to the rail). Home and Library set `--house-second-w: 264px` inside that sheet. Train compose is one column, no sheet. Compact `<723` uses `display: contents` on the sheet so rail and second bar stay hidden; floor icons stay.

Second bar is **column 1 of the sheet**, immediately right of the rail. Never a far-right Home sheet. More leftover may stay a right sheet.

## Motion

Column width eases `260ms`. Second-bar rows stagger `40ms` (cap `160ms`). Chips `180–220ms` opacity + translate. Canvas fades up `8px`. `prefers-reduced-motion: reduce` still kills animation. No shadows. No dotted texture.

## Components

| Piece | Class | Rule |
|-------|--------|------|
| Icon rail | `.house-rail` | 48×48 marks, selected `#eee` / 8px; hover chip to the **right** |
| Train plus | `.house-rail-plus` | 40×40 white circle, 1px line, no shadow (desktop rail and compact floor). Click `/active`. |
| Hover chip | `.house-rail-tip` | Black, 13px, 8px radius |
| Sheet | `.house-sheet` | White 12px panel wrapping second + canvas |
| Second bar | `.house-second` | Kicker + 12px rows, selected `#eee`; pane has back chevron |
| Card | `.house-card` | Paper, 1px line, 16px radius |
| Primary | `.house-btn-primary` | Black pill. One filled action |
| Guide | `.house-guide` | One Got it. No chain |
| First rooms | `.house-first-rooms` | N-of-N under Start |
| Train compose | `.house-compose-live` | Log set stays the filled action. Empty is house-lede. Add exercise is house-btn. Extras in house-card Show all. Sidecar leftover is rest / skip / notes. History stays on Home. |
| Catalog row | `.house-item` in `.house-catalog` | Hairline list. Pick mark + name + details |
| History row | `.house-item` in `.house-history` | Hairline list. Open log; Again / Details ghost |
| Plan empty | `.house-empty` + dock | Invite on the sheet; Generate stays one filled action on `/coach` |
| Builder start | `.house-builder` | Blank workout is the filled action. Saved rows are hairline items. Templates stay in Show all |
| You leftover | `.house-profile` | Quiet title stays. Account door is a ghost house button |
| Account leftover | `.house-account` | Quiet title stays. Sign-in / return / prefs stay first paint. Explore, more settings, and help are house-card objects. Sidecar leftover rooms only (Account / You). Never History or Coach on the right. |
| Fuel leftover | `.house-fuel` | Log stays first paint. Search / barcode / recipes stay in Show all |
| Quiet More | `.house-move` `.house-mind` `.house-track` `.house-learn` | Quiet title stays. First paint unchanged. Extra tools in house-card Show all |
| Feedback leftover | `.house-feedback` | Quiet title stays. Form is the first-paint object. One filled submit. Sign-in stays extra. |
| Garage leftover | `.house-garage` | Quiet foot only. Never a rail. First paint unchanged. |
| Explore leftover | `.house-explore` | Quiet title stays. Board + pin list stay first paint. Add a place is a house-card. Never a rail. Account still doors it. Not a shop. |
| Assessment leftover | `.house-assess` | Quiet title stays. Form is the first-paint object. One filled submit. Question labels use EN floors on first paint. Stage prompts stay in Show all. Sign-in stays extra. Never a rail. Account More settings still doors it. |
| Calculator leftover | `.house-calc` | Quiet title stays. 1RM / macros / plates stay first paint. Chips are house-state. Tools sit in house-card. Premium stays in Show all. Sign-in stays extra. Never a rail. Not a shop. Account More settings still doors it. |
| More leftover | `.house-more-panel` | Fuel / You / Account as 12px rows, selected `#eee`. Quiet foot is stacked 13px muted rows; current leftover is ink, not `#eee`. |

## Rooms (existing engines)

Today Start → `/active`. This week pane shows the real week; `generateWeek` writes only on `/coach`. History and Weekly plan are the real pages. Library \| Builder. More leftover: Fuel, You, Account, Move, Mind, Track, Learn, Feedback, Garage. `/server` is quiet More only.

Transferred rooms hide `data-house-costume="pillar-header"`. The second bar names the room. Canvas keeps an `sr-only` title.

On the desktop sheet, Today does not repeat a “Today” H1. The date kicker stays. The canvas then starts with the session (kicker + title + one Start). The Start hero is flush on the sheet, not a nested paper card. First rooms stay one object. Compact `<723` still shows the Today title because the second bar is hidden.

## Do not

Mint Studio. Put chat or a bell on Today. Make Today a feed. Gate `logSet`. Restyle `/private`, landing, or www. Ship a licensed display face. Use poster red except the Train pulse.
