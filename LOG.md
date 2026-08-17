# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md) · [`.283` for `.298`](docs/archive/log/LOG-rotate-298.md) · [`.284` for `.299`](docs/archive/log/LOG-rotate-299.md) · [`.285` for `.300`](docs/archive/log/LOG-rotate-300.md) · [`.286` for `.301`](docs/archive/log/LOG-rotate-301.md) · [`.287` for `.302`](docs/archive/log/LOG-rotate-302.md) · [`.288` for `.303`](docs/archive/log/LOG-rotate-303.md) · [`.289` for `.304`](docs/archive/log/LOG-rotate-304.md) · [`.290` for `.305`](docs/archive/log/LOG-rotate-305.md) · [`.291` for `.306`](docs/archive/log/LOG-rotate-306.md) · [`.292` for `.307`](docs/archive/log/LOG-rotate-307.md) · [`.293` for `.308`](docs/archive/log/LOG-rotate-308.md) · [`.294` for `.309`](docs/archive/log/LOG-rotate-309.md) · [`.295` for `.310`](docs/archive/log/LOG-rotate-310.md) · [`.296` for `.311`](docs/archive/log/LOG-rotate-311.md) · [`.297` for `.312`](docs/archive/log/LOG-rotate-312.md) · [`.298` for `.313`](docs/archive/log/LOG-rotate-313.md) · [`.299` for `.314`](docs/archive/log/LOG-rotate-314.md) · [`.300` for `.315`](docs/archive/log/LOG-rotate-315.md). · [`.301` for `.316`](docs/archive/log/LOG-rotate-316.md). · [`.302` for `.317`](docs/archive/log/LOG-rotate-317.md). · [`.303` for `.318`](docs/archive/log/LOG-rotate-318.md). · [`.304` for `.319`](docs/archive/log/LOG-rotate-319.md). · [`.305` for `.320`](docs/archive/log/LOG-rotate-320.md). · [`.306` for `.321`](docs/archive/log/LOG-rotate-321.md). · [`.307` for `.322`](docs/archive/log/LOG-rotate-322.md). · [`.308` for `.323`](docs/archive/log/LOG-rotate-323.md). · [`.309` for `.324`](docs/archive/log/LOG-rotate-324.md). · [`.310` for `.325`](docs/archive/log/LOG-rotate-325.md). · [`.311` for `.326`](docs/archive/log/LOG-rotate-326.md). · [`.312` for `.327`](docs/archive/log/LOG-rotate-327.md). · [`.313` for `.328`](docs/archive/log/LOG-rotate-328.md). · [`.314` for `.329`](docs/archive/log/LOG-rotate-329.md). · [`.315` for `.330`](docs/archive/log/LOG-rotate-330.md). · [`.316` for `.331`](docs/archive/log/LOG-rotate-331.md). · [`.317` for `.332`](docs/archive/log/LOG-rotate-332.md). · [`.318` for `.333`](docs/archive/log/LOG-rotate-333.md). · [`.319` for `.334`](docs/archive/log/LOG-rotate-334.md). · [`.320` for `.335`](docs/archive/log/LOG-rotate-335.md). · [`.321` for `.336`](docs/archive/log/LOG-rotate-336.md). · [`.322` for `.337`](docs/archive/log/LOG-rotate-337.md). · [`.323` for `.338`](docs/archive/log/LOG-rotate-338.md). · [`.324` for `.339`](docs/archive/log/LOG-rotate-339.md). · [`.325` for `.340`](docs/archive/log/LOG-rotate-340.md). · [`.326` for `.341`](docs/archive/log/LOG-rotate-341.md). · [`.327` for `.342`](docs/archive/log/LOG-rotate-342.md). · [`.328` for `.343`](docs/archive/log/LOG-rotate-343.md). · [`.329` for `.344`](docs/archive/log/LOG-rotate-344.md). · [`.330` for `.345`](docs/archive/log/LOG-rotate-345.md). · [`.331` for `.346`](docs/archive/log/LOG-rotate-346.md). · [`.332` for `.347`](docs/archive/log/LOG-rotate-347.md). · [`.333` for `.348`](docs/archive/log/LOG-rotate-348.md). · [`.334` for `.349`](docs/archive/log/LOG-rotate-349.md). · [`.335` for `.350`](docs/archive/log/LOG-rotate-350.md). · [`.336` for `.351`](docs/archive/log/LOG-rotate-351.md). · [`.337` for `.352`](docs/archive/log/LOG-rotate-352.md). · [`.338` for `.353`](docs/archive/log/LOG-rotate-353.md). · [`.339` for `.354`](docs/archive/log/LOG-rotate-354.md). · [`.340` for `.355`](docs/archive/log/LOG-rotate-355.md). · [`.341` for `.356`](docs/archive/log/LOG-rotate-356.md). · [`.342` for `.357`](docs/archive/log/LOG-rotate-357.md). · [`.343` for `.358`](docs/archive/log/LOG-rotate-358.md). · [`.344` for `.359`](docs/archive/log/LOG-rotate-359.md). · [`.345` for `.360`](docs/archive/log/LOG-rotate-360.md). · [`.346` for `.361`](docs/archive/log/LOG-rotate-361.md). · [`.347` for `.362`](docs/archive/log/LOG-rotate-362.md). · [`.348` for `.363`](docs/archive/log/LOG-rotate-363.md). · [`.349` for `.364`](docs/archive/log/LOG-rotate-364.md). · [`.350` for `.365`](docs/archive/log/LOG-rotate-365.md). · [`.351` for `.366`](docs/archive/log/LOG-rotate-366.md). · [`.352` for `.367`](docs/archive/log/LOG-rotate-367.md). · [`.353` for `.368`](docs/archive/log/LOG-rotate-368.md). · [`.354` for `.369`](docs/archive/log/LOG-rotate-369.md). · [`.355` for `.370`](docs/archive/log/LOG-rotate-370.md). · [`.356` for `.371`](docs/archive/log/LOG-rotate-371.md). · [`.357` for `.372`](docs/archive/log/LOG-rotate-372.md). · [`.358` for `.373`](docs/archive/log/LOG-rotate-373.md). · [`.359` for `.374`](docs/archive/log/LOG-rotate-374.md). · [`.360` for `.375`](docs/archive/log/LOG-rotate-375.md). · [`.361` for `.376`](docs/archive/log/LOG-rotate-376.md). · [`.362` for `.377`](docs/archive/log/LOG-rotate-377.md). · [`.363` for `.378`](docs/archive/log/LOG-rotate-378.md). · [`.364` for `.379`](docs/archive/log/LOG-rotate-379.md). · [`.365` for `.380`](docs/archive/log/LOG-rotate-380.md). · [`.366` for `.381`](docs/archive/log/LOG-rotate-381.md). · [`.367` for `.382`](docs/archive/log/LOG-rotate-382.md). · [`.368` for `.383`](docs/archive/log/LOG-rotate-383.md). · [`.369` for `.384`](docs/archive/log/LOG-rotate-384.md). · [`.370` for `.385`](docs/archive/log/LOG-rotate-385.md). · [`.371` for `.386`](docs/archive/log/LOG-rotate-386.md). · [`.372` for `.387`](docs/archive/log/LOG-rotate-387.md). · [`.373` for `.388`](docs/archive/log/LOG-rotate-388.md). · [`.374` for `.389`](docs/archive/log/LOG-rotate-389.md). · [`.375` for `.390`](docs/archive/log/LOG-rotate-390.md). · [`.376` for `.391`](docs/archive/log/LOG-rotate-391.md). · [`.377` for `.392`](docs/archive/log/LOG-rotate-392.md). · [`.378` for `.393`](docs/archive/log/LOG-rotate-393.md). · [`.379` for `.394`](docs/archive/log/LOG-rotate-394.md). · [`.380` for `.395`](docs/archive/log/LOG-rotate-395.md). · [`.381` for `.396`](docs/archive/log/LOG-rotate-396.md). · [`.382` for `.397`](docs/archive/log/LOG-rotate-397.md). · [`.383` for `.398`](docs/archive/log/LOG-rotate-398.md). · [`.384` for `.399`](docs/archive/log/LOG-rotate-399.md). · [`.385` for `.400`](docs/archive/log/LOG-rotate-400.md). · [`.386` for `.401`](docs/archive/log/LOG-rotate-401.md). · [`.387` for `.402`](docs/archive/log/LOG-rotate-402.md). · [`.388` for `.403`](docs/archive/log/LOG-rotate-403.md). · [`.389` for `.404`](docs/archive/log/LOG-rotate-404.md). · [`.390` for `.405`](docs/archive/log/LOG-rotate-405.md). · [`.391` for `.406`](docs/archive/log/LOG-rotate-406.md). · [`.392` for `.407`](docs/archive/log/LOG-rotate-407.md). · [`.393` for `.408`](docs/archive/log/LOG-rotate-408.md). · [`.394` for `.409`](docs/archive/log/LOG-rotate-409.md). · [`.395` for `.410`](docs/archive/log/LOG-rotate-410.md). · [`.396` for `.411`](docs/archive/log/LOG-rotate-411.md). · [`.397` for `.412`](docs/archive/log/LOG-rotate-412.md). · [`.398` for `.413`](docs/archive/log/LOG-rotate-413.md). · [`.399` for `.414`](docs/archive/log/LOG-rotate-414.md). · [`.400` for `.415`](docs/archive/log/LOG-rotate-415.md). · [`.401` for `.416`](docs/archive/log/LOG-rotate-416.md). · [`.402` for `.417`](docs/archive/log/LOG-rotate-417.md). · [`.403` for `.418`](docs/archive/log/LOG-rotate-418.md). · [`.404` for `.419`](docs/archive/log/LOG-rotate-419.md). · [`.405` for `.420`](docs/archive/log/LOG-rotate-420.md). · [`.406` for `.421`](docs/archive/log/LOG-rotate-421.md). · [`.407` for `.422`](docs/archive/log/LOG-rotate-422.md). · [`.408` for `.423`](docs/archive/log/LOG-rotate-423.md). · [`.409` for `.424`](docs/archive/log/LOG-rotate-424.md). · [`.410` for `.425`](docs/archive/log/LOG-rotate-425.md). · [`.411` for `.426`](docs/archive/log/LOG-rotate-426.md). · [`.412` for `.427`](docs/archive/log/LOG-rotate-427.md). · [`.413` for `.428`](docs/archive/log/LOG-rotate-428.md). · [`.414` for `.429`](docs/archive/log/LOG-rotate-429.md). · [`.415` for `.430`](docs/archive/log/LOG-rotate-430.md). · [`.416` for `.431`](docs/archive/log/LOG-rotate-431.md). · [`.417` for `.432`](docs/archive/log/LOG-rotate-432.md). · [`.418` for `.433`](docs/archive/log/LOG-rotate-433.md). · [`.419` for `.434`](docs/archive/log/LOG-rotate-434.md). · [`.420` for `.435`](docs/archive/log/LOG-rotate-435.md). · [`.421` for `.436`](docs/archive/log/LOG-rotate-436.md). · [`.422` for `.437`](docs/archive/log/LOG-rotate-437.md). · [`.423` for `.438`](docs/archive/log/LOG-rotate-438.md). · [`.424` for `.439`](docs/archive/log/LOG-rotate-439.md). · [`.425` for `.440`](docs/archive/log/LOG-rotate-440.md). · [`.426` for `.441`](docs/archive/log/LOG-rotate-441.md). · [`.427` for `.442`](docs/archive/log/LOG-rotate-442.md). · [`.428` for `.443`](docs/archive/log/LOG-rotate-443.md). · [`.429` for `.444`](docs/archive/log/LOG-rotate-444.md). · [`.430` for `.445`](docs/archive/log/LOG-rotate-445.md). · [`.431` for `.446`](docs/archive/log/LOG-rotate-446.md). · [`.432` for `.447`](docs/archive/log/LOG-rotate-447.md). · [`.433` for `.448`](docs/archive/log/LOG-rotate-448.md). · [`.434` for `.449`](docs/archive/log/LOG-rotate-449.md). · [`.435` for `.450`](docs/archive/log/LOG-rotate-450.md). · [`.436` for `.451`](docs/archive/log/LOG-rotate-451.md). · [`.437` for `.452`](docs/archive/log/LOG-rotate-452.md). · [`.438` for `.453`](docs/archive/log/LOG-rotate-453.md). · [`.439` for `.454`](docs/archive/log/LOG-rotate-454.md). · [`.440` for `.455`](docs/archive/log/LOG-rotate-455.md). · [`.441` for `.456`](docs/archive/log/LOG-rotate-456.md). · [`.442` for `.457`](docs/archive/log/LOG-rotate-457.md). · [`.443` for `.458`](docs/archive/log/LOG-rotate-458.md). · [`.444` for `.459`](docs/archive/log/LOG-rotate-459.md). · [`.445` for `.460`](docs/archive/log/LOG-rotate-460.md). · [`.446` for `.461`](docs/archive/log/LOG-rotate-461.md). · [`.447` for `.462`](docs/archive/log/LOG-rotate-462.md). · [`.448` for `.463`](docs/archive/log/LOG-rotate-463.md). · [`.449` for `.464`](docs/archive/log/LOG-rotate-464.md). · [`.450` for `.465`](docs/archive/log/LOG-rotate-465.md). · [`.451` for `.466`](docs/archive/log/LOG-rotate-466.md). · [`.452` for `.467`](docs/archive/log/LOG-rotate-467.md). · [`.453` for `.468`](docs/archive/log/LOG-rotate-468.md). · [`.454` for `.469`](docs/archive/log/LOG-rotate-469.md). · [`.455` for `.470`](docs/archive/log/LOG-rotate-470.md). · [`.456` for `.471`](docs/archive/log/LOG-rotate-471.md). · [`.457` for `.472`](docs/archive/log/LOG-rotate-472.md). · [`.458` for `.473`](docs/archive/log/LOG-rotate-473.md). · [`.459` for `.474`](docs/archive/log/LOG-rotate-474.md). · [`.460` for `.475`](docs/archive/log/LOG-rotate-475.md). · [`.461` for `.476`](docs/archive/log/LOG-rotate-476.md). · [`.462` for `.477`](docs/archive/log/LOG-rotate-477.md). · [`.463` for `.478`](docs/archive/log/LOG-rotate-478.md). · [`.464` for `.479`](docs/archive/log/LOG-rotate-479.md). · [`.465` for `.480`](docs/archive/log/LOG-rotate-480.md). · [`.466` for `.481`](docs/archive/log/LOG-rotate-481.md). · [`.467` for `.482`](docs/archive/log/LOG-rotate-482.md). · [`.468` for `.483`](docs/archive/log/LOG-rotate-483.md). · [`.469` for `.484`](docs/archive/log/LOG-rotate-484.md). · [`.470` for `.485`](docs/archive/log/LOG-rotate-485.md). · [`.471` for `.486`](docs/archive/log/LOG-rotate-486.md). · [`.472` for `.487`](docs/archive/log/LOG-rotate-487.md). · [`.473` for `.488`](docs/archive/log/LOG-rotate-488.md). · [`.474` for `.489`](docs/archive/log/LOG-rotate-489.md). · [`.475` for `.490`](docs/archive/log/LOG-rotate-490.md). · [`.476` for `.491`](docs/archive/log/LOG-rotate-491.md). · [`.477` for `.492`](docs/archive/log/LOG-rotate-492.md). · [`.478` for `.493`](docs/archive/log/LOG-rotate-493.md). · [`.479` for `.494`](docs/archive/log/LOG-rotate-494.md). · [`.480` for `.495`](docs/archive/log/LOG-rotate-495.md). · [`.481` for `.496`](docs/archive/log/LOG-rotate-496.md). · [`.482` for `.497`](docs/archive/log/LOG-rotate-497.md). · [`.483` for `.498`](docs/archive/log/LOG-rotate-498.md). · [`.484` for `.499`](docs/archive/log/LOG-rotate-499.md). · [`.485` for `.500`](docs/archive/log/LOG-rotate-500.md). · [`.486` for `.501`](docs/archive/log/LOG-rotate-501.md). · [`.487` for `.502`](docs/archive/log/LOG-rotate-502.md). · [`.488` for `.503`](docs/archive/log/LOG-rotate-503.md). · [`.490` for `.505`](docs/archive/log/LOG-rotate-505.md). · [`.491` for `.506`](docs/archive/log/LOG-rotate-506.md). · [`.579` for `.594`](docs/archive/log/LOG-rotate-594.md). · [`.580` for `.595`](docs/archive/log/LOG-rotate-595.md).


