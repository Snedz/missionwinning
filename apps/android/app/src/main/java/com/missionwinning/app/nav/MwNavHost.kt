package com.missionwinning.app.nav

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.missionwinning.app.BuildConfig
import com.missionwinning.feature.auth.AuthScreen
import com.missionwinning.app.feature.debug.DesignSystemGalleryScreen
import com.missionwinning.core.data.MwRepository
import com.missionwinning.core.designsystem.MwBottomNav
import com.missionwinning.core.designsystem.MwColors
import com.missionwinning.core.designsystem.MwHubTab
import com.missionwinning.core.designsystem.MwLoadingBlock
import com.missionwinning.core.designsystem.MwTypography
import com.missionwinning.feature.active.ActiveRoute
import com.missionwinning.feature.coach.CoachScreen
import com.missionwinning.feature.iday.IdayScreen
import com.missionwinning.feature.today.CatalogScreen
import com.missionwinning.feature.today.HistoryScreen
import com.missionwinning.feature.today.ProgressScreen
import com.missionwinning.feature.today.RoutinesScreen
import com.missionwinning.feature.today.TodayScreen
import com.missionwinning.feature.victory.VictoryScreen
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import dagger.hilt.android.EntryPointAccessors
import dagger.hilt.components.SingletonComponent
import java.net.URLDecoder

@EntryPoint
@InstallIn(SingletonComponent::class)
interface RepoEntryPoint {
    fun repository(): MwRepository
}

sealed interface PendingDeepLink {
    data object QuickLog : PendingDeepLink
    data class ResumeActive(val sessionId: String, val name: String) : PendingDeepLink
    data class StartWorkout(val sessionId: String, val name: String, val sets: Int) : PendingDeepLink
}

private val HUB_ROUTES = setOf(Routes.TODAY, Routes.COACH, Routes.AUTH)

