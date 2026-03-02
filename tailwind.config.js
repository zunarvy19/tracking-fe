/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        "primary-content": "#eff6ff",
        "primary-hover": "#1d4ed8",
        "background-light": "#f8fafc",
        "background-dark": "#0f172a",
        "surface-light": "#ffffff",
        "surface-dark": "#1e293b",
        "border-light": "#e2e8f0",
        "border-dark": "#334155",
        "text-primary-light": "#0f172a",
        "text-secondary-light": "#64748b",
        "text-primary-dark": "#f1f5f9",
        "text-secondary-dark": "#94a3b8",
        success: "#10b981",
        danger: "#ef4444",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
  ],
};