--- · [`.492` for `.507`](docs/archive/log/LOG-rotate-507.md). · [`.493` for `.508`](docs/archive/log/LOG-rotate-508.md). · [`.494` for `.509`](docs/archive/log/LOG-rotate-509.md). · [`.495` for `.510`](docs/archive/log/LOG-rotate-510.md). · [`.496` for `.511`](docs/archive/log/LOG-rotate-511.md). · [`.497` for `.512`](docs/archive/log/LOG-rotate-512.md). · [`.498` for `.513`](docs/archive/log/LOG-rotate-513.md). · [`.499` for `.514`](docs/archive/log/LOG-rotate-514.md). · [`.500` for `.515`](docs/archive/log/LOG-rotate-515.md). · [`.501` for `.516`](docs/archive/log/LOG-rotate-516.md). · [`.502` for `.517`](docs/archive/log/LOG-rotate-517.md). · [`.503` for `.518`](docs/archive/log/LOG-rotate-518.md). · [`.504` for `.519`](docs/archive/log/LOG-rotate-519.md). · [`.505` for `.520`](docs/archive/log/LOG-rotate-520.md). · [`.506` for `.521`](docs/archive/log/LOG-rotate-521.md). · [`.507` for `.522`](docs/archive/log/LOG-rotate-522.md). · [`.508` for `.523`](docs/archive/log/LOG-rotate-523.md). · [`.509` for `.524`](docs/archive/log/LOG-rotate-524.md). · [`.510` for `.525`](docs/archive/log/LOG-rotate-525.md). · [`.511` for `.526`](docs/archive/log/LOG-rotate-526.md). · [`.512` for `.527`](docs/archive/log/LOG-rotate-527.md). · [`.513` for `.528`](docs/archive/log/LOG-rotate-528.md). · [`.514` for `.529`](docs/archive/log/LOG-rotate-529.md). · [`.515` for `.530`](docs/archive/log/LOG-rotate-530.md). · [`.516` for `.531`](docs/archive/log/LOG-rotate-531.md). · [`.517` for `.532`](docs/archive/log/LOG-rotate-532.md). · [`.518` for `.533`](docs/archive/log/LOG-rotate-533.md). · [`.519` for `.534`](docs/archive/log/LOG-rotate-534.md). · [`.520` for `.535`](docs/archive/log/LOG-rotate-535.md). · [`.521` for `.536`](docs/archive/log/LOG-rotate-536.md). · [`.522` for `.537`](docs/archive/log/LOG-rotate-537.md). · [`.523` for `.538`](docs/archive/log/LOG-rotate-538.md). · [`.524` for `.539`](docs/archive/log/LOG-rotate-539.md). · [`.525` for `.540`](docs/archive/log/LOG-rotate-540.md). · [`.526` for `.541`](docs/archive/log/LOG-rotate-541.md). · [`.527` for `.542`](docs/archive/log/LOG-rotate-542.md). · [`.528` for `.543`](docs/archive/log/LOG-rotate-543.md). · [`.529` for `.544`](docs/archive/log/LOG-rotate-544.md). · [`.530` for `.545`](docs/archive/log/LOG-rotate-545.md). · [`.531` for `.546`](docs/archive/log/LOG-rotate-546.md). · [`.532` for `.547`](docs/archive/log/LOG-rotate-547.md). · [`.533` for `.548`](docs/archive/log/LOG-rotate-548.md). · [`.534` for `.549`](docs/archive/log/LOG-rotate-549.md). · [`.535` for `.550`](docs/archive/log/LOG-rotate-550.md). · [`.536` for `.551`](docs/archive/log/LOG-rotate-551.md). · [`.537` for `.552`](docs/archive/log/LOG-rotate-552.md). · [`.538` for `.553`](docs/archive/log/LOG-rotate-553.md). · [`.539` for `.554`](docs/archive/log/LOG-rotate-554.md). · [`.540` for `.555`](docs/archive/log/LOG-rotate-555.md). · [`.541` for `.556`](docs/archive/log/LOG-rotate-556.md). · [`.542` for `.557`](docs/archive/log/LOG-rotate-557.md). · [`.543` for `.558`](docs/archive/log/LOG-rotate-558.md). · [`.544` for `.559`](docs/archive/log/LOG-rotate-559.md). · [`.545` for `.560`](docs/archive/log/LOG-rotate-560.md). · [`.546` for `.561`](docs/archive/log/LOG-rotate-561.md). · [`.547` for `.562`](docs/archive/log/LOG-rotate-562.md). · [`.548` for `.563`](docs/archive/log/LOG-rotate-563.md). · [`.549` for `.564`](docs/archive/log/LOG-rotate-564.md). · [`.550` for `.565`](docs/archive/log/LOG-rotate-565.md). · [`.551` for `.566`](docs/archive/log/LOG-rotate-566.md). · [`.552` for `.567`](docs/archive/log/LOG-rotate-567.md). · [`.553` for `.568`](docs/archive/log/LOG-rotate-568.md). · [`.554` for `.569`](docs/archive/log/LOG-rotate-569.md). · [`.555` for `.570`](docs/archive/log/LOG-rotate-570.md). · [`.556` for `.571`](docs/archive/log/LOG-rotate-571.md). · [`.557` for `.572`](docs/archive/log/LOG-rotate-572.md). · [`.558` for `.573`](docs/archive/log/LOG-rotate-573.md). · [`.559` for `.574`](docs/archive/log/LOG-rotate-574.md). · [`.560` for `.575`](docs/archive/log/LOG-rotate-575.md). · [`.561` for `.576`](docs/archive/log/LOG-rotate-576.md). · [`.562` for `.577`](docs/archive/log/LOG-rotate-577.md). · [`.563` for `.578`](docs/archive/log/LOG-rotate-578.md). · [`.564` for `.579`](docs/archive/log/LOG-rotate-579.md). · [`.565` for `.580`](docs/archive/log/LOG-rotate-580.md). · [`.566` for `.581`](docs/archive/log/LOG-rotate-581.md). · [`.567` for `.582`](docs/archive/log/LOG-rotate-582.md). · [`.568` for `.583`](docs/archive/log/LOG-rotate-583.md). · [`.569` for `.584`](docs/archive/log/LOG-rotate-584.md). · [`.570` for `.585`](docs/archive/log/LOG-rotate-585.md). · [`.571` for `.586`](docs/archive/log/LOG-rotate-586.md). · [`.572` for `.587`](docs/archive/log/LOG-rotate-587.md). · [`.573` for `.588`](docs/archive/log/LOG-rotate-588.md). · [`.574` for `.589`](docs/archive/log/LOG-rotate-589.md). · [`.575` for `.590`](docs/archive/log/LOG-rotate-590.md). · [`.576` for `.591`](docs/archive/log/LOG-rotate-591.md). · [`.577` for `.592`](docs/archive/log/LOG-rotate-592.md). · [`.578` for `.593`](docs/archive/log/LOG-rotate-593.md). · [`.581` for `.596`](docs/archive/log/LOG-rotate-596.md). · [`.582` for `.597`](docs/archive/log/LOG-rotate-597.md). · [`.583` for `.598`](docs/archive/log/LOG-rotate-598.md). · [`.584` for `.599`](docs/archive/log/LOG-rotate-599.md). · [`.585` for `.600`](docs/archive/log/LOG-rotate-600.md). · [`.586` for `.601`](docs/archive/log/LOG-rotate-601.md). · [`.587` for `.602`](docs/archive/log/LOG-rotate-602.md). · [`.588` for `.603`](docs/archive/log/LOG-rotate-603.md). · [`.590` for `.606`](docs/archive/log/LOG-rotate-606.md). · [`.596` for `.612`](docs/archive/log/LOG-rotate-612.md). · [`.597` for `.613`](docs/archive/log/LOG-rotate-613.md). · [`.599` for `.614`](docs/archive/log/LOG-rotate-614.md). · [`.600` for `.615`](docs/archive/log/LOG-rotate-615.md). · [`.601` for `.616`](docs/archive/log/LOG-rotate-616.md). · [`.602` for `.617`](docs/archive/log/LOG-rotate-617.md). · [`.603` for `.618`](docs/archive/log/LOG-rotate-618.md). · [`.604` for `.619`](docs/archive/log/LOG-rotate-619.md). · [`.655` for `.670`](docs/archive/log/LOG-rotate-655-for-670.md). · [`.656` for `.679`](docs/archive/log/LOG-rotate-656-for-679.md). · [`.657` for `.680`](docs/archive/log/LOG-rotate-657-for-680.md). · [`.658` for `.684`](docs/archive/log/LOG-rotate-658-for-684.md). · [`.659` for `.685`](docs/archive/log/LOG-rotate-659-for-685.md). · [`.660` for `.689`](docs/archive/log/LOG-rotate-660-for-689.md). · [`.661` for `.690`](docs/archive/log/LOG-rotate-661-for-690.md). · [`.662` for `.691`](docs/archive/log/LOG-rotate-662-for-691.md). · [`.663` for `.692`](docs/archive/log/LOG-rotate-663-for-692.md). · [`.664` for `.693`](docs/archive/log/LOG-rotate-664-for-693.md). · [`.665` for `.694`](docs/archive/log/LOG-rotate-665-for-694.md). · [`.666` for `.695`](docs/archive/log/LOG-rotate-666-for-695.md). · [`.667` for `.696`](docs/archive/log/LOG-rotate-667-for-696.md). · [`.668` for `.697`](docs/archive/log/LOG-rotate-668-for-697.md). · [`.669` for `.714`](docs/archive/log/LOG-rotate-669-for-714.md). · [`.669` for `.743`](docs/archive/log/LOG-rotate-669-for-743.md). · [`.670` for `.743`](docs/archive/log/LOG-rotate-670-for-743.md). · [`.669` for `.744`](docs/archive/log/LOG-rotate-669-for-744.md). · [`.679` for `.744`](docs/archive/log/LOG-rotate-679-for-744.md). · [`.680` for `.745`](docs/archive/log/LOG-rotate-680-for-745.md). · [`.684` for `.746`](docs/archive/log/LOG-rotate-684-for-746.md). · [`.750` for `.765`](docs/archive/log/LOG-rotate-750-for-765.md). · [`.753` for `.768`](docs/archive/log/LOG-rotate-753-for-768.md). · [`.762` for `.777`](docs/archive/log/LOG-rotate-762-for-777.md). · [`.765` for `.780`](docs/archive/log/LOG-rotate-765-for-780.md). · [`.766` for `.781`](docs/archive/log/LOG-rotate-766-for-781.md). · [`.767` for form-object-kit](docs/archive/log/LOG-rotate-767-for-form-object-kit.md). · [`.768` for `.782`](docs/archive/log/LOG-rotate-768-for-782.md). · [`.769` for `.783`](docs/archive/log/LOG-rotate-769-for-783.md). · [`.770` for `.784`](docs/archive/log/LOG-rotate-770-for-784.md). · [`.771` for `.785`](docs/archive/log/LOG-rotate-771-for-785.md). · [`.772` for `.786`](docs/archive/log/LOG-rotate-772-for-786.md). · [`.773` for `.787`](docs/archive/log/LOG-rotate-773-for-787.md). · [`.774` for `.788`](docs/archive/log/LOG-rotate-774-for-788.md). · [`.775` for `.789`](docs/archive/log/LOG-rotate-775-for-789.md). · [`.776` for `.790`](docs/archive/log/LOG-rotate-776-for-790.md). · [`.777` for `.791`](docs/archive/log/LOG-rotate-777-for-791.md). · [`.778` for `.792`](docs/archive/log/LOG-rotate-778-for-792.md). · [`.826` for `.841`](docs/archive/log/LOG-rotate-826-for-841.md). · [`.827` for `.842`](docs/archive/log/LOG-rotate-827-for-842.md). · [`.829` for `.844`](docs/archive/log/LOG-rotate-829-for-844.md). · [`.830` for `.845`](docs/archive/log/LOG-rotate-830-for-845.md). · [`.831` for `.846`](docs/archive/log/LOG-rotate-831-for-846.md). · [`.828` for `.843`](docs/archive/log/LOG-rotate-828-for-843.md). · [`.832` for `.847`](docs/archive/log/LOG-rotate-832-for-847.md). · [`.833` for `.848`](docs/archive/log/LOG-rotate-833-for-848.md). · [`.834` for `.849`](docs/archive/log/LOG-rotate-834-for-849.md). · [`.862` for `.880`](docs/archive/log/LOG-rotate-862-for-880.md). · [`.863` for `.881`](docs/archive/log/LOG-rotate-863-for-881.md). · [`.864` for `.882`](docs/archive/log/LOG-rotate-864-for-882.md). · [`.865` for `.883`](docs/archive/log/LOG-rotate-865-for-883.md). · [`.866` for `.884`](docs/archive/log/LOG-rotate-866-for-884.md). · [`.867` for `.885`](docs/archive/log/LOG-rotate-867-for-885.md). · [`.868` for `.886`](docs/archive/log/LOG-rotate-868-for-886.md). · [`.869` for `.887`](docs/archive/log/LOG-rotate-869-for-887.md). · [`.870` for `.888`](docs/archive/log/LOG-rotate-870-for-888.md). · [`.871` for `.889`](docs/archive/log/LOG-rotate-871-for-889.md).