@Composable
fun MwNavHost(
    pendingDeepLink: PendingDeepLink? = null,
    onDeepLinkConsumed: () -> Unit = {},
) {
    val context = LocalContext.current.applicationContext
    val repository = remember {
        EntryPointAccessors.fromApplication(context, RepoEntryPoint::class.java).repository()
    }
    val nav = rememberNavController()
    var bootDone by remember { mutableStateOf(false) }
    var start by remember { mutableStateOf(Routes.BOOT) }

    LaunchedEffect(Unit) {
        start = if (repository.isIdayDone()) Routes.TODAY else Routes.IDAY
        bootDone = true
    }

    LaunchedEffect(bootDone, pendingDeepLink) {
        val link = pendingDeepLink
        if (!bootDone || link == null) return@LaunchedEffect
        when (link) {
            PendingDeepLink.QuickLog -> {
                val id = MwRepository.freeformSessionId()
                nav.navigate(Routes.active(id, "Quick log", 0)) {
                    launchSingleTop = true
                }
            }
            is PendingDeepLink.ResumeActive -> {
                nav.navigate(Routes.active(link.sessionId, link.name.ifBlank { "Workout" }, 3)) {
                    launchSingleTop = true
                }
            }
            is PendingDeepLink.StartWorkout -> {
                nav.navigate(Routes.active(link.sessionId, link.name, link.sets)) {
                    launchSingleTop = true
                }
            }
        }
        onDeepLinkConsumed()
    }

    if (!bootDone) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MwColors.Navy),
            contentAlignment = Alignment.Center,
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    "Mission Winning",
                    style = MwTypography.headlineLarge,
                    color = MwColors.Text,
                )
                Text(
                    "Loading on this device…",
                    style = MwTypography.bodyMedium,
                    color = MwColors.TextMuted,
                )
                MwLoadingBlock(lines = 2)
            }
        }
        return
    }

    val backStack by nav.currentBackStackEntryAsState()
    val route = backStack?.destination?.route
    val showHubNav = route in HUB_ROUTES
    val selectedTab = when (route) {
        Routes.COACH -> MwHubTab.Coach
        Routes.AUTH -> MwHubTab.Account
        else -> MwHubTab.Today
    }

    Column(Modifier.fillMaxSize()) {
        Box(
            Modifier
                .weight(1f)
                .fillMaxSize(),
        ) {
            NavHost(
                navController = nav,
                startDestination = start,
                enterTransition = {
                    val fromHub = initialState.destination.route in HUB_ROUTES
                    val toHub = targetState.destination.route in HUB_ROUTES
                    if (fromHub && toHub) {
                        fadeIn(tween(200))
                    } else {
                        fadeIn(tween(280)) + slideIntoContainer(
                            AnimatedContentTransitionScope.SlideDirection.Start,
                            tween(280),
                        )
                    }
                },
                exitTransition = {
                    fadeOut(tween(180))
                },
                popEnterTransition = {
                    val fromHub = initialState.destination.route in HUB_ROUTES
                    val toHub = targetState.destination.route in HUB_ROUTES
                    if (fromHub && toHub) {
                        fadeIn(tween(200))
                    } else {
                        fadeIn(tween(280)) + slideIntoContainer(
                            AnimatedContentTransitionScope.SlideDirection.End,
                            tween(280),
                        )
                    }
                },
                popExitTransition = {
                    fadeOut(tween(180))
                },
            ) {
                composable(Routes.IDAY) {
                    IdayScreen(
                        onFinished = {
                            nav.navigate(Routes.TODAY) {
                                popUpTo(Routes.IDAY) { inclusive = true }
                            }
                        },
                    )
                }
                composable(Routes.TODAY) {
                    TodayScreen(
                        onStartWorkout = { id, name, sets ->
                            nav.navigate(Routes.active(id, name, sets))
                        },
                        onOpenCoach = { nav.navigateHub(Routes.COACH) },
                        onOpenAuth = { nav.navigateHub(Routes.AUTH) },
                        onOpenHistory = { workoutId ->
                            nav.navigate(Routes.history(workoutId))
                        },
                        onOpenCatalog = { nav.navigate(Routes.CATALOG) },
                        onOpenProgress = { nav.navigate(Routes.PROGRESS) },
                        onOpenRoutines = { nav.navigate(Routes.ROUTINES) },
                    )
                }
                composable(Routes.CATALOG) {
                    CatalogScreen(onBack = { nav.popBackStack() })
                }
                composable(Routes.PROGRESS) {
                    ProgressScreen(onBack = { nav.popBackStack() })
                }
                composable(Routes.ROUTINES) {
                    RoutinesScreen(
                        onBack = { nav.popBackStack() },
                        onStartRoutine = { id, name, sets ->
                            nav.navigate(Routes.active(id, name, sets))
                        },
                    )
                }
                composable(
                    Routes.HISTORY,
                    arguments = listOf(
                        navArgument("workoutId") { type = NavType.StringType },
                    ),
                ) { entry ->
                    HistoryScreen(
                        workoutId = entry.arguments!!.getString("workoutId")!!.decode(),
                        onBack = {
                            if (!nav.popBackStack()) {
                                nav.navigateHub(Routes.TODAY)
                            }
                        },
                        onOpenRoutines = {
                            nav.navigate(Routes.ROUTINES) {
                                launchSingleTop = true
                            }
                        },
                    )
                }
                composable(Routes.COACH) {
                    CoachScreen(
                        onStartWorkout = { id, name, sets ->
                            nav.navigate(Routes.active(id, name, sets))
                        },
                    )
                }
                composable(Routes.AUTH) {
                    AuthScreen(
                        asHubTab = true,
                        versionName = BuildConfig.VERSION_NAME,
                        versionCode = BuildConfig.VERSION_CODE,
                        debugBuild = BuildConfig.DEBUG,
                        apiBaseUrl = BuildConfig.API_BASE_URL,
                        onClose = { nav.navigateHub(Routes.TODAY) },
                        onOpenGallery = {
                            if (BuildConfig.DEBUG) {
                                nav.navigate(Routes.DESIGN_GALLERY)
                            }
                        },
                    )
                }
                composable(Routes.DESIGN_GALLERY) {
                    DesignSystemGalleryScreen(onBack = { nav.popBackStack() })
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
                    ActiveRoute(
                        sessionId = sessionId,
                        workoutName = name,
                        targetSets = sets,
                        onFinished = { n, s, d, w, volume, unit, workoutId ->
                            nav.navigate(
                                Routes.victory(
                                    name = n,
                                    sets = s,
                                    duration = d,
                                    workouts = w,
                                    volume = volume.toInt().coerceAtLeast(0),
                                    unit = unit,
                                    workoutId = workoutId.ifBlank { "_" },
                                ),
                            ) {
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
                        navArgument("volume") { type = NavType.IntType },
                        navArgument("unit") { type = NavType.StringType },
                        navArgument("workoutId") { type = NavType.StringType },
                    ),
                ) { entry ->
                    val rawWorkoutId = entry.arguments!!.getString("workoutId")!!.decode()
                    VictoryScreen(
                        workoutName = entry.arguments!!.getString("name")!!.decode(),
                        sets = entry.arguments!!.getInt("sets"),
                        duration = entry.arguments!!.getInt("duration"),
                        workouts = entry.arguments!!.getInt("workouts"),
                        volume = entry.arguments!!.getInt("volume"),
                        weightUnit = entry.arguments!!.getString("unit")!!.decode(),
                        workoutId = rawWorkoutId.takeUnless { it == "_" }.orEmpty(),
                        onCoach = {
                            nav.navigate(Routes.COACH) {
                                popUpTo(Routes.TODAY) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        onToday = {
                            nav.navigate(Routes.TODAY) {
                                popUpTo(Routes.TODAY) { inclusive = true }
                            }
                        },
                        onOpenRoutines = {
                            nav.navigate(Routes.ROUTINES) {
                                popUpTo(Routes.TODAY) {
                                    saveState = true
                                }
                                launchSingleTop = true
                            }
                        },
                    )
                }
            }
        }

        if (showHubNav) {
            MwBottomNav(
                selected = selectedTab,
                onSelect = { tab ->
                    when (tab) {
                        MwHubTab.Today -> nav.navigateHub(Routes.TODAY)
                        MwHubTab.Coach -> nav.navigateHub(Routes.COACH)
                        MwHubTab.Account -> nav.navigateHub(Routes.AUTH)
                    }
                },
            )
        }
    }
}

/** Peer hub tabs: single-top + restore, rooted at Today. */
private fun NavHostController.navigateHub(route: String) {
    navigate(route) {
        popUpTo(Routes.TODAY) {
            saveState = true
            inclusive = false
        }
        launchSingleTop = true
        restoreState = true
    }
}

private fun String.decode() = URLDecoder.decode(this, Charsets.UTF_8.name())
