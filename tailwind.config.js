/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#1a1a1a",
        card: "#2a2a2a",
        primary: "#facc15"
      }
    }
  },
  plugins: []
};
