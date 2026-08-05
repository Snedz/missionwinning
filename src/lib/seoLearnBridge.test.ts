import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  APP_GUIDE_HREF,
  PUBLIC_GUIDE_HREF,
  appGuideChapterHref,
  parseSeoLearnPathParam,
  publicGuideChapterHref,
  seoLearnPathOpenHref,
  stripSeoLearnPathFromSearch,
  SEO_LEARN_PATH_QUERY,
} from './seoLearnBridge';
import { FREE_LEARN_PATHS } from '@/data/learnPaths';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const known = FREE_LEARN_PATHS.map((p) => p.id);

test('seoLearnPathOpenHref pins /learn?path=id', () => {
  assert.equal(seoLearnPathOpenHref('strength-basics'), '/learn?path=strength-basics');
  assert.equal(seoLearnPathOpenHref(''), '/learn');
  assert.match(seoLearnPathOpenHref('x'), new RegExp(SEO_LEARN_PATH_QUERY));
});

test('parseSeoLearnPathParam validates against known free paths', () => {
  assert.equal(parseSeoLearnPathParam('?path=strength-basics', known), 'strength-basics');
  assert.equal(parseSeoLearnPathParam('?path=not-a-real-path', known), null);
  assert.equal(parseSeoLearnPathParam('?path=../x', known), null);
  assert.equal(parseSeoLearnPathParam(null, known), null);
});

test('stripSeoLearnPathFromSearch removes only path key', () => {
  assert.equal(stripSeoLearnPathFromSearch('?path=strength-basics&q=1'), '?q=1');
  assert.equal(stripSeoLearnPathFromSearch('?path=strength-basics'), '');
});

test('guide dual pads keep distinct hrefs for magazine vs app progress', () => {
  assert.equal(PUBLIC_GUIDE_HREF, '/guide');
  assert.equal(APP_GUIDE_HREF, '/learn/guide');
  assert.equal(publicGuideChapterHref('ch-01'), '/guide/ch-01');
  assert.equal(appGuideChapterHref('ch-01'), '/learn/guide/ch-01');
});

test('public path detail hands off to Learn, not only welcome', () => {
  const src = readFileSync(
    path.join(import.meta.dirname, '..', 'page-components', 'LearnPathPublicPage.tsx'),
    'utf8'
  );
  assert.match(src, /seoLearnPathOpenHref\(path\.id\)/);
  assert.match(src, /Open in Learn/);
});

test('in-app guide index links the public magazine as canonical reader', () => {
  const src = readFileSync(
    path.join(import.meta.dirname, '..', 'page-components', 'GuidebookIndexPage.tsx'),
    'utf8'
  );
  assert.match(src, /PUBLIC_GUIDE_HREF|href="\/guide"/);
  assert.match(src, /publicGuideChapterHref|Magazine/);
});
