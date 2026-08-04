# Rotated from LOG.md for .415

## 2026-08-04 — Drop stale opacity exemptions (`.400`)

Soft-chrome Loops 29–32 removed bare `opacity-*` from Dialog close, Select chevron, and FileUploadRow queued bar — but left those three paths in `NOT_TEXT` in [`stateOpacityContrast.test.ts`](src/lib/stateOpacityContrast.test.ts). The staleness test failed CI (`build-and-test` on PR #234): *"these no longer use bare opacity — remove their exemptions"*. Dropped the three allowlist rows. Mutant: re-add `FileUploadRow` → red. Tests 5/5 green on the file.
