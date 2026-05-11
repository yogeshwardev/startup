/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ebfbee",
          100: "#d3f9d8",
          200: "#b2f2bb",
          300: "#8ce99a",
          400: "#51cf66",
          500: "#2f9e44",
          600: "#22863a",
          700: "#1f6f31",
          800: "#195b29",
          900: "#123f1d",
          950: "#092613",
        },
        accent: "#51cf66",
        surface: {
          DEFAULT: "#111318",
          50: "#151820",
          100: "#1a1d25",
          200: "#202530",
          300: "#252a33",
          400: "#3a414d",
        },
        border: {
          DEFAULT: "#252a33",
          subtle: "#1d222b",
          strong: "#3a414d",
        },
      },
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)",
        elevated: "0 8px 24px rgba(0, 0, 0, 0.4)",
        modal: "0 24px 48px rgba(0, 0, 0, 0.5)",
        glow: "0 0 20px rgba(47, 158, 68, 0.15)",
        "glow-sm": "0 0 10px rgba(47, 158, 68, 0.1)",
      },
      borderRadius: {
        "2xl": "0.5rem",
        "3xl": "0.75rem",
        "4xl": "1rem",
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "slide-up": "slide-up 0.4s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "scale-in": "scale-in 0.25s ease-out forwards",
        shimmer: "shimmer 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
