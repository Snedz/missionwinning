# src/components/i18n/

| File | Role |
|------|------|
| `LocaleCountryChooser.tsx` | First-visit AdaptiveOverlay (language + served country). Stays closed; onboarding confirms. |
| `OnboardingLocaleFields.tsx` | Language + country on the I-Day profile step |
| `LocaleCountryControl.tsx` | Footer / profile control |
| `HtmlLangSync.tsx` | `<html lang>` + `dir` from `normalizeUiLang` |
| `RegionDefaultsBoot.tsx` | No-op. Units stay on the Settings default (metric) until the athlete changes them. |
| `LocaleHttpSync.tsx` | Optional HTTP locale overlays |
