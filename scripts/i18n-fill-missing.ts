#!/usr/bin/env npx tsx
/**
 * Fill locale pack overlays for APP_LANGS.
 *
 * Order: OpenAI (if OPENAI_API_KEY) → MyMemory → google-translate-api-x (last).
 * Sequential by default to avoid 429s.
 *
 * Usage:
 *   npm run i18n:fill
 *   npx tsx scripts/i18n-fill-missing.ts --lang=es --namespace=guidebook
 *   npx tsx scripts/i18n-fill-missing.ts --max=200
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_LANGS, type AppLang } from '../src/i18n/appLangs';
import { LOCALE_EXPORTS, buildMergedCommonStrings } from '../src/lib/exportLocales';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const packsDir = path.join(root, 'src/i18n/packs');

const args = process.argv.slice(2);
const langFilter = args.find((a) => a.startsWith('--lang='))?.split('=')[1];
const nsFilter = args.find((a) => a.startsWith('--namespace='))?.split('=')[1];
const maxPerLang = Number(args.find((a) => a.startsWith('--max='))?.split('=')[1] ?? '0') || Infinity;

const allowPath = path.join(root, 'scripts/i18n-allowlist.json');
const allow = JSON.parse(fs.readFileSync(allowPath, 'utf8')) as {
  keys?: string[];
  identicalValues?: string[];
};

function isSkipped(key: string, enVal: string): boolean {
  if (allow.keys?.includes(key)) return true;
  if (allow.identicalValues?.includes(enVal)) return true;
  if (enVal.length <= 2) return true;
  if (/^Mission Winning$/i.test(enVal)) return true;
  return false;
}

const LANG_NAMES: Record<string, string> = {
  es: 'Spanish',
  pt: 'Portuguese',
  ru: 'Russian',
  de: 'German',
  it: 'Italian',
  ko: 'Korean',
  ja: 'Japanese',
  th: 'Thai',
  vi: 'Vietnamese',
  hi: 'Hindi',
  zh: 'Simplified Chinese',
  id: 'Indonesian',
  ar: 'Arabic',
};

const MM_CODE: Record<string, string> = {
  es: 'es',
  pt: 'pt',
  ru: 'ru',
  de: 'de',
  it: 'it',
  ko: 'ko',
  ja: 'ja',
  th: 'th',
  vi: 'vi',
  hi: 'hi',
  zh: 'zh-CN',
  id: 'id',
  ar: 'ar',
};

async function translateOpenAI(texts: string[], lang: string): Promise<string[]> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('no openai');
  const model = process.env.OPENAI_TRANSLATE_MODEL || 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You translate Mission Winning fitness-app UI strings into ${LANG_NAMES[lang] || lang}. Keep brand names (Mission Winning, Mission Score, I-Day, Super Bundle), keep markdown **bold**, keep {placeholders}. Return JSON {"t":["..."]} same length/order as input "s".`,
        },
        { role: 'user', content: JSON.stringify({ s: texts }) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  const parsed = JSON.parse(data.choices[0].message.content) as { t: string[] };
  if (!Array.isArray(parsed.t) || parsed.t.length !== texts.length) {
    throw new Error('OpenAI wrong length');
  }
  return parsed.t;
}

async function translateMyMemory(text: string, lang: string): Promise<string> {
  const pair = `en|${MM_CODE[lang] || lang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 450))}&langpair=${pair}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MyMemory ${res.status}`);
  const data = (await res.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number;
  };
  if (data.responseStatus && data.responseStatus !== 200) {
    throw new Error(`MyMemory status ${data.responseStatus}`);
  }
  const out = data.responseData?.translatedText?.trim();
  if (!out) throw new Error('empty');
  // MyMemory sometimes returns "MYMEMORY WARNING..." 
  if (/^MYMEMORY/i.test(out)) throw new Error(out.slice(0, 80));
  return out;
}

async function translateOne(text: string, lang: string): Promise<string | null> {
  try {
    const out = await translateMyMemory(text, lang);
    if (out && out !== text) return out;
  } catch {
    /* fall through */
  }
  try {
    const translate = (await import('google-translate-api-x')).default;
    const r = await translate(text, { from: 'en', to: MM_CODE[lang] || lang, forceTo: true });
    const translated = Array.isArray(r) ? r[0].text : r.text;
    if (translated && translated !== text) return translated;
  } catch {
    /* rate limited or failed */
  }
  return null;
}

function loadPack(lang: AppLang): Record<string, string> {
  const p = path.join(packsDir, `${lang}.json`);
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8')) as Record<string, string>;
  } catch {
    return {};
  }
}

