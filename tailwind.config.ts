import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf6",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#064e3b",
          950: "#022c22",
          DEFAULT: "#064e3b",
          soft: "#9ec5a2",
          bg: "#f5faf7",
          night: "#071713",
          glassLight: "rgba(255,255,255,0.72)",
          glassDark: "rgba(255,255,255,0.06)",
        },
      },
      boxShadow: {
        glass: "0 20px 40px -24px rgba(6,78,59,0.28)",
        lift: "0 12px 28px rgba(6,78,59,0.22)",
      },
      transitionTimingFunction: {
        app: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
        pop: {
          "0%": { transform: "scale(0.98)", opacity: "0.0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        shimmer: "shimmer 1.2s ease-in-out infinite",
        pop: "pop 220ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
