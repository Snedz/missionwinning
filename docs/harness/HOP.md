# Live hop

ticket: residual-heatmap-empty-load-volume
done_means: Anatomy heatmap counts bodyweight work as reps, not a 0 kg floor
accept: npx tsx --test src/lib/heatmapEmptyLoadVolume.test.ts
test_written: yes

## progress

Master is .1021. This hop is .1022.

## decisions

One helper: workingSetVolume. Spark already shipped the formula; heatmap still does reps * weight.
