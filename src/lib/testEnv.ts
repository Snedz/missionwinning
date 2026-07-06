/** Test helpers for mutating read-only env vars (e.g. NODE_ENV). */

export function setTestEnv(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  if (key === 'NODE_ENV') {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    return;
  }
  process.env[key] = value;
}

export function snapshotEnv(): NodeJS.ProcessEnv {
  return { ...process.env };
}

export function restoreEnv(snapshot: NodeJS.ProcessEnv): void {
  for (const key of Object.keys(process.env)) {
    if (!(key in snapshot)) delete process.env[key];
  }
  for (const [key, value] of Object.entries(snapshot)) {
    if (value === undefined) continue;
    setTestEnv(key, value);
  }
}
