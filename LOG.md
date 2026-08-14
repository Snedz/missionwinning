# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md) · [`.283` for `.298`](docs/archive/log/LOG-rotate-298.md) · [`.284` for `.299`](docs/archive/log/LOG-rotate-299.md) · [`.285` for `.300`](docs/archive/log/LOG-rotate-300.md) · [`.286` for `.301`](docs/archive/log/LOG-rotate-301.md) · [`.287` for `.302`](docs/archive/log/LOG-rotate-302.md) · [`.288` for `.303`](docs/archive/log/LOG-rotate-303.md) · [`.289` for `.304`](docs/archive/log/LOG-rotate-304.md) · [`.290` for `.305`](docs/archive/log/LOG-rotate-305.md) · [`.291` for `.306`](docs/archive/log/LOG-rotate-306.md) · [`.292` for `.307`](docs/archive/log/LOG-rotate-307.md) · [`.293` for `.308`](docs/archive/log/LOG-rotate-308.md) · [`.294` for `.309`](docs/archive/log/LOG-rotate-309.md) · [`.295` for `.310`](docs/archive/log/LOG-rotate-310.md) · [`.296` for `.311`](docs/archive/log/LOG-rotate-311.md) · [`.297` for `.312`](docs/archive/log/LOG-rotate-312.md) · [`.298` for `.313`](docs/archive/log/LOG-rotate-313.md) · [`.299` for `.314`](docs/archive/log/LOG-rotate-314.md) · [`.300` for `.315`](docs/archive/log/LOG-rotate-315.md). · [`.301` for `.316`](docs/archive/log/LOG-rotate-316.md). · [`.302` for `.317`](docs/archive/log/LOG-rotate-317.md). · [`.303` for `.318`](docs/archive/log/LOG-rotate-318.md). · [`.304` for `.319`](docs/archive/log/LOG-rotate-319.md). · [`.305` for `.320`](docs/archive/log/LOG-rotate-320.md). · [`.306` for `.321`](docs/archive/log/LOG-rotate-321.md). · [`.307` for `.322`](docs/archive/log/LOG-rotate-322.md). · [`.308` for `.323`](docs/archive/log/LOG-rotate-323.md). · [`.309` for `.324`](docs/archive/log/LOG-rotate-324.md). · [`.310` for `.325`](docs/archive/log/LOG-rotate-325.md). · [`.311` for `.326`](docs/archive/log/LOG-rotate-326.md). · [`.312` for `.327`](docs/archive/log/LOG-rotate-327.md). · [`.313` for `.328`](docs/archive/log/LOG-rotate-328.md). · [`.314` for `.329`](docs/archive/log/LOG-rotate-329.md). · [`.315` for `.330`](docs/archive/log/LOG-rotate-330.md). · [`.316` for `.331`](docs/archive/log/LOG-rotate-331.md). · [`.317` for `.332`](docs/archive/log/LOG-rotate-332.md). · [`.318` for `.333`](docs/archive/log/LOG-rotate-333.md). · [`.319` for `.334`](docs/archive/log/LOG-rotate-334.md). · [`.320` for `.335`](docs/archive/log/LOG-rotate-335.md). · [`.321` for `.336`](docs/archive/log/LOG-rotate-336.md). · [`.322` for `.337`](docs/archive/log/LOG-rotate-337.md). · [`.323` for `.338`](docs/archive/log/LOG-rotate-338.md). · [`.324` for `.339`](docs/archive/log/LOG-rotate-339.md). · [`.325` for `.340`](docs/archive/log/LOG-rotate-340.md). · [`.326` for `.341`](docs/archive/log/LOG-rotate-341.md). · [`.327` for `.342`](docs/archive/log/LOG-rotate-342.md). · [`.328` for `.343`](docs/archive/log/LOG-rotate-343.md). · [`.329` for `.344`](docs/archive/log/LOG-rotate-344.md). · [`.330` for `.345`](docs/archive/log/LOG-rotate-345.md). · [`.331` for `.346`](docs/archive/log/LOG-rotate-346.md). · [`.332` for `.347`](docs/archive/log/LOG-rotate-347.md). · [`.333` for `.348`](docs/archive/log/LOG-rotate-348.md). · [`.334` for `.349`](docs/archive/log/LOG-rotate-349.md). · [`.335` for `.350`](docs/archive/log/LOG-rotate-350.md). · [`.336` for `.351`](docs/archive/log/LOG-rotate-351.md). · [`.337` for `.352`](docs/archive/log/LOG-rotate-352.md). · [`.338` for `.353`](docs/archive/log/LOG-rotate-353.md). · [`.339` for `.354`](docs/archive/log/LOG-rotate-354.md). · [`.340` for `.355`](docs/archive/log/LOG-rotate-355.md). · [`.341` for `.356`](docs/archive/log/LOG-rotate-356.md). · [`.342` for `.357`](docs/archive/log/LOG-rotate-357.md). · [`.343` for `.358`](docs/archive/log/LOG-rotate-358.md). · [`.344` for `.359`](docs/archive/log/LOG-rotate-359.md). · [`.345` for `.360`](docs/archive/log/LOG-rotate-360.md). · [`.346` for `.361`](docs/archive/log/LOG-rotate-361.md). · [`.347` for `.362`](docs/archive/log/LOG-rotate-362.md). · [`.348` for `.363`](docs/archive/log/LOG-rotate-363.md). · [`.349` for `.364`](docs/archive/log/LOG-rotate-364.md). · [`.350` for `.365`](docs/archive/log/LOG-rotate-365.md). · [`.351` for `.366`](docs/archive/log/LOG-rotate-366.md). · [`.352` for `.367`](docs/archive/log/LOG-rotate-367.md). · [`.353` for `.368`](docs/archive/log/LOG-rotate-368.md). · [`.354` for `.369`](docs/archive/log/LOG-rotate-369.md). · [`.355` for `.370`](docs/archive/log/LOG-rotate-370.md). · [`.356` for `.371`](docs/archive/log/LOG-rotate-371.md). · [`.357` for `.372`](docs/archive/log/LOG-rotate-372.md). · [`.358` for `.373`](docs/archive/log/LOG-rotate-373.md). · [`.359` for `.374`](docs/archive/log/LOG-rotate-374.md). · [`.360` for `.375`](docs/archive/log/LOG-rotate-375.md). · [`.361` for `.376`](docs/archive/log/LOG-rotate-376.md). · [`.362` for `.377`](docs/archive/log/LOG-rotate-377.md). · [`.363` for `.378`](docs/archive/log/LOG-rotate-378.md). · [`.364` for `.379`](docs/archive/log/LOG-rotate-379.md). · [`.365` for `.380`](docs/archive/log/LOG-rotate-380.md). · [`.366` for `.381`](docs/archive/log/LOG-rotate-381.md). · [`.367` for `.382`](docs/archive/log/LOG-rotate-382.md). · [`.368` for `.383`](docs/archive/log/LOG-rotate-383.md). · [`.369` for `.384`](docs/archive/log/LOG-rotate-384.md). · [`.370` for `.385`](docs/archive/log/LOG-rotate-385.md). · [`.371` for `.386`](docs/archive/log/LOG-rotate-386.md). · [`.372` for `.387`](docs/archive/log/LOG-rotate-387.md). · [`.373` for `.388`](docs/archive/log/LOG-rotate-388.md). · [`.374` for `.389`](docs/archive/log/LOG-rotate-389.md). · [`.375` for `.390`](docs/archive/log/LOG-rotate-390.md). · [`.376` for `.391`](docs/archive/log/LOG-rotate-391.md). · [`.377` for `.392`](docs/archive/log/LOG-rotate-392.md). · [`.378` for `.393`](docs/archive/log/LOG-rotate-393.md). · [`.379` for `.394`](docs/archive/log/LOG-rotate-394.md). · [`.380` for `.395`](docs/archive/log/LOG-rotate-395.md). · [`.381` for `.396`](docs/archive/log/LOG-rotate-396.md). · [`.382` for `.397`](docs/archive/log/LOG-rotate-397.md). · [`.383` for `.398`](docs/archive/log/LOG-rotate-398.md). · [`.384` for `.399`](docs/archive/log/LOG-rotate-399.md). · [`.385` for `.400`](docs/archive/log/LOG-rotate-400.md). · [`.386` for `.401`](docs/archive/log/LOG-rotate-401.md). · [`.387` for `.402`](docs/archive/log/LOG-rotate-402.md). · [`.388` for `.403`](docs/archive/log/LOG-rotate-403.md). · [`.389` for `.404`](docs/archive/log/LOG-rotate-404.md). · [`.390` for `.405`](docs/archive/log/LOG-rotate-405.md). · [`.391` for `.406`](docs/archive/log/LOG-rotate-406.md). · [`.392` for `.407`](docs/archive/log/LOG-rotate-407.md). · [`.393` for `.408`](docs/archive/log/LOG-rotate-408.md). · [`.394` for `.409`](docs/archive/log/LOG-rotate-409.md). · [`.395` for `.410`](docs/archive/log/LOG-rotate-410.md). · [`.396` for `.411`](docs/archive/log/LOG-rotate-411.md). · [`.397` for `.412`](docs/archive/log/LOG-rotate-412.md). · [`.398` for `.413`](docs/archive/log/LOG-rotate-413.md). · [`.399` for `.414`](docs/archive/log/LOG-rotate-414.md). · [`.400` for `.415`](docs/archive/log/LOG-rotate-415.md). · [`.401` for `.416`](docs/archive/log/LOG-rotate-416.md). · [`.402` for `.417`](docs/archive/log/LOG-rotate-417.md). · [`.403` for `.418`](docs/archive/log/LOG-rotate-418.md). · [`.404` for `.419`](docs/archive/log/LOG-rotate-419.md). · [`.405` for `.420`](docs/archive/log/LOG-rotate-420.md). · [`.406` for `.421`](docs/archive/log/LOG-rotate-421.md). · [`.407` for `.422`](docs/archive/log/LOG-rotate-422.md). · [`.408` for `.423`](docs/archive/log/LOG-rotate-423.md). · [`.409` for `.424`](docs/archive/log/LOG-rotate-424.md). · [`.410` for `.425`](docs/archive/log/LOG-rotate-425.md). · [`.411` for `.426`](docs/archive/log/LOG-rotate-426.md). · [`.412` for `.427`](docs/archive/log/LOG-rotate-427.md). · [`.413` for `.428`](docs/archive/log/LOG-rotate-428.md). · [`.414` for `.429`](docs/archive/log/LOG-rotate-429.md). · [`.415` for `.430`](docs/archive/log/LOG-rotate-430.md). · [`.416` for `.431`](docs/archive/log/LOG-rotate-431.md). · [`.417` for `.432`](docs/archive/log/LOG-rotate-432.md). · [`.418` for `.433`](docs/archive/log/LOG-rotate-433.md). · [`.419` for `.434`](docs/archive/log/LOG-rotate-434.md). · [`.420` for `.435`](docs/archive/log/LOG-rotate-435.md). · [`.421` for `.436`](docs/archive/log/LOG-rotate-436.md). · [`.422` for `.437`](docs/archive/log/LOG-rotate-437.md). · [`.423` for `.438`](docs/archive/log/LOG-rotate-438.md). · [`.424` for `.439`](docs/archive/log/LOG-rotate-439.md). · [`.425` for `.440`](docs/archive/log/LOG-rotate-440.md). · [`.426` for `.441`](docs/archive/log/LOG-rotate-441.md). · [`.427` for `.442`](docs/archive/log/LOG-rotate-442.md). · [`.428` for `.443`](docs/archive/log/LOG-rotate-443.md). · [`.429` for `.444`](docs/archive/log/LOG-rotate-444.md). · [`.430` for `.445`](docs/archive/log/LOG-rotate-445.md). · [`.431` for `.446`](docs/archive/log/LOG-rotate-446.md). · [`.432` for `.447`](docs/archive/log/LOG-rotate-447.md). · [`.433` for `.448`](docs/archive/log/LOG-rotate-448.md). · [`.434` for `.449`](docs/archive/log/LOG-rotate-449.md). · [`.435` for `.450`](docs/archive/log/LOG-rotate-450.md). · [`.436` for `.451`](docs/archive/log/LOG-rotate-451.md). · [`.437` for `.452`](docs/archive/log/LOG-rotate-452.md). · [`.438` for `.453`](docs/archive/log/LOG-rotate-453.md). · [`.439` for `.454`](docs/archive/log/LOG-rotate-454.md). · [`.440` for `.455`](docs/archive/log/LOG-rotate-455.md). · [`.441` for `.456`](docs/archive/log/LOG-rotate-456.md). · [`.442` for `.457`](docs/archive/log/LOG-rotate-457.md). · [`.443` for `.458`](docs/archive/log/LOG-rotate-458.md). · [`.444` for `.459`](docs/archive/log/LOG-rotate-459.md). · [`.445` for `.460`](docs/archive/log/LOG-rotate-460.md). · [`.446` for `.461`](docs/archive/log/LOG-rotate-461.md). · [`.447` for `.462`](docs/archive/log/LOG-rotate-462.md). · [`.448` for `.463`](docs/archive/log/LOG-rotate-463.md). · [`.449` for `.464`](docs/archive/log/LOG-rotate-464.md). · [`.450` for `.465`](docs/archive/log/LOG-rotate-465.md). · [`.451` for `.466`](docs/archive/log/LOG-rotate-466.md). · [`.452` for `.467`](docs/archive/log/LOG-rotate-467.md). · [`.453` for `.468`](docs/archive/log/LOG-rotate-468.md). · [`.454` for `.469`](docs/archive/log/LOG-rotate-469.md). · [`.455` for `.470`](docs/archive/log/LOG-rotate-470.md). · [`.456` for `.471`](docs/archive/log/LOG-rotate-471.md). · [`.457` for `.472`](docs/archive/log/LOG-rotate-472.md). · [`.458` for `.473`](docs/archive/log/LOG-rotate-473.md). · [`.459` for `.474`](docs/archive/log/LOG-rotate-474.md). · [`.460` for `.475`](docs/archive/log/LOG-rotate-475.md). · [`.461` for `.476`](docs/archive/log/LOG-rotate-476.md). · [`.462` for `.477`](docs/archive/log/LOG-rotate-477.md). · [`.463` for `.478`](docs/archive/log/LOG-rotate-478.md). · [`.464` for `.479`](docs/archive/log/LOG-rotate-479.md). · [`.465` for `.480`](docs/archive/log/LOG-rotate-480.md). · [`.466` for `.481`](docs/archive/log/LOG-rotate-481.md). · [`.467` for `.482`](docs/archive/log/LOG-rotate-482.md). · [`.468` for `.483`](docs/archive/log/LOG-rotate-483.md). · [`.469` for `.484`](docs/archive/log/LOG-rotate-484.md). · [`.470` for `.485`](docs/archive/log/LOG-rotate-485.md). · [`.471` for `.486`](docs/archive/log/LOG-rotate-486.md). · [`.472` for `.487`](docs/archive/log/LOG-rotate-487.md). · [`.473` for `.488`](docs/archive/log/LOG-rotate-488.md). · [`.474` for `.489`](docs/archive/log/LOG-rotate-489.md). · [`.475` for `.490`](docs/archive/log/LOG-rotate-490.md). · [`.476` for `.491`](docs/archive/log/LOG-rotate-491.md). · [`.477` for `.492`](docs/archive/log/LOG-rotate-492.md). · [`.478` for `.493`](docs/archive/log/LOG-rotate-493.md). · [`.479` for `.494`](docs/archive/log/LOG-rotate-494.md). · [`.480` for `.495`](docs/archive/log/LOG-rotate-495.md). · [`.481` for `.496`](docs/archive/log/LOG-rotate-496.md). · [`.482` for `.497`](docs/archive/log/LOG-rotate-497.md). · [`.483` for `.498`](docs/archive/log/LOG-rotate-498.md). · [`.484` for `.499`](docs/archive/log/LOG-rotate-499.md). · [`.485` for `.500`](docs/archive/log/LOG-rotate-500.md). · [`.486` for `.501`](docs/archive/log/LOG-rotate-501.md). · [`.487` for `.502`](docs/archive/log/LOG-rotate-502.md). · [`.488` for `.503`](docs/archive/log/LOG-rotate-503.md). · [`.490` for `.505`](docs/archive/log/LOG-rotate-505.md). · [`.491` for `.506`](docs/archive/log/LOG-rotate-506.md). · [`.579` for `.594`](docs/archive/log/LOG-rotate-594.md). · [`.580` for `.595`](docs/archive/log/LOG-rotate-595.md).


