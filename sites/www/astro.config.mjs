// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';

/**
 * Static output, deployed to Cloudflare Pages.
 *
 * No adapter. `@astrojs/cloudflare` is an SSR adapter; Pages serves `dist/`
 * directly, and "static, fast, no CMS" is a constraint worth keeping true by
 * construction rather than by discipline.
 *
 * Tailwind v4 here while the app stays on v3.4: this tree has its own
 * node_modules (driven by `npm --prefix`, not workspaces — the root package.json
 * declares none), so the two never meet. v4's CSS-first `@theme` is the reason
 * to want it: `src/styles/tokens.css` is generated from the app's `:root` block
 * and *is* the theme, so there is no second place a brand colour can live.
 */
export default defineConfig({
  site: 'https://www.missionwinning.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    // One stylesheet, inlined where small enough. The JS budget is guarded by
    // scripts/www-bundle-budget.mjs; CSS is not the risk here, request count is.
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwind()],
    resolve: {
      alias: {
        // Build-time only. Astro frontmatter reads the app's copy and catalogue
        // modules (landingLocales, compareStories, contentFloors) so the two
        // surfaces cannot say different things — compareStories itself imports
        // `@/lib/contentFloors`, so the alias has to resolve here as well as in
        // tsconfig. Nothing under this alias may be imported by an island:
        // landingLocales alone is one 52KB module whose 15 packs do not
        // tree-shake, and wwwSurface.test.ts fails the build if it is.
        '@': fileURLToPath(new URL('../../src', import.meta.url)),
      },
    },
  },
});
