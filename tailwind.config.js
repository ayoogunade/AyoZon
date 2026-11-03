/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        ink: token('ink'),
        muted: token('muted'),
        accent: token('accent'),
        'accent-ink': token('accent-ink'),
        field: token('field'),
        'field-ink': token('field-ink'),
        danger: token('danger'),
        line: token('line'),
      },
      fontFamily: {
        display: ['Imbue', 'Georgia', 'serif'],
        sans: ['"Albert Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        small: ['var(--step-small)', { lineHeight: '1.5' }],
        body: ['var(--step-body)', { lineHeight: '1.55' }],
        lead: ['var(--step-lead)', { lineHeight: '1.4' }],
        head: ['var(--step-head)', { lineHeight: '0.95', letterSpacing: '-0.01em' }],
        display: ['var(--step-display)', { lineHeight: '0.9', letterSpacing: '-0.01em' }],
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
