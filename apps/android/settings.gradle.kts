pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.10.0"
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "MissionWinning"
include(":app")
include(":core:common")
include(":core:model")
include(":core:designsystem")
include(":core:data")
include(":core:network")
include(":feature:active")
include(":feature:today")
include(":feature:coach")
include(":feature:iday")
include(":feature:victory")
