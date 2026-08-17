package com.missionwinning.core.data

import com.missionwinning.core.model.SetKind
import com.missionwinning.core.model.WeightUnits
import java.time.Duration
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
import java.util.UUID

/**
 * Import / export workouts as CSV or JSON (Phase 12).
 * Supports the set-table logger workout export schema and Mission Winning native CSV.
 * Pure parsing — no Android deps beyond domain.
 */
object WorkoutTransfer {

    data class ImportedSet(
        val exerciseId: String,
        val exerciseName: String,
        val setIndex: Int,
        val reps: Int,
        val weight: Double,
        val weightUnit: String,
        val rpe: Int?,
        val setKind: String,
        val note: String,
        val supersetGroup: String,
    )

    data class ImportedWorkout(
        val workoutName: String,
        val completedAtIso: String,
        val durationSeconds: Int,
        val sets: List<ImportedSet>,
        val weightUnit: String,
    ) {
        val setCount: Int get() = sets.size
        val totalVolume: Double
            get() = sets.sumOf { s ->
                if (SetKind.countsTowardVolume(SetKind.fromCode(s.setKind))) {
                    s.weight * s.reps
                } else {
                    0.0
                }
            }
    }

    data class ImportResult(
        val workouts: List<ImportedWorkout>,
        val skippedRows: Int = 0,
        val format: String = "unknown",
        val error: String? = null,
    )

    private val HEVY_START: DateTimeFormatter =
        DateTimeFormatter.ofPattern("d MMM yyyy, HH:mm", Locale.ENGLISH)
    private val HEVY_START_ALT: DateTimeFormatter =
        DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm", Locale.ENGLISH)

    /**
     * Detect and parse the set-table logger or MW native CSV.
     */
    fun parseCsv(csvText: String, preferUnit: String = "kg"): ImportResult {
        val text = csvText.trim().removePrefix("\uFEFF")
        if (text.isBlank()) {
            return ImportResult(emptyList(), error = "Empty file")
        }
        val lines = splitCsvLines(text)
        if (lines.isEmpty()) return ImportResult(emptyList(), error = "No rows")
        val header = parseCsvRow(lines.first()).map { it.trim().lowercase(Locale.US) }
        return when {
            header.contains("exercise_title") && header.contains("start_time") ->
                parseSetTableA(lines, preferUnit)
            header.contains("workout_name") && header.contains("exercise_name") ->
                parseMwNative(lines, preferUnit)
            header.contains("title") && header.contains("exercise_title") ->
                parseSetTableA(lines, preferUnit)
            else -> ImportResult(
                emptyList(),
                error = "Unrecognized CSV. Export from the set-table logger (workouts) or Mission Winning.",
            )
        }
    }

    /** Mission Winning portable CSV (export). */
    fun toMwCsv(
        workouts: List<Pair<WorkoutLogEntity, List<SetLogEntity>>>,
    ): String {
        val sb = StringBuilder()
        sb.appendLine(
            "workout_id,workout_name,completed_at,duration_seconds,weight_unit," +
                "exercise_id,exercise_name,set_index,reps,weight,rpe,set_kind,note,superset_group",
        )
        for ((w, sets) in workouts) {
            val unit = w.weightUnit.ifBlank { "kg" }
            if (sets.isEmpty()) {
                sb.appendLine(
                    listOf(
                        w.id, w.workoutName, w.completedAt, w.durationSeconds, unit,
                        "", "", "0", "0", "0", "", "normal", "", "",
                    ).joinToString(",") { csvEscape(it.toString()) },
                )
            } else {
                for (s in sets) {
                    sb.appendLine(
                        listOf(
                            w.id,
                            w.workoutName,
                            w.completedAt,
                            w.durationSeconds,
                            unit,
                            s.exerciseId,
                            s.exerciseName,
                            s.setIndex,
                            s.reps,
                            s.weight,
                            s.rpe?.toString().orEmpty(),
                            s.setKind,
                            s.note,
                            s.supersetGroup,
                        ).joinToString(",") { csvEscape(it.toString()) },
                    )
                }
            }
        }
        return sb.toString()
    }

