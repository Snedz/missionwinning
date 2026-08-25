# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Latest first. Older entries: [docs/archive/log/LOG-rotate-947-for-965.md](docs/archive/log/LOG-rotate-947-for-965.md) (`.947` and earlier).

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md) · [`.283` for `.298`](docs/archive/log/LOG-rotate-298.md) · [`.284` for `.299`](docs/archive/log/LOG-rotate-299.md) · [`.285` for `.300`](docs/archive/log/LOG-rotate-300.md) · [`.286` for `.301`](docs/archive/log/LOG-rotate-301.md) · [`.287` for `.302`](docs/archive/log/LOG-rotate-302.md) · [`.288` for `.303`](docs/archive/log/LOG-rotate-303.md) · [`.289` for `.304`](docs/archive/log/LOG-rotate-304.md) · [`.290` for `.305`](docs/archive/log/LOG-rotate-305.md) · [`.291` for `.306`](docs/archive/log/LOG-rotate-306.md) · [`.292` for `.307`](docs/archive/log/LOG-rotate-307.md) · [`.293` for `.308`](docs/archive/log/LOG-rotate-308.md) · [`.294` for `.309`](docs/archive/log/LOG-rotate-309.md) · [`.295` for `.310`](docs/archive/log/LOG-rotate-310.md) · [`.296` for `.311`](docs/archive/log/LOG-rotate-311.md) · [`.297` for `.312`](docs/archive/log/LOG-rotate-312.md) · [`.298` for `.313`](docs/archive/log/LOG-rotate-313.md) · [`.299` for `.314`](docs/archive/log/LOG-rotate-314.md) · [`.300` for `.315`](docs/archive/log/LOG-rotate-315.md). · [`.301` for `.316`](docs/archive/log/LOG-rotate-316.md). · [`.302` for `.317`](docs/archive/log/LOG-rotate-317.md). · [`.303` for `.318`](docs/archive/log/LOG-rotate-318.md). · [`.304` for `.319`](docs/archive/log/LOG-rotate-319.md). · [`.305` for `.320`](docs/archive/log/LOG-rotate-320.md). · [`.306` for `.321`](docs/archive/log/LOG-rotate-321.md). · [`.307` for `.322`](docs/archive/log/LOG-rotate-322.md). · [`.308` for `.323`](docs/archive/log/LOG-rotate-323.md). · [`.309` for `.324`](docs/archive/log/LOG-rotate-324.md). · [`.310` for `.325`](docs/archive/log/LOG-rotate-325.md). · [`.311` for `.326`](docs/archive/log/LOG-rotate-326.md). · [`.312` for `.327`](docs/archive/log/LOG-rotate-327.md). · [`.313` for `.328`](docs/archive/log/LOG-rotate-328.md). · [`.314` for `.329`](docs/archive/log/LOG-rotate-329.md). · [`.315` for `.330`](docs/archive/log/LOG-rotate-330.md). · [`.316` for `.331`](docs/archive/log/LOG-rotate-331.md). · [`.317` for `.332`](docs/archive/log/LOG-rotate-332.md). · [`.318` for `.333`](docs/archive/log/LOG-rotate-333.md). · [`.319` for `.334`](docs/archive/log/LOG-rotate-334.md). · [`.320` for `.335`](docs/archive/log/LOG-rotate-335.md). · [`.321` for `.336`](docs/archive/log/LOG-rotate-336.md). · [`.322` for `.337`](docs/archive/log/LOG-rotate-337.md). · [`.323` for `.338`](docs/archive/log/LOG-rotate-338.md). · [`.324` for `.339`](docs/archive/log/LOG-rotate-339.md). · [`.325` for `.340`](docs/archive/log/LOG-rotate-340.md). · [`.326` for `.341`](docs/archive/log/LOG-rotate-341.md). · [`.327` for `.342`](docs/archive/log/LOG-rotate-342.md). · [`.328` for `.343`](docs/archive/log/LOG-rotate-343.md). · [`.329` for `.344`](docs/archive/log/LOG-rotate-344.md). · [`.330` for `.345`](docs/archive/log/LOG-rotate-345.md). · [`.331` for `.346`](docs/archive/log/LOG-rotate-346.md). · [`.332` for `.347`](docs/archive/log/LOG-rotate-347.md). · [`.333` for `.348`](docs/archive/log/LOG-rotate-348.md). · [`.334` for `.349`](docs/archive/log/LOG-rotate-349.md). · [`.335` for `.350`](docs/archive/log/LOG-rotate-350.md). · [`.336` for `.351`](docs/archive/log/LOG-rotate-351.md). · [`.337` for `.352`](docs/archive/log/LOG-rotate-352.md). · [`.338` for `.353`](docs/archive/log/LOG-rotate-353.md). · [`.339` for `.354`](docs/archive/log/LOG-rotate-354.md). · [`.340` for `.355`](docs/archive/log/LOG-rotate-355.md). · [`.341` for `.356`](docs/archive/log/LOG-rotate-356.md). · [`.342` for `.357`](docs/archive/log/LOG-rotate-357.md). · [`.343` for `.358`](docs/archive/log/LOG-rotate-358.md). · [`.344` for `.359`](docs/archive/log/LOG-rotate-359.md). · [`.345` for `.360`](docs/archive/log/LOG-rotate-360.md). · [`.346` for `.361`](docs/archive/log/LOG-rotate-361.md). · [`.347` for `.362`](docs/archive/log/LOG-rotate-362.md). · [`.348` for `.363`](docs/archive/log/LOG-rotate-363.md). · [`.349` for `.364`](docs/archive/log/LOG-rotate-364.md). · [`.350` for `.365`](docs/archive/log/LOG-rotate-365.md). · [`.351` for `.366`](docs/archive/log/LOG-rotate-366.md). · [`.352` for `.367`](docs/archive/log/LOG-rotate-367.md). · [`.353` for `.368`](docs/archive/log/LOG-rotate-368.md). · [`.354` for `.369`](docs/archive/log/LOG-rotate-369.md). · [`.355` for `.370`](docs/archive/log/LOG-rotate-370.md). · [`.356` for `.371`](docs/archive/log/LOG-rotate-371.md). · [`.357` for `.372`](docs/archive/log/LOG-rotate-372.md). · [`.358` for `.373`](docs/archive/log/LOG-rotate-373.md). · [`.359` for `.374`](docs/archive/log/LOG-rotate-374.md). · [`.360` for `.375`](docs/archive/log/LOG-rotate-375.md). · [`.361` for `.376`](docs/archive/log/LOG-rotate-376.md). · [`.362` for `.377`](docs/archive/log/LOG-rotate-377.md). · [`.363` for `.378`](docs/archive/log/LOG-rotate-378.md). · [`.364` for `.379`](docs/archive/log/LOG-rotate-379.md). · [`.365` for `.380`](docs/archive/log/LOG-rotate-380.md). · [`.366` for `.381`](docs/archive/log/LOG-rotate-381.md). · [`.367` for `.382`](docs/archive/log/LOG-rotate-382.md). · [`.368` for `.383`](docs/archive/log/LOG-rotate-383.md). · [`.369` for `.384`](docs/archive/log/LOG-rotate-384.md). · [`.370` for `.385`](docs/archive/log/LOG-rotate-385.md). · [`.371` for `.386`](docs/archive/log/LOG-rotate-386.md). · [`.372` for `.387`](docs/archive/log/LOG-rotate-387.md). · [`.373` for `.388`](docs/archive/log/LOG-rotate-388.md). · [`.374` for `.389`](docs/archive/log/LOG-rotate-389.md). · [`.375` for `.390`](docs/archive/log/LOG-rotate-390.md). · [`.376` for `.391`](docs/archive/log/LOG-rotate-391.md). · [`.377` for `.392`](docs/archive/log/LOG-rotate-392.md). · [`.378` for `.393`](docs/archive/log/LOG-rotate-393.md). · [`.379` for `.394`](docs/archive/log/LOG-rotate-394.md). · [`.380` for `.395`](docs/archive/log/LOG-rotate-395.md). · [`.381` for `.396`](docs/archive/log/LOG-rotate-396.md). · [`.382` for `.397`](docs/archive/log/LOG-rotate-397.md). · [`.383` for `.398`](docs/archive/log/LOG-rotate-398.md). · [`.384` for `.399`](docs/archive/log/LOG-rotate-399.md). · [`.385` for `.400`](docs/archive/log/LOG-rotate-400.md). · [`.386` for `.401`](docs/archive/log/LOG-rotate-401.md). · [`.387` for `.402`](docs/archive/log/LOG-rotate-402.md). · [`.388` for `.403`](docs/archive/log/LOG-rotate-403.md). · [`.389` for `.404`](docs/archive/log/LOG-rotate-404.md). · [`.390` for `.405`](docs/archive/log/LOG-rotate-405.md). · [`.391` for `.406`](docs/archive/log/LOG-rotate-406.md). · [`.392` for `.407`](docs/archive/log/LOG-rotate-407.md). · [`.393` for `.408`](docs/archive/log/LOG-rotate-408.md). · [`.394` for `.409`](docs/archive/log/LOG-rotate-409.md). · [`.395` for `.410`](docs/archive/log/LOG-rotate-410.md). · [`.396` for `.411`](docs/archive/log/LOG-rotate-411.md). · [`.397` for `.412`](docs/archive/log/LOG-rotate-412.md). · [`.398` for `.413`](docs/archive/log/LOG-rotate-413.md). · [`.399` for `.414`](docs/archive/log/LOG-rotate-414.md). · [`.400` for `.415`](docs/archive/log/LOG-rotate-415.md). · [`.401` for `.416`](docs/archive/log/LOG-rotate-416.md). · [`.402` for `.417`](docs/archive/log/LOG-rotate-417.md). · [`.403` for `.418`](docs/archive/log/LOG-rotate-418.md). · [`.404` for `.419`](docs/archive/log/LOG-rotate-419.md). · [`.405` for `.420`](docs/archive/log/LOG-rotate-420.md). · [`.406` for `.421`](docs/archive/log/LOG-rotate-421.md). · [`.407` for `.422`](docs/archive/log/LOG-rotate-422.md). · [`.408` for `.423`](docs/archive/log/LOG-rotate-423.md). · [`.409` for `.424`](docs/archive/log/LOG-rotate-424.md). · [`.410` for `.425`](docs/archive/log/LOG-rotate-425.md). · [`.411` for `.426`](docs/archive/log/LOG-rotate-426.md). · [`.412` for `.427`](docs/archive/log/LOG-rotate-427.md). · [`.413` for `.428`](docs/archive/log/LOG-rotate-428.md). · [`.414` for `.429`](docs/archive/log/LOG-rotate-429.md). · [`.415` for `.430`](docs/archive/log/LOG-rotate-430.md). · [`.416` for `.431`](docs/archive/log/LOG-rotate-431.md). · [`.417` for `.432`](docs/archive/log/LOG-rotate-432.md). · [`.418` for `.433`](docs/archive/log/LOG-rotate-433.md). · [`.419` for `.434`](docs/archive/log/LOG-rotate-434.md). · [`.420` for `.435`](docs/archive/log/LOG-rotate-435.md). · [`.421` for `.436`](docs/archive/log/LOG-rotate-436.md). · [`.422` for `.437`](docs/archive/log/LOG-rotate-437.md). · [`.423` for `.438`](docs/archive/log/LOG-rotate-438.md). · [`.424` for `.439`](docs/archive/log/LOG-rotate-439.md). · [`.425` for `.440`](docs/archive/log/LOG-rotate-440.md). · [`.426` for `.441`](docs/archive/log/LOG-rotate-441.md). · [`.427` for `.442`](docs/archive/log/LOG-rotate-442.md). · [`.428` for `.443`](docs/archive/log/LOG-rotate-443.md). · [`.429` for `.444`](docs/archive/log/LOG-rotate-444.md). · [`.430` for `.445`](docs/archive/log/LOG-rotate-445.md). · [`.431` for `.446`](docs/archive/log/LOG-rotate-446.md). · [`.432` for `.447`](docs/archive/log/LOG-rotate-447.md). · [`.433` for `.448`](docs/archive/log/LOG-rotate-448.md). · [`.434` for `.449`](docs/archive/log/LOG-rotate-449.md). · [`.435` for `.450`](docs/archive/log/LOG-rotate-450.md). · [`.436` for `.451`](docs/archive/log/LOG-rotate-451.md). · [`.437` for `.452`](docs/archive/log/LOG-rotate-452.md). · [`.438` for `.453`](docs/archive/log/LOG-rotate-453.md). · [`.439` for `.454`](docs/archive/log/LOG-rotate-454.md). · [`.440` for `.455`](docs/archive/log/LOG-rotate-455.md). · [`.441` for `.456`](docs/archive/log/LOG-rotate-456.md). · [`.442` for `.457`](docs/archive/log/LOG-rotate-457.md). · [`.443` for `.458`](docs/archive/log/LOG-rotate-458.md). · [`.444` for `.459`](docs/archive/log/LOG-rotate-459.md). · [`.445` for `.460`](docs/archive/log/LOG-rotate-460.md). · [`.446` for `.461`](docs/archive/log/LOG-rotate-461.md). · [`.447` for `.462`](docs/archive/log/LOG-rotate-462.md). · [`.448` for `.463`](docs/archive/log/LOG-rotate-463.md). · [`.449` for `.464`](docs/archive/log/LOG-rotate-464.md). · [`.450` for `.465`](docs/archive/log/LOG-rotate-465.md). · [`.451` for `.466`](docs/archive/log/LOG-rotate-466.md). · [`.452` for `.467`](docs/archive/log/LOG-rotate-467.md). · [`.453` for `.468`](docs/archive/log/LOG-rotate-468.md). · [`.454` for `.469`](docs/archive/log/LOG-rotate-469.md). · [`.455` for `.470`](docs/archive/log/LOG-rotate-470.md). · [`.456` for `.471`](docs/archive/log/LOG-rotate-471.md). · [`.457` for `.472`](docs/archive/log/LOG-rotate-472.md). · [`.458` for `.473`](docs/archive/log/LOG-rotate-473.md). · [`.459` for `.474`](docs/archive/log/LOG-rotate-474.md). · [`.460` for `.475`](docs/archive/log/LOG-rotate-475.md). · [`.461` for `.476`](docs/archive/log/LOG-rotate-476.md). · [`.462` for `.477`](docs/archive/log/LOG-rotate-477.md). · [`.463` for `.478`](docs/archive/log/LOG-rotate-478.md). · [`.464` for `.479`](docs/archive/log/LOG-rotate-479.md). · [`.465` for `.480`](docs/archive/log/LOG-rotate-480.md). · [`.466` for `.481`](docs/archive/log/LOG-rotate-481.md). · [`.467` for `.482`](docs/archive/log/LOG-rotate-482.md). · [`.468` for `.483`](docs/archive/log/LOG-rotate-483.md). · [`.469` for `.484`](docs/archive/log/LOG-rotate-484.md). · [`.470` for `.485`](docs/archive/log/LOG-rotate-485.md). · [`.471` for `.486`](docs/archive/log/LOG-rotate-486.md). · [`.472` for `.487`](docs/archive/log/LOG-rotate-487.md). · [`.473` for `.488`](docs/archive/log/LOG-rotate-488.md). · [`.474` for `.489`](docs/archive/log/LOG-rotate-489.md). · [`.475` for `.490`](docs/archive/log/LOG-rotate-490.md). · [`.476` for `.491`](docs/archive/log/LOG-rotate-491.md). · [`.477` for `.492`](docs/archive/log/LOG-rotate-492.md). · [`.478` for `.493`](docs/archive/log/LOG-rotate-493.md). · [`.479` for `.494`](docs/archive/log/LOG-rotate-494.md). · [`.480` for `.495`](docs/archive/log/LOG-rotate-495.md). · [`.481` for `.496`](docs/archive/log/LOG-rotate-496.md). · [`.482` for `.497`](docs/archive/log/LOG-rotate-497.md). · [`.483` for `.498`](docs/archive/log/LOG-rotate-498.md). · [`.484` for `.499`](docs/archive/log/LOG-rotate-499.md). · [`.485` for `.500`](docs/archive/log/LOG-rotate-500.md). · [`.486` for `.501`](docs/archive/log/LOG-rotate-501.md). · [`.487` for `.502`](docs/archive/log/LOG-rotate-502.md). · [`.488` for `.503`](docs/archive/log/LOG-rotate-503.md). · [`.490` for `.505`](docs/archive/log/LOG-rotate-505.md). · [`.491` for `.506`](docs/archive/log/LOG-rotate-506.md). · [`.579` for `.594`](docs/archive/log/LOG-rotate-594.md). · [`.580` for `.595`](docs/archive/log/LOG-rotate-595.md).


