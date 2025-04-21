/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "nhl-blue": "#041E42",
        "nhl-red": "#AF1E2D",
      },
    },
  },
  plugins: [],
};
