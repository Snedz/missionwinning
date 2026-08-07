/**
 * Renumber this branch's build label past `origin/master`, and move every piece
 * of bookkeeping that is keyed to it.
 *
 * ## Why this exists
 *
 * `check-build-label.mjs` requires the branch's `APP_BUILD_LABEL` to be *past*
 * the base's. Master ships every 15–20 minutes, so any branch open longer than
 * one ship interval is guaranteed to collide — and the collision is not just the
 * number. The rotated-log filename is `LOG-rotate-<label>.md`, so it collides
 * too, and with *different content*, which is a real conflict rather than a
 * trivial one.
 *
 * That reconciliation was done by hand three times in one day (`.545`→`.548`,
 * `.562`→`.595`, `.595`→`.596`), each time under the pressure of a branch that
 * would not merge — which is exactly when bookkeeping gets skipped and hard rule
 * 5 quietly stops holding. The job is mechanical and its surface is closed, so
 * it should be a command.
 *
 * ## The closed surface
 *
 * `check-build-label.mjs` defines it: the label lives in `src/lib/buildInfo.ts`,
 * `LOG.md` must carry a heading ending in `` (`.N`) ``, and `CONTEXT.md` must
 * mention the full label. Rotation adds three more sites that carry the label in
 * their *name* rather than their text: the archive file, its heading, and the
 * link plus index row that point at it.
 *
 *   1. `src/lib/buildInfo.ts`      APP_BUILD_LABEL       (both quote styles)
 *   2. `LOG.md`                    `## … (`.N`)` heading
 *   3. `LOG.md`                    `[`.X` for `.N`](…LOG-rotate-N.md)` link
 *   4. `CONTEXT.md`                `## Now (… `…unified.N` …)` header
 *   5. `CONTEXT.md`                `- **`.N`:**` bullet
 *   6. `docs/archive/log/LOG-rotate-N.md` + its `# Rotated for .N` heading
 *   7. `docs/archive/INDEX.md`     the row naming that file
 *
 * A site that is present is rewritten; a site that is absent is reported, not
 * invented. Renumbering must never *create* bookkeeping that a ship did not do —
 * that would turn hard rule 5 into a formality this script performs on its
 * behalf.
 *
 * Usage:  npm run relabel            renumber past origin/master
 *         npm run relabel -- --dry   print what would change, touch nothing
 */

import { readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const DRY = process.argv.includes('--dry');
const LABEL_RE = /APP_BUILD_LABEL\s*=\s*['"]([^'"]+)['"]/;

const read = (p) => readFileSync(p, 'utf8');
const write = (p, s) => (DRY ? undefined : writeFileSync(p, s));

function fail(msg) {
  console.error(`\x1b[31m✗ relabel: ${msg}\x1b[0m`);
  process.exit(1);
}

function git(...args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

/** `2026.07-unified.596` → { prefix: '2026.07-unified', n: 596 } */
function parse(label) {
  const m = /^(.*)\.(\d+)$/.exec(label);
  return m ? { prefix: m[1], n: Number(m[2]) } : null;
}

const current = LABEL_RE.exec(read('src/lib/buildInfo.ts'))?.[1];
if (!current) fail('could not read APP_BUILD_LABEL from src/lib/buildInfo.ts');

const base = ['origin/master', 'master'].find((r) => git('rev-parse', '--verify', '--quiet', r));
if (!base) fail('no origin/master or master to compare against');

const baseSrc = git('show', `${base}:src/lib/buildInfo.ts`);
const baseLabel = LABEL_RE.exec(baseSrc)?.[1];
if (!baseLabel) fail(`could not read APP_BUILD_LABEL from ${base}`);

const cur = parse(current);
const bas = parse(baseLabel);
if (!cur || !bas) fail(`labels must end in .<number> — got "${current}" and "${baseLabel}"`);

if (cur.n > bas.n) {
  console.log(`✓ relabel: ${current} is already past ${base} (${baseLabel}) — nothing to do`);
  process.exit(0);
}

const next = `${bas.prefix}.${bas.n + 1}`;
const from = cur.n;
const to = bas.n + 1;
console.log(`relabel: ${current} → ${next}   (${base} at ${baseLabel})${DRY ? '   [dry run]' : ''}\n`);

/*
 * Plan first, write second — nothing touches disk until every site has been
 * resolved and the archive rename has been cleared.
 *
 * The first draft interleaved the two, and its own falsification caught it: on
 * the archive-collision path it had already rewritten the build label, the LOG
 * heading, the archive link and the CONTEXT bullet before it refused, leaving a
 * half-relabelled tree — the state this command exists to prevent someone
 * reaching by hand. A renumber is all-or-nothing or it is worse than none.
 */
const planned = [];
const missing = [];

/**
 * Pending content per file, so edits **compose** instead of racing.
 *
 * `CONTEXT.md` and `LOG.md` each carry two sites. The first version of this
 * planner resolved every edit against the on-disk original and pushed a whole
 * -file result, so applying them in order meant the second write silently
 * discarded the first — and the run still printed `✓` for both. `## Now` never
 * moved while the output claimed it had, which is the exact shape of defect this
 * repo keeps finding: a check that reports success for work it threw away.
 * Falsification caught it; `check-build-label` disagreed with the ✓ one line
 * later.
 */
const pendingByFile = new Map();

/** Resolve an edit against the accumulated content, without touching disk. */
function edit(label, file, fn) {
  if (!existsSync(file)) return missing.push(`${label} — ${file} does not exist`);
  const before = pendingByFile.get(file) ?? read(file);
  const after = fn(before);
  if (after === before) return missing.push(`${label} — no ${from} reference found in ${file}`);
  pendingByFile.set(file, after);
  planned.push({ label, file });
}

edit('build label', 'src/lib/buildInfo.ts', (s) =>
  s.replace(LABEL_RE, (m) => m.replace(current, next))
);

edit('LOG heading', 'LOG.md', (s) =>
  s.replace(new RegExp(`^(## .*)\\(\`\\.${from}\`\\)`, 'm'), `$1(\`.${to}\`)`)
);

/*
 * The **last** occurrence only, never a global replace.
 *
 * When the branch's label collides with one master already used — which is the
 * whole reason this command exists — the branch's archive link and master's are
 * textually identical: both read ``for `.594`](…LOG-rotate-594.md)``. A `g`
 * replace rewrites master's too, silently repointing a historical archive entry
 * at a file that documents a different ship. Falsification caught exactly that:
 * `LOG.md`'s line 9 carried master's `.594` link and came back as `.596`.
 *
 * A rotation link is *appended*, so the branch's is the last one in the file.
 * That is the only signal available — the two are indistinguishable by pattern —
 * so it is used deliberately and stated here rather than left implicit.
 */
edit('LOG archive link', 'LOG.md', (s) => {
  const needle = `for \`.${from}\`](docs/archive/log/LOG-rotate-${from}.md)`;
  const at = s.lastIndexOf(needle);
  if (at === -1) return s;
  return (
    s.slice(0, at) +
    `for \`.${to}\`](docs/archive/log/LOG-rotate-${to}.md)` +
    s.slice(at + needle.length)
  );
});

edit('CONTEXT header', 'CONTEXT.md', (s) =>
  s.replace(new RegExp(`(## Now \\(.*)${current.replace(/\./g, '\\.')}`), `$1${next}`)
);

edit('CONTEXT bullet', 'CONTEXT.md', (s) =>
  s.replace(new RegExp(`^- \\*\\*\`\\.${from}\`:`, 'm'), `- **\`.${to}\`:`)
);

/*
 * One row, or none — same ambiguity as the archive link above. Master's own
 * `.594` row and the branch's are textually alike, and unlike `LOG.md` there is
 * no append-order signal here, because rows are inserted rather than appended.
 * So: rewrite the single row naming this file, and if more than one names it,
 * refuse. Guessing would repoint a historical row at another ship's archive.
 */
const ownsArchive = existsSync(`docs/archive/log/LOG-rotate-${from}.md`);

/*
 * The INDEX row moves only when this branch owns the archive file it names —
 * the two are one artefact. Without that gate, a branch whose label happens to
 * equal a number master rotated for, but which rotated nothing itself, would
 * find master's single row and rewrite it: a lone match looks unambiguous
 * precisely when it is somebody else's.
 */
if (ownsArchive)
edit('archive INDEX row', 'docs/archive/INDEX.md', (s) => {
  const lines = s.split('\n');
  const hits = lines
    .map((l, i) => (l.includes(`LOG-rotate-${from}.md`) ? i : -1))
    .filter((i) => i !== -1);
  if (hits.length === 0) return s;
  if (hits.length > 1) {
    fail(
      `docs/archive/INDEX.md has ${hits.length} rows naming LOG-rotate-${from}.md (lines ` +
        `${hits.map((i) => i + 1).join(', ')}). Which one belongs to this branch cannot be read ` +
        `from the text — resolve by hand. Nothing was written.`
    );
  }
  lines[hits[0]] = lines[hits[0]]
    .split(`LOG-rotate-${from}.md`).join(`LOG-rotate-${to}.md`)
    .split(`for \`.${from}\``).join(`for \`.${to}\``);
  return lines.join('\n');
});

const oldArchive = `docs/archive/log/LOG-rotate-${from}.md`;
const newArchive = `docs/archive/log/LOG-rotate-${to}.md`;
let rename = null;
if (existsSync(oldArchive)) {
  // Checked in the plan phase, so a refusal costs nothing already written.
  if (existsSync(newArchive)) {
    fail(
      `${newArchive} already exists — master claimed that name too. Rotate a different entry, ` +
        `or resolve by hand; overwriting it would drop whatever master archived there. ` +
        `Nothing was written.`
    );
  }
  rename = {
    from: oldArchive,
    to: newArchive,
    body: read(oldArchive).replace(
      new RegExp(`^# Rotated for \\.${from}`, 'm'),
      `# Rotated for .${to}`
    ),
  };
} else {
  missing.push(`archive file — ${oldArchive} does not exist (no rotation this ship?)`);
}

/* ── apply ─────────────────────────────────────────────────────────────── */

// One write per file, carrying every edit planned against it.
for (const [file, content] of pendingByFile) write(file, content);
for (const { label } of planned) console.log(`  ✓ ${label}`);
if (rename) {
  if (!DRY) {
    writeFileSync(rename.from, rename.body);
    renameSync(rename.from, rename.to);
  }
  console.log(`  ✓ archive file → ${rename.to}`);
}

const moved = planned.length + (rename ? 1 : 0);
console.log(`\n${moved} site${moved === 1 ? '' : 's'} moved.`);
if (missing.length) {
  console.log('\nNot moved (reported, not invented):');
  for (const m of missing) console.log(`  · ${m}`);
  console.log(
    '\nA missing site is a real answer — a docs-only branch mints no label, and a ship that\n' +
      'rotated nothing has no archive file. Renumbering must not create bookkeeping the ship\n' +
      'did not do; that would make hard rule 5 something this script performs on your behalf.'
  );
}
console.log(`\nNext: npm run check-build-label${DRY ? '  (after a real run)' : ''}`);
