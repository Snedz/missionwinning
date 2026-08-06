/**
 * "A new build is on this device" — decided from service-worker lifecycle.
 *
 * `app/sw.ts` runs `skipWaiting: true`, so a new worker never rests in
 * `waiting`: it installs, takes control, and the page keeps running the old
 * assets until the next navigation. Nothing tells the athlete a version
 * shipped. The announce moment is therefore the installing worker reaching
 * `installed` *while a controller exists* — a controller is what separates
 * "update arrived" from the very first install, which must stay silent.
 *
 * Reload is button-only. `next.config.js` also sets `reloadOnOnline: true`,
 * and the offline e2e spec waits on that reload — an automatic reload on
 * `controllerchange` here could double-navigate it.
 */

export function shouldAnnounceUpdate(input: {
  workerState: string;
  hasController: boolean;
  alreadyAnnounced: boolean;
}): boolean {
  return (
    input.workerState === 'installed' && input.hasController && !input.alreadyAnnounced
  );
}

type WorkerLike = {
  state: string;
  addEventListener(type: 'statechange', listener: () => void): void;
};

export type UpdateRegistrationLike = {
  installing: WorkerLike | null;
  waiting: WorkerLike | null;
  addEventListener(type: 'updatefound', listener: () => void): void;
};

/**
 * Watches a registration and calls `announce` at most once per page load.
 * Probes `installing ?? waiting` at attach time — an update found before
 * `register()` resolved would otherwise never fire `updatefound` for us.
 */
export function wireUpdatePrompt(
  reg: UpdateRegistrationLike,
  hasController: () => boolean,
  announce: () => void
): void {
  let announced = false;

  const consider = (worker: WorkerLike | null) => {
    if (!worker) return;
    const check = () => {
      if (
        shouldAnnounceUpdate({
          workerState: worker.state,
          hasController: hasController(),
          alreadyAnnounced: announced,
        })
      ) {
        announced = true;
        announce();
      }
    };
    check();
    worker.addEventListener('statechange', check);
  };

  consider(reg.installing ?? reg.waiting);
  reg.addEventListener('updatefound', () => consider(reg.installing));
}
