## 2026-08-04 — Pure Today candidate builder (`.419`)

`HomeTodayDashboard` assembled Today blocks with an inline if-ladder next to JSX — densest-evening order was untestable without mounting the shell. New [`buildTodayCandidates.ts`](src/lib/today/buildTodayCandidates.ts) emits ordered `{ key, priority, pinned? }` specs from the same mount gates; the page maps keys → nodes then calls existing `planTodayBlocks`. Budget stays 6; dashboard stays 32. Unit tests lock pins, phase masks, and session+week-on-top spill.
