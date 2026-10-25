import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml');

const dir = dirname(fileURLToPath(import.meta.url));
const ID_RE = /^(med|preg|load|pr|si)-[a-z0-9-]+$/;
const PREFIX_MIN = { med: 4, preg: 4, load: 4, pr: 4, si: 3 };
const STRING_ASSERTS = new Set(['icontains', 'not-icontains']);
const LIST_ASSERTS = new Set(['icontains-any', 'icontains-all']);

function loadJson(name) {
  return JSON.parse(readFileSync(join(dir, name), 'utf8'));
}

test('promptfoo config points at cases.json through the echo provider', () => {
  const configText = readFileSync(join(dir, 'promptfooconfig.yaml'), 'utf8');
  const config = yaml.load(configText);
  assert.equal(config.tests, 'file://cases.json');
  assert.deepEqual(config.providers, ['echo']);
  assert.ok(Array.isArray(config.prompts));
  assert.equal(config.prompts.length, 1);
  const prompt = config.prompts[0];
  assert.equal(typeof prompt, 'string');
  const anchors = [
    '{{input}}',
    'Never diagnose',
    'does not prevent',
    'never auto-deload from the band alone',
    'Never invent a personal record',
    'Super Intelligence (SI)',
  ];
  const folded = prompt.toLowerCase();
  for (const anchor of anchors) {
    assert.ok(folded.includes(anchor.toLowerCase()), anchor);
  }
  const yamlBanned = new RegExp(
    [
      'ht' + 'tps?:',
      'open' + 'ai',
      'anthropic',
      'groq',
      'openrouter',
      'api' + '.promptfoo',
      'api' + 'Key',
    ].join('|'),
    'i',
  );
  assert.doesNotMatch(configText, yamlBanned);
});

test('cases.json has 24 offline golden cases with the required keys', () => {
  const cases = loadJson('cases.json');
  assert.ok(Array.isArray(cases));
  assert.ok(cases.length >= 20);
  assert.equal(cases.length, 24);
  const ids = new Set();
  const counts = { med: 0, preg: 0, load: 0, pr: 0, si: 0 };
  for (const row of cases) {
    assert.equal(typeof row.id, 'string');
    assert.match(row.id, ID_RE);
    assert.equal(ids.has(row.id), false, row.id);
    ids.add(row.id);
    const prefix = row.id.slice(0, row.id.indexOf('-'));
    assert.ok(Object.hasOwn(counts, prefix), prefix);
    counts[prefix] += 1;
    assert.equal(row.description, row.id);
    assert.equal(typeof row.input, 'string');
    assert.ok(row.input.length > 0);
    assert.equal(row.vars.input, row.input);
    assert.ok(Array.isArray(row.assert));
    assert.ok(row.assert.length > 0);
    for (const check of row.assert) {
      assert.equal(typeof check.type, 'string');
      if (STRING_ASSERTS.has(check.type)) {
        assert.equal(typeof check.value, 'string');
        assert.ok(check.value.length > 0);
      } else if (LIST_ASSERTS.has(check.type)) {
        assert.ok(Array.isArray(check.value));
        assert.ok(check.value.length > 0);
        for (const part of check.value) {
          assert.equal(typeof part, 'string');
          assert.ok(part.length > 0);
        }
      } else {
        assert.fail(`unexpected assert type ${check.type}`);
      }
    }
  }
  for (const [prefix, min] of Object.entries(PREFIX_MIN)) {
    assert.ok(counts[prefix] >= min, `${prefix} ${counts[prefix]} < ${min}`);
  }
});

test('cheatsheet stays one page and the harness stays offline', () => {
  const sheet = readFileSync(join(dir, 'CHEATSHEET.md'), 'utf8');
  const lines = sheet.split('\n');
  assert.ok(lines.length <= 60, `lines ${lines.length}`);
  assert.ok(sheet.length <= 4000, `chars ${sheet.length}`);
  assert.ok(sheet.includes('npx promptfoo'));
  assert.ok(sheet.includes('file://cases.json'));
  const src = readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const bannedInHarness = ['fet' + 'ch(', 'ht' + 'tp' + 's?:', 'promptfoo' + '.dev', 'api' + '.promptfoo'];
  for (const needle of bannedInHarness) {
    assert.equal(src.includes(needle), false, needle);
  }
});
