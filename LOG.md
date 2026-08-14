# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md) · [`.283` for `.298`](docs/archive/log/LOG-rotate-298.md) · [`.284` for `.299`](docs/archive/log/LOG-rotate-299.md) · [`.285` for `.300`](docs/archive/log/LOG-rotate-300.md) · [`.286` for `.301`](docs/archive/log/LOG-rotate-301.md) · [`.287` for `.302`](docs/archive/log/LOG-rotate-302.md) · [`.288` for `.303`](docs/archive/log/LOG-rotate-303.md) · [`.289` for `.304`](docs/archive/log/LOG-rotate-304.md) · [`.290` for `.305`](docs/archive/log/LOG-rotate-305.md) · [`.291` for `.306`](docs/archive/log/LOG-rotate-306.md) · [`.292` for `.307`](docs/archive/log/LOG-rotate-307.md) · [`.293` for `.308`](docs/archive/log/LOG-rotate-308.md) · [`.294` for `.309`](docs/archive/log/LOG-rotate-309.md) · [`.295` for `.310`](docs/archive/log/LOG-rotate-310.md) · [`.296` for `.311`](docs/archive/log/LOG-rotate-311.md) · [`.297` for `.312`](docs/archive/log/LOG-rotate-312.md) · [`.298` for `.313`](docs/archive/log/LOG-rotate-313.md) · [`.299` for `.314`](docs/archive/log/LOG-rotate-314.md) · [`.300` for `.315`](docs/archive/log/LOG-rotate-315.md). · [`.301` for `.316`](docs/archive/log/LOG-rotate-316.md). · [`.302` for `.317`](docs/archive/log/LOG-rotate-317.md). · [`.303` for `.318`](docs/archive/log/LOG-rotate-318.md). · [`.304` for `.319`](docs/archive/log/LOG-rotate-319.md). · [`.305` for `.320`](docs/archive/log/LOG-rotate-320.md). · [`.306` for `.321`](docs/archive/log/LOG-rotate-321.md). · [`.307` for `.322`](docs/archive/log/LOG-rotate-322.md). · [`.308` for `.323`](docs/archive/log/LOG-rotate-323.md). · [`.309` for `.324`](docs/archive/log/LOG-rotate-324.md). · [`.310` for `.325`](docs/archive/log/LOG-rotate-325.md). · [`.311` for `.326`](docs/archive/log/LOG-rotate-326.md). · [`.312` for `.327`](docs/archive/log/LOG-rotate-327.md). · [`.313` for `.328`](docs/archive/log/LOG-rotate-328.md). · [`.314` for `.329`](docs/archive/log/LOG-rotate-329.md). · [`.315` for `.330`](docs/archive/log/LOG-rotate-330.md). · [`.316` for `.331`](docs/archive/log/LOG-rotate-331.md). · [`.317` for `.332`](docs/archive/log/LOG-rotate-332.md). · [`.318` for `.333`](docs/archive/log/LOG-rotate-333.md). · [`.319` for `.334`](docs/archive/log/LOG-rotate-334.md). · [`.320` for `.335`](docs/archive/log/LOG-rotate-335.md). · [`.321` for `.336`](docs/archive/log/LOG-rotate-336.md). · [`.322` for `.337`](docs/archive/log/LOG-rotate-337.md). · [`.323` for `.338`](docs/archive/log/LOG-rotate-338.md). · [`.324` for `.339`](docs/archive/log/LOG-rotate-339.md). · [`.325` for `.340`](docs/archive/log/LOG-rotate-340.md). · [`.326` for `.341`](docs/archive/log/LOG-rotate-341.md). · [`.327` for `.342`](docs/archive/log/LOG-rotate-342.md). · [`.328` for `.343`](docs/archive/log/LOG-rotate-343.md). · [`.329` for `.344`](docs/archive/log/LOG-rotate-344.md). · [`.330` for `.345`](docs/archive/log/LOG-rotate-345.md). · [`.331` for `.346`](docs/archive/log/LOG-rotate-346.md). · [`.332` for `.347`](docs/archive/log/LOG-rotate-347.md). · [`.333` for `.348`](docs/archive/log/LOG-rotate-348.md). · [`.334` for `.349`](docs/archive/log/LOG-rotate-349.md). · [`.335` for `.350`](docs/archive/log/LOG-rotate-350.md). · [`.336` for `.351`](docs/archive/log/LOG-rotate-351.md). · [`.337` for `.352`](docs/archive/log/LOG-rotate-352.md). · [`.338` for `.353`](docs/archive/log/LOG-rotate-353.md). · [`.339` for `.354`](docs/archive/log/LOG-rotate-354.md). · [`.340` for `.355`](docs/archive/log/LOG-rotate-355.md). · [`.341` for `.356`](docs/archive/log/LOG-rotate-356.md). · [`.342` for `.357`](docs/archive/log/LOG-rotate-357.md). · [`.343` for `.358`](docs/archive/log/LOG-rotate-358.md). · [`.344` for `.359`](docs/archive/log/LOG-rotate-359.md). · [`.345` for `.360`](docs/archive/log/LOG-rotate-360.md). · [`.346` for `.361`](docs/archive/log/LOG-rotate-361.md). · [`.347` for `.362`](docs/archive/log/LOG-rotate-362.md). · [`.348` for `.363`](docs/archive/log/LOG-rotate-363.md). · [`.349` for `.364`](docs/archive/log/LOG-rotate-364.md). · [`.350` for `.365`](docs/archive/log/LOG-rotate-365.md). · [`.351` for `.366`](docs/archive/log/LOG-rotate-366.md). · [`.352` for `.367`](docs/archive/log/LOG-rotate-367.md). · [`.353` for `.368`](docs/archive/log/LOG-rotate-368.md). · [`.354` for `.369`](docs/archive/log/LOG-rotate-369.md). · [`.355` for `.370`](docs/archive/log/LOG-rotate-370.md). · [`.356` for `.371`](docs/archive/log/LOG-rotate-371.md). · [`.357` for `.372`](docs/archive/log/LOG-rotate-372.md). · [`.358` for `.373`](docs/archive/log/LOG-rotate-373.md). · [`.359` for `.374`](docs/archive/log/LOG-rotate-374.md). · [`.360` for `.375`](docs/archive/log/LOG-rotate-375.md). · [`.361` for `.376`](docs/archive/log/LOG-rotate-376.md). · [`.362` for `.377`](docs/archive/log/LOG-rotate-377.md). · [`.363` for `.378`](docs/archive/log/LOG-rotate-378.md). · [`.364` for `.379`](docs/archive/log/LOG-rotate-379.md). · [`.365` for `.380`](docs/archive/log/LOG-rotate-380.md). · [`.366` for `.381`](docs/archive/log/LOG-rotate-381.md). · [`.367` for `.382`](docs/archive/log/LOG-rotate-382.md). · [`.368` for `.383`](docs/archive/log/LOG-rotate-383.md). · [`.369` for `.384`](docs/archive/log/LOG-rotate-384.md). · [`.370` for `.385`](docs/archive/log/LOG-rotate-385.md). · [`.371` for `.386`](docs/archive/log/LOG-rotate-386.md). · [`.372` for `.387`](docs/archive/log/LOG-rotate-387.md). · [`.373` for `.388`](docs/archive/log/LOG-rotate-388.md). · [`.374` for `.389`](docs/archive/log/LOG-rotate-389.md). · [`.375` for `.390`](docs/archive/log/LOG-rotate-390.md). · [`.376` for `.391`](docs/archive/log/LOG-rotate-391.md). · [`.377` for `.392`](docs/archive/log/LOG-rotate-392.md). · [`.378` for `.393`](docs/archive/log/LOG-rotate-393.md). · [`.379` for `.394`](docs/archive/log/LOG-rotate-394.md). · [`.380` for `.395`](docs/archive/log/LOG-rotate-395.md). · [`.381` for `.396`](docs/archive/log/LOG-rotate-396.md). · [`.382` for `.397`](docs/archive/log/LOG-rotate-397.md). · [`.383` for `.398`](docs/archive/log/LOG-rotate-398.md). · [`.384` for `.399`](docs/archive/log/LOG-rotate-399.md). · [`.385` for `.400`](docs/archive/log/LOG-rotate-400.md). · [`.386` for `.401`](docs/archive/log/LOG-rotate-401.md). · [`.387` for `.402`](docs/archive/log/LOG-rotate-402.md). · [`.388` for `.403`](docs/archive/log/LOG-rotate-403.md). · [`.389` for `.404`](docs/archive/log/LOG-rotate-404.md). · [`.390` for `.405`](docs/archive/log/LOG-rotate-405.md). · [`.391` for `.406`](docs/archive/log/LOG-rotate-406.md). · [`.392` for `.407`](docs/archive/log/LOG-rotate-407.md). · [`.393` for `.408`](docs/archive/log/LOG-rotate-408.md). · [`.394` for `.409`](docs/archive/log/LOG-rotate-409.md). · [`.395` for `.410`](docs/archive/log/LOG-rotate-410.md). · [`.396` for `.411`](docs/archive/log/LOG-rotate-411.md). · [`.397` for `.412`](docs/archive/log/LOG-rotate-412.md). · [`.398` for `.413`](docs/archive/log/LOG-rotate-413.md). · [`.399` for `.414`](docs/archive/log/LOG-rotate-414.md). · [`.400` for `.415`](docs/archive/log/LOG-rotate-415.md). · [`.401` for `.416`](docs/archive/log/LOG-rotate-416.md). · [`.402` for `.417`](docs/archive/log/LOG-rotate-417.md). · [`.403` for `.418`](docs/archive/log/LOG-rotate-418.md). · [`.404` for `.419`](docs/archive/log/LOG-rotate-419.md). · [`.405` for `.420`](docs/archive/log/LOG-rotate-420.md). · [`.406` for `.421`](docs/archive/log/LOG-rotate-421.md). · [`.407` for `.422`](docs/archive/log/LOG-rotate-422.md). · [`.408` for `.423`](docs/archive/log/LOG-rotate-423.md). · [`.409` for `.424`](docs/archive/log/LOG-rotate-424.md). · [`.410` for `.425`](docs/archive/log/LOG-rotate-425.md). · [`.411` for `.426`](docs/archive/log/LOG-rotate-426.md). · [`.412` for `.427`](docs/archive/log/LOG-rotate-427.md). · [`.413` for `.428`](docs/archive/log/LOG-rotate-428.md). · [`.414` for `.429`](docs/archive/log/LOG-rotate-429.md). · [`.415` for `.430`](docs/archive/log/LOG-rotate-430.md). · [`.416` for `.431`](docs/archive/log/LOG-rotate-431.md). · [`.417` for `.432`](docs/archive/log/LOG-rotate-432.md). · [`.418` for `.433`](docs/archive/log/LOG-rotate-433.md). · [`.419` for `.434`](docs/archive/log/LOG-rotate-434.md). · [`.420` for `.435`](docs/archive/log/LOG-rotate-435.md). · [`.421` for `.436`](docs/archive/log/LOG-rotate-436.md). · [`.422` for `.437`](docs/archive/log/LOG-rotate-437.md). · [`.423` for `.438`](docs/archive/log/LOG-rotate-438.md). · [`.424` for `.439`](docs/archive/log/LOG-rotate-439.md). · [`.425` for `.440`](docs/archive/log/LOG-rotate-440.md). · [`.426` for `.441`](docs/archive/log/LOG-rotate-441.md). · [`.427` for `.442`](docs/archive/log/LOG-rotate-442.md). · [`.428` for `.443`](docs/archive/log/LOG-rotate-443.md). · [`.429` for `.444`](docs/archive/log/LOG-rotate-444.md). · [`.430` for `.445`](docs/archive/log/LOG-rotate-445.md). · [`.431` for `.446`](docs/archive/log/LOG-rotate-446.md). · [`.432` for `.447`](docs/archive/log/LOG-rotate-447.md). · [`.433` for `.448`](docs/archive/log/LOG-rotate-448.md). · [`.434` for `.449`](docs/archive/log/LOG-rotate-449.md). · [`.435` for `.450`](docs/archive/log/LOG-rotate-450.md). · [`.436` for `.451`](docs/archive/log/LOG-rotate-451.md). · [`.437` for `.452`](docs/archive/log/LOG-rotate-452.md). · [`.438` for `.453`](docs/archive/log/LOG-rotate-453.md). · [`.439` for `.454`](docs/archive/log/LOG-rotate-454.md). · [`.440` for `.455`](docs/archive/log/LOG-rotate-455.md). · [`.441` for `.456`](docs/archive/log/LOG-rotate-456.md). · [`.442` for `.457`](docs/archive/log/LOG-rotate-457.md). · [`.443` for `.458`](docs/archive/log/LOG-rotate-458.md). · [`.444` for `.459`](docs/archive/log/LOG-rotate-459.md). · [`.445` for `.460`](docs/archive/log/LOG-rotate-460.md). · [`.446` for `.461`](docs/archive/log/LOG-rotate-461.md). · [`.447` for `.462`](docs/archive/log/LOG-rotate-462.md). · [`.448` for `.463`](docs/archive/log/LOG-rotate-463.md). · [`.449` for `.464`](docs/archive/log/LOG-rotate-464.md). · [`.450` for `.465`](docs/archive/log/LOG-rotate-465.md). · [`.451` for `.466`](docs/archive/log/LOG-rotate-466.md). · [`.452` for `.467`](docs/archive/log/LOG-rotate-467.md). · [`.453` for `.468`](docs/archive/log/LOG-rotate-468.md). · [`.454` for `.469`](docs/archive/log/LOG-rotate-469.md). · [`.455` for `.470`](docs/archive/log/LOG-rotate-470.md). · [`.456` for `.471`](docs/archive/log/LOG-rotate-471.md). · [`.457` for `.472`](docs/archive/log/LOG-rotate-472.md). · [`.458` for `.473`](docs/archive/log/LOG-rotate-473.md). · [`.459` for `.474`](docs/archive/log/LOG-rotate-474.md). · [`.460` for `.475`](docs/archive/log/LOG-rotate-475.md). · [`.461` for `.476`](docs/archive/log/LOG-rotate-476.md). · [`.462` for `.477`](docs/archive/log/LOG-rotate-477.md). · [`.463` for `.478`](docs/archive/log/LOG-rotate-478.md). · [`.464` for `.479`](docs/archive/log/LOG-rotate-479.md). · [`.465` for `.480`](docs/archive/log/LOG-rotate-480.md). · [`.466` for `.481`](docs/archive/log/LOG-rotate-481.md). · [`.467` for `.482`](docs/archive/log/LOG-rotate-482.md). · [`.468` for `.483`](docs/archive/log/LOG-rotate-483.md). · [`.469` for `.484`](docs/archive/log/LOG-rotate-484.md). · [`.470` for `.485`](docs/archive/log/LOG-rotate-485.md). · [`.471` for `.486`](docs/archive/log/LOG-rotate-486.md). · [`.472` for `.487`](docs/archive/log/LOG-rotate-487.md). · [`.473` for `.488`](docs/archive/log/LOG-rotate-488.md). · [`.474` for `.489`](docs/archive/log/LOG-rotate-489.md). · [`.475` for `.490`](docs/archive/log/LOG-rotate-490.md). · [`.476` for `.491`](docs/archive/log/LOG-rotate-491.md). · [`.477` for `.492`](docs/archive/log/LOG-rotate-492.md). · [`.478` for `.493`](docs/archive/log/LOG-rotate-493.md). · [`.479` for `.494`](docs/archive/log/LOG-rotate-494.md). · [`.480` for `.495`](docs/archive/log/LOG-rotate-495.md). · [`.481` for `.496`](docs/archive/log/LOG-rotate-496.md). · [`.482` for `.497`](docs/archive/log/LOG-rotate-497.md). · [`.483` for `.498`](docs/archive/log/LOG-rotate-498.md). · [`.484` for `.499`](docs/archive/log/LOG-rotate-499.md). · [`.485` for `.500`](docs/archive/log/LOG-rotate-500.md). · [`.486` for `.501`](docs/archive/log/LOG-rotate-501.md). · [`.487` for `.502`](docs/archive/log/LOG-rotate-502.md). · [`.488` for `.503`](docs/archive/log/LOG-rotate-503.md). · [`.490` for `.505`](docs/archive/log/LOG-rotate-505.md). · [`.491` for `.506`](docs/archive/log/LOG-rotate-506.md). · [`.579` for `.594`](docs/archive/log/LOG-rotate-594.md). · [`.580` for `.595`](docs/archive/log/LOG-rotate-595.md).