--- · [`.492` for `.507`](docs/archive/log/LOG-rotate-507.md). · [`.493` for `.508`](docs/archive/log/LOG-rotate-508.md). · [`.494` for `.509`](docs/archive/log/LOG-rotate-509.md). · [`.495` for `.510`](docs/archive/log/LOG-rotate-510.md). · [`.496` for `.511`](docs/archive/log/LOG-rotate-511.md). · [`.497` for `.512`](docs/archive/log/LOG-rotate-512.md). · [`.498` for `.513`](docs/archive/log/LOG-rotate-513.md). · [`.499` for `.514`](docs/archive/log/LOG-rotate-514.md). · [`.500` for `.515`](docs/archive/log/LOG-rotate-515.md). · [`.501` for `.516`](docs/archive/log/LOG-rotate-516.md). · [`.502` for `.517`](docs/archive/log/LOG-rotate-517.md). · [`.503` for `.518`](docs/archive/log/LOG-rotate-518.md). · [`.504` for `.519`](docs/archive/log/LOG-rotate-519.md). · [`.505` for `.520`](docs/archive/log/LOG-rotate-520.md). · [`.506` for `.521`](docs/archive/log/LOG-rotate-521.md). · [`.507` for `.522`](docs/archive/log/LOG-rotate-522.md). · [`.508` for `.523`](docs/archive/log/LOG-rotate-523.md). · [`.509` for `.524`](docs/archive/log/LOG-rotate-524.md). · [`.510` for `.525`](docs/archive/log/LOG-rotate-525.md). · [`.511` for `.526`](docs/archive/log/LOG-rotate-526.md). · [`.512` for `.527`](docs/archive/log/LOG-rotate-527.md). · [`.513` for `.528`](docs/archive/log/LOG-rotate-528.md). · [`.514` for `.529`](docs/archive/log/LOG-rotate-529.md). · [`.515` for `.530`](docs/archive/log/LOG-rotate-530.md). · [`.516` for `.531`](docs/archive/log/LOG-rotate-531.md). · [`.517` for `.532`](docs/archive/log/LOG-rotate-532.md). · [`.518` for `.533`](docs/archive/log/LOG-rotate-533.md). · [`.519` for `.534`](docs/archive/log/LOG-rotate-534.md). · [`.520` for `.535`](docs/archive/log/LOG-rotate-535.md). · [`.521` for `.536`](docs/archive/log/LOG-rotate-536.md). · [`.522` for `.537`](docs/archive/log/LOG-rotate-537.md). · [`.523` for `.538`](docs/archive/log/LOG-rotate-538.md). · [`.524` for `.539`](docs/archive/log/LOG-rotate-539.md). · [`.525` for `.540`](docs/archive/log/LOG-rotate-540.md). · [`.526` for `.541`](docs/archive/log/LOG-rotate-541.md). · [`.527` for `.542`](docs/archive/log/LOG-rotate-542.md). · [`.528` for `.543`](docs/archive/log/LOG-rotate-543.md). · [`.529` for `.544`](docs/archive/log/LOG-rotate-544.md). · [`.530` for `.545`](docs/archive/log/LOG-rotate-545.md). · [`.531` for `.546`](docs/archive/log/LOG-rotate-546.md). · [`.532` for `.547`](docs/archive/log/LOG-rotate-547.md). · [`.533` for `.548`](docs/archive/log/LOG-rotate-548.md). · [`.534` for `.549`](docs/archive/log/LOG-rotate-549.md). · [`.535` for `.550`](docs/archive/log/LOG-rotate-550.md). · [`.536` for `.551`](docs/archive/log/LOG-rotate-551.md). · [`.537` for `.552`](docs/archive/log/LOG-rotate-552.md). · [`.538` for `.553`](docs/archive/log/LOG-rotate-553.md). · [`.539` for `.554`](docs/archive/log/LOG-rotate-554.md). · [`.540` for `.555`](docs/archive/log/LOG-rotate-555.md). · [`.541` for `.556`](docs/archive/log/LOG-rotate-556.md). · [`.542` for `.557`](docs/archive/log/LOG-rotate-557.md). · [`.543` for `.558`](docs/archive/log/LOG-rotate-558.md). · [`.544` for `.559`](docs/archive/log/LOG-rotate-559.md). · [`.545` for `.560`](docs/archive/log/LOG-rotate-560.md). · [`.546` for `.561`](docs/archive/log/LOG-rotate-561.md). · [`.547` for `.562`](docs/archive/log/LOG-rotate-562.md). · [`.548` for `.563`](docs/archive/log/LOG-rotate-563.md). · [`.549` for `.564`](docs/archive/log/LOG-rotate-564.md). · [`.550` for `.565`](docs/archive/log/LOG-rotate-565.md). · [`.551` for `.566`](docs/archive/log/LOG-rotate-566.md). · [`.552` for `.567`](docs/archive/log/LOG-rotate-567.md). · [`.553` for `.568`](docs/archive/log/LOG-rotate-568.md). · [`.554` for `.569`](docs/archive/log/LOG-rotate-569.md). · [`.555` for `.570`](docs/archive/log/LOG-rotate-570.md). · [`.556` for `.571`](docs/archive/log/LOG-rotate-571.md). · [`.557` for `.572`](docs/archive/log/LOG-rotate-572.md). · [`.558` for `.573`](docs/archive/log/LOG-rotate-573.md). · [`.559` for `.574`](docs/archive/log/LOG-rotate-574.md). · [`.560` for `.575`](docs/archive/log/LOG-rotate-575.md). · [`.561` for `.576`](docs/archive/log/LOG-rotate-576.md). · [`.562` for `.577`](docs/archive/log/LOG-rotate-577.md). · [`.563` for `.578`](docs/archive/log/LOG-rotate-578.md). · [`.564` for `.579`](docs/archive/log/LOG-rotate-579.md). · [`.565` for `.580`](docs/archive/log/LOG-rotate-580.md). · [`.566` for `.581`](docs/archive/log/LOG-rotate-581.md). · [`.567` for `.582`](docs/archive/log/LOG-rotate-582.md). · [`.568` for `.583`](docs/archive/log/LOG-rotate-583.md). · [`.569` for `.584`](docs/archive/log/LOG-rotate-584.md). · [`.570` for `.585`](docs/archive/log/LOG-rotate-585.md). · [`.571` for `.586`](docs/archive/log/LOG-rotate-586.md). · [`.572` for `.587`](docs/archive/log/LOG-rotate-587.md). · [`.573` for `.588`](docs/archive/log/LOG-rotate-588.md). · [`.574` for `.589`](docs/archive/log/LOG-rotate-589.md). · [`.575` for `.590`](docs/archive/log/LOG-rotate-590.md). · [`.576` for `.591`](docs/archive/log/LOG-rotate-591.md). · [`.577` for `.592`](docs/archive/log/LOG-rotate-592.md). · [`.578` for `.593`](docs/archive/log/LOG-rotate-593.md). · [`.581` for `.596`](docs/archive/log/LOG-rotate-596.md). · [`.582` for `.597`](docs/archive/log/LOG-rotate-597.md). · [`.583` for `.598`](docs/archive/log/LOG-rotate-598.md). · [`.584` for `.599`](docs/archive/log/LOG-rotate-599.md). · [`.585` for `.600`](docs/archive/log/LOG-rotate-600.md). · [`.586` for `.601`](docs/archive/log/LOG-rotate-601.md). · [`.587` for `.602`](docs/archive/log/LOG-rotate-602.md). · [`.588` for `.603`](docs/archive/log/LOG-rotate-603.md). · [`.590` for `.606`](docs/archive/log/LOG-rotate-606.md). · [`.596` for `.612`](docs/archive/log/LOG-rotate-612.md). · [`.597` for `.613`](docs/archive/log/LOG-rotate-613.md). · [`.599` for `.614`](docs/archive/log/LOG-rotate-614.md). · [`.600` for `.615`](docs/archive/log/LOG-rotate-615.md). · [`.601` for `.616`](docs/archive/log/LOG-rotate-616.md). · [`.602` for `.617`](docs/archive/log/LOG-rotate-617.md). · [`.603` for `.618`](docs/archive/log/LOG-rotate-618.md). · [`.604` for `.619`](docs/archive/log/LOG-rotate-619.md). · [`.655` for `.670`](docs/archive/log/LOG-rotate-655-for-670.md). · [`.656` for `.679`](docs/archive/log/LOG-rotate-656-for-679.md). · [`.657` for `.680`](docs/archive/log/LOG-rotate-657-for-680.md). · [`.658` for `.684`](docs/archive/log/LOG-rotate-658-for-684.md). · [`.659` for `.685`](docs/archive/log/LOG-rotate-659-for-685.md). · [`.660` for `.689`](docs/archive/log/LOG-rotate-660-for-689.md). · [`.661` for `.690`](docs/archive/log/LOG-rotate-661-for-690.md). · [`.662` for `.691`](docs/archive/log/LOG-rotate-662-for-691.md). · [`.663` for `.692`](docs/archive/log/LOG-rotate-663-for-692.md). · [`.664` for `.693`](docs/archive/log/LOG-rotate-664-for-693.md). · [`.665` for `.694`](docs/archive/log/LOG-rotate-665-for-694.md). · [`.666` for `.695`](docs/archive/log/LOG-rotate-666-for-695.md). · [`.667` for `.696`](docs/archive/log/LOG-rotate-667-for-696.md). · [`.668` for `.697`](docs/archive/log/LOG-rotate-668-for-697.md). · [`.669` for `.714`](docs/archive/log/LOG-rotate-669-for-714.md). · [`.669` for `.743`](docs/archive/log/LOG-rotate-669-for-743.md). · [`.670` for `.743`](docs/archive/log/LOG-rotate-670-for-743.md). · [`.669` for `.744`](docs/archive/log/LOG-rotate-669-for-744.md). · [`.679` for `.744`](docs/archive/log/LOG-rotate-679-for-744.md). · [`.680` for `.745`](docs/archive/log/LOG-rotate-680-for-745.md). · [`.684` for `.746`](docs/archive/log/LOG-rotate-684-for-746.md). · [`.750` for `.765`](docs/archive/log/LOG-rotate-750-for-765.md). · [`.753` for `.768`](docs/archive/log/LOG-rotate-753-for-768.md). · [`.762` for `.777`](docs/archive/log/LOG-rotate-762-for-777.md). · [`.765` for `.780`](docs/archive/log/LOG-rotate-765-for-780.md). · [`.766` for `.781`](docs/archive/log/LOG-rotate-766-for-781.md). · [`.767` for form-object-kit](docs/archive/log/LOG-rotate-767-for-form-object-kit.md). · [`.768` for `.782`](docs/archive/log/LOG-rotate-768-for-782.md). · [`.769` for `.783`](docs/archive/log/LOG-rotate-769-for-783.md). · [`.770` for `.784`](docs/archive/log/LOG-rotate-770-for-784.md). · [`.771` for `.785`](docs/archive/log/LOG-rotate-771-for-785.md). · [`.772` for `.786`](docs/archive/log/LOG-rotate-772-for-786.md). · [`.773` for `.787`](docs/archive/log/LOG-rotate-773-for-787.md). · [`.774` for `.788`](docs/archive/log/LOG-rotate-774-for-788.md). · [`.775` for `.789`](docs/archive/log/LOG-rotate-775-for-789.md). · [`.776` for `.790`](docs/archive/log/LOG-rotate-776-for-790.md). · [`.777` for `.791`](docs/archive/log/LOG-rotate-777-for-791.md). · [`.778` for `.792`](docs/archive/log/LOG-rotate-778-for-792.md). · [`.826` for `.841`](docs/archive/log/LOG-rotate-826-for-841.md). · [`.827` for `.842`](docs/archive/log/LOG-rotate-827-for-842.md). · [`.829` for `.844`](docs/archive/log/LOG-rotate-829-for-844.md). · [`.830` for `.845`](docs/archive/log/LOG-rotate-830-for-845.md). · [`.831` for `.846`](docs/archive/log/LOG-rotate-831-for-846.md). · [`.828` for `.843`](docs/archive/log/LOG-rotate-828-for-843.md). · [`.832` for `.847`](docs/archive/log/LOG-rotate-832-for-847.md). · [`.833` for `.848`](docs/archive/log/LOG-rotate-833-for-848.md). · [`.834` for `.849`](docs/archive/log/LOG-rotate-834-for-849.md). · [`.862` for `.880`](docs/archive/log/LOG-rotate-862-for-880.md). · [`.863` for `.881`](docs/archive/log/LOG-rotate-863-for-881.md). · [`.864` for `.882`](docs/archive/log/LOG-rotate-864-for-882.md). · [`.865` for `.883`](docs/archive/log/LOG-rotate-865-for-883.md). · [`.866` for `.884`](docs/archive/log/LOG-rotate-866-for-884.md). · [`.867` for `.885`](docs/archive/log/LOG-rotate-867-for-885.md). · [`.868` for `.886`](docs/archive/log/LOG-rotate-868-for-886.md). · [`.869` for `.887`](docs/archive/log/LOG-rotate-869-for-887.md). · [`.870` for `.888`](docs/archive/log/LOG-rotate-870-for-888.md). · [`.871` for `.889`](docs/archive/log/LOG-rotate-871-for-889.md). · [`.872` for `.890`](docs/archive/log/LOG-rotate-872-for-890.md). · [`.873` for `.891`](docs/archive/log/LOG-rotate-873-for-891.md). · [`.874` for `.892`](docs/archive/log/LOG-rotate-874-for-892.md). · [`.875` for `.893`](docs/archive/log/LOG-rotate-875-for-893.md). · [`.876` for `.894`](docs/archive/log/LOG-rotate-876-for-894.md). · [`.880` for `.895`](docs/archive/log/LOG-rotate-880-for-895.md). · [`.881` for `.896`](docs/archive/log/LOG-rotate-881-for-896.md). · [`.882` for `.897`](docs/archive/log/LOG-rotate-882-for-897.md). · [`.883` for `.898`](docs/archive/log/LOG-rotate-883-for-898.md). · [`.884` for `.899`](docs/archive/log/LOG-rotate-884-for-899.md). · [`.885` for `.900`](docs/archive/log/LOG-rotate-885-for-900.md). · [`.886` for `.901`](docs/archive/log/LOG-rotate-886-for-901.md). · [`.887` for `.902`](docs/archive/log/LOG-rotate-887-for-902.md). · [`.888` for `.903`](docs/archive/log/LOG-rotate-888-for-903.md). · [`.889` for `.904`](docs/archive/log/LOG-rotate-889-for-904.md). · [`.890` for `.905`](docs/archive/log/LOG-rotate-890-for-905.md). · [`.891` for `.906`](docs/archive/log/LOG-rotate-891-for-906.md). · [`.892` for `.907`](docs/archive/log/LOG-rotate-892-for-907.md). · [`.893` for `.908`](docs/archive/log/LOG-rotate-893-for-908.md). · [`.894` for `.909`](docs/archive/log/LOG-rotate-894-for-909.md). · [`.895` for `.910`](docs/archive/log/LOG-rotate-895-for-910.md). · [`.896` for `.911`](docs/archive/log/LOG-rotate-896-for-911.md). · [`.897` for `.912`](docs/archive/log/LOG-rotate-897-for-912.md). · [`.898` for `.913`](docs/archive/log/LOG-rotate-898-for-913.md). · [`.899` for `.914`](docs/archive/log/LOG-rotate-899-for-914.md). · [`.900` for `.915`](docs/archive/log/LOG-rotate-900-for-915.md). · [`.901` for `.916`](docs/archive/log/LOG-rotate-901-for-916.md). · [`.902` for `.917`](docs/archive/log/LOG-rotate-902-for-917.md). · [`.903` for `.918`](docs/archive/log/LOG-rotate-903-for-918.md). · [`.904` for `.919`](docs/archive/log/LOG-rotate-904-for-919.md). · [`.905` for `.920`](docs/archive/log/LOG-rotate-905-for-920.md). · [`.906` for `.921`](docs/archive/log/LOG-rotate-906-for-921.md). · [`.907` for `.922`](docs/archive/log/LOG-rotate-907-for-922.md). · [`.908` for `.923`](docs/archive/log/LOG-rotate-908-for-923.md). · [`.909` for `.924`](docs/archive/log/LOG-rotate-909-for-924.md). · [`.910` for `.925`](docs/archive/log/LOG-rotate-910-for-925.md). · [`.911` for `.926`](docs/archive/log/LOG-rotate-911-for-926.md). · [`.912` for `.927`](docs/archive/log/LOG-rotate-912-for-927.md). · [`.913` for `.928`](docs/archive/log/LOG-rotate-913-for-928.md). · [`.914` for `.929`](docs/archive/log/LOG-rotate-914-for-929.md). · [`.915` for `.930`](docs/archive/log/LOG-rotate-915-for-930.md). · [`.916` for `.933`](docs/archive/log/LOG-rotate-916-for-933.md). · [`.917` for `.934`](docs/archive/log/LOG-rotate-917-for-934.md). · [`.919` for `.939`](docs/archive/log/LOG-rotate-919-for-939.md). · [`.920` for `.940`](docs/archive/log/LOG-rotate-920-for-940.md). · [`.921` for `.941`](docs/archive/log/LOG-rotate-921-for-941.md). · [`.922` for `.942`](docs/archive/log/LOG-rotate-922-for-942.md). · [`.923` for `.943`](docs/archive/log/LOG-rotate-923-for-943.md). · [`.925` for `.945`](docs/archive/log/LOG-rotate-925-for-945.md). · [`.924` for `.944`](docs/archive/log/LOG-rotate-924-for-944.md). · [`.927` for `.947`](docs/archive/log/LOG-rotate-927-for-947.md). · [`.928` for `.949`](docs/archive/log/LOG-rotate-928-for-949.md). · [`.929` for `.950`](docs/archive/log/LOG-rotate-929-for-950.md). · [`.930` for `.951`](docs/archive/log/LOG-rotate-930-for-951.md). · [`.933` for `.952`](docs/archive/log/LOG-rotate-933-for-952.md). · [`.934` for `.953`](docs/archive/log/LOG-rotate-934-for-953.md). · [`.940` for `.956`](docs/archive/log/LOG-rotate-940-for-956.md). · [`.941` for `.957`](docs/archive/log/LOG-rotate-941-for-957.md). · [`.942` for `.958`](docs/archive/log/LOG-rotate-942-for-958.md). · [`.943` for `.959`](docs/archive/log/LOG-rotate-943-for-959.md). · [`.944` for `.960`](docs/archive/log/LOG-rotate-944-for-960.md). · [`.945` for `.961`](docs/archive/log/LOG-rotate-945-for-961.md). · [`.946` for `.963`](docs/archive/log/LOG-rotate-946-for-963.md). · [`.947` for `.965`](docs/archive/log/LOG-rotate-947-for-965.md). · [`.950` for `.970`](docs/archive/log/LOG-rotate-950-for-970.md).

