# CONTEXT.md — boot file (read first, every tool)

One screen of truth for any AI tool or human joining cold. Read this, then [AGENTS.md](AGENTS.md), then [INDEX.md](INDEX.md). Keep `## Now` current: update it on every ship, in the same commit as the [LOG.md](LOG.md) entry.

---

## What this is

**Mission Winning** · www.missionwinning.com · "Log a set. Offline."

> Adaptive AI coaching for train-anywhere athletes — free offline logging (no account), weekly plans from logs alone (no wearable). Super Bundle adds Coach depth and the other pillars — it never gates the logger.

- Six pillars — Train · Fuel · Move · Mind · Track · Learn — unified by the Mission Score. Constitution: [vision.md](vision.md). Pitch the **Train + Mission Coach wedge**, never "everything app" ([docs/THESIS.md](docs/THESIS.md)). Evidence thesis (structured exercise vs vague advice — not a depression product): [docs/EXERCISE_AS_MEDICINE.md](docs/EXERCISE_AS_MEDICINE.md). Crypto is a **payment rail** (Lifetime USDC), not the product ([docs/CRYPTO_RAILS_THESIS.md](docs/CRYPTO_RAILS_THESIS.md)).
- Surfaces: Next.js 16 PWA (repo root) · native Android Compose ([apps/android](apps/android), v1.24.1) · iOS deferred ([docs/IOS_PLAYBOOK.md](docs/IOS_PLAYBOOK.md)) · "Beyond the Basics" guidebook (`/guide` + magazine PDF).
- Solo founder + AI agents. Founder owns users, money, legal, secrets, `PRIVATE_MODE`. Agents own code, tests, perf, docs — inside horizon gates.

---

