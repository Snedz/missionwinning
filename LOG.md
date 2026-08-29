# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep **≤15 entries** here, and never let the file grow. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Enforced by `src/lib/logBudget.test.ts` — until `.242` it was enforced by nothing, and the file had reached **27 entries / 127KB**.

> **The `≤20KB` half of this rule was unmeetable and is retired.** An entry here averages ~5.6KB, because the house style is to explain the defect class rather than name the change — which is the most valuable thing in this repo and not something to trade away for a byte count. Fifteen entries is ~84KB; obeying 20KB would have meant keeping **three**. So the count rule stands, and the size rule becomes a **ratchet**: the file may shrink, never grow. If the founder wants a hard byte ceiling instead, that is a call about house style, not about this file.

Latest first. Older entries: [docs/archive/log/LOG-rotate-1041-for-1058.md](docs/archive/log/LOG-rotate-1041-for-1058.md) (`.1041`). Prior rotate: [docs/archive/log/LOG-rotate-1040-for-1057.md](docs/archive/log/LOG-rotate-1040-for-1057.md) (`.1040`). Prior rotate: [docs/archive/log/LOG-rotate-1039-for-1056.md](docs/archive/log/LOG-rotate-1039-for-1056.md) (`.1039`). Prior rotate: [docs/archive/log/LOG-rotate-1038-for-1055.md](docs/archive/log/LOG-rotate-1038-for-1055.md) (`.1038`). Prior rotate: [docs/archive/log/LOG-rotate-1037-for-1054.md](docs/archive/log/LOG-rotate-1037-for-1054.md) (`.1037`). Prior rotate: [docs/archive/log/LOG-rotate-1036-for-1053.md](docs/archive/log/LOG-rotate-1036-for-1053.md) (`.1036`). Prior rotate: [docs/archive/log/LOG-rotate-1035-for-1052.md](docs/archive/log/LOG-rotate-1035-for-1052.md) (`.1035`). Reverted ship archived: [docs/archive/log/LOG-rotate-1051-for-1052.md](docs/archive/log/LOG-rotate-1051-for-1052.md) (`.1051`). Prior rotate: [docs/archive/log/LOG-rotate-1034-for-1050.md](docs/archive/log/LOG-rotate-1034-for-1050.md) (`.1034`). Reverted ship archived: [docs/archive/log/LOG-rotate-1049-for-1050.md](docs/archive/log/LOG-rotate-1049-for-1050.md) (`.1049`). Prior rotate: [docs/archive/log/LOG-rotate-1033-for-1048.md](docs/archive/log/LOG-rotate-1033-for-1048.md) (`.1033`). Prior rotate: [docs/archive/log/LOG-rotate-1032-for-1047.md](docs/archive/log/LOG-rotate-1032-for-1047.md) (`.1032`). Prior rotate: [docs/archive/log/LOG-rotate-1031-for-1046.md](docs/archive/log/LOG-rotate-1031-for-1046.md) (`.1031`). Prior rotate: [docs/archive/log/LOG-rotate-1030-for-1045.md](docs/archive/log/LOG-rotate-1030-for-1045.md) (`.1030`). Prior rotate: [docs/archive/log/LOG-rotate-1029-for-1044.md](docs/archive/log/LOG-rotate-1029-for-1044.md) (`.1029`). Prior rotate: [docs/archive/log/LOG-rotate-1028-for-1043.md](docs/archive/log/LOG-rotate-1028-for-1043.md) (`.1028`). Prior rotate: [docs/archive/log/LOG-rotate-1027-for-1042.md](docs/archive/log/LOG-rotate-1027-for-1042.md) (`.1027`). Prior rotate: [docs/archive/log/LOG-rotate-1026-for-1041.md](docs/archive/log/LOG-rotate-1026-for-1041.md) (`.1026`). Prior rotate: [docs/archive/log/LOG-rotate-1025-for-1040.md](docs/archive/log/LOG-rotate-1025-for-1040.md) (`.1025`). Prior rotate: [docs/archive/log/LOG-rotate-1024-for-1039.md](docs/archive/log/LOG-rotate-1024-for-1039.md) (`.1024`). Prior rotate: [docs/archive/log/LOG-rotate-1023-for-1038.md](docs/archive/log/LOG-rotate-1023-for-1038.md) (`.1023`). Prior rotate: [docs/archive/log/LOG-rotate-1022-for-1037.md](docs/archive/log/LOG-rotate-1022-for-1037.md) (`.1022`). Prior rotate: [docs/archive/log/LOG-rotate-1021-for-1036.md](docs/archive/log/LOG-rotate-1021-for-1036.md) (`.1021`). Prior rotate: [docs/archive/log/LOG-rotate-1020-for-1035.md](docs/archive/log/LOG-rotate-1020-for-1035.md) (`.1020`). Prior rotate: [docs/archive/log/LOG-rotate-1019-for-1034.md](docs/archive/log/LOG-rotate-1019-for-1034.md) (`.1019`). Prior rotate: [docs/archive/log/LOG-rotate-1018-for-1033.md](docs/archive/log/LOG-rotate-1018-for-1033.md) (`.1018`). Prior rotate: [docs/archive/log/LOG-rotate-1017-for-1032.md](docs/archive/log/LOG-rotate-1017-for-1032.md) (`.1017`). Prior rotate: [docs/archive/log/LOG-rotate-1016-for-1031.md](docs/archive/log/LOG-rotate-1016-for-1031.md) (`.1016`). Prior rotate: [docs/archive/log/LOG-rotate-1015-for-1030.md](docs/archive/log/LOG-rotate-1015-for-1030.md) (`.1015`). Prior rotate: [docs/archive/log/LOG-rotate-1014-for-1029.md](docs/archive/log/LOG-rotate-1014-for-1029.md) (`.1014`). Prior rotate: [docs/archive/log/LOG-rotate-1013-for-1028.md](docs/archive/log/LOG-rotate-1013-for-1028.md) (`.1013`). Prior rotate: [docs/archive/log/LOG-rotate-1012-for-1027.md](docs/archive/log/LOG-rotate-1012-for-1027.md) (`.1012`). Prior rotate: [docs/archive/log/LOG-rotate-1011-for-1026.md](docs/archive/log/LOG-rotate-1011-for-1026.md) (`.1011`). Prior rotate: [docs/archive/log/LOG-rotate-1010-for-1025.md](docs/archive/log/LOG-rotate-1010-for-1025.md) (`.1010`). Prior rotate: [docs/archive/log/LOG-rotate-1009-for-1024.md](docs/archive/log/LOG-rotate-1009-for-1024.md) (`.1009`). Prior rotate: [docs/archive/log/LOG-rotate-1008-for-1023.md](docs/archive/log/LOG-rotate-1008-for-1023.md) (`.1008`). Prior rotate: [docs/archive/log/LOG-rotate-1007-for-1022.md](docs/archive/log/LOG-rotate-1007-for-1022.md) (`.1007`). Prior rotate: [docs/archive/log/LOG-rotate-1006-for-1021.md](docs/archive/log/LOG-rotate-1006-for-1021.md) (`.1006`). Prior rotate: [docs/archive/log/LOG-rotate-1005-for-1020.md](docs/archive/log/LOG-rotate-1005-for-1020.md) (`.1005`). Prior rotate: [docs/archive/log/LOG-rotate-1004-for-1019.md](docs/archive/log/LOG-rotate-1004-for-1019.md) (`.1004`). Prior rotate: [docs/archive/log/LOG-rotate-1003-for-1018.md](docs/archive/log/LOG-rotate-1003-for-1018.md) (`.1003`). Prior rotate: [docs/archive/log/LOG-rotate-1002-for-1017.md](docs/archive/log/LOG-rotate-1002-for-1017.md) (`.1002`). Prior rotate: [docs/archive/log/LOG-rotate-1001-for-1016.md](docs/archive/log/LOG-rotate-1001-for-1016.md) (`.1001`). Prior rotate: [docs/archive/log/LOG-rotate-1000-for-1015.md](docs/archive/log/LOG-rotate-1000-for-1015.md) (`.1000`). Prior rotate: [docs/archive/log/LOG-rotate-999-for-1014.md](docs/archive/log/LOG-rotate-999-for-1014.md) (`.999`). Prior rotate: [docs/archive/log/LOG-rotate-998-for-1013.md](docs/archive/log/LOG-rotate-998-for-1013.md) (`.998`). Prior rotate: [docs/archive/log/LOG-rotate-997-for-1012.md](docs/archive/log/LOG-rotate-997-for-1012.md) (`.997`). Prior rotate: [docs/archive/log/LOG-rotate-996-for-1011.md](docs/archive/log/LOG-rotate-996-for-1011.md) (`.996`). Prior rotate: [docs/archive/log/LOG-rotate-995-for-1010.md](docs/archive/log/LOG-rotate-995-for-1010.md) (`.995`). Prior rotate: [docs/archive/log/LOG-rotate-994-for-1009.md](docs/archive/log/LOG-rotate-994-for-1009.md) (`.994`). Prior rotate: [docs/archive/log/LOG-rotate-993-for-1008.md](docs/archive/log/LOG-rotate-993-for-1008.md) (`.993`). Prior rotate: [docs/archive/log/LOG-rotate-992-for-1007.md](docs/archive/log/LOG-rotate-992-for-1007.md) (`.992`). Prior rotate: [docs/archive/log/LOG-rotate-991-for-1006.md](docs/archive/log/LOG-rotate-991-for-1006.md) (`.991`). Prior rotate: [docs/archive/log/LOG-rotate-989-for-1005.md](docs/archive/log/LOG-rotate-989-for-1005.md) (`.989`).

Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) · [2026-07-29 → 2026-07-30 (`.180`–`.199`)](docs/archive/log/LOG-2026-07-29_to_2026-07-30.md) (both rotated 2026-07-30) · [2026-07-30 → 2026-07-31 (`.200`–`.213`)](docs/archive/log/LOG-2026-07-30_to_2026-07-31.md) (rotated 2026-08-02) · [`.247` for `.263`](docs/archive/log/LOG-hero-audit-rotate-2026-08-03.md) · [`.279`](docs/archive/log/LOG-rotate-279.md) · [`.280`](docs/archive/log/LOG-rotate-280.md) · [`.281` for `.296`](docs/archive/log/LOG-rotate-296.md) · [`.282` for `.297`](docs/archive/log/LOG-rotate-297.md) · [`.283` for `.298`](docs/archive/log/LOG-rotate-298.md) · [`.284` for `.299`](docs/archive/log/LOG-rotate-299.md) · [`.285` for `.300`](docs/archive/log/LOG-rotate-300.md) · [`.286` for `.301`](docs/archive/log/LOG-rotate-301.md) · [`.287` for `.302`](docs/archive/log/LOG-rotate-302.md) · [`.288` for `.303`](docs/archive/log/LOG-rotate-303.md) · [`.289` for `.304`](docs/archive/log/LOG-rotate-304.md) · [`.290` for `.305`](docs/archive/log/LOG-rotate-305.md) · [`.291` for `.306`](docs/archive/log/LOG-rotate-306.md) · [`.292` for `.307`](docs/archive/log/LOG-rotate-307.md) · [`.293` for `.308`](docs/archive/log/LOG-rotate-308.md) · [`.294` for `.309`](docs/archive/log/LOG-rotate-309.md) · [`.295` for `.310`](docs/archive/log/LOG-rotate-310.md) · [`.296` for `.311`](docs/archive/log/LOG-rotate-311.md) · [`.297` for `.312`](docs/archive/log/LOG-rotate-312.md) · [`.298` for `.313`](docs/archive/log/LOG-rotate-313.md) · [`.299` for `.314`](docs/archive/log/LOG-rotate-314.md) · [`.300` for `.315`](docs/archive/log/LOG-rotate-315.md). · [`.301` for `.316`](docs/archive/log/LOG-rotate-316.md). · [`.302` for `.317`](docs/archive/log/LOG-rotate-317.md). · [`.303` for `.318`](docs/archive/log/LOG-rotate-318.md). · [`.304` for `.319`](docs/archive/log/LOG-rotate-319.md). · [`.305` for `.320`](docs/archive/log/LOG-rotate-320.md). · [`.306` for `.321`](docs/archive/log/LOG-rotate-321.md). · [`.307` for `.322`](docs/archive/log/LOG-rotate-322.md). · [`.308` for `.323`](docs/archive/log/LOG-rotate-323.md). · [`.309` for `.324`](docs/archive/log/LOG-rotate-324.md). · [`.310` for `.325`](docs/archive/log/LOG-rotate-325.md). · [`.311` for `.326`](docs/archive/log/LOG-rotate-326.md). · [`.312` for `.327`](docs/archive/log/LOG-rotate-327.md). · [`.313` for `.328`](docs/archive/log/LOG-rotate-328.md). · [`.314` for `.329`](docs/archive/log/LOG-rotate-329.md). · [`.315` for `.330`](docs/archive/log/LOG-rotate-330.md). · [`.316` for `.331`](docs/archive/log/LOG-rotate-331.md). · [`.317` for `.332`](docs/archive/log/LOG-rotate-332.md). · [`.318` for `.333`](docs/archive/log/LOG-rotate-333.md). · [`.319` for `.334`](docs/archive/log/LOG-rotate-334.md). · [`.320` for `.335`](docs/archive/log/LOG-rotate-335.md). · [`.321` for `.336`](docs/archive/log/LOG-rotate-336.md). · [`.322` for `.337`](docs/archive/log/LOG-rotate-337.md). · [`.323` for `.338`](docs/archive/log/LOG-rotate-338.md). · [`.324` for `.339`](docs/archive/log/LOG-rotate-339.md). · [`.325` for `.340`](docs/archive/log/LOG-rotate-340.md). · [`.326` for `.341`](docs/archive/log/LOG-rotate-341.md). · [`.327` for `.342`](docs/archive/log/LOG-rotate-342.md). · [`.328` for `.343`](docs/archive/log/LOG-rotate-343.md). · [`.329` for `.344`](docs/archive/log/LOG-rotate-344.md). · [`.330` for `.345`](docs/archive/log/LOG-rotate-345.md). · [`.331` for `.346`](docs/archive/log/LOG-rotate-346.md). · [`.332` for `.347`](docs/archive/log/LOG-rotate-347.md). · [`.333` for `.348`](docs/archive/log/LOG-rotate-348.md). · [`.334` for `.349`](docs/archive/log/LOG-rotate-349.md). · [`.335` for `.350`](docs/archive/log/LOG-rotate-350.md). · [`.336` for `.351`](docs/archive/log/LOG-rotate-351.md). · [`.337` for `.352`](docs/archive/log/LOG-rotate-352.md). · [`.338` for `.353`](docs/archive/log/LOG-rotate-353.md). · [`.339` for `.354`](docs/archive/log/LOG-rotate-354.md). · [`.340` for `.355`](docs/archive/log/LOG-rotate-355.md). · [`.341` for `.356`](docs/archive/log/LOG-rotate-356.md). · [`.342` for `.357`](docs/archive/log/LOG-rotate-357.md). · [`.343` for `.358`](docs/archive/log/LOG-rotate-358.md). · [`.344` for `.359`](docs/archive/log/LOG-rotate-359.md). · [`.345` for `.360`](docs/archive/log/LOG-rotate-360.md). · [`.346` for `.361`](docs/archive/log/LOG-rotate-361.md). · [`.347` for `.362`](docs/archive/log/LOG-rotate-362.md). · [`.348` for `.363`](docs/archive/log/LOG-rotate-363.md). · [`.349` for `.364`](docs/archive/log/LOG-rotate-364.md). · [`.350` for `.365`](docs/archive/log/LOG-rotate-365.md). · [`.351` for `.366`](docs/archive/log/LOG-rotate-366.md). · [`.352` for `.367`](docs/archive/log/LOG-rotate-367.md). · [`.353` for `.368`](docs/archive/log/LOG-rotate-368.md). · [`.354` for `.369`](docs/archive/log/LOG-rotate-369.md). · [`.355` for `.370`](docs/archive/log/LOG-rotate-370.md). · [`.356` for `.371`](docs/archive/log/LOG-rotate-371.md). · [`.357` for `.372`](docs/archive/log/LOG-rotate-372.md). · [`.358` for `.373`](docs/archive/log/LOG-rotate-373.md). · [`.359` for `.374`](docs/archive/log/LOG-rotate-374.md). · [`.360` for `.375`](docs/archive/log/LOG-rotate-375.md). · [`.361` for `.376`](docs/archive/log/LOG-rotate-376.md). · [`.362` for `.377`](docs/archive/log/LOG-rotate-377.md). · [`.363` for `.378`](docs/archive/log/LOG-rotate-378.md). · [`.364` for `.379`](docs/archive/log/LOG-rotate-379.md). · [`.365` for `.380`](docs/archive/log/LOG-rotate-380.md). · [`.366` for `.381`](docs/archive/log/LOG-rotate-381.md). · [`.367` for `.382`](docs/archive/log/LOG-rotate-382.md). · [`.368` for `.383`](docs/archive/log/LOG-rotate-383.md). · [`.369` for `.384`](docs/archive/log/LOG-rotate-384.md). · [`.370` for `.385`](docs/archive/log/LOG-rotate-385.md). · [`.371` for `.386`](docs/archive/log/LOG-rotate-386.md). · [`.372` for `.387`](docs/archive/log/LOG-rotate-387.md). · [`.373` for `.388`](docs/archive/log/LOG-rotate-388.md). · [`.374` for `.389`](docs/archive/log/LOG-rotate-389.md). · [`.375` for `.390`](docs/archive/log/LOG-rotate-390.md). · [`.376` for `.391`](docs/archive/log/LOG-rotate-391.md). · [`.377` for `.392`](docs/archive/log/LOG-rotate-392.md). · [`.378` for `.393`](docs/archive/log/LOG-rotate-393.md). · [`.379` for `.394`](docs/archive/log/LOG-rotate-394.md). · [`.380` for `.395`](docs/archive/log/LOG-rotate-395.md). · [`.381` for `.396`](docs/archive/log/LOG-rotate-396.md). · [`.382` for `.397`](docs/archive/log/LOG-rotate-397.md). · [`.383` for `.398`](docs/archive/log/LOG-rotate-398.md). · [`.384` for `.399`](docs/archive/log/LOG-rotate-399.md). · [`.385` for `.400`](docs/archive/log/LOG-rotate-400.md). · [`.386` for `.401`](docs/archive/log/LOG-rotate-401.md). · [`.387` for `.402`](docs/archive/log/LOG-rotate-402.md). · [`.388` for `.403`](docs/archive/log/LOG-rotate-403.md). · [`.389` for `.404`](docs/archive/log/LOG-rotate-404.md). · [`.390` for `.405`](docs/archive/log/LOG-rotate-405.md). · [`.391` for `.406`](docs/archive/log/LOG-rotate-406.md). · [`.392` for `.407`](docs/archive/log/LOG-rotate-407.md). · [`.393` for `.408`](docs/archive/log/LOG-rotate-408.md). · [`.394` for `.409`](docs/archive/log/LOG-rotate-409.md). · [`.395` for `.410`](docs/archive/log/LOG-rotate-410.md). · [`.396` for `.411`](docs/archive/log/LOG-rotate-411.md). · [`.397` for `.412`](docs/archive/log/LOG-rotate-412.md). · [`.398` for `.413`](docs/archive/log/LOG-rotate-413.md). · [`.399` for `.414`](docs/archive/log/LOG-rotate-414.md). · [`.400` for `.415`](docs/archive/log/LOG-rotate-415.md). · [`.401` for `.416`](docs/archive/log/LOG-rotate-416.md). · [`.402` for `.417`](docs/archive/log/LOG-rotate-417.md). · [`.403` for `.418`](docs/archive/log/LOG-rotate-418.md). · [`.404` for `.419`](docs/archive/log/LOG-rotate-419.md). · [`.405` for `.420`](docs/archive/log/LOG-rotate-420.md). · [`.406` for `.421`](docs/archive/log/LOG-rotate-421.md). · [`.407` for `.422`](docs/archive/log/LOG-rotate-422.md). · [`.408` for `.423`](docs/archive/log/LOG-rotate-423.md). · [`.409` for `.424`](docs/archive/log/LOG-rotate-424.md). · [`.410` for `.425`](docs/archive/log/LOG-rotate-425.md). · [`.411` for `.426`](docs/archive/log/LOG-rotate-426.md). · [`.412` for `.427`](docs/archive/log/LOG-rotate-427.md). · [`.413` for `.428`](docs/archive/log/LOG-rotate-428.md). · [`.414` for `.429`](docs/archive/log/LOG-rotate-429.md). · [`.415` for `.430`](docs/archive/log/LOG-rotate-430.md). · [`.416` for `.431`](docs/archive/log/LOG-rotate-431.md). · [`.417` for `.432`](docs/archive/log/LOG-rotate-432.md). · [`.418` for `.433`](docs/archive/log/LOG-rotate-433.md). · [`.419` for `.434`](docs/archive/log/LOG-rotate-434.md). · [`.420` for `.435`](docs/archive/log/LOG-rotate-435.md). · [`.421` for `.436`](docs/archive/log/LOG-rotate-436.md). · [`.422` for `.437`](docs/archive/log/LOG-rotate-437.md). · [`.423` for `.438`](docs/archive/log/LOG-rotate-438.md). · [`.424` for `.439`](docs/archive/log/LOG-rotate-439.md). · [`.425` for `.440`](docs/archive/log/LOG-rotate-440.md). · [`.426` for `.441`](docs/archive/log/LOG-rotate-441.md). · [`.427` for `.442`](docs/archive/log/LOG-rotate-442.md). · [`.428` for `.443`](docs/archive/log/LOG-rotate-443.md). · [`.429` for `.444`](docs/archive/log/LOG-rotate-444.md). · [`.430` for `.445`](docs/archive/log/LOG-rotate-445.md). · [`.431` for `.446`](docs/archive/log/LOG-rotate-446.md). · [`.432` for `.447`](docs/archive/log/LOG-rotate-447.md). · [`.433` for `.448`](docs/archive/log/LOG-rotate-448.md). · [`.434` for `.449`](docs/archive/log/LOG-rotate-449.md). · [`.435` for `.450`](docs/archive/log/LOG-rotate-450.md). · [`.436` for `.451`](docs/archive/log/LOG-rotate-451.md). · [`.437` for `.452`](docs/archive/log/LOG-rotate-452.md). · [`.438` for `.453`](docs/archive/log/LOG-rotate-453.md). · [`.439` for `.454`](docs/archive/log/LOG-rotate-454.md). · [`.440` for `.455`](docs/archive/log/LOG-rotate-455.md). · [`.441` for `.456`](docs/archive/log/LOG-rotate-456.md). · [`.442` for `.457`](docs/archive/log/LOG-rotate-457.md). · [`.443` for `.458`](docs/archive/log/LOG-rotate-458.md). · [`.444` for `.459`](docs/archive/log/LOG-rotate-459.md). · [`.445` for `.460`](docs/archive/log/LOG-rotate-460.md). · [`.446` for `.461`](docs/archive/log/LOG-rotate-461.md). · [`.447` for `.462`](docs/archive/log/LOG-rotate-462.md). · [`.448` for `.463`](docs/archive/log/LOG-rotate-463.md). · [`.449` for `.464`](docs/archive/log/LOG-rotate-464.md). · [`.450` for `.465`](docs/archive/log/LOG-rotate-465.md). · [`.451` for `.466`](docs/archive/log/LOG-rotate-466.md). · [`.452` for `.467`](docs/archive/log/LOG-rotate-467.md). · [`.453` for `.468`](docs/archive/log/LOG-rotate-468.md). · [`.454` for `.469`](docs/archive/log/LOG-rotate-469.md). · [`.455` for `.470`](docs/archive/log/LOG-rotate-470.md). · [`.456` for `.471`](docs/archive/log/LOG-rotate-471.md). · [`.457` for `.472`](docs/archive/log/LOG-rotate-472.md). · [`.458` for `.473`](docs/archive/log/LOG-rotate-473.md). · [`.459` for `.474`](docs/archive/log/LOG-rotate-474.md). · [`.460` for `.475`](docs/archive/log/LOG-rotate-475.md). · [`.461` for `.476`](docs/archive/log/LOG-rotate-476.md). · [`.462` for `.477`](docs/archive/log/LOG-rotate-477.md). · [`.463` for `.478`](docs/archive/log/LOG-rotate-478.md). · [`.464` for `.479`](docs/archive/log/LOG-rotate-479.md). · [`.465` for `.480`](docs/archive/log/LOG-rotate-480.md). · [`.466` for `.481`](docs/archive/log/LOG-rotate-481.md). · [`.467` for `.482`](docs/archive/log/LOG-rotate-482.md). · [`.468` for `.483`](docs/archive/log/LOG-rotate-483.md). · [`.469` for `.484`](docs/archive/log/LOG-rotate-484.md). · [`.470` for `.485`](docs/archive/log/LOG-rotate-485.md). · [`.471` for `.486`](docs/archive/log/LOG-rotate-486.md). · [`.472` for `.487`](docs/archive/log/LOG-rotate-487.md). · [`.473` for `.488`](docs/archive/log/LOG-rotate-488.md). · [`.474` for `.489`](docs/archive/log/LOG-rotate-489.md). · [`.475` for `.490`](docs/archive/log/LOG-rotate-490.md). · [`.476` for `.491`](docs/archive/log/LOG-rotate-491.md). · [`.477` for `.492`](docs/archive/log/LOG-rotate-492.md). · [`.478` for `.493`](docs/archive/log/LOG-rotate-493.md). · [`.479` for `.494`](docs/archive/log/LOG-rotate-494.md). · [`.480` for `.495`](docs/archive/log/LOG-rotate-495.md). · [`.481` for `.496`](docs/archive/log/LOG-rotate-496.md). · [`.482` for `.497`](docs/archive/log/LOG-rotate-497.md). · [`.483` for `.498`](docs/archive/log/LOG-rotate-498.md). · [`.484` for `.499`](docs/archive/log/LOG-rotate-499.md). · [`.485` for `.500`](docs/archive/log/LOG-rotate-500.md). · [`.486` for `.501`](docs/archive/log/LOG-rotate-501.md). · [`.487` for `.502`](docs/archive/log/LOG-rotate-502.md). · [`.488` for `.503`](docs/archive/log/LOG-rotate-503.md). · [`.490` for `.505`](docs/archive/log/LOG-rotate-505.md). · [`.491` for `.506`](docs/archive/log/LOG-rotate-506.md). · [`.579` for `.594`](docs/archive/log/LOG-rotate-594.md). · [`.580` for `.595`](docs/archive/log/LOG-rotate-595.md).