--- · [`.492` for `.507`](docs/archive/log/LOG-rotate-507.md). · [`.493` for `.508`](docs/archive/log/LOG-rotate-508.md). · [`.494` for `.509`](docs/archive/log/LOG-rotate-509.md). · [`.495` for `.510`](docs/archive/log/LOG-rotate-510.md). · [`.496` for `.511`](docs/archive/log/LOG-rotate-511.md). · [`.497` for `.512`](docs/archive/log/LOG-rotate-512.md). · [`.498` for `.513`](docs/archive/log/LOG-rotate-513.md). · [`.499` for `.514`](docs/archive/log/LOG-rotate-514.md). · [`.500` for `.515`](docs/archive/log/LOG-rotate-515.md). · [`.501` for `.516`](docs/archive/log/LOG-rotate-516.md). · [`.502` for `.517`](docs/archive/log/LOG-rotate-517.md). · [`.503` for `.518`](docs/archive/log/LOG-rotate-518.md). · [`.504` for `.519`](docs/archive/log/LOG-rotate-519.md). · [`.505` for `.520`](docs/archive/log/LOG-rotate-520.md). · [`.506` for `.521`](docs/archive/log/LOG-rotate-521.md). · [`.507` for `.522`](docs/archive/log/LOG-rotate-522.md). · [`.508` for `.523`](docs/archive/log/LOG-rotate-523.md). · [`.509` for `.524`](docs/archive/log/LOG-rotate-524.md). · [`.510` for `.525`](docs/archive/log/LOG-rotate-525.md). · [`.511` for `.526`](docs/archive/log/LOG-rotate-526.md). · [`.512` for `.527`](docs/archive/log/LOG-rotate-527.md). · [`.513` for `.528`](docs/archive/log/LOG-rotate-528.md). · [`.514` for `.529`](docs/archive/log/LOG-rotate-529.md). · [`.515` for `.530`](docs/archive/log/LOG-rotate-530.md). · [`.516` for `.531`](docs/archive/log/LOG-rotate-531.md). · [`.517` for `.532`](docs/archive/log/LOG-rotate-532.md). · [`.518` for `.533`](docs/archive/log/LOG-rotate-533.md). · [`.519` for `.534`](docs/archive/log/LOG-rotate-534.md). · [`.520` for `.535`](docs/archive/log/LOG-rotate-535.md). · [`.521` for `.536`](docs/archive/log/LOG-rotate-536.md). · [`.522` for `.537`](docs/archive/log/LOG-rotate-537.md). · [`.523` for `.538`](docs/archive/log/LOG-rotate-538.md). · [`.524` for `.539`](docs/archive/log/LOG-rotate-539.md). · [`.525` for `.540`](docs/archive/log/LOG-rotate-540.md). · [`.526` for `.541`](docs/archive/log/LOG-rotate-541.md). · [`.527` for `.542`](docs/archive/log/LOG-rotate-542.md). · [`.528` for `.543`](docs/archive/log/LOG-rotate-543.md). · [`.529` for `.544`](docs/archive/log/LOG-rotate-544.md). · [`.530` for `.545`](docs/archive/log/LOG-rotate-545.md). · [`.531` for `.546`](docs/archive/log/LOG-rotate-546.md). · [`.532` for `.547`](docs/archive/log/LOG-rotate-547.md). · [`.533` for `.548`](docs/archive/log/LOG-rotate-548.md). · [`.534` for `.549`](docs/archive/log/LOG-rotate-549.md). · [`.535` for `.550`](docs/archive/log/LOG-rotate-550.md). · [`.536` for `.551`](docs/archive/log/LOG-rotate-551.md). · [`.537` for `.552`](docs/archive/log/LOG-rotate-552.md). · [`.538` for `.553`](docs/archive/log/LOG-rotate-553.md). · [`.539` for `.554`](docs/archive/log/LOG-rotate-554.md). · [`.540` for `.555`](docs/archive/log/LOG-rotate-555.md). · [`.541` for `.556`](docs/archive/log/LOG-rotate-556.md). · [`.542` for `.557`](docs/archive/log/LOG-rotate-557.md). · [`.543` for `.558`](docs/archive/log/LOG-rotate-558.md). · [`.544` for `.559`](docs/archive/log/LOG-rotate-559.md). · [`.545` for `.560`](docs/archive/log/LOG-rotate-560.md). · [`.546` for `.561`](docs/archive/log/LOG-rotate-561.md). · [`.547` for `.562`](docs/archive/log/LOG-rotate-562.md). · [`.548` for `.563`](docs/archive/log/LOG-rotate-563.md). · [`.549` for `.564`](docs/archive/log/LOG-rotate-564.md). · [`.550` for `.565`](docs/archive/log/LOG-rotate-565.md). · [`.551` for `.566`](docs/archive/log/LOG-rotate-566.md). · [`.552` for `.567`](docs/archive/log/LOG-rotate-567.md). · [`.553` for `.568`](docs/archive/log/LOG-rotate-568.md). · [`.554` for `.569`](docs/archive/log/LOG-rotate-569.md). · [`.555` for `.570`](docs/archive/log/LOG-rotate-570.md). · [`.556` for `.571`](docs/archive/log/LOG-rotate-571.md). · [`.557` for `.572`](docs/archive/log/LOG-rotate-572.md). · [`.558` for `.573`](docs/archive/log/LOG-rotate-573.md). · [`.559` for `.574`](docs/archive/log/LOG-rotate-574.md). · [`.560` for `.575`](docs/archive/log/LOG-rotate-575.md). · [`.561` for `.576`](docs/archive/log/LOG-rotate-576.md). · [`.562` for `.577`](docs/archive/log/LOG-rotate-577.md). · [`.563` for `.578`](docs/archive/log/LOG-rotate-578.md). · [`.564` for `.579`](docs/archive/log/LOG-rotate-579.md). · [`.565` for `.580`](docs/archive/log/LOG-rotate-580.md). · [`.566` for `.581`](docs/archive/log/LOG-rotate-581.md). · [`.567` for `.582`](docs/archive/log/LOG-rotate-582.md). · [`.568` for `.583`](docs/archive/log/LOG-rotate-583.md). · [`.569` for `.584`](docs/archive/log/LOG-rotate-584.md). · [`.570` for `.585`](docs/archive/log/LOG-rotate-585.md). · [`.571` for `.586`](docs/archive/log/LOG-rotate-586.md). · [`.572` for `.587`](docs/archive/log/LOG-rotate-587.md). · [`.573` for `.588`](docs/archive/log/LOG-rotate-588.md). · [`.574` for `.589`](docs/archive/log/LOG-rotate-589.md). · [`.575` for `.590`](docs/archive/log/LOG-rotate-590.md). · [`.576` for `.591`](docs/archive/log/LOG-rotate-591.md). · [`.577` for `.592`](docs/archive/log/LOG-rotate-592.md). · [`.578` for `.593`](docs/archive/log/LOG-rotate-593.md). · [`.581` for `.596`](docs/archive/log/LOG-rotate-596.md). · [`.582` for `.597`](docs/archive/log/LOG-rotate-597.md). · [`.583` for `.598`](docs/archive/log/LOG-rotate-598.md). · [`.584` for `.599`](docs/archive/log/LOG-rotate-599.md). · [`.585` for `.600`](docs/archive/log/LOG-rotate-600.md). · [`.586` for `.601`](docs/archive/log/LOG-rotate-601.md). · [`.587` for `.602`](docs/archive/log/LOG-rotate-602.md). · [`.588` for `.603`](docs/archive/log/LOG-rotate-603.md). · [`.590` for `.606`](docs/archive/log/LOG-rotate-606.md). · [`.596` for `.612`](docs/archive/log/LOG-rotate-612.md). · [`.597` for `.613`](docs/archive/log/LOG-rotate-613.md). · [`.599` for `.614`](docs/archive/log/LOG-rotate-614.md). · [`.600` for `.615`](docs/archive/log/LOG-rotate-615.md). · [`.601` for `.616`](docs/archive/log/LOG-rotate-616.md). · [`.602` for `.617`](docs/archive/log/LOG-rotate-617.md). · [`.603` for `.618`](docs/archive/log/LOG-rotate-618.md). · [`.604` for `.619`](docs/archive/log/LOG-rotate-619.md). · [`.655` for `.670`](docs/archive/log/LOG-rotate-655-for-670.md). · [`.656` for `.679`](docs/archive/log/LOG-rotate-656-for-679.md). · [`.657` for `.680`](docs/archive/log/LOG-rotate-657-for-680.md). · [`.658` for `.684`](docs/archive/log/LOG-rotate-658-for-684.md). · [`.659` for `.685`](docs/archive/log/LOG-rotate-659-for-685.md). · [`.660` for `.689`](docs/archive/log/LOG-rotate-660-for-689.md). · [`.661` for `.690`](docs/archive/log/LOG-rotate-661-for-690.md). · [`.662` for `.691`](docs/archive/log/LOG-rotate-662-for-691.md). · [`.663` for `.692`](docs/archive/log/LOG-rotate-663-for-692.md). · [`.664` for `.693`](docs/archive/log/LOG-rotate-664-for-693.md). · [`.665` for `.694`](docs/archive/log/LOG-rotate-665-for-694.md). · [`.666` for `.695`](docs/archive/log/LOG-rotate-666-for-695.md). · [`.667` for `.696`](docs/archive/log/LOG-rotate-667-for-696.md). · [`.668` for `.697`](docs/archive/log/LOG-rotate-668-for-697.md). · [`.669` for `.714`](docs/archive/log/LOG-rotate-669-for-714.md). · [`.669` for `.743`](docs/archive/log/LOG-rotate-669-for-743.md). · [`.670` for `.743`](docs/archive/log/LOG-rotate-670-for-743.md). · [`.669` for `.744`](docs/archive/log/LOG-rotate-669-for-744.md). · [`.679` for `.744`](docs/archive/log/LOG-rotate-679-for-744.md). · [`.680` for `.745`](docs/archive/log/LOG-rotate-680-for-745.md). · [`.684` for `.746`](docs/archive/log/LOG-rotate-684-for-746.md). · [`.750` for `.765`](docs/archive/log/LOG-rotate-750-for-765.md). · [`.753` for `.768`](docs/archive/log/LOG-rotate-753-for-768.md). · [`.762` for `.777`](docs/archive/log/LOG-rotate-762-for-777.md). · [`.765` for `.780`](docs/archive/log/LOG-rotate-765-for-780.md).