## 2026-08-25 — Free set tags (`.970`)

Kind already lived on the set
(`warmup` / `drop` / `failure`). Volume,
PR, e1RM, vs-last, and the why-line
already skipped warmup. The row did not
show the tags, and Wednesday / Repeat
last / Prev still copied a 40 kg warmup
as next week's work. That poisons week-4.

**Ship:** optional W / D / F on the set
row. Tap again clears to work. Log set
never waits. Forgotten warmup can be
marked after Log set, before Finish.
Prev / vs-last / why-line / Wednesday /
Repeat last ignore warmup. Warmup-only
exercise or session invents nothing.
Tags are free. No auto warmup formulas.
Guest. First set ungated. Today still
one Start. Resume `.963` kept. Fuel
`.965` stays off Today. RPE `.967`
stays. `/private` stays the tight lock.
No `PRIVATE_MODE` flip. Concern `.966`.
Skips `.968` / `.969`.

Label `.970` (past master `.967`). Live
www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-950-for-970.md](docs/archive/log/LOG-rotate-950-for-970.md).

## 2026-08-25 — RPE / RIR on the set row (`.967`)

After tags, vs-last / why / Wednesday
still treated a grind like a warmup.
Easy/Med/Hard and RIR 0–5 were on the
row; 1–10 RPE was not, and cites never
quoted last work-set intensity.

