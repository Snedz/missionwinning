package com.missionwinning.app.nav

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.missionwinning.app.feature.active.ActiveScreen
import com.missionwinning.app.feature.auth.AuthScreen
import com.missionwinning.app.feature.coach.CoachScreen
import com.missionwinning.app.feature.iday.IdayScreen
import com.missionwinning.app.feature.today.TodayScreen
import com.missionwinning.app.feature.victory.VictoryScreen
import com.missionwinning.core.data.MwRepository
import java.net.URLDecoder

@Composable
fun MwNavHost(repository: MwRepository) {
    val nav = rememberNavController()
    var bootDone by remember { mutableStateOf(false) }
    var start by remember { mutableStateOf(Routes.BOOT) }

    LaunchedEffect(Unit) {
        start = if (repository.isIdayDone()) Routes.TODAY else Routes.IDAY
        bootDone = true
    }

    if (!bootDone) return

    NavHost(navController = nav, startDestination = start) {
        composable(Routes.IDAY) {
            IdayScreen(
                repository = repository,
                onFinished = {
                    nav.navigate(Routes.TODAY) {
                        popUpTo(Routes.IDAY) { inclusive = true }
                    }
                },
            )
        }
        composable(Routes.TODAY) {
            TodayScreen(
                repository = repository,
                onStartWorkout = { id, name, sets ->
                    nav.navigate(Routes.active(id, name, sets))
                },
                onOpenCoach = { nav.navigate(Routes.COACH) },
                onOpenAuth = { nav.navigate(Routes.AUTH) },
            )
        }
        composable(Routes.COACH) {
            CoachScreen(
                repository = repository,
                onStartWorkout = { id, name, sets ->
                    nav.navigate(Routes.active(id, name, sets))
                },
                onBack = { nav.popBackStack() },
            )
        }
        composable(Routes.AUTH) {
            AuthScreen(onClose = { nav.popBackStack() })
        }
        composable(
            Routes.ACTIVE,
            arguments = listOf(
                navArgument("sessionId") { type = NavType.StringType },
                navArgument("name") { type = NavType.StringType },
                navArgument("sets") { type = NavType.IntType },
            ),
        ) { entry ->
            val sessionId = entry.arguments!!.getString("sessionId")!!.decode()
            val name = entry.arguments!!.getString("name")!!.decode()
            val sets = entry.arguments!!.getInt("sets")
            ActiveScreen(
                repository = repository,
                sessionId = sessionId,
                workoutName = name,
                targetSets = sets,
                onFinished = { n, s, d, w ->
                    nav.navigate(Routes.victory(n, s, d, w)) {
                        popUpTo(Routes.TODAY)
                    }
                },
                onCancel = { nav.popBackStack() },
            )
        }
        composable(
            Routes.VICTORY,
            arguments = listOf(
                navArgument("name") { type = NavType.StringType },
                navArgument("sets") { type = NavType.IntType },
                navArgument("duration") { type = NavType.IntType },
                navArgument("workouts") { type = NavType.IntType },
            ),
        ) { entry ->
            VictoryScreen(
                workoutName = entry.arguments!!.getString("name")!!.decode(),
                sets = entry.arguments!!.getInt("sets"),
                duration = entry.arguments!!.getInt("duration"),
                workouts = entry.arguments!!.getInt("workouts"),
                onCoach = {
                    nav.navigate(Routes.COACH) {
                        popUpTo(Routes.TODAY)
                    }
                },
                onToday = {
                    nav.navigate(Routes.TODAY) {
                        popUpTo(Routes.TODAY) { inclusive = true }
                    }
                },
            )
        }
    }
}

private fun String.decode() = URLDecoder.decode(this, Charsets.UTF_8.name())
