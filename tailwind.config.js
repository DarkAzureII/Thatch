/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1a365d',
        gold: '#f8c822',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
  // Tailwind v4 specific options
  future: {
    // Any future features you want to opt into
  },
  experimental: {
    // Any experimental features you want to enable
  },
}