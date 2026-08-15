/**
 * Strict front-matter for graph nodes.
 *
 * The graph is markdown so a human can read it and `git diff` it, but a guard
 * that greps prose is a guard keyed to one spelling (`.220`). So every node
 * carries a fenced header that parses into a **shape**, and everything the
 * validator asserts is asserted against that shape rather than against text.
 *
 * This is a deliberate ~2-level subset of YAML, not YAML. Three reasons:
 *
 * 1. There is no YAML dependency in this repo and adding one to read six dozen
 *    small files is a dependency-advisory surface bought for nothing.
 * 2. A permissive parser is the wrong tool here. Real YAML would silently
 *    accept a node whose `primitives` block was mis-indented by one space and
 *    hand back a string where the validator expected a map — a green parse over
 *    a node nobody can check. Everything below **throws** instead.
 * 3. The grammar being small is the point: it is the whole reason a mechanic
 *    cannot be recorded as prose. See `schema.ts`.
 *
 * Grammar, in full:
 *
 * ```
 * ---
 * key: scalar
 * key:
 *   sub: scalar          # map
 * key:
 *   - scalar             # list of scalars
 * key:
 *   - sub: scalar        # list of maps; continuation lines are indented 4
 *     sub2: scalar
 * ---
 * ```
 *
 * Rejected on sight: tabs, duplicate keys, odd indentation, a value that is
 * neither scalar nor a block, and a block whose rows disagree about their kind.
 */

export type Scalar = string;
export type NodeValue = Scalar | Scalar[] | Record<string, Scalar> | Record<string, Scalar>[];
export type FrontMatter = Record<string, NodeValue>;

export class FrontMatterError extends Error {
  constructor(file: string, line: number, message: string) {
    super(`${file}:${line} — ${message}`);
    this.name = 'FrontMatterError';
  }
}

const FENCE = '---';

/** Split the fenced header off the body. Both are returned; neither may be empty. */
export function splitFrontMatter(src: string, file: string): { header: string; body: string } {
  const lines = src.split('\n');
  if (lines[0]?.trimEnd() !== FENCE) {
    throw new FrontMatterError(file, 1, `a node must open with \`${FENCE}\` on line 1`);
  }
  const close = lines.findIndex((l, i) => i > 0 && l.trimEnd() === FENCE);
  if (close === -1) {
    throw new FrontMatterError(file, lines.length, `front matter is never closed with \`${FENCE}\``);
  }
  const body = lines.slice(close + 1).join('\n');
  if (body.trim().length === 0) {
    throw new FrontMatterError(
      file,
      close + 1,
      'a node with no prose body is a row in a spreadsheet, not a node — say why it is here'
    );
  }
  return { header: lines.slice(1, close).join('\n'), body };
}

/** Indentation, in spaces. Tabs are a parse error, not a width question. */
function indentOf(raw: string, file: string, lineNo: number): number {
  if (raw.includes('\t')) {
    throw new FrontMatterError(file, lineNo, 'tabs are not indentation here — use spaces');
  }
  return raw.length - raw.trimStart().length;
}

function splitPair(text: string, file: string, lineNo: number): { key: string; value: string } {
  const at = text.indexOf(':');
  if (at === -1) throw new FrontMatterError(file, lineNo, `expected \`key: value\`, got \`${text}\``);
  const key = text.slice(0, at).trim();
  if (key.length === 0) throw new FrontMatterError(file, lineNo, 'empty key');
  return { key, value: text.slice(at + 1).trim() };
}

/**
 * Parse a node's front matter into a shape.
 *
 * Comments (`#` at the start of a trimmed line) and blank lines are skipped;
 * a `#` inside a value is data, because URLs and prose both contain them.
 */
export function parseFrontMatter(src: string, file: string): FrontMatter {
  const { header } = splitFrontMatter(src, file);
  const out: FrontMatter = {};
  const rows = header.split('\n');

  const seen = (key: string, lineNo: number) => {
    if (Object.prototype.hasOwnProperty.call(out, key)) {
      throw new FrontMatterError(file, lineNo, `duplicate key \`${key}\``);
    }
  };

  let i = 0;
  while (i < rows.length) {
    const raw = rows[i];
    const lineNo = i + 2; // +1 for the opening fence, +1 for 1-indexing
    const trimmed = raw.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      i += 1;
      continue;
    }
    if (indentOf(raw, file, lineNo) !== 0) {
      throw new FrontMatterError(file, lineNo, 'a top-level key may not be indented');
    }

    const { key, value } = splitPair(trimmed, file, lineNo);
    seen(key, lineNo);
    i += 1;

    if (value.length > 0) {
      out[key] = value;
      continue;
    }

    // A block: gather every following line indented by 2 or more.
    const block: { text: string; indent: number; lineNo: number }[] = [];
    while (i < rows.length) {
      const r = rows[i];
      const n = i + 2;
      const t = r.trim();
      if (t.length === 0 || t.startsWith('#')) {
        i += 1;
        continue;
      }
      const ind = indentOf(r, file, n);
      if (ind === 0) break;
      block.push({ text: t, indent: ind, lineNo: n });
      i += 1;
    }
    if (block.length === 0) {
      throw new FrontMatterError(file, lineNo, `\`${key}\` has no value and no indented block`);
    }
    out[key] = parseBlock(key, block, file);
  }

  return out;
}