--- · [`.492` for `.507`](docs/archive/log/LOG-rotate-507.md). · [`.493` for `.508`](docs/archive/log/LOG-rotate-508.md). · [`.494` for `.509`](docs/archive/log/LOG-rotate-509.md). · [`.495` for `.510`](docs/archive/log/LOG-rotate-510.md). · [`.496` for `.511`](docs/archive/log/LOG-rotate-511.md). · [`.497` for `.512`](docs/archive/log/LOG-rotate-512.md). · [`.498` for `.513`](docs/archive/log/LOG-rotate-513.md). · [`.499` for `.514`](docs/archive/log/LOG-rotate-514.md). · [`.500` for `.515`](docs/archive/log/LOG-rotate-515.md). · [`.501` for `.516`](docs/archive/log/LOG-rotate-516.md). · [`.502` for `.517`](docs/archive/log/LOG-rotate-517.md). · [`.503` for `.518`](docs/archive/log/LOG-rotate-518.md). · [`.504` for `.519`](docs/archive/log/LOG-rotate-519.md). · [`.505` for `.520`](docs/archive/log/LOG-rotate-520.md). · [`.506` for `.521`](docs/archive/log/LOG-rotate-521.md). · [`.507` for `.522`](docs/archive/log/LOG-rotate-522.md). · [`.508` for `.523`](docs/archive/log/LOG-rotate-523.md). · [`.509` for `.524`](docs/archive/log/LOG-rotate-524.md). · [`.510` for `.525`](docs/archive/log/LOG-rotate-525.md). · [`.511` for `.526`](docs/archive/log/LOG-rotate-526.md). · [`.512` for `.527`](docs/archive/log/LOG-rotate-527.md). · [`.513` for `.528`](docs/archive/log/LOG-rotate-528.md). · [`.514` for `.529`](docs/archive/log/LOG-rotate-529.md). · [`.515` for `.530`](docs/archive/log/LOG-rotate-530.md). · [`.516` for `.531`](docs/archive/log/LOG-rotate-531.md). · [`.517` for `.532`](docs/archive/log/LOG-rotate-532.md). · [`.518` for `.533`](docs/archive/log/LOG-rotate-533.md). · [`.519` for `.534`](docs/archive/log/LOG-rotate-534.md). · [`.520` for `.535`](docs/archive/log/LOG-rotate-535.md). · [`.521` for `.536`](docs/archive/log/LOG-rotate-536.md). · [`.522` for `.537`](docs/archive/log/LOG-rotate-537.md). · [`.523` for `.538`](docs/archive/log/LOG-rotate-538.md). · [`.524` for `.539`](docs/archive/log/LOG-rotate-539.md). · [`.525` for `.540`](docs/archive/log/LOG-rotate-540.md). · [`.526` for `.541`](docs/archive/log/LOG-rotate-541.md). · [`.527` for `.542`](docs/archive/log/LOG-rotate-542.md). · [`.528` for `.543`](docs/archive/log/LOG-rotate-543.md). · [`.529` for `.544`](docs/archive/log/LOG-rotate-544.md). · [`.530` for `.545`](docs/archive/log/LOG-rotate-545.md). · [`.531` for `.546`](docs/archive/log/LOG-rotate-546.md). · [`.532` for `.547`](docs/archive/log/LOG-rotate-547.md). · [`.533` for `.548`](docs/archive/log/LOG-rotate-548.md). · [`.534` for `.549`](docs/archive/log/LOG-rotate-549.md). · [`.535` for `.550`](docs/archive/log/LOG-rotate-550.md). · [`.536` for `.551`](docs/archive/log/LOG-rotate-551.md). · [`.537` for `.552`](docs/archive/log/LOG-rotate-552.md). · [`.538` for `.553`](docs/archive/log/LOG-rotate-553.md). · [`.539` for `.554`](docs/archive/log/LOG-rotate-554.md). · [`.540` for `.555`](docs/archive/log/LOG-rotate-555.md). · [`.541` for `.556`](docs/archive/log/LOG-rotate-556.md). · [`.542` for `.557`](docs/archive/log/LOG-rotate-557.md). · [`.543` for `.558`](docs/archive/log/LOG-rotate-558.md). · [`.544` for `.559`](docs/archive/log/LOG-rotate-559.md). · [`.545` for `.560`](docs/archive/log/LOG-rotate-560.md). · [`.546` for `.561`](docs/archive/log/LOG-rotate-561.md). · [`.547` for `.562`](docs/archive/log/LOG-rotate-562.md). · [`.548` for `.563`](docs/archive/log/LOG-rotate-563.md). · [`.549` for `.564`](docs/archive/log/LOG-rotate-564.md). · [`.550` for `.565`](docs/archive/log/LOG-rotate-565.md). · [`.551` for `.566`](docs/archive/log/LOG-rotate-566.md). · [`.552` for `.567`](docs/archive/log/LOG-rotate-567.md). · [`.553` for `.568`](docs/archive/log/LOG-rotate-568.md). · [`.554` for `.569`](docs/archive/log/LOG-rotate-569.md). · [`.555` for `.570`](docs/archive/log/LOG-rotate-570.md). · [`.556` for `.571`](docs/archive/log/LOG-rotate-571.md). · [`.557` for `.572`](docs/archive/log/LOG-rotate-572.md). · [`.558` for `.573`](docs/archive/log/LOG-rotate-573.md). · [`.559` for `.574`](docs/archive/log/LOG-rotate-574.md). · [`.560` for `.575`](docs/archive/log/LOG-rotate-575.md). · [`.561` for `.576`](docs/archive/log/LOG-rotate-576.md). · [`.562` for `.577`](docs/archive/log/LOG-rotate-577.md). · [`.563` for `.578`](docs/archive/log/LOG-rotate-578.md). · [`.564` for `.579`](docs/archive/log/LOG-rotate-579.md). · [`.565` for `.580`](docs/archive/log/LOG-rotate-580.md). · [`.566` for `.581`](docs/archive/log/LOG-rotate-581.md). · [`.567` for `.582`](docs/archive/log/LOG-rotate-582.md). · [`.568` for `.583`](docs/archive/log/LOG-rotate-583.md). · [`.569` for `.584`](docs/archive/log/LOG-rotate-584.md). · [`.570` for `.585`](docs/archive/log/LOG-rotate-585.md). · [`.571` for `.586`](docs/archive/log/LOG-rotate-586.md). · [`.572` for `.587`](docs/archive/log/LOG-rotate-587.md). · [`.573` for `.588`](docs/archive/log/LOG-rotate-588.md). · [`.574` for `.589`](docs/archive/log/LOG-rotate-589.md). · [`.575` for `.590`](docs/archive/log/LOG-rotate-590.md). · [`.576` for `.591`](docs/archive/log/LOG-rotate-591.md). · [`.577` for `.592`](docs/archive/log/LOG-rotate-592.md). · [`.578` for `.593`](docs/archive/log/LOG-rotate-593.md). · [`.581` for `.596`](docs/archive/log/LOG-rotate-596.md). · [`.582` for `.597`](docs/archive/log/LOG-rotate-597.md). · [`.583` for `.598`](docs/archive/log/LOG-rotate-598.md). · [`.584` for `.599`](docs/archive/log/LOG-rotate-599.md). · [`.585` for `.600`](docs/archive/log/LOG-rotate-600.md). · [`.586` for `.601`](docs/archive/log/LOG-rotate-601.md). · [`.587` for `.602`](docs/archive/log/LOG-rotate-602.md). · [`.588` for `.603`](docs/archive/log/LOG-rotate-603.md). · [`.590` for `.606`](docs/archive/log/LOG-rotate-606.md). · [`.596` for `.612`](docs/archive/log/LOG-rotate-612.md). · [`.597` for `.613`](docs/archive/log/LOG-rotate-613.md). · [`.599` for `.614`](docs/archive/log/LOG-rotate-614.md). · [`.600` for `.615`](docs/archive/log/LOG-rotate-615.md). · [`.601` for `.616`](docs/archive/log/LOG-rotate-616.md). · [`.602` for `.617`](docs/archive/log/LOG-rotate-617.md). · [`.603` for `.618`](docs/archive/log/LOG-rotate-618.md). · [`.604` for `.619`](docs/archive/log/LOG-rotate-619.md). · [`.655` for `.670`](docs/archive/log/LOG-rotate-655-for-670.md). · [`.656` for `.679`](docs/archive/log/LOG-rotate-656-for-679.md). · [`.657` for `.680`](docs/archive/log/LOG-rotate-657-for-680.md). · [`.658` for `.684`](docs/archive/log/LOG-rotate-658-for-684.md). · [`.659` for `.685`](docs/archive/log/LOG-rotate-659-for-685.md). · [`.660` for `.689`](docs/archive/log/LOG-rotate-660-for-689.md). · [`.661` for `.690`](docs/archive/log/LOG-rotate-661-for-690.md). · [`.662` for `.691`](docs/archive/log/LOG-rotate-662-for-691.md). · [`.663` for `.692`](docs/archive/log/LOG-rotate-663-for-692.md). · [`.664` for `.693`](docs/archive/log/LOG-rotate-664-for-693.md). · [`.665` for `.694`](docs/archive/log/LOG-rotate-665-for-694.md). · [`.666` for `.695`](docs/archive/log/LOG-rotate-666-for-695.md). · [`.667` for `.696`](docs/archive/log/LOG-rotate-667-for-696.md). · [`.668` for `.697`](docs/archive/log/LOG-rotate-668-for-697.md). · [`.669` for `.714`](docs/archive/log/LOG-rotate-669-for-714.md). · [`.669` for `.743`](docs/archive/log/LOG-rotate-669-for-743.md). · [`.670` for `.743`](docs/archive/log/LOG-rotate-670-for-743.md). · [`.669` for `.744`](docs/archive/log/LOG-rotate-669-for-744.md). · [`.679` for `.744`](docs/archive/log/LOG-rotate-679-for-744.md). · [`.680` for `.745`](docs/archive/log/LOG-rotate-680-for-745.md). · [`.684` for `.746`](docs/archive/log/LOG-rotate-684-for-746.md).

