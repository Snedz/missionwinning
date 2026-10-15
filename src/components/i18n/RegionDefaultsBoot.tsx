'use client';

/**
 * Units stay on the Settings default (metric) until the athlete changes them.
 *
 * This used to copy `/api/geo` units onto the device. US, Liberia, and
 * Myanmar then opened a fresh session in lbs while Account still said
 * "Default is metric." Language is confirmed in onboarding, not here.
 */

export function RegionDefaultsBoot() {
  return null;
}
