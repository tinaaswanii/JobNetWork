import type { Config } from "tailwindcss";

// Design plan (clean & professional, 60-30-10):
// 60% neutral  — paper #F7F8F6 page, white cards
// 30% brand    — deep green: board #0E4A33 (buttons, accents), boardDark #072A1D (hero/CTA bands)
// 10% accent   — amber #F2B33D (single highlight: badges, key CTA)
// Type — Inter throughout, weight and size carry the hierarchy.

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1B14",
        board: "#0E4A33",
        boardDark: "#072A1D",
        paper: "#F7F8F6",
        mustard: "#F2B33D",
        denim: "#0A6B45",
        muted: "#EEF1EE",
        "muted-foreground": "#5C6B62",
      },
      borderColor: {
        DEFAULT: "#E2E7E3",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