**Ship:** optional RPE 1–10 and/or RIR
on a logged set. Never required to save.
Cite / why / Wednesday quote the last
work set's numbers when present. Empty
stays empty. No invented number from
Easy/Med/Hard. Guest. First set ungated.
Today still one Start. Resume `.963`
kept. Fuel `.965` stays off Today.
`/private` stays the tight lock.
No `PRIVATE_MODE` flip. Skips `.966`
(set tags) and `.968` (honesty rebase).

Label `.967` (past master `.965`). Live
www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-949-for-967.md](docs/archive/log/LOG-rotate-949-for-967.md).

## 2026-08-25 — This week's restock they take (`.965`)

They already name meals on Fuel. A messy typed
list is the other honest input. The list they
take to the shop was still missing.

**Ship:** Fuel Show more assembles this local
week's logged meals (exact recipe names explode
catalog ingredients; free-typed logs stay as
named) plus an optional messy extras list. Copy
and download only. No URL. No Place Order. Not
on Today, Train, or `/private`. Empty invents
nothing. Guest. First set ungated. Today still
one Start. `/private` stays the tight lock. No
`PRIVATE_MODE` flip.

Label `.965` (past master `.963`; `.964` reserved).
Live www stays `.696`. Keeps resume `.963`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-947-for-965.md](docs/archive/log/LOG-rotate-947-for-965.md).

