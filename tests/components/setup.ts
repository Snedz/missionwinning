/**
 * jsdom + react-i18next environment for component tests under node:test.
 * Import this module first in every tests/components/*.test.tsx file.
 */
import { JSDOM } from 'jsdom';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

const { window } = dom;

function copyGlobal(key: string) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    get: () => (window as unknown as Record<string, unknown>)[key],
  });
}

Object.defineProperty(globalThis, 'window', { configurable: true, value: window });
for (const key of [
  'document',
  'navigator',
  'localStorage',
  'sessionStorage',
  'location',
  'history',
  'HTMLElement',
  'HTMLInputElement',
  'HTMLButtonElement',
  'HTMLAnchorElement',
  'HTMLFormElement',
  'SVGElement',
  'Element',
  'Node',
  'Event',
  'CustomEvent',
  'MouseEvent',
  'KeyboardEvent',
  'InputEvent',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'MutationObserver',
]) {
  copyGlobal(key);
}

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }),
  });
}

// React Testing Library act() support.
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// Minimal i18next so useTranslation() resolves and t() returns defaultValue.
if (!i18next.isInitialized) {
  void i18next.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: {} } },
    interpolation: { escapeValue: false },
  });
}
