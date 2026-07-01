/** Owner-only Profile panels — hidden in production unless explicitly enabled. */
export function showOwnerTools(): boolean {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SHOW_OWNER_TOOLS === 'true';
  }
  return process.env.NEXT_PUBLIC_SHOW_OWNER_TOOLS === 'true';
}