## 2026-08-17 — Train set table is the phone atom (`.889`)

The set table already existed on desktop. The phone — 390 wide, the
product — still entered sets in a second dock under card rows. Two
entry paths is why the logger felt like a different app than the
table people already live in.

**Ship:** `/active` mounts `SetLogTable` on every surface. Dock is
rest-only. Kind chips live in the exercise footer. Table is `table-fixed`
so 390 does not scroll sideways; completed Easy/Med/Hard sit on a
second row. Same log, same outbox. Guard: the card must not mount the
old compact row list.

Label `.889` (stacked on `.888`).

No `PRIVATE_MODE` flip.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-871-for-889.md](docs/archive/log/LOG-rotate-871-for-889.md).

## 2026-08-17 — Competitor names stay in mission-ops (`.888`)

The public product tree was naming other consumer fitness apps in
user strings, help, vision, comments, and compare routes. Intel already
lived in gitignored `ops/intel/`. The leak was the product tip.

**Ship:** classification rule without a public brand list. `npm run
names:check` reads `ops/intel/NAME_DENYLIST.md` when mounted (no-op in
public CI). Workout CSV import/export no longer names other loggers;
parsers detect the two common layouts by header. Vs-guide routes
redirect to `/welcome`. Named briefs moved to `ops/intel/seo/` for a
later founder GTM flip. Apple Journal card added in ops only.