type Row = { text: string; indent: number; lineNo: number };

function parseBlock(key: string, block: Row[], file: string): NodeValue {
  const first = block[0];
  const isList = first.text.startsWith('- ');

  // Every row at the block's own depth must agree about what kind of block this is.
  for (const row of block) {
    if (row.indent === first.indent && row.text.startsWith('- ') !== isList) {
      throw new FrontMatterError(
        file,
        row.lineNo,
        `\`${key}\` mixes list rows and map rows — a block is one or the other`
      );
    }
  }

  if (!isList) {
    const map: Record<string, Scalar> = {};
    for (const row of block) {
      if (row.indent !== first.indent) {
        throw new FrontMatterError(file, row.lineNo, `\`${key}\` map rows must share one indent`);
      }
      const { key: k, value: v } = splitPair(row.text, file, row.lineNo);
      if (Object.prototype.hasOwnProperty.call(map, k)) {
        throw new FrontMatterError(file, row.lineNo, `duplicate key \`${key}.${k}\``);
      }
      if (v.length === 0) {
        throw new FrontMatterError(file, row.lineNo, `\`${key}.${k}\` has no value (nesting stops here)`);
      }
      map[k] = v;
    }
    return map;
  }

  // A list. Either every entry is a bare scalar, or every entry opens a map.
  const scalars: Scalar[] = [];
  const maps: Record<string, Scalar>[] = [];
  let current: Record<string, Scalar> | null = null;

  for (const row of block) {
    if (row.text.startsWith('- ')) {
      if (row.indent !== first.indent) {
        throw new FrontMatterError(file, row.lineNo, `\`${key}\` list rows must share one indent`);
      }
      const item = row.text.slice(2).trim();
      if (item.includes(':') && !/^https?:/i.test(item)) {
        current = {};
        const { key: k, value: v } = splitPair(item, file, row.lineNo);
        if (v.length === 0) {
          throw new FrontMatterError(file, row.lineNo, `\`${key}[].${k}\` has no value`);
        }
        current[k] = v;
        maps.push(current);
      } else {
        current = null;
        scalars.push(item);
      }
      continue;
    }
    // A continuation line belongs to the map opened by the last `- `.
    if (current === null) {
      throw new FrontMatterError(
        file,
        row.lineNo,
        `\`${key}\` has an indented row that continues nothing — did a \`- \` go missing?`
      );
    }
    if (row.indent <= first.indent) {
      throw new FrontMatterError(
        file,
        row.lineNo,
        `\`${key}\` continuation rows must be indented past their \`- \``
      );
    }
    const { key: k, value: v } = splitPair(row.text, file, row.lineNo);
    if (Object.prototype.hasOwnProperty.call(current, k)) {
      throw new FrontMatterError(file, row.lineNo, `duplicate key \`${key}[].${k}\``);
    }
    if (v.length === 0) {
      throw new FrontMatterError(file, row.lineNo, `\`${key}[].${k}\` has no value`);
    }
    current[k] = v;
  }

  if (scalars.length > 0 && maps.length > 0) {
    throw new FrontMatterError(file, first.lineNo, `\`${key}\` mixes scalar entries and map entries`);
  }
  return maps.length > 0 ? maps : scalars;
}

/* ------------------------------------------------------------------ *
 * Readers. Each one states the shape it wanted, because "cannot read   *
 * property of undefined" three frames deep is not a diagnosis.         *
 * ------------------------------------------------------------------ */

export function asScalar(fm: FrontMatter, key: string, file: string): string {
  const v = fm[key];
  if (typeof v !== 'string') throw new FrontMatterError(file, 1, `\`${key}\` must be a scalar`);
  return v;
}

export function asList(fm: FrontMatter, key: string, file: string): string[] {
  const v = fm[key];
  if (!Array.isArray(v) || v.some((e) => typeof e !== 'string')) {
    throw new FrontMatterError(file, 1, `\`${key}\` must be a list of scalars`);
  }
  return v as string[];
}

export function asMap(fm: FrontMatter, key: string, file: string): Record<string, string> {
  const v = fm[key];
  if (typeof v !== 'object' || v === null || Array.isArray(v)) {
    throw new FrontMatterError(file, 1, `\`${key}\` must be a map`);
  }
  return v as Record<string, string>;
}

export function asMapList(fm: FrontMatter, key: string, file: string): Record<string, string>[] {
  const v = fm[key];
  if (!Array.isArray(v) || v.some((e) => typeof e !== 'object')) {
    throw new FrontMatterError(file, 1, `\`${key}\` must be a list of maps`);
  }
  return v as Record<string, string>[];
}
