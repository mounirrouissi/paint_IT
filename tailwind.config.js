const tailwindScrollbar = require('tailwind-scrollbar')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      animation: {
        'pulse-fast': 'pulse 0.7s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        primary: '#ffe500',
        secondary: '#005aff',
        third: '#ffe500',
        
      },
    },
  },
  variants: {},
  plugins: [tailwindScrollbar,    require('tailwind-scrollbar')
],
}