## 2026-08-14 — Legal footers stop prefetching the legal library (`.768`)

Shard 4 (diaspora + RU, ops #15) adds five findings: onboarding wall, missing
smart defaults, buried Log button, heavy/slow www first paint, canned Coach. The
instruction was the last-but-one and the first: **buried Log button and
first-paint weight**. One of those turned out to be a deploy problem and the
other a real one, so this entry is mostly about telling them apart.

**Production is `.697`. Shard 4 is a survey of a build from ~70 ships ago.**
Checked, not assumed: `www.missionwinning.com/private` still serves
`Checking sign-in…` as its whole body — `.765`'s fix — carries neither the
version stamp master added in `.759`–`.764` nor `.766`'s local-first line. So
four of shard 4's five findings describe software that is already fixed on
`master` and **not deployed**: the onboarding wall (I-Day cut to two steps),
missing smart defaults (`.754`–`.764` set-row: prefill, prev/next targets,
steppers, Repeat last set, plate math), canned Coach (`.766`/`.767` log
citations), and the buried Log button.

**The buried Log button does not reproduce on `master`.** Measured on a
production build at three phone sizes, landing on Active and looking for the log
control without scrolling:

| viewport | Log control | in viewport |
|---|---|---|
| 360×640 (small Android) | y=518, h=52 | yes |
| 390×844 (design frame) | y=722, h=52 | yes |
| 412×732 (common Android) | y=610, h=52 | yes |

It is docked — a `ScreenDock` flex sibling, so it cannot scroll away — and a
returning athlete logs a set in **2 interactions** (`.767`). One residual worth
naming for whoever owns the set row: at 360×640 the open console occupies
~370px of a 640px screen, so the sets you have already logged are off-screen
while you log the next one. That is a judgement about `.75x`'s own new console,
not a defect I should re-cut from a survey line.

**The weight is real, and it was nobody's prefetch.** Measured at 390×844 on a
production build, counting every script the browser fetched with no interaction:
`/welcome` pulled **416 KB gzipped across 53 requests** — 26 chunks and 146.6 KB
*more than the landing page*, to ask three questions. The extra was `next/link`
**prefetch**. [`AppLegalFooter`](src/components/layout/AppLegalFooter.tsx) renders
eight links — Terms, Privacy, Usage, Regions, Service terms, DMCA, Refunds,
About — and sits on the private gate, on I-Day, and under every info and pillar
page. App Router prefetches links as they enter the viewport, and on a short
screen that footer *is* in the viewport, so arriving at I-Day downloaded the
legal library. Nobody opens I-Day to read the DMCA policy.

| route | before | after |
|---|---|---|
| `/welcome` | 416.1 KB / 53 requests | **334.2 KB / 37** |
| `/log` | 593.5 KB / 73 | **544.7 KB / 63** |
| `/private` (gated build) | — | 267.7 KB / 20 |

The guard found four more clusters I had not looked at: `SignInPanel` (4 legal
links), `LegalNav` (8), `ServiceTermsPage` (5) and `TermsPage` (15 in-body
cross-references). All opted out. Those did **not** move `/terms` (404 KB / 47
scripts, unchanged), and the reason is worth writing down rather than claiming a
win: on a long legal page those links are below the fold, so they were never
prefetched inside the measurement window. `/terms` is heavy on its own content —
a separate finding, named not guessed.

**Two ratchets, because this regresses by omission.** `prefetch` defaults to on,
so the next `<Link>` added to a footer is heavy unless its author knows. And
`bundle-budget.mjs` is blind to it twice over: it measures initial JS off
prerendered HTML, prefetch is a runtime fetch of *other* routes' chunks (the
`.222` blind spot, in a new place), and **the two pages that are www while the
gate is up have never had a budget at all** — both are dynamic, so there is no
prerendered file for it to read. So: `linkPrefetchWeight.test.ts` requires any
component linking four or more info/legal routes to opt out, with the info-route
list derived from `publicRoutes.ts` rather than typed again, and an explicit test
that product links (the logger, Coach, JourneyHero) are left alone — prefetching
the screen an athlete is about to open is the feature working. And `gate-smoke`
now counts the scripts the served HTML asks for on `/private` (cap 26, measured
20) and `/welcome` (cap 38, measured 32) — script count rather than bytes,
because a smoke should not download a megabyte to make a point and the
regression shows up as requests first.

