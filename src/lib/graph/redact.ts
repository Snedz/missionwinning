/**
 * What may never reach the graph.
 *
 * An extraction pass is an exfiltration path with a friendly name: point it at a
 * tree and it reads whatever is there, then posts it to a third party and writes
 * the result into a database that outlives the session. The thread this work came
 * from does not mention the problem at all. Two gates, because either alone fails
 * open:
 *
 *  1. **Path.** Sources are an allowlist, and every candidate is additionally
 *     checked against git's own ignore rules. Deriving from `git check-ignore`
 *     rather than a hand-typed list is the `.220` lesson — a name that claims
 *     more than its enumeration is how the enumeration goes stale. Adding a new
 *     gitignored secrets directory then denies it with no edit here.
 *  2. **Content.** Prose about a codebase should contain no credentials, but
 *     `LOG.md` is written by hand and hand-written files acquire pasted keys.
 *     Episodes are scanned before any network call.
 *
 * The allowlist half matters as much as the detector: `.env.example` and the docs
 * deliberately carry placeholders (`xai-...`, `sk_live_...`), and a gate that
 * fires on those is a gate someone switches off within a week. The placeholders
 * are already enumerated once, in `.gitleaks.toml` — that file is the single home
 * for "this looks like a secret but is not", so it is read rather than restated.
 */

export type SecretHit = {
  /** Name of the pattern that matched — never the matched text itself. */
  rule: string;
  /** 1-based line number within the episode body. */
  line: number;
};

/**
 * Credential shapes this repo actually issues or consumes.
 *
 * Deliberately closed and deliberately narrow: every entry is a prefix a real
 * provider mints, so a hit is a hit. A generic "40+ chars of base64" rule would
 * match half the archive (build labels, hashes, minified snippets) and train the
 * reader to ignore it. Provider list is from `docs/ENV.md` and `.env.example`.
 */
export const SECRET_PATTERNS: readonly { rule: string; re: RegExp }[] = [
  { rule: 'xai-key', re: /\bxai-[A-Za-z0-9]{16,}/ },
  { rule: 'anthropic-key', re: /\bsk-ant-[A-Za-z0-9_-]{16,}/ },
  { rule: 'openai-key', re: /\bsk-[A-Za-z0-9]{32,}/ },
  { rule: 'stripe-secret', re: /\bsk_(?:live|test)_[A-Za-z0-9]{16,}/ },
  { rule: 'stripe-webhook', re: /\bwhsec_[A-Za-z0-9]{16,}/ },
  { rule: 'supabase-secret', re: /\bsb_secret_[A-Za-z0-9_-]{16,}/ },
  { rule: 'github-pat', re: /\b(?:ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/ },
  { rule: 'jwt', re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { rule: 'private-key-block', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

/**
 * Pull the `regexes = [...]` allowlist out of `.gitleaks.toml`.
 *
 * A four-line parser rather than a TOML dependency: the block is a single
 * triple-quoted array and the alternative is adding a package to the production
 * tree for one build script. If the shape ever changes this returns `[]`, which
 * fails **loud** (placeholders start tripping the gate) rather than silent.
 */
export function parseGitleaksAllowRegexes(toml: string): RegExp[] {
  const block = toml.match(/^regexes\s*=\s*\[([\s\S]*?)^\]/m)?.[1];
  if (!block) return [];
  const out: RegExp[] = [];
  for (const m of block.matchAll(/'''([\s\S]*?)'''/g)) {
    const body = m[1];
    if (!body) continue;
    try {
      out.push(new RegExp(body));
    } catch {
      // A pattern gitleaks accepts that JS does not is skipped, not fatal —
      // it can only cost us a false positive, never a leak.
    }
  }
  return out;
}

/**
 * Secret-shaped strings in `text`, minus anything the allowlist forgives.
 *
 * Returns rule names and line numbers only. Logging the match would write the
 * credential into the terminal scrollback and CI logs of whoever ran the ingest,
 * which is the failure this function exists to prevent.
 */
export function findSecrets(
  text: string,
  options?: { allow?: readonly RegExp[] }
): SecretHit[] {
  const allow = options?.allow ?? [];
  const hits: SecretHit[] = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (allow.some((re) => re.test(line))) continue;
    for (const { rule, re } of SECRET_PATTERNS) {
      if (re.test(line)) hits.push({ rule, line: i + 1 });
    }
  }
  return hits;
}

/**
 * Directories that are never ingest sources even when git tracks them.
 *
 * Short by design — the gitignore check covers the secret-bearing trees
 * (`.hermes/`, `ops/`, `.gstack/`, `docs/applications/`, keystores). These are
 * the *committed* paths that are simply not development history: generated
 * assets and vendored skill data that would flood the graph with noise and cost
 * real money to extract.
 */
export const NOT_HISTORY: readonly string[] = [
  '.claude/skills/',
  'node_modules/',
  'public/',
  'media/',
  'src/i18n/packs/',
  'supabase/.branches/',
];

export function isNotHistory(path: string): boolean {
  const norm = path.replace(/^\.\//, '');
  return NOT_HISTORY.some((p) => norm === p.replace(/\/$/, '') || norm.startsWith(p));
}

/**
 * Gate one episode. `ignored` is git's answer for the source path, injected so
 * this stays pure and the caller owns the subprocess.
 */
export function admitEpisode(params: {
  source: string;
  body: string;
  ignored: boolean;
  allow?: readonly RegExp[];
}): { ok: true } | { ok: false; reason: string; hits?: SecretHit[] } {
  if (params.ignored) return { ok: false, reason: 'git-ignored path' };
  if (isNotHistory(params.source)) return { ok: false, reason: 'not development history' };
  const hits = findSecrets(params.body, { allow: params.allow });
  if (hits.length > 0) {
    return { ok: false, reason: 'secret-shaped content', hits };
  }
  return { ok: true };
}
