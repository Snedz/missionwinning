package com.missionwinning.core.model

/**
 * Pure plate math for barbell loading (free forever).
 * Returns plates **per side** (not including the bar).
 */
object PlateCalculator {
    /** Common competition / commercial gym plates (kg), heaviest first. */
    val PLATES_KG: List<Double> = listOf(25.0, 20.0, 15.0, 10.0, 5.0, 2.5, 1.25)

    /** Common US plates (lb), heaviest first. */
    val PLATES_LB: List<Double> = listOf(45.0, 35.0, 25.0, 10.0, 5.0, 2.5)

    fun defaultBar(unit: String): Double =
        if (WeightUnits.normalize(unit) == "lb") 45.0 else 20.0

    fun platesForUnit(unit: String): List<Double> =
        if (WeightUnits.normalize(unit) == "lb") PLATES_LB else PLATES_KG

    /**
     * @param target total bar + plates weight
     * @param barWeight empty bar (typically 20 kg / 45 lb)
     * @return plates per side, heaviest first; empty if target ≤ bar
     */
    fun platesPerSide(
        target: Double,
        unit: String,
        barWeight: Double = defaultBar(unit),
    ): PlateResult {
        val u = WeightUnits.normalize(unit)
        val bar = barWeight.coerceAtLeast(0.0)
        val total = target.coerceAtLeast(0.0)
        if (total <= bar + 1e-9) {
            return PlateResult(
                unit = u,
                barWeight = bar,
                targetWeight = total,
                platesPerSide = emptyList(),
                remainder = (total - bar).coerceAtLeast(0.0),
                achievable = total <= bar + 1e-9 || total >= bar,
            )
        }
        var sideLoad = (total - bar) / 2.0
        if (sideLoad < 0) sideLoad = 0.0
        val available = platesForUnit(u)
        val used = mutableListOf<Double>()
        var remaining = sideLoad
        for (p in available) {
            while (remaining + 1e-9 >= p) {
                used.add(p)
                remaining -= p
            }
        }
        // Snap remainder noise
        if (remaining < 0.05) remaining = 0.0
        val loaded = bar + used.sum() * 2.0
        return PlateResult(
            unit = u,
            barWeight = bar,
            targetWeight = total,
            platesPerSide = used,
            remainder = remaining,
            achievable = remaining < 0.05,
            actualTotal = WeightUnits.roundToStep(loaded, u),
        )
    }

    /** Compact "2×25 + 1×10" style (per side counts). */
    fun formatPerSide(plates: List<Double>, unit: String): String {
        if (plates.isEmpty()) return "bar only"
        val counts = linkedMapOf<Double, Int>()
        for (p in plates) {
            counts[p] = (counts[p] ?: 0) + 1
        }
        val u = WeightUnits.normalize(unit)
        return counts.entries.joinToString(" + ") { (p, n) ->
            val label = WeightUnits.format(p)
            if (n == 1) "${label}$u" else "${n}×${label}$u"
        }
    }
}

data class PlateResult(
    val unit: String,
    val barWeight: Double,
    val targetWeight: Double,
    /** Heaviest-first plates on **one** side. */
    val platesPerSide: List<Double>,
    val remainder: Double,
    val achievable: Boolean,
    val actualTotal: Double = targetWeight,
) {
    val summary: String
        get() {
            val plates = PlateCalculator.formatPerSide(platesPerSide, unit)
            return if (achievable) {
                "Bar ${WeightUnits.format(barWeight)} + $plates / side"
            } else {
                "Bar ${WeightUnits.format(barWeight)} + $plates / side · ~${WeightUnits.format(remainder)} short"
            }
        }
}
