/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      animation: {
        'twinkle': 'twinkle var(--duration, 4s) ease-in-out infinite',
        'meteor': 'meteor-path var(--duration, 8s) linear infinite',
        'nebula': 'nebula-pulse 20s ease-in-out infinite',
        'oceanic-grid': 'oceanic-grid 6s linear infinite',
        'grid-pulse': 'grid-pulse 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
