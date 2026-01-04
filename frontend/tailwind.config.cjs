/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px color-mix(in oklab, var(--primary) 40%, transparent), 0 0 30px color-mix(in oklab, var(--primary) 18%, transparent)",
      },
    },
  },
  plugins: [],
};
