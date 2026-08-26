# Live hop

ticket: residual-coach-citation-empty-load
done_means: Coach citation fact prints 8 × BW, not 0kg × 8
accept: npx tsx --test src/lib/coachCitationEmptyLoad.test.ts
test_written: yes

## progress

Master landed #848 as .1022 (934524eca). This hop is .1023.

## decisions

Reuse formatSetLoadLine for empty load only. Loaded cite order stays 60kg × 5.