## 2026-08-14 — PWA start_url follows the private gate (`.780`)

The service worker already flag-switches with `PRIVATE_MODE` (`next.config.js`
`pwaDisabled`). The web manifest did not: `start_url` was a `/private` literal
and `pwaManifest.test.ts` forbade `/log` unconditionally. A public-flip rebuild
would still have opened installed icons on the teaser.

**Ship:** `pwaStartUrl()` uses `isPrivateModeEnabledFromEnv` (Preview
short-circuit included). Gated → `/private`. Ungated / Preview / gate-build →
`/log` (Today). `id` stays `/log`. Logger `/active` is not the install home.
No `PRIVATE_MODE` flip.

Label `.780` (onto master `.779`). Excellence-Override below.

Excellence-Override: H0 PWA start_url flag-switch (founder skip-W 2026-08-14)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-765-for-780.md](docs/archive/log/LOG-rotate-765-for-780.md).

## 2026-08-14 — Privacy land typecheck after PAR-Q persist home (`.779`)

`.778` merged with a typecheck hole (`walkTs` annotated as `string[]` while
`readdirSync(..., { withFileTypes: true })` returns `Dirent[]`) and a
P2-2 test still asserting `AssessmentsPage` writes `lastAssessment`
itself. `.777` already moved persist to `persistParqScreen`.

