/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'pulse-tailwind': {
          '50%': { opacity: 0.5 },
        },
      },
      animation: {
        'pulse-tailwind':
          'pulse-tailwind 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
