# Rotated for `.270`

## 2026-08-01 — The bootstrap the visual gate could not run (`.254`)

The visual suite has four cases and **zero committed baselines**.
`home-reduced.png` never had one at all, so `/` — the most-linked page in the
product — has been silently self-approving on every run since the case was
written. The other three were deleted in `.221` for depicting the pre-Modernist
navy/emerald design.

`.200` had already fixed the worse half. The job used to run
`--update-snapshots || true` and then re-run against the files it had just
written, so it was green every time over nothing. It now fails loudly with
instructions instead.

**The instructions named a command nobody could run.**

    Bootstrap them deliberately, on a Linux runner:
      npx playwright test --config=playwright.config.ts --grep @visual --update-snapshots

This job is the only Linux/Chromium environment the project has. Baselines
generated anywhere else differ by font hinting and antialiasing alone, which is
exactly how a pixel comparison stops meaning anything. So the loud failure was
correct **and terminal**: the only way out of it was a command that could not be
executed, and the suite has had no baselines since.

### An input, not a flag

`bootstrap_baselines` is a named `workflow_dispatch` input, **defaulting false**,
that generates instead of checking. Deliberately not a shell flag and not an
auto-fallback:

- the normal path stays a loud failure;
- the weekly schedule supplies no inputs, so it can never reach the generate —
  a scheduled run that regenerates its own baselines is `.200`'s check that
  cannot fail, rebuilt;
- bootstrapping stays something a person decides to do.

The generate **asserts nothing**, on purpose. It writes the PNGs, the existing
`always()` upload carries them off the runner, and the real gate is a human
opening every file. `.221` deleted the old baselines rather than refresh them
precisely because *"the obvious response to four huge visual diffs is
`--update-snapshots` without looking, which launders whatever the app happens to
render that day into the new truth."* A pass/fail on freshly written files would
be that laundering with a green tick on it.

### The guard, narrowed rather than weakened

`ciTruth`'s *"the visual job fails when it has no baselines"* forbade
`--update-snapshots` anywhere in the step, and this change trips it.

The rule was blunter than its own reasoning. What made the old behaviour a
defect was never the flag — it was that the **default path** wrote its own
baselines and then re-read them. The rule is now about reachability: a generate
may exist, but only behind an explicit default-false input, and it must not
assert.

Six mutants, all killed: the generate moved onto the default path; the input
defaulting `true`; the generate asserting instead of exiting 0; `exit 1`
softened to `exit 0`; the exit code swallowed with `|| true`; and the input
renamed away while the generate stays.

### Near-miss, third of its kind

The block-extraction regex ended on `\n\s*fi` — which matched the `fi` inside
`find` on the next line. The guard read one line of the block it was judging and
failed on a fragment. That is the third time in this programme a lazy quantifier
has stopped somewhere plausible and wrong, after `.221`'s `border-radius: 0` and
`.223`'s `prLine: null`. Anchored to `\n\s*fi\n`.

### Three baselines, not four

`/bundle` self-skips while FREE_BETA redirects it to `/log`, refusing to
snapshot a page under the wrong name. It resumes automatically the day Bundle
ships. So this produces `guide-human-performance`, `exercise-squats` and
`home-reduced`.

### The review found something, which is the point

The three pages were rendered and **looked at**, against the Modernist rules:
paper ground, one red, radius 0, Archivo, no navy or emerald, and each image
actually the page its filename claims.

`exercise-squats` and `home-reduced` pass. Paper `#f3f2f2`, poster red on the
CTAs, square corners, Archivo throughout. The homepage's grey photo blocks are
`GrayscalePhoto`'s deliberate no-`base` state ("PHONE ON A BENCH, MID-SET"), not
missing assets.

**`guide-human-performance` does not.** Its chapter hero is a near-black render
with a teal/emerald glow — a silhouette against a green ring — which is the
navy/emerald palette `.131` retired, sitting on a paper page. Measured across
the whole set rather than judged from one image:

| Chapter hero | dark | green/teal | red |
|---|---|---|---|
| assessments-progress | 96% | 5% | 0% |
| getting-started-mw | 89% | 0% | 1% |
| human-performance | 89% | 6% | 0% |
| movement-mechanics | 99% | 1% | 0% |
| nutrition-recovery | 98% | 3% | 0% |
| programming-tuning | 97% | 4% | 0% |

All six, 89–99% dark, essentially zero red. `.137` re-inked the guidebook
**cover** and rebuilt the PDF; the six chapter heroes were not in that pass, and
nothing could have said so — `check-design-system` reads source, and these are
`.webp` files in `public/`. A palette rule that scans code cannot see a palette
baked into an asset. That is `.221`'s finding one layer out.

So `guide-human-performance.png` **is not a baseline to commit**. The image is
not wrong about what the page renders; it is wrong to enshrine, because the
approved truth would then be the off-brand state, and the PR that re-inks those
heroes would read as a regression. That is the laundering `.221` deleted the old
baselines to avoid. Recorded as its own item.

### Blocked, and named

Committing the CI-generated PNGs needs the `visual-diffs` artifact, and this
session's token cannot read Actions (`403 Resource not accessible by
integration` on the run endpoint, so also on artifacts). The images reviewed
above were rendered locally at the same viewport and `reducedMotion: 'reduce'`
— which answers every question in the review list, since all of them are about
design and content — but they are **not** committable baselines: local font
hinting and antialiasing differ from the runner, which is the entire reason the
suite requires CI-generated files.

The mechanism ships here and the run is dispatched. Downloading the artifact and
committing the two good baselines is founder-owned until this session has
Actions read access.