Label `.888` (stacked on `.887`).

No `PRIVATE_MODE` flip.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-870-for-888.md](docs/archive/log/LOG-rotate-870-for-888.md).

## 2026-08-16 — Week One is three bars, not a warning triangle (`.887`)

On the first-session Victory walk, Week One (once earned) is a closed
triangle. The SVG loaded. The mark looked like a broken-image icon
next to the badge name.

**Ship:** `week_one.svg` is three session bars (two ink, last red).
Guard fails if the old triangle path returns.

Vision U2 R1. `#728` left unmerged (stacked on the duplicate-helper
Victory branch).

Label `.887` (stacked on `.886`).

No `PRIVATE_MODE` flip.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-869-for-887.md](docs/archive/log/LOG-rotate-869-for-887.md).

## 2026-08-16 — Victory prints reps, not 0 kg, for bodyweight (`.886`)

A Just Go chest session (push-ups) printed Volume 0 kg. Load×reps is 0
when the bar is empty, so the first-session receipt said nothing
happened. The helper already existed (`formatWorkoutVolumeDisplay`).
Victory and the share card were still printing raw tonnage.

**Ship:** `summarizeWorkoutVictory` carries `workingReps` via
`sumWorkingReps`. Victory cell + share card + share text use the
existing helper. Warmups stay out. Loaded volume still prints kg.

