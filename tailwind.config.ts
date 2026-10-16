import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        brand2: "rgb(var(--brand2) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        warm: "rgb(var(--warm) / <alpha-value>)",
      },
      fontFamily: {
        display: ["'Space Grotesk Variable'", "system-ui", "sans-serif"],
        sans: ["'Inter Variable'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono Variable'", "ui-monospace", "monospace"],
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        wave: { "0%,60%,100%": { transform: "rotate(0)" }, "10%,30%": { transform: "rotate(14deg)" }, "20%": { transform: "rotate(-8deg)" }, "40%": { transform: "rotate(-4deg)" }, "50%": { transform: "rotate(10deg)" } },
        blink: { "50%": { opacity: "0" } },
      },
      animation: { float: "float 6s ease-in-out infinite", wave: "wave 2.2s ease-in-out infinite", blink: "blink 1s step-end infinite" },
    },
  },
  plugins: [],
};
export default config;
