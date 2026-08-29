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
| First rooms | `.house-first-rooms` | N-of-N under Start. Today Start quiet offers are house leftover. Compact hero Start navigates from first paint. First-rooms Log a set navigates from first paint. First-rooms Week navigates from first paint. First-rooms History navigates from first paint. /log client nav is not group Loading. |
| Train compose | `.house-compose-live` | `/active` client nav is not group Loading. Form / Swap sheets open on click from first paint. Sidecar first paint does not wait on persist. Log set first paint does not wait on persist. Prev cite is house leftover. Set row hairline is house leftover. Upcoming set row is house leftover. Kind chip row is house leftover. Session clock cite is house leftover. Session clock size is house leftover. Session title is a house title. In-set cue line is house leftover. In-set cue line size is house leftover. In-set cue still is house leftover. In-set cue mark is house leftover. Show-all door is house leftover. Set table size is house leftover. Log set size is house leftover. Log set weight is house leftover. Log set leading is house leftover. Log set is house leftover. LogConsole Log set is house leftover. Log set stays the filled action. Empty is house-lede. Add exercise is house-btn. Add Set is house-btn. Rest lanes are house-state; selected `#eee`. Number cells are house-num. Extra set cells are house-num. Set table head is house leftover. Set row kicker is house leftover. Logged check is house leftover. Completed row is house leftover. Plus-load prefix is house leftover. Kind badge is house leftover. Plate skip is house-btn. Next-cite Skip is house-btn. Finish is house-btn, not filled. Session more is house leftover: ghost more, house-card overflow. Session more hold is house leftover. Cue me is house leftover. Plate loader is house leftover. Apply stays primary-action. Exercise more is house leftover: ghost more, house-card overflow. Set options is house leftover: ghost more, house-card overflow. Reorder handle is house leftover: ghost house-btn grip and arrows. Skip this exercise is house-btn hold, not filled. Swap is house-btn ghost, not filled. Swap confirm is house-btn, not filled. Swap sheet is house leftover. Garage swap is house leftover. Exercise card is house leftover. Exercise head is house leftover. Form guide is house-btn ghost. Form guide confirm is house-btn, not filled. Form guide + Swap portal is house leftover. Form guide body is house leftover. Form guide sections is house leftover. Overlay header is house leftover. Overlay footer is house leftover. Overlay panel is house leftover. Repeat last set is house-btn, not filled. Pin and Note are house-field. Add-exercise search is house leftover. Add-exercise sheet is house leftover. Check-in confirm is house leftover. Check-in scale is house leftover. Hard-session confirm is house leftover. This-movement history is house leftover: Close is house-btn; rows are house-movement-row. Movement history date is house leftover. Movement history sheet is house leftover. Plates / tip stay in overflow. Show-all extras are house leftover. Session notes are house-field. Heart rate is house leftover. Rest dock is house leftover. Skip is house-btn, not filled. Last-set ghost is house leftover: house-btn ghost, not filled. Load-% cell is house-num. Readiness extra is house leftover. Warmup toggle is house leftover. Set side is house-num. In-set cues are a kicker + ghost hide / Learn door. Kind chips are house-state; selected `#eee`. Sidecar leftover is rest / skip / notes. History stays on Home. |
| Catalog row | `.house-item` in `.house-catalog` | /library client nav is not group Loading. Library first paint is house leftover. Hairline list. Pick mark + name + details. Library Filters is house leftover. Library Filters sheet is house leftover. Library detail is house leftover. Library hidden is house leftover. Library search is house leftover. Library showing count is house leftover. Library pick bar is house leftover. Library Show all extras is house leftover. Library Show-all door is house leftover. Posters / merge internals stay. |
| History row | `.house-item` in `.house-history` | /history client nav is not group Loading. History first paint is not Loading sessions. History list first paint is house leftover. Hairline list. Open log; Again / Details ghost. History tools are house leftover. History search is house leftover. History Show all extras is house leftover. History Show-all door is house leftover. /history day client nav is not group Loading. History day leftover is the open day (kicker + date + that day's rows; Repeat is house-btn ghost). Merge-exercises dialog is house leftover. Calendar / charts / posters stay parked. |
| Plan empty | `.house-empty` + dock | /coach client nav is not group Loading. Coach first paint is not a plan skeleton. Coach first paint is house leftover. Invite on the sheet; Generate stays one filled action on `/coach`. Coach generate dock is house leftover. Coach next-day cite is house leftover. Ghost Start — never a second filled action. Coach week dose is house leftover. Coach session card is house leftover. One filled Start this session on the boss card. Coach session lift is house leftover. Swap stays ghost. Coach live voice is house leftover. Talk is house-btn, not a second filled action. Coach adapt banner is house leftover. Coach Show all extras is house leftover. Coach Show-all door is house leftover. Voice / LoadBand / LogCite / Manage internals stay. Coach week strip is house leftover. Landing WeekStrip stays field-manual. |
| Builder start | `.house-builder` | /builder client nav is not group Loading. Builder first paint is house leftover. Blank workout is the filled action. Saved rows are hairline items. Templates stay in Show all. Builder Show all extras is house leftover. Builder Show-all door is house leftover. ProgramTemplatesPanel internals stay. |
| You leftover | `.house-profile` | You first paint is house leftover. You first-paint identity card is house leftover. You identity Edit / signature cites is house leftover. You first-paint athlete card is house leftover. You athlete card Edit / signature cites is house leftover. You first-paint table card is house leftover. You table Edit / row hairlines is house leftover. You first-paint rewards card is house leftover. You first-paint kit card is house leftover. You first-paint private note card is house leftover. You private note textarea is house leftover. You first-paint share card is house leftover. You share body cite is house leftover. You first-paint career card is house leftover. Quiet title stays. Identity / kit first. Account door is a ghost house button |
| Account leftover | `.house-account` | Account first paint is house leftover. Account first-paint account card is house leftover. Account first-paint sign-in block is house leftover. Account first-paint visibility card is house leftover. Account first-paint reminders card is house leftover. Account first-paint reminders day-review row is house leftover. Account first-paint home gym kit is house leftover. Account first-paint units card is house leftover. Account first-paint language card is house leftover. Account first-paint goals card is house leftover. Account first-paint goals textarea is house leftover. Account first-paint referral card is house leftover. Account first-paint feedback card is house leftover. Account first-paint premium card is house leftover. Under the Hood first paint is house leftover. Under the Hood week-4 diagnostic card is house leftover. Visibility first paint is house leftover. Visibility first-paint report row is house leftover. Account more-settings pregnancy card is house leftover. Account more-settings assessment card is house leftover. Account more-settings beta journey card is house leftover. Account more-settings journey card is house leftover. Account more-settings wearables card is house leftover. Account more-settings What’s New card is house leftover. Account more-settings privacy card is house leftover. Account more-settings backup card is house leftover. Account more-settings import card is house leftover. Account more-settings sync status row is house leftover. Account owner-tools founder status board is house leftover. Account owner-tools cards is house leftover. Account owner-tools beta admin cards is house leftover. Quiet title stays. Sign-in / return / prefs stay first paint. Explore, more settings, and help are house-card objects. Sidecar leftover rooms only (Account / You). Never History or Coach on the right. |
| Fuel leftover | `.house-fuel` | Fuel first paint is house leftover. Log stays first paint. Fuel first-paint notepad is house leftover. Fuel first-paint today log is house leftover. Fuel first-paint remaining is house leftover. Recents are house-state. Type field is house-field. Water / Load from Cloud are house-btn, not filled. MeterBar stays. Search / barcode / recipes stay in Show all. |
| Quiet More | `.house-move` `.house-mind` `.house-track` `.house-learn` | Quiet title stays. Move first-paint flow list is house leftover. Move first-paint quiet log is house leftover. Log is house-btn, not filled. Kind chips are house-state; selected `#eee`. Track first paint is house leftover. Track first-paint metrics is house leftover. Mind first-paint check-in is house leftover. Mind first-paint breathe is house leftover. Learn first-paint intro is house leftover. Extra tools in house-card Show all |
| Feedback leftover | `.house-feedback` | Quiet title stays. Form is the first-paint object. One filled submit. Sign-in stays extra. |
| Garage leftover | `.house-garage` | Quiet foot only. Never a rail. Garage first-paint board is house leftover. BuddyList / ChatWindow internals stay. |
| Explore leftover | `.house-explore` | Quiet title stays. Board + pin list stay first paint. Add a place is a house-card. Never a rail. Account still doors it. Not a shop. |
| Assessment leftover | `.house-assess` | Quiet title stays. Form is the first-paint object. One filled submit. Question labels use EN floors on first paint. Stage prompts stay in Show all. Sign-in stays extra. Never a rail. Account More settings still doors it. |
| Calculator leftover | `.house-calc` | Quiet title stays. 1RM / macros / plates stay first paint. Chips are house-state. Tools sit in house-card. Premium stays in Show all. Sign-in stays extra. Never a rail. Not a shop. Account More settings still doors it. |
| Human coaching leftover | `.house-coaching` | Quiet title stays. Form is the first-paint object. One filled submit. Never a rail. Not Mission Coach. Not a shop. |
| Programs leftover | `.house-programs` | Quiet title stays. Education outlines first. Chips are house-state. Unlock / price stay in Show all. Never a rail. Not the training catalog. Not a shop. |
| Help leftover | `.house-help` | Quiet title stays. FAQ is the first-paint object. Hairline items. Never a rail. Free logger stays ungated. |
| Cookies leftover | `.house-cookies` | Quiet title stays. Overview + inventory stay first paint. Table is a house object. Never a rail. Legal copy unchanged. |
| Privacy leftover | `.house-privacy` | Quiet title stays. Jump chips are house-state. Sections are house-card. Never a rail. Legal copy unchanged. |
| Terms leftover | `.house-terms` | Quiet title stays. Jump chips are house-state. Sections are house-card. Never a rail. Legal copy unchanged. |
| Refunds leftover | `.house-refunds` | Quiet title stays. Jump chips are house-state. Sections are house-card. Never a rail. Legal copy unchanged. |
| DMCA leftover | `.house-dmca` | Quiet title stays. Jump chips are house-state. Sections are house-card. Never a rail. Legal copy unchanged. |
| Usage leftover | `.house-usage` | Quiet title stays. Jump chips are house-state. Sections are house-card. Never a rail. Legal copy unchanged. |
| Regions leftover | `.house-regions` | Quiet title stays. Jump chips are house-state. Sections are house-card. Never a rail. Legal copy unchanged. |
| Service-terms leftover | `.house-service-terms` | Quiet title stays. Jump chips are house-state. Sections are house-card. Never a rail. Legal copy unchanged. |
| Accessibility leftover | `.house-a11y` | Quiet title stays. Jump chips are house-state. Sections are house-card. Never a rail. Legal copy unchanged. |
| More leftover | `.house-more-panel` | Fuel / You / Account as 12px rows, selected `#eee`. Quiet foot is stacked 13px muted rows; current leftover is ink, not `#eee`. |

## Rooms (existing engines)

Today Start → `/active`. This week pane shows the real week; `generateWeek` writes only on `/coach`. History and Weekly plan are the real pages. Library \| Builder. Leaderboard first paint is house leftover. Benchmarks first paint is house leftover. Super Bundle first paint is house leftover. Move first paint is house leftover. Mind first paint is house leftover. Learn first paint is house leftover. Guidebook first paint is house leftover. Guide chapter first paint is house leftover. Course first paint is house leftover. More leftover: Fuel, You, Account, Move, Mind, Track, Learn, Feedback, Garage. `/server` is quiet More only.

Transferred rooms hide `data-house-costume="pillar-header"`. The second bar names the room. Canvas keeps an `sr-only` title.

On the desktop sheet, Today does not repeat a “Today” H1. The date kicker stays. The canvas then starts with the session (kicker + title + one Start). The Start hero is flush on the sheet, not a nested paper card. First rooms stay one object. Compact `<723` still shows the Today title because the second bar is hidden. Compact hero Start navigates from first paint (`href="/active"`). `/log` client nav is not group Loading. First paint always shows Just Go, first rooms, and the week strip — do not hide them until snap. Start on `/log` writes today's session (Just Go with last loads) before Train opens. Cold `/active` is a static compose page: add-exercise + a set row + Log set before hydrate. `/active` client nav is not group Loading. Log set first paint does not wait on persist. Sidecar first paint does not wait on persist. Form / Swap sheets open on click from first paint. Persist merge keeps that compose over a null rehydrate. Restoring session is never the product.

## Do not

Mint Studio. Put chat or a bell on Today. Make Today a feed. Gate `logSet`. Restyle `/private`, landing, or www. Ship a licensed display face. Use poster red except the Train pulse.
