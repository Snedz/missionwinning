# Live hop

ticket: residual-library-spark-bw
done_means: Library spark plots bodyweight work as reps, not a flat zero
accept: npx tsx --test src/lib/librarySparkBw.test.ts
test_written: yes

## progress

#843 owns .1018. #845 owns .1019. This hop is .1020.

## decisions

Spark point = weight > 0 ? reps * weight : reps. Warmups still out. Tombs still out. Store still weight: 0.
