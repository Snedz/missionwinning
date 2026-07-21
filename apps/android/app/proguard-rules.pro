# Mission Winning release minify keeps
# Kotlinx Serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

-keepclassmembers class kotlinx.serialization.json.** {
    *** Companion;
}
-keepclasseswithmembers class kotlinx.serialization.json.** {
    kotlinx.serialization.KSerializer serializer(...);
}

-keep,includedescriptorclasses class com.missionwinning.core.network.**$$serializer { *; }
-keepclassmembers class com.missionwinning.core.network.** {
    *** Companion;
}
-keepclasseswithmembers class com.missionwinning.core.network.** {
    kotlinx.serialization.KSerializer serializer(...);
}

# OkHttp / Okio
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Room
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
-dontwarn androidx.room.paging.**

# Sentry (crash-only)
-keepattributes SourceFile,LineNumberTable
-dontwarn io.sentry.**
