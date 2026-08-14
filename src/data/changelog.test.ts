/**
 * Public changelog stays in lockstep with the athlete stamp.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { APP_PUBLIC_VERSION } from "@/lib/buildInfo";
import {
  CHANGELOG_ENTRIES,
  formatChangelogDate,
  latestChangelogEntry,
} from "./changelog.ts";

const root = path.join(import.meta.dirname, "..", "..");

const BANNED =
  /invite-only|private beta|we're live|everything.?app|Dependabot|coverage floor|\.\d{3}\b|#\d{3}/i;

test("newest changelog version is the public semver", () => {
  const latest = latestChangelogEntry();
  assert.equal(latest.version, APP_PUBLIC_VERSION);
  assert.match(latest.version, /^\d+\.\d+\.\d+$/);
  assert.match(latest.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(latest.bullets.length >= 3);
  assert.doesNotMatch(latest.lead, BANNED);
  for (const bullet of latest.bullets) {
    assert.doesNotMatch(bullet, BANNED, bullet);
  }
});

test("CHANGELOG.md carries the same latest version", () => {
  const md = readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
  const latest = latestChangelogEntry();
  assert.match(md, new RegExp(`^## ${latest.version} — ${latest.date}`, "m"));
  assert.match(md, /LOG\.md/);
});

test("changelog dates format like the xAI list", () => {
  assert.equal(formatChangelogDate("2026-08-14"), "August 14, 2026");
});

test("entries are newest-first and unique", () => {
  const versions = CHANGELOG_ENTRIES.map((e) => e.version);
  assert.deepEqual(versions, [...new Set(versions)]);
  for (let i = 1; i < CHANGELOG_ENTRIES.length; i++) {
    const newer = CHANGELOG_ENTRIES[i - 1]!.date;
    const older = CHANGELOG_ENTRIES[i]!.date;
    assert.ok(newer >= older, `${newer} should be on or after ${older}`);
  }
});