**Ship:** drop the annotation; discover `parqIntake` + `ParqIntakeCard`.
No product change. Not a cert.

Label `.779` (onto master `.778`). Not a `PRIVATE_MODE` flip.

Excellence-Override: privacy land typecheck (no visual surface)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-764-for-779.md](docs/archive/log/LOG-rotate-764-for-779.md).

## 2026-08-14 — Privacy and security program lands on master (`.778`)

Replay of the privacy/security worktree onto current master (`.777`).
`.777` is PAR-Q intake. Stacked worktree labels `.771`–`.779` could not
land as-is.

**Ship:** invite-bound gate; sign-out wipe; delete ignores unproven
`deviceId`; youth notify not an open relay; wearables OAuth fail-closed;
territory client fail-closed; Vercel allow is `x-vercel-ip-country` only;
DSAR export includes email-keyed PI; recipe + `privacyInstill.test.ts`;
blocked signup identifies then refuses (reap only a new empty account).
PAR-Q food-row already closed by `.777`. Not a certification.

Mutants live in the colocated suites (health-bucket, oauthState,
territory, accountData, blockedSignup, instill).

Label `.778` (onto master `.777`). Not a `PRIVATE_MODE` flip.

Excellence-Override: privacy/security program land (no visual surface)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-763-for-778.md](docs/archive/log/LOG-rotate-763-for-778.md).

