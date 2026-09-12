import type { Config } from "tailwindcss";

// Design plan (campus-noticeboard concept):
// Color — ink #1B2B22 (text/dark surfaces), board #3B5544 (corkboard green header),
//         paper #FCF9F0 (index-card cream), mustard #C98D2C (pins/CTAs), denim #2C5F8A (links/tags)
// Type  — Fraunces (display serif, headline personality) + IBM Plex Sans (body/UI)
// Layout — left-aligned index-card grid, pinned-note hero, no rounded SaaS-card sameness

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2B22",
        board: "#3B5544",
        boardDark: "#28392E",
        paper: "#FCF9F0",
        mustard: "#C98D2C",
        denim: "#2C5F8A",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-plex)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
