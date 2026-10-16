import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { CoachRouteInput } from './coachFallbackRoute';
import { pickCoachRoute } from './coachFallbackRoute';

describe('pickCoachRoute', () => {
	it('flag off → rules (even if nano AVAILABLE)', () => {
		const input: CoachRouteInput = {
			flagEnabled: false,
			nanoStatus: 'AVAILABLE',
			proxyReachable: true,
		};
		const result = pickCoachRoute(input);
		assert.equal(result.route, 'rules');
		assert.equal(result.reason, 'flag off');
	});

	it('flag on + AVAILABLE → nano', () => {
		const input: CoachRouteInput = {
			flagEnabled: true,
			nanoStatus: 'AVAILABLE',
			proxyReachable: false,
		};
		const result = pickCoachRoute(input);
		assert.equal(result.route, 'nano');
		assert.equal(result.reason, 'nano available');
	});

	it('flag on + UNAVAILABLE + proxy up → proxy with reason including UNAVAILABLE', () => {
		const input: CoachRouteInput = {
			flagEnabled: true,
			nanoStatus: 'UNAVAILABLE',
			proxyReachable: true,
		};
		const result = pickCoachRoute(input);
		assert.equal(result.route, 'proxy');
		assert.match(result.reason, /UNAVAILABLE/);
		assert.match(result.reason, /proxy up/);
	});

	it('flag on + DOWNLOADABLE + proxy down → rules', () => {
		const input: CoachRouteInput = {
			flagEnabled: true,
			nanoStatus: 'DOWNLOADABLE',
			proxyReachable: false,
		};
		const result = pickCoachRoute(input);
		assert.equal(result.route, 'rules');
		assert.match(result.reason, /DOWNLOADABLE/);
		assert.match(result.reason, /proxy down/);
	});

	it('flag on + UNKNOWN + proxy up → proxy', () => {
		const input: CoachRouteInput = {
			flagEnabled: true,
			nanoStatus: 'UNKNOWN',
			proxyReachable: true,
		};
		const result = pickCoachRoute(input);
		assert.equal(result.route, 'proxy');
		assert.match(result.reason, /UNKNOWN/);
		assert.match(result.reason, /proxy up/);
	});

	it('flag on + DOWNLOADING + proxy down → rules', () => {
		const input: CoachRouteInput = {
			flagEnabled: true,
			nanoStatus: 'DOWNLOADING',
			proxyReachable: false,
		};
		const result = pickCoachRoute(input);
		assert.equal(result.route, 'rules');
		assert.match(result.reason, /DOWNLOADING/);
		assert.match(result.reason, /proxy down/);
	});
});
