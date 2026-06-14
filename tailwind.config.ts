import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Surface tones — matches the dashboard palette spec.
        surface: {
          base: "#1A1A1A",      // body / page background
          card: "#2A2A35",      // cards, widgets
          elevated: "#33333F",  // hover states, table headers
        },
        // Brand palette is the spec's Electric Teal (#06B6D4 / cyan-500).
        // Existing bg-brand-* / text-brand-* / border-brand-* classes
        // throughout the app render as teal automatically.
        brand: {
          50:  "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
