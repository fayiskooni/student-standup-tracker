import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mentrex: {
          DEFAULT: "rgba(124, 58, 237, 0.15)",
          bg: "#0a0a14",
          card: "#13131f",
          elevated: "#1a1a2e",
          primary: "#7c3aed",
          "primary-hover": "#6d28d9",
          "text-primary": "#ffffff",
          "text-secondary": "#94a3b8",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },

      borderRadius: {
        card: "12px",
        input: "8px",
        pill: "999px",
      },
      boxShadow: {
        mentrex: "0 4px 24px rgba(124, 58, 237, 0.08)",
        "mentrex-lg": "0 8px 40px rgba(124, 58, 237, 0.15)",
        "mentrex-glow": "0 0 20px rgba(124, 58, 237, 0.3)",
      },
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "purple-gradient": "linear-gradient(135deg, #1a0533 0%, #0a0a14 100%)",
        "card-gradient": "linear-gradient(180deg, #1a1a2e 0%, #13131f 100%)",
      },
      animation: {
        "slide-in": "slideIn 0.3s ease-out",
        "slide-out": "slideOut 0.3s ease-in",
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-up": "fadeUp 0.4s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "toast-in": "toastIn 0.4s ease-out",
        "toast-out": "toastOut 0.3s ease-in forwards",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideOut: {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        toastIn: {
          "0%": { transform: "translateX(100%) scale(0.95)", opacity: "0" },
          "100%": { transform: "translateX(0) scale(1)", opacity: "1" },
        },
        toastOut: {
          "0%": { transform: "translateX(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateX(100%) scale(0.95)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
