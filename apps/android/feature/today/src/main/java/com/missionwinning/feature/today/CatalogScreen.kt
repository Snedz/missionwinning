package com.missionwinning.feature.today

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.missionwinning.core.designsystem.MwCard
import com.missionwinning.core.designsystem.MwChip
import com.missionwinning.core.designsystem.MwChipTone
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwEnterFade
import com.missionwinning.core.designsystem.MwScreenScaffold
import com.missionwinning.core.designsystem.MwSectionLabel
import com.missionwinning.core.designsystem.MwSpace
import com.missionwinning.core.designsystem.MwTopBar
import com.missionwinning.core.designsystem.MwTypography
import com.missionwinning.core.model.ExerciseCatalog
import com.missionwinning.core.model.ExerciseDef

@Composable
fun CatalogScreen(
    equipmentFilter: String? = null,
    onBack: () -> Unit,
) {
    var query by remember { mutableStateOf("") }
    var equip by remember { mutableStateOf(equipmentFilter) }
    val results = remember(query, equip) {
        ExerciseCatalog.search(query, equipment = equip)
    }

    MwScreenScaffold {
        MwEnterFade {
            Column(modifier = Modifier.fillMaxSize()) {
                MwTopBar(title = "Exercise library", onBack = onBack)
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(MwSpace.sm),
                ) {
                    Text(
                        "Offline catalog for bodyweight, dumbbells, and full gym. Used when logging seeded plans.",
                        style = MwTypography.bodyMedium,
                        color = MwColors.TextMuted,
                    )
                    OutlinedTextField(
                        value = query,
                        onValueChange = { query = it },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        label = { Text("Search name or muscle") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = MwColors.Text,
                            unfocusedTextColor = MwColors.Text,
                            focusedContainerColor = MwColors.NavyDeep,
                            unfocusedContainerColor = MwColors.NavyDeep,
                            focusedBorderColor = MwColors.Emerald,
                            unfocusedBorderColor = MwColors.Border,
                            cursorColor = MwColors.Emerald,
                            focusedLabelColor = MwColors.TextMuted,
                            unfocusedLabelColor = MwColors.TextMuted,
                        ),
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip("All", equip == null) { equip = null }
                        FilterChip("Bodyweight", equip == "bodyweight") { equip = "bodyweight" }
                        FilterChip("Dumbbells", equip == "dumbbells") { equip = "dumbbells" }
                        FilterChip("Full gym", equip == "full-gym") { equip = "full-gym" }
                    }
                    Text(
                        "${results.size} exercises",
                        style = MwTypography.labelMedium,
                        color = MwColors.TextMuted,
                    )
                    Spacer(Modifier.height(4.dp))
                }
                LazyColumn(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(MwSpace.sm),
                ) {
                    items(results, key = { it.id }) { def ->
                        ExerciseRow(def)
                    }
                    item { Spacer(Modifier.height(16.dp)) }
                }
            }
        }
    }
}

@Composable
private fun FilterChip(label: String, selected: Boolean, onClick: () -> Unit) {
    MwChip(
        text = label,
        tone = if (selected) MwChipTone.Emerald else MwChipTone.Neutral,
        contentDescription = label,
        onClick = onClick,
    )
}

@Composable
private fun ExerciseRow(def: ExerciseDef) {
    MwCard(elevated = true) {
        Text(def.name, style = MwTypography.titleMedium, color = MwColors.Text)
        Text(
            def.muscleGroups.joinToString(" · ").ifBlank { def.id },
            style = MwTypography.bodyMedium,
            color = MwColors.TextMuted,
        )
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            def.equipment.forEach { eq ->
                MwChip(
                    text = when (eq) {
                        "bodyweight" -> "BW"
                        "dumbbells" -> "DB"
                        "full-gym" -> "Gym"
                        else -> eq
                    },
                    tone = MwChipTone.Neutral,
                )
            }
            if (def.isBodyweight) {
                MwChip("No gear", tone = MwChipTone.Brass)
            }
        }
    }
}
