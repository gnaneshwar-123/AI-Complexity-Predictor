/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#06090e',
          900: '#090d16',
          850: '#0e1422',
          800: '#131b2e',
          750: '#1a233a',
          700: '#1e293b',
          600: '#334155',
        },
        brand: {
          cyan: '#38bdf8',
          blue: '#3b82f6',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          purple: '#a855f7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
