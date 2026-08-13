# GLOBAL_LOCALE_PLAN — first-visit language + country (`.737`)

**Status:** frozen 2026-08-13  
**Ship:** `2026.07-unified.737`  
**Excellence-Override:** founder-ordered global first-visit language + country; Hebrew + Cantonese first-class (RESULT unscored)

This is the plan-then-build file for this ship. It does **not** replace [docs/PLAN.md](PLAN.md) (build phases A–I).

---

## Founder amendment (locale set)

Required first-class locales — **wedge + chrome + picker + `<html lang>` / `dir`. Not optional. Not English-fallback:**

| BCP 47 | Language | Notes |
|--------|----------|--------|
| `en` | English | Default |
| `ko` | Korean | Already in `APP_LANGS` |
| `ja` | Japanese | Already in `APP_LANGS` |
| `zh-Hans` | Mandarin, Simplified | Maps to existing pack key `zh` (mainland / Singapore). Picker label: 简体中文 / Mandarin (Simplified) |
| `zh-Hant` | Mandarin, Traditional | **New resource.** Taiwan. Picker: 繁體中文 / Mandarin (Traditional) |
| `yue` | Cantonese | **New resource.** Traditional, Cantonese-flavored copy. Picker: 廣東話 / Cantonese. **Never merge into zh-Hant.** |
| `ar` | Arabic | `dir=rtl` |
| `he` | Hebrew | **New resource.** `dir=rtl`. Picker: עברית / Hebrew |

Picker must show **three Chinese rows**, never one “Chinese” row.

Optional to keep (already shipped packs): `es`, `pt` (shown as `pt-BR`), `fr`, `de`, `hi`, `id`, plus existing `ru` `it` `th` `vi`. Honest count only.

**Do not** add `zh-Hant` / `yue` / `he` to `APP_LANGS` this ship. `APP_LANGS` remains the 15-pack / `i18n:parity` / guidebook key set. New first-class tags live in `UI_LANGS` so we do not machine-translate the Super Bundle / Learn / guidebook library (founder: leave that English).

---

## What already exists (do not rebuild)

- Custom i18next (`src/i18n.ts`) + `*Locales.ts` + `packs/{lang}.json`. Not next-intl.
- 15 pack langs: `en es fr pt ru de it ko ja th vi hi zh id ar`.
- `HtmlLangSync` sets `lang` + `dir` (ar only today).
- `RegionDefaultsBoot` **silently** applies `/api/geo` language — replace with a visible chooser.
- `ProfileLanguageSwitcher` + `/guide` locale select.
- Analytics banner: Stay private / Allow — only when PostHog key set. Upgrade copy/actions; do not geo-hide.
- `/cookies` + `cookiePolicy.ts` inventory. Add first-party locale/country cookies.
- `hreflang` is **not** emitted (`seoMetadata.ts`). Honor `?hl=` and emit alternates for shipped UI langs.
- Canada / Europe / OIC / Ukraine checkout blocks are **founder-owned**. Do not invent new geo-blocks. Do not geo-block Israel or add MENA countries. Logger stays usable. Picker may show the **existing** checkout note when the selected country is already blocked.

---

## Ship

### 1. Locale model

- `APP_LANGS` — unchanged 15 (packs, parity, guidebook).
- `UI_LANGS` — picker + html: required eight + optional already-shipped langs.
- `resourceLang(tag)` — `zh-Hans`/`zh-CN` → `zh`; `zh-TW` → `zh-Hant`; `zh-HK`/`yue` → `yue` (not zh-Hant); `pt-BR` → `pt`; `he-IL` → `he`. **Never** `split('-')[0]` for `zh-Hant`.
- `htmlLangTag` / `isRtlLang` — `ar` and `he` → `dir=rtl`.
- First-class overlay (`firstClassLocales.ts`) applied after hydrate for complete wedge/chrome on `ko ja zh zh-Hant yue ar he` (and `en`).

### 2. First-visit chooser

- Compact `AdaptiveOverlay` (sheet / dialog) on marketing **and** app shell. Product stays visible. One tap Continue (or dismiss = accept preselect).
- Language list + country list, **independent** (he in US, ar in France, ja in Brazil, pt-BR in Portugal are valid).
- Pre-select from: saved cookie/storage → `?hl=` → `navigator.languages` → timezone hint → `/api/geo` (hint only, do not block paint).
- Persist: `safeStorage` + first-party cookies `mw_locale`, `mw_country` (strictly necessary, SameSite=Lax, 1y). Set `mw_lang_explicit`.
- After confirm, chooser does not reappear. Profile + footer control can change later.
- `RegionDefaultsBoot` must **not** silently change language.

### 3. Country

- ISO 3166-1 alpha-2 list **including IL**. Detect from locale region / timezone as hint only. No GPS.
- Existing `getTerritoryBlockReason` may show an honest checkout line. No new blocks.

### 4. Cookies

- Strictly necessary: locale/country preference, session, `PRIVATE_MODE` gate. No consent wall.
- Analytics/marketing: do not set until Accept. Banner: **Accept / Reject non-essential / Manage**. Remember the choice.
- If region unknown, show the banner (when PostHog could run). Honor DNT as reject. Never block the logger.
- `COOKIES.md` + inventory rows. `/privacy` already points at `/cookies` — add a counsel-review note, do not rewrite legal bodies.

### 5. HTML / SEO / RTL

- `<html lang>` + `dir` from chosen UI locale (`zh` → `zh-Hans`).
- `hreflang` + `x-default` on public marketing metadata via `?hl=`.
- Logger table: logical CSS (`text-start` / `text-end` / `border-s` / `justify-end` under `dir=rtl`). Fix remaining physical left/right on the set-log path.

### 6. Honest copy

- Landing “14 languages” → count of **UI_LANGS** (or “N languages” from the list). Never “50 languages.” Never one “Chinese” row.

---

## Out of scope

- `PRIVATE_MODE` flip. Production. Secrets / EIN / mission-ops.
- New payment geo-blocks. Discord.com. Social feed.
- Machine-translating Super Bundle / Learn / guidebook.
- Speech owning first paint.

---

## Done

- Chooser on cold load; preference survives reload.
- Required eight locales have complete wedge/chrome/picker (not EN fallback).
- `ar` and `he` are actually RTL; set-log table usable.
- Cookie banner matches classification.
- `LOCALES.md` + cookie table.
- Draft PR titled **Global first-visit language + country (more locales)**; body cites `.737`, Hebrew, Cantonese.
