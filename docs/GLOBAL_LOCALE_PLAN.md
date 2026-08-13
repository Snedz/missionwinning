# GLOBAL_LOCALE_PLAN — first-visit language + country (`.737`)

**Status:** frozen 2026-08-13 · **amended** 2026-08-13 (fuller first-wave list) · **amended** 2026-08-13 (geo-block is the country list)  
**Ship:** `2026.07-unified.737`  
**Excellence-Override:** founder-ordered global first-visit language + country; Hebrew + Cantonese first-class; fuller picker; country picker abides existing geo-block (RESULT unscored)

This is the plan-then-build file for this ship. It does **not** replace [docs/PLAN.md](PLAN.md) (build phases A–I). Phase I4 in PLAN.md points here.

**Country / hosted-service source of truth (do not rewrite, do not invent a second list):**

- [`src/lib/legal/supportedRegions.ts`](../src/lib/legal/supportedRegions.ts)
- [`src/page-components/SupportedRegionsPage.tsx`](../src/page-components/SupportedRegionsPage.tsx)

---

## Founder amendment 3 — geo-block wins for country

Language/region work **must abide by the existing geo-block**. Do not invent a new country list and do not offer countries we do not serve.

Hard blocks (hosted signup + checkout + country picker “we serve you”), already encoded in `supportedRegions.ts`:

- Europe: EEA + UK + CH + FR + associated (`EUROPE_UNSUPPORTED_ISO2`)
- OIC 57 (`OIC_UNSUPPORTED_ISO2`) — includes ID, MY, TR, SA, AE, EG, PK, BD, NG, and the rest
- Canada (`CA`)
- Ukraine (`UA`) — commercial exclusion; **do not market as sanctions**
- CF unknown / Tor (`XX`, `T1`)

Open by founder choice (do not block): RU, BY, IL, US, JP, KR, TW, HK, CN, SG, IN, TH, VN, PH, AU, NZ, MX, BR, ZA, KE, ET, and any other ISO **not** on those lists.

**Country picker:** only ISO codes where `isHostedServiceSupportedCountry` is true. If they pick or are detected as a blocked country, show existing `TERRITORY_BLOCK_MESSAGES`. Do not let them continue into hosted signup/checkout. Do not list France, Germany, UK, Canada, Indonesia, Saudi, Turkey, Ukraine, etc. as served.

**Language ≠ country.** A person in the US may pick Arabic, French, German, Indonesian, Turkish. That is a locale preference. It does **not** mean we serve OIC or Europe. Never “Available in Saudi Arabia” or “Launching in France.”

Detected blocked country: geo-block wins for hosted service even if they picked Hebrew or Korean. Free logger stays usable.

Honest copy: global product with commercial exclusions — not “available everywhere.”

---

## Founder amendment 2 — fuller first-wave picker

`ko / ja / zh-Hans / zh-Hant / yue / ar / he` were **examples, not the cap**. Do not shrink the language set.

**Every row below appears in the first-visit language picker** with native endonym + English name. Siblings are never merged.

| Region | BCP 47 |
|--------|--------|
| Default | `en` |
| East Asia | `ko` `ja` `zh-Hans` `zh-Hant` `yue` (Cantonese — own row, never silent-merge into zh-Hant) |
| SE Asia | `th` `vi` `id` `ms` `fil` |
| South Asia | `hi` `bn` `ta` `te` `ur` (ur is RTL) |
| West / Central Asia | `ar` (RTL) `he` (RTL) `fa` (RTL) `tr` |
| Europe | `es` `pt-BR` `pt-PT` `fr` `de` `it` `nl` `pl` `uk` `ru` `cs` `ro` `el` `sv` `da` `nb` `fi` `hu` |
| Africa | `sw` `am` |
| Americas | covered by `es` / `pt-BR` / `en` |

**40 language-picker rows.** Honest copy may say 40 languages — never “50” unless 50 complete wedge locales actually ship. Language count is not a served-country count.

Wedge + chrome + picker + legal chrome + `<html lang>` / `dir` are **complete (not English-fallback)** for served-market languages first: `en ja ko zh-Hans zh-Hant yue he es pt-BR hi bn ta te th vi fil ru` (plus `sw` / `am` — KE / ET are served). Diaspora locales (`ar fa ur id ms tr de fr …`) stay in the **language** picker as preferences, labeled as language not as a served market. English-fallback is allowed **only** for Super Bundle / Learn / guidebook body. [LOCALES.md](LOCALES.md) says so honestly.

