import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { LOCALE_CHOOSER_OPEN_EVENT, openLocaleChooser } from './localeChooserEvent';

/**
 * `.770` — the request channel that replaced a sheet which opened itself. Both
 * halves matter: the name has to be the one the listener binds, and the helper
 * has to survive a server render, because the surfaces that call it (the gate
 * poster) are rendered on the server first.
 */

const originalWindow = (globalThis as { window?: unknown }).window;

afterEach(() => {
  if (originalWindow === undefined) delete (globalThis as { window?: unknown }).window;
  else (globalThis as { window?: unknown }).window = originalWindow;
});

describe('locale chooser event', () => {
  it('dispatches the event the chooser listens for', () => {
    const seen: string[] = [];
    (globalThis as { window?: unknown }).window = {
      dispatchEvent: (ev: Event) => {
        seen.push(ev.type);
        return true;
      },
    };

    openLocaleChooser();
    assert.deepEqual(seen, [LOCALE_CHOOSER_OPEN_EVENT]);
  });

  it('is a no-op on the server instead of throwing', () => {
    // The gate poster renders server-side; a bare `window` reference here would
    // take down the first paint it exists to protect.
    delete (globalThis as { window?: unknown }).window;
    assert.doesNotThrow(() => openLocaleChooser());
  });

  it('keeps the name stable, since a listener is bound to it by string', () => {
    assert.equal(LOCALE_CHOOSER_OPEN_EVENT, 'mw-open-locale-chooser');
  });
});