Vision U1 R1. `#727` invents a second helper — left unmerged.

Label `.886` (stacked on `.885`).

No `PRIVATE_MODE` flip.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-868-for-886.md](docs/archive/log/LOG-rotate-868-for-886.md).

## 2026-08-16 — Empty queue after path is the vision gauntlet (`.885`)

The goal is already in the repo: free logger + Mission Coach
([vision.md](vision.md)), week-4 retained weekly loggers
([docs/THESIS.md](docs/THESIS.md)), Alpha flip prep on the mermaid
([ORCHESTRATION.md](ORCHESTRATION.md)). After Horizon W pass and
Horizon 0 path tickets, `firstCriticalGap` was `null` and the router
stalled. That stop was a ban on inventing AU2. It was also a ban on
building toward the vision.

**Ship:** standing workbench `docs/gauntlet/VISION.md` (not a letter).
Empty + mined harvest + proven path → `VISION` · gauntlet · recipe 12.
Start is `/harness` or `/harness 2 hours` (optional `/vision`). LEAD
commissions from repo evidence. Still no GRAPH_LOOP letter. Still no
craft walk.

Label `.885` (onto master `.884` once #731/#732 land; stacked on `.884`).

No `PRIVATE_MODE` flip.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-867-for-885.md](docs/archive/log/LOG-rotate-867-for-885.md).

