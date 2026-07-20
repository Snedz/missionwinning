import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  estimateRemainingMs,
  fileMatchesAccept,
  fileTypeLabel,
  formatEta,
  formatFileSize,
} from './fileUploadUi';

describe('formatFileSize', () => {
  it('formats bytes / KB / MB', () => {
    assert.equal(formatFileSize(0), '0 B');
    assert.equal(formatFileSize(500), '500 B');
    assert.match(formatFileSize(2048), /KB/);
    assert.match(formatFileSize(3 * 1024 * 1024), /MB/);
  });
});

describe('fileTypeLabel', () => {
  it('uses MIME when present', () => {
    assert.equal(fileTypeLabel({ name: 'x.bin', type: 'image/jpeg' }), 'JPEG');
    assert.equal(fileTypeLabel({ name: 'a.json', type: 'application/json' }), 'JSON');
    assert.equal(fileTypeLabel({ name: 'a.csv', type: 'text/csv' }), 'CSV');
  });

  it('falls back to extension', () => {
    assert.equal(fileTypeLabel({ name: 'meal.PNG', type: '' }), 'PNG');
    assert.equal(fileTypeLabel({ name: 'data.json', type: '' }), 'JSON');
  });
});

describe('estimateRemainingMs', () => {
  it('returns null until enough elapsed time', () => {
    assert.equal(estimateRemainingMs(100, 1000, 1000, 1100), null);
  });

  it('estimates from throughput', () => {
    // 500 bytes in 1000ms → 0.5 B/ms; 500 left → 1000ms
    const eta = estimateRemainingMs(500, 1000, 0, 1000);
    assert.equal(eta, 1000);
  });

  it('returns 0 when complete', () => {
    assert.equal(estimateRemainingMs(1000, 1000, 0, 5000), 0);
  });
});

describe('formatEta', () => {
  it('formats seconds', () => {
    assert.equal(formatEta(null), '');
    assert.equal(formatEta(0), 'Done');
    assert.equal(formatEta(2500), '~3s left');
  });
});

describe('fileMatchesAccept', () => {
  it('matches image/* and extensions', () => {
    assert.equal(fileMatchesAccept({ name: 'a.jpg', type: 'image/jpeg' }, 'image/*'), true);
    assert.equal(fileMatchesAccept({ name: 'a.jpg', type: 'image/jpeg' }, '.json'), false);
    assert.equal(
      fileMatchesAccept({ name: 'b.json', type: 'application/json' }, 'application/json,.json'),
      true
    );
  });
});
