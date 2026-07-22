# Walkthrough - Fixed Startup Crash

I have fixed the issue where the app would close immediately upon opening.

## Changes

### [App Module]

#### [AndroidManifest.xml](file:///Users/snedz/missionwinning/apps/android/app/src/main/AndroidManifest.xml)
I disabled Sentry's automatic initialization. This was causing a crash because the Sentry SDK was starting before the app could provide its configuration (specifically the DSN, which is often empty in local development environments).

Since the app already manually initializes Sentry in `MwApp.onCreate` (after checking user privacy settings), disabling auto-init stops the crash without breaking crash reporting for users who have it enabled.

## Verification Results

### Manual Verification
- Deployed the app to the emulator using `:app:installDebug`.
- Launched the app successfully.
- Verified that the app stays open and displays the "Today" screen.