## 2026-08-16 — H01 www composition floors pass (`.884`)

The marketing site matched type scale and rhythm and still failed the
imagery axis: `/about` 15.1% page, `/compare` zero photographs, `/vision`
20%, floor 35%. That is the Wave 11 defect the composition check exists
for. Bar is the script, not a screenshot.

**Ship:** photographic grounds on `/about`, `/compare`, `/vision` from the
three existing stills. `www-composition.mjs` writes `COMPOSITION_PASS.md`
on a full-site pass. Path hop is a gauntlet unit.

Label `.884` (onto master `.883` once #731 lands; stacked on `.883`).

No `PRIVATE_MODE` flip.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-866-for-884.md](docs/archive/log/LOG-rotate-866-for-884.md).

## 2026-08-16 — Harness follows Horizon 0, not a craft walk (`.883`)

After RESULT `pass`, `firstCriticalGap` was `null`. `.881` filled that
vacuum with `craft`: walk Train → Today → Victory → Coach and invent a
friction. That is not the mermaid. Horizon W is scored; the next box is
Horizon 0 — Alpha flip prep toward public, Stripe, and the week-4 wall
metric. A taste walk is how the harness stops building the vision.

The 10-invite beta program is retired. Release is **Alpha 0.1.0**. Offer
is free tracker or Super Bundle. Mute-pay until EIN. Postal later.
Athlete nav said "Free beta"; it now says Alpha.

**Ship:** Horizon 0 path tickets `H01` (www composition) and `H03`
(Alpha chrome). Recipe 16 deleted. Empty queue after pass names `H01`,
not `craft`. Still no GRAPH_LOOP letter.

Label `.883` (onto master `.882`).

