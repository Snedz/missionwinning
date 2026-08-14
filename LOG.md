# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md) · [`.283` for `.298`](docs/archive/log/LOG-rotate-298.md) · [`.284` for `.299`](docs/archive/log/LOG-rotate-299.md) · [`.285` for `.300`](docs/archive/log/LOG-rotate-300.md) · [`.286` for `.301`](docs/archive/log/LOG-rotate-301.md) · [`.287` for `.302`](docs/archive/log/LOG-rotate-302.md) · [`.288` for `.303`](docs/archive/log/LOG-rotate-303.md) · [`.289` for `.304`](docs/archive/log/LOG-rotate-304.md) · [`.290` for `.305`](docs/archive/log/LOG-rotate-305.md) · [`.291` for `.306`](docs/archive/log/LOG-rotate-306.md) · [`.292` for `.307`](docs/archive/log/LOG-rotate-307.md) · [`.293` for `.308`](docs/archive/log/LOG-rotate-308.md) · [`.294` for `.309`](docs/archive/log/LOG-rotate-309.md) · [`.295` for `.310`](docs/archive/log/LOG-rotate-310.md) · [`.296` for `.311`](docs/archive/log/LOG-rotate-311.md) · [`.297` for `.312`](docs/archive/log/LOG-rotate-312.md) · [`.298` for `.313`](docs/archive/log/LOG-rotate-313.md) · [`.299` for `.314`](docs/archive/log/LOG-rotate-314.md) · [`.300` for `.315`](docs/archive/log/LOG-rotate-315.md). · [`.301` for `.316`](docs/archive/log/LOG-rotate-316.md). · [`.302` for `.317`](docs/archive/log/LOG-rotate-317.md). · [`.303` for `.318`](docs/archive/log/LOG-rotate-318.md). · [`.304` for `.319`](docs/archive/log/LOG-rotate-319.md). · [`.305` for `.320`](docs/archive/log/LOG-rotate-320.md). · [`.306` for `.321`](docs/archive/log/LOG-rotate-321.md). · [`.307` for `.322`](docs/archive/log/LOG-rotate-322.md). · [`.308` for `.323`](docs/archive/log/LOG-rotate-323.md). · [`.309` for `.324`](docs/archive/log/LOG-rotate-324.md). · [`.310` for `.325`](docs/archive/log/LOG-rotate-325.md). · [`.311` for `.326`](docs/archive/log/LOG-rotate-326.md). · [`.312` for `.327`](docs/archive/log/LOG-rotate-327.md). · [`.313` for `.328`](docs/archive/log/LOG-rotate-328.md). · [`.314` for `.329`](docs/archive/log/LOG-rotate-329.md). · [`.315` for `.330`](docs/archive/log/LOG-rotate-330.md). · [`.316` for `.331`](docs/archive/log/LOG-rotate-331.md). · [`.317` for `.332`](docs/archive/log/LOG-rotate-332.md). · [`.318` for `.333`](docs/archive/log/LOG-rotate-333.md). · [`.319` for `.334`](docs/archive/log/LOG-rotate-334.md). · [`.320` for `.335`](docs/archive/log/LOG-rotate-335.md). · [`.321` for `.336`](docs/archive/log/LOG-rotate-336.md). · [`.322` for `.337`](docs/archive/log/LOG-rotate-337.md). · [`.323` for `.338`](docs/archive/log/LOG-rotate-338.md). · [`.324` for `.339`](docs/archive/log/LOG-rotate-339.md). · [`.325` for `.340`](docs/archive/log/LOG-rotate-340.md). · [`.326` for `.341`](docs/archive/log/LOG-rotate-341.md). · [`.327` for `.342`](docs/archive/log/LOG-rotate-342.md). · [`.328` for `.343`](docs/archive/log/LOG-rotate-343.md). · [`.329` for `.344`](docs/archive/log/LOG-rotate-344.md). · [`.330` for `.345`](docs/archive/log/LOG-rotate-345.md). · [`.331` for `.346`](docs/archive/log/LOG-rotate-346.md). · [`.332` for `.347`](docs/archive/log/LOG-rotate-347.md). · [`.333` for `.348`](docs/archive/log/LOG-rotate-348.md). · [`.334` for `.349`](docs/archive/log/LOG-rotate-349.md). · [`.335` for `.350`](docs/archive/log/LOG-rotate-350.md). · [`.336` for `.351`](docs/archive/log/LOG-rotate-351.md). · [`.337` for `.352`](docs/archive/log/LOG-rotate-352.md). · [`.338` for `.353`](docs/archive/log/LOG-rotate-353.md). · [`.339` for `.354`](docs/archive/log/LOG-rotate-354.md). · [`.340` for `.355`](docs/archive/log/LOG-rotate-355.md). · [`.341` for `.356`](docs/archive/log/LOG-rotate-356.md). · [`.342` for `.357`](docs/archive/log/LOG-rotate-357.md). · [`.343` for `.358`](docs/archive/log/LOG-rotate-358.md). · [`.344` for `.359`](docs/archive/log/LOG-rotate-359.md). · [`.345` for `.360`](docs/archive/log/LOG-rotate-360.md). · [`.346` for `.361`](docs/archive/log/LOG-rotate-361.md). · [`.347` for `.362`](docs/archive/log/LOG-rotate-362.md). · [`.348` for `.363`](docs/archive/log/LOG-rotate-363.md). · [`.349` for `.364`](docs/archive/log/LOG-rotate-364.md). · [`.350` for `.365`](docs/archive/log/LOG-rotate-365.md). · [`.351` for `.366`](docs/archive/log/LOG-rotate-366.md). · [`.352` for `.367`](docs/archive/log/LOG-rotate-367.md). · [`.353` for `.368`](docs/archive/log/LOG-rotate-368.md). · [`.354` for `.369`](docs/archive/log/LOG-rotate-369.md). · [`.355` for `.370`](docs/archive/log/LOG-rotate-370.md). · [`.356` for `.371`](docs/archive/log/LOG-rotate-371.md). · [`.357` for `.372`](docs/archive/log/LOG-rotate-372.md). · [`.358` for `.373`](docs/archive/log/LOG-rotate-373.md). · [`.359` for `.374`](docs/archive/log/LOG-rotate-374.md). · [`.360` for `.375`](docs/archive/log/LOG-rotate-375.md). · [`.361` for `.376`](docs/archive/log/LOG-rotate-376.md). · [`.362` for `.377`](docs/archive/log/LOG-rotate-377.md). · [`.363` for `.378`](docs/archive/log/LOG-rotate-378.md). · [`.364` for `.379`](docs/archive/log/LOG-rotate-379.md). · [`.365` for `.380`](docs/archive/log/LOG-rotate-380.md). · [`.366` for `.381`](docs/archive/log/LOG-rotate-381.md). · [`.367` for `.382`](docs/archive/log/LOG-rotate-382.md). · [`.368` for `.383`](docs/archive/log/LOG-rotate-383.md). · [`.369` for `.384`](docs/archive/log/LOG-rotate-384.md). · [`.370` for `.385`](docs/archive/log/LOG-rotate-385.md). · [`.371` for `.386`](docs/archive/log/LOG-rotate-386.md). · [`.372` for `.387`](docs/archive/log/LOG-rotate-387.md). · [`.373` for `.388`](docs/archive/log/LOG-rotate-388.md). · [`.374` for `.389`](docs/archive/log/LOG-rotate-389.md). · [`.375` for `.390`](docs/archive/log/LOG-rotate-390.md). · [`.376` for `.391`](docs/archive/log/LOG-rotate-391.md). · [`.377` for `.392`](docs/archive/log/LOG-rotate-392.md). · [`.378` for `.393`](docs/archive/log/LOG-rotate-393.md). · [`.379` for `.394`](docs/archive/log/LOG-rotate-394.md). · [`.380` for `.395`](docs/archive/log/LOG-rotate-395.md). · [`.381` for `.396`](docs/archive/log/LOG-rotate-396.md). · [`.382` for `.397`](docs/archive/log/LOG-rotate-397.md). · [`.383` for `.398`](docs/archive/log/LOG-rotate-398.md). · [`.384` for `.399`](docs/archive/log/LOG-rotate-399.md). · [`.385` for `.400`](docs/archive/log/LOG-rotate-400.md). · [`.386` for `.401`](docs/archive/log/LOG-rotate-401.md). · [`.387` for `.402`](docs/archive/log/LOG-rotate-402.md). · [`.388` for `.403`](docs/archive/log/LOG-rotate-403.md). · [`.389` for `.404`](docs/archive/log/LOG-rotate-404.md). · [`.390` for `.405`](docs/archive/log/LOG-rotate-405.md). · [`.391` for `.406`](docs/archive/log/LOG-rotate-406.md). · [`.392` for `.407`](docs/archive/log/LOG-rotate-407.md). · [`.393` for `.408`](docs/archive/log/LOG-rotate-408.md). · [`.394` for `.409`](docs/archive/log/LOG-rotate-409.md). · [`.395` for `.410`](docs/archive/log/LOG-rotate-410.md). · [`.396` for `.411`](docs/archive/log/LOG-rotate-411.md). · [`.397` for `.412`](docs/archive/log/LOG-rotate-412.md). · [`.398` for `.413`](docs/archive/log/LOG-rotate-413.md). · [`.399` for `.414`](docs/archive/log/LOG-rotate-414.md). · [`.400` for `.415`](docs/archive/log/LOG-rotate-415.md). · [`.401` for `.416`](docs/archive/log/LOG-rotate-416.md). · [`.402` for `.417`](docs/archive/log/LOG-rotate-417.md). · [`.403` for `.418`](docs/archive/log/LOG-rotate-418.md). · [`.404` for `.419`](docs/archive/log/LOG-rotate-419.md). · [`.405` for `.420`](docs/archive/log/LOG-rotate-420.md). · [`.406` for `.421`](docs/archive/log/LOG-rotate-421.md). · [`.407` for `.422`](docs/archive/log/LOG-rotate-422.md). · [`.408` for `.423`](docs/archive/log/LOG-rotate-423.md). · [`.409` for `.424`](docs/archive/log/LOG-rotate-424.md). · [`.410` for `.425`](docs/archive/log/LOG-rotate-425.md). · [`.411` for `.426`](docs/archive/log/LOG-rotate-426.md). · [`.412` for `.427`](docs/archive/log/LOG-rotate-427.md). · [`.413` for `.428`](docs/archive/log/LOG-rotate-428.md). · [`.414` for `.429`](docs/archive/log/LOG-rotate-429.md). · [`.415` for `.430`](docs/archive/log/LOG-rotate-430.md). · [`.416` for `.431`](docs/archive/log/LOG-rotate-431.md). · [`.417` for `.432`](docs/archive/log/LOG-rotate-432.md). · [`.418` for `.433`](docs/archive/log/LOG-rotate-433.md). · [`.419` for `.434`](docs/archive/log/LOG-rotate-434.md). · [`.420` for `.435`](docs/archive/log/LOG-rotate-435.md). · [`.421` for `.436`](docs/archive/log/LOG-rotate-436.md). · [`.422` for `.437`](docs/archive/log/LOG-rotate-437.md). · [`.423` for `.438`](docs/archive/log/LOG-rotate-438.md). · [`.424` for `.439`](docs/archive/log/LOG-rotate-439.md). · [`.425` for `.440`](docs/archive/log/LOG-rotate-440.md). · [`.426` for `.441`](docs/archive/log/LOG-rotate-441.md). · [`.427` for `.442`](docs/archive/log/LOG-rotate-442.md). · [`.428` for `.443`](docs/archive/log/LOG-rotate-443.md). · [`.429` for `.444`](docs/archive/log/LOG-rotate-444.md). · [`.430` for `.445`](docs/archive/log/LOG-rotate-445.md). · [`.431` for `.446`](docs/archive/log/LOG-rotate-446.md). · [`.432` for `.447`](docs/archive/log/LOG-rotate-447.md). · [`.433` for `.448`](docs/archive/log/LOG-rotate-448.md). · [`.434` for `.449`](docs/archive/log/LOG-rotate-449.md). · [`.435` for `.450`](docs/archive/log/LOG-rotate-450.md). · [`.436` for `.451`](docs/archive/log/LOG-rotate-451.md). · [`.437` for `.452`](docs/archive/log/LOG-rotate-452.md). · [`.438` for `.453`](docs/archive/log/LOG-rotate-453.md). · [`.439` for `.454`](docs/archive/log/LOG-rotate-454.md). · [`.440` for `.455`](docs/archive/log/LOG-rotate-455.md). · [`.441` for `.456`](docs/archive/log/LOG-rotate-456.md). · [`.442` for `.457`](docs/archive/log/LOG-rotate-457.md). · [`.443` for `.458`](docs/archive/log/LOG-rotate-458.md). · [`.444` for `.459`](docs/archive/log/LOG-rotate-459.md). · [`.445` for `.460`](docs/archive/log/LOG-rotate-460.md). · [`.446` for `.461`](docs/archive/log/LOG-rotate-461.md). · [`.447` for `.462`](docs/archive/log/LOG-rotate-462.md). · [`.448` for `.463`](docs/archive/log/LOG-rotate-463.md). · [`.449` for `.464`](docs/archive/log/LOG-rotate-464.md). · [`.450` for `.465`](docs/archive/log/LOG-rotate-465.md). · [`.451` for `.466`](docs/archive/log/LOG-rotate-466.md). · [`.452` for `.467`](docs/archive/log/LOG-rotate-467.md). · [`.453` for `.468`](docs/archive/log/LOG-rotate-468.md). · [`.454` for `.469`](docs/archive/log/LOG-rotate-469.md). · [`.455` for `.470`](docs/archive/log/LOG-rotate-470.md). · [`.456` for `.471`](docs/archive/log/LOG-rotate-471.md). · [`.457` for `.472`](docs/archive/log/LOG-rotate-472.md). · [`.458` for `.473`](docs/archive/log/LOG-rotate-473.md). · [`.459` for `.474`](docs/archive/log/LOG-rotate-474.md). · [`.460` for `.475`](docs/archive/log/LOG-rotate-475.md). · [`.461` for `.476`](docs/archive/log/LOG-rotate-476.md). · [`.462` for `.477`](docs/archive/log/LOG-rotate-477.md). · [`.463` for `.478`](docs/archive/log/LOG-rotate-478.md). · [`.464` for `.479`](docs/archive/log/LOG-rotate-479.md). · [`.465` for `.480`](docs/archive/log/LOG-rotate-480.md). · [`.466` for `.481`](docs/archive/log/LOG-rotate-481.md). · [`.467` for `.482`](docs/archive/log/LOG-rotate-482.md). · [`.468` for `.483`](docs/archive/log/LOG-rotate-483.md). · [`.469` for `.484`](docs/archive/log/LOG-rotate-484.md). · [`.470` for `.485`](docs/archive/log/LOG-rotate-485.md). · [`.471` for `.486`](docs/archive/log/LOG-rotate-486.md). · [`.472` for `.487`](docs/archive/log/LOG-rotate-487.md). · [`.473` for `.488`](docs/archive/log/LOG-rotate-488.md). · [`.474` for `.489`](docs/archive/log/LOG-rotate-489.md). · [`.475` for `.490`](docs/archive/log/LOG-rotate-490.md). · [`.476` for `.491`](docs/archive/log/LOG-rotate-491.md). · [`.477` for `.492`](docs/archive/log/LOG-rotate-492.md). · [`.478` for `.493`](docs/archive/log/LOG-rotate-493.md). · [`.479` for `.494`](docs/archive/log/LOG-rotate-494.md). · [`.480` for `.495`](docs/archive/log/LOG-rotate-495.md). · [`.481` for `.496`](docs/archive/log/LOG-rotate-496.md). · [`.482` for `.497`](docs/archive/log/LOG-rotate-497.md). · [`.483` for `.498`](docs/archive/log/LOG-rotate-498.md). · [`.484` for `.499`](docs/archive/log/LOG-rotate-499.md). · [`.485` for `.500`](docs/archive/log/LOG-rotate-500.md). · [`.486` for `.501`](docs/archive/log/LOG-rotate-501.md). · [`.487` for `.502`](docs/archive/log/LOG-rotate-502.md). · [`.488` for `.503`](docs/archive/log/LOG-rotate-503.md). · [`.490` for `.505`](docs/archive/log/LOG-rotate-505.md). · [`.491` for `.506`](docs/archive/log/LOG-rotate-506.md). · [`.579` for `.594`](docs/archive/log/LOG-rotate-594.md). · [`.580` for `.595`](docs/archive/log/LOG-rotate-595.md).