## 2026-08-25 — Resume / finish-partial (`.963`)

Week strip + Wednesday + receipt give them
three other screens. Week-4 dies when they
open the strip and the active set is gone.
Strong: Finish with leftover sets is OK.
Their fail is Session Expired / Force Sync.

**Ship:** leave Today / week / Wednesday /
a receipt, come back, same session. Finish
keeps the sets they logged; leftover empty
sets invent no volume. Empty invents
nothing. Guest. First set ungated. Today
still one Start. `/private` stays the tight
lock. No `PRIVATE_MODE` flip. Skips `.962`.

Label `.963` (past master `.961`). Live www
stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-946-for-963.md](docs/archive/log/LOG-rotate-946-for-963.md).

## 2026-08-25 — Quiet week strip (`.961`)

Today + Wednesday + missed-day re-entry
were on git. Week-4 still saw Mon–Sun
only through Coach Show all, which marked
holes.

**Ship:** one quiet Mon–Sun glance on Today.
Done days marked. Empty days stay empty.
Next Start is still the one Start. No shame
✕. Guest. First set ungated. Blank notebook
valid. Saved routine still owns Start.
Wednesday still a cite. `/private` stays
the tight lock. No `PRIVATE_MODE` flip.

Label `.961` (past master `.960`). Live www
stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-945-for-961.md](docs/archive/log/LOG-rotate-945-for-961.md).