--- · [`.492` for `.507`](docs/archive/log/LOG-rotate-507.md). · [`.493` for `.508`](docs/archive/log/LOG-rotate-508.md). · [`.494` for `.509`](docs/archive/log/LOG-rotate-509.md). · [`.495` for `.510`](docs/archive/log/LOG-rotate-510.md). · [`.496` for `.511`](docs/archive/log/LOG-rotate-511.md). · [`.497` for `.512`](docs/archive/log/LOG-rotate-512.md). · [`.498` for `.513`](docs/archive/log/LOG-rotate-513.md). · [`.499` for `.514`](docs/archive/log/LOG-rotate-514.md). · [`.500` for `.515`](docs/archive/log/LOG-rotate-515.md). · [`.501` for `.516`](docs/archive/log/LOG-rotate-516.md). · [`.502` for `.517`](docs/archive/log/LOG-rotate-517.md). · [`.503` for `.518`](docs/archive/log/LOG-rotate-518.md). · [`.504` for `.519`](docs/archive/log/LOG-rotate-519.md). · [`.505` for `.520`](docs/archive/log/LOG-rotate-520.md). · [`.506` for `.521`](docs/archive/log/LOG-rotate-521.md). · [`.507` for `.522`](docs/archive/log/LOG-rotate-522.md). · [`.508` for `.523`](docs/archive/log/LOG-rotate-523.md). · [`.509` for `.524`](docs/archive/log/LOG-rotate-524.md). · [`.510` for `.525`](docs/archive/log/LOG-rotate-525.md). · [`.511` for `.526`](docs/archive/log/LOG-rotate-526.md). · [`.512` for `.527`](docs/archive/log/LOG-rotate-527.md). · [`.513` for `.528`](docs/archive/log/LOG-rotate-528.md). · [`.514` for `.529`](docs/archive/log/LOG-rotate-529.md). · [`.515` for `.530`](docs/archive/log/LOG-rotate-530.md). · [`.516` for `.531`](docs/archive/log/LOG-rotate-531.md). · [`.517` for `.532`](docs/archive/log/LOG-rotate-532.md). · [`.518` for `.533`](docs/archive/log/LOG-rotate-533.md). · [`.519` for `.534`](docs/archive/log/LOG-rotate-534.md). · [`.520` for `.535`](docs/archive/log/LOG-rotate-535.md). · [`.521` for `.536`](docs/archive/log/LOG-rotate-536.md). · [`.522` for `.537`](docs/archive/log/LOG-rotate-537.md). · [`.523` for `.538`](docs/archive/log/LOG-rotate-538.md). · [`.524` for `.539`](docs/archive/log/LOG-rotate-539.md). · [`.525` for `.540`](docs/archive/log/LOG-rotate-540.md). · [`.526` for `.541`](docs/archive/log/LOG-rotate-541.md). · [`.527` for `.542`](docs/archive/log/LOG-rotate-542.md). · [`.528` for `.543`](docs/archive/log/LOG-rotate-543.md). · [`.529` for `.544`](docs/archive/log/LOG-rotate-544.md). · [`.530` for `.545`](docs/archive/log/LOG-rotate-545.md). · [`.531` for `.546`](docs/archive/log/LOG-rotate-546.md). · [`.532` for `.547`](docs/archive/log/LOG-rotate-547.md). · [`.533` for `.548`](docs/archive/log/LOG-rotate-548.md). · [`.534` for `.549`](docs/archive/log/LOG-rotate-549.md). · [`.535` for `.550`](docs/archive/log/LOG-rotate-550.md). · [`.536` for `.551`](docs/archive/log/LOG-rotate-551.md). · [`.537` for `.552`](docs/archive/log/LOG-rotate-552.md). · [`.538` for `.553`](docs/archive/log/LOG-rotate-553.md). · [`.539` for `.554`](docs/archive/log/LOG-rotate-554.md). · [`.540` for `.555`](docs/archive/log/LOG-rotate-555.md). · [`.541` for `.556`](docs/archive/log/LOG-rotate-556.md). · [`.542` for `.557`](docs/archive/log/LOG-rotate-557.md). · [`.543` for `.558`](docs/archive/log/LOG-rotate-558.md). · [`.544` for `.559`](docs/archive/log/LOG-rotate-559.md). · [`.545` for `.560`](docs/archive/log/LOG-rotate-560.md). · [`.546` for `.561`](docs/archive/log/LOG-rotate-561.md). · [`.547` for `.562`](docs/archive/log/LOG-rotate-562.md). · [`.548` for `.563`](docs/archive/log/LOG-rotate-563.md). · [`.549` for `.564`](docs/archive/log/LOG-rotate-564.md). · [`.550` for `.565`](docs/archive/log/LOG-rotate-565.md). · [`.551` for `.566`](docs/archive/log/LOG-rotate-566.md). · [`.552` for `.567`](docs/archive/log/LOG-rotate-567.md). · [`.553` for `.568`](docs/archive/log/LOG-rotate-568.md). · [`.554` for `.569`](docs/archive/log/LOG-rotate-569.md). · [`.555` for `.570`](docs/archive/log/LOG-rotate-570.md). · [`.556` for `.571`](docs/archive/log/LOG-rotate-571.md). · [`.557` for `.572`](docs/archive/log/LOG-rotate-572.md). · [`.558` for `.573`](docs/archive/log/LOG-rotate-573.md). · [`.559` for `.574`](docs/archive/log/LOG-rotate-574.md). · [`.560` for `.575`](docs/archive/log/LOG-rotate-575.md). · [`.561` for `.576`](docs/archive/log/LOG-rotate-576.md). · [`.562` for `.577`](docs/archive/log/LOG-rotate-577.md). · [`.563` for `.578`](docs/archive/log/LOG-rotate-578.md). · [`.564` for `.579`](docs/archive/log/LOG-rotate-579.md). · [`.565` for `.580`](docs/archive/log/LOG-rotate-580.md). · [`.566` for `.581`](docs/archive/log/LOG-rotate-581.md). · [`.567` for `.582`](docs/archive/log/LOG-rotate-582.md). · [`.568` for `.583`](docs/archive/log/LOG-rotate-583.md). · [`.569` for `.584`](docs/archive/log/LOG-rotate-584.md). · [`.570` for `.585`](docs/archive/log/LOG-rotate-585.md). · [`.571` for `.586`](docs/archive/log/LOG-rotate-586.md). · [`.572` for `.587`](docs/archive/log/LOG-rotate-587.md). · [`.573` for `.588`](docs/archive/log/LOG-rotate-588.md). · [`.574` for `.589`](docs/archive/log/LOG-rotate-589.md). · [`.575` for `.590`](docs/archive/log/LOG-rotate-590.md). · [`.576` for `.591`](docs/archive/log/LOG-rotate-591.md). · [`.577` for `.592`](docs/archive/log/LOG-rotate-592.md). · [`.578` for `.593`](docs/archive/log/LOG-rotate-593.md). · [`.581` for `.596`](docs/archive/log/LOG-rotate-596.md). · [`.582` for `.597`](docs/archive/log/LOG-rotate-597.md). · [`.583` for `.598`](docs/archive/log/LOG-rotate-598.md). · [`.584` for `.599`](docs/archive/log/LOG-rotate-599.md). · [`.585` for `.600`](docs/archive/log/LOG-rotate-600.md). · [`.586` for `.601`](docs/archive/log/LOG-rotate-601.md). · [`.587` for `.602`](docs/archive/log/LOG-rotate-602.md). · [`.588` for `.603`](docs/archive/log/LOG-rotate-603.md). · [`.590` for `.606`](docs/archive/log/LOG-rotate-606.md). · [`.596` for `.612`](docs/archive/log/LOG-rotate-612.md). · [`.597` for `.613`](docs/archive/log/LOG-rotate-613.md). · [`.599` for `.614`](docs/archive/log/LOG-rotate-614.md). · [`.600` for `.615`](docs/archive/log/LOG-rotate-615.md). · [`.601` for `.616`](docs/archive/log/LOG-rotate-616.md). · [`.602` for `.617`](docs/archive/log/LOG-rotate-617.md). · [`.603` for `.618`](docs/archive/log/LOG-rotate-618.md). · [`.604` for `.619`](docs/archive/log/LOG-rotate-619.md). · [`.655` for `.670`](docs/archive/log/LOG-rotate-655-for-670.md). · [`.656` for `.679`](docs/archive/log/LOG-rotate-656-for-679.md). · [`.657` for `.680`](docs/archive/log/LOG-rotate-657-for-680.md). · [`.658` for `.684`](docs/archive/log/LOG-rotate-658-for-684.md). · [`.659` for `.685`](docs/archive/log/LOG-rotate-659-for-685.md). · [`.660` for `.689`](docs/archive/log/LOG-rotate-660-for-689.md). · [`.661` for `.690`](docs/archive/log/LOG-rotate-661-for-690.md). · [`.662` for `.691`](docs/archive/log/LOG-rotate-662-for-691.md). · [`.663` for `.692`](docs/archive/log/LOG-rotate-663-for-692.md). · [`.664` for `.693`](docs/archive/log/LOG-rotate-664-for-693.md). · [`.665` for `.694`](docs/archive/log/LOG-rotate-665-for-694.md). · [`.666` for `.695`](docs/archive/log/LOG-rotate-666-for-695.md). · [`.667` for `.696`](docs/archive/log/LOG-rotate-667-for-696.md). · [`.668` for `.697`](docs/archive/log/LOG-rotate-668-for-697.md). · [`.669` for `.714`](docs/archive/log/LOG-rotate-669-for-714.md). · [`.669` for `.743`](docs/archive/log/LOG-rotate-669-for-743.md). · [`.670` for `.743`](docs/archive/log/LOG-rotate-670-for-743.md). · [`.669` for `.744`](docs/archive/log/LOG-rotate-669-for-744.md). · [`.679` for `.744`](docs/archive/log/LOG-rotate-679-for-744.md). · [`.680` for `.745`](docs/archive/log/LOG-rotate-680-for-745.md). · [`.684` for `.746`](docs/archive/log/LOG-rotate-684-for-746.md). · [`.750` for `.765`](docs/archive/log/LOG-rotate-750-for-765.md). · [`.753` for `.768`](docs/archive/log/LOG-rotate-753-for-768.md). · [`.762` for `.777`](docs/archive/log/LOG-rotate-762-for-777.md). · [`.765` for `.780`](docs/archive/log/LOG-rotate-765-for-780.md). · [`.766` for `.781`](docs/archive/log/LOG-rotate-766-for-781.md). · [`.767` for form-object-kit](docs/archive/log/LOG-rotate-767-for-form-object-kit.md). · [`.768` for `.782`](docs/archive/log/LOG-rotate-768-for-782.md). · [`.769` for `.783`](docs/archive/log/LOG-rotate-769-for-783.md). · [`.770` for `.784`](docs/archive/log/LOG-rotate-770-for-784.md). · [`.771` for `.785`](docs/archive/log/LOG-rotate-771-for-785.md). · [`.772` for `.786`](docs/archive/log/LOG-rotate-772-for-786.md). · [`.773` for `.787`](docs/archive/log/LOG-rotate-773-for-787.md). · [`.774` for `.788`](docs/archive/log/LOG-rotate-774-for-788.md). · [`.775` for `.789`](docs/archive/log/LOG-rotate-775-for-789.md). · [`.776` for `.790`](docs/archive/log/LOG-rotate-776-for-790.md). · [`.777` for `.791`](docs/archive/log/LOG-rotate-777-for-791.md). · [`.778` for `.792`](docs/archive/log/LOG-rotate-778-for-792.md). · [`.826` for `.841`](docs/archive/log/LOG-rotate-826-for-841.md). · [`.827` for `.842`](docs/archive/log/LOG-rotate-827-for-842.md). · [`.829` for `.844`](docs/archive/log/LOG-rotate-829-for-844.md). · [`.830` for `.845`](docs/archive/log/LOG-rotate-830-for-845.md). · [`.831` for `.846`](docs/archive/log/LOG-rotate-831-for-846.md). · [`.828` for `.843`](docs/archive/log/LOG-rotate-828-for-843.md). · [`.832` for `.847`](docs/archive/log/LOG-rotate-832-for-847.md). · [`.833` for `.848`](docs/archive/log/LOG-rotate-833-for-848.md). · [`.834` for `.849`](docs/archive/log/LOG-rotate-834-for-849.md). · [`.862` for `.880`](docs/archive/log/LOG-rotate-862-for-880.md). · [`.863` for `.881`](docs/archive/log/LOG-rotate-863-for-881.md). · [`.864` for `.882`](docs/archive/log/LOG-rotate-864-for-882.md). · [`.865` for `.883`](docs/archive/log/LOG-rotate-865-for-883.md). · [`.866` for `.884`](docs/archive/log/LOG-rotate-866-for-884.md). · [`.867` for `.885`](docs/archive/log/LOG-rotate-867-for-885.md). · [`.868` for `.886`](docs/archive/log/LOG-rotate-868-for-886.md). · [`.869` for `.887`](docs/archive/log/LOG-rotate-869-for-887.md). · [`.870` for `.888`](docs/archive/log/LOG-rotate-870-for-888.md). · [`.871` for `.889`](docs/archive/log/LOG-rotate-871-for-889.md). · [`.872` for `.890`](docs/archive/log/LOG-rotate-872-for-890.md). · [`.873` for `.891`](docs/archive/log/LOG-rotate-873-for-891.md). · [`.874` for `.892`](docs/archive/log/LOG-rotate-874-for-892.md). · [`.875` for `.893`](docs/archive/log/LOG-rotate-875-for-893.md). · [`.876` for `.894`](docs/archive/log/LOG-rotate-876-for-894.md). · [`.880` for `.895`](docs/archive/log/LOG-rotate-880-for-895.md). · [`.881` for `.896`](docs/archive/log/LOG-rotate-881-for-896.md). · [`.882` for `.897`](docs/archive/log/LOG-rotate-882-for-897.md). · [`.883` for `.898`](docs/archive/log/LOG-rotate-883-for-898.md). · [`.884` for `.899`](docs/archive/log/LOG-rotate-884-for-899.md). · [`.885` for `.900`](docs/archive/log/LOG-rotate-885-for-900.md). · [`.886` for `.901`](docs/archive/log/LOG-rotate-886-for-901.md). · [`.887` for `.902`](docs/archive/log/LOG-rotate-887-for-902.md). · [`.888` for `.903`](docs/archive/log/LOG-rotate-888-for-903.md). · [`.889` for `.904`](docs/archive/log/LOG-rotate-889-for-904.md). · [`.890` for `.905`](docs/archive/log/LOG-rotate-890-for-905.md). · [`.891` for `.906`](docs/archive/log/LOG-rotate-891-for-906.md). · [`.892` for `.907`](docs/archive/log/LOG-rotate-892-for-907.md). · [`.893` for `.908`](docs/archive/log/LOG-rotate-893-for-908.md). · [`.894` for `.909`](docs/archive/log/LOG-rotate-894-for-909.md). · [`.895` for `.910`](docs/archive/log/LOG-rotate-895-for-910.md). · [`.896` for `.911`](docs/archive/log/LOG-rotate-896-for-911.md). · [`.897` for `.912`](docs/archive/log/LOG-rotate-897-for-912.md). · [`.898` for `.913`](docs/archive/log/LOG-rotate-898-for-913.md). · [`.899` for `.914`](docs/archive/log/LOG-rotate-899-for-914.md). · [`.900` for `.915`](docs/archive/log/LOG-rotate-900-for-915.md). · [`.901` for `.916`](docs/archive/log/LOG-rotate-901-for-916.md). · [`.902` for `.917`](docs/archive/log/LOG-rotate-902-for-917.md). · [`.903` for `.918`](docs/archive/log/LOG-rotate-903-for-918.md). · [`.904` for `.919`](docs/archive/log/LOG-rotate-904-for-919.md). · [`.905` for `.920`](docs/archive/log/LOG-rotate-905-for-920.md). · [`.906` for `.921`](docs/archive/log/LOG-rotate-906-for-921.md). · [`.907` for `.922`](docs/archive/log/LOG-rotate-907-for-922.md). · [`.908` for `.923`](docs/archive/log/LOG-rotate-908-for-923.md). · [`.909` for `.924`](docs/archive/log/LOG-rotate-909-for-924.md). · [`.910` for `.925`](docs/archive/log/LOG-rotate-910-for-925.md). · [`.911` for `.926`](docs/archive/log/LOG-rotate-911-for-926.md). · [`.912` for `.927`](docs/archive/log/LOG-rotate-912-for-927.md). · [`.913` for `.928`](docs/archive/log/LOG-rotate-913-for-928.md). · [`.914` for `.929`](docs/archive/log/LOG-rotate-914-for-929.md). · [`.915` for `.930`](docs/archive/log/LOG-rotate-915-for-930.md). · [`.916` for `.933`](docs/archive/log/LOG-rotate-916-for-933.md). · [`.917` for `.934`](docs/archive/log/LOG-rotate-917-for-934.md). · [`.919` for `.939`](docs/archive/log/LOG-rotate-919-for-939.md). · [`.920` for `.940`](docs/archive/log/LOG-rotate-920-for-940.md). · [`.921` for `.941`](docs/archive/log/LOG-rotate-921-for-941.md). · [`.922` for `.942`](docs/archive/log/LOG-rotate-922-for-942.md). · [`.923` for `.943`](docs/archive/log/LOG-rotate-923-for-943.md). · [`.925` for `.945`](docs/archive/log/LOG-rotate-925-for-945.md). · [`.924` for `.944`](docs/archive/log/LOG-rotate-924-for-944.md). · [`.927` for `.947`](docs/archive/log/LOG-rotate-927-for-947.md). · [`.928` for `.949`](docs/archive/log/LOG-rotate-928-for-949.md). · [`.929` for `.950`](docs/archive/log/LOG-rotate-929-for-950.md). · [`.930` for `.951`](docs/archive/log/LOG-rotate-930-for-951.md). · [`.933` for `.952`](docs/archive/log/LOG-rotate-933-for-952.md). · [`.934` for `.953`](docs/archive/log/LOG-rotate-934-for-953.md). · [`.940` for `.956`](docs/archive/log/LOG-rotate-940-for-956.md). · [`.941` for `.957`](docs/archive/log/LOG-rotate-941-for-957.md). · [`.942` for `.958`](docs/archive/log/LOG-rotate-942-for-958.md). · [`.943` for `.959`](docs/archive/log/LOG-rotate-943-for-959.md). · [`.944` for `.960`](docs/archive/log/LOG-rotate-944-for-960.md). · [`.945` for `.961`](docs/archive/log/LOG-rotate-945-for-961.md). · [`.946` for `.963`](docs/archive/log/LOG-rotate-946-for-963.md). · [`.947` for `.965`](docs/archive/log/LOG-rotate-947-for-965.md). · [`.950` for `.970`](docs/archive/log/LOG-rotate-950-for-970.md). · [`.951` for `.971`](docs/archive/log/LOG-rotate-951-for-971.md). · [`.952` for `.973`](docs/archive/log/LOG-rotate-952-for-973.md). · [`.953` for `.974`](docs/archive/log/LOG-rotate-953-for-974.md). · [`.954` for `.976`](docs/archive/log/LOG-rotate-954-for-976.md). · [`.955` for `.977`](docs/archive/log/LOG-rotate-955-for-977.md). · [`.956` for `.978`](docs/archive/log/LOG-rotate-956-for-978.md). · [`.957` for `.980`](docs/archive/log/LOG-rotate-957-for-980.md). · [`.958` for `.981`](docs/archive/log/LOG-rotate-958-for-981.md). · [`.959` for `.983`](docs/archive/log/LOG-rotate-959-for-983.md). · [`.960` for `.985`](docs/archive/log/LOG-rotate-960-for-985.md). · [`.965` for `.989`](docs/archive/log/LOG-rotate-965-for-989.md). · [`.967` for `.991`](docs/archive/log/LOG-rotate-967-for-991.md). · [`.991` for `.1006`](docs/archive/log/LOG-rotate-991-for-1006.md). · [`.992` for `.1007`](docs/archive/log/LOG-rotate-992-for-1007.md). · [`.993` for `.1008`](docs/archive/log/LOG-rotate-993-for-1008.md). · [`.994` for `.1009`](docs/archive/log/LOG-rotate-994-for-1009.md). · [`.995` for `.1010`](docs/archive/log/LOG-rotate-995-for-1010.md). · [`.996` for `.1011`](docs/archive/log/LOG-rotate-996-for-1011.md). · [`.997` for `.1012`](docs/archive/log/LOG-rotate-997-for-1012.md). · [`.998` for `.1013`](docs/archive/log/LOG-rotate-998-for-1013.md). · [`.999` for `.1014`](docs/archive/log/LOG-rotate-999-for-1014.md).