--- · [`.492` for `.507`](docs/archive/log/LOG-rotate-507.md). · [`.493` for `.508`](docs/archive/log/LOG-rotate-508.md). · [`.494` for `.509`](docs/archive/log/LOG-rotate-509.md). · [`.495` for `.510`](docs/archive/log/LOG-rotate-510.md). · [`.496` for `.511`](docs/archive/log/LOG-rotate-511.md). · [`.497` for `.512`](docs/archive/log/LOG-rotate-512.md). · [`.498` for `.513`](docs/archive/log/LOG-rotate-513.md). · [`.499` for `.514`](docs/archive/log/LOG-rotate-514.md). · [`.500` for `.515`](docs/archive/log/LOG-rotate-515.md). · [`.501` for `.516`](docs/archive/log/LOG-rotate-516.md). · [`.502` for `.517`](docs/archive/log/LOG-rotate-517.md). · [`.503` for `.518`](docs/archive/log/LOG-rotate-518.md). · [`.504` for `.519`](docs/archive/log/LOG-rotate-519.md). · [`.505` for `.520`](docs/archive/log/LOG-rotate-520.md). · [`.506` for `.521`](docs/archive/log/LOG-rotate-521.md). · [`.507` for `.522`](docs/archive/log/LOG-rotate-522.md). · [`.508` for `.523`](docs/archive/log/LOG-rotate-523.md). · [`.509` for `.524`](docs/archive/log/LOG-rotate-524.md). · [`.510` for `.525`](docs/archive/log/LOG-rotate-525.md). · [`.511` for `.526`](docs/archive/log/LOG-rotate-526.md). · [`.512` for `.527`](docs/archive/log/LOG-rotate-527.md). · [`.513` for `.528`](docs/archive/log/LOG-rotate-528.md). · [`.514` for `.529`](docs/archive/log/LOG-rotate-529.md). · [`.515` for `.530`](docs/archive/log/LOG-rotate-530.md). · [`.516` for `.531`](docs/archive/log/LOG-rotate-531.md). · [`.517` for `.532`](docs/archive/log/LOG-rotate-532.md). · [`.518` for `.533`](docs/archive/log/LOG-rotate-533.md). · [`.519` for `.534`](docs/archive/log/LOG-rotate-534.md). · [`.520` for `.535`](docs/archive/log/LOG-rotate-535.md). · [`.521` for `.536`](docs/archive/log/LOG-rotate-536.md). · [`.522` for `.537`](docs/archive/log/LOG-rotate-537.md). · [`.523` for `.538`](docs/archive/log/LOG-rotate-538.md). · [`.524` for `.539`](docs/archive/log/LOG-rotate-539.md). · [`.525` for `.540`](docs/archive/log/LOG-rotate-540.md). · [`.526` for `.541`](docs/archive/log/LOG-rotate-541.md). · [`.527` for `.542`](docs/archive/log/LOG-rotate-542.md). · [`.528` for `.543`](docs/archive/log/LOG-rotate-543.md). · [`.529` for `.544`](docs/archive/log/LOG-rotate-544.md). · [`.530` for `.545`](docs/archive/log/LOG-rotate-545.md). · [`.531` for `.546`](docs/archive/log/LOG-rotate-546.md). · [`.532` for `.547`](docs/archive/log/LOG-rotate-547.md). · [`.533` for `.548`](docs/archive/log/LOG-rotate-548.md). · [`.534` for `.549`](docs/archive/log/LOG-rotate-549.md). · [`.535` for `.550`](docs/archive/log/LOG-rotate-550.md). · [`.536` for `.551`](docs/archive/log/LOG-rotate-551.md). · [`.537` for `.552`](docs/archive/log/LOG-rotate-552.md). · [`.538` for `.553`](docs/archive/log/LOG-rotate-553.md). · [`.539` for `.554`](docs/archive/log/LOG-rotate-554.md). · [`.540` for `.555`](docs/archive/log/LOG-rotate-555.md). · [`.541` for `.556`](docs/archive/log/LOG-rotate-556.md). · [`.542` for `.557`](docs/archive/log/LOG-rotate-557.md). · [`.543` for `.558`](docs/archive/log/LOG-rotate-558.md). · [`.544` for `.559`](docs/archive/log/LOG-rotate-559.md). · [`.545` for `.560`](docs/archive/log/LOG-rotate-560.md). · [`.546` for `.561`](docs/archive/log/LOG-rotate-561.md). · [`.547` for `.562`](docs/archive/log/LOG-rotate-562.md). · [`.548` for `.563`](docs/archive/log/LOG-rotate-563.md). · [`.549` for `.564`](docs/archive/log/LOG-rotate-564.md). · [`.550` for `.565`](docs/archive/log/LOG-rotate-565.md). · [`.551` for `.566`](docs/archive/log/LOG-rotate-566.md). · [`.552` for `.567`](docs/archive/log/LOG-rotate-567.md). · [`.553` for `.568`](docs/archive/log/LOG-rotate-568.md). · [`.554` for `.569`](docs/archive/log/LOG-rotate-569.md). · [`.555` for `.570`](docs/archive/log/LOG-rotate-570.md). · [`.556` for `.571`](docs/archive/log/LOG-rotate-571.md). · [`.557` for `.572`](docs/archive/log/LOG-rotate-572.md). · [`.558` for `.573`](docs/archive/log/LOG-rotate-573.md). · [`.559` for `.574`](docs/archive/log/LOG-rotate-574.md). · [`.560` for `.575`](docs/archive/log/LOG-rotate-575.md). · [`.561` for `.576`](docs/archive/log/LOG-rotate-576.md). · [`.562` for `.577`](docs/archive/log/LOG-rotate-577.md). · [`.563` for `.578`](docs/archive/log/LOG-rotate-578.md). · [`.564` for `.579`](docs/archive/log/LOG-rotate-579.md). · [`.565` for `.580`](docs/archive/log/LOG-rotate-580.md). · [`.566` for `.581`](docs/archive/log/LOG-rotate-581.md). · [`.567` for `.582`](docs/archive/log/LOG-rotate-582.md). · [`.568` for `.583`](docs/archive/log/LOG-rotate-583.md). · [`.569` for `.584`](docs/archive/log/LOG-rotate-584.md). · [`.570` for `.585`](docs/archive/log/LOG-rotate-585.md). · [`.571` for `.586`](docs/archive/log/LOG-rotate-586.md). · [`.572` for `.587`](docs/archive/log/LOG-rotate-587.md). · [`.573` for `.588`](docs/archive/log/LOG-rotate-588.md). · [`.574` for `.589`](docs/archive/log/LOG-rotate-589.md). · [`.575` for `.590`](docs/archive/log/LOG-rotate-590.md). · [`.576` for `.591`](docs/archive/log/LOG-rotate-591.md). · [`.577` for `.592`](docs/archive/log/LOG-rotate-592.md). · [`.578` for `.593`](docs/archive/log/LOG-rotate-593.md). · [`.581` for `.596`](docs/archive/log/LOG-rotate-596.md). · [`.582` for `.597`](docs/archive/log/LOG-rotate-597.md). · [`.583` for `.598`](docs/archive/log/LOG-rotate-598.md). · [`.584` for `.599`](docs/archive/log/LOG-rotate-599.md). · [`.585` for `.600`](docs/archive/log/LOG-rotate-600.md). · [`.586` for `.601`](docs/archive/log/LOG-rotate-601.md). · [`.587` for `.602`](docs/archive/log/LOG-rotate-602.md). · [`.588` for `.603`](docs/archive/log/LOG-rotate-603.md). · [`.590` for `.606`](docs/archive/log/LOG-rotate-606.md). · [`.596` for `.612`](docs/archive/log/LOG-rotate-612.md). · [`.597` for `.613`](docs/archive/log/LOG-rotate-613.md). · [`.599` for `.614`](docs/archive/log/LOG-rotate-614.md). · [`.600` for `.615`](docs/archive/log/LOG-rotate-615.md). · [`.601` for `.616`](docs/archive/log/LOG-rotate-616.md). · [`.602` for `.617`](docs/archive/log/LOG-rotate-617.md). · [`.603` for `.618`](docs/archive/log/LOG-rotate-618.md). · [`.604` for `.619`](docs/archive/log/LOG-rotate-619.md). · [`.655` for `.670`](docs/archive/log/LOG-rotate-655-for-670.md). · [`.656` for `.679`](docs/archive/log/LOG-rotate-656-for-679.md). · [`.657` for `.680`](docs/archive/log/LOG-rotate-657-for-680.md). · [`.658` for `.684`](docs/archive/log/LOG-rotate-658-for-684.md). · [`.659` for `.685`](docs/archive/log/LOG-rotate-659-for-685.md). · [`.660` for `.689`](docs/archive/log/LOG-rotate-660-for-689.md). · [`.661` for `.690`](docs/archive/log/LOG-rotate-661-for-690.md). · [`.662` for `.691`](docs/archive/log/LOG-rotate-662-for-691.md). · [`.663` for `.692`](docs/archive/log/LOG-rotate-663-for-692.md). · [`.664` for `.693`](docs/archive/log/LOG-rotate-664-for-693.md). · [`.665` for `.694`](docs/archive/log/LOG-rotate-665-for-694.md). · [`.666` for `.695`](docs/archive/log/LOG-rotate-666-for-695.md). · [`.667` for `.696`](docs/archive/log/LOG-rotate-667-for-696.md). · [`.668` for `.697`](docs/archive/log/LOG-rotate-668-for-697.md). · [`.669` for `.714`](docs/archive/log/LOG-rotate-669-for-714.md). · [`.669` for `.743`](docs/archive/log/LOG-rotate-669-for-743.md). · [`.670` for `.743`](docs/archive/log/LOG-rotate-670-for-743.md). · [`.669` for `.744`](docs/archive/log/LOG-rotate-669-for-744.md). · [`.679` for `.744`](docs/archive/log/LOG-rotate-679-for-744.md). · [`.680` for `.745`](docs/archive/log/LOG-rotate-680-for-745.md). · [`.684` for `.746`](docs/archive/log/LOG-rotate-684-for-746.md). · [`.750` for `.765`](docs/archive/log/LOG-rotate-750-for-765.md).

