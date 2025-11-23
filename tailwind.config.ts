import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design system colors from image - exact matches
        black: '#1c1b1b',
        'dark-gray': '#474545',
        'light-gray': '#f3f3f3',
        // Primary color scale based on design
        primary: {
          50: '#f3f3f3',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#b9b9b9',
          400: '#a2a2a2',
          500: '#474545',
          600: '#3a3838',
          700: '#2d2b2b',
          800: '#1c1b1b',
          900: '#0f0e0e',
        },
        secondary: {
          50: '#f3f3f3',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#b9b9b9',
          400: '#a2a2a2',
          500: '#474545',
          600: '#3a3838',
          700: '#2d2b2b',
          800: '#1c1b1b',
          900: '#0f0e0e',
        },
        // Gray scale for compatibility
        gray: {
          50: '#f3f3f3',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#b9b9b9',
          400: '#a2a2a2',
          500: '#474545',
          600: '#3a3838',
          700: '#2d2b2b',
          800: '#1c1b1b',
          900: '#0f0e0e',
        },
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-in-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config