## Now (2026-08-27 · web `2026.07-unified.1053` · Android `1.24.1`)
> The ONLY "where we are" block in the repo — [ORCHESTRATION.md](ORCHESTRATION.md) points here.
>
> **Budget: ≤25 bullets.** Enforced by `src/lib/contextBudget.test.ts`. When over,
> rotate the oldest *shipped* entries to `docs/archive/` — `.1053` dropped `.1037` · `.1052` dropped `.1036` · `.1050` dropped `.1035` · `.1048` dropped `.1034` · `.1047` dropped `.1033` · `.1046` dropped `.1032` · `.1045` dropped `.1031` · `.1044` dropped `.1030` · `.1043` dropped `.1029` · `.1042` dropped `.1028` · `.1041` dropped `.1027` · `.1040` dropped `.1026` · `.1039` dropped `.1025` · `.1038` dropped `.1024` · `.1037` dropped `.1023` · `.1036` dropped `.1022` · `.1035` dropped `.1021` · `.1034` dropped `.1020` · `.1033` dropped `.1019` · `.1032` dropped `.1018` · `.1031` dropped `.1017` · `.1030` dropped `.1016` · `.1029` dropped `.1015` · `.1028` dropped `.1014` · `.1027` dropped `.1013` · `.1026` dropped `.1012` · `.1025` dropped `.1011` · `.1024` dropped `.1010` · `.1023` dropped `.1009` · `.1022` dropped `.1008` · `.1021` dropped `.1007` · `.1020` dropped `.1006` · `.1019` dropped `.1005` · `.1018` dropped `.1004` · `.1017` dropped `.1003` · `.1016` dropped `.1002` · `.1015` dropped `.1001` · `.1014` dropped `.1000` · `.1013` dropped `.999` · `.1012` dropped `.998` · `.1011` dropped `.997` · `.1010` dropped `.996` · `.1009` dropped `.995` · `.1008` dropped `.994` · `.1007` dropped `.993` · `.1006` dropped `.992` · `.1005` dropped `.991` · `.1004` dropped `.989` · `.1003` dropped `.988` · `.1002` dropped `.986` · `.1001` dropped `.985` · `.1000` dropped `.983` · `.999` dropped `.981` · `.998` dropped `.980` · `.997` dropped `.978` · `.996` dropped `.977` · `.995` dropped `.976` · `.994` dropped `.974` · `.993` dropped `.973` · `.992` dropped `.971` · `.991` dropped `.970` · `.989` dropped `.967` · `.988` dropped `.963` · `.986` kept `.963` (25-bullet cap) · `.985` dropped `.961` · `.983` dropped `.960` · `.981` dropped `.959` · `.980` dropped `.958` · `.978` dropped `.957` · `.977` dropped `.956` · `.976` dropped `.955` · `.974` dropped `.954` · `.973` dropped `.953` · `.971` dropped `.952` · `.970` dropped `.951` · `.967` dropped `.950` · `.965` dropped `.949` · `.963` dropped `.947` · `.961` dropped `.946` · `.960` dropped `.945` · `.959` dropped `.944` · `.958` dropped `.943` · `.957` dropped `.942` · `.956` dropped `.941` · `.955` dropped `.940` · `.954` dropped `.939` · `.953` dropped `.938` · `.952` dropped `.934` · `.951` dropped `.933` · `.950` dropped `.930` · `.949` dropped `.929` · `.947` dropped `.928` · `.946` dropped `.927` · `.945` dropped `.926` · `.944` dropped `.925` · `.943` dropped `.924` · `.942` dropped `.923` · `.941` dropped `.922` · `.940` dropped `.921` · `.939` dropped `.920` · `.938` dropped `.919` · `.934` dropped `.918` · `.933` dropped `.917` · `.930` dropped `.916` · `.929` dropped `.915` · `.928` dropped `.914` · `.927` dropped `.913` · `.926` dropped `.912` · `.925` dropped `.911` · `.924` dropped `.910` · `.923` dropped `.909` · `.922` dropped `.908` · `.921` dropped `.907` · `.920` dropped `.906` · `.919` dropped `.905` · `.918` dropped `.904` · `.917` dropped `.903` · `.916` dropped `.902` · `.915` dropped `.901` · `.914` dropped `.900` · `.913` dropped `.889` · `.912` dropped `.899` · `.911` dropped `.898` · `.910` dropped `.897` · `.909` dropped `.896` · `.908` dropped `.895` · `.907` dropped `.894` · `.906` dropped `.893` · `.905` dropped `.892` · `.904` dropped `.891` · `.903` dropped `.890` · `.902` dropped `.888` · `.901` dropped `.883` · `.900` dropped `.884` · `.899` dropped `.882` · `.898` dropped `.881` · `.897` dropped `.880` · `.896` dropped `.876` · `.895` dropped `.875` · `.894` dropped `.885` · `.893` dropped `.886` · `.892` dropped `.887` · `.891` dropped `.874` · `.890` dropped `.873` · `.889` dropped `.872` · `.888` dropped `.871` · `.887` dropped `.870` · `.886` dropped `.869` · `.885` dropped `.868` · `.884` dropped `.867` · `.883` dropped `.866` · `.882` dropped `.865` · `.881` dropped `.864` · `.880` dropped `.863` · `.873` dropped `.859` · `.872` dropped `.858` · `.871` dropped `.857` · `.870` dropped `.856` · `.869` dropped `.855` · `.868` dropped `.854` · `.867` dropped `.853` · `.866` dropped `.852` · `.865` dropped `.851` · `.864` dropped `.850` · `.863` dropped `.849` · `.862` dropped `.848` · `.861` dropped `.847` · `.860` dropped `.846` · `.859` dropped `.845` · `.858` dropped `.844` · `.857` dropped `.843` · `.856` dropped `.842` · `.855` dropped `.841` · `.854` dropped `.840` · `.853` dropped `.839` · `.852` dropped `.837` (full text remains in LOG.md / archive) · `.203` moved `.123`–`.189`,> `.207` moved `.190`–`.193`, `.211` moved `.194`–`.197`, `.215` moved `.198`
> `.216` moved `.200`, `.217` moved `.199`, `.218` moved `.201`, `.219` moved `.202`
> `.220` moved `.203`, `.221` moved `.204`, `.222` moved `.205`, `.223` moved `.206`,
> `.224` moved `.207`, `.240` moved `.208`, `.241` moved `.209`–`.210`, `.242` moved `.211`,
> `.243` moved `.212`, `.251` moved `.213`–`.218` and `.252` moved `.219`
> and `.253` moved `.220`
> and `.254` moved `.221`
> and `.255` moved `.222`
> and `.256` moved `.223`
> and `.257` moved `.224`
> and `.259` moved `.241`–`.240`
> and `.262` moved `.242`
> and `.263` moved `.246`–`.247`
> and `.265` moved `.244`
> and `.278` dropped `.263` detail (full text remains in LOG.md)
> and `.279` dropped `.264` detail (full text remains in LOG.md)
> and `.280` dropped `.265` detail (full text remains in LOG.md)
> and `.281` dropped `.266` detail (full text remains in LOG.md)
> and `.282` dropped `.267` detail (full text remains in LOG.md / archive)
> and `.283` dropped `.268` detail (full text remains in LOG.md / archive)
> and `.284` dropped `.269` detail (full text remains in LOG.md / archive)
> and `.285` dropped `.270` detail (full text remains in LOG.md / archive)
> and `.286` dropped `.271` detail (full text remains in LOG.md / archive)
> and `.287` dropped `.272` detail (full text remains in LOG.md / archive)
> and `.288` dropped `.273` detail (full text remains in LOG.md / archive)
> and `.289` dropped `.274` detail (full text remains in LOG.md / archive)
> and `.290` dropped `.275` detail (full text remains in LOG.md / archive)
> and `.291` dropped `.276` detail (full text remains in LOG.md / archive)
> and `.292` dropped `.277` detail (full text remains in LOG.md / archive)
> and `.293` dropped `.278` detail (full text remains in LOG.md / archive)
> and `.294` dropped `.279` detail (full text remains in LOG.md / archive)
> and `.295` dropped `.280` detail (full text remains in LOG.md / archive)
> and `.296` dropped `.281` detail (full text remains in LOG.md / archive)
> and `.297` dropped `.282` detail (full text remains in LOG.md / archive)
> and `.298` dropped `.283` detail (full text remains in LOG.md / archive)
> and `.299` dropped `.284` detail (full text remains in LOG.md / archive)
> and `.300` dropped `.285` detail (full text remains in LOG.md / archive)
> and `.301` dropped `.286` detail (full text remains in LOG.md / archive)
> and `.302` dropped `.287` detail (full text remains in LOG.md / archive)
> and `.303` dropped `.288` detail (full text remains in LOG.md / archive)
> and `.304` dropped `.289` detail (full text remains in LOG.md / archive)
> and `.305` dropped `.290` detail (full text remains in LOG.md / archive)
> and `.306` dropped `.291` detail (full text remains in LOG.md / archive)
> and `.307` dropped `.292` detail (full text remains in LOG.md / archive)
> and `.308` dropped `.293` detail (full text remains in LOG.md / archive)
> and `.309` dropped `.294` detail (full text remains in LOG.md / archive)
> and `.310` dropped `.295` detail (full text remains in LOG.md / archive)
> and `.311` dropped `.296` detail (full text remains in LOG.md / archive)
> and `.312` dropped `.297` detail (full text remains in LOG.md / archive)
> and `.313` dropped `.298` detail (full text remains in LOG.md / archive)
> and `.314` dropped `.299` detail (full text remains in LOG.md / archive)
> and `.315` dropped `.300` detail (full text remains in LOG.md / archive)
> and `.316` dropped `.301` detail (full text remains in LOG.md / archive)
> and `.317` dropped `.302` detail (full text remains in LOG.md / archive)
> and `.318` dropped `.303` detail (full text remains in LOG.md / archive)
> and `.319` dropped `.304` detail (full text remains in LOG.md / archive)
> and `.320` dropped `.305` detail (full text remains in LOG.md / archive)
> and `.321` dropped `.306` detail (full text remains in LOG.md / archive)
> and `.322` dropped `.307` detail (full text remains in LOG.md / archive)
> and `.323` dropped `.308` detail (full text remains in LOG.md / archive)
> and `.324` dropped `.309` detail (full text remains in LOG.md / archive)
> and `.325` dropped `.310` detail (full text remains in LOG.md / archive)
> and `.326` dropped `.311` detail (full text remains in LOG.md / archive)
> and `.327` dropped `.312` detail (full text remains in LOG.md / archive)
> and `.328` dropped `.313` detail (full text remains in LOG.md / archive)
> and `.329` dropped `.314` detail (full text remains in LOG.md / archive)
> and `.330` dropped `.315` detail (full text remains in LOG.md / archive)
> and `.331` dropped `.316` detail (full text remains in LOG.md / archive)
> and `.332` dropped `.317` detail (full text remains in LOG.md / archive)
> and `.333` dropped `.318` detail (full text remains in LOG.md / archive)
> and `.334` dropped `.319` detail (full text remains in LOG.md / archive)
> and `.852` dropped `.837` detail (full text remains in LOG.md / archive)
> and `.335` dropped `.320` detail (full text remains in LOG.md / archive)
> and `.336` dropped `.321` detail (full text remains in LOG.md / archive)
> and `.337` dropped `.322` detail (full text remains in LOG.md / archive)
> and `.338` dropped `.323` detail (full text remains in LOG.md / archive)
> and `.339` dropped `.324` detail (full text remains in LOG.md / archive)
> and `.340` dropped `.325` detail (full text remains in LOG.md / archive)
> and `.341` dropped `.326` detail (full text remains in LOG.md / archive)
> and `.342` dropped `.327` detail (full text remains in LOG.md / archive)
> and `.343` dropped `.328` detail (full text remains in LOG.md / archive)
> and `.344` dropped `.329` detail (full text remains in LOG.md / archive)
> and `.345` dropped `.330` detail (full text remains in LOG.md / archive)
> and `.346` dropped `.331` detail (full text remains in LOG.md / archive)
> and `.347` dropped `.332` detail (full text remains in LOG.md / archive)
> and `.348` dropped `.333` detail (full text remains in LOG.md / archive)
> and `.349` dropped `.334` detail (full text remains in LOG.md / archive)
> and `.350` dropped `.335` detail (full text remains in LOG.md / archive)
> and `.351` dropped `.336` detail (full text remains in LOG.md / archive)
> and `.352` dropped `.337` detail (full text remains in LOG.md / archive)
> and `.353` dropped `.338` detail (full text remains in LOG.md / archive)
> and `.354` dropped `.339` detail (full text remains in LOG.md / archive)
> and `.355` dropped `.340` detail (full text remains in LOG.md / archive)
> and `.356` dropped `.341` detail (full text remains in LOG.md / archive)
> and `.357` dropped `.342` detail (full text remains in LOG.md / archive)
> and `.358` dropped `.343` detail (full text remains in LOG.md / archive)
> and `.359` dropped `.344` detail (full text remains in LOG.md / archive)
> and `.360` dropped `.345` detail (full text remains in LOG.md / archive)
> and `.361` dropped `.346` detail (full text remains in LOG.md / archive)
> and `.362` dropped `.347` detail (full text remains in LOG.md / archive)
> and `.363` dropped `.348` detail (full text remains in LOG.md / archive)
> and `.364` dropped `.349` detail (full text remains in LOG.md / archive)
> and `.365` dropped `.350` detail (full text remains in LOG.md / archive)
> and `.366` dropped `.351` detail (full text remains in LOG.md / archive)
> and `.367` dropped `.352` detail (full text remains in LOG.md / archive)
> and `.368` dropped `.353` detail (full text remains in LOG.md / archive)
> and `.369` dropped `.354` detail (full text remains in LOG.md / archive)
> and `.370` dropped `.355` detail (full text remains in LOG.md / archive)
> and `.371` dropped `.356` detail (full text remains in LOG.md / archive)
> and `.372` dropped `.357` detail (full text remains in LOG.md / archive)
> and `.373` dropped `.358` detail (full text remains in LOG.md / archive)
> and `.374` dropped `.359` detail (full text remains in LOG.md / archive)
> and `.375` dropped `.360` detail (full text remains in LOG.md / archive)
> and `.376` dropped `.361` detail (full text remains in LOG.md / archive)
> and `.377` dropped `.362` detail (full text remains in LOG.md / archive)
> and `.378` dropped `.363` detail (full text remains in LOG.md / archive)
> and `.379` dropped `.364` detail (full text remains in LOG.md / archive)
> and `.380` dropped `.365` detail (full text remains in LOG.md / archive)
> and `.381` dropped `.366` detail (full text remains in LOG.md / archive)
> and `.382` dropped `.367` detail (full text remains in LOG.md / archive)
> and `.383` dropped `.368` detail (full text remains in LOG.md / archive)
> and `.384` dropped `.369` detail (full text remains in LOG.md / archive)
> and `.385` dropped `.370` detail (full text remains in LOG.md / archive)
> and `.386` dropped `.371` detail (full text remains in LOG.md / archive)
> and `.387` dropped `.372` detail (full text remains in LOG.md / archive)
> and `.388` dropped `.373` detail (full text remains in LOG.md / archive)
> and `.389` dropped `.374` detail (full text remains in LOG.md / archive)
> and `.390` dropped `.375` detail (full text remains in LOG.md / archive)
> and `.391` dropped `.376` detail (full text remains in LOG.md / archive)
> and `.392` dropped `.377` detail (full text remains in LOG.md / archive)
> and `.393` dropped `.378` detail (full text remains in LOG.md / archive)
> and `.394` dropped `.379` detail (full text remains in LOG.md / archive)
> and `.395` dropped `.380` detail (full text remains in LOG.md / archive)
> and `.396` dropped `.381` detail (full text remains in LOG.md / archive)
> and `.397` dropped `.382` detail (full text remains in LOG.md / archive)
> and `.398` dropped `.383` detail (full text remains in LOG.md / archive)
> and `.399` dropped `.384` detail (full text remains in LOG.md / archive)
> and `.400` dropped `.385` detail (full text remains in LOG.md / archive)
> and `.401` dropped `.386` detail (full text remains in LOG.md / archive)
> and `.402` dropped `.387` detail (full text remains in LOG.md / archive)
> and `.403` dropped `.388` detail (full text remains in LOG.md / archive)
> and `.404` dropped `.389` detail (full text remains in LOG.md / archive)
> and `.405` dropped `.390` detail (full text remains in LOG.md / archive)
> and `.406` dropped `.391` detail (full text remains in LOG.md / archive)
> and `.407` dropped `.392` detail (full text remains in LOG.md / archive)
> and `.408` dropped `.390` detail (full text remains in LOG.md / archive)
> and `.409` dropped `.394` detail (full text remains in LOG.md / archive)
> and `.410` dropped `.395` detail (full text remains in LOG.md / archive)
> and `.411` dropped `.396` detail (full text remains in LOG.md / archive)
> and `.412` dropped `.397` detail (full text remains in LOG.md / archive)
> and `.413` dropped `.398` detail (full text remains in LOG.md / archive)
> and `.414` dropped `.399` detail (full text remains in LOG.md / archive)
> and `.415` dropped `.400` detail (full text remains in LOG.md / archive)
> and `.416` dropped `.401` detail (full text remains in LOG.md / archive)
> and `.417` dropped `.402` detail (full text remains in LOG.md / archive)
> and `.418` dropped `.403` detail (full text remains in LOG.md / archive)
> and `.419` dropped `.404` detail (full text remains in LOG.md / archive)
> and `.420` dropped `.405` detail (full text remains in LOG.md / archive)
> and `.421` dropped `.406` detail (full text remains in LOG.md / archive)
> and `.422` dropped `.407` detail (full text remains in LOG.md / archive)
> and `.423` dropped `.408` detail (full text remains in LOG.md / archive)
> and `.424` dropped `.409` detail (full text remains in LOG.md / archive)
> and `.425` dropped `.410` detail (full text remains in LOG.md / archive)
> and `.426` dropped `.411` detail (full text remains in LOG.md / archive)
> and `.427` dropped `.412` detail (full text remains in LOG.md / archive)
> and `.428` dropped `.413` detail (full text remains in LOG.md / archive)
> and `.429` dropped `.414` detail (full text remains in LOG.md / archive)
> and `.430` dropped `.415` detail (full text remains in LOG.md / archive)
> and `.431` dropped `.416` detail (full text remains in LOG.md / archive)
> and `.432` dropped `.417` detail (full text remains in LOG.md / archive)
> and `.433` dropped `.418` detail (full text remains in LOG.md / archive)
> and `.434` dropped `.419` detail (full text remains in LOG.md / archive)
> and `.435` dropped `.420` detail (full text remains in LOG.md / archive)
> and `.436` dropped `.421` detail (full text remains in LOG.md / archive)
> and `.437` dropped `.422` detail (full text remains in LOG.md / archive)
> and `.438` dropped `.423` detail (full text remains in LOG.md / archive)
> and `.439` dropped `.424` detail (full text remains in LOG.md / archive)
> and `.440` dropped `.425` detail (full text remains in LOG.md / archive)
> and `.441` dropped `.426` detail (full text remains in LOG.md / archive)
> and `.442` dropped `.427` detail (full text remains in LOG.md / archive)
> and `.443` dropped `.428` detail (full text remains in LOG.md / archive)
> and `.444` dropped `.429` detail (full text remains in LOG.md / archive)
> and `.445` dropped `.430` detail (full text remains in LOG.md / archive)
> and `.446` dropped `.431` detail (full text remains in LOG.md / archive)
> and `.447` dropped `.432` detail (full text remains in LOG.md / archive)
> and `.448` dropped `.433` detail (full text remains in LOG.md / archive)
> and `.449` dropped `.434` detail (full text remains in LOG.md / archive)
> and `.450` dropped `.435` detail (full text remains in LOG.md / archive)
> and `.451` dropped `.436` detail (full text remains in LOG.md / archive)
> and `.452` dropped `.437` detail (full text remains in LOG.md / archive)
> and `.453` dropped `.438` detail (full text remains in LOG.md / archive)
> and `.454` dropped `.439` detail (full text remains in LOG.md / archive)
> and `.455` dropped `.440`–`.442` detail (full text remains in LOG.md / archive)
> and `.456` dropped `.441` detail (full text remains in LOG.md / archive)
> and `.457` dropped `.442` detail (full text remains in LOG.md / archive)
> and `.458` dropped `.443` detail (full text remains in LOG.md / archive)
> and `.459` dropped `.444` detail (full text remains in LOG.md / archive)
> and `.460` dropped `.445` detail (full text remains in LOG.md / archive)
> and `.461` dropped `.446` detail (full text remains in LOG.md / archive)
> and `.462` dropped `.447` detail (full text remains in LOG.md / archive)
> and `.463` dropped `.448` detail (full text remains in LOG.md / archive)
> and `.464` dropped `.449` detail (full text remains in LOG.md / archive)
> and `.465` dropped `.450` detail (full text remains in LOG.md / archive)
> and `.466` dropped `.451` detail (full text remains in LOG.md / archive)
> and `.467` dropped `.452` detail (full text remains in LOG.md / archive)
> and `.468` dropped `.453` detail (full text remains in LOG.md / archive)
> and `.469` dropped `.454` detail (full text remains in LOG.md / archive)
> and `.470` dropped `.455` detail (full text remains in LOG.md / archive)
> and `.471` dropped `.456` detail (full text remains in LOG.md / archive)
> and `.472` dropped `.457` detail (full text remains in LOG.md / archive)
> and `.473` dropped `.458` detail (full text remains in LOG.md / archive)
> and `.474` dropped `.459` detail (full text remains in LOG.md / archive)
> and `.475` dropped `.460` detail (full text remains in LOG.md / archive)
> and `.476` dropped `.461` detail (full text remains in LOG.md / archive)
> and `.477` dropped `.462` detail (full text remains in LOG.md / archive)
> and `.478` dropped `.463` detail (full text remains in LOG.md / archive)
> and `.479` dropped `.464` detail (full text remains in LOG.md / archive)
> and `.480` dropped `.465` detail (full text remains in LOG.md / archive)
> and `.481` dropped `.466` detail (full text remains in LOG.md / archive)
> and `.482` dropped `.467` detail (full text remains in LOG.md / archive)
> and `.483` dropped `.468` detail (full text remains in LOG.md / archive)
> and `.484` dropped `.469` detail (full text remains in LOG.md / archive)
> and `.485` dropped `.470` detail (full text remains in LOG.md / archive)
> and `.486` dropped `.471` detail (full text remains in LOG.md / archive)
> and `.487` dropped `.472` detail (full text remains in LOG.md / archive)
> and `.488` dropped `.473` detail (full text remains in LOG.md / archive)
> and `.489` dropped `.474` detail (full text remains in LOG.md / archive)
> and `.490` dropped `.475` detail (full text remains in LOG.md / archive)
> and `.491` dropped `.476` detail (full text remains in LOG.md / archive)
> and `.492` dropped `.477` detail (full text remains in LOG.md / archive)
> and `.493` dropped `.478` detail (full text remains in LOG.md / archive)
> and `.494` dropped `.479` detail (full text remains in LOG.md / archive)
> and `.495` dropped `.480` detail (full text remains in LOG.md / archive)
> and `.496` dropped `.481` detail (full text remains in LOG.md / archive)
> and `.497` dropped `.482` detail (full text remains in LOG.md / archive)
> and `.498` dropped `.483` detail (full text remains in LOG.md / archive)
> and `.499` dropped `.484` detail (full text remains in LOG.md / archive)
> and `.500` dropped `.485` detail (full text remains in LOG.md / archive)
> and `.501` dropped `.486` detail (full text remains in LOG.md / archive)
> and `.502` dropped `.487` detail (full text remains in LOG.md / archive)
> and `.503` dropped `.488` detail (full text remains in LOG.md / archive)
> and `.505`–`.545` dropped detail (full text remains in LOG.md / archive)
> and `.605` dropped `.590` detail (rotated to docs/archive/log/LOG-rotate-605.md)
> and `.597` dropped `.543`–`.544` detail (full text remains in LOG.md / archive)
> and `.598` dropped `.583` detail (full text remains in LOG.md / archive)
> and `.599` dropped `.584` detail (full text remains in LOG.md / archive)
> and `.600` dropped `.585` detail (full text remains in LOG.md / archive)
> and `.601` dropped `.586` detail (full text remains in LOG.md / archive)
> and `.602` dropped `.587` detail (full text remains in LOG.md / archive)
> and `.603` dropped `.588` detail (full text remains in LOG.md / archive)
> and `.614` dropped `.594` detail (full text remains in LOG.md / archive)
> and `.679` dropped `.668` detail (full text remains in LOG.md / archive)
> and `.680` dropped `.626` detail (full text remains in LOG.md / archive)
> and `.684` dropped `.627` detail (full text remains in LOG.md / archive)
> and `.685` dropped `.628` detail (full text remains in LOG.md / archive)
> and `.689` dropped `.629` detail (full text remains in LOG.md / archive)
> and `.690` dropped `.630` detail (full text remains in LOG.md / archive)
> and `.691` dropped `.631` detail (full text remains in LOG.md / archive)
> and `.692` dropped `.632` detail (full text remains in LOG.md / archive)
> and `.693` dropped `.633` detail (full text remains in LOG.md / archive)
> and `.694` dropped `.619` detail (full text remains in LOG.md / archive)
> and `.695` dropped `.606` detail (full text remains in LOG.md / archive)
> and `.696` dropped `.635` detail (full text remains in LOG.md / archive)
> and `.697` dropped `.618` detail (full text remains in LOG.md / archive)
> and `.714` dropped `.636` detail (full text remains in LOG.md / archive)
> and `.743` dropped `.669` detail (full text remains in LOG.md / archive)
> and `.744` dropped `.679` detail (full text remains in LOG.md / archive)
> and `.745` dropped `.680` detail (full text remains in LOG.md / archive)
> and `.746` dropped `.684` detail (full text remains in LOG.md / archive)
> and `.747` dropped `.685` detail (full text remains in LOG.md / archive)
> and `.748` dropped `.689` detail (full text remains in LOG.md / archive)
> and `.749` dropped `.690` detail (full text remains in LOG.md / archive)
> and `.750` dropped `.691` detail (full text remains in LOG.md / archive)
> and `.751` dropped `.692` detail (full text remains in LOG.md / archive)
> and `.752` dropped `.693` detail (full text remains in LOG.md / archive)
> and `.753` dropped `.694` detail (full text remains in LOG.md / archive)
> and `.754` dropped `.695` detail (full text remains in LOG.md / archive)
> and `.755` dropped `.696` detail (full text remains in LOG.md / archive)
> and `.756` dropped `.697` detail (full text remains in LOG.md / archive)
> and `.757` dropped `.714` detail (full text remains in LOG.md / archive)
> and `.758` dropped `.743` detail (full text remains in LOG.md / archive)
> and `.759` dropped `.744` detail (full text remains in LOG.md / archive)
> and `.760` dropped `.745` detail (full text remains in LOG.md / archive)
> and `.761` dropped `.746` detail (full text remains in LOG.md / archive)
> and `.762` dropped `.747` detail (full text remains in LOG.md / archive)
> and `.777` dropped `.762` detail (full text remains in LOG.md / archive)
> and `.779` dropped `.764` detail (full text remains in LOG.md / archive)
> and `.780` dropped `.765` detail (full text remains in LOG.md / archive)
> and `.781` dropped `.766` detail (full text remains in LOG.md / archive)
> and `.778` dropped `.763` detail (full text remains in LOG.md / archive)
> and `.763` dropped `.748` detail (full text remains in LOG.md / archive)
> and `.764` dropped `.749` detail (full text remains in LOG.md / archive)
> and `.765` dropped `.750` detail (full text remains in LOG.md / archive)
> and `.766` dropped `.751` detail (full text remains in LOG.md / archive)
> and `.767` dropped `.752` detail (full text remains in LOG.md / archive)
> and `.768` dropped `.753` detail (full text remains in LOG.md / archive)
> and form-object-kit dropped `.767` detail (full text remains in LOG.md / archive)
> and `.782` dropped `.768` detail (full text remains in LOG.md / archive)
> and `.783` dropped `.769` detail (full text remains in LOG.md / archive)
> and `.784` dropped `.770` detail (full text remains in LOG.md / archive)
> and `.785` dropped `.771` detail (full text remains in LOG.md / archive)
> and `.786` dropped `.772` detail (full text remains in LOG.md / archive)
> and `.787` dropped `.773` detail (full text remains in LOG.md / archive)
> and `.788` dropped `.774` detail (full text remains in LOG.md / archive)
> and `.789` dropped `.775` detail (full text remains in LOG.md / archive)
> and `.790` dropped `.776` detail (full text remains in LOG.md / archive)
> and `.791` dropped `.777` detail (full text remains in LOG.md / archive)
> and `.792` dropped `.778` detail (full text remains in LOG.md / archive)
> and `.793` dropped `.779` detail (full text remains in LOG.md / archive)
> and `.794` dropped `.780` detail (full text remains in LOG.md / archive)
> and `.795` dropped `.781` detail (full text remains in LOG.md / archive)
> and `.796` dropped `.782` detail (full text remains in LOG.md / archive)
> and `.797` dropped `.783` detail (full text remains in LOG.md / archive)
> and `.798` dropped `.784` detail (full text remains in LOG.md / archive)
> and `.799` dropped `.785` detail (full text remains in LOG.md / archive)
> and `.800` dropped `.786` detail (full text remains in LOG.md / archive)
> and `.801` dropped `.787` detail (full text remains in LOG.md / archive)
> and `.802` dropped `.788` detail (full text remains in LOG.md / archive)
> and `.803` dropped `.789` detail (full text remains in LOG.md / archive)
> and `.804` dropped `.790` detail (full text remains in LOG.md / archive)
> and `.805` dropped `.791` detail (full text remains in LOG.md / archive)
> and `.806` dropped `.792` detail (full text remains in LOG.md / archive)
> and `.807` dropped `.793` detail (full text remains in LOG.md / archive)
> and `.808` dropped `.794` detail (full text remains in LOG.md / archive)
> and `.809` dropped `.795` detail (full text remains in LOG.md / archive)
> and `.810` dropped `.796` detail (full text remains in LOG.md / archive)
> and `.811` dropped `.797` detail (full text remains in LOG.md / archive)
> and `.812` dropped `.798` detail (full text remains in LOG.md / archive)
> and `.813` dropped `.799` detail (full text remains in LOG.md / archive)
> and `.814` dropped `.800` detail (full text remains in LOG.md / archive)
> and `.815` dropped `.801` detail (full text remains in LOG.md / archive)
> and `.816` dropped `.802` detail (full text remains in LOG.md / archive)
> and `.817` dropped `.803` detail (full text remains in LOG.md / archive)
> and `.818` dropped `.804` detail (full text remains in LOG.md / archive)
> and `.819` dropped `.805` detail (full text remains in LOG.md / archive)
> and `.820` dropped `.806` detail (full text remains in LOG.md / archive)
> and `.821` dropped `.807` detail (full text remains in LOG.md / archive)
> and `.822` dropped `.808` detail (full text remains in LOG.md / archive)
> and `.825` dropped `.809` detail (full text remains in LOG.md / archive)
> and `.826` dropped `.810` detail (full text remains in LOG.md / archive)
> and `.827` dropped `.811` detail (full text remains in LOG.md / archive)
> and `.828` dropped `.812` detail (full text remains in LOG.md / archive)
> and `.829` dropped `.813` detail (full text remains in LOG.md / archive)
> and `.830` dropped `.814` detail (full text remains in LOG.md / archive)
> and `.831` dropped `.815` detail (full text remains in LOG.md / archive)
> and `.832` dropped `.816` detail (full text remains in LOG.md / archive)
> and `.833` dropped `.817` detail (full text remains in LOG.md / archive)
> and `.834` dropped `.818` detail (full text remains in LOG.md / archive)
> and `.835` dropped `.819` detail (full text remains in LOG.md / archive)
> and `.836` dropped `.820` detail (full text remains in LOG.md / archive)
> and `.837` dropped `.821` detail (full text remains in LOG.md / archive)
> and `.838` dropped `.822` detail (full text remains in LOG.md / archive)
> and `.839` dropped `.825` detail (full text remains in LOG.md / archive)
> and `.840` dropped `.826` detail (full text remains in LOG.md / archive)
> and `.841` dropped `.827` detail (full text remains in LOG.md / archive)
> and `.842` dropped `.828` detail (full text remains in LOG.md / archive)
> and `.844` dropped `.830` detail (full text remains in LOG.md / archive)
> and `.845` dropped `.831` detail (full text remains in LOG.md / archive)
> and `.846` dropped `.832` detail (full text remains in LOG.md / archive)
> and `.847` dropped `.833` detail (full text remains in LOG.md / archive)
> and `.848` dropped `.834` detail (full text remains in LOG.md / archive)
> and `.849` dropped `.835` detail (full text remains in LOG.md / archive)
> and `.851` dropped `.838` detail (full text remains in LOG.md / archive)
> and `.843` dropped `.829` detail (full text remains in LOG.md / archive)
> and `.866` dropped `.852` detail (full text remains in LOG.md / archive)
> and `.867` dropped `.853` detail (full text remains in LOG.md / archive)
> and `.880` dropped `.863` detail (full text remains in LOG.md / archive)
> and `.881` dropped `.864` detail (full text remains in LOG.md / archive)
> and `.882` dropped `.865` detail (full text remains in LOG.md / archive)
> to [CONTEXT-now-2026-07-30.md](docs/archive/CONTEXT-now-2026-07-30.md) after this
> block reached **79 bullets / 103KB**. A status doc that only grows stops being read.

