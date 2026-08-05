import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formGuideStillUrl, resolveFormGuideMediaMode } from '@/lib/formGuideMedia';

test('image packs always still', () => {
  assert.equal(
    resolveFormGuideMediaMode({ mediaType: 'image', prefersReducedMotion: false }),
    'still'
  );
  assert.equal(
    resolveFormGuideMediaMode({ mediaType: 'image', prefersReducedMotion: true }),
    'still'
  );
});

test('video autoplays unless reduced motion', () => {
  assert.equal(
    resolveFormGuideMediaMode({ mediaType: 'video', prefersReducedMotion: false }),
    'video-autoplay'
  );
  assert.equal(
    resolveFormGuideMediaMode({ mediaType: 'video', prefersReducedMotion: true }),
    'still'
  );
});

test('still url prefers poster for video packs', () => {
  assert.equal(
    formGuideStillUrl({
      mediaType: 'video',
      url: '/form/deadlift/side.mp4',
      poster: '/form/deadlift/side.webp',
    }),
    '/form/deadlift/side.webp'
  );
  assert.equal(
    formGuideStillUrl({
      mediaType: 'image',
      url: '/form/pull-ups/side.webp',
    }),
    '/form/pull-ups/side.webp'
  );
  // No poster — fall back to media url (caller may still prefer not to show mp4 as img)
  assert.equal(
    formGuideStillUrl({
      mediaType: 'video',
      url: '/form/x/side.mp4',
    }),
    '/form/x/side.mp4'
  );
});
