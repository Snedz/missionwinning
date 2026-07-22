# Implementation Plan - Fix Startup Crash (Sentry DSN Missing)

The app is crashing at startup because the Sentry Android SDK is attempting to auto-initialize, but it cannot find a valid Data Source Name (DSN). Since the project uses manual initialization to respect user privacy settings, auto-initialization should be disabled.

## User Review Required

> [!IMPORTANT]
> This change disables Sentry's automatic startup. Crash reporting will still function because it is manually initialized in `MwApp.onCreate` after checking user preferences.

## Proposed Changes

### [App Module]

#### [MODIFY] [AndroidManifest.xml](file:///Users/snedz/missionwinning/apps/android/app/src/main/AndroidManifest.xml)
- Add meta-data to disable Sentry auto-initialization.

```xml
<application ...>
    <!-- Disable Sentry auto-init to prevent crash when DSN is missing in local builds -->
    <meta-data android:name="io.sentry.auto-init" android:value="false" />
    ...
</application>
```

## Verification Plan

### Automated Tests
- Run `adb logcat` to ensure the `FATAL EXCEPTION` related to `SentryInitProvider` no longer appears.
- Deploy the app to the emulator and verify it reaches the main screen.

### Manual Verification
- Deploy to emulator-5554 using `./gradlew :app:installDebug`.
- Launch the app and confirm it stays open.