## 2026-08-29 — /active first paint is a set table (`.1058`)

You kit locked cite is house leftover.
Account more-settings calculators body cite is house leftover.
Account first-paint free-beta foot cite is house leftover.
Account first-paint sign-in hint cite is house leftover.
Account first-paint Explore places body cite is house leftover.
Account first-paint language switcher cite is house leftover.
Account first-paint visibility body cite is house leftover.
Account first-paint reminders kinds list is house leftover.
Account first-paint feedback body cite is house leftover.
Account first-paint referral sign-in hint cite is house leftover.
Account first-paint referral body cite is house leftover.
Account first-paint reminders hint cite is house leftover.
Account first-paint reminders unavailable cite is house leftover.
Account first-paint home gym kit body cite is house leftover.
You kit body cite is house leftover.
You table row label cite is house leftover.
You table body cite is house leftover.
You private note saved cite is house leftover.
You private note counter cite is house leftover.
Account first-paint goals hint cite is house leftover.
Account first-paint language hint cite is house leftover.
Account first-paint units hint cite is house leftover.
You private note body cite is house leftover.
You share body cite is house leftover.
You private note textarea is house leftover.
You table Edit / row hairlines is house leftover.
You athlete card Edit / signature cites is house leftover.
Account first-paint goals textarea is house leftover.
You identity Edit / signature cites is house leftover.
Under the Hood week-4 diagnostic card is house leftover.
Account first-paint reminders day-review row is house leftover.
Account owner-tools beta admin cards is house leftover.
Account owner-tools cards is house leftover.
Account owner-tools founder status board is house leftover.
Account more-settings sync status row is house leftover.
Account more-settings import card is house leftover.
Account more-settings backup card is house leftover.
Account more-settings privacy card is house leftover.
Account more-settings What’s New card is house leftover.
Account more-settings wearables card is house leftover.
Account more-settings journey card is house leftover.
Account more-settings beta journey card is house leftover.
Account more-settings assessment card is house leftover.
Account more-settings pregnancy card is house leftover.
Visibility first-paint report row is house leftover.
You first-paint career card is house leftover.
You first-paint share card is house leftover.
You first-paint private note card is house leftover.
You first-paint kit card is house leftover.
Account first-paint premium card is house leftover.
Account first-paint feedback card is house leftover.
Account first-paint referral card is house leftover.
You first-paint rewards card is house leftover.
Account first-paint goals card is house leftover.
Account first-paint language card is house leftover.
Account first-paint units card is house leftover.
Account first-paint home gym kit is house leftover.
Account first-paint reminders card is house leftover.
Account first-paint account card is house leftover.
You first-paint table card is house leftover.
You first-paint athlete card is house leftover.
Account first-paint visibility card is house leftover.
Account first-paint sign-in block is house leftover.
You first-paint identity card is house leftover.
Garage first-paint board is house leftover.
Log set leading is house leftover.
Log set weight is house leftover.
Log set size is house leftover.
Set table size is house leftover.
First-rooms Week navigates
from first paint (`href="/log#today-week"`).
Builder Show-all door is house leftover.
Coach Show-all door is house leftover.
Library Show-all door is house leftover.
History Show-all door is house leftover.
Show-all door is house leftover.
In-set cue line size is house leftover.
Session clock size is house leftover.
In-set cue mark is house leftover.
In-set cue still is house leftover.
In-set cue line is house leftover.
Session title is a house title.
Session clock cite is house leftover.
Kind chip row is house leftover.
Upcoming set row is house leftover.
Set row hairline is house leftover.
Prev cite is house leftover.
First-rooms History navigates
from first paint (`href="/history"`).
Lock until a finish stays.
`/history` day client nav is not
group Loading. Segment loading
is house leftover.
Coach first paint is not a
plan skeleton. House leftover
until !loading. Generate still
waits. Voice extras stay parked.
History first paint is not
Loading sessions. House leftover
until persist hydrate. Empty
still waits. Calendar / charts
stay parked.
`/builder` client nav is not
group Loading. Segment loading
is house leftover.
`/coach` client nav is not
group Loading. Segment loading
is house leftover.
`/history` client nav is not
group Loading. Segment loading
is house leftover.
`/library` client nav is not
group Loading. Segment loading
is house leftover.
`/log` client nav is not
group Loading. Segment loading
is house leftover.
`/active` client nav is not
group Loading. Segment loading
is house compose leftover.
First-rooms Log a set navigates
from first paint (`href="/active"`).
Compact hero Start navigates
from first paint (`href="/active"`).
Form / Swap sheets open on
click from first paint.
Overlay portals when open —
no mount wait. Form guide
resolves from the painted
compose. Sidecar first paint does not
wait on persist.
`composeSidecarWorkout` paints
the session name + rest/notes
when the store is empty.
`/active` first paint Log set
does not wait on persist.
`composeNextSet` paints the next
set from the compose when the
store is empty. Cold `/active` was Restoring
session with Start disabled.
`writeTodayComposeSession` shipped
on `.1057` as source guards; persist
rehydrate still wiped the compose,
and the route was a `dynamic()`
`RouteLoading` skeleton. The logger
is a static page. Layout effect
writes today's session before paint.
Persist merge keeps an in-memory
Just Go over a persisted null.
Logged work on disk still wins.
Reconcile after hydrate re-seeds an
empty canvas even with a pending
remote. Start on `/log` writes then
navigates — no second start after
`loadCoachTodayOptional`. Course first paint is house leftover
(title + locked / empty — not RouteLoading).
Guide chapter first paint is house leftover
(title + body — not RouteLoading).
Guidebook first paint is house leftover
(title + chapter list — not RouteLoading).
Learn first paint is house leftover
(title + quiet intro — not RouteLoading).
Mind first paint is house leftover
(title + check-in / breathe — not useSearchParams skeleton).
Move first paint is house leftover
(title + flow list / quiet log — not useSearchParams skeleton).
Super Bundle first paint is house leftover
(title + offer — not RouteLoading; free-beta still 307s to `/notify`).
Benchmarks first paint is house leftover
(title + stats / empty — not RouteLoading).
Leaderboard first paint is house leftover
(title + board — not RouteLoading).
Visibility first paint is house leftover
(title + report — not RouteLoading).
Under the Hood first paint is house leftover
(title + weights — not RouteLoading).
Track first paint is house leftover
(title + weight / tape — not RouteLoading).
Fuel first paint is house leftover
(title + notepad / today log / remaining — not
RouteLoading).
Builder first paint is house leftover
(title + Blank workout / saved — not RouteLoading).
Coach first paint is house leftover
(title + empty/generate or week — not RouteLoading).
Library first paint is house leftover
(title + catalog list — not RouteLoading).
History list first paint is house leftover
(title + list/empty — not RouteLoading).
History
day first paint is house leftover
(date + that day's rows). Calendar
/ charts stay parked. Log set is house leftover
press (`--house-press` / #18181b), filled
`primary-action`, ungated. LogConsole Log set is
house leftover press (`--house-press` / #18181b),
not poster-red. Form guide + Swap portal is
house leftover (`mw-house` on the overlay root).
Merge-exercises dialog is house leftover
(`mw-house` on Radix Content).
Account first paint is
house leftover (sign-in / return / prefs) — not
`RouteLoading` / `useSearchParams` skeleton.
You first paint is house leftover
(identity / kit) — not `RouteLoading`.
Restoring session is not
the product. Guest. First set
ungated. Today still one Start.
Resume `.963` kept. `/private` stays
the tight lock. No `PRIVATE_MODE`
flip. No promote. Live www stays
`.696`.

Label `2026.07-unified.1058` (from
master `.1057` / `f302f40f`). Stamp
stays `.1058`. `[skip vercel]`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1041-for-1058.md](docs/archive/log/LOG-rotate-1041-for-1058.md).

## 2026-08-27 — Left second bar + transferred rooms (`.1057`)

Home and Library open a left
column next to the icon rail
(72 + 264, hides under 723) —
not a far-right More sheet.
Start in that bar is one click
to `/active` compose. This week
pane shows the real week and
doors `generateWeek` on `/coach`
only. History / Weekly plan /
Library / Builder are the real
rooms and drop the old pillar
title once the second bar names
them. More leftover (Fuel / You
/ Account + quiet Move / Mind /
Track / Learn / Feedback /
Garage) keeps a quiet house
title. House design system
(`src/components/house/DESIGN.md`)
locks white / zinc / 16px / black
pills / 72+264. Desktop wraps the
second bar and canvas in one white
12px sheet on a grey stage (8px
inset, flush to the rail). Compact
unwraps the sheet (`display:
contents`). Second-bar rows are
12px, selected `#eee`. Rail
selected is 48×48 / 8px / `#eee`.
Train plus is a 40px white circle
with a 1px line (no shadow); click
is still `/active`. On the sheet,
Today starts with the session
(date stays; no second Today
H1). Start hero is flush, not a
nested paper card. First rooms
stay one object. Compact still
shows the Today title. Library
catalog rows are house items
(hairline pick list); chips in
the filter bar are house-state.
Compact floor plus matches the
desktop 40px white circle.
Library filter and empty stay
house objects. History first-paint
rows are house items (open log;
Again / Details ghost). Weekly
plan empty is house-empty;
Generate stays the one filled
dock on `/coach`. `/history`
`/library` `/coach` still 307
to `/private` on this host. Builder first
paint is a flush Blank workout plus
hairline saved rows; templates stay
in Show all. Account leftover is
`house-account`: quiet title stays,
sign-in / return / prefs stay first
paint, Explore / more settings / help
are house-card. Sidecar leftover
rooms are Account / You only —
never History or Coach on the right.
`/account` still 307 to `/private`
on this host. Explore leftover
is `house-explore`: quiet title
stays, board + pin list stay first
paint, Add a place is a house-card,
never a rail, Account still doors
it. Assessment leftover is
`house-assess`: form is the first-paint
object, one filled submit, question
labels use EN floors on first paint,
stage prompts stay in Show all, Sign-in
stays extra. Calculator leftover is
`house-calc`: 1RM / macros / plates
stay first paint, chips are
house-state, tools sit in
house-card, premium stays in Show
all, Sign-in stays extra, never a
rail, Account More settings still
doors it. Human coaching leftover is
`house-coaching`: form is the first-paint
object, one filled submit, never a
rail, not Mission Coach. Programs leftover is
`house-programs`: education outlines first,
chips are house-state, Unlock / price stay
in Show all, never a rail, not a shop.
Help leftover is `house-help`: FAQ is
the first-paint object, hairline items,
never a rail. Cookies leftover is
`house-cookies`: overview + inventory
stay first paint, table is a house
object, never a rail. Privacy leftover is
`house-privacy`: jump chips are house-state,
sections are house-card, never a rail,
legal copy unchanged. Terms leftover is
`house-terms`: jump chips are house-state,
sections are house-card, never a rail,
legal copy unchanged. Refunds leftover is
`house-refunds`: jump chips are house-state,
sections are house-card, never a rail,
legal copy unchanged. DMCA leftover is
`house-dmca`: jump chips are house-state,
sections are house-card, never a rail,
legal copy unchanged. Usage leftover is
`house-usage`: jump chips are house-state,
sections are house-card, never a rail,
legal copy unchanged. Regions leftover is
`house-regions`: jump chips are house-state,
sections are house-card, never a rail,
legal copy unchanged. Service-terms leftover is
`house-service-terms`: jump chips are house-state,
sections are house-card, never a rail,
legal copy unchanged. Accessibility leftover is
`house-a11y`: jump chips are house-state,
sections are house-card, never a rail,
legal copy unchanged. More leftover Fuel / You / Account
are 12px rows, selected `#eee`.
Quiet More foot is stacked 13px
muted rows; current leftover is
ink, not `#eee`. Train compose leftover:
empty is house-lede, Add exercise is
house-btn, extras in house-card Show
all, Log set stays filled and ungated.
In-set cues are a house kicker plus
ghost hide / Learn door — never a
second filled action. Kind chips are
house-state; selected `#eee`; Log set
stays the filled ungated action. Add Set
is house-btn. Rest lanes are house-state;
selected `#eee`. Number cells are house-num.
Finish is house-btn, not filled.
Session more is a house leftover:
ghost more, house-card overflow.
Plates / tip stay in overflow.
Skip this exercise is house-btn hold,
not filled. Swap is house-btn ghost,
not filled. Swap confirm is house-btn, not filled.
Form guide is house-btn ghost.
Form guide confirm is house-btn, not filled.
Repeat last set is house-btn, not filled.
Pin and Note are house-field.
Exercise more is a house leftover:
ghost more, house-card overflow.
Add-exercise search is house leftover.
This-movement history is house leftover:
Close is house-btn; rows are house-movement-row.
Extra set cells are house-num.
Plate skip is house-btn.
Next-cite Skip is house-btn.
Set options is a house leftover:
ghost more, house-card overflow.
Reorder handle is a house leftover:
ghost house-btn grip and arrows.
Show-all extras are house leftover.
Session notes are house-field.
Heart rate is house leftover.
Rest dock is house leftover.
Skip is house-btn, not filled.
Last-set ghost is a house leftover:
house-btn ghost, not filled.
Load-% cell is house-num.
Readiness extra is house leftover.
Warmup toggle is house leftover.
Set side is house-num.
Form guide body is house leftover.
Garage swap is house leftover.
Exercise card is house leftover.
Exercise head is house leftover.
Add-exercise sheet is house leftover.
Check-in confirm is house leftover.
Check-in scale is house leftover.
Hard-session confirm is house leftover.
Overlay header is house leftover.
Swap sheet is house leftover.
Movement history sheet is house leftover.
Overlay footer is house leftover.
Overlay panel is house leftover.
Form guide sections is house leftover.
Set table head is house leftover.
Set row kicker is house leftover.
Logged check is house leftover.
Completed row is house leftover.
Plus-load prefix is house leftover.
Kind badge is house leftover.
Movement history date is house leftover.
Session more hold is house leftover.
Cue me is house leftover.
Plate loader is house leftover.
History tools are house leftover.
Library Filters is house leftover.
Library Filters sheet is house leftover.
Library detail is house leftover.
Library hidden is house leftover.
Library search is house leftover.
History search is house leftover.
Builder Show all extras is house leftover.
Coach generate dock is house leftover.
Coach next-day cite is house leftover.
Coach week dose is house leftover.
Library showing count is house leftover.
Coach session card is house leftover.
Coach session lift is house leftover.
Coach live voice is house leftover.
Coach adapt banner is house leftover.
Coach Show all extras is house leftover.
Coach week strip is house leftover.
Library pick bar is house leftover.
Library Show all extras is house leftover.
History Show all extras is house leftover.
Today Start quiet offers are house leftover.
Move first-paint flow list is house leftover.
Track first-paint metrics is house leftover.
Mind first-paint check-in is house leftover.
Learn first-paint intro is house leftover.
Mind first-paint breathe is house leftover.
Move first-paint quiet log is house leftover.
Fuel first-paint notepad is house leftover.
Fuel first-paint today log is house leftover.
Fuel first-paint remaining is house leftover.
Train sidecar leftover is rest /
skip / notes; History stays on Home.
You leftover is
`house-profile` (Account door is a
ghost house button). Fuel leftover
is `house-fuel` (log first; search /
barcode / recipes in Show all). Fuel
first-paint notepad is house leftover
(recents are house-state; type is
house-field; water is house-btn, not
filled). Fuel first-paint today log is
house leftover (Load from Cloud is
house-btn, not filled; meal folds drop
`border-2`; edit draft stays). Fuel
first-paint remaining is house leftover
(kicker not uppercase tracking;
MeterBar stays). Quiet
More leftovers Move / Mind / Track /
Learn carry house-move / house-mind /
house-track / house-learn. Move
first-paint flow list is house leftover
(Start Flow is house-btn, not filled;
collection chips are house-state,
selected `#eee`). Track first-paint
metrics is house leftover (Log is
house-btn, not filled; metric chips
are house-state, selected `#eee`;
chart stays; walks / GPS stay Show
all). Mind first-paint check-in is
house leftover (Save is house-btn-primary,
not `--accent-poster`; scale ticks are
ink, not red; Behavior strip / breathe
/ sessions stay). Mind first-paint
breathe is house leftover (Start /
Pause / Reset are house-btn, not
filled; pattern chips are house-state,
selected `#eee`). Move first-paint
quiet log is house leftover (Log is
house-btn, not filled; kind chips are
house-state, selected `#eee`). Learn first-paint
intro is house leftover (doors are
house-btn, not filled; other paths
stay Show all). Extra tools stay in
house-card Show all. Feedback leftover
is `house-feedback`: quiet title stays,
the form is the first-paint object, one
filled submit, Sign-in stays extra.
Garage leftover is `house-garage`: quiet
foot only, never a rail, first paint
unchanged. `/feedback` is 200 on this
host; `/server` still 307 to `/private`.
Today first paint stays the
Thursday desk (Just Go, first
rooms, week strip) — never hide
them until snap. Start on `/log`
writes today's session (Just Go
with last loads) before Train
opens — second-bar Start writes
too. `/active` first paint is
add-exercise + a set row + Log
set; hydrate does not own the
canvas. Never Restoring session
as the product. handleEmptyStart
stays freestyle empty. Coach inner costume eyebrow is
gone. Today has one filled
action (Start); week generate
is a door to `/coach`.
`/private` / landing / www
untouched. Reduced-motion still
honoured. One Got it. Checklist
ticks from visits. Hover chips stay
to the right of each rail icon.
`[skip vercel]`. No
`PRIVATE_MODE` flip. No promote.
Live www stays `.696`.

Label `2026.07-unified.1057` (from
master `.1056` / `9daa7d18`). Stamp
stays `.1057`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1040-for-1057.md](docs/archive/log/LOG-rotate-1040-for-1057.md).

