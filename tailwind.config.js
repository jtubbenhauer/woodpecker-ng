/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#a21caf",
          secondary: "#4338ca",
          accent: "#0284c7",
          neutral: "#4b5563",
          "base-100": "#1f2937",
          info: "#53C0F3",
          success: "#22c55e",
          warning: "#F3CC30",
          error: "#dc2626",
        },
      },
    ],
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