**Founder, one line:** everything in shards 1–4 that is fixed is fixed on
`master` and invisible to users. Production has not moved since `.697`.

Label `.768` (onto `.767`, same PR). Excellence-Override below.

Excellence-Override: www kaizen first-paint (RESULT unscored)

## 2026-08-14 — No questionnaire before the first set (`.767`)

Shard 3 (IL/IN/SEA, ops #14) confirms all three P0s across two more regions, and
adds the one I deliberately left alone in `.766`: **too many taps to log a set**.

**Measured, and the first measurement was wrong in the product's favour.** My
harness typed weight and reps into the set row and reported 8 interactions from a
cold device. The row was already prefilled; the typing was mine, not the
athlete's. Corrected, headless at 390×844, counting every interaction:

| path | before | after |
|---|---|---|
| cold device (no I-Day) | 4 | 4 |
| I-Day done, no sessions | 2 | 2 |
| **returning, has history** | **3, one of them a full-screen questionnaire** | **2** |

The habit path — the one a survey respondent actually rates — ran Start →
`SessionCheckInSheet` → Log set. That sheet is an `AdaptiveOverlay` at
`z-[70]`, so the logger was rendered underneath and **unclickable** until the
athlete dealt with three rating rows. `tests/e2e/helpers/journey.ts` already
seeds a completed check-in to get past it and states why in its own header
("full-viewport overlay that intercepts Finish / picker clicks") — the suite
agreeing in writing while measuring nothing.

The principle was already written in [`sessionCheckInOffer.ts`](src/lib/workout/sessionCheckInOffer.ts):
*a Mind questionnaire must not stand between arriving on Active and logging a
set.* It said **first** mission, and shard 3 is about returning athletes, which
is exactly the case it excluded. It now says every session: ask after the first
set, when the athlete is warm and nothing is in the way.

**The same defect was manufacturing the input Mission Coach reasons from.** Every
row starts at 3 and `save()` wrote all three unconditionally, so the fastest way
past a sheet standing between you and your set was to tap its primary — which
recorded a 3/3/3 readiness check-in **nobody answered**, into `computeBodyScores`,
into readiness, into the plan. Only rows the athlete moved are written now, and an
untouched Save writes nothing at all. Shard 3 lists "Coach not visibly grounded in
logs" and "too many taps" as separate P0s; here they were one bug.

**The two repeat findings, extended to where these regions land.** `CoachInsightCard`
— "Coach note", *"From your recent training load and recovery"* — now carries the
`.766` citation: load and recovery are computed from sessions, so the session is
the thing to show. The claim pattern in the guard widened to catch that derived
phrasing, which it could not see. And the **landing hero** now states the
local-first mechanism from the same constant as the gate and I-Day: IL/IN/SEA
arrive on `/` by SEO rather than on the gate, and the hero said "offline" and "no
account" without ever saying where the sets go.

**Guards: 8 mutants, 8 killed — two of them only after the mutants fixed the
guard.** Dropping `touch()` from one `QuickRow` left a row that could be moved and
still not saved, and my landing assertion was satisfied by the **comment** naming
the constant two lines above the render — `.766`'s leftover-import defect wearing
prose. Source assertions strip comments now. `localFirstCopy` also grew an "every
constant is actually on a screen" check, which immediately found two orphans:
`.696`'s Active sign-in strings, unmounted since master's `.746` removed that
prompt. Retired with the reason; the strings stay in the pack so fifteen
translations are not thrown away.

**Not shipped, and why.** The cold path's remaining 4 taps include the 2 I-Day
steps. A "log a set now, set up later" door would halve it, but `completeIDay()`
requires experience/equipment/goal **and writes them**, so that door would record
answers the athlete never gave — the exact thing removed from the check-in sheet
above. It needs a profile-less journey variant or a founder call on I-Day's shape,
which master deliberately cut to two steps in `.759`–`.764`. Named rather than
guessed at.

**Verified on the production build, not the dev server.** Returning athlete at
390×844: **0** blocking sheets between Start and Log set, **2** interactions,
`SETS 1/1`, the sheet offered *after* the set, and an untouched Save wrote
`(nothing)` where it used to write 3/3/3. `/coach` and Today both read *"From
your log: Bench Press 60kg × 5 · Aug 13"* (the Today insight card's copy sits in
the collapsed health section and carries the same line). `/` and `/welcome`
state the mechanism in server-rendered HTML. Hero e2e **71 passed**; unit
**2767**; route contract **47**; lint, typecheck, i18n parity + coverage, locale
split, design system, display type, token sync, excellence gate all green.
`bundle-budget` stays red exactly as master left it — `/` 257.1 KB (master
257.5), `/log` 287.3 (287.8), `/active` 453.6 (453.1).

