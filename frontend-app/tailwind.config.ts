import type {Config} from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6363',
        secondary: {
          100: '#E2E2D5',
          200: '#888883'
        },
        accent: '#FFA500'
      },

      animation: {
        fadeIn: 'fadeIn 3s ease-in-out forwards',
        slideIn: 'slideIn 5s ease-in-out infinite',
        pulseBackground: 'pulseBackground 10s ease-in-out infinite'
      },

      keyframes: {
        fadeIn: {
          '0%': {opacity: '0'},
          '100%': {opacity: '1'}
        },
        slideIn: {
          '0%': {transform: 'translateX(-100%)'},
          '100%': {transform: 'translateX(100%)'}
        },
        pulseBackground: {
          '0%, 100%': {backgroundSize: '100% 100%'},
          '50%': {backgroundSize: '120% 120%'}
        }
      },

      backgroundImage: {
        'auth-pattern': "url('/images/BG001.webp')",
        products: "url('/images/BGProducts.webp')",
        bgprofile: "url('/images/bg-profile.jpg')",
        bgNofound: "url('/images/BG001.webp')"
      }
    }
  },
  plugins: []
}
export default config
