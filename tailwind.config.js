// tailwind.config.js

module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5", // Custom primary color
        secondary: "#9333ea", // Custom secondary color
        accent: "#facc15", // Custom accent color
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Custom font family
      },
    },
  },
  plugins: [],
};
