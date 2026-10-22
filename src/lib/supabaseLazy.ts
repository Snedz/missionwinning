/**
 * Async boundary for the Supabase browser client.
 *
 * `src/lib/supabase.ts` constructs the client at module scope, so a static
 * import pulls `@supabase/supabase-js` (~54 KB gzip) onto first paint. Train
 * and Today do not need that client until a cloud read or write. Callers
 * import this helper at the top of the file and `await loadSupabase()` inside
 * the async function — an `import()` in the caller would be the same split,
 * kept here so the boundary has one name.
 *
 * The `import()` stays inside the function on purpose: hoisting it to module
 * scope would put the client back on the initial graph.
 */
export function loadSupabase() {
  return import('@/lib/supabase');
}
