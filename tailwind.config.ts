import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f0ff",
          100: "#e0e0ff",
          200: "#c4b5fd",
          300: "#a78bfa",
          400: "#8b5cf6",
          500: "#7c3aed",
          600: "#6d28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#3b0764",
        },
        accent: {
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
        },
        dark: {
          50: "#1e1e2e",
          100: "#181825",
          200: "#11111b",
          300: "#0a0a14",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "waveform": "waveform 1.5s ease-in-out infinite",
      },
      keyframes: {
        waveform: {
          "0%, 100%": { height: "20%" },
          "50%": { height: "80%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
