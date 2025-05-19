/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
      },
      colors: {
        black: "#000000",
        gray: {
          200: "#EDEDED",
          400: "#999999",
        },
        stone: {
          50: "#F9F9F9",
        },
        white: "#FFFFFF",
      }
    },
  },
  plugins: [],
}