Label `.767` (onto `.766`, same PR). Excellence-Override below.

Excellence-Override: www kaizen first-paint (RESULT unscored)

## 2026-08-13 — Coach cites the log; first paint names the mechanism (`.766`)

East Asia survey shard (mission-ops #13), taken without waiting for the other
shards. Three P0s, all of them about **being believed** rather than being right.

**1. Coach-from-logs clarity 2.56/5 — the lowest item on the sheet**, from a
cohort described as AI-skeptical and Alpha-curious, diagnosed as *"coach output
has no log-derived labels"*. Read the surfaces and the diagnosis is exact:
`/coach` says *"built from your logs"*, `CoachTodayCard` says *"Built from your
logs — no wearable required"*, and Today's Coach invite eyebrow said **"AI weekly
plan"**. Three claims about provenance, no evidence of it. To a reader who
suspects a language model produced the number, a provenance claim is the weakest
available move: it is exactly what a fabricated plan would also say. `.693`
shipped the honest version for *adaptation* — `weekRationale`'s input · rule ·
effect — but it only renders when there is an adaptation to explain, so the
fresh-week and no-plan paths, which is the whole first run the survey measured,
had nothing at all.

New `src/lib/coach/logCitation.ts` **quotes** the device's own log: the last
performed loaded set as exercise + load + reps + date, a bodyweight session by
name, and `no-logs` as a first-class answer rather than a claim with nothing
behind it. It quotes and never infers — no averages, no estimated 1RM — because
a number the athlete cannot check against their own memory is the defect being
reported, not the fix. Deleted (tombstoned) rows and 0-rep legacy rows are never
quoted back. `CoachLogCite` renders it under every Coach claim (Today's invite
in both shells, `CoachTodayCard`, `TodayCoachWeekStrip`) and emphasised at the
top of `/coach`, where the citation *is* the argument. It reads the persist blob
rather than the store, because two mount sites are on the deliberately store-free
Today cold path — and never the plan, because quoting the output as its own
evidence is the thing being complained about.

**"AI weekly plan" was not a first-paint value that hydration corrected.** All
three Coach-invite keys live **only** in `BOOTSTRAP_EN`, so the mount sites'
own defaults — "Mission Coach", "Turn your logs into this week's plan" — had
never rendered once, in any language. `.765`'s drift guard could not see it
either: it compared defaults against the *packs*, and a bootstrap-only key is in
no pack, so it was skipped as unknown. `firstPaintFloor` now layers
`BOOTSTRAP_EN` over the packs, which is the resolution order i18next actually
uses, and the drift cap rises **193 → 209**: the measurement got honest, the app
did not get worse. 16 of those sites were invisible before; 14 are one footer
shortening ("Terms" vs "Terms of Service") and are a separate sweep.

**2. CN/HK believe the offline claim and not the implementation.** Offline scored
3.97 while the free text said *"forced cloud sync / data opacity"*. `.696` fixed
the framing inside the app, but the two screens a sceptic sees first — the gate
poster and I-Day step one — still offered only the adjective, and *"offline"* is
a word an app with forced sync would also print. `LOCAL_FIRST_COPY` gains the
**mechanism** for both entries, from one source: no account, sets written to this
device, nothing uploaded unless you sign in. A mechanism is checkable — turn off
the radio and log a set — and an adjective is not. Both now carry it in
server-rendered HTML.

**3. Data-in is its own P1, and the instruction was not to fix only speed.**
Strong/Hevy CSV import already existed, tested and free, and was unreachable in
practice: `/account` → expand a collapsed "More settings" → scroll past six
cards. A switcher arrives holding a CSV — the export is how you leave Hevy once
it caps free history at three months — and nothing in the product mentioned it at
that moment. I-Day's sign-in step and the empty logger now link
`/account#import`; the fragment **opens the `<details>` it points into** and
scrolls, because a link into a closed `<details>` lands nowhere. Both reuse the
importer's own labels so the offer cannot drift from the feature. Logging speed
is untouched — `.694` owns it, and conflating the two was the thing the shard
explicitly warned against.

**Guards: 20 mutants killed, two of them defects in my own guard.** Deleting
`<CoachLogCite />` from `CoachTodayCard` and from `/coach` left the citation
check **green**, because `/CoachLogCite/` is satisfied by the leftover `import`
line — a guard a stale import can satisfy is checking spelling, not behaviour.
It now requires the rendered element. The discovery rule also caught me twice
while being written: it first flagged `TodayProgressSection`, whose *"from your
logs"* line is about **rewards** and must stay away from the planner
(`domainBoundary` C1–C3), so the rule became key-scoped; and its staleness
assertion rejected a `CoachVoiceCard` exemption I had written from memory for a
claim that file never makes.

**Merged master mid-flight, and it cost more than a rebase would look like.** 67
builds landed while this branch was open (`.698`→`.764`, mostly the Train set
row), so the labels moved: `.745`/`.746` are shipped entries in master's archive
now, and `logBudget`'s *"no build label has two entries"* is the guard for
exactly that collision — `scripts/relabel.mjs` exists because a branch open
longer than one ship interval is guaranteed to hit it. Three conflicts were real:
**I-Day lost its sign-in step** on master, so the CSV line moved to the new last
screen; master's `WelcomePage` also reintroduced `useSearchParams`, which would
have silently undone `.765`'s first-paint fix and was caught by `firstPaintFloor`
— the guard earning its place inside one day. The **gate grew version stamps**,
kept and combined with `g()` flooring. And master had independently translated
the same three i18n keys, so its wording won everywhere and `public/locales` was
re-aligned to the packs.

**Measured against master@`.764` in a second worktree rather than argued:** `/`
256.8 KB vs 257.5, `/log` 287.3 vs 287.8, `/active` 453.5 vs 453.1. `/log`
started +1.0 KB because `HomeTodayLean` imported the citation statically on the
cold path; it is `dynamic(ssr:false)` now and two of three routes come in under
master. The `/active` +0.4 KB is the logger i18n keys that had been rendering
English in fifteen languages. No cap raised.

**Four more checks were red on master and are green here:** `i18n:coverage`
(`activeSetDropTip` reached no pack), `i18n:parity` (activeWorkout/pt over the
beachhead cap), `logBudget` (the `.669` entry had been archived **four times**),
and `hero-flows`' *"I-Day skip lands on Today"*, which clicked for a Skip button
on a screen master had deleted — fixed and verified red-then-green against
**master's own build**, so it is about the shipped flow and not this branch.
**Still red on master and left alone:** seven `/active` and `/track` a11y sheet
cases fail `toBeVisible` against the redesigned set row, and `/leaderboard` fails
axe. Reproduced on master@`.764` to be sure. Those belong to whoever shipped
`.754`–`.764`; guessing at a redesigned logger's sheet markup from here would be
worse than naming it.

**Not done:** `navCoach` stays *"AI weekly plan"*. [`primaryNav.ts`](src/lib/primaryNav.ts)
records that screen name as a decision kept on purpose, and overturning a
documented product call on one survey shard is founder work, not an agent's — so
it is named here instead: it is the last generic-AI string on first paint, and
it is the label of the screen the 2.56/5 was measured about.

Label `.766` (onto `.765`, same PR). Excellence-Override below.

Excellence-Override: www kaizen first-paint (RESULT unscored)

## 2026-08-13 — www Kaizen: first paint, and only true claims (`.765`)

Read the live site rather than the repo. `PRIVATE_MODE` is on, so `/` 307s to
`/private` — **that page is www** — and the entire visible text of its
server-rendered body was three words:

    Checking sign-in…

`PrivateTeaserClient` opened with `sessionUnlocking = true` and returned a
centred one-liner until a **6-second** bounded session probe (`.684`) resolved.
Correct fail-open logic, wired as a page-level early return, so the poster, the
promise and the only public capture point in the product were all withheld from
every cold visitor, every crawler, and anyone whose JS was slow or dead. The
other public entry, `/welcome`, served **no visible text at all**: it is
prerendered, `WelcomePage` called `useSearchParams()`, so the whole page became
a Suspense child and the HTML Vercel served was the fallback — one
`aria-hidden` `SkeletonCard`. The `/compare` redirect (`.668`), the guidebook
CTAs (`.680`) and the gate's own links all point there.

**Nothing in the suite could see either one.** e2e reads the hydrated DOM; the
source guards read source. Hydration is exactly the step neither defect
survived to. The Preview link in the brief is behind Vercel SSO (302 →
`sso-api`), so production HTML and a local gated build were the artifacts.

**Ship.** `/private` and `/welcome` resolve their query on the server
(`initialInvite`/`initialNext`, `initialEdit`) so neither needs a boundary; the
gate probe now runs *under* the poster and says so in one `aria-live` line.
Gate copy floors from a new EN-only `src/i18n/gateEn.ts` — the `.653` fix for
legal pages, applied to the front door — because the hand-typed `defaultValue`s
and the pack had drifted into **two different claims**: first paint said
*"Private beta in progress"* and *"Get notified at launch"*, hydration replaced
them with *"Invite-only open beta"* and *"Get an invite"*. Raw keys:
`guidebookTitle` and **27** `BundlePage` keys had no `defaultValue` and are
absent from `BOOTSTRAP_EN`, so they printed themselves for ~2.8s; `/bundle`'s
textless fallback became `RouteLoading`. On `/welcome`, six keys were reverted
to the 2026-07-23 "Humanize Welcome" wording and the **pack** updated to match,
because a three-week-older pack value had been silently overwriting that copy on
every hydration — a craft ship that only ever displayed for two seconds.

**Honesty, obeying `supportedRegions.ts`.** The chrome badge read *"Open beta"*
on `/regions`, `/terms` and every page that stays public while the gate is up,
to visitors who cannot get in without a code — the landing already says
*invite-only*. It now reads **Invite-only beta** whenever the gate is on. And
the gate waitlist was asking **every** territory for an email under the promise
*"We'll email you when a seat opens"*, including Europe, Canada, Ukraine and the
57 OIC states, where signup and checkout are hard-blocked and no seat ever
opens. `waitlistTerritory.ts` reads the `blocked` flag `/api/geo` had already
been computing and nothing had ever read: a named exclusion gets the policy
sentence and `/regions` instead of the ask, an *unconfirmed* country (XX / Tor)
keeps the form and gets the notice, and anything unreadable **fails open** — a
supported athlete must never be told they are excluded because a fetch changed
shape. The language picker (fr/de/it/ar/id, every one of those markets blocked)
now says in one line that a language is not a territory.

**Logger chrome.** Measured at 390×844 with `NEXT_PUBLIC_POSTHOG_KEY` set: the
consent banner is `fixed bottom-0 z-[60]` over a `z-50` tab bar, y=702–844,
covering **Start Workout**, the Just Go card, and all five tabs. Hard rule 2
says the free logger is never gated; chrome parked on its button is a gate with
manners. `ScreenDock` already documents this exact shape as `RestTimerBar`
"floating over the very set row it describes", so the banner portals into the
same host and reserves its height. Re-measured: nothing covered. The key is
unset in production, so this was a defect waiting for the day analytics is
switched on.

**Guards.** `firstPaintFloor.test.ts` **discovers** rather than enumerates —
both defects were ordinary-looking files no allowlist would have named. Every
`t()` call site must pass `defaultValue` or hold a `BOOTSTRAP_EN` key; public
routes may not first-paint a textless placeholder (resolving one level into the
fallback component, `.253`'s rule, so `<RouteLoading label="Account"/>` is
judged on what it renders); copy drift is a ratchet at **193** with the four
front-door files pinned at zero; computed-key calls are a ratchet at 9. A floor
on the scan itself (≥2000 call sites) because both defects were things a check
looked at and did not see. `gate-smoke` now reads the served **bytes** of
`/private` and `/welcome` — red against production today, green against a local
gated build. **13 mutants killed**, two of which were defects in the guard
found by mutating it: a single-quote-only key regex that classified 25 raw keys
as unknowable, and a `/welcome` needle that matched `<title>` and so passed on a
blank body. Also repaired two gate steps that were **already red on master**:
i18n parity (3 `learn` keys over the beachhead cap for es/fr/pt) and i18n
coverage (3 keys used in the UI with no EN pack).

**The gate was red on `master` before this branch existed, in five places, and
nobody knew which.** Measured by building `master` in a second worktree and
running the same steps against both. Repaired here because four of them are
cheap and a permanently-red step teaches people to stop reading the output:
`lint` (a `require()` in `readinessDisplay.test.ts` since `.643`), `i18n:parity`
(3 `learn` keys over the beachhead cap for es/fr/pt), `i18n:coverage` (3 keys
used in the UI with no EN pack), and hero e2e — `mobile-nav.spec.ts`'s reach
case has asserted the *opposite* of `.695`'s pillar demotion since `.695`
shipped, on a fresh device where the demotion is in force. It now tests both
halves: pillars **absent** before the first workout, everything inside the
budget once `workout-tracker-storage` holds a session; `/nutrition` moved to the
always-reachable list because Fuel is the fourth tab and survives a demotion
that only drops the rail group.

Two remain, both stated rather than papered over. **Bundle budget** was already
breached on `master` — `/log` +7.3 KB, `/active` +13.6 KB against caps that may
only ratchet down. This branch is +0.0 on `/log` (after splitting
`isClientPrivateGateEnabled` into its own module so `AppHeader`, which sits in
every route's shared chunk, stopped dragging `publicRoutes.ts` along) and
**+0.3 KB on `/active`**, which is the two logger i18n keys that fix the
coverage hole in fourteen languages. The cap is not raised: correct copy for
`activeReentryStart`/`Desc` is worth 0.3 KB on a route already 13.6 over, and if
the founder disagrees the keys are one revert. **`/leaderboard` fails axe
serious/critical** on `master` too — untouched here, since that is a design call
on a surface this PR has no business in.

**Not done, deliberately:** no `PRIVATE_MODE` flip, no locale added or removed
(a language is not a territory), no landing redesign, no traction claims. Left
for the founder: `welcomeBegin` still says *"Begin"* because
`first-90.spec.ts` taps that exact label while the newer component copy says
*"Continue"* — a copy call with a test coupling, not an agent's. `public/locales`
is ~3,100 lines stale against `src/i18n`; only this PR's keys were patched, and
that overlay has been opt-in since `.222`. Three production smoke checks
unrelated to this ship are red on the live deploy: `/locales` JSON while gated,
two `/api/school/class/[code]/*` handlers, and the unsigned-PayPal-webhook
rejection.

**Verified:** gate steps 1–16 green (including excellence-gate override,
coverage floors, design system, token sync, production build), hero e2e **71
passed**, a11y **58 passed** with the one pre-existing `/leaderboard` failure,
unit **2473**, route contract **47**. The ungated Preview named in the brief is
behind Vercel deployment protection (302 → `sso-api`) with no credentials on
this VM, so the artifacts were production HTML over the wire plus a local
`PRIVATE_MODE=true` build walked in headless Chromium at 390×844.

Label `.765` (onto master `.697`). Excellence-Override below.

Excellence-Override: www kaizen first-paint (RESULT unscored)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-669-for-714.md](docs/archive/log/LOG-rotate-669-for-714.md).

## 2026-08-13 — Free plate math + warmup on the Train set row (`.764`)

Garage utility on the live Train set row. Barbell rows show **plates per
side** (`25 + 15 / side`) when load is above the bar. **Add warmups** inserts
a 40/60/80 ramp; set column uses **W** then 1..n. Live set number toggles
Work ↔ Warmup. Header Plates sheet unchanged. Free forever — not Bundle bait.

**Ship:** `setRowPlateLine` + `warmupRamp.ts`; compact + desktop row. Does not
rewrite Prev, ghost, vs-last, L/R, RIR, tempo, or BW+.

Label `.764` (onto master `.763`). Originally reserved `.708` / `.705`; landed as `.764` past master `.763`.
Excellence-Override below.

Excellence-Override: free plate math + warmup (logger)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-749-for-764.md](docs/archive/log/LOG-rotate-749-for-764.md).
## 2026-08-13 — Home gym kit on the free logger (`.763`)

