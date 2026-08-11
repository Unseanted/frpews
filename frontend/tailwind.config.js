/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        heading: ["var(--font-heading)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        river: {
          50: "#f0f9fa",
          100: "#dcf2f5",
          200: "#bce4ea",
          300: "#8ecfdb",
          400: "#57b2c5",
          500: "#3495aa",
          600: "#1C5D6B",
          700: "#184f5c",
          800: "#18424d",
          900: "#0E3A44",
          950: "#08242c",
        },
        risk: {
          low: "var(--risk-low)",
          moderate: "var(--risk-moderate)",
          high: "var(--risk-high)",
          extreme: "var(--risk-extreme)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 0 24px -4px oklch(0.46 0.09 205 / 0.25)",
        card: "0 1px 2px oklch(0.22 0.035 205 / 0.04), 0 4px 16px oklch(0.22 0.035 205 / 0.06)",
        cardHover: "0 8px 30px -8px oklch(0.46 0.09 205 / 0.18), 0 4px 12px -4px oklch(0.22 0.035 205 / 0.08)",
      },
    },
  },
  plugins: [],
};