## 2026-08-25 — Honor the notebook (`.960`)

`.955` names Wednesday from the diary.
Strong migrants already have a program.
Start was loading Just Go / last-log over
their saved PPL.

**Ship:** save the routine they just did
(or typed, or picked from History) under
a name they recognize. Start uses it.
Wednesday cite does not overwrite a saved
PPL. Blank notebook still logs — no plan
wall. Confirm-gated. Guest. First set
ungated. Today still one Start. `/private`
stays the tight lock. No `PRIVATE_MODE`
flip.

Label `.960` (past master `.959`). Live www
stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-944-for-960.md](docs/archive/log/LOG-rotate-944-for-960.md).

## 2026-08-24 — Swap / skip this exercise, this session (`.959`)

Wednesday and Today cite already named the
session. A taken cable still stalled the logger.
Remove discarded work. Garage swap was 1–2
stand-ins and could rewrite the plan.

**Ship:** skip or swap this exercise once, this
session. Skip leaves the rest and does not fail
the finish. Swap does not change Wednesday or
saved routines. Confirm-gated. Guest. First set
ungated. Today still one Start. `/private` stays
the tight lock. No `PRIVATE_MODE` flip.

Label `.959` (past master `.958`). Live www
stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-943-for-959.md](docs/archive/log/LOG-rotate-943-for-959.md).