> **Status — the facts that decide what may be built.** Kept here as standing
> lines, not inside a ship bullet: `.203` rotated `.170` to the archive and took
> the beta-gate state with it, so `## Now` stopped stating the one rule that
> governs every other decision in this repo. Enforced by the `MUST_STATE` list in
> `src/lib/contextBudget.test.ts`.
>
> | Fact | State |
> |---|---|
> | **REDTEAM A5 falsifier** ([REDTEAM.md](docs/REDTEAM.md)) — *"14 days… still no 10 beta users"* | **Retired as a program.** There is no 10-invite beta. Release is **Alpha 0.1.0** — free tracker or Super Bundle. Mute-pay until EIN. Keep building until the `PRIVATE_MODE` flip. Agents never flip the gate or invent traction. |
> | `PRIVATE_MODE` | **on** in production. The gate is up; `/` serves the `/private` teaser. Also disables the service worker, so **no gated visitor can install the PWA or log offline** — deliberate (do not offline-cache a private app). Offline promise gets zero public validation until the flip. Post-flip check is in [LAUNCH_RUNBOOK](docs/LAUNCH_RUNBOOK.md) §5. |
> | `MAIL_POSTAL_ADDRESS` | **unset, later** — `send-beta-invite.ts` hard-exits and `renderEmail.ts` refuses to render. Not a build freeze. |
> | Repo visibility | **Working copy `Snedz/missionwinning` is private** (was public until 2026-08-02 00:49Z). Four GitHub security features went with it, all needing Advanced Security on a private repo: **secret scanning + push protection** (had been on), **code scanning** (`/code-scanning/default-setup` → 403), **private vulnerability reporting** (→ 404), and the **Dependency Review API** (→ 403, so `dependency-review-action` cannot run here at all). **Dependabot alerts and security updates are unaffected**. That leaves `gitleaks` as the only secret gate on Snedz. |
> | Alpha snapshot | **`Mission-Winning/missionwinning`** — private progress report (orphan). Refresh: `npm run snapshot:public`. Founder Public click. Not daily origin. Do not merge Dependabot there. |
> | GitHub Actions | **minutes exhausted / billing-blocked for paid jobs.** ~50 draft PRs show `build-and-test` red. Merge bar while red: **Cursor-local green** (`npm test`, lint, typecheck, excellence) + craft LGTM — [docs/CI_LOCAL.md](docs/CI_LOCAL.md). Actions red is not a product fail. Security jobs (gitleaks / CodeQL / aikido) stay on. `[skip vercel]` on commits unless the founder asked for a Preview. |
> | VAPID keys · `CRON_SECRET` · `SMOKE_BASE_URL` · Sentry DSN · Upstash | **unset.** Push ships dark, the hourly sweeps `exit 0`, there is no server request logging, and rate limiting is per-instance in memory. |
> | Migrations | **P1–P12 + `mission_ids` + `feedback_reviews` applied 2026-08-14** on production `missionwinning`. **`.908` four files applied 2026-08-17** (SQL Editor): `20260817_profiles_protect_nudge_cols.sql`, `20260817_fitness_test_results_api_only.sql`, `20260817_school_classes_revoke_anon_select.sql`, `20260817_leaderboard_snapshots_server_write.sql`. **`.958` `20260824_profiles_open_session.sql` is in the runbook — not applied.** Week-4 proof SQL not run via Management API. Next file still goes in the runbook. |
> | gitleaks | **green — and scanning for the first time.** It had never scanned anything: on a `pull_request` event the action lists the PR's commits, the job declared no `permissions:` block, and it 403'd (`pull_requests=read`) before opening a file. Fixed by a `permissions:` block (`.224` carrying `.255`). It scans **only the PR's own commits**, so commit `8ea3527a`'s real Solana treasury address — scrubbed from the working file, still in history — is out of its scope. That finding stands, deliberately not allowlisted; it was never what made this check red. |
> | Privacy / security program | **Landed `.778`** — [docs/security/PROGRAM_STATUS.md](docs/security/PROGRAM_STATUS.md). Invite-bound gate, health-bucket, DSAR, territory fail-closed. OTP-without-click can leave a ghost user. Not a cert. |

