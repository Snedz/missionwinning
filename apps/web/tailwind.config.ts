import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'hsl(var(--paper))',
        ink: 'hsl(var(--ink))',
        rule: 'hsl(var(--rule))',
        muted: 'hsl(var(--muted-ink))',
        accent: 'hsl(var(--accent))',
      },
      borderRadius: { DEFAULT: '0' },
    },
  },
} satisfies Config;
