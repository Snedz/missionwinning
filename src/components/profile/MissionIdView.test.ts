/**
 * Mission ID line — coverage + #1 display contract.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MissionIdView } from './MissionIdView';
import { athleteMissionIdForCurrentUser, FOUNDER_TEST_PROFILE, isFounderForMissionId1 } from '@/lib/identity/missionId';

test('MissionIdView is a client component export', () => {
  assert.equal(typeof MissionIdView, 'function');
});

test('founder current user displays #1', () => {
  assert.equal(isFounderForMissionId1({ githubLogin: FOUNDER_TEST_PROFILE.githubLogin }), true);
  assert.equal(athleteMissionIdForCurrentUser({ signedIn: true, missionId: 1 }), '#1');
});
