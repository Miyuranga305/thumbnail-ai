import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // ✅ works in all common setups
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