Device-local Home gym kit (barbell · rack · plates · dumbbells · pull-up-bar ·
floor) on Account. Train Just Go and Coach filter substitutions from it —
never rank. Unset keeps the I-Day 3-profile. Explicit empty save is floor
only ($0). I-Day seeds bodyweight/dumbbells only. Train empty Start stays
repeat-last / blank — not Just Go. Free, no account, not Bundle bait.

**Ship:** `homeGymKit.ts` + `HomeGymKitCard`; Just Go / Coach overlay.
Identity emit only. Free logger ungated.

Label `.763` (onto master `.762`). Originally reserved `.733`; landed as `.763` past master `.762`.
Excellence-Override below.

Excellence-Override: free home-gym kit

Rotated LOG oldest → [docs/archive/log/LOG-rotate-748-for-763.md](docs/archive/log/LOG-rotate-748-for-763.md).
## 2026-08-13 — F-017 first-set verify iterate (`.762`)

Verify + harden the #523 / `.746` first-set contract. `normalizeAppPath`
treats nullish as `/` and strips hash so `/active#x` cannot show the chip.
Header chip coerces `usePathname() ?? ''`. Welcome `welcomeBegin` fallback
is **Begin** (matches EN / first-90). Extended source-scan guards: one-hop
Train children, TAP_BUDGET 5, speech off first paint, `handleLogSet` has
no `await` / `getUser`. Cold path was not run in a browser this session.

