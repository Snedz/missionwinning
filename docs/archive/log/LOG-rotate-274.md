# Rotated for .274

## 2026-08-02 — The palette a checker could not see (`.258`)

`.131` re-inked the app to paper / ink / one red. `.137` re-inked the guidebook
**cover** and rebuilt the PDF. The six chapter heroes were in neither pass, and
nothing in this repo could have said so: `check-design-system.mjs` reads source,
and a palette baked into a `.webp` is invisible to it.

```
/learn/human-performance-hero.webp      ink  86%   brand   0%
/learn/movement-mechanics-hero.webp     ink  97%   brand   0%
/learn/programming-tuning-hero.webp     ink  89%   brand   0%
/learn/getting-started-mw-hero.webp     ink  92%   brand   0%
/learn/nutrition-recovery-hero.webp     ink  84%   brand   0%
/learn/assessments-progress-hero.webp   ink  90%   brand   0%
```

Near-black with teal accents, on paper-ground chapter pages, for eleven builds.

It was found by eye during the `.234` baseline review and written into a LOG
entry — which is precisely the form this repo has learned not to trust. The
`opacity` rule in `WeekStrip.tsx` was also correct, also written down, and also
protected only the file it was in; `.236` paid for that three files away.

### The general version of this check did not survive its own numbers

The first draft measured every image in `public/`. It reported fifteen
candidates, and two of them ended the idea:

```
public/pwa-512x512.png                     ink 85%   brand 0%
public/learn/movement-mechanics-hero.webp  ink 97%   brand 0%
```

**No threshold separates those.** The icon is *supposed* to be a dark tile; the
hero is *supposed* to sit inside a paper page. The difference is where the asset
is used, which a pixel histogram cannot see — so a repo-wide rule would have
been an exemption list doing all the work, which is `.220`'s defect wearing a
new hat. Deleted rather than shipped.

What replaced it is narrow and has a concrete justification: these six render
inside `/guide/<chapter>`, whose ground is `--background` (#f3f2f2). Nearly
black there is wrong, and *that* is checkable. The set is discovered from
`src/data/guidebook/chapters.ts` rather than listed, so a seventh chapter is
covered the day it is written.

### Chroma, not saturation

The first measurement disagreed with itself between runs and filed dark navy
under "cool". HSL saturation is the wrong discriminator: a pixel of `(0,0,20)`
is *fully saturated blue* at 4% lightness. `(max-min)/255` asks the question
that actually matters — is there visible colour here at all — and the numbers
became stable and reproducible.

Worth recording because a guard built on a measurement its author does not trust
is the same defect as no guard, and I nearly shipped one.

### It ships as a ratchet

Green with the debt unlisted would be `.200`'s check that cannot fail. Red on
arrival would be a gate nobody can make green, which is how a gate gets switched
off. So the six are declared in `KNOWN_OFF_PALETTE`, anything new fails, and an
entry that *starts passing* must be deleted — a stale entry quietly re-permits
the thing it documents.

The first run printed `✓ 6 guidebook heroes in palette`. That was false: six of
six are off-palette and merely declared. `.208` — a number stated more
confidently than it can be supported — corrected to name the debt on every run.

### Two mutants that did not mutate

Both survived the first run, and neither was a gap in the guard:

- `mutantSrc: '/learn/mutant-hero.webp'` does not match the discovery regex
  `src:\s*'(\/learn\/[^']+)'` — capital `S`. It added no hero at all.
- Loosening `MAX_INK_PCT` alone leaves `MIN_BRAND_PCT` firing at 0% brand, so
  the declared six stayed off-palette and the ratchet had nothing to report.

A mutant that does not mutate is a green run that proves nothing — the same
shape as the vacuous assertions this programme keeps finding, arriving through
the tooling meant to catch them. Rebuilt properly, both kill: a seventh
undeclared chapter fails, and loosening *both* thresholds trips the
staleness rule because the declared entries start passing.

### The re-ink is blocked, not done

Replacement art generates, but the bytes cannot reach this repo: the session's
egress policy denies the image CDN.

```
connect_rejected — gateway answered 403 to CONNECT
host: d8j0ntlcm91z4.cloudfront.net:443
```

`/root/.ccr/README.md` is explicit that a 403 is an organisation policy denial to
be reported rather than retried or routed around, so that is what this does. The
founder can download the art, or the host can be allowed; either way the ratchet
above is what stops the six becoming seven in the meantime.