## 2026-08-24 — Desk → gym, one session (`.958`)

Completed history already synced. The *open*
session stayed on one device's persist, so
Start on a laptop was a new empty Train on
the phone.

**Ship:** one `clientId` for the in-progress
session. Signed-in desk Start continues on
phone Train (or clearly resumes). Guest stays
local until sign-in. No Force Sync. Finish
tombstones so the other surface does not
reopen it. Confirm before replacing local
logged work. `/private` stays the tight lock.
No `PRIVATE_MODE` flip.

Label `.958` (past master `.957`). Live www
stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-942-for-958.md](docs/archive/log/LOG-rotate-942-for-958.md).

## 2026-08-24 — Restore the tight /private lock (`.957`)

`#778` (`.942`) mounted SET → ANYWHERE → WEEK
→ DOOR on `/private`. Founder refused that
as first paint. Live `.696` density is the
one they want: hero + notify + enter-with-code.

**Ship:** unmount `CinematicWww` from
`GateTeaser`. Restore the pre-`.942` tight
lock with the `#776` pack: **Log a set.
Offline.** · **No account. No wearable.**
· Free · Get notified · Enter with code.
F-039 aliases and `/notify` stay. Cookie
`/` stays `.696`. No `PRIVATE_MODE` flip.

Label `.957` (past master `.956`).
Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-941-for-957.md](docs/archive/log/LOG-rotate-941-for-957.md).

