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
        sans: ['"Geist"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        display: ['"Geist"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        noir: {
          950: '#050505',
          900: '#0A0A0A',
          850: '#101010',
          800: '#141414',
          700: '#1D1D1D',
          600: '#272727',
        },
        mono: {
          white: '#FFFFFF',
          silver: '#D4D4D4',
          muted: '#969690',
        },
        pulse: {
          accent: '#FFFFFF',
          live: '#FFFFFF',
          green: '#FFFFFF',
          warning: '#D4D4D4',
          error: '#EF4444',
        },
      },
      maxWidth: {
        '8xl': '88rem',
      },
      transitionTimingFunction: {
        weighted: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'fade-up': 'fadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fadeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'loading-bar': 'loadingBar 1.1s cubic-bezier(0.65, 0, 0.35, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        loadingBar: {
          '0%': { transform: 'translateX(-200%)' },
          '100%': { transform: 'translateX(200%)' },
        },
      },
    },
  },
  plugins: [],
}