No `PRIVATE_MODE` flip.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-865-for-883.md](docs/archive/log/LOG-rotate-865-for-883.md).

## 2026-08-16 — Victory Next sat under the fold (`.882`)

The first set on a 390×844 phone finished into Victory, and the one red
action — `Start session 2` — sat at y=850. The sheet was already `max-h-[90dvh]
overflow-y-auto` because an earlier footer had become unreachable. Rewards +
feel + stats then pushed Next into that same overflow. Peak-End is the last
*visible* thing, not the last thing in the file.

**Ship:** `WorkoutVictorySheet` is a column. The middle pane scrolls. Next
docks below it (`data-testid="victory-next-dock"`). Source guard: overflow-y-auto
on `DialogContent` goes red; Next inside the scroll goes red.

Label `.882` (onto master `.881`). Craft hop.

No `PRIVATE_MODE` flip.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-864-for-882.md](docs/archive/log/LOG-rotate-864-for-882.md).

## 2026-08-16 — Autodrive after pass is craft, not a stall (`.881`)

`/harness 2 hours` is the self-drive loop. After RESULT `pass` it printed
`stalled` and exited, which is how you get a parked Tesla: the instruments
are green, the queue is empty, harvest is mined, and the only remaining
move the router would allow was inventing AU2 — so it refused.

That stop was correct as a ban on letters. It was wrong as a ban on
building. The founder asked for full self-driving. The missing hop is
**craft**: walk Train → Today → Victory → Coach, name one first-session
friction the walk actually hit, ship one PR, ticket `craft`. Still no
GRAPH_LOOP row. Two hops that move nothing still stop the timed session.

`stalled` stays for the case `IDEA_LOOP.md` is missing. Recipe 15 still
wins while RESULT is not `pass`. #723 taught the boot surface to treat an
unmapped stall as a stop; this maps the pass case so a spawn has a recipe
instead of a vacuum.

**Ship:** `craft` route · recipe 16 · PINNED + GRAPH_LOOP 5d.

Label `.881` (onto master `.880`).

Rotated LOG oldest → [docs/archive/log/LOG-rotate-863-for-881.md](docs/archive/log/LOG-rotate-863-for-881.md).

## 2026-08-16 — Coverage could not see the overlay that existed (`.880`)

`npm run i18n:coverage` (cap 0) has been red on every PR because it walked
`LOCALE_EXPORTS` plus bootstrap and core, and stopped there. The first-class
overlay (`firstClassLocales.ts` — locale chooser, and the rest of the
root-layout-safe strings) is **not** in that list, on purpose: locale-split
and the bundle budget forbid a value-import of those bodies on the layout
path. The ratchet therefore reported keys that already existed. Hydrate had
the same hole — `mergeFirstClassStrings` was never called — so the runtime
fell through to the English `defaultValue` in every language even after the
overlay was written.

That is a check keyed to one spelling of "where English lives". The packs
are one spelling. The overlay is the other. A guard that only opens the
export manifest cannot notice the overlay, so it goes red on work that
already shipped, and the hydrate path never delivers that work either.

The overlay is now in `englishKeys()` and merged last at hydrate so it wins
on collision. Keys that really had no catalog (bundle shop, Victory receipt,
re-entry quiet line, field-test receipt strings that lived only in the
unhydrated `fieldTestLocales` overlay, server chrome, and the rest) are in
the packs hydrate already walks. The week-diff headline was a runtime
ternary in one key — the same class as `moveSubtitleDepth` — split to
`coachWeekDiffHeadlineOne` / `Many` with two literal call sites.

Cap stays 0. Do not raise it. #725 catalogues the same keys by stuffing
`fieldTestLocales` into `LOCALE_EXPORTS`; that fights the overlay contract
and still does not hydrate first-class. Close it when this lands.

