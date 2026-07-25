/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        fitness: {
          red: "#dc2626",
          navy: "#0f172a",
          gold: "#ca8a04",
          teal: "#2dd4bf",
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
      boxShadow: {
        glow: "0 0 48px -12px hsl(158 64% 42% / 0.4)",
        "glow-brass": "0 0 48px -12px hsl(42 48% 58% / 0.35)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Barlow Condensed", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "IBM Plex Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
