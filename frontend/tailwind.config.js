/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Consolas", "monospace"],
      },
      colors: {
        /* Semantic tokens resolve through the CSS variables defined in
           src/styles/theme.css, so every utility follows the active theme. */
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        success: {
          DEFAULT: "var(--success)",
          text: "var(--success-text)",
          soft: "var(--success-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          text: "var(--warning-text)",
          soft: "var(--warning-soft)",
        },
        error: {
          DEFAULT: "var(--error)",
          text: "var(--error-text)",
          soft: "var(--error-soft)",
        },
        info: {
          DEFAULT: "var(--info)",
          text: "var(--info-text)",
          soft: "var(--info-soft)",
        },
        live: {
          DEFAULT: "var(--live)",
          soft: "var(--live-soft)",
        },
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)",
          grid: "var(--chart-grid)",
          axis: "var(--chart-axis)",
        },
        sidebar: "var(--sidebar-bg)",
        header: "var(--header-bg)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-control)",
        md: "var(--radius-control)",
        lg: "var(--radius-card)",
        xl: "var(--radius-card)",
        "2xl": "var(--radius-card)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        key: "var(--shadow-key)",
      },
      fontSize: {
        "2xs": ["11px", "1.45"],
        xs: ["12px", "1.5"],
        sm: ["13px", "1.5"],
        base: ["14px", "1.55"],
        md: ["15px", "1.55"],
        lg: ["16px", "1.4"],
        xl: ["18px", "1.35"],
        "2xl": ["20px", "1.3"],
        "3xl": ["24px", "1.25"],
        "4xl": ["30px", "1.2"],
        "5xl": ["40px", "1.15"],
        "6xl": ["52px", "1.1"],
      },
      spacing: {
        sidebar: "var(--sidebar-width)",
        rail: "var(--sidebar-rail)",
        header: "var(--header-height)",
        tap: "var(--tap)",
      },
      maxWidth: {
        content: "var(--content-max)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
        in: "cubic-bezier(0.7, 0, 0.84, 0)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        "fade-in": "fade-in var(--duration) var(--ease-out) both",
        "slide-up": "slide-up var(--duration-slow) var(--ease-out) both",
        shimmer: "shimmer 1.5s infinite linear",
      },
    },
  },
  plugins: [],
};