function savePack(lang: AppLang, pack: Record<string, string>) {
  const p = path.join(packsDir, `${lang}.json`);
  const sorted = Object.fromEntries(Object.entries(pack).sort(([a], [b]) => a.localeCompare(b)));
  const nextCount = Object.keys(sorted).length;
  if (nextCount === 0) {
    const existing = loadPack(lang);
    if (Object.keys(existing).length > 0) {
      console.warn(`  skip empty save for ${lang} (keeping ${Object.keys(existing).length} keys)`);
      return;
    }
  }
  fs.writeFileSync(p, JSON.stringify(sorted, null, 2) + '\n');
}

async function fillLang(lang: AppLang) {
  const enMerged = buildMergedCommonStrings('en');
  const pack = loadPack(lang);

  const needed: { key: string; en: string }[] = [];
  for (const [key, enVal] of Object.entries(enMerged)) {
    if (typeof enVal !== 'string') continue;
    if (isSkipped(key, enVal)) continue;
    const cur = pack[key];
    if (cur === undefined || cur === enVal) {
      needed.push({ key, en: enVal });
    }
  }

  if (nsFilter) {
    const entry = LOCALE_EXPORTS.find((e) => e.namespace === nsFilter);
    if (entry) {
      const nsKeys = new Set(Object.keys(entry.stringsFor('en')));
      const filtered = needed.filter((n) => nsKeys.has(n.key));
      needed.length = 0;
      needed.push(...filtered);
    }
  }

  const slice = needed.slice(0, maxPerLang);
  console.log(`${lang}: ${slice.length} placeholders (pack has ${Object.keys(pack).length})`);

  let added = 0;
  let failed = 0;
  for (let i = 0; i < slice.length; i++) {
    const item = slice[i];
    const translated = await translateOne(item.en, lang);
    if (translated) {
      pack[item.key] = translated;
      added++;
    } else {
      failed++;
    }
    if ((i + 1) % 25 === 0 || i === slice.length - 1) {
      savePack(lang, pack);
      console.log(`  ${i + 1}/${slice.length} (added ${added}, failed ${failed})`);
    }
    await new Promise((r) => setTimeout(r, 350));
  }
  savePack(lang, pack);
  console.log(`${lang} done: +${added}, failed ${failed}, pack=${Object.keys(pack).length}`);
}

const langs = (langFilter ? [langFilter] : APP_LANGS.filter((l) => l !== 'en')) as AppLang[];

async function main() {
  if (process.env.OPENAI_API_KEY) {
    console.log('Using OpenAI for batches when possible');
  }
  for (const lang of langs) {
    // OpenAI path: batch when key present
    if (process.env.OPENAI_API_KEY && !nsFilter) {
      await fillLangOpenAI(lang);
    } else {
      await fillLang(lang);
    }
  }
  console.log('Done. Re-run npm run i18n:parity');
}

async function fillLangOpenAI(lang: AppLang) {
  const enMerged = buildMergedCommonStrings('en');
  const pack = loadPack(lang);
  const needed: { key: string; en: string }[] = [];
  for (const [key, enVal] of Object.entries(enMerged)) {
    if (typeof enVal !== 'string') continue;
    if (isSkipped(key, enVal)) continue;
    if (pack[key] === undefined || pack[key] === enVal) needed.push({ key, en: enVal });
  }
  const slice = needed.slice(0, maxPerLang);
  console.log(`${lang} (OpenAI): ${slice.length} placeholders`);
  const BATCH = 40;
  let added = 0;
  for (let i = 0; i < slice.length; i += BATCH) {
    const batch = slice.slice(i, i + BATCH);
    try {
      const translated = await translateOpenAI(
        batch.map((b) => b.en),
        lang
      );
      for (let j = 0; j < batch.length; j++) {
        if (translated[j] && translated[j] !== batch[j].en) {
          pack[batch[j].key] = translated[j];
          added++;
        }
      }
    } catch (e) {
      console.warn('OpenAI batch failed, falling back to MyMemory for chunk:', (e as Error).message);
      for (const item of batch) {
        const t = await translateOne(item.en, lang);
        if (t) {
          pack[item.key] = t;
          added++;
        }
        await new Promise((r) => setTimeout(r, 350));
      }
    }
    savePack(lang, pack);
    console.log(`  ${Math.min(i + BATCH, slice.length)}/${slice.length} (+${added})`);
  }
  console.log(`${lang} done: pack=${Object.keys(pack).length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
