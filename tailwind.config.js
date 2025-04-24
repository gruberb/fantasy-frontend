/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand colors
        "fantasy-purple": {
          DEFAULT: "#6D4C9F",
          light: "#8A6CB5",
          dark: "#5A3A87",
          50: "#f5f3fa",
          100: "#ebe6f5",
          200: "#d8ccea",
          300: "#baa6da",
          400: "#9c7fc8",
          500: "#8159b7",
          600: "#6D4C9F",
          700: "#5A3A87",
          800: "#4c3270",
          900: "#402c5c",
        },
        // NHL colors
        "nhl-blue": "#041E42",
        "nhl-red": "#AF1E2D",
        "nhl-light-blue": "#6BBBAE",
        "nhl-gold": "#FFB81C",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(90deg, #6D4C9F 0%, #8A6CB5 100%)",
        "header-gradient": "linear-gradient(90deg, #041E42 0%, #6D4C9F 100%)",
        "nhl-gradient": "linear-gradient(90deg, #041E42 0%, #AF1E2D 100%)",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)",
        "card-hover":
          "0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