## 2026-08-14 — PAR-Q is coach intake, not a feature (`.777`)

The health screen was a Toolkit page you went to "complete," and submit wrote
`Assessment: {risk} risk` into Fuel. ISSA fills PAR-Q before personal training.
Log set never waited — Today dock after streak still sent people to
`/assessments`.

**Ship:** persist only `mw_last_assessment`. Coach generate opens a seven-flag
intake; Today Generate links `/coach`. More/rail drop the Assess row. First
Steps and guidebook CTAs point at Coach. Today boss stays train. Free logger
untouched.

Label `.777` (onto master `.776`).

Excellence-Override: PAR-Q is intake not a toolkit

Rotated LOG oldest → [docs/archive/log/LOG-rotate-762-for-777.md](docs/archive/log/LOG-rotate-762-for-777.md).

## 2026-08-14 — Mission Server durable rooms (`.776`)

Pending founder migrations are apply-debt, not a constitution ban.
Community is in `vision.md`. The `.752` "no postgres" line was one-PR
hygiene. This ship is the durable half.

**Ship:** `social_messages` + presence + reports (RLS, signed-in). Outbox
kinds `social.message` / `social.presence` / `social.report`. Guests stay
local. Missing table fail-opens. No Vercel sockets — `postgres_changes` +
shared `mw-garage` broadcast. Report on remote lines. `/api/social` parks
with the `server` surface.

