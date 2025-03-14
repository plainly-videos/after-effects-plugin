/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
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
        primary: 'rgba(var(--color-bg-primary), 1)',
        secondary: 'rgba(var(--color-bg-secondary), 1)',
      },
      fontSize: {
        xs: '0.7rem',
        sm: '0.8rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