**Ship:** `firstSetUngated` edges + HeaderAuthChip + Welcome fallback.
Free logger ungated. `PRIVATE_MODE` unchanged.

Label `.762` (onto master `.761`). Originally reserved `.750`; landed as `.762` past master `.761`.
Excellence-Override below.

Excellence-Override: F-017 first-set verify iterate

Rotated LOG oldest → [docs/archive/log/LOG-rotate-747-for-762.md](docs/archive/log/LOG-rotate-747-for-762.md).
## 2026-08-13 — e1RM from logged sets (educational) (`.761`)

After a working set is saved, the Active exercise row shows an **Epley**
estimated 1RM from that session's countable sets. Guests — local sets, no
account. Warmup W and load-0 skip do not feed the formula. Hideable on-device.
Copy names the formula and says it is an estimate, not a tested max. No
"test your 1RM" CTA. Field test / hard-session stay in #505 / #519.

**Ship:** `sessionE1rmFromSets` + `epley1rm`; line on `ActiveExerciseHeader`;
overflow hide/show (`mw_show_session_e1rm`). Free logger ungated. One concern.

Label `.761` (onto master `.760`). Originally reserved `.739`; landed as `.761` past master `.760`.
Excellence-Override below.

Excellence-Override: e1RM estimate

Rotated LOG oldest → [docs/archive/log/LOG-rotate-746-for-761.md](docs/archive/log/LOG-rotate-746-for-761.md).
## 2026-08-13 — Vs last session on the set row (`.760`)

