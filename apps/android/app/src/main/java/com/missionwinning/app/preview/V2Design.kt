package com.missionwinning.app.preview

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Shapes
import androidx.compose.material3.Text
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.selected
import com.missionwinning.core.designsystem.R as DesignR

internal object V2Colors {
    val Paper = Color(0xFFF3F2F2)
    val Ink = Color(0xFF201E1D)
    val QuietInk = Color(0xFF484746)
    val Rule = Color(0xFF9F9D9D)
    val Red = Color(0xFFAE1800)
    val Fill = Color(0xFFDD2B0F)
}

@OptIn(ExperimentalTextApi::class)
private val Archivo = FontFamily(
    Font(DesignR.font.archivo_variable),
    Font(DesignR.font.archivo_variable, FontWeight.Bold, variationSettings = FontVariation.Settings(FontVariation.weight(700))),
)
private val Square = RoundedCornerShape(0.dp)

private fun type(size: Int, height: Int, weight: FontWeight = FontWeight.Normal) =
    TextStyle(fontFamily = Archivo, fontSize = size.sp, lineHeight = height.sp, fontWeight = weight)

private val V2Typography = Typography(
    displaySmall = type(44, 48, FontWeight.Bold),
    headlineSmall = type(26, 30, FontWeight.Bold),
    titleMedium = type(19, 24, FontWeight.Bold),
    bodyLarge = type(17, 24),
    bodyMedium = type(15, 21),
    labelLarge = type(15, 20, FontWeight.Bold),
    labelMedium = type(12, 16, FontWeight.Bold).copy(letterSpacing = 1.4.sp),
)

@Composable
internal fun V2Theme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = V2Colors.Red, onPrimary = Color.White, secondary = V2Colors.QuietInk,
            background = V2Colors.Paper, onBackground = V2Colors.Ink,
            surface = V2Colors.Paper, onSurface = V2Colors.Ink,
            onSurfaceVariant = V2Colors.QuietInk, outline = V2Colors.Rule,
        ),
        typography = V2Typography,
        shapes = Shapes(Square, Square, Square, Square, Square),
        content = content,
    )
}

@Composable
internal fun V2Page(
    title: String,
    marker: String,
    bottomInset: Boolean = false,
    content: @Composable ColumnScope.() -> Unit,
) {
    val bottom = if (bottomInset) Modifier.navigationBarsPadding() else Modifier
    Column(
        Modifier.fillMaxSize().background(V2Colors.Paper).statusBarsPadding().then(bottom)
            .windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Horizontal))
            .verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 18.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        V2Label(marker)
        Text(title, style = MaterialTheme.typography.displaySmall)
        V2Rule()
        content()
    }
}

@Composable
internal fun V2Label(text: String) {
    Text(text, style = MaterialTheme.typography.labelMedium, color = V2Colors.Red)
}

@Composable
internal fun V2Rule() {
    HorizontalDivider(thickness = 2.dp, color = V2Colors.Rule)
}

@Composable
internal fun V2Action(label: String, enabled: Boolean = true, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(containerColor = V2Colors.Fill, contentColor = Color.White),
        shape = RectangleShape,
    ) { Text(label) }
}

@Composable
internal fun V2Secondary(label: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    V2Secondary(label, modifier, enabled = true, onClick = onClick)
}

@Composable
internal fun V2Secondary(label: String, modifier: Modifier, enabled: Boolean, onClick: () -> Unit) {
    OutlinedButton(onClick, modifier = modifier, enabled = enabled, shape = RectangleShape) { Text(label) }
}

@Composable
internal fun V2Navigation(route: String?, items: List<Pair<String, Int>>, onSelect: (String) -> Unit) {
    V2Theme {
        Column(Modifier.background(V2Colors.Paper).navigationBarsPadding()) {
            V2Rule()
            Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items.forEach { (destination, label) ->
                    androidx.compose.material3.TextButton(
                        onClick = { onSelect(destination) },
                        modifier = Modifier.weight(1f).then(
                            Modifier.semantics { selected = destination == route },
                        ),
                    ) {
                        Text(
                            stringResource(label),
                            color = if (destination == route) V2Colors.Red else V2Colors.Ink,
                            fontWeight = if (destination == route) FontWeight.Bold else FontWeight.Normal,
                        )
                    }
                }
            }
        }
    }
}