## 2026-08-14 — Value before the account; the geo-block explains itself (`.769`)

Three shards' outstanding P0s, re-landed on `master` after `#543` was closed
("superseded by #544"). `#544` carried `.765`/`.766`; this carries what came
after: shard 3's taps-to-log, shard 4's first-paint weight, and shard 1's two
big themes. Geo-block **unchanged** — the first assertion in the new guard is
that every blocked country is still blocked and US/LatAm are still supported.

### The invite wall was literally true (shard 1, US/LatAm ops #16, ~27% of rows)

With the gate up, `/welcome` was public and `/active` was not, so a stranger
could finish I-Day and land on `/private`. The gate's only two actions were both
ways of asking: a waitlist address, or an access code. Hard rule 2 — *"the free
logger is never gated. Ever."* — and `#523`'s first-set-without-an-account were
both unreachable by anyone without an invite.

- **`/active` is public while gated.** Not a `PRIVATE_MODE` flip; the mechanism
  that made `/welcome` public for SEO. The blast radius is *asserted*, not
  described: `privateGate.test.ts` enumerates the fourteen app routes that still
  demand the cookie, and `privateGateRedirect.routetest.ts` pins the same fact at
  the middleware, because a list and a proxy are two different things (`.204`).
  Verified on a gated production build: `/active` 200; `/log`, `/coach`,
  `/nutrition`, `/history`, `/profile`, `/account` all 307 → `/private`.