`APP_LANGS` stays the 15 pack / `i18n:parity` / guidebook key set. Picker tags live in `UI_LANGS`. Pack aliases: `zh-Hans` → pack `zh`; `pt-BR` → pack `pt`. `pt-PT` is its own overlay (not Brazilian). `zh-Hant` / `yue` start from English + overlay (not from `zh`).

RTL: `ar` `he` `fa` `ur` set `<html dir="rtl">` and use logical CSS. Logger table must stay usable.

---

## What already exists (do not rebuild)

- Custom i18next (`src/i18n.ts`) + `*Locales.ts` + `packs/{lang}.json`. Not next-intl.
- 15 pack langs: `en es fr pt ru de it ko ja th vi hi zh id ar`.
- `HtmlLangSync` sets `lang` + `dir`.
- `RegionDefaultsBoot` **silently** applies `/api/geo` language — replace with a visible chooser. Geo country remains a **hint**; it must not silently change language.
- `ProfileLanguageSwitcher` + `/guide` locale select (guide stays pack langs).
- Analytics banner: Stay private / Allow. Upgrade to Accept / Reject non-essential / Manage; do not geo-hide.
- `/cookies` + `cookiePolicy.ts`. Add first-party locale/country cookies.
- `hreflang` is **not** emitted. Honor `?hl=` and emit alternates for `UI_LANGS`.
- Canada / Europe / OIC / Ukraine checkout blocks are **founder-owned** in `supportedRegions.ts`. Do not invent new geo-blocks. Do not geo-block Israel. Do not block RU/BY. Logger stays usable.

---

## Ship

### 1. Locale model

- `APP_LANGS` — unchanged 15.
- `UI_LANGS` — the 40 BCP 47 tags above (language picker + html).
- `normalizeUiLang` / `packLangForUi` — never `split('-')[0]` for `zh-Hant`, `pt-PT`, `zh-Hans`.
- `htmlLangTag` / `isRtlLang` — `ar he fa ur` → `dir=rtl`.
- `firstClassLocales.ts` — complete wedge/chrome overlay for every `UI_LANGS` row we can translate well.

### 2. First-visit chooser

- Compact `AdaptiveOverlay` on marketing **and** app shell. Product stays visible. One tap Continue (dismiss = accept preselect).
- Language + country, **independent**.
- Language list: all 40 `UI_LANGS`.
- Country list: `servedCountryCodes()` = ISO 3166-1 filtered by `isHostedServiceSupportedCountry`. No parallel block list.
- Pre-select: saved cookie/storage → `?hl=` → `navigator.languages` → timezone hint → `/api/geo` (hint only).
- If detected/picked country is blocked: show `TERRITORY_BLOCK_MESSAGES`; persist language; persist the blocked country so hosted signup/checkout stays blocked; free logger still works. Do not offer a served-country override that pretends geo-block lost.
- Persist: `safeStorage` + cookies `mw_locale`, `mw_country` (strictly necessary, SameSite=Lax, 1y).
- After confirm, chooser does not reappear. Profile + footer can change language later. Country change in footer still cannot list blocked ISOs as served.
- `RegionDefaultsBoot` must **not** silently change language.

### 3. Cookies / HTML

Accept / Reject / Manage; DNT = reject; never block the logger; `hreflang` via `?hl=`; logical CSS on the set-log path.

### 4. Honest copy

Landing leftover “14 languages” strings must match `UI_LANGS.length` or use `{{count}}`. Never one “Chinese” row. Never “50 languages.” Never “available everywhere.” Never name a blocked country as a launch market.

---

## Out of scope

- `PRIVATE_MODE` flip. Production. Secrets / EIN / mission-ops.
- New payment geo-blocks. Discord.com. Social feed.
- Machine-translating Super Bundle / Learn / guidebook.
- Speech owning first paint.
- Rewriting `EUROPE_UNSUPPORTED_ISO2` / `OIC_UNSUPPORTED_ISO2` / `EXTRA_UNSUPPORTED_ISO2`.

---

## Done

- Chooser on cold load; preference survives reload.
- All 40 language-picker rows present with endonym + English.
- Country picker lists only served ISOs; blocked detection uses `TERRITORY_BLOCK_MESSAGES`.
- Wedge/chrome/picker/legal chrome complete for served-market langs; diaspora langs in picker as language prefs; Learn/Bundle English — stated in `LOCALES.md`.
- `ar he fa ur` are actually RTL; set-log table usable.
- Cookie banner matches classification.
- Draft PR titled **Global first-visit language + country (more locales)**; body cites `.737`, Hebrew, Cantonese, the fuller language list, and the existing geo-block.
