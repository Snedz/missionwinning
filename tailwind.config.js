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
        // Numeric steps are the handoff ramp (src/index.css). 100/600/700 alias
        // --accent-tint / --primary-fill / --primary, so `bg-accent-600` and
        // `bg-primary-fill` are the same paint by construction.
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          100: "hsl(var(--accent-100))",
          200: "hsl(var(--accent-200))",
          300: "hsl(var(--accent-300))",
          400: "hsl(var(--accent-400))",
          500: "hsl(var(--accent-500))",
          600: "hsl(var(--accent-600))",
          700: "hsl(var(--accent-700))",
          800: "hsl(var(--accent-800))",
          900: "hsl(var(--accent-900))",
        },
        // Replaces Tailwind's stock neutral scale, which had zero call sites —
        // so `bg-neutral-900` can only ever mean the Modernist ink panel.
        neutral: {
          100: "hsl(var(--neutral-100))",
          200: "hsl(var(--neutral-200))",
          300: "hsl(var(--neutral-300))",
          400: "hsl(var(--neutral-400))",
          500: "hsl(var(--neutral-500))",
          600: "hsl(var(--neutral-600))",
          700: "hsl(var(--neutral-700))",
          800: "hsl(var(--neutral-800))",
          900: "hsl(var(--neutral-900))",
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
      // Overrides Tailwind's stock shadow scale (also zero call sites after the
      // rebrand stripped every glow). Reach for these only on dialogs and the
      // one boss panel per screen — the system is flat by default.
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
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
