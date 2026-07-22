import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.androidx.baselineprofile)
}

// Optional upload signing: apps/android/keystore.properties (gitignored).
// Local smoke: release falls back to debug signing unless -Pmw.requireUploadKeystore=true.
val keystorePropertiesFile = rootProject.file("keystore.properties")
val keystoreProperties = Properties()
val hasReleaseKeystore = keystorePropertiesFile.exists()
if (hasReleaseKeystore) {
    keystorePropertiesFile.inputStream().use { keystoreProperties.load(it) }
}
val requireUploadKeystore =
    (project.findProperty("mw.requireUploadKeystore") as? String)?.equals("true", ignoreCase = true) == true

android {
    namespace = "com.missionwinning.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.missionwinning.app"
        minSdk = 26
        targetSdk = 36
        versionCode = 47
        versionName = "1.20.0"
        // Override via apps/android/local.properties (gitignored):
        //   mw.apiBaseUrl=http://10.0.2.2:3000
        //   mw.privateAccessCookie=<token from mw_private_access after /api/private-access>
        //   mw.sentryDsn=https://…@….ingest.sentry.io/…
        val localProps = Properties().apply {
            val f = rootProject.file("local.properties")
            if (f.exists()) f.inputStream().use { load(it) }
        }
        val apiBase = localProps.getProperty("mw.apiBaseUrl") ?: "https://www.missionwinning.com"
        val privateCookie = localProps.getProperty("mw.privateAccessCookie") ?: ""
        val supabaseUrl = localProps.getProperty("mw.supabaseUrl") ?: ""
        val supabaseAnon = localProps.getProperty("mw.supabaseAnonKey") ?: ""
        val sentryDsn = localProps.getProperty("mw.sentryDsn") ?: ""
        buildConfigField("String", "API_BASE_URL", "\"$apiBase\"")
        buildConfigField("String", "PRIVATE_ACCESS_COOKIE", "\"$privateCookie\"")
        buildConfigField("String", "SUPABASE_URL", "\"$supabaseUrl\"")
        buildConfigField("String", "SUPABASE_ANON_KEY", "\"$supabaseAnon\"")
        buildConfigField("String", "SENTRY_DSN", "\"$sentryDsn\"")
    }

    signingConfigs {
        if (hasReleaseKeystore) {
            create("release") {
                val storePath = keystoreProperties.getProperty("storeFile")
                    ?: error("keystore.properties missing storeFile")
                storeFile = rootProject.file(storePath)
                storePassword = keystoreProperties.getProperty("storePassword")
                    ?: error("keystore.properties missing storePassword")
                keyAlias = keystoreProperties.getProperty("keyAlias")
                    ?: error("keystore.properties missing keyAlias")
                keyPassword = keystoreProperties.getProperty("keyPassword")
                    ?: error("keystore.properties missing keyPassword")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
            if (hasReleaseKeystore) {
                signingConfig = signingConfigs.getByName("release")
            } else if (requireUploadKeystore) {
                error(
                    "Play upload requires apps/android/keystore.properties. " +
                        "Run scripts/create-upload-keystore.sh, or omit -Pmw.requireUploadKeystore=true " +
                        "for local debug-signed smoke.",
                )
            } else {
                // Local smoke only — Play Console rejects debug-signed AABs.
                signingConfig = signingConfigs.getByName("debug")
            }
        }
        debug {
            applicationIdSuffix = ".debug"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    packaging {
        resources.excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
}

dependencies {
    implementation(project(":core:designsystem"))
    implementation(project(":core:data"))
    implementation(project(":core:network"))
    implementation(project(":core:common"))
    implementation(project(":core:model"))
    implementation(project(":feature:active"))
    implementation(project(":feature:today"))
    implementation(project(":feature:coach"))
    implementation(project(":feature:iday"))
    implementation(project(":feature:victory"))
    implementation(project(":feature:auth"))

    val composeBom = platform(libs.androidx.compose.bom)
    implementation(composeBom)
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.hilt.navigation.compose)
    implementation(libs.androidx.core.ktx)
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.sentry.android)
    implementation(libs.androidx.glance.appwidget)
    implementation(libs.androidx.glance.material3)
    implementation(libs.androidx.health.connect)
    implementation(libs.play.services.wearable)
    implementation(libs.kotlinx.coroutines.play.services)
    implementation(libs.billing.client)
    implementation(libs.androidx.profileinstaller)
    "baselineProfile"(project(":benchmark"))
    debugImplementation(libs.androidx.compose.ui.tooling)

    testImplementation(libs.junit)
}