    /** the set-table logger-compatible export (weight always in lbs column as stored unit-aware). */
    fun toSetTableACsv(
        workouts: List<Pair<WorkoutLogEntity, List<SetLogEntity>>>,
    ): String {
        val sb = StringBuilder()
        sb.appendLine(
            "title,start_time,end_time,description,exercise_title,superset_id," +
                "exercise_notes,set_index,set_type,weight_lbs,reps,distance_miles,duration_seconds,rpe",
        )
        val zone = ZoneId.systemDefault()
        val fmt = DateTimeFormatter.ofPattern("d MMM yyyy, HH:mm", Locale.ENGLISH)
        for ((w, sets) in workouts) {
            val end = runCatching { java.time.Instant.parse(w.completedAt) }.getOrNull()
            val start = end?.minusSeconds(w.durationSeconds.toLong().coerceAtLeast(0))
            val startStr = start?.atZone(zone)?.format(fmt).orEmpty()
            val endStr = end?.atZone(zone)?.format(fmt).orEmpty()
            if (sets.isEmpty()) {
                sb.appendLine(
                    listOf(
                        w.workoutName, startStr, endStr, "", "", "", "",
                        "0", "normal", "", "0", "", w.durationSeconds.toString(), "",
                    ).joinToString(",") { csvEscape(it) },
                )
            } else {
                for (s in sets) {
                    val from = WeightUnits.normalize(s.weightUnit.ifBlank { w.weightUnit })
                    val lbs = WeightUnits.convert(s.weight, from, "lb")
                    val type = when (SetKind.fromCode(s.setKind)) {
                        SetKind.Warmup -> "warmup"
                        SetKind.Drop -> "dropset"
                        SetKind.Failure -> "failure"
                        SetKind.Normal -> "normal"
                    }
                    sb.appendLine(
                        listOf(
                            w.workoutName,
                            startStr,
                            endStr,
                            "",
                            s.exerciseName.ifBlank { s.exerciseId },
                            s.supersetGroup,
                            s.note,
                            s.setIndex.toString(),
                            type,
                            if (s.weight > 0) WeightUnits.format(lbs) else "",
                            s.reps.toString(),
                            "",
                            "0",
                            s.rpe?.toString().orEmpty(),
                        ).joinToString(",") { csvEscape(it) },
                    )
                }
            }
        }
        return sb.toString()
    }

    fun toJsonSummary(
        workouts: List<Pair<WorkoutLogEntity, List<SetLogEntity>>>,
    ): String {
        // Lightweight JSON without full kotlinx encoding dependency on entities
        val parts = workouts.map { (w, sets) ->
            val setJson = sets.joinToString(",") { s ->
                """{"exerciseId":${jsonStr(s.exerciseId)},"exerciseName":${jsonStr(s.exerciseName)},"setIndex":${s.setIndex},"reps":${s.reps},"weight":${s.weight},"weightUnit":${jsonStr(s.weightUnit)},"rpe":${s.rpe ?: "null"},"setKind":${jsonStr(s.setKind)},"note":${jsonStr(s.note)}}"""
            }
            """{"id":${jsonStr(w.id)},"workoutName":${jsonStr(w.workoutName)},"completedAt":${jsonStr(w.completedAt)},"durationSeconds":${w.durationSeconds},"weightUnit":${jsonStr(w.weightUnit)},"sets":[$setJson]}"""
        }
        return """{"format":"missionwinning-workouts-v1","count":${workouts.size},"workouts":[${parts.joinToString(",")}]}"""
    }

