# src/components/fitness-test/

> Presidential Fitness Test and school class UI.

## Components

| File | Purpose |
|------|---------|
| `FitnessTestRunner.tsx` | Main PFT flow |
| `PresidentialFitnessSection.tsx` | PFT entry on fitness test page |
| `SchoolClassPanel.tsx` | Join/create PE class |
| `YouthParentGate.tsx` | Under-age consent gate (uses `ui/OtpInput` for 6-digit verify) |
| `ShareFitnessButton.tsx` | Share PFT results text |
| `PftWeekOnePrintSheet.tsx` | Printable week-one challenge |
| `TeacherClassPrintSheet.tsx` | Printable class report |

## Related

| Layer | Path |
|-------|------|
| Page | `FitnessTestPage.tsx`, `TeacherClassPage.tsx` |
| Lib | `presidentialFitnessTest.ts`, `schoolClass.ts`, `schoolClassServer.ts` |
| Help | `docs/help/fitness-test-and-school.md` |
