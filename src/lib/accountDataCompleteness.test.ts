/**
 * Every table has a deletion/export story, discovered — not enumerated.
 *
 * Parses `create table` names out of `supabase/migrations/*.sql` (comments
 * stripped first: a prose line saying "CREATE TABLE IF NOT EXISTS skips new
 * columns" fooled the first draft of this very suite) and requires each to
 * appear in exactly one of EXPORT_TABLES / EMAIL_ONLY_TABLES / EXCLUDED_TABLES.
 * A table added next month with no story turns the gate red.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  EMAIL_ONLY_TABLES,
  EXCLUDED_TABLES,
  EXPORT_TABLES,
} from '@/lib/accountDataRegistry';

function discoverTables(): Set<string> {
  const dir = path.join(process.cwd(), 'supabase', 'migrations');
  const tables = new Set<string>();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.sql')) continue;
    const sql = readFileSync(path.join(dir, file), 'utf8')
      // Strip line comments and /* */ blocks before matching.
      .replace(/--[^\n]*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of sql.matchAll(
      /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-z_]+)\s*\(/gi
    )) {
      tables.add(m[1]);
    }
  }
  return tables;
}

describe('accountDataCompleteness', () => {
  const discovered = discoverTables();
  const exported = new Set(EXPORT_TABLES.map((s) => s.table));
  const emailOnly = new Set<string>(EMAIL_ONLY_TABLES);
  const excluded = new Set(Object.keys(EXCLUDED_TABLES));

  it('discovery finds a plausible table count — the guard is not scanning nothing', () => {
    assert.ok(discovered.size >= 20, `only ${discovered.size} tables discovered`);
  });

  it('every migration table appears in exactly one registry', () => {
    for (const table of discovered) {
      const homes = [exported.has(table), emailOnly.has(table), excluded.has(table)].filter(
        Boolean
      ).length;
      assert.equal(
        homes,
        1,
        `table '${table}' is in ${homes} registries — every table needs exactly one deletion/export story (add it to EXPORT_TABLES, EMAIL_ONLY_TABLES, or EXCLUDED_TABLES with a reason)`
      );
    }
  });

  it('no registry names a table that does not exist — a stale entry is a lie', () => {
    for (const table of [...exported, ...emailOnly, ...excluded]) {
      assert.ok(discovered.has(table), `registry names '${table}' but no migration creates it`);
    }
  });

  it('every exclusion carries a real reason', () => {
    for (const [table, reason] of Object.entries(EXCLUDED_TABLES)) {
      assert.ok(reason.length > 40, `exclusion reason for '${table}' is too thin to review`);
    }
  });

  it('wearable token columns are marked for redaction', () => {
    const spec = EXPORT_TABLES.find((s) => s.table === 'wearable_connections');
    assert.ok(spec?.redact?.includes('access_token'));
    assert.ok(spec?.redact?.includes('refresh_token'));
  });

  it('legal-hold is Privacy policy, not a delete flag', () => {
    const executor = readFileSync(path.join(process.cwd(), 'src/lib/accountDataServer.ts'), 'utf8');
    assert.doesNotMatch(executor, /legal[_-]?hold/i);
    assert.match(executor, /EMAIL_ONLY_TABLES/);
    const locales = readFileSync(path.join(process.cwd(), 'src/i18n/infoLocales.ts'), 'utf8');
    assert.match(locales, /thirty \(30\) days/);
    assert.match(locales, /legal holds/);
  });

  it('the executor exports email-keyed tables — access matches delete', () => {
    const executor = readFileSync(path.join(process.cwd(), 'src/lib/accountDataServer.ts'), 'utf8');
    assert.match(executor, /for \(const table of EMAIL_ONLY_TABLES\)/);
    assert.match(executor, /\.eq\('email', email\)/);
    assert.match(executor, /eq\('user_email', email\)/);
  });
});
