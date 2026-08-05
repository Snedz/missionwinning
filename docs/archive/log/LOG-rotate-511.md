# Rotated for .511

## 2026-08-05 — SEO exercise → Train bridge (`.495`)

Flow-2: public `/exercises/[id]` primary CTA is **Log this free** → `/active?exercise=<id>` (not bare `/welcome`). Pure `seoExerciseBridge` + Active consume after hydrate: start single-lift session if no logged work; append if session already has work; strip query so refresh cannot re-fire. Pins Library freestyle template shape. Guard + call-site pin.

Mutants: detail CTA `href="/welcome"` primary → red; start when hasLoggedWork → shouldStart false.


