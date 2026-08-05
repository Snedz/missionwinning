# Rotated for .524

## 2026-08-05 — Kaizen: Victory rewards consume-once (`.509`)

Victory XP line uses `consumeLastAwards` into state once — no peek-then-consume race under React Strict Mode remount. Source pin `victoryConsume.test.ts`.

Mutants: VictoryRewardsLine peeks then consume without prev guard → red.

