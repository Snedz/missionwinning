/**
 * Registry of every browser-storage key this app owns.
 *
 * Purpose is typing + discoverability ("what does the app persist?"), not backup
 * enumeration — `src/lib/backup.ts` deliberately prefix-scans `mw_*` at runtime so
 * a stale registry can never silently drop a key from an export.
 *
 * Adding a key: add it here and use `safeStorage` to read/write it.
 */

/** Zustand persist key — not `mw_`-prefixed for historical reasons. */
export const WORKOUT_STORE_KEY = 'workout-tracker-storage';

/**
 * i18next's own language key. Owned by the library, not by us — it is written by
 * `i18next-browser-languagedetector` too, so never rename it, and it is deliberately
 * outside `MW_PREFIX` so backup/restore leaves the detector's state alone.
 */
export const I18N_LANG_KEY = 'i18nextLng';

/** Prefix for every app-owned key. Backup/restore scans on this. */
export const MW_PREFIX = 'mw_';

/**
 * Exact keys, grouped by the surface that owns them.
 * Wedge groups (train/today/coach/fuel) survive surface parking; the rest may
 * become unreachable when their surface is parked (see `src/lib/surface.ts`).
 */
export const STORAGE_KEYS = {
  // ── Train / Today (wedge) ──
  lastWorkoutDate: 'mw_last_workout_date',
  streak: 'mw_streak',
  /**
   * `.217` — the day `mw_streak` was last incremented. The override was a
   * counter with **no date**, so nothing could tell a streak of 5 ending today
   * from one ending three months ago, and nothing stopped three taps in one
   * afternoon adding +3 to a "day streak".
   */
  streakLastBump: 'mw_streak_last_bump',
  challenges: 'mw_challenges',
  defaultRestSec: 'mw_default_rest_sec',
  activityLog: 'mw_activity_log',
  todaySectionsV1: 'mw_today_sections_v1',
  todaySectionsV2: 'mw_today_sections_v2',
  pillarWins: 'mw_pillar_wins',
  uiMode: 'mw_ui_mode',
  outbox: 'mw_outbox_v1',
  sessionJournal: 'mw_session_journal',
  /**
   * `.227` — every local day that holds data, `YYYY-MM-DD`, newest first.
   * **Deliberately uncapped**: it is the one store that must outlive the
   * caps on every other one, at ~10 bytes a day. See `journey/daysWithData`.
   */
  daysWithData: 'mw_days_with_data',
  /** Newest workout_logs.updated_at pulled — cursor for incremental sync. */
  cloudPullCursor: 'mw_cloud_pull_cursor',

  // ── Coach (wedge) ──
  coachPlan: 'mw_coach_plan',
  coachTasterUsed: 'mw_coach_taster_used',
  daysPerWeek: 'mw_days_per_week',
  preferredDays: 'mw_preferred_days',
  equipment: 'mw_equipment',
  experience: 'mw_experience',
  primaryGoal: 'mw_primary_goal',
  goals: 'mw_goals',
  deviceId: 'mw_device_id',
  /** Last time the post-session notification offer was shown (or declined). */
  windDownAskedAt: 'mw_wind_down_asked_at',
  /** Last time the evening day-review offer was shown (or declined). */
  dayReviewAskedAt: 'mw_day_review_asked_at',
  /**
   * The hour the athlete chose for the evening review, as a string, or absent.
   * Kept on the device as well as the server row so Profile can show the
   * current setting without a round trip — and so the offer knows it has
   * already been answered.
   */
  dayReviewHour: 'mw_day_review_hour',

  // ── Fuel (wedge) ──
  nutritionLog: 'mw_nutrition_log',
  macroTargets: 'mw_macro_targets',
  savedMeals: 'mw_saved_meals',
  fuelPlan: 'mw_fuel_plan',
  fuelGoal: 'mw_fuel_goal',
  fuelStreak: 'mw_fuel_streak',
  fuelLastLogDate: 'mw_fuel_last_log_date',
  fuelAdaptEnabled: 'mw_fuel_adapt_enabled',
  water: 'mw_water',
  bodyMetrics: 'mw_body_metrics',

  // ── Journey / profile ──
  journeyState: 'mw_journey_state',
  journeyEvents: 'mw_journey_events',
  journeyStarted: 'mw_journey_started',
  commissionedAt: 'mw_commissioned_at',
  commissionedCelebrated: 'mw_commissioned_celebrated',
  operatorName: 'mw_operator_name',
  units: 'mw_units',
  unitsExplicit: 'mw_units_explicit',
  langExplicit: 'mw_lang_explicit',
  regionDefaults: 'mw_region_defaults_v1',
  remindersPref: 'mw_reminders_pref',
  sessionCheckinSkipped: 'mw_session_checkin_skipped',

  // ── Consent / privacy ──
  privacyConsent: 'mw_privacy_consent_v1',
  analyticsPref: 'mw_analytics_pref_v1',
  attribution: 'mw_attribution',

  // ── Access / premium ──
  privateAccess: 'mw_private_access',
  premium: 'mw_premium',
  premiumEmail: 'mw_premium_email',
  bundleActive: 'mw_bundle_active',

  // ── Learn / guidebook ──
  learnCompleted: 'mw_learn_completed',
  guidebookProgress: 'mw_guidebook_progress',
  premiumCourseProgress: 'mw_premium_course_progress',

  // ── Move / Mind / Track ──
  mindCheckIns: 'mw_mind_checkins',
  lastAssessment: 'mw_last_assessment',
  wearablesHubSamples: 'mw_wearables_hub_samples',

  // ── Beta / growth ──
  betaBannerDismissed: 'mw_beta_banner_dismissed',
  betaContributor: 'mw_beta_contributor',
  betaFeedback: 'mw_beta_feedback',
  /**
   * `.216` — founder's reading position in the feedback inbox. Device-local by
   * design: a reading position is not data, and syncing it would need a table
   * and a migration for a fact exactly one person holds.
   */
  feedbackReviewedAt: 'mw_feedback_reviewed_at',
  leads: 'mw_leads',
  referralCode: 'mw_referral_code',
  squadCode: 'mw_squad_code',
  week4Retention: 'mw_week4_retention',

  // ── America / PFT / school (parkable) ──
  pftResults: 'mw_pft_results',
  pftLastAt: 'mw_pft_last_at',
  pftLastTier: 'mw_pft_last_tier',
  classCode: 'mw_class_code',
  teacherClasses: 'mw_teacher_classes',
  youthMode: 'mw_youth_mode',
  youthParentConsent: 'mw_youth_parent_consent',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** Keys built at runtime with a suffix — never exhaustively enumerable. */
export const STORAGE_KEY_PREFIXES = {
  /** `mw_event_<name>` one-shot analytics de-dupe flags. */
  event: 'mw_event_',
  /** `mw_teacher_pin_<code>` hashed teacher PINs. */
  teacherPin: 'mw_teacher_pin_',
  /** `mw_fuel_plan_sync_<userId>` last fuel plan pushed, per signed-in user. */
  fuelPlanSync: 'mw_fuel_plan_sync_',
  /** `mw_premium_course_sync_<userId>` last course progress pushed, per signed-in user. */
  premiumCourseSync: 'mw_premium_course_sync_',
} as const;
