import type { Config } from "tailwindcss"

export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {fontFamily: {
        comfortaa: ["Comfortaa", "sans-serif"],
        raleway: ["Raleway", "sans-serif"],
        oswald: ["Oswald", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        grotesk: ["Grotesk", "sans-serif"],
        inter: ["Inter", "sans-serif"]
      },}
  }
} satisfies Config
