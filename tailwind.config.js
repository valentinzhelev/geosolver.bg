/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        mono: ['source-code-pro', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      backgroundColor: {
        'dark': '#09090b',
        'dark-elevated': '#18181b',
        'dark-card': '#27272a',
        'dark-input': '#3f3f46',
      },
      keyframes: {
        'gai-fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gai-pop': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'gai-draw': {
          '0%': { 'stroke-dashoffset': '1' },
          '100%': { 'stroke-dashoffset': '0' },
        },
        'gai-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'gai-card-in': {
          '0%': { opacity: '0', transform: 'perspective(900px) rotateY(8deg) translateX(var(--gai-in-x, 16px)) scale(0.94)' },
          '100%': { opacity: '1', transform: 'perspective(900px) rotateY(0deg) translateX(0) scale(1)' },
        },
        'gai-node-pulse': {
          '0%': { transform: 'scale(0.8)', opacity: '0.9' },
          '70%': { transform: 'scale(2.4)', opacity: '0' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
      },
      animation: {
        'gai-fade-up': 'gai-fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'gai-pop': 'gai-pop 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'gai-draw': 'gai-draw 0.9s cubic-bezier(0.65, 0, 0.35, 1) forwards',
        'gai-float': 'gai-float 6s ease-in-out infinite',
        'gai-card-in': 'gai-card-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'gai-node-pulse': 'gai-node-pulse 2.4s ease-out infinite',
      },
      colors: {
        black: "#000000",
        gray: {
          50: "#F9F9F9",
          100: "#F3F4F6",
          200: "#EDEDED",
          300: "#D1D5DB",
          400: "#999999",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        stone: {
          50: "#F9F9F9",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        white: "#FFFFFF",
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
      }
    },
  },
  plugins: [],
}

