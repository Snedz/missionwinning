## 2026-08-08 — Offline honesty, the remaining surfaces (`.603`)

`.600` fixed the three surfaces a tester hits first and split the rest out rather than rush them in unverified. This is the rest — and the interesting part is what it turned out **not** to include.

**Two false claims, gated.** The iOS branches in `DayReviewOptIn` and `WindDownOptIn` offer *"add to home screen and an evening review can find you here"* / *"Add to Home Screen first"* as the stated prerequisite for notifications. That is false twice over while the worker is gated: there is nothing installable, and an installed shell would still have no service worker to subscribe through — so satisfying the stated prerequisite changes nothing. Both now key on `isOfflineInstallable()`, the same flag the SW registration uses.

**Three claims reworded rather than gated.** Fuel's subtitle pair and Track's log hint said "log offline on this device" / "manual entry works offline anywhere"; About's footer said "PWA — works offline anywhere". These describe **data locality**, which is true with or without a worker, so a gate would have been the wrong tool *and* would have hidden a real selling point after the flip. They now say what holds permanently — meals and activities stay on this device — and need no branch at all.

**One claim I nearly gated is true, and that is the finding.** The plan listed `infoLocales.ts:341` as *"Offline-first PWA — installable"*. It is not: line 341 is `infoPrivacyCollectLi4`, the **privacy policy's** disclosure that *"the free core works offline; data stays on your device until you sign in to sync"* — a statement about `localStorage`, true regardless of the service worker. The audit that found the genuine `/vision` claim (`infoVisionCoreLi4`, line **437**) had reported it under the wrong line number, and the plan inherited that without re-checking. Gating a privacy disclosure to make the app "honest" would have been the exact inversion `.600`'s guard was built to prevent, one commit after building it. It is now a reasoned `TRUE_TODAY` row so the next sweep of the word "offline" cannot take it out, and a mutant that gates it goes red.

**`/vision` left alone, deliberately.** `infoVisionCoreLi4` really does claim "installable", but `/vision` renders the long-term constitution — `vision.md` says so in its own header — and a constitution stating design intent is not the app misreporting its current build. Recorded rather than changed; a reader who wants the present tense is on `/about`, which was reworded.

**One surface the audit missed entirely**, found by grepping for the phrasing rather than trusting the list: `AboutPage.tsx:140`'s footer. Which is the argument for the discovery guard over an enumerated one.

Mutants: 2 killed — ungate the iOS install offer → red; gate the privacy statement → red (the opposite-direction mutant, guarding the near-miss above). Tests 2200 → 2203.
