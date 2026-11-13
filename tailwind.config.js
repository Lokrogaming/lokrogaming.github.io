/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: '#7fe3b4',
        'accent-dim': 'rgba(127, 227, 180, 0.14)',
        warn: '#e3b97f',
        gold: '#d9b876',
      },
      animation: {
        'pulse-dot': 'pulse-dot 2.6s ease-in-out infinite',
        'drift1': 'drift1 22s ease-in-out infinite',
        'drift2': 'drift2 28s ease-in-out infinite',
        'bd-float': 'bd-float 8s linear infinite',
        'bd-glow-move': 'bd-glow-move 10s ease-in-out infinite',
        'atmosphere-fall': 'atmosphere-fall var(--fall-duration, 12s) linear infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.45' },
        },
        drift1: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(40px, -30px)' },
        },
        drift2: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-50px, 30px)' },
        },
        'bd-float': {
          '0%': { transform: 'translate3d(0, 20px, 0) scale(.7) rotate(0deg)', opacity: '0' },
          '12%': { opacity: '.9' },
          '50%': { transform: 'translate3d(18px, -45%, 0) scale(1) rotate(120deg)', opacity: '.75' },
          '85%': { opacity: '.55' },
          '100%': { transform: 'translate3d(-20px, -115%, 0) scale(.55) rotate(260deg)', opacity: '0' },
        },
        'bd-glow-move': {
          '0%, 100%': { transform: 'translate(-8%, -6%) scale(1)' },
          '50%': { transform: 'translate(10%, 8%) scale(1.08)' },
        },
        'atmosphere-fall': {
          to: { transform: 'translate3d(6vw, 115vh, 0) rotate(300deg)' },
        },
      },
      borderRadius: {
        chamfer: '1.25rem',
        'chamfer-sm': '.8rem',
        'chamfer-lg': '1.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