    private fun parseSetTableA(lines: List<String>, preferUnit: String): ImportResult {
        if (lines.size < 2) return ImportResult(emptyList(), format = "set-table-a", error = "No data rows")
        val header = parseCsvRow(lines.first()).map { it.trim().lowercase(Locale.US) }
        fun idx(vararg names: String): Int {
            for (n in names) {
                val i = header.indexOf(n)
                if (i >= 0) return i
            }
            return -1
        }
        val iTitle = idx("title")
        val iStart = idx("start_time")
        val iEnd = idx("end_time")
        val iEx = idx("exercise_title")
        val iSuper = idx("superset_id")
        val iNotes = idx("exercise_notes")
        val iSet = idx("set_index")
        val iType = idx("set_type")
        val iWeightLbs = idx("weight_lbs")
        val iWeightKg = idx("weight_kg")
        val iReps = idx("reps")
        val iRpe = idx("rpe")
        val iDur = idx("duration_seconds")
        if (iTitle < 0 || iEx < 0) {
            return ImportResult(emptyList(), format = "set-table-a", error = "Missing title/exercise_title")
        }

        data class Row(
            val title: String,
            val start: String,
            val end: String,
            val set: ImportedSet,
            val durationHint: Int,
        )

        var skipped = 0
        val rows = mutableListOf<Row>()
        for (line in lines.drop(1)) {
            if (line.isBlank()) continue
            val cols = parseCsvRow(line)
            fun col(i: Int): String = cols.getOrNull(i)?.trim().orEmpty()
            val title = col(iTitle).ifBlank { "Imported workout" }
            val start = if (iStart >= 0) col(iStart) else ""
            val end = if (iEnd >= 0) col(iEnd) else ""
            val exName = col(iEx)
            if (exName.isBlank()) {
                skipped++
                continue
            }
            val setIndex = col(iSet).toIntOrNull() ?: 0
            val reps = col(iReps).toIntOrNull()?.coerceIn(0, 999) ?: 0
            val kind = mapSetType(col(iType))
            val rpe = col(iRpe).toDoubleOrNull()?.toInt()?.coerceIn(6, 10)
            val note = if (iNotes >= 0) col(iNotes) else ""
            val superG = if (iSuper >= 0) col(iSuper).take(1).uppercase(Locale.US) else ""
            val weightLbs = if (iWeightLbs >= 0) col(iWeightLbs).toDoubleOrNull() else null
            val weightKg = if (iWeightKg >= 0) col(iWeightKg).toDoubleOrNull() else null
            val unit = WeightUnits.normalize(preferUnit)
            val weight = when {
                weightKg != null && weightKg > 0 ->
                    WeightUnits.convert(weightKg, "kg", unit)
                weightLbs != null && weightLbs > 0 ->
                    WeightUnits.convert(weightLbs, "lb", unit)
                else -> 0.0
            }
            val dur = if (iDur >= 0) col(iDur).toIntOrNull() ?: 0 else 0
            rows.add(
                Row(
                    title = title,
                    start = start,
                    end = end,
                    durationHint = dur,
                    set = ImportedSet(
                        exerciseId = slugId(exName),
                        exerciseName = exName,
                        setIndex = setIndex,
                        reps = reps.coerceAtLeast(0),
                        weight = weight,
                        weightUnit = unit,
                        rpe = rpe,
                        setKind = kind,
                        note = note.take(200),
                        supersetGroup = if (superG in listOf("A", "B", "C", "D")) superG else "",
                    ),
                ),
            )
        }

        val grouped = rows.groupBy { it.title to it.start }
        val workouts = grouped.map { (key, group) ->
            val (title, start) = key
            val end = group.first().end
            val completed = parseSetTableATime(end).ifBlank { parseSetTableATime(start) }
                .ifBlank { java.time.Instant.now().toString() }
            val duration = durationBetween(start, end).coerceAtLeast(
                group.maxOfOrNull { it.durationHint } ?: 0,
            ).coerceAtLeast(30)
            val unit = group.first().set.weightUnit
            ImportedWorkout(
                workoutName = title,
                completedAtIso = completed,
                durationSeconds = duration,
                sets = group.map { it.set }
                    .sortedWith(compareBy({ it.exerciseName.lowercase(Locale.US) }, { it.setIndex })),
                weightUnit = unit,
            )
        }.sortedBy { it.completedAtIso }

        return ImportResult(workouts = workouts, skippedRows = skipped, format = "set-table-a")
    }

