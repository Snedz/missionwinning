package com.missionwinning.core.data

import com.missionwinning.core.model.OfflineCoachCatalog
import com.missionwinning.core.model.OfflineCoachMove

internal class OfflineCoachSelection(
    weekStart: String,
    equipment: String,
    private val familiar: Set<String>,
) {
    private val pool = OfflineCoachCatalog.moves.filter { it.supports(equipment) }

    private var seed = "$weekStart:local".let { key ->
        key.fold(1779033703 xor key.length) { hash, char ->
            Integer.rotateLeft((hash xor char.code) * 3432918353u.toInt(), 13)
        }.takeUnless { it == 0 } ?: 1
    }

    private fun nextRandom(): Int {
        seed += 0x6d2b79f5
        var r = (seed xor (seed ushr 15)) * (1 or seed)
        r = r xor (r + (r xor (r ushr 7)) * (61 or r))
        return r xor (r ushr 14)
    }

    private fun priority(move: OfflineCoachMove): Int =
        (if (move.id in familiar) 4 else 0) + (if (move.compound) 2 else 0) + (if (move.strength) 1 else 0)

    fun pick(legacy: List<OfflineCoachMove>): List<OfflineCoachMove> {
        val ranked = if (pool.size < 128) {
            rankShortWebPool(pool) { first, second ->
                val a = priority(first)
                val b = priority(second)
                if (a == b) nextRandom() >= 0 else a > b
            }
        } else {
            pool.map { it to nextRandom() }
                .sortedWith(compareByDescending<Pair<OfflineCoachMove, Int>> { priority(it.first) }.thenBy { it.second })
                .map { it.first }
        }
        val candidates = legacy + ranked
        val picks = mutableListOf<OfflineCoachMove>()
        val groups = mutableSetOf<Int>()
        for (move in candidates) {
            if (picks.size == 3) break
            if (picks.size == 1 && move.primary in groups) continue
            picks += move
            groups += move.primary
        }
        return picks + candidates.filterNot { it in picks }.take(3 - picks.size)
    }
}

// The web selector draws randomness inside its sort comparator. On small pools Node/V8
// inserts at most two runs; matching their comparison order keeps the week seed meaningful.
private fun <T> rankShortWebPool(pool: List<T>, less: (T, T) -> Boolean): List<T> {
    if (pool.size < 2) return pool
    val ranking = pool.toMutableList()
    fun sortRun(start: Int, minLength: Int): Int {
        if (start == ranking.lastIndex) return 1
        val descending = less(ranking[start + 1], ranking[start])
        var end = start + 2
        while (end < ranking.size && less(ranking[end], ranking[end - 1]) == descending) end++
        if (descending) ranking.subList(start, end).reverse()
        val limit = maxOf(end, minOf(start + minLength, ranking.size))
        while (end < limit) {
            val pivot = ranking[end]
            var left = start
            var right = end
            while (left < right) {
                val mid = (left + right) / 2
                if (less(pivot, ranking[mid])) right = mid else left = mid + 1
            }
            for (i in end downTo left + 1) ranking[i] = ranking[i - 1]
            ranking[left] = pivot
            end++
        }
        return end - start
    }
    val minRun = if (pool.size < 64) pool.size else (pool.size + 1) / 2
    val split = sortRun(0, minRun)
    if (split == pool.size) return ranking
    sortRun(split, minRun)

    val from = gallop(split) { !less(ranking[split], ranking[it]) }
    if (from == split) return ranking
    val trailing = gallop(pool.size - split, reversed = true) {
        !less(ranking[ranking.lastIndex - it], ranking[split - 1])
    }
    val until = pool.size - trailing
    if (until == split) return ranking

    val forward = split - from <= until - split
    val left = ranking.subList(from, split)
    val right = ranking.subList(split, until)
    val a = if (forward) left else right.asReversed()
    val b = if (forward) right else left.asReversed()
    fun bWins(candidate: T, incumbent: T) =
        if (forward) less(candidate, incumbent) else less(incumbent, candidate)

    var ai = 0
    var bi = 1
    var threshold = 7
    val merged = mutableListOf(b.first())
    fun active() = ai < a.lastIndex && bi < b.size
    while (active()) {
        var winsA = 0
        var winsB = 0
        while (active() && winsA < threshold && winsB < threshold) {
            if (bWins(b[bi], a[ai])) {
                merged += b[bi++]
                winsB++
                winsA = 0
            } else {
                merged += a[ai++]
                winsA++
                winsB = 0
            }
        }
        if (!active()) break
        threshold++
        do {
            threshold = maxOf(1, threshold - 1)
            fun takeA(): Int = gallop(a.size - ai, reversed = !forward) { !bWins(b[bi], a[ai + it]) }
                .also { count -> repeat(count) { merged += a[ai++] } }
            fun takeB(): Int = gallop(b.size - bi, reversed = !forward) { bWins(b[bi + it], a[ai]) }
                .also { count -> repeat(count) { merged += b[bi++] } }
            // V8 probes the original left run first in both merge directions.
            if (forward) {
                winsA = takeA()
                if (!active()) break
                merged += b[bi++]
                if (!active()) break
                winsB = takeB()
                if (!active()) break
                merged += a[ai++]
            } else {
                winsB = takeB()
                if (!active()) break
                merged += a[ai++]
                if (!active()) break
                winsA = takeA()
                if (!active()) break
                merged += b[bi++]
            }
        } while (active() && (winsA >= 7 || winsB >= 7))
        threshold++
    }
    for (i in bi until b.size) merged += b[i]
    for (i in ai until a.size) merged += a[i]
    (if (forward) merged else merged.asReversed()).forEachIndexed { i, value -> ranking[from + i] = value }
    return ranking
}

private fun gallop(length: Int, reversed: Boolean = false, precedes: (Int) -> Boolean): Int {
    if (!precedes(0)) return 0
    var last = 0
    var next = 1
    while (next < length && precedes(next)) {
        last = next
        next = next * 2 + 1
    }
    var low = last + 1
    var high = minOf(length, next)
    while (low < high) {
        val mid = (low + high - if (reversed) 1 else 0) / 2
        if (precedes(mid)) low = mid + 1 else high = mid
    }
    return low
}
