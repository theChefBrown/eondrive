/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ev-primary': '#00d4ff',
        'ev-secondary': '#8b5cf6',
        'ev-accent': '#10b981',
        'ev-danger': '#ef4444',
        'ev-bg': '#030508',
        'ev-surface': '#0a0e1a',
        'ev-card': 'rgba(10, 20, 50, 0.6)',
        'ev-border': 'rgba(0, 212, 255, 0.15)',
      },
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
        'gradient-card': 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(139,92,246,0.08))',
        'gradient-radial-primary': 'radial-gradient(ellipse, rgba(0,212,255,0.15), transparent 70%)',
        'gradient-radial-secondary': 'radial-gradient(ellipse, rgba(139,92,246,0.15), transparent 70%)',
      },
      animation: {
        'gradient-x': 'gradient-x 12s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { 'box-shadow': '0 0 5px rgba(0, 212, 255, 0.4)' },
          '50%': { 'box-shadow': '0 0 25px rgba(0, 212, 255, 0.8), 0 0 50px rgba(0, 212, 255, 0.3)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'shimmer': {
          '0%': { 'background-position': '-1000px 0' },
          '100%': { 'background-position': '1000px 0' },
        },
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(0, 212, 255, 0.4), 0 0 40px rgba(0, 212, 255, 0.15)',
        'glow-secondary': '0 0 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.15)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 212, 255, 0.08)',
        'card-hover': '0 8px 40px rgba(0, 212, 255, 0.15), 0 0 0 1px rgba(0, 212, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