    private fun parseMwNative(lines: List<String>, preferUnit: String): ImportResult {
        if (lines.size < 2) return ImportResult(emptyList(), format = "mw", error = "No data rows")
        val header = parseCsvRow(lines.first()).map { it.trim().lowercase(Locale.US) }
        fun idx(name: String) = header.indexOf(name)
        val iId = idx("workout_id")
        val iName = idx("workout_name")
        val iAt = idx("completed_at")
        val iDur = idx("duration_seconds")
        val iUnit = idx("weight_unit")
        val iExId = idx("exercise_id")
        val iExName = idx("exercise_name")
        val iSet = idx("set_index")
        val iReps = idx("reps")
        val iWeight = idx("weight")
        val iRpe = idx("rpe")
        val iKind = idx("set_kind")
        val iNote = idx("note")
        val iSuper = idx("superset_group")

        data class Acc(
            val name: String,
            val at: String,
            val dur: Int,
            val unit: String,
            val sets: MutableList<ImportedSet>,
        )

        val byId = linkedMapOf<String, Acc>()
        var skipped = 0
        for (line in lines.drop(1)) {
            if (line.isBlank()) continue
            val cols = parseCsvRow(line)
            fun col(i: Int): String = if (i < 0) "" else cols.getOrNull(i)?.trim().orEmpty()
            val id = col(iId).ifBlank { "${col(iName)}|${col(iAt)}" }
            val name = col(iName).ifBlank { "Imported" }
            val at = col(iAt).ifBlank { java.time.Instant.now().toString() }
            val dur = col(iDur).toIntOrNull() ?: 30
            val unit = WeightUnits.normalize(col(iUnit).ifBlank { preferUnit })
            val exName = col(iExName)
            val exId = col(iExId).ifBlank { if (exName.isNotBlank()) slugId(exName) else "" }
            val acc = byId.getOrPut(id) {
                Acc(name, at, dur, unit, mutableListOf())
            }
            if (exName.isBlank() && exId.isBlank()) {
                skipped++
                continue
            }
            acc.sets.add(
                ImportedSet(
                    exerciseId = exId.ifBlank { slugId(exName) },
                    exerciseName = exName.ifBlank { exId },
                    setIndex = col(iSet).toIntOrNull() ?: acc.sets.size,
                    reps = col(iReps).toIntOrNull()?.coerceIn(0, 999) ?: 0,
                    weight = col(iWeight).toDoubleOrNull()?.coerceAtLeast(0.0) ?: 0.0,
                    weightUnit = unit,
                    rpe = col(iRpe).toIntOrNull()?.coerceIn(6, 10),
                    setKind = mapSetType(col(iKind)),
                    note = col(iNote).take(200),
                    supersetGroup = col(iSuper).take(1).uppercase(Locale.US).let {
                        if (it in listOf("A", "B", "C", "D")) it else ""
                    },
                ),
            )
        }
        val workouts = byId.values.map {
            ImportedWorkout(
                workoutName = it.name,
                completedAtIso = it.at,
                durationSeconds = it.dur.coerceAtLeast(30),
                sets = it.sets,
                weightUnit = it.unit,
            )
        }
        return ImportResult(workouts = workouts, skippedRows = skipped, format = "mw")
    }

    private fun mapSetType(raw: String): String {
        val t = raw.trim().lowercase(Locale.US)
        return when {
            t.contains("warm") -> SetKind.Warmup.code
            t.contains("drop") -> SetKind.Drop.code
            t.contains("fail") -> SetKind.Failure.code
            t == "normal" || t == "working" || t.isBlank() -> SetKind.Normal.code
            else -> SetKind.fromCode(t).code
        }
    }

    fun slugId(name: String): String {
        val base = name.trim().lowercase(Locale.US)
            .replace(Regex("[^a-z0-9]+"), "-")
            .trim('-')
            .take(48)
        return if (base.isBlank()) "ex-${UUID.randomUUID().toString().take(8)}" else base
    }

    private fun parseSetTableATime(raw: String): String {
        if (raw.isBlank()) return ""
        // Already ISO?
        runCatching { java.time.Instant.parse(raw); return raw }
        val zone = ZoneId.systemDefault()
        for (fmt in listOf(HEVY_START, HEVY_START_ALT)) {
            runCatching {
                val ldt = LocalDateTime.parse(raw.trim(), fmt)
                return ldt.atZone(zone).toInstant().toString()
            }
        }
        return ""
    }

    private fun durationBetween(startRaw: String, endRaw: String): Int {
        val s = parseSetTableATime(startRaw)
        val e = parseSetTableATime(endRaw)
        if (s.isBlank() || e.isBlank()) return 0
        return runCatching {
            Duration.between(java.time.Instant.parse(s), java.time.Instant.parse(e))
                .seconds.toInt().coerceAtLeast(0)
        }.getOrDefault(0)
    }

    /** Split file into logical CSV lines (handles quoted newlines lightly by not supporting them). */
    fun splitCsvLines(text: String): List<String> =
        text.lines().map { it.trimEnd('\r') }.filter { it.isNotBlank() }

    fun parseCsvRow(line: String): List<String> {
        val out = mutableListOf<String>()
        val cur = StringBuilder()
        var inQuotes = false
        var i = 0
        while (i < line.length) {
            val c = line[i]
            when {
                c == '"' -> {
                    if (inQuotes && i + 1 < line.length && line[i + 1] == '"') {
                        cur.append('"')
                        i++
                    } else {
                        inQuotes = !inQuotes
                    }
                }
                c == ',' && !inQuotes -> {
                    out.add(cur.toString())
                    cur.clear()
                }
                else -> cur.append(c)
            }
            i++
        }
        out.add(cur.toString())
        return out
    }

    fun csvEscape(value: String): String {
        val needs = value.contains(',') || value.contains('"') || value.contains('\n')
        if (!needs) return value
        return "\"" + value.replace("\"", "\"\"") + "\""
    }

    private fun jsonStr(s: String): String =
        "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\""
}
