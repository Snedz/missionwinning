## 2026-10-16 — Forge landing (`.1159`)

The cookie homepage is the old marketing page again, laid out to the forge sheet: the sheet’s palette and type scale, grain and scan lines, a full-bleed Ken Burns reel with a progress bar, a marquee on the hero, notch program cards, 580px flip cards, a drag carousel with rubber-band easing, a 60px booking frame around the logger, a sticky bar, and an outlined WINNING wordmark. The stat band is static product facts (exercise floor, 3 minutes, zero wearables, $0), not a counting animation. The cards are Mission Coach’s real behaviour and the Earn It Back terms ($99/yr, $50 after 24 counted workouts in 90 days, $40 more after 96 in a year, max $90, 14-day refund, link to `/refunds`). CTAs are Start logging free (`/log`) and Join $99/yr. No invented coaches, certifications, member stories, addresses, or phone numbers. Scoped to `landingForge.module.css` so house.css stays the door. `/forge-preview` renders the same page for Preview and local, and 404s in production. The private gate, proxy, and `/` control flow are unchanged. PRIVATE_MODE stays.

Label `2026.07-unified.1159`.

Rotated LOG → [docs/archive/log/LOG-rotate-1144-for-1159.md](docs/archive/log/LOG-rotate-1144-for-1159.md) (`.1144`). `.1145` is the live floor.
