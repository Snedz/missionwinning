/**
 * The only place the app is allowed to probe sessionStorage.
 *
 * Same reason as safeStorage: accessing the property throws in Safari private
 * mode and some locked-down embeddings. Callers get null and fail closed.
 */

export function sessionStore(): Storage | null {
  try {
    if (typeof globalThis === 'undefined') return null;
    const store = (globalThis as { sessionStorage?: Storage }).sessionStorage;
    return store ?? null;
  } catch {
    return null;
  }
}
