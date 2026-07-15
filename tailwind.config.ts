import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1f6b3a",
          dark: "#144a28",
          light: "#e8f3ec"
        }
      }
    }
  },
  plugins: []
};

export default config;