- The gate's **one red action is "Log a set"**; the notify form stays secondary.
- I-Day finishes at the logger while gated, at Today the moment the gate is off.
  F-004 intact; both destinations pinned in the two guards that own that rule.
- The empty logger offers the **seeded first session** as its own labelled
  action. `handleEmptyStart` stays freestyle exactly as its comment demands
  ("Cold devices stay freestyle empty. Do not seed Just Go or Coach here"),
  nothing auto-starts, still one red action. Without it the road I had just
  opened ended on *"Add exercises above to begin logging sets"* — shard 4's
  missing-defaults complaint, freshly manufactured by my own fix, and found by
  walking the path rather than reasoning about it.

Measured, gated production build, a stranger with no cookie, account or invite:

```
0. landed /private
1. tap "Log a set"                           (the gate)
2. tap "Begin"                               (I-Day 1/2)
3. tap "Continue"                            (I-Day 2/2)
4. tap "Start Just Go — Legs — 4 exercises"  (the logger)
5. tap "Log set"                             → SETS 1/12
```

**Five interactions to a logged set, from a state where it was impossible.**

### The geo-block was a verdict with no cause, no exit, no alternative

US and LatAm are *supported*, so the state those respondents hit is almost
certainly `unknown_edge`: Cloudflare could not place the connection, which a VPN,
a privacy browser or a carrier proxy does routinely on mobile networks there. The
old sentence — *"We could not confirm a supported region for this connection"* —
named no cause, offered no way forward, and read as a rejection of the reader
rather than a limit of ours. It now names the usual cause and says turning a VPN
off generally resolves it, and no block message may read like a failure
(`error`/`denied`/`forbidden` asserted absent from all five).

