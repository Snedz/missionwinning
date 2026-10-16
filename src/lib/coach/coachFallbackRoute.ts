export type NanoStatus = 'AVAILABLE' | 'DOWNLOADABLE' | 'DOWNLOADING' | 'UNAVAILABLE' | 'UNKNOWN';

export type CoachRoute = 'nano' | 'proxy' | 'rules';

export type CoachRouteInput = {
	flagEnabled: boolean;
	nanoStatus: NanoStatus;
	proxyReachable: boolean;
};

export type CoachRouteResult = {
	route: CoachRoute;
	reason: string;
};

export function pickCoachRoute(input: CoachRouteInput): CoachRouteResult {
	const { flagEnabled, nanoStatus, proxyReachable } = input;

	// 1. If flag is not strictly true, go to rules
	if (flagEnabled !== true) {
		return { route: 'rules', reason: 'flag off' };
	}

	// 2. If nano is available, use it
	if (nanoStatus === 'AVAILABLE') {
		return { route: 'nano', reason: 'nano available' };
	}

	// 3. If proxy is reachable, use it (with fallback reason)
	if (proxyReachable === true) {
		return { route: 'proxy', reason: `nano ${nanoStatus}; proxy up` };
	}

	// 4. Everything else falls back to rules
	return { route: 'rules', reason: `nano ${nanoStatus}; proxy down` };
}
