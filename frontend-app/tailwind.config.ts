import type {Config} from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      backgroundImage: {
        products: "url('/images/BGProducts.webp')",
        bgprofile : "url('/images/bg-profile.jpg')",
        bgNofound: "url('/images/BG001.webp')",
      }
    }
  },
  plugins: []
}
export default config