`TERRITORY_STILL_WORKS` is one sentence with one home — the free logger runs on
this device, needs no account, data stays exportable — rendered by the gate,
sign-in, checkout and `/regions`. Always true, always buried: `/regions` said it
in its fifth section, after four lists of ISO codes. It now **leads** the page,
asserted to come before both the market-posture paragraph and the lists, because
a page that opens with a hundred country codes is what "broken" feels like. It
lives in its own module: imported from `supportedRegions.ts` it would have
dragged ~100 ISO codes onto the Today path (the `.766` split, again).

### No questionnaire between arriving on Active and the first set (shard 3)

The returning path ran Start → full-viewport `SessionCheckInSheet` (logger
underneath, unclickable) → Log set; now **2 interactions**. The rule already
existed in `sessionCheckInOffer.ts` and said *first* mission, which is exactly
the case shard 3 is not about. **The same sheet was manufacturing the input
Coach reasons from:** every row starts at 3 and `save()` wrote all three
unconditionally, so tapping its primary to get past it recorded a 3/3/3
readiness row nobody answered, into `computeBodyScores` and the plan. Only moved
rows are written now. My first tap harness was wrong in the product's favour —
it typed into a row that was already prefilled.

### The www first paint was downloading the legal library (shard 4)

`AppLegalFooter` renders eight legal links and sits on the gate, on I-Day and
under every info page; App Router prefetches links in the viewport, and on a
short screen that footer is. `/welcome` **416 → 334 KB gz, 53 → 37 requests**;
`/log` 594 → 545. The guard then found four more clusters (`SignInPanel`,
`LegalNav`, `ServiceTermsPage`, `TermsPage`). Two ratchets, because
`bundle-budget` is blind twice over: prefetch is a runtime fetch of *other*
routes' chunks, and the two pages that *are* www while gated had no budget at all
(both dynamic). Shard 4's four other findings were already fixed and undeployed;
the **buried Log button does not reproduce** — docked and in viewport at 360×640,
390×844 and 412×732.

