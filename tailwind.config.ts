import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Surface tones — straight from the source palette spec.
        surface: {
          base: "#121213",      // body / page background (palette "Black")
          card: "#1F1F20",      // cards, widgets (palette "Gray 200")
          elevated: "#2A2A2C",  // hover states, table headers
        },
        // Brand palette is a green ramp centered on #15AD70 ("Green" in the
        // source palette). Existing bg-brand-* / text-brand-* / border-brand-*
        // classes throughout the app render as green automatically.
        brand: {
          50:  "#ecfdf3",
          100: "#d3f9e0",
          200: "#a8f0c6",
          300: "#5edca0",
          400: "#2ec486",
          500: "#15AD70",
          600: "#119057",
          700: "#0c6e44",
          800: "#084e30",
          900: "#053a24",
          950: "#022817",
        },
        // Named accents from the source palette. Available as
        // bg-palette-orange, text-palette-purple, etc. Used on /results to
        // give each team a stable, distinct bar color.
        palette: {
          lightgreen: "#82D25D",
          green:      "#15AD70",
          turquoise:  "#68D0CA",
          lightblue:  "#73BDE7",
          blue:       "#7193ED",
          purple:     "#BF9FF1",
          pink:       "#F9C3D6",
          red:        "#E15E42",
          orange:     "#F78D2C",
          yellow:     "#FFC700",
          beige:      "#F5D4C0",
          winered:    "#EB546F",
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