Label `.776` (onto master `.775`).
Excellence-Override below.

Excellence-Override: Mission Server durable rooms

Rotated LOG oldest → [docs/archive/log/LOG-rotate-761-for-776.md](docs/archive/log/LOG-rotate-761-for-776.md).

## 2026-08-14 — LLM daily dollar cap + lifetime Grok gate (`.775`)

Request caps (60 chats/day) did not implement “never cost more than they
paid.” Lifetime is $149 once; Grok is pay-per-token forever. Default 4.6
reasoning is billed and not capped by `max_tokens`.

**Ship:** `centsFromUsage` (provider ticks, else grok-4.6 list; reasoning =
output). Per-identity default **15¢/day**, org breaker **$25/day**. Fail-closed
if the store throws. `allowLlmInference` = request quota then $ cap. Chat,
insight, voice, debrief, meal vision. Lifetime uses the same cap. Public-flip
checklist in LAUNCH_RUNBOOK §5.

Mutants: ticks ignored → list-price used; reasoning omitted → undercount; store
throw → allow (must deny); $ cap 0 with request cap 60 → allow.

Label `.775` (onto master `.774`).
Excellence-Override below.

Excellence-Override: llm spend cap

Rotated LOG oldest → [docs/archive/log/LOG-rotate-760-for-775.md](docs/archive/log/LOG-rotate-760-for-775.md).

