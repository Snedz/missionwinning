# Rotated from LOG.md when `.798` landed

## 2026-08-14 — CodeQL hardening: CSPRNG + host parse (`.783`)

#559 was a draft against stale master. `Math.random` minted invite,
referral, class, and teacher-PIN codes. SITE_URL "is this us?" used a
substring, so `evilmissionwinning.com` counted as ours. Workflows other
than gitleaks inherited default token scope.

**Ship:** `crypto.getRandomValues` for those generators (injectable
drawers unchanged). Hostname parse for SITE_URL in `deployReadiness` and
`check-env`. Job-level `contents: read` on CI / ratchets / deploy /
sync / apply-migration / aikido. Seed snippet escapes `</script>`.
Replay, not a merge of the conflicting draft.

Mutants: lookalike host still warned as non-www; default invite path
still called `Math.random`.

Label `.783` (onto master `.782`).

Excellence-Override: CodeQL CSPRNG + SITE_URL host parse (no visual surface)