## 2026-08-27 — From-scratch signed-in house (`.1056`)

New signed-in website. Not #885.
Icon rail 72 + second bar 264
(hides under 723). Home rooms:
Start / This week / History /
Weekly plan. Library: Library /
Builder. Hover chips: Today,
Train, Library, You, More. One
Got it mark (dismiss only — no
popup chain). Persistent
checklist under Start (Log a set
→ compose, Open this week →
back-chevron pane, History after
a finish — locked with a why-
tooltip). Ticks from visits, not
a chore list. Honest Start (no
dummy; lands `/active`). More is
leftover. Garage stays locked.
Short eased motion on hover
chips, second-rail pane, checklist
fold, Got it (respects reduced
motion). Engines stay. Zero diffs on
`/private`, landing, www.
`[skip vercel]`. No `PRIVATE_MODE`
flip. No promote. Live www stays `.696`.

Label `2026.07-unified.1056` (from
master `.1055` / `e44351c3`). Stamp
stays `.1056`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1039-for-1056.md](docs/archive/log/LOG-rotate-1039-for-1056.md).

## 2026-08-27 — Later-door object model + isolation holds (`.1055`)

The locked sequence after
skeleton + v0 catalog is the
later-door object model. Isolation
holds were already tests in
`.1053`, not comments.