## 2026-08-14 — Form Index Wave C stills (`.774`)

Five leftover unique stills sat in the working tree after `.772` landed.
Library cards for those ids still fell back to shared pattern rasters.

**Ship:** wire `step-ups`, `jump-squats`, `wall-ball`, `dips-chair`,
`incline-bench`. Floor 38 → 43. Still-only. No loops. Failed gens (wrong
exercise, title overlays) stay in FAIL.md. Long-tail pattern test moved to
`suitcase-carry` now that incline-bench has its own pack.

Label `.774` (onto master `.773`).

Excellence-Override: form Index media + `formMedia.ts` classified surface

Rotated LOG oldest → [docs/archive/log/LOG-rotate-759-for-774.md](docs/archive/log/LOG-rotate-759-for-774.md).

## 2026-08-14 — Coach chat local RAG + ReAct (`.773`)

Premium chat stuffed one prompt and hoped. It now retrieves catalog + guidebook
summaries in-process (BM25 + alias expand), then a ReAct loop of ZDR one-shots
may cite the last working set, the week, form notes, or the load band. Cap two
tool rounds. No vendor Collections, Files, or stateful Responses. Citations are
slimmed facts — never raw logs. Chat stays premium. The free logger is
untouched.

**Ship:** `src/lib/coach/agent/` (retrieve · tools · react · mcp · facts ·
corpus). `fetchCoachChat` / `streamCoachChat` run the loop. Client sends
`slimCoachLogFacts`. grok-4.6 reasoning pinned `low`.

Label `.773` (onto master `.772`).

Excellence-Override: coach local RAG

Rotated LOG oldest → [docs/archive/log/LOG-rotate-758-for-773.md](docs/archive/log/LOG-rotate-758-for-773.md).

## 2026-08-14 — Library form media honesty + Wave A stills (`.772`)

Library cards were showing shared pattern rasters (a runner on Farmer’s Walk,
a push-up on Burpees) as if they were the named lift. Front squat was a
high-bar back squat. Landmine row floated. Pattern-hinge cropped the head.

**Ship:** `formPackLibraryPosterUrl` — cards only show a unique Form Index
still. Method aliases (`20-rep-squat` → `squats`, …). Regen PASS stills:
front-squat, landmine-row, pattern-hinge, burpees (jump), thruster (lockout),
lunges (dumbbells). Wave A unique stills: inverted-row, hip-thrust, face-pull,
bicep-curl, tricep-pushdown, wall-sit, bird-dog, lat-pulldown, goblet-squat,
pike-pushup. Wave B: dead-bug, side-plank, mountain-climbers, hollow-hold,
cable-row, lateral-raise, dumbbell-press, dumbbell-row. Floor 19 → 38.
Loops demoted on replaced stills. No bulk I2V.

Mutants: SIDE_IDS without a disk still → red; alias to an unwired target → red;
library poster for `incline-bench` is null (not `pattern-push`).

Label `.772` (onto master `.771`).

Excellence-Override: form Index media + `formMedia.ts` classified surface

Rotated LOG oldest → [docs/archive/log/LOG-rotate-757-for-772.md](docs/archive/log/LOG-rotate-757-for-772.md).

## 2026-08-14 — Alpha 0.1.0 changelog (`.771`)

Athlete-facing name is **Alpha 0.1.0** (semver). The ship id stays the unified
label. Public `/changelog` follows the xAI shape: date, `vX.Y.Z` chip, product
heading, athlete bullets. Engineering stays in this file. Open alpha. Invite
gate. Not a public flip. Not a `PRIVATE_MODE` flip.

**Ship:** `APP_PUBLIC_VERSION = "0.1.0"` · `APP_PUBLIC_STAGE = "Alpha"`.
`CHANGELOG.md` + `src/data/changelog.ts` lockstep. `/changelog` is public
while gated, like `/about`. Footer, legal footer, About, sitemap.

Label `.771` (onto master `.770`).

Excellence-Override: alpha 0.1.0 changelog

Rotated LOG oldest → [docs/archive/log/LOG-rotate-756-for-771.md](docs/archive/log/LOG-rotate-756-for-771.md).

## 2026-08-14 — Done beta code works on Vercel Preview (`.770`)


Vercel env is per-environment. `PRIVATE_ACCESS_CODES` (the Done alias) lived
on Production; `scripts/sync-vercel-env.mjs` copied `PRIVATE_ACCESS_SECRET` to
Preview and left the alias behind. www accepted Done. Every `*.vercel.app`
401'd. A second spelling: dashboard paste of `"Done"` compared exact, so even
a Preview copy of the alias missed. A third: Set-Cookie with a Domain on the
`vercel.app` public suffix is rejected, so a 200 that did not stick bounced
silently back to `/private`.

A Vercel login page on Preview is Deployment Protection in the dashboard —
not the app gate. Done cannot unlock that.

