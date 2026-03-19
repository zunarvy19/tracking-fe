/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FFFDF5", // Warm Cream/Off-White
        foreground: "#1E293B", // Slate 800
        muted: "#F1F5F9", // Slate 100
        mutedForeground: "#64748B", // Slate 500
        accent: "#8B5CF6", // Vivid Violet
        accentForeground: "#FFFFFF", // White
        secondary: "#F472B6", // Hot Pink
        tertiary: "#FBBF24", // Amber/Yellow
        quaternary: "#34D399", // Emerald/Mint
        border: "#E2E8F0", // Slate 200
        input: "#FFFFFF",
        card: "#FFFFFF",
        ring: "#8B5CF6",
        
        // Aliased Legacy Colors for gradual refactor
        primary: "#8B5CF6",
        "primary-content": "#ffffff",
        "primary-hover": "#7c3aed",
        "background-light": "#FFFDF5",
        "background-dark": "#1E293B",
        "surface-light": "#ffffff",
        "surface-dark": "#334155",
        "border-light": "#1E293B", // Force chunky borders on legacy classes
        "border-dark": "#1E293B",
        "text-primary-light": "#1E293B",
        "text-secondary-light": "#64748b",
        "text-primary-dark": "#f8fafc",
        "text-secondary-dark": "#94a3b8",
        success: "#34D399",
        danger: "#ef4444",
      },
      fontFamily: {
        display: ['"Outfit"', "system-ui", "sans-serif"],
        body: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "24px",
        "2xl": "32px",
        full: "9999px",
      },
      borderWidth: {
        DEFAULT: '2px', // Chunky borders by default
      },
      boxShadow: {
        solid: '4px 4px 0px 0px #1E293B',
        'solid-hover': '6px 6px 0px 0px #1E293B',
        'solid-active': '2px 2px 0px 0px #1E293B',
        'solid-sm': '2px 2px 0px 0px #1E293B',
        'solid-soft': '8px 8px 0px 0px #E2E8F0',
        'solid-pink': '8px 8px 0px 0px #F472B6',
      },
      transitionTimingFunction: {
        'bounce-pop': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
  ],
};