**Ship:** docs + cite only. Short
object-model section on
`docs/IA_SKELETON.md`. Existing
rooms only. Isolation already
enforced: Today/Train do not
import social; dock = `/log` +
`/active`; `generateWeek` never
reads `/server` as week input;
chat never withholds a set.
Enforcers: `isolation.test.ts` +
`domainBoundary` C1–C3 +
`weekWriter.test.ts`. No new
tests. No new room. No costume.
`/private` / www / signed-in
chrome untouched. Guest. First
set ungated. Today still one
Start. Resume `.963` kept.
`[skip vercel]`. No
`PRIVATE_MODE` flip. No
production promote. Live www
stays `.696`. `#876` stays
parked.

Label `2026.07-unified.1055` (from
master `.1054` / `20b99670`). Stamp
stays `.1055`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1038-for-1055.md](docs/archive/log/LOG-rotate-1038-for-1055.md).

## 2026-08-27 — v0 catalog labeling (`.1054`)

The official training catalog
already exists. It is `/library`
+ `/builder`. Super Bundle
deepens pro templates and never
gates `logSet`. `/explore` is
the places pin-board (Decision
009). `/programs` is education
outlines, not nSuns.

**Ship:** labeling only. One
tight v0-catalog paragraph on
`docs/IA_SKELETON.md`. INDEX /
FLOW already pointed at rooms —
they now name Library + Builder
as the catalog and Explore as
places. More / Search / Library
/ Builder labels already said
Library + Builder; registry
descriptions now read official
catalog / official templates.
Tests: `/explore` stays
places-only (Today ban kept);
no primary-nav shop or
`/coaches`; isolation from
`.1053` still passes. No new
room. No new tab. No shop. Zero
visual chrome. `/private` / www
/ signed-in chrome untouched.
Guest. First set ungated. Today
still one Start. Resume `.963`
kept. `[skip vercel]`. No
`PRIVATE_MODE` flip. No
production promote. Live www
stays `.696`.

