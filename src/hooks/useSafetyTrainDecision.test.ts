/**
 * The safety hook is what coverage must load. First paint stays clear so SSR
 * matches; the layout effect is what reads the device flag.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement, type ReactNode } from 'react';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { __resetForTests, remove, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import {
  useSafePrimaryClick,
  useSafetyTrainDecision,
  useTrainCta,
} from '@/hooks/useSafetyTrainDecision';

installDocument();

type Root = { render: (node: ReactNode) => void; unmount: () => void };

async function renderInAct(node: ReactNode): Promise<Root> {
  const { createRoot } = await import('react-dom/client');
  const { act } = await import('react');
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root!: Root;
  act(() => {
    root = createRoot(container);
    root.render(node);
  });
  return root;
}

async function unmountInAct(root: Root) {
  const { act } = await import('react');
  act(() => {
    root.unmount();
  });
}

function routerValue(pushes: string[]) {
  return {
    back() {},
    forward() {},
    refresh() {},
    prefetch() {},
    replace() {},
    push(href: string) {
      pushes.push(href);
    },
  };
}

test('first paint stays clear, then the layout effect withholds for pregnancy', async () => {
  __resetForTests();
  writeRaw(STORAGE_KEYS.pregnancyFlag, 'pregnant');
  const modes: string[] = [];
  function Probe() {
    const decision = useSafetyTrainDecision();
    modes.push(decision.mode);
    return null;
  }
  const root = await renderInAct(createElement(Probe));
  assert.equal(modes[0], 'clear');
  assert.equal(modes.at(-1), 'withhold');
  await unmountInAct(root);
  remove(STORAGE_KEYS.pregnancyFlag);
});

test('a recommendation CTA withholds; the logger CTA still logs the set', async () => {
  __resetForTests();
  writeRaw(STORAGE_KEYS.pregnancyFlag, 'pregnant');
  const seen: Array<{ starts: boolean; label: string; href: string | null }> = [];
  function Probe({ logger }: { logger?: boolean }) {
    const { cta } = useTrainCta(
      { labelKey: 'todayStartCta', defaultLabel: 'Start' },
      null,
      { logger }
    );
    seen.push({ starts: cta.startsWorkout, label: cta.defaultLabel, href: cta.href });
    return null;
  }
  const recommend = await renderInAct(createElement(Probe));
  assert.equal(seen[0].starts, true);
  assert.equal(seen[0].label, 'Start');
  assert.equal(seen.at(-1)?.starts, false);
  assert.equal(seen.at(-1)?.label, 'Try recovery flow');
  assert.equal(seen.at(-1)?.href, '/move');
  await unmountInAct(recommend);

  seen.length = 0;
  const logger = await renderInAct(createElement(Probe, { logger: true }));
  assert.equal(seen.at(-1)?.starts, true);
  assert.equal(seen.at(-1)?.label, 'Log set');
  assert.equal(seen.at(-1)?.href, null);
  await unmountInAct(logger);
  remove(STORAGE_KEYS.pregnancyFlag);
});

test('an open workout still starts; a withhold click goes to Move', async () => {
  __resetForTests();
  writeRaw(STORAGE_KEYS.pregnancyFlag, 'pregnant');
  const pushes: string[] = [];
  const calls: string[] = [];
  const clicks: Array<() => void> = [];
  function Probe({ active }: { active: boolean }) {
    const { onClick } = useSafePrimaryClick(() => {
      calls.push(active ? 'resume' : 'start');
    }, active);
    clicks.push(onClick);
    return null;
  }
  const tree = (active: boolean) =>
    createElement(
      AppRouterContext.Provider,
      { value: routerValue(pushes) as never },
      createElement(Probe, { active })
    );

  const held = await renderInAct(tree(false));
  clicks.at(-1)!();
  assert.deepEqual(calls, []);
  assert.deepEqual(pushes, ['/move']);
  await unmountInAct(held);

  calls.length = 0;
  pushes.length = 0;
  clicks.length = 0;
  const live = await renderInAct(tree(true));
  clicks.at(-1)!();
  assert.deepEqual(calls, ['resume']);
  assert.deepEqual(pushes, []);
  await unmountInAct(live);

  remove(STORAGE_KEYS.pregnancyFlag);
  calls.length = 0;
  pushes.length = 0;
  clicks.length = 0;
  const clear = await renderInAct(tree(false));
  clicks.at(-1)!();
  assert.deepEqual(calls, ['start']);
  assert.deepEqual(pushes, []);
  await unmountInAct(clear);
});

function installDocument() {
  if (typeof document !== 'undefined') return;
  const g = globalThis as unknown as Record<string, unknown>;
  class HTMLElement {}
  class Element {}
  class Node {}
  class HTMLIFrameElement {}
  g.HTMLElement = HTMLElement;
  g.Element = Element;
  g.Node = Node;
  g.HTMLIFrameElement = HTMLIFrameElement;
  g.window = globalThis;
  const make = (tag: string) => {
    const node = {
      nodeType: 1,
      nodeName: tag.toUpperCase(),
      tagName: tag.toUpperCase(),
      ownerDocument: null as Document | null,
      parentNode: null as unknown,
      childNodes: [] as unknown[],
      style: {},
      namespaceURI: 'http://www.w3.org/1999/xhtml',
      textContent: '',
      setAttribute() {},
      getAttribute() {
        return null;
      },
      removeAttribute() {},
      hasAttribute() {
        return false;
      },
      appendChild(child: { parentNode: unknown }) {
        node.childNodes.push(child);
        child.parentNode = node;
        return child;
      },
      removeChild(child: unknown) {
        node.childNodes = node.childNodes.filter((item) => item !== child);
        return child;
      },
      insertBefore(child: { parentNode: unknown }) {
        return node.appendChild(child);
      },
      addEventListener() {},
      removeEventListener() {},
      contains() {
        return false;
      },
      focus() {},
      blur() {},
      compareDocumentPosition() {
        return 0;
      },
    };
    return node;
  };
  const doc = {
    nodeType: 9,
    documentElement: null as ReturnType<typeof make> | null,
    body: null as ReturnType<typeof make> | null,
    head: null as ReturnType<typeof make> | null,
    activeElement: null,
    defaultView: g,
    createElement(tag: string) {
      const node = make(tag);
      node.ownerDocument = doc as unknown as Document;
      return node;
    },
    createElementNS(_ns: string, tag: string) {
      return doc.createElement(tag);
    },
    createTextNode(text: string) {
      return { nodeType: 3, textContent: text, parentNode: null, nodeName: '#text' };
    },
    createComment() {
      return { nodeType: 8, textContent: '', nodeName: '#comment' };
    },
    addEventListener() {},
    removeEventListener() {},
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    getElementById() {
      return null;
    },
  };
  doc.documentElement = doc.createElement('html');
  doc.body = doc.createElement('body');
  doc.head = doc.createElement('head');
  g.document = doc as unknown as Document;
  (g as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

  const map = new Map<string, string>();
  const storage = {
    getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    clear: () => map.clear(),
    key: (index: number) => [...map.keys()][index] ?? null,
    get length() {
      return map.size;
    },
  };
  Object.defineProperty(g, 'localStorage', { configurable: true, value: storage });
}