After a **working** set saves, a tiny token shows vs last session: `+2.5 kg`,
`+1 rep`, or **same**. First-ever and warmups stay blank. Independent of Prev
and last-set ghost prefill. Guests use local history.

**Ship:** `vsLastSet.ts` working-set index + delta; compact + desktop row token.
Offline, no account.

Label `.760` (onto master `.759`). Originally reserved `.741`; landed as `.760` past master `.759`.
Excellence-Override below.

Excellence-Override: vs-last on the set row

Rotated LOG oldest → [docs/archive/log/LOG-rotate-745-for-760.md](docs/archive/log/LOG-rotate-745-for-760.md).
## 2026-08-13 — Last-set ghost on the Train set row (`.759`)

When this exercise has been worked before, the live row can show a **ghost** of
the last **working** set (not warmup W): weight × reps. One tap accepts it into
the dial. First-ever stays empty. Does not auto-log or start rest.

**Ship:** `lastSetGhost.ts`; compact + desktop `LastSetGhostButton` (outline,
never poster red). Reuses `patchesForUseNext`. Offline, no account.

Label `.759` (onto master `.758`). Originally reserved `.738`; landed as `.759` past master `.758`.
Excellence-Override below.

Excellence-Override: last-set ghost

Rotated LOG oldest → [docs/archive/log/LOG-rotate-744-for-759.md](docs/archive/log/LOG-rotate-744-for-759.md).
## 2026-08-13 — Bodyweight + load on the Train set row (`.758`)

On pull-ups, push-ups, and dips the load field is **extra weight** (belt/vest),
not a bar. The row reads `8 × BW` or `8 × BW + 20 kg`. Leave load at **0** to
log bodyweight only. Coach volume counts `reps × added load` on working sets;
a warmup belt still does not count.

**Ship:** `bodyweightLoad.ts` detect + format; compact `BW+` stepper; desktop
table prefix. No new set field. Free logger. Offline, no account.

Label `.758` (onto master `.757`). Originally reserved `.735`; landed as `.758` past master `.757`.
Excellence-Override below.

Excellence-Override: bodyweight+load on the set row

Rotated LOG oldest → [docs/archive/log/LOG-rotate-743-for-758.md](docs/archive/log/LOG-rotate-743-for-758.md).
## 2026-08-13 — Optional tempo on the set row (`.757`)

Optional **ecc/pause/con** (`3-1-1`) on a completed set. Empty is valid.
Never required. Never blocks Log set. Last tempo for that exercise prefills
the next logged set. Does not feed coach load or rewards.

**Ship:** `tempo.ts` parse + last-tempo recall; `rateSetTempo` after log;
compact `SetTempoField` on completed rows beside RPE/RIR. Sync keeps `side`,
`rir`, and `tempo`. Offline, no account.

Label `.757` (onto master `.756`). Originally reserved `.734`; landed as `.757` past master `.756`.
Excellence-Override below.

Excellence-Override: optional set-row tempo

Rotated LOG oldest → [docs/archive/log/LOG-rotate-714-for-757.md](docs/archive/log/LOG-rotate-714-for-757.md).
## 2026-08-13 — Optional RIR on the set row (`.756`)

Optional integer **0–5 reps in reserve** on a completed set. Empty is valid.
Never required. Never replaces RPE. Log set stays ungated.

**Ship:** `rir.ts` parse; `rateSetRir` after log; compact `SetRirSelect` on
completed rows beside RPE. Sync keeps `side` and `rir`. Offline, no account.

Label `.756` (onto master `.755`). Originally reserved `.725`; landed as `.756` past master `.755`.
Excellence-Override below.

Excellence-Override: optional RIR

Rotated LOG oldest → [docs/archive/log/LOG-rotate-697-for-756.md](docs/archive/log/LOG-rotate-697-for-756.md).
## 2026-08-13 — Unilateral L/R on the set log (`.755`)

Optional **L / R / Alt** on a unilateral exercise (lunge, DB row, split squat)
without splitting the lift into two movements or two social posts. Investigation
found no laterality field on `Exercise`, `LoggedSet`, mw-core, or Android —
`SetKind` stays warmup/failure/drop; a superset pair is not left/right.

**Ship:** `side?: SetSide` on the logged set; `isUnilateralExercise` detector;
chips on compact `LogConsole` + desktop footer; quiet badge on the same table
row. Default unset. After L, suggest R on the next planned set of the same
exercise. Bilateral strips stray `side` on complete. Offline, no account.
Speech never owns this.

Label `.755` (onto master `.754`). Originally reserved `.724`; landed as `.755` past master `.754`.
Excellence-Override below.

Excellence-Override: unilateral L/R

Rotated LOG oldest → [docs/archive/log/LOG-rotate-696-for-755.md](docs/archive/log/LOG-rotate-696-for-755.md).
## 2026-08-13 — Drop sets on the set log (`.754`)

The free logger already had `SetKind` `'drop'` — volume, PR skip, sync, CSV,
and a Kind chip. Tagging Drop did not start a drop. Strong/Hevy users expect
one control after a working set: same exercise, lower load, no rest.

**Ship:** deepen the existing kind. Footer **Drop** (`canStartDrop` after a
working set) marks the next set `kind: 'drop'`, prefills **−20%** of the parent
load (unit step, always below when load > 0), and **skips rest**. Compose with
last-rest via `composeDropRest`. Offline, no account. Set-log table stays first
paint. No XP, no social, no shame.

Label `.754` (onto master `.753`). Originally reserved `.723`; landed as `.754` past master `.753`.
Excellence-Override below.

Excellence-Override: drop sets

Rotated LOG oldest → [docs/archive/log/LOG-rotate-695-for-754.md](docs/archive/log/LOG-rotate-695-for-754.md).