### Guards

**26 mutants killed across these three ships, four of them defects in my own
guards.** One list verified itself, so **deleting** `'CA'` passed (the loop
stopped visiting it) — it now pins named members and sizes. One was satisfied by
a leftover `import` after the render was replaced with prose: the **third** time
that class has bitten (`.766` an import, `.768` a comment), so `readCode` strips
imports too. One asked `/regions` to link to itself. One compared a variable
declaration where it meant rendered order.

**Seven existing guards failed on this work and every one was right** — the gate
perimeter, the I-Day landing (×2), the hard-nav rule, the route contract, my own
prefetch route list, and the check-in dep array. Each re-pointed with its
reasoning; none weakened. Two are now stricter: the perimeter one enumerates what
stays shut, and the dep-array one checks membership instead of an exact array (it
had failed on master's `fieldTestParam` while the rule held perfectly).

### State

Unit **3199** · route contract · lint · typecheck · i18n parity · locale split ·
design system · display type · excellence gate. **Red on `master` and not from
this work:** `i18n:coverage` (70 keys with no EN pack, from `#544`'s merge —
identical count on `master` and here), `bundle-budget`, seven `/active`/`/track`
a11y sheet cases and `/leaderboard` axe, and two stale `gate-smoke` checks
asserting paths this product deliberately removed (`/america` is surface-parked;
`/locales/en/common.json` went in `.222`).

**Production is still `.697`** — its `/private` serves `Checking sign-in…`.
Everything in shards 1–4 that is fixed is fixed in git and invisible to users.

Label `.769` (onto `master` `.766`). Excellence-Override below.

Excellence-Override: www kaizen first-paint (RESULT unscored)

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

## 2026-08-13 — Preview walk P0s: consent dock + landing notify (`.765`)

Chrome walk of the ungated Preview path (mission-ops #19): the analytics
consent banner covered Today's only first-set CTA on phones, and Super Bundle
“get notified until Stripe” had no form once `/private` always redirected.

**Ship:** consent banner docks as a reserved flex sibling above the tab bar
(never `fixed bottom-0`). Landing mounts `LaunchNotifyForm` (existing
`/api/leads` path). No checkout. No Stripe-is-live claim. No invented traction.
`TAP_BUDGET` stays 5. Consent stays. `PRIVATE_MODE` unchanged. Preview will
not deploy.

Label `.765` (onto master `.764`). Brief reserved `.750` (occupied). First
land `.755` was occupied by unilateral L/R. Excellence-Override below.

Excellence-Override: preview walk P0s (consent dock + landing notify)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-750-for-765.md](docs/archive/log/LOG-rotate-750-for-765.md).

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
## 2026-08-13 — Habit week count + HABIT contract (`.753`)

Quiet public-safe OS node: **Habit → Identity → Money → Platform**. Identity is
#500; money is #498; the missing habit hook is an honest Today week-count — not
a Mission ID line, not #492’s two-day-off Start copy.

**Ship:** `docs/contracts/HABIT.md` — daily Train is the loop later modules hang
off. Today header (Lean + Dashboard) always shows `This week: N days logged`
(0 is fine; unique local days; tombstones out). Next action unchanged. No
WeChat / MySpace / Top 8. Frozen plan: [docs/HABIT_WEEK_PLAN.md](docs/HABIT_WEEK_PLAN.md).

Label `.753` (onto master `.752`). Originally reserved `.722`; landed as `.753` past master `.752`.
Excellence-Override below.

Excellence-Override: habit week count + HABIT contract

Rotated LOG oldest → [docs/archive/log/LOG-rotate-694-for-753.md](docs/archive/log/LOG-rotate-694-for-753.md).
