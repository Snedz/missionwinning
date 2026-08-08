import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { cardCosmetics } from './cardCosmetics';
import { INK, MUTED, POSTER, RED_700, SHARE_CARD_HEIGHT, SHARE_CARD_WIDTH } from './shareCard';

/**
 * A canvas stand-in that records the calls a painter makes.
 *
 * The painters are pure drawing instructions, so what they *do* is the sequence
 * of ops — asserting on that is testing behavior, not a getter.
 */
interface Op {
  op: string;
  args: unknown[];
}
function recordingCtx(): { ctx: CanvasRenderingContext2D; ops: Op[] } {
  const ops: Op[] = [];
  const record =
    (op: string) =>
    (...args: unknown[]) => {
      ops.push({ op, args });
    };
  const target: Record<string, unknown> = {
    save: record('save'),
    restore: record('restore'),
    beginPath: record('beginPath'),
    moveTo: record('moveTo'),
    lineTo: record('lineTo'),
    stroke: record('stroke'),
    fillRect: record('fillRect'),
    strokeRect: record('strokeRect'),
  };
  const ctx = new Proxy(target, {
    get: (t, k) => t[k as string],
    set: (t, k, v) => {
      ops.push({ op: `set:${String(k)}`, args: [v] });
      t[k as string] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, ops };
}

const drawOps = (ops: Op[]) =>
  ops.filter((o) => !o.op.startsWith('set:') && o.op !== 'save' && o.op !== 'restore');

test('the defaults paint nothing — paper and hairline are the absence of a layer', () => {
  const { ctx, ops } = recordingCtx();
  const c = cardCosmetics('hairline', 'paper');
  c.paintBackdrop(ctx);
  c.paintFrame(ctx);
  assert.deepEqual(ops, [], 'the default card must be byte-identical to no cosmetics at all');
});

test('each earned backdrop paints, and stays inside the canvas', () => {
  for (const backdrop of ['grid', 'rule-field', 'poster-block'] as const) {
    const { ctx, ops } = recordingCtx();
    cardCosmetics('hairline', backdrop).paintBackdrop(ctx);
    const drawn = drawOps(ops);
    assert.ok(drawn.length > 0, `${backdrop} painted nothing`);
    for (const { op, args } of drawn) {
      if (op !== 'fillRect' && op !== 'moveTo' && op !== 'lineTo') continue;
      const [x, y] = args as number[];
      assert.ok(x >= 0 && x <= SHARE_CARD_WIDTH, `${backdrop} drew off-canvas at x=${x}`);
      assert.ok(y >= 0 && y <= SHARE_CARD_HEIGHT, `${backdrop} drew off-canvas at y=${y}`);
    }
  }
});

test('each earned frame paints, and only in palette', () => {
  const palette = new Set([INK, MUTED, POSTER, RED_700]);
  for (const frame of ['rule', 'double-rule', 'poster'] as const) {
    const { ctx, ops } = recordingCtx();
    cardCosmetics(frame, 'paper').paintFrame(ctx);
    assert.ok(drawOps(ops).length > 0, `${frame} painted nothing`);
    for (const { op, args } of ops) {
      if (op !== 'set:strokeStyle' && op !== 'set:fillStyle') continue;
      assert.ok(palette.has(args[0] as string), `${frame} used off-palette ${String(args[0])}`);
    }
  }
});

test('every painter balances save/restore — a leaked ctx state corrupts the next layer', () => {
  for (const frame of ['hairline', 'rule', 'double-rule', 'poster'] as const) {
    for (const backdrop of ['paper', 'grid', 'rule-field', 'poster-block'] as const) {
      const { ctx, ops } = recordingCtx();
      const c = cardCosmetics(frame, backdrop);
      c.paintBackdrop(ctx);
      c.paintFrame(ctx);
      const saves = ops.filter((o) => o.op === 'save').length;
      const restores = ops.filter((o) => o.op === 'restore').length;
      assert.equal(saves, restores, `${frame}/${backdrop} left ${saves - restores} unbalanced save()`);
    }
  }
});

test('the resolved ids ride along, so a card can be inspected without painting it', () => {
  const c = cardCosmetics('poster', 'grid');
  assert.equal(c.frame, 'poster');
  assert.equal(c.backdrop, 'grid');
});

/**
 * The bundle invariant, asserted as a dependency edge (`.611`).
 *
 * `/active` renders `WorkoutVictorySheet` → `shareCard.ts`. If `shareCard.ts`
 * ever imports this module, the whole cosmetics catalog lands back in `/active`'s
 * entry chunk — 1.1 KB gzipped on a route already over budget, buying nothing,
 * because a victory card passes no cosmetics. That regression is invisible in
 * review and only shows up in `bundle-budget`, which the gate reaches at step 16
 * and which is currently red for unrelated reasons.
 *
 * Discovered, not enumerated: every sibling under `src/lib/share/` is read and
 * checked, so a new file that pulls the catalog into the shared path fails too.
 * The allowlist is the set of files permitted to import it, and an entry that
 * stops importing is also a failure — a stale exemption is how this rots.
 */
test('nothing on the victory path imports the cosmetics catalog', () => {
  const dir = path.join(process.cwd(), 'src/lib/share');
  const MAY_IMPORT = new Set(['cardCosmetics.test.ts']);

  const seen = new Set<string>();
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.ts')) continue;
    if (entry.name === 'cardCosmetics.ts') continue;
    const src = readFileSync(path.join(dir, entry.name), 'utf8');
    /*
     * All four spellings that create the edge, because the first draft of this
     * matched only `from '…'` and a bare `import './cardCosmetics'` — a
     * side-effect import, which pulls the module in just as hard — survived the
     * mutant. Static `from`, side-effect `import`, dynamic `import(…)` and
     * `require(…)` are the complete set for this toolchain; there is no fifth way
     * to reach a module from a `.ts` file compiled by webpack here.
     */
    const imports = /(?:\bfrom|\bimport|\brequire)\s*\(?\s*['"][^'"]*cardCosmetics(?:\.[jt]s)?['"]/.test(
      src
    );
    if (imports) {
      seen.add(entry.name);
      assert.ok(
        MAY_IMPORT.has(entry.name),
        `src/lib/share/${entry.name} imports ./cardCosmetics, which puts the frame and ` +
          `backdrop catalog back into every route that renders any share card — including ` +
          `/active via WorkoutVictorySheet. Hand the painters in through ShareCardData.cosmetics ` +
          `instead (see cardCosmetics.ts).`
      );
    }
  }

  for (const allowed of MAY_IMPORT) {
    assert.ok(
      seen.has(allowed),
      `MAY_IMPORT lists ${allowed}, but it no longer imports ./cardCosmetics — drop the stale entry`
    );
  }
});
