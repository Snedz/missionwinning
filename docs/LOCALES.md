# LOCALES — language inventory (`.866`)

Language is a **display preference**. It is not a served-market claim.

Country / hosted-service policy lives in one place:

- [`src/lib/legal/supportedRegions.ts`](../src/lib/legal/supportedRegions.ts)
- [`src/page-components/SupportedRegionsPage.tsx`](../src/page-components/SupportedRegionsPage.tsx)
- Plan: [GLOBAL_LOCALE_PLAN.md](GLOBAL_LOCALE_PLAN.md)

We are a **global product with commercial exclusions**, not “available everywhere.” Do not write “Available in Saudi Arabia” or “Launching in France.” A person in the US may pick Arabic or German. That does not mean we serve OIC or Europe. French is not a pack or picker language — France is founder-excluded.

## Two lists

| List | Count | Role |
|------|-------|------|
| `APP_LANGS` | 14 | Pack / `i18n:parity` / guidebook keys. Do not add tags here without translating Learn. |
| `UI_LANGS` | 39 | First-visit language picker + `<html lang>`. |

Pack aliases: `zh-Hans` → pack `zh`. `pt-BR` → pack `pt`. `zh-Hant` / `yue` / extras start from English + overlay.

## Complete wedge (not English-fallback)

Served-country languages, first: `en ja ko zh-Hans zh-Hant yue he es pt-BR hi bn ta te th vi fil ru sw am`.

Wedge + chrome + picker + legal chrome + `dir` are complete for these. Super Bundle / Learn / guidebook body may still be English — that is honest, not a silent fallback on the logger.

## Diaspora language prefs

`ar fa ur id ms tr de it nl pl uk cs ro el sv da nb fi hu pt-PT` stay in the **language** picker. Label them as language, not as a served market. Geo-block still wins for hosted signup/checkout. `fr` is not a picker row.

## RTL

`ar he fa ur` set `<html dir="rtl">`.

## Honest copy

Say 39 languages when referring to the picker. Never “50.” Never “available everywhere.”
