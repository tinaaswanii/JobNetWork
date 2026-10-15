import type { Config } from "tailwindcss";

// Midnight-blue theme: deep navy surfaces, electric-blue actions, cyan accents.

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#EAF0FF",
        board: "#4169F1",
        boardDark: "#071126",
        paper: "#09152B",
        mustard: "#72E5FF",
        denim: "#72A7FF",
        muted: "#182742",
        "muted-foreground": "#A9B8D2",
      },
      borderColor: {
        DEFAULT: "#263653",
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
