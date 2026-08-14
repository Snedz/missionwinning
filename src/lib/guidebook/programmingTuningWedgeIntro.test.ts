/**
 * Ch3 Programming & Tuning + linked Periodization path: a free Diataxis intro
 * for the Train + Mission Coach wedge (logs → week, no wearable).
 *
 * Discovers the chapter and path from the catalogs — a hardcoded section list
 * would go green after a rename. Asserts the intro loop, not chrome.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { FREE_LEARN_PATHS } from '@/data/learnPaths';
import { publicGuidePracticeCta } from '@/lib/guidebook/publicGuidePracticeCta';

const root = join(import.meta.dirname, '..', '..', '..');

function chapterText(id: string): {
  chapter: (typeof BEYOND_THE_BASICS_CHAPTERS)[number];
  blob: string;
} {
  const chapter = BEYOND_THE_BASICS_CHAPTERS.find((c) => c.id === id);
  assert.ok(chapter, `missing free chapter ${id}`);
  const blob = [
    chapter.title,
    chapter.subtitle,
    ...chapter.sections.flatMap((s) => [
      s.title,
      s.summary,
      s.body,
      s.practiceCTA.label,
      s.practiceCTA.href,
    ]),
  ].join('\n');
  return { chapter, blob };
}

describe('programming-tuning wedge intro', () => {
  it('the chapter exists with enough sections that CTAs mean something', () => {
    const { chapter } = chapterText('programming-tuning');
    assert.ok(chapter.sections.length >= 3, `need >= 3 sections, have ${chapter.sections.length}`);
  });

  it('first section is a log-then-Coach tutorial, not a Builder pitch', () => {
    const { chapter, blob } = chapterText('programming-tuning');
    const first = chapter.sections[0];
    assert.equal(first.id, 'ch3-s1');
    assert.equal(first.practiceCTA.href, '/active');
    assert.match(first.body, /offline|without Wi-Fi/i);
    assert.match(first.body, /do not need a wearable|no wearable/i);
    assert.match(first.body, /Mission Coach/i);
    assert.match(first.body, /Train/i);
    assert.doesNotMatch(blob, /everything app/i);
    assert.doesNotMatch(blob, /invite-only/i);
    assert.doesNotMatch(first.body, /Super Bundle/i);
  });

  it('no section in the chapter sends practice to Builder', () => {
    const { chapter } = chapterText('programming-tuning');
    for (const section of chapter.sections) {
      assert.notEqual(
        section.practiceCTA.href,
        '/builder',
        `${section.id} still pitches Builder templates as the programming intro`
      );
      assert.match(
        section.practiceCTA.href,
        /^\/(active|coach|log)$/,
        `${section.id} practice CTA must stay on Train / Today / Coach`
      );
    }
  });

  it('Learn stays ungated in this chapter — no premium wall copy', () => {
    const { blob } = chapterText('programming-tuning');
    assert.doesNotMatch(blob, /premium|paywall|unlock this chapter/i);
  });
});

describe('periodization-design Learn path intro', () => {
  it('opens on a free Coach-from-logs lesson, not Strength Basics sb-0', () => {
    const path = FREE_LEARN_PATHS.find((p) => p.id === 'periodization-design');
    assert.ok(path, 'missing periodization-design path');
    const first = path.lessons[0];
    assert.equal(first.id, 'pd-0');
    assert.notEqual(first.id, 'sb-0', 'do not steal Strength Basics intro');
    const blob = [first.title, first.summary, ...first.keyPoints].join('\n');
    assert.match(blob, /no wearable/i);
    assert.match(blob, /log/i);
    assert.match(blob, /Mission Coach|Coach/);
    assert.equal(first.actionHref, '/coach');
    assert.equal(first.body, undefined, 'no template lesson bodies — publicDocsVoice');
  });
});

describe('public magazine CTA for Coach', () => {
  it('maps /coach to a public start, not a dead in-app route', () => {
    const cta = publicGuidePracticeCta('/coach', 'Open Mission Coach');
    assert.equal(cta.href, '/welcome');
    assert.match(cta.label, /Mission Coach/i);
    assert.notEqual(cta.label, 'Open Mission Coach');
  });
});

describe('source stays original MW wording', () => {
  it('Ch3 intro does not paste ISSA textbook tells', () => {
    const src = readFileSync(join(root, 'src/data/guidebook/chapters.ts'), 'utf8');
    const start = src.indexOf("id: 'programming-tuning'");
    const end = src.indexOf("id: 'getting-started-mw'");
    assert.ok(start >= 0 && end > start, 'programming-tuning block not found');
    const block = src.slice(start, end);
    assert.doesNotMatch(block, /ISSA/);
    assert.doesNotMatch(block, /certified personal trainer textbook/i);
  });
});