## 2026-08-24 — E-Victory close receipt (`.956`)

`.944` already compared vs last by shape.
The lift table still lived in Show all, so
the close was not a keepable “I was here.”

**Ship:** first paint is the private receipt
(sets, load, vs last if we have it, duration
if we have it). Stay, screenshot, or save a
device copy. Empty session invents none.
Guest. No public permalink. Today / next-day
cites untouched. No `PRIVATE_MODE` flip.

Label `.956` (past master `.955`). Live www
stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-940-for-956.md](docs/archive/log/LOG-rotate-940-for-956.md).

## 2026-08-24 — Wednesday from their logs (`.955`)

Today's Start already cites last + next for this
visit. The next *day* (Wednesday) was still a
re-roll, a repeat-last, or silence without a plan.

**Ship:** stable next day from the live diary.
Same diary + same now ⇒ same Wednesday. Live plan
owning the next calendar day wins. Empty invents
nothing. Coach (boss-adjacent / Show all), not a
second Today Start. Logs start from their own
prior template. First set ungated. Guest. No
`PRIVATE_MODE` flip.

Label `.955` (past master `.954`). Live www
stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-939-for-955.md](docs/archive/log/LOG-rotate-939-for-955.md).

## 2026-08-24 — Today return path: one Start, last/next on it (`.954`)

Returning Today already had one Start. Last and
next lived on pins / the button label, not on
that hero. Coach week was already in Show all.

**Ship:** last + next sit on the Start as quiet
cite. Empty history invents nothing. Planned-miss
and reentry still own their line. Coach stays
collapsed. One `.primary-action`. Guest. No
`PRIVATE_MODE` flip.

Label `.954` (past master `.953`). Live www
stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-938-for-954.md](docs/archive/log/LOG-rotate-938-for-954.md).

## 2026-08-24 — MW export re-imports (round-trip) (`.953`)

Account export was Strong + Hevy set-table
only. `workoutsToMwCsv` existed; our file
could not come back from the card.

**Ship:** MW native CSV on the same Account
door. Preview, then confirm. Re-import of
the same dump is a no-op. Existing native
sessions win. Guest. No one-import cap.
Strong / Hevy paths unchanged. No
`PRIVATE_MODE` flip.

Label `.953` (past master `.952`). Live www
stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-934-for-953.md](docs/archive/log/LOG-rotate-934-for-953.md).

## 2026-08-24 — Fix ProfileImportCard failRead comma (`.952`)

`.951` Preview died: `failRead` toast
object missing a comma after the
`description` ternary.

**Ship:** add the comma. One file.

Label `.952` (past master `.951`). No `PRIVATE_MODE` flip.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-933-for-952.md](docs/archive/log/LOG-rotate-933-for-952.md).

## 2026-08-24 — Hevy-native diary in (`.951`)

`.947` landed the Hevy workout CSV. The
measurements half of Hevy's official diary
(`measurement_data.csv` — wide `date` /
`weight_kg` / `fat_percent`) still bounced.

**Ship:** same Account door. Preview, then
confirm. Measurements merge into body metrics;
existing native fields win. Workout-only stays
`.947`. Guest path. No one-import cap. No zip.
No export-layout vanity. Plate math stays `#786`.

Label `.951` (past master `.950` plate math). No `PRIVATE_MODE` flip.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-930-for-951.md](docs/archive/log/LOG-rotate-930-for-951.md).
