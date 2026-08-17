/**
 * Athlete launch chrome is Alpha, not Free beta.
 *
 * The mute-pay flag stays `isFreeBeta()`. GRAPH_LOOP D1 forbade renaming it.
 * The product name is Alpha 0.1.0; the offer is free tracker or Super Bundle.
 * A nav badge that still says "Free beta" is a served-language claim for a
 * program that does not exist.
 *
 * Discover the assignments. A list of locale ids would go stale the next
 * time a pack is added.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { APP_PUBLIC_STAGE } from '@/lib/buildInfo';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const NAV = 'src/i18n/navLocales.ts';
const HEADER = 'src/components/layout/AppHeader.tsx';
const KEYS = ['navOpenBeta', 'navInviteOnlyBeta'] as const;

function assigned(src: string, key: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`${key}:\\s*'([^']*)'`, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) out.push(m[1]);
  return out;
}

function walkJson(dir: string, out: string[]): void {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return;
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkJson(full, out);
    else if (name.endsWith('.json')) out.push(full);
  }
}

test('athlete launch chrome is Alpha', () => {
  assert.equal(APP_PUBLIC_STAGE, 'Alpha');
  const nav = read(NAV);
  const header = read(HEADER);

  const open = assigned(nav, 'navOpenBeta');
  const invite = assigned(nav, 'navInviteOnlyBeta');
  assert.ok(open.length > 0, `${NAV} has no navOpenBeta assignments`);
  assert.ok(invite.length > 0, `${NAV} has no navInviteOnlyBeta assignments`);
  for (const v of [...open, ...invite]) {
    assert.equal(v, 'Alpha', `${NAV} launch badge must be Alpha in every pack, got ${JSON.stringify(v)}`);
  }

  assert.match(header, /defaultValue:\s*'Alpha'/);
  assert.doesNotMatch(nav, /Free beta/);
  assert.doesNotMatch(header, /Free beta/);

  // HTTP overlays and pack JSON can restore a retired program after hydrate.
  const jsonFiles: string[] = [];
  walkJson(path.join(root, 'src/i18n/packs'), jsonFiles);
  walkJson(path.join(root, 'public/locales'), jsonFiles);
  const hits: string[] = [];
  for (const file of jsonFiles) {
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
    } catch {
      continue;
    }
    for (const key of KEYS) {
      if (key in data && data[key] !== 'Alpha') {
        hits.push(`${path.relative(root, file)} ${key}=${JSON.stringify(data[key])}`);
      }
    }
  }
  assert.deepEqual(hits, [], `overlay still serves a beta badge:\n${hits.join('\n')}`);
});
