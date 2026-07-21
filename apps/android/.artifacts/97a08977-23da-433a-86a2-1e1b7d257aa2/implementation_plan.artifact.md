# Implementation Plan - Fix Warnings and Errors

This plan addresses several warnings and errors identified in the project's resource files, manifest, and build configuration, as well as an optimization in the data layer.

## Proposed Changes

### [App Module]

#### [MODIFY] [AndroidManifest.xml](file:///Users/snedz/missionwinning/apps/android/app/src/main/AndroidManifest.xml)
- Add missing attributes or ensure the schema is correctly interpreted to resolve "Attribute not allowed" errors.
- Ensure the package-relative class names (`.MwApp`, `.MainActivity`) are correctly resolved by the IDE analyzer.

#### [MODIFY] [themes.xml](file:///Users/snedz/missionwinning/apps/android/app/src/main/res/values/themes.xml)
- Add the missing `xmlns:android="http://schemas.android.com/apk/res/android"` namespace to the `<resources>` tag. This should resolve the unresolved attribute errors for `android:statusBarColor`, etc.

#### [MODIFY] [build.gradle.kts](file:///Users/snedz/missionwinning/apps/android/app/build.gradle.kts)
- Migrate from the deprecated `kotlinOptions { jvmTarget = "17" }` to the modern `compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) }`.

### [Core Data Module]

#### [MODIFY] [MwDao.kt](file:///Users/snedz/missionwinning/apps/android/core/data/src/main/java/com/missionwinning/core/data/MwDao.kt)
- Add a new `@Query` method to get the count of workout logs directly from the database:
  ```kotlin
  @Query("SELECT COUNT(*) FROM workout_logs")
  suspend fun getWorkoutCount(): Int
  ```

#### [MODIFY] [MwRepository.kt](file:///Users/snedz/missionwinning/apps/android/core/data/src/main/java/com/missionwinning/core/data/MwRepository.kt)
- Update `workoutCount()` to use the new `dao.getWorkoutCount()` method instead of loading all workouts into memory and checking the size of the list.

## Verification Plan

### Automated Tests
- Run `analyze_file` on the modified files to confirm that the reported warnings and errors are resolved.
- If possible, run `./gradlew :app:assembleDebug` to verify the build still succeeds.

### Manual Verification
- Verify that the IDE no longer shows red squiggles in `AndroidManifest.xml` and `themes.xml`.
