# src/lib/i18n/

Preference + country-picker helpers. Not a second geo-block list.

| File | Role |
|------|------|
| `countries.ts` | Display universe filtered by `isHostedServiceSupportedCountry` |
| `localePreference.ts` | Persist language + country; geo-block wins; first-set paths do not auto-open the chooser |
| `formatLocale.ts` | Number / date locale formatting |

Country policy: [`src/lib/legal/supportedRegions.ts`](../legal/supportedRegions.ts).
