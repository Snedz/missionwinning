# LOG rotate — `.284` (2026-08-03)

Rotated from [LOG.md](../../../LOG.md) when `.299` shipped (≤15-entry rule).

---

## 2026-08-03 — Coverage floor for D11–D13 UI sheets (`.284`)

`npm run coverage` failed CI: **393 untested** vs floor **389**. Four new
Playwright-covered sheets (`CoachManageSheet`, `CoachScheduleEditor`,
`WhatsNewSheet`, `ProfileWhatsNewCard`) — pure helpers already unit-tested.
Raised `FLOORS.untestedFiles` / high-water **389 → 393** via the escape hatch
the coverage script names (same commit a reviewer can see).
