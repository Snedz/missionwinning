# Rotated for .554

## 2026-08-05 — Security: Bearer at private gate + harden (F1) (`.539`)

Private gate accepts verified Supabase JWT from Authorization Bearer or sb-* cookies (getUser). Cron day-review/wind-down allowlisted (still CRON_SECRET). GH workflows environment:production. Service-role map + review pass docs. security:check script.

Mutants: privateGate requires PRIVATE_ALLOW_AUTH_BYPASS → red; mobile not reusing authAccessToken → red; allowlist gains /api/premium/recipes → red.

