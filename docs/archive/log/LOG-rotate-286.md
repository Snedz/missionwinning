# Rotated for .286

## 2026-08-03 — Today/Coach anti-slop + Dependabot (`.271`)

Modernist pass on Today + Coach surfaces that still used soft borders,
shadows, and leftover gradient utility stubs: Coach today-session card is a
2px primary top rule (no `shadow-md`); trend tiles, customize panel, week
recap icons, and chat bubbles use solid 2px paper/ink rules. Bumped
`@radix-ui/react-tabs` 1.1.13→1.1.21 and `globals` 15→17.8 (Dependabot #112,
#111) on master so those PRs can close.
