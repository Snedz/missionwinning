# Horizon W excellence result

One home for founder phone sign-off. Agents never mark this `pass` for you.
Machine field: **status** only. Everything else is human notes.

- **status:** unscored
- **scored_at:**
- **scored_by:**
- **surface:** web

Criteria live in [ORCHESTRATION.md](../ORCHESTRATION.md) (Horizon W). Android Accept B is separate: [apps/android/FOUNDER_ACCEPT.md](../apps/android/FOUNDER_ACCEPT.md).

## Override (hotfixes)

While status is not `pass`, surface path ships need a commit trailer:

```
Excellence-Override: <non-empty reason>
```

Local only: `EXCELLENCE_OVERRIDE=1` (never set in CI secrets). Override does not change **status**.

## Notes (human)

### Criteria checklist (founder; not machine-parsed)

- W1 Activation:
- W2 One boss CTA:
- W3 Logger + Victory:
- W4 Coach continuity:
- C5 Phone hero ≤90s: (ORCHESTRATION criterion 5 — not agent stream W5)

### Defect list (if fail)

### Next (founder, after pass)

- Invite names / observation plan — founder owns; not eng instrumentation
