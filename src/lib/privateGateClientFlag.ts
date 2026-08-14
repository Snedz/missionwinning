/**
 * Build-time mirror of `isPrivateModeEnabled()` for the client — see the `env`
 * block in `next.config.js`. The gate cookie is httpOnly, so JS cannot read it;
 * this flag is the only way chrome can know which beta it is framing.
 *
 * Its own file because `AppHeader` sits in the shared layout chunk of every
 * route, and importing it from `privateGateNavigate.ts` dragged `publicRoutes.ts`
 * along with it — `bundle-budget.mjs` measures initial JS off the prerendered
 * HTML and both `/log` and `/active` are already over their caps.
 */
export function isClientPrivateGateEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PRIVATE_GATE === 'true';
}
