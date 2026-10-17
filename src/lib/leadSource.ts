/**
 * Tags a client is allowed to write onto `leads.package_interest`.
 *
 * The confirmation mail used to interpolate this string. An open 80-character
 * field is a sentence we send from this app's address. The list is the tags
 * the forms actually send (`submitLead` keeps `source` over `package_interest`).
 */

import { FEEDBACK_SOURCE_TAG } from '@/lib/feedbackSource';

export const LEAD_SOURCE_TAGS = [
  'general',
  'launch-waitlist',
  'landing-super-bundle-notify',
  'coaching-page',
  FEEDBACK_SOURCE_TAG,
  'waitlist-super-bundle',
  'waitlist-premium',
  'waitlist-pt-nutrition',
  'waitlist-bodybuilding',
  'waitlist-corrective',
  'waitlist-strength-business',
  'waitlist-online-coaching',
  'waitlist-conditioning',
] as const;

export type LeadSourceTag = (typeof LEAD_SOURCE_TAGS)[number];

export function isLeadSourceTag(source: string): source is LeadSourceTag {
  return (LEAD_SOURCE_TAGS as readonly string[]).includes(source);
}
