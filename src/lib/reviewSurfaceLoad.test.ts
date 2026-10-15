import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CreditsPage } from '@/page-components/CreditsPage';
import { OnboardingLocaleFields } from '@/components/i18n/OnboardingLocaleFields';

describe('review surfaces load', () => {
  it('exports the credits page and the onboarding locale fields', () => {
    assert.equal(typeof CreditsPage, 'function');
    assert.equal(typeof OnboardingLocaleFields, 'function');
  });
});
