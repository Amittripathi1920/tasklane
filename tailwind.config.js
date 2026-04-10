/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#09111f",
        panel: "#0f1b2d",
        edge: "#20314a",
        accent: "#56c5ff",
        glow: "#8be2ff",
        success: "#47c88f",
        warning: "#f5b972",
        danger: "#ff7b92",
      },
      fontFamily: {
        sans: ["'Manrope'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 40px rgba(5, 10, 20, 0.35)",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        blink: "blink 1.2s infinite",
        rise: "rise 0.35s ease-out",
      },
    },
  },
  plugins: [],
};
