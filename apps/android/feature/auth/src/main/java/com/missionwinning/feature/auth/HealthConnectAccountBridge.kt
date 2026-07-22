package com.missionwinning.feature.auth

import androidx.activity.result.contract.ActivityResultContract

/**
 * Optional Health Connect Account controls so :feature:auth does not depend on HC / :app.
 * Registered from MwApp. Writer stays in :app.
 */
object HealthConnectAccountBridge {
    @Volatile
    var isAvailable: () -> Boolean = { false }

    /** Write permissions only (export enable gate). */
    @Volatile
    var requiredWritePermissions: () -> Set<String> = { emptySet() }

    /** Write + steps read — used for the Account permission launcher. */
    @Volatile
    var requiredPermissionsWithSteps: () -> Set<String> = { emptySet() }

    @Volatile
    var hasWritePermission: (suspend () -> Boolean)? = null

    @Volatile
    var createPermissionContract: (() -> ActivityResultContract<Set<String>, Set<String>>)? = null
}
