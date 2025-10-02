export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
   theme: {
    darkMode: 'class',
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        foda: ['"Foda Display"', "sans-serif"],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
};