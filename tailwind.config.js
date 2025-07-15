/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      screens: {
        "xs": "475px",
      },
      colors: {
        "atzicay-bg": "#f8f9fa",
        "atzicay-bg-button": "#8b5cf6",
        "atzicay-purple-500": "#8b5cf6",
        "atzicay-purple-600": "#7c3aed",
        "atzicay-heading": "#1f2937",
        "atzicay-subheading": "#6b7280",
        "atzicay-border": "#e5e7eb",
      },
    },
  },
  plugins: [],
}
