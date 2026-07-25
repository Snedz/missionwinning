/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // Filled surfaces under white text — see src/index.css for why the accent
          // value cannot double as a fill.
          fill: "hsl(var(--primary-fill))",
          "fill-hover": "hsl(var(--primary-fill-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        // Poster red #ec3013 — fills with large labels, chrome, the one red field
        // per page. NOT for small text (3.78:1 on paper) — that is text-primary.
        poster: "hsl(var(--accent-poster))",
        tint: "hsl(var(--accent-tint))",
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brass: {
          DEFAULT: "hsl(var(--brass))",
          foreground: "hsl(var(--brass-foreground))",
        },
        "surface-raised": "hsl(var(--surface-raised))",
        "grid-line": "hsl(var(--grid-line))",
        status: {
          warn: "hsl(var(--status-warn))",
          info: "hsl(var(--status-info))",
          danger: "hsl(var(--status-danger))",
          ok: "hsl(var(--status-ok))",
        },
      },
      // Modernist: --radius is 0 and the WHOLE scale collapses to it — rounded-xl
      // (124 uses) and rounded-2xl (48) are not token-wired by default, so a bare
      // --radius change would silently keep them at 12/16px. `full` stays circular
      // for geometry that is genuinely round (ProgressRing, radio dots, pulse dot).
      borderRadius: {
        none: "0",
        sm: "var(--radius)",
        DEFAULT: "var(--radius)",
        md: "var(--radius)",
        lg: "var(--radius)",
        xl: "var(--radius)",
        "2xl": "var(--radius)",
        "3xl": "var(--radius)",
        full: "9999px",
      },
      // Archivo only — the three vars all alias --font-archivo (src/index.css)
      // so legacy font-display / font-mono call sites keep resolving.
      fontFamily: {
        sans: ["var(--font-inter)", "Archivo", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Archivo", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "Archivo", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
