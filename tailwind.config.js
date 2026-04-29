/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fdfbf7',
          100: '#f9f5ed',
          200: '#f2e8d5',
          300: '#e9d5b6',
          400: '#dfb88a',
          500: '#d49a63',
          600: '#c47d48',
          700: '#a35f38',
          800: '#834a31',
          900: '#6a3b2a',
        },
        cozy: {
          bg: '#faf9f6',
          card: '#ffffff',
          text: '#333333',
          muted: '#6b7280',
          border: '#e5e7eb',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'cozy': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'cozy-hover': '0 6px 16px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