- **`.1053`:** (`2026.07-unified.1053`) **Product IA skeleton** — CoS freeze. `docs/IA_SKELETON.md` locks LOG / WEEK / GARAGE and named rooms Today · Train · Coach (AI) · History · Library. Isolation: Today/Train do not import social; tabs = `/log`+`/active`; Coach never reads Garage; chat never withholds a set. Dual-writer comment only. No costume. No `/private` restyle. `[skip vercel]`. No `PRIVATE_MODE` flip. No production promote. Live www stays `.696`. Guest. First set ungated. Today still one Start. Past master `.1052` (`895d940d`). Stamp stays `.1053`.
- **`.1052`:** (`2026.07-unified.1052`) **Revert Patreon costume, restore wireframe** — Founder rejected `.1051` in person: the costume is not good; go back to the original wireframe; the sidebar makes no sense. `git revert` of squash `49dfe6de` (PR #878, `.1051`) restores public www (`sites/www`) and signed-in chrome (Today / AppLayout / account / Sidebar) to the `.1050` modernist wireframe. Paper / ink / Archivo / radius 0. No Patreon sidebar. No `.ptn` costume tokens. `/private` unchanged vs `.1050`. Leftover PR #876 stays open. `[skip vercel]`. No `PRIVATE_MODE` flip. No production promote. Live www stays `.696`. Guest. First set ungated. Today still one Start. Past master `.1051` (`49dfe6de`). Stamp stays `.1052`.
- **`.1050`:** (`2026.07-unified.1050`) **Revert modernist Patreon door** — Founder chose revert. `git revert` of squash `dbf3bd340` (PR #875, `.1049`) restores `/private`, `sites/www`, marketing chrome (`MarketingNav`, `PublicPageShell`, `MarketingFooter`, `gate.css`, `GatePendingChrome`, `AppHeader`), and docs to the `.1048` tight lock. `docs/DESIGN.md` layout freeze is gone (it did not exist on `.1048`). No new door/www design remains. Does not redesign Today / AppLayout / Sidebar / signed-in home. Leftover PR #876 stays open on `cursor/modernist-patreon-layout-ef8c`. `[skip vercel]`. No `PRIVATE_MODE` flip. No production promote. Live www stays `.696`. Guest. First set ungated. Today still one Start. Past master `.1049` (`dbf3bd340`). Stamp stays `.1050`.
- **`.1048`:** (`2026.07-unified.1048`) **Open empty load is blank, not 0** — Live `SetLogTable` bound `value={input.weight}` so a reps-only / empty-load cell painted **0**. History edit already uses empty string when weight is 0 (`.997`). Completed kg cell already BW for weight/vest (`.1025`). `formatOpenLoadInput` → `''` when weight is 0 / missing / non-finite; typed load stays the number string. `parseOpenLoadInput` blank / junk → `0` (store stays 0). Open cell is `SetRowLoadField` (local draft like the time cell) so `0.` / `2.5` stay typeable; unfocused empty is still blank. Never writes BW / a bodyweight kilogram into the store. Plus-load `BW+` prefix stays; the number beside it is blank when added-load is 0. LogConsole leftover plus-load uses the same helper. Do not remount dead LogConsole. Do not rewrite History `calculateVolume`. Assisted-0 **completed** mute stays later. Display only. Guest. First set ungated. Honesty `.971` still scores Train. Today still one Start. Resume `.963` kept. Completed BW `.1025` / History edit empty string `.997` stay. `/private` stays the tight lock. No `PRIVATE_MODE` flip. Past master `.1047` (`48958422c`). Stamp stays `.1048`.
- **`.1047`:** (`2026.07-unified.1047`) **Superset on a finished session** — Optional exercise group on a finished History session. Live already has `superset.ts` / `supersetGroup` / `stripOrphanGroups` / "Superset w/ next" (`.980`). History edit could not pair or unpair lifts. `decidePatchFinishedSuperset` empty on missing draft / junk indexes / one-lift session. Last lift + pair-with-next is empty. `pair` true / `'next'` shares a group id with the next (reuse existing group on either side; else mint a short id). Same group already is noop. `pair` false / `''` / blank clears this lift then `stripOrphanGroups`. Already unpaired is noop. Apply clones exercises. Does not rewrite sets / notes / duration / name. `draftsEqual` includes `supersetGroup` (trimmed / omitted equal). `stripDraft` omits an undefined group and runs `stripOrphanGroups`. Same finished log. Same id. Outline 44px control per lift when editing 2+. Save still confirm-gated `decideEditSave`. Not a new SetKind. Not marketplace circuits. Does not smash live `.980`. History only. Not Today. Guest. First set ungated. Honesty `.971` still scores Train. Today still one Start. Resume `.963` kept. Session note `.1046` / Lift note `.1045` stay. `/private` stays the tight lock. No `PRIVATE_MODE` flip. Past master `.1046` (`89437956d`). Stamp stays `.1047`.
- **`.1046`:** (`2026.07-unified.1046`) **Session note on a finished session** — Optional private session note on a finished History log. Live already has `normalizeSessionNote` / `attachSessionNote` / `SESSION_NOTE_MAX` 500 (`.983`). History detail has Name `.1007` and Duration `.1035` and does not show or edit `sessionNote`. `decidePatchFinishedSessionNote` empty on empty id / non-string junk. Blank / null / undefined clears (field absent) unless already omitted (noop). Live-open / missing / tomb is noop. Same normalized text is noop. Over-cap truncates at 500 (never emptied). Apply maps history via `attachSessionNote` and bumps `revision` / `updatedAt`. Same finished log. Same id. Empty is valid. Never required. Outline 44px textarea next to Duration. Own Save. Does not smash `decideEditSave`. Does not rewrite sets / duration / name / lift notes. Does not smash the live jot. History only. Not Today. Guest. First set ungated. Honesty `.971` still scores Train. Today still one Start. Resume `.963` kept. Lift note `.1045` / Duration `.1035` / Name `.1007` stay. `/private` stays the tight lock. No `PRIVATE_MODE` flip. Past master `.1045` (`a67650a61`). Stamp stays `.1046`.
- **`.1045`:** (`2026.07-unified.1045`) **Lift note on a finished exercise** — Optional per-lift diary on a finished History exercise. Live already has `exerciseNote.ts` / `EXERCISE_NOTE_MAX` 200 (`.996`). History edit displayed `ex.note` as italic and could not correct it. `draftsEqual` ignored notes, so a typed note would Save as noop. `decidePatchFinishedExerciseNote` patches that lift's `note` via an exercise-index clone (`{ ...ex, note }`). Empty / junk indexes invent nothing. Non-string junk invents nothing. Blank / null / undefined clears (field absent) unless already omitted (noop). Same normalized text is noop. Over-cap truncates at 200 (never emptied). Same finished log. Same id. Empty is valid. Never required. Outline 44px textarea when editing. Read-only italic stays when not editing. Save still confirm-gated `decideEditSave`. Does not rewrite sets / `sessionNote` / pin. Does not call `lastNotesFor` / cueMemory / LLM. Does not write Wednesday / saved / live Start. History only. Not Today. Guest. First set ungated. Honesty `.971` still scores Train. Today still one Start. Resume `.963` kept. Load % `.1044` / Tempo `.1043` / L/R `.1042` / RIR `.1041` / RPE `.1040` stay. `/private` stays the tight lock. No `PRIVATE_MODE` flip. Past master `.1044` (`64277eb80`). Stamp stays `.1045`.
- **`.1044`:** (`2026.07-unified.1044`) **Load % on a finished set** — Optional percent of a known 1-rep max on a finished History set. Live already has `parseOptionalLoadPct` / live `SetRowPercentField` (`.981`). History edit could not correct a logged `loadPct`. `decidePatchFinishedSetLoadPct` patches that set's `loadPct` via `patchDraftSet`. Empty / junk indexes invent nothing. `0` / `101` / `80.12` / `nope` / boolean invent nothing (never clamped). Blank / null / undefined clears (field absent) unless already omitted (noop). Same value is noop. Same finished log. Same id. Empty is valid. Never required. Range 1–100, one decimal (`76.5`). Trailing `%` allowed (`80%`). Outline 44px `SetLoadPctField` on weight rows when editing. Save still confirm-gated `decideEditSave`. Does not invent a percent from the logged weight. Does not rewrite `weight` from the percent. No Epley. No `knownMaxFromHistory` / `weightFromKnownMaxPct` / `loadPctOfKnownMax`. Does not write `rpe` / `rpe10` / `rir` / `kind` / `side` / `tempo`. Does not write Wednesday / saved / live Start. History only. Not Today. Guest. First set ungated. Honesty `.971` still scores Train. Today still one Start. Resume `.963` kept. Tempo `.1043` / L/R `.1042` / RIR `.1041` / RPE `.1040` / Set kind `.1039` stay. `/private` stays the tight lock. No `PRIVATE_MODE` flip. Past master `.1043` (`4dfc2d287`). Stamp stays `.1044`.
- **`.1043`:** (`2026.07-unified.1043`) **Tempo on a finished set** — Optional e-p-c tempo on a finished History set. Live already has `parseOptionalTempo` / `SetTempoField` (`.734`). History edit could not correct a logged tempo. `decidePatchFinishedSetTempo` patches that set's `tempo` via `patchDraftSet`. Empty / junk indexes invent nothing. `311` / `3-1-1-1` / `10-0-0` / `nope` / number / boolean invent nothing (never clamped). Blank / null / undefined clears (field absent) unless already omitted (noop). Same value is noop (`temposEqual`). Same finished log. Same id. Empty is valid. Never required. Display is `e-p-c` (e.g. `3-1-1`). Each phase is 0–9. Outline 44px `SetTempoField` per set when editing. Save still confirm-gated `decideEditSave`. Does not write `rpe` / `rpe10` / `rir` / `kind` / `side`. Does not call `rememberLastTempo`. Does not write Wednesday / saved / live Start. History only. Not Today. Guest. First set ungated. Honesty `.971` still scores Train. Today still one Start. Resume `.963` kept. L/R `.1042` / RIR `.1041` / RPE `.1040` / Set kind `.1039` / Remove lift `.1038` / Add `.1037` / Replace `.1036` / Reorder `.1034` / Edit `.997` stay. `/private` stays the tight lock. No `PRIVATE_MODE` flip. Past master `.1042` (`c1dd3facf`). Stamp stays `.1043`.
- **`.1042`:** (`2026.07-unified.1042`) **L/R on a finished set** — Optional L / R / Alt on a finished History set. Live already has `parseSetSide` / `SET_SIDES` / `shouldOfferSetSide` / LogConsole chips (`.724`). History edit could not correct a logged side. `decidePatchFinishedSetSide` patches that set's `side` via `patchDraftSet`. Empty / junk indexes invent nothing. `left` / `Left` / `normal` / `1` invent nothing. Squat / bench + L/R/alt invents nothing (never persist a side on bilateral). Blank / null / undefined clears (field absent) unless already omitted (noop). Same value is noop. Same finished log. Same id. Empty is valid. Never required. Values are `L` | `R` | `alt`. Never a SetKind. Outline 44px `SetSideSelect` only when `shouldOfferSetSide`. Save still confirm-gated `decideEditSave`. Does not write `rpe` / `rpe10` / `rir` / `kind`. Does not write Wednesday / saved / live Start. History only. Not Today. Guest. First set ungated. Honesty `.971` still scores Train. Today still one Start. Resume `.963` kept. RIR `.1041` / RPE `.1040` / Set kind `.1039` / Remove lift `.1038` / Add `.1037` / Replace `.1036` / Reorder `.1034` / Edit `.997` stay. `/private` stays the tight lock. No `PRIVATE_MODE` flip. Past master `.1041` (`e0072ec12`). Stamp stays `.1042`.
- **`.1041`:** (`2026.07-unified.1041`) **RIR on a finished set** — Optional 0–5 RIR on a finished History set. Live already has `parseOptionalRir` / `SetRirSelect` (`.725`). History edit could not correct a logged RIR. `decidePatchFinishedSetRir` patches that set's `rir` via `patchDraftSet`. Empty / junk indexes invent nothing. 6 invents nothing (never clamped). Blank / null / undefined clears (field absent) unless already omitted (noop). Same value is noop. Same finished log. Same id. Empty is valid. Never required. Scale is 0–5 (do not invent 0–10 — collides with RPE). Outline 44px `SetRirSelect` per set when editing. Save still confirm-gated `decideEditSave`. Does not write `rpe` or `rpe10`. Does not write Wednesday / saved / live Start. History only. Not Today. Guest. First set ungated. Honesty `.971` still scores Train. Today still one Start. Resume `.963` kept. RPE `.1040` / Set kind `.1039` / Remove lift `.1038` / Add `.1037` / Replace `.1036` / Reorder `.1034` / Edit `.997` stay. `/private` stays the tight lock. No `PRIVATE_MODE` flip. Past master `.1040` (`672bb5aec`). Stamp stays `.1041`.
- **`.1040`:** (`2026.07-unified.1040`) **RPE on a finished set** — Optional 1–10 RPE on a finished History set. Live already has `parseOptionalRpe10` / `SetRpe10Select` (`.967`). History edit could not correct a logged RPE. `decidePatchFinishedSetRpe10` patches that set's `rpe10` via `patchDraftSet`. Empty / junk indexes invent nothing. 99 invents nothing (never clamped). Blank / null / undefined clears (field absent) unless already omitted (noop). Same value is noop. Same finished log. Same id. Empty is valid. Never required. Outline 44px `SetRpe10Select` per set when editing. Paper/ink tokens only — no color scale. Save still confirm-gated `decideEditSave`. Does not write categorical `rpe`. Does not write Wednesday / saved / live Start. History only. Not Today. Guest. First set ungated. Honesty `.971` still scores Train. Today still one Start. Resume `.963` kept. Set kind `.1039` / Remove lift `.1038` / Add `.1037` / Replace `.1036` / Reorder `.1034` / Edit `.997` stay. `/private` stays the tight lock. No `PRIVATE_MODE` flip. Past master `.1039` (`a11cd01ee`). Stamp stays `.1040`.
- **`.1039`:** (`2026.07-unified.1039`) **Set kind on a finished set** — History edit shows kind as a badge. They cannot mark a warmup they logged as work (or the reverse). Live already has W/D/F via `toggleSetTag` (`.966`). `decidePatchFinishedSetKind` patches that set's `kind` via `patchDraftSet`. Empty / junk indexes / unknown kind invent nothing. Out of range / same kind is noop. Same finished log. Same id. Outline 44px kind control per set when editing. Save still confirm-gated `decideEditSave`. Does not write Wednesday / saved / live Start. Warmup still excluded from volume. History only. Not Today. Guest. First set ungated. Honesty `.971` still scores Train. Today still one Start. Resume `.963` kept. Remove lift `.1038` / Add `.1037` / Replace `.1036` / Reorder `.1034` / Edit `.997` stay. `/private` stays the tight lock. No `PRIVATE_MODE` flip. Past master `.1038` (`1dac3fb4b`). Stamp stays `.1039`.
- **`.1038`:** (`2026.07-unified.1038`) **Remove this lift from a finished session** — History edit can add a lift, replace, reorder, and remove a set. It cannot drop a whole movement they added by mistake. Session delete `.1003` is the whole log. `decideRemoveFinishedExercise` splices that index out. Empty / junk index invents nothing. Out of range / last remaining lift is noop. Same finished log. Same id. Outline 44px **Remove lift** per lift when editing two or more. Save still confirm-gated `decideEditSave`. Does not write Wednesday / saved / live Start. Does not tomb the session. History only. Not Today. Guest. First set ungated. Honesty `.971` still scores Train. Today still one Start. Resume `.963` kept. Add `.1037` / Replace `.1036` / Duration `.1035` / Reorder `.1034` / Edit `.997` / Delete `.1003` stay. `/private` stays the tight lock. No `PRIVATE_MODE` flip. Past master `.1037` (`b5cbfd21c`). Stamp stays `.1038`.
- **`.669`:** (`2026.07-unified.669`) **Excellence RESULT + agent stop-rule** — `excellenceGate` path policy + `check-excellence-gate` on gate/PR CI; wedge still ships while unscored.
- **Horizon W + full-launch override (2026-08-05).** Wedge excellence still required; agents may ship rewards + full surface honesty. Fuel estimate accuracy remains.
- **Alpha 0.1.0 · mute-pay:** LLC + EIN pending — Super Bundle shop merchandised, checkout muted; full depth unlocked; More/rail **Pillars demoted until first workout** (F-004 / `.695`). Offer is free tracker or Super Bundle ([docs/FREE_BETA.md](docs/FREE_BETA.md)).
- **`e2e:visual` is the one dark gate.** Its three baselines were generated **2026-07-22, before the rebrand**, and depicted the old navy/emerald dark design — black grounds, emerald CTAs, rounded corners. Verified by opening one, not inferred from dates. **Deleted**, because a known-wrong baseline is worse than none: the first Linux run would have shown four huge diffs, and the reflex there is `--update-snapshots` without looking, which launders whatever renders that day into truth. `home-reduced.png` **never had a baseline at all**, so the homepage has been silently self-approving since the case was written. **First Linux CI run after billing clears must bootstrap all four** (`npx playwright test --grep @visual --update-snapshots`, then commit the artifact) — it cannot be done on macOS, the pixels will not match.



- **Three jobs that built a different app (`.255`):** `ci-extended.yml` ran for the first time on 2026-08-01 — Actions had been billing-blocked — and **every one of its three app-building jobs was configured wrong**, in three different ways, all invisible until it ran. `e2e-critical` had no `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, so it reproduced `.249` exactly: `isPushSupported()` returns false without it, every component behind it renders nothing, and *"Today shows one red action at 19:00"* asserts one of them is mounted. `visual-regression` set `PRIVATE_MODE: 'false'` on the **assertion step** — after the build, after the server started — and GitHub step env does not reach earlier steps, so it reached neither. `lighthouse-budget` set **nothing at all**. On a runner that is not neutral: `isPrivateModeEnabled()` returns true whenever `PRIVATE_MODE` is unset and `NODE_ENV === 'production'` ([`privateGate.ts:23`](src/lib/privateGate.ts)), and `next build`/`next start` both set that. So both jobs served the **gated** app, where `/` and `/log` are not in `PRIVATE_GATE_PUBLIC_PATHS` and redirect to `/private`. **Two consequences, both of them a check that could not fail.** [`lighthouse-budget.mjs:9`](scripts/lighthouse-budget.mjs) scores four pages and two of them were the teaser — the lightest page in the product, timed as if it were the product. And the `.234` baseline bootstrap wrote `home-reduced.png` as a screenshot of `/private`, under the name of the most-linked page in the app, in the same run that `visual.spec.ts`'s own header called *"covering it for the first time"*. That is verbatim the laundering `.221` deleted the previous baselines to avoid, arriving through the front door. **`/bundle` was the one case that survived, because it checked where it landed** — every case now goes through a `shoot()` helper that compares the landing path to the file name and refuses on a mismatch, and a redirect may only skip if it states a reason. The env fix removes the cause; the landing check catches the next one, because a baseline is exactly the artifact nobody re-reads. **The guard for `.249` had this same defect**: it named `gate.mjs` and `ci.yml`, and there were three files and eight jobs — `.220`'s *name that claims more than its enumeration*, inside the guard written for `.220`. New [`workflowBuildEnv.test.ts`](src/lib/workflowBuildEnv.test.ts) globs `.github/workflows/*.yml` and requires job-level env matching `gate.mjs` — job-level only, since step env is what caused two of the three failures. **Its own first draft had the same defect and a mutant killed it**: it decided scope with `/\bnpm run build\b/`, so a job running `npx next build` with no env passed silently — `.212` inside a guard written about `.220`, a few tests after I wrote *"a guard that enumerates cannot notice a fourth"*. Inverted to **in scope unless exempted**: 12 `NOT_THIS_APP` entries (scanners, cron pokes, the two that must *never* see CI placeholders — `apply-migration` and `sync-vercel-env` — plus `deploy-production`, which Vercel builds remotely from the real project env, the three remote smokes, and Android/Gradle), each with a reason, and a staleness test. A pattern list is silent about what it misses; an exemption list makes leaving a thing a reviewer can disagree with. 12 mutants killed. Tests 1186→1194.

- **The bootstrap the visual gate could not run (`.254`):** the suite has four cases and **zero committed baselines**. `home-reduced.png` never had one at all, so **`/` — the most-linked page in the product — has been silently self-approving** on every run since the case was written; the other three went in `.221` for depicting the pre-Modernist design. `.200` had already fixed the worse half (the job ran `--update-snapshots || true` and re-read the files it had just written, green every time over nothing) by making the absence **a loud failure with instructions** — and those instructions named a command **nobody could execute**. `ci-extended.yml`'s runner is the only Linux/Chromium environment this project has, and baselines made anywhere else differ by font hinting and antialiasing alone, which is precisely how a pixel comparison stops meaning anything. So the gate was correct *and* terminal. New `bootstrap_baselines` `workflow_dispatch` input, **default false**: an input rather than a shell flag or auto-fallback, so the normal path stays loud and the weekly schedule — which supplies no inputs — can never reach the generate. The generate **asserts nothing**, deliberately: it writes the PNGs, the existing `always()` upload carries them off the runner, and the gate is a human opening every file, because `.221` deleted the old set rather than refresh it on the grounds that *"the obvious response to four huge visual diffs is `--update-snapshots` without looking, which launders whatever the app happens to render that day into the new truth."* **`ciTruth`'s guard was narrowed, not weakened** — it forbade the flag anywhere in the step, but what made the old behaviour a defect was never the flag, it was that the *default path* wrote and re-read its own baselines; the rule is now about **reachability**. Six mutants killed. **Near-miss recorded:** the block-extraction regex ended on `\n\s*fi`, which matched the `fi` inside `find` on the next line, so the guard judged one line of the block and failed on a fragment — third lazy-quantifier stop in this programme after `.221`'s `border-radius: 0` and `.223`'s `prLine: null`. **Three baselines, not four** — `/bundle` self-skips while FREE_BETA redirects it to `/log`. **The eyes-on review found one**, which is what it is for: `exercise-squats` and `home-reduced` are clean (paper, poster red, radius 0, Archivo; the homepage's grey blocks are `GrayscalePhoto`'s deliberate no-`base` state), but **all six guidebook chapter heroes in `public/learn/*.webp` are 89–99% dark with teal accents and ~0% red** — the navy/emerald palette `.131` retired, on paper pages. `.137` re-inked the guidebook *cover* and rebuilt the PDF; the chapter heroes were not in that pass, and **nothing could have caught it** — `check-design-system` reads source, and a palette baked into a `.webp` is invisible to it (`.221` one layer out). So `guide-human-performance.png` is **not** a baseline to commit: the image is right about what renders and wrong to enshrine, which is exactly the laundering `.221` deleted the old set to avoid. **Blocked and named:** committing CI-generated PNGs needs the `visual-diffs` artifact, and this session's token gets `403 Resource not accessible by integration` on Actions — the images above were rendered locally (same viewport, `reducedMotion: reduce`), which answers every design question but cannot produce pixel-valid baselines. Mechanism shipped, run dispatched, download + commit is founder-owned.
- **The settle rule that could not see loading (`.253`):** `a11y.spec.ts` waited for `getAnimations()` to go quiet and called the page settled; [`Skeleton.tsx`](src/components/ui/Skeleton.tsx) **deliberately does not animate** — its header explains why, the old pulse *was* the information so `prefers-reduced-motion` deleted the only cue. Two correct decisions composing into a wait that is blind to loading **by construction**. Measured, not argued: `/profile` under a 40× CPU throttle reaches the axe scan with **two `aria-busy` regions on screen and zero running animations**. `settle()` now requires both, on `[aria-busy="true"]` rather than `[aria-busy]` (`HoldToConfirmButton` and `CoachChatPanel` bind the attribute to state, so a resting page carries `false` nodes the looser selector would wait on forever). That let the **route special-case** go: `if (path === '/active')` waited on the Start button's *copy* (`/start workout|loading session/i`) — `.220`'s shape, one string edit from vanishing, and no other route had one at all; `ActiveEmptyState` declares `aria-busy` while persist rehydrates, so the general rule covers it. **Eight placeholders never said they were loading**, all found by the new guard rather than looked for: `HomeTodayDashboard` mounted **five** widgets on `/` with `loading: () => <Skeleton/>` — bare `Skeleton` is `aria-hidden`, so they were invisible to a screen reader *and* to any settle rule; `BenchmarksPage` and `HistoryPage` (×2) drew chart slots as `<div className="h-48 animate-pulse bg-card"/>`, anonymous grey boxes carrying **the exact pulse `Skeleton` retired**; `FuelLogSheet` and `BuilderPage` rendered a bare `<p>Loading…</p>`, visible text announced to nobody. New `SkeletonBlock` and [`loadingStatesAnnounce.test.ts`](src/lib/loadingStatesAnnounce.test.ts), which **resolves the fallback component's own source anywhere in the repo** rather than listing which placeholders exist. **My first guard was `.220` inside the fix for `.220`** — it asserted the `aria-busy` selector *appeared*, so a mutant deleting `&& loading() === 0` from the quiet condition survived: the query ran, its answer was discarded, green. Nine mutants now die. **What this does not claim:** it is **not** a proven fix for the `/profile` skeleton-contrast violation seen once in `.250` — that did not reproduce in ~30 throttled runs at rates 1–80, every one reporting zero serious/critical. `.224` records me calling three failures "container flakiness" when one was real; shipping a fix and declaring the matter closed is the same error mirrored. **a11y stays out of `ci.yml`** until there is stability evidence — its `CI_ONLY_EXEMPT` reasoning (a gate that reddens on a render race teaches people to re-run until green) is honoured, not overridden because a fix feels right. **Third `git checkout --` self-revert**, after `.202` and `.205` — the rule *commit before mutating* was already written in the archive and I ran the mutants against uncommitted work anyway; nothing was lost, but the habit is the finding.

- **Ops:** prod ships via **Vercel Deploy Hook + GitHub webhook** (unmetered, no Actions) — [docs/VERCEL_DEPLOY_CHECKLIST.md](docs/VERCEL_DEPLOY_CHECKLIST.md) §1.1; `deploy-production` is now **manual-only** fallback. **Actions state lives in the Status table above, and only there** — this line has now been wrong in both directions within one night (it claimed "cleared" while jobs were dying at `runner_id: 0`, and the correction claimed "blocked" an hour before billing came back at 00:12 UTC on 2026-08-01). Two places describing one fact is `.178`; the fix is not a better sentence here but **no sentence here**. `npm run gate` stays the faster pre-push check. **Secrets program** + pre-public scrub shipped — [docs/SECRETS.md](docs/SECRETS.md); OSS public-ready (AGPL + CoC) — founder flips GitHub Public — [docs/OPEN_SOURCE.md](docs/OPEN_SOURCE.md). Promote **`.157`** — now on `master`; keep Supabase Site URL on www.
- Agents **must** ship wedge habit-loop + free acquisition. Full-launch override (2026-08-05) allows rewards + surface honesty; still refuse America marketing / locale farms / F5 / free-logger gates without enable.
- **Founder:** Accept B on Android; dogfood notes; EIN / mute-pay; flip when ready. There is no 10-invite freeze and no YC deadline in this file. **Wire the Deploy Hook webhook** ([checklist §1.1](docs/VERCEL_DEPLOY_CHECKLIST.md)). **Before any list email: set `MAIL_POSTAL_ADDRESS`** (CAN-SPAM footer — confirm the Bizee TX registered-agent address is publishable as a business address, else PO box/CMRA; same address closes the DMCA agent row) — [LEGAL_SAFETY.md](docs/LEGAL_SAFETY.md) §3. Before Public: `npm run secrets:scan`, enable GitHub secret scanning + push protection; **Lifetime vs Grok** ([LAUNCH_RUNBOOK](docs/LAUNCH_RUNBOOK.md) §5) — $149 must not be unlimited frontier chat (`LLM_DAILY_USD_CENTS`, default 15¢/day).

---
## Read next

[AGENTS.md](AGENTS.md) (conventions · glossary · commands) → [INDEX.md](INDEX.md) (task → doc routing · stale paths §4) → [ORCHESTRATION.md](ORCHESTRATION.md) (horizons · gates · departments) → the folder `INDEX.md` where you'll work.

---

## Trap terms (full glossary: AGENTS.md)

| Term | Means |
|------|-------|
| Mission Coach | AI plan engine — `src/lib/coach/`, `/coach` (≠ `/coaching` human-lead form) |
| Mission Score | The 0–100 **weekly** grade. **"Win Score" is the retired name** — same number. `.605` renamed the public compare pages and the FAQ; the guidebook prose, `learnPaths`, two component `defaultValue`s and `notificationLocales:149` still say Win Score, because those are i18n strings whose values propagate to 14 packs and that is a translation pass, not a rename. Do not add new "Win Score" strings. |
| Today | Route `/log` (`HomePage.tsx`), nav label "Today" |
| Train | Route `/active` — the logger |
| Fuel | Route `/nutrition` |
| Journey phase 0–3 | UX arc ([docs/JOURNEY.md](docs/JOURNEY.md)) ≠ build phases A–I ([docs/PLAN.md](docs/PLAN.md)) ≠ PFT G1–G8 |
| Horizon 0–3 | What may be built now — [ORCHESTRATION.md](ORCHESTRATION.md) |
| Wedge | Train + Mission Coach — the go-to-market story |
| Super Bundle | The one premium sub: $11.99/mo · $59/yr founders · $149 lifetime |
| PRIVATE_MODE | Site gate — only the founder flips it |
| mw-core | [packages/mw-core](packages/mw-core) — pure TS shared coach/workout logic |

---

## Commands

`npm run typecheck` · `npm test` · `npm run build` · `npm run lint` — full list in AGENTS.md §Commands.
Android: `cd apps/android && ./gradlew :app:assembleDebug`.

---

## Hard rules

1. **Horizon rule** — Horizon 0: Alpha 0.1.0, keep building until the flip. Wedge excellence still required. No new pillars/locales/America/F5 without explicit founder override. No 10-invite beta.
2. **The free logger is never gated. Ever.**
3. Agents never flip `PRIVATE_MODE`, never invent traction numbers, never mark founder tasks done.
4. Do not open stale/deleted paths — [INDEX.md](INDEX.md) §4.
5. Docs match reality: every ship updates [LOG.md](LOG.md) + this file's `## Now` (+ build label).