`.877`–`.879` are reserved by the open Victory stack (#726–#728). This
branch is off `master` (`.876`).

**Ship:** coverage sees first-class · hydrate merges it · leftover keys
catalogued · week-diff headline split.

Label `.880` (onto master `.876`).

Rotated LOG oldest → [docs/archive/log/LOG-rotate-862-for-880.md](docs/archive/log/LOG-rotate-862-for-880.md).

## 2026-08-16 — Horizon W is scored (`.876`)

**Founder scored the phone path `pass`.** `docs/EXCELLENCE_RESULT.md` status
`unscored` → `pass`, `scored_by` Snedz, on the Vercel Preview of `18737b0`
(deployed 19:27Z). Production could not have been the surface: `PRIVATE_MODE`
is on there and `/` serves the `/private` teaser. Preview is ungated by
construction — `VERCEL_ENV === 'preview'` short-circuits ahead of the flag in
both `privateModeFlag.ts` and its `next.config.js` mirror — so `pwaDisabled`
is false and Serwist builds, which is the only configuration where the
installable PWA and the offline promise are on a phone at all. The agent
transcribed the value and shipped the rest; the per-criterion lines stay empty
because they are the founder's observations and inventing them would be the
whole point of the rule.

**What this unlocks:** surface paths stop needing `Excellence-Override`, and
that now means something — `.874` stopped a branch borrowing a trailer from
`master`, so the next one written will be a decision rather than an inheritance.
`firstCriticalGap` returns `null` for the first time and `route.ts` already had
the answer: *"Horizon W instruments are green and RESULT is pass — stop, do not
invent a letter."* Confirmed by running `npm run harness`, not by reading it.

**The green test that would have gone red on the founder doing their job.**
`criticalPath.test.ts` asserted `excellenceStatusAt(root) === 'unscored'`
against the live repo — pinning, as a fact, the one value the whole gate exists
for the founder to change. It is `.220`'s shape wearing different clothes: not
a check that stopped asking, but a check whose passing depended on the work
never being finished. The house rule bans date literals in fixtures because a
test with an expiry date is a liability; this had an expiry *event*, which is
worse, because nothing on the calendar warns you it is coming.

Rewritten to the durable rule instead of the current reading. W1–W4 are checked
on the live tree, where instruments decide them. C5's dependence on status is
proved with fixtures in all three states (`pass` / `fail` / `unscored`), and the
live assertion is now *computed* — `isStepProven(C5) === (status === 'pass')` —
so it holds whichever value is committed. A third case pins both ends of the
gap: `unscored` yields a founder-owned C5, `pass` yields `null`. **4 mutants
killed** (C5 always proven, C5 never proven, status reader hardcoded to pass,
gap loses founder ownership). File 4 → 6 tests.

**Ship:** RESULT `pass` + provenance · `criticalPath.test.ts` de-pinned.

Label `.876` (onto `.875`).

Rotated LOG oldest → [docs/archive/log/LOG-rotate-861-for-876.md](docs/archive/log/LOG-rotate-861-for-876.md).

## 2026-08-16 — The harvest paste stamped a UTC day (`.875`)

`pasteHarvestFile` defaulted `today` to `new Date().toISOString().slice(0, 10)`
— the hard rule named in CLAUDE.md §5, whose own entry records that the defect
*"shipped a wrong shared week east of UTC"*. It arrived at `.871` and has been
red on `master` ever since: `reachability.test.ts` has been failing on every
run, and every PR merged over it.

It is not cosmetic, and it is not a rounding question. Between local midnight
and UTC midnight the two spellings disagree outright — at 00:30 JST on the 17th
(15:30 UTC on the 16th) `toISOString()` yields `2026-08-16` while the day
locally is the 17th. The harvest row this stamps is the dated queue entry the
next spawn reads to decide what has already been mined, so for that window it
files today's work under yesterday. Measured under `TZ=Asia/Tokyo`, not
reasoned about: the container is UTC, where the two agree and nothing looks
wrong — which is exactly why the guard exists and why running the suite locally
in one timezone is not evidence.

No new test. `reachability.test.ts` already discovers every product source and
fails on an unreviewed one; it was already red and naming this file. A second
guard for a defect the existing ratchet catches would be the vacuous kind — the
falsification is that reverting the one line turns it back red.

**Ship:** `localDateKey()` in `pasteHarvest.ts`. Suite 3652/3653 → 3653/3653.

Label `.875` (onto `.874`).

Excellence-Override: `src/lib/loopQueue` is a surface path and RESULT is unscored; this is the hard-rule breach in CLAUDE.md §5 that has held `master` red since `.871`, and it renders no athlete chrome.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-860-for-875.md](docs/archive/log/LOG-rotate-860-for-875.md).

## 2026-08-16 — The override a branch never asked for (`.874`)

`check-excellence-gate` read its commit messages from `git log base...HEAD` —
the **symmetric difference**, which carries every commit on the *base* side the
branch has not merged yet. 24 of the last 40 `master` commits carry an
`Excellence-Override:` trailer, so a branch even one commit behind `master`
borrowed one and shipped surface paths while RESULT is `unscored`. Measured,
not argued: a fixture branch with one commit, no trailer and one surface file
printed `✓ excellence unscored (override)` and exited 0 — an override it never
asked for, named in the output as though it had. The identical branch rebased
onto the tip blocked. So the stop-rule was deciding on **how recently someone
else had merged**, which is exactly why it reads from the outside as an
arbitrary build blocker: the same change passes or fails on a fact about
`master`, not about the change.

The two dot counts are correct in exactly one pairing, and nothing about
reading `log` next to `diff` suggests they should differ. The **diff** wants
`base...HEAD` — changes since the merge base, *what this branch touched*. The
**log** wants `base..HEAD` — commits this branch adds, *who consented*. Only
one of those is a range that can consent to anything. Each verb now ships with
its own range as full argv (`overrideLogArgs` / `changedPathDiffArgs`), so the
pairing is unswappable at the call site rather than something a guard has to
police after the fact.

The guard runs against a **real repository** instead of asserting a dot count,
because this defect was never a spelling anyone would read as wrong — `...` is
correct on the line directly above, and the override reader was handed the same
range because it looked like the same question. A temp repo builds A→B on
`master` (B carrying the trailer) and A→C on the branch, then feeds the real
argv to the real reader. A companion assertion proves the old range **would**
have returned `true`, so the test cannot quietly pass against the defect it
names. **4 mutants killed:** three-dot log, two-dot diff, and both swapped
pairings.

**Not fixed here, and not an agent's to fix:** RESULT status stays `unscored`.
C5 (phone hero ≤90s) is founder-scored on a phone — recipe 15 says print the
ticket and stop. This makes the gate block the cases it always claimed to; it
does not decide the criterion, and the documented `Excellence-Override` trailer
still opens for a branch that carries its own.

**Ship:** `overrideCommitRange` / `changedPathRange` + argv pairs in
`excellenceGate.ts` · `check-excellence-gate` wiring · 3 git-fixture guards.
File 10 → 13 tests.

Label `.874` (onto master `.873`).

Rotated LOG oldest → [docs/archive/log/LOG-rotate-859-for-874.md](docs/archive/log/LOG-rotate-859-for-874.md).

## 2026-08-16 — Generate harvest is mined out (`.873`)

Two generate-harvests in a row survived red team 0-of-3. Scout > 0 on
harvest-13 and harvest-14, so paste-only rows do not reset the clock.

**Ship:** M-19 · H-20–22 killed · route tests expect path C5. Empty
queue is Horizon W phone (C5), not another generate. Not AU2.

Label `.873` (onto master `.872`).

Excellence-Override: harvest mined-out route (tooling; RESULT unscored)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-858-for-873.md](docs/archive/log/LOG-rotate-858-for-873.md).

## 2026-08-16 — First session one lift until a set (`.872`)

IL-H-15: the first Mission workout listed four lifts before any set
existed. The next beat interrupted the one act that counts.

**Ship:** `laterLiftVisible` · one `[data-exercise-id]` in first-90 before
Log set. TAP_BUDGET stays 4.

Label `.872` (onto master `.871`).

Excellence-Override: first-session next lift withhold (surface; RESULT unscored)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-857-for-872.md](docs/archive/log/LOG-rotate-857-for-872.md).


