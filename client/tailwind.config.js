/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f7ff",
          100: "#dbe7ff",
          200: "#bed2ff",
          300: "#8fb0ff",
          400: "#5d83ff",
          500: "#3458f5",
          600: "#2643db",
          700: "#2036b1",
          800: "#1f318b",
          900: "#1f2e6d"
        },
        accent: "#f97316",
        panel: "#0f172a",
        soft: "#1e293b"
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui"],
        body: ["Manrope", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        glow: "0 20px 80px rgba(52, 88, 245, 0.35)"
      }
    },
  },
  plugins: [],
};
