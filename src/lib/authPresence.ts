/**
 * Cached signed-in presence for the logger event path.
 *
 * `logSet` must not await `getUser` (F-001 / `.696`–`.697`). Source is therefore
 * a flag updated by the existing auth listener. Default is guest — we do not
 * invent an account.
 */

let signedIn = false;

export function setLoggerAuthPresence(on: boolean): void {
  signedIn = on;
}

export function loggerEventSource(): 'guest' | 'account' {
  return signedIn ? 'account' : 'guest';
}

export function __resetAuthPresenceForTests(): void {
  signedIn = false;
}