Label `2026.07-unified.1054` (from
master `.1053` / `84acabfe`). Stamp
stays `.1054`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1037-for-1054.md](docs/archive/log/LOG-rotate-1037-for-1054.md).

## 2026-08-27 — Product IA skeleton (`.1053`)

`.1051` painted Patreon chrome
onto the existing IA. Founder
reverted it (`.1052`). The missing
piece was not another costume —
it was one locked product map
plus the isolation holes that
still let social ride Today /
Train / Coach.

**Ship:** skeleton only. CoS
freeze. `docs/IA_SKELETON.md`
locks LOG · WEEK · GARAGE and
named rooms Today · Train ·
Coach (AI) · History · Library.
Isolation: Today/Train do not
import social; tabs = `/log` +
`/active`; Coach never reads
Garage; chat never withholds a
set. Dual-writer is a comment,
not a Start-order change. Stop
after isolation. v0 catalog
labeling is later. `/private` /
www / signed-in chrome
untouched.
Guest. First set ungated. Today
still one Start. Resume `.963`
kept. `[skip vercel]`. No
`PRIVATE_MODE` flip. No
production promote. Live www
stays `.696`.

Label `2026.07-unified.1053` (from
master `.1052` / `895d940d`). Stamp
stays `.1053`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1036-for-1053.md](docs/archive/log/LOG-rotate-1036-for-1053.md).

