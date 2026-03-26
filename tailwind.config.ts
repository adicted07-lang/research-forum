import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#DA552F",
          hover: "#c44a28",
          light: "rgba(218, 85, 47, 0.08)",
          lighter: "rgba(218, 85, 47, 0.04)",
        },
        surface: {
          DEFAULT: "#F7F7F7",
          hover: "#F0F0F0",
          dark: "#1A1A22",
          "dark-hover": "#22222D",
        },
        border: {
          DEFAULT: "#E8E8E8",
          light: "#F0F0F0",
          dark: "#2A2A35",
          "dark-light": "#1E1E28",
        },
        text: {
          primary: "#21293C",
          secondary: "#6F7287",
          tertiary: "#9CA3AF",
          "dark-primary": "#E8E8EC",
          "dark-secondary": "#8E8E9A",
          "dark-tertiary": "#5A5A66",
        },
        success: "#00B67A",
        error: "#E04E2F",
        warning: "#F59E0B",
        info: "#4F86EC",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.04)",
        md: "0 4px 12px rgba(0,0,0,0.06)",
        lg: "0 8px 30px rgba(0,0,0,0.08)",
        xl: "0 20px 60px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
