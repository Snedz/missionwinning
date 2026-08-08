# Rotated for `.615` — entry `.600`

Rotated from LOG.md on 2026-08-08 to keep ≤15 entries.

## 2026-08-08 — The app promised offline that the build does not ship (`.600`)

**The feature stays. The tense was the defect.**

`next.config.js` disables Serwist whenever the private gate is up, so production ships **no service worker**: not installable, nothing precached, and a cold open or refresh with no network reaches the browser's error page. `CONTEXT.md` records that exactly — *"no beta tester can install the PWA or log offline"* — and **none of that honesty reached a single string**. `TodayProgressSection` offered *"Install Mission Winning for offline use anywhere (PWA)"* to every browser visitor on the daily command screen, where the button finds no `deferredPwaPrompt` and dead-ends in a toast telling the athlete to use their browser menu — which would install a shell with no offline capability at all. `BetaStartPage` said *"log from Today offline"* on **the first screen an invited tester ever sees**, and `ActiveEmptyState` said *"offline ready"* on the logger itself.

**Asked and answered before building: keep the offline PWA.** It is constitutional — `vision.md` calls the product "offline-first" and frames year one around a "free offline logger"; the UX register's P3 is *"losing a workout is not an option"*. It is fully built (Serwist, `app/sw.ts`, precached `/offline`, `cacheOnNavigation`) and **gated, not abandoned**, with the turn-on already written down in `next.config.js`, `PRODUCTION_STACK.md` L10 and `LAUNCH_RUNBOOK.md` §5. Nothing here removes it.

**The flag already existed, and using it is the whole fix.** `next.config.js` sets `NEXT_PUBLIC_PWA_ENABLED` from the *same* `pwaDisabled` expression that decides whether Serwist builds, and the SW registration already reads it. New `src/lib/offlineCapability.ts` wraps it as `isOfflineInstallable()` — one named, greppable, testable predicate instead of seven components each reaching into `process.env`, in the fail-closed shape of `isPushSupported`. Being `NEXT_PUBLIC_*` it is inlined at build time and identical on server and client, so no hydration mismatch and no async worker probe. Claims become true by themselves at the flip; nobody has to remember a copy edit.

**Two classes of string, and conflating them would have traded one dishonesty for another.** A *capability claim* ("installable", "offline anywhere") is false today. A *network-state message* is **true** today: `OnlineStatusBanner`'s "Offline — logging still works" holds with no worker at all, because the store persists to device storage and every cloud write rides the durable outbox, so an open session keeps logging through a signal drop and syncs later. An earlier draft of this change would have swept it up with the false ones. The guard now asserts it stays **ungated**, and a mutant that gates it goes red.

Where a claim is hidden the copy states the narrower truth rather than going silent — *"Lose signal mid-session and logging keeps going."* Two literal keys per site, never a ternary `defaultValue`: a computed key is invisible to the coverage counter, which is why `.596` had to split six of them.

**One latent defect closed on the way past.** `isPushSupported()` gated on `NODE_ENV !== 'production'` but not on the PWA flag, so it was one env var from being wrong: the day VAPID is set while `PRIVATE_MODE` is still on, every branch passes, the push UI renders, and `subscribePush()` awaits `navigator.serviceWorker.ready` — which never resolves, with no timeout on the await.

**Recorded for the flip, not fixed here** (a different concern, and it needs its own decision): once the worker does ship, `cacheOnNavigation` plus the `pages` / `pages-rsc` / `others` NetworkFirst buckets store **24 hours of authenticated page HTML and RSC payloads**, and there is **no `caches.delete()` anywhere in the repo** — so they survive sign-out on a shared device. That is precisely the threat model `.211`'s comment in `sw.ts` articulates; `.211` closed `/api/` and `/auth/` and stops there, which does not cover where server-rendered user state actually lives in an App Router app.

Mutants: 4 killed — decouple `NEXT_PUBLIC_PWA_ENABLED` from `pwaDisabled` → red; ungate the logger claim → red; drop the flag check from `isPushSupported` → red; **over-gate the network-state banner → red** (the opposite-direction mutant, which the first attempt failed to kill because it only added an unused import — re-run faithfully). Tests 2174 → 2183.

**Deferred, same concern, next commit:** the Fuel subtitle pair (`fuelSubtitleDepthBeta` / `Paid`, both carrying "log offline on this device"), `trackLocales:117`, `infoLocales:341` (`/vision`), and the two iOS install→notifications branches (`WindDownOptIn.tsx:62`, `DayReviewOptIn.tsx:113`). Mechanical repeats of the pattern above; split out rather than rushed in unverified.
