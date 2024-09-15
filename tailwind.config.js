/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require("tailwindcss/colors")
const defaultTheme = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        green: {
          100: "#BFFF10",
        },
      },
      fontFamily: {
        body: ["var(--font-montserrat)", "sans-serif"],
        sans: ["var(--font-montserrat)", "sans-serif"],
      },
      // fontSize: {
      //   h1: ["3rem", { lineHeight: "1.2" }], // Equivalent to 48px
      //   h2: ["2.5rem", { lineHeight: "1.3" }], // Equivalent to 40px
      //   h3: ["2rem", { lineHeight: "1.4" }], // Equivalent to 32px
      //   p: ["1.125rem", { lineHeight: "1.6" }], // Equivalent to 18px
      // },
      borderWidth: {
        DEFAULT: "1px",
        0: "0",
        2: "2px",
        3: "3px",
        4: "4px",
        6: "6px",
        8: "8px",
      },
      borderRadius: {
        def: "30px",
      },
      minHeight: {
        ...defaultTheme.height,
      },
      minWidth: {
        ...defaultTheme.width,
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
}