**Ship:** `normalizePrivateAccessCode` (trim, BOM, wrapping quotes). Host-only
`attachPrivateAccessCookie` (no Domain; Secure on Vercel). Password unlock
probes `confirmPrivateGateCookie` before navigating. `PRIVATE_ACCESS_CODES`
sits next to SECRET in SYNC_KEYS and the GitHub workflow. Docs: Production
AND Preview. No hardcoded alias. `PRIVATE_MODE` unchanged. Preview stays
ungated at the proxy when `VERCEL_ENV=preview` (`.728`) — `/private` still
needs the same codes if you test the form there.

Mutants killed: quoted `"Done"` without quote-strip; `SYNC_KEYS` without
`PRIVATE_ACCESS_CODES`; workflow without the GitHub secret mapping.

Label `.770` (onto master `.769`).

Excellence-Override: preview Done beta code

Rotated LOG oldest → [docs/archive/log/LOG-rotate-755-for-770.md](docs/archive/log/LOG-rotate-755-for-770.md).

## 2026-08-14 — Beta 0.0.1 door stamp (`.769`)

Athlete-facing name was **0.1 (beta)** — ahead of the evidence for an
invite-only gated product. The door stamp is **0.0.1 (beta)**. Ship id stays
the unified label. Not a public flip. Not a `PRIVATE_MODE` change.

**Ship:** `APP_PUBLIC_VERSION = "0.0.1 (beta)"`. About business copy
interpolates `{{productVersion}}`. README + About metadata follow the
constant. Gate / rail / More still read `APP_PUBLIC_*`.

Label `.769` (onto first-set `.768`).
Excellence-Override below.

Excellence-Override: beta 0.0.1 stamp

Rotated LOG oldest → [docs/archive/log/LOG-rotate-754-for-769.md](docs/archive/log/LOG-rotate-754-for-769.md).

## 2026-08-14 — First set while gated (`.768`)

Hard rule 2 was true in source and false on www: I-Day finished at `/log`,
which 307s to `/private` without a cookie, and the gate's one red was Get
notified. A stranger could not log.

**Ship:** `/active` is public while gated (same mechanism as `/welcome`). Cold
`/private` primary is **Log a set** → `/welcome`. I-Day Continue lands Train
when the gate build is on, Today after the flip. Empty Train offers the I-Day
preview as the one dock Start when kit is on the device — `resolveActiveEmptyStart`
still never seeds Just Go. Today / Coach / Fuel stay cookie-gated. Not a
`PRIVATE_MODE` flip.

Label `.768` (onto master `.767`).
Excellence-Override below.

Excellence-Override: first set while gated

Rotated LOG oldest → [docs/archive/log/LOG-rotate-753-for-768.md](docs/archive/log/LOG-rotate-753-for-768.md).

## 2026-08-14 — Dependabot security/quality batch, Cursor-local (`.767`)

GitHub’s Security and quality tab listed ~46 Dependabot findings “not ready” —
alerts, not mergeable PRs. Opening 46 bot PRs would burn Actions minutes and
Hobby Previews. Same vehicle as `.766`: one Cursor branch.

**Ship:** `overrides` pin `axios@1.19.0` (Phantom still nested 1.15.1) and
`nanoid@3.3.18`. Eight high axios GHSAs gone. Security ratchet 9 → 1
(`bigint-buffer` via `@solana/spl-token` remains — no non-breaking fix).
Expo `image-size` / uuid stay; those need an Expo 53 major, and the Expo app
is flow reference only. No Dependabot PRs opened. `PRIVATE_MODE` unchanged.

Label `.767` (onto master `.766`).

Excellence-Override: dependabot security/quality batch (alerts, not 46 PRs)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-752-for-767.md](docs/archive/log/LOG-rotate-752-for-767.md).

## 2026-08-14 — Merge all open PRs on a Cursor landing branch (`.766`)

GitHub showed 47 open PRs and ~45 Security/quality/Dependabot items “not ready”.
Actions minutes are exhausted; Hobby Previews are capped. Founder asked to merge
all locally in Cursor — one landing branch, not 47 GitHub merges.

**Ship:** fetched every open PR head and merged oldest-first onto
`cursor/merge-all-open-prs-0254`. Conflict policy: CONTEXT / LOG / `buildInfo.ts`
stayed the landing branch; other files took incoming. That clobbered master’s
Train logger (`.754`–`.764`); restored those files from `origin/master` and
re-added PR storage keys, redirect aliases, and schema. Duplicate LOG-rotate
files from overlapping PRs were collapsed to one `##` heading per label.

**Not this ship:** 0 open Dependabot PRs — the 45 Security items are alerts, not
mergeable PRs. `PRIVATE_MODE` unchanged. No Vercel Preview. Production Deploy
Hook is unmetered and only fires on `master`. Train empty Start stays
repeat-last / empty (no Just Go). Free logger ungated.

Landed: #428 #452 #456–459 #466–467 #477–479 #485 #487–492 #494–502 #504–505
#518–519 #521–522 #524 #531–532 #534 #536–537 #539–543, plus stacked #481–483.

**Compose:** after the oldest-first merge, re-wired PR surfaces onto master's
Train logger — Victory vs-last receipt, Coach garage swap, hard-session warning,
About/Account cards, cinematic landing + notify, consent banner, shop copy.
CONTEXT still mutes `/bundle` → `/log`. Empty Start stays repeat-last.

Label `.766` (onto master `.764`; `.765` Preview walk is already in this tree
from #542). Excellence-Override below.

Excellence-Override: merge-all Cursor landing (Actions minutes / no Vercel preview)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-751-for-766.md](docs/archive/log/LOG-rotate-751-for-766.md).