## 2026-08-27 — Revert Patreon costume, restore wireframe (`.1052`)

Founder rejected `.1051` in
person. The costume is not
good. Go back to the original
wireframe — that alone is
better. The sidebar makes no
sense. The design makes no
sense. Do not apply these
changes.

**Ship:** revert only.
`git revert` of squash
`49dfe6de` (PR #878, `.1051`)
restores public www
(`sites/www`) and signed-in
chrome (Today / AppLayout /
account / Sidebar) to the
`.1050` modernist wireframe.
Paper / ink / Archivo /
radius 0. No Patreon sidebar.
No `.ptn` costume tokens on
www or the signed-in app.
`/private` unchanged vs
`.1050`. Leftover PR #876
stays open on
`cursor/modernist-patreon-layout-ef8c`.
Do not re-squash #878. Guest.
First set ungated. Today still
one Start. `/private` stays
the tight lock. No
`PRIVATE_MODE` flip. No
production promote. Live www
stays `.696`. `[skip vercel]`.

Label `2026.07-unified.1052` (from
master `.1051` / `49dfe6de`). Stamp
stays `.1052`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1035-for-1052.md](docs/archive/log/LOG-rotate-1035-for-1052.md).
`.1051` heading archived → [docs/archive/log/LOG-rotate-1051-for-1052.md](docs/archive/log/LOG-rotate-1051-for-1052.md).


## 2026-08-27 — Revert modernist Patreon door (`.1050`)

Founder chose revert. Squash
`dbf3bd340` (PR #875, `.1049`)
put unsigned Patreon structure
on the live door and www. That
is not the tight lock.

**Ship:** revert only. Restore
`/private`, `sites/www`,
marketing chrome
(`MarketingNav`,
`PublicPageShell`,
`MarketingFooter`, `gate.css`,
`GatePendingChrome`,
`AppHeader`) and docs
(`DESIGN.md` layout freeze,
CONTEXT / LOG / INDEX) to the
`.1048` tight lock.
`docs/DESIGN.md` did not exist
on `.1048` — it is gone. No
new door/www design remains.
Does not redesign Today,
AppLayout, Sidebar, or
signed-in home. Leftover PR
#876 stays open on
`cursor/modernist-patreon-layout-ef8c`.
Do not re-squash #875. Guest.
First set ungated. Today still
one Start. `/private` stays
the tight lock. No
`PRIVATE_MODE` flip. No
production promote. Live www
stays `.696`. `[skip vercel]`.

Label `2026.07-unified.1050` (from
master `.1049` / `dbf3bd340`). Stamp
stays `.1050`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1034-for-1050.md](docs/archive/log/LOG-rotate-1034-for-1050.md).
`.1049` heading archived → [docs/archive/log/LOG-rotate-1049-for-1050.md](docs/archive/log/LOG-rotate-1049-for-1050.md).


## 2026-08-26 — Open empty load is blank, not 0 (`.1048`)

Live `SetLogTable` bound
`value={input.weight}` so a
reps-only / empty-load cell painted
**0**. History edit already uses
empty string when weight is 0
(`.997`). Completed kg cell already
BW for weight/vest (`.1025`). Store
stays `0`. Display only.

**Ship:** Open empty load is blank,
not 0. `formatOpenLoadInput(weight)`
→ `''` when weight is 0 / missing /
non-finite; otherwise the typed
number string.
`parseOpenLoadInput(raw)` blank /
junk → `0` (store stays 0). Never
clamp into a load they did not type
beyond existing min/max if already
in the table. `SetLogTable` open
weight/assist cell is
`SetRowLoadField`: local draft like
the time cell so `0.` / `2.5` stay
typeable; unfocused empty is still
blank. Binding format to `value`
round-trips `0.` to blank. Plus-load
`BW+` prefix stays; the number
beside it is blank when added-load
is 0. LogConsole
leftover plus-load uses the same
helper. Do not remount dead
LogConsole. Never write BW / a
bodyweight kilogram into the store.
Do not rewrite History
`calculateVolume`. Assisted-0
**completed** mute stays later.
History edit empty string stays.
Completed `.1025` BW stays. Guest.
First set ungated. Today still one
Start. Resume `.963` kept. `/private`
stays the tight lock. No
`PRIVATE_MODE` flip.

Label `2026.07-unified.1048` (from
master `.1047` / `48958422c`). Stamp
stays `.1048`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1033-for-1048.md](docs/archive/log/LOG-rotate-1033-for-1048.md).


## 2026-08-26 — Superset on a finished session (`.1047`)

Live already has optional
exercise groups (`superset.ts` /
`supersetGroup` /
`stripOrphanGroups` / "Superset
w/ next", `.980`). History edit
cannot pair or unpair lifts on a
finished log. Same finished log.
Same id.

**Ship:** Optional exercise group
on a finished History session.
`decidePatchFinishedSuperset`
empty on missing draft / junk
indexes / one-lift session. Last
lift + pair-with-next is empty.
`pair` true / `'next'` shares a
group id with the next (reuse
existing group on either side;
else mint a short id). Same group
already is noop. `pair` false /
`''` / blank clears this lift
then `stripOrphanGroups` — an
orphan is not a group. Already
unpaired is noop. Apply clones
exercises. Does not rewrite sets
/ notes / duration / name.
`draftsEqual` includes
`supersetGroup` (trimmed /
omitted equal). `stripDraft`
omits an undefined group and
runs `stripOrphanGroups`. History
edit: outline 44px control per
lift when 2+. testid
`session-history-superset-{exIdx}`.
Pair with next when a next lift
exists; unpair when grouped.
Draft only. Save still
confirm-gated `decideEditSave`.
Not a new SetKind. Not
marketplace circuits. Does not
smash live `.980`. Guest. First
set ungated. Today still one
Start. Resume `.963` kept.
Session note `.1046` / lift note
`.1045` stay. `/private` stays
the tight lock. No `PRIVATE_MODE`
flip.

Label `2026.07-unified.1047` (from
master `.1046` / `89437956d`). Stamp
stays `.1047`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1032-for-1047.md](docs/archive/log/LOG-rotate-1032-for-1047.md).


## 2026-08-26 — Session note on a finished session (`.1046`)

Live already has optional private
session notes (`normalizeSessionNote`
/ `attachSessionNote` /
`SESSION_NOTE_MAX` 500, `.983`).
History detail has Name `.1007` and
Duration `.1035` and does not show
or edit `sessionNote`. Same finished
log. Same id.

**Ship:** Optional private session
note on a finished History session.
`decidePatchFinishedSessionNote`
empty on empty id / non-string junk.
Blank / null / undefined clears
(field omitted) unless already
omitted (noop). Live-open / missing
/ tomb is noop. Same normalized text
is noop. Over-cap truncates at 500
(never emptied). Apply maps history
via `attachSessionNote` and bumps
`revision` / `updatedAt`. Does not
rewrite sets / duration / name /
lift notes. Does not smash
`decideEditSave` or the live jot.
History detail: 44px textarea next
to Duration. testid
`session-history-session-note`. Own
outline Save
`session-history-session-note-save`.
Hide on tomb. Guest. First set
ungated. Today still one Start.
Resume `.963` kept. Lift note `.1045`
/ Duration `.1035` / Name `.1007`
stay. `/private` stays the tight
lock. No `PRIVATE_MODE` flip.

Label `2026.07-unified.1046` (from
master `.1045` / `a67650a61`). Stamp
stays `.1046`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1031-for-1046.md](docs/archive/log/LOG-rotate-1031-for-1046.md).


## 2026-08-26 — Lift note on a finished exercise (`.1045`)

Live already has optional per-lift
diary (`exerciseNote.ts` /
`EXERCISE_NOTE_MAX` 200, `.996`).
History edit `.997` displayed
`ex.note` as italic and could not
correct it. `draftsEqual` ignored
notes, so a typed note would Save
as noop.

**Ship:** Lift note on a finished
exercise. `normalizeExerciseNote`
trims; empty / non-string →
`undefined`; over-cap truncates at
200 (same as `normalizeSessionNote`
— never emptied).
`decidePatchFinishedExerciseNote`
empty on missing draft / not an
array / junk indexes. Non-string
junk invents nothing. Noop on out
of range exercise index / same
normalized text. Blank / null /
undefined clears (field omitted)
unless already omitted (noop).
Apply via clone of the exercise
(`{ ...ex, note }`). Clone so the
source is not mutated. Does not
rewrite sets / `sessionNote` / pin.
Does not call `lastNotesFor` /
cueMemory / LLM. Does not write
Wednesday / saved / live Start.
`draftsEqual` includes the lift
note so Save confirms when only
the note changes. `stripDraft`
omits an undefined `note`. History
edit: outline 44px textarea when
editing. testid
`session-history-lift-note-{exIdx}`.
min-h 44px. Draft only. Read-only
italic stays when not editing.
Save still confirm-gated
`decideEditSave`. Same finished
log. Same id. Guest. First set
ungated. Today still one Start.
Resume `.963` kept. Load % `.1044`
/ Tempo `.1043` / L/R `.1042` /
RIR `.1041` / RPE `.1040` stay.
`/private` stays the tight lock.
No `PRIVATE_MODE` flip.

Label `2026.07-unified.1045` (from
master `.1044` / `64277eb80`). Stamp
stays `.1045`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1030-for-1045.md](docs/archive/log/LOG-rotate-1030-for-1045.md).


## 2026-08-26 — Load % on a finished set (`.1044`)

Live already has optional % of a
known 1-rep max on a logged set
(`parseOptionalLoadPct` / live
`SetRowPercentField`, `.981`).
History edit `.997` could not
correct a logged `loadPct`. Empty
is valid. Never required. Range
1–100, one decimal (`76.5`).
Trailing `%` allowed (`80%`). Out
of range, extra decimals, and junk
invent nothing — never clamped.
Does not invent a percent from kg.
Does not rewrite kg from %.

**Ship:** Load % on a finished set.
`decidePatchFinishedSetLoadPct`
empty on missing draft / not an
array / junk indexes. `0` / `101`
/ `80.12` / `nope` / boolean invent
nothing. Noop on out of range set
index / same value as current.
Blank / null / undefined clears
(field omitted) unless already
omitted (noop). Apply patches
`loadPct` via `patchDraftSet`.
Clone so the source is not mutated.
Does not write `weight` / `rpe` /
`rpe10` / `rir` / `kind` / `side`
/ `tempo`. Does not call
`knownMaxFromHistory` /
`weightFromKnownMaxPct` /
`loadPctOfKnownMax`. Does not write
Wednesday / saved / live Start.
History edit: outline 44px
`SetLoadPctField` on weight rows
when editing. Apply to local draft
only. Save still confirm-gated
`decideEditSave`. Same finished
log. Same id. Guest. First set
ungated. Today still one Start.
Resume `.963` kept. Tempo `.1043` /
L/R `.1042` / RIR `.1041` / RPE
`.1040` / Set kind `.1039` stay.
`/private` stays the tight lock.
No `PRIVATE_MODE` flip.

Label `2026.07-unified.1044` (from
master `.1043` / `4dfc2d287`). Stamp
stays `.1044`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1029-for-1044.md](docs/archive/log/LOG-rotate-1029-for-1044.md).


## 2026-08-26 — Tempo on a finished set (`.1043`)

Live already has optional e-p-c
tempo on a logged set
(`parseOptionalTempo` /
`SetTempoField`, `.734`). History
edit `.997` could not correct a
logged tempo. Empty is valid.
Never required. Display is
`e-p-c` (e.g. `3-1-1`). Each
phase is an integer 0–9. Out of
range, 4-count, bare `311`, and
NaN invent nothing — never
clamped.

**Ship:** Tempo on a finished set.
`decidePatchFinishedSetTempo` empty
on missing draft / not an array /
junk indexes. `311` / `3-1-1-1` /
`10-0-0` / `nope` / number /
boolean invent nothing. Noop on
out of range set index / same
value as current (`temposEqual`).
Blank / null / undefined clears
(field omitted) unless already
omitted (noop). Apply patches
`tempo` via `patchDraftSet`. Clone
so the source is not mutated. Does
not write `rpe` / `rpe10` / `rir` /
`kind` / `side`. Does not call
`rememberLastTempo`. Does not write
Wednesday / saved / live Start.
History edit: outline 44px
`SetTempoField` per set when
editing. Apply to local draft
only. Save still confirm-gated
`decideEditSave`. Same finished
log. Same id. Guest. First set
ungated. Today still one Start.
Resume `.963` kept. L/R `.1042` /
RIR `.1041` / RPE `.1040` / Set
kind `.1039` / Remove lift `.1038`
/ Add `.1037` / Replace `.1036` /
Reorder `.1034` / remove-set stay.
`/private` stays the tight lock.
No `PRIVATE_MODE` flip.

Label `2026.07-unified.1043` (from
master `.1042` / `c1dd3facf`). Stamp
stays `.1043`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1028-for-1043.md](docs/archive/log/LOG-rotate-1028-for-1043.md).


## 2026-08-26 — L/R on a finished set (`.1042`)

Live already has optional L / R / Alt
on a logged set (`parseSetSide` /
`SET_SIDES` / `shouldOfferSetSide` /
LogConsole chips, `.724`). History
edit `.997` could not correct a
logged side. Empty is valid. Never
required. Values are `L` | `R` |
`alt` (do not invent `left` /
`Left` / 0–1). Never a SetKind.

**Ship:** L/R on a finished set.
`decidePatchFinishedSetSide` empty
on missing draft / not an array /
junk indexes. `left` / `Left` /
`normal` / `1` invent nothing.
Squat / bench + L/R/alt invents
nothing — never persist a side on
bilateral. Noop on out of range
set index / same value as current.
Blank / null / undefined clears
(field omitted) unless already
omitted (noop). Apply patches
`side` via `patchDraftSet`. Clone
so the source is not mutated. Does
not write `rpe` / `rpe10` / `rir` /
`kind`. Does not write Wednesday /
saved / live Start. History edit:
outline 44px `SetSideSelect` only
when `shouldOfferSetSide` on the
resolved exercise. Apply to local
draft only. Save still
confirm-gated `decideEditSave`.
Same finished log. Same id. Guest.
First set ungated. Today still one
Start. Resume `.963` kept. RIR
`.1041` / RPE `.1040` / Set kind
`.1039` / Remove lift `.1038` /
Add `.1037` / Replace `.1036` /
Reorder `.1034` / remove-set stay.
`/private` stays the tight lock.
No `PRIVATE_MODE` flip.

Label `2026.07-unified.1042` (from
master `.1041` / `e0072ec12`). Stamp
stays `.1042`. Live www stays `.696`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1027-for-1042.md](docs/archive/log/LOG-rotate-1027-for-1042.md).
