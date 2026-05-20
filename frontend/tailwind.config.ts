import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono:  ['JetBrains Mono', 'ui-monospace', 'monospace'],
        serif: ['Source Serif 4', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        verdict: {
          safe:       '#5a7855',
          suspicious: '#c08e34',
          dangerous:  '#8b2c2c',
        },
        asm: {
          register:  '#7da3d4',
          mnemonic:  '#d97aa0',
          immediate: '#88b09a',
          address:   '#a98ed4',
          comment:   '#586675',
          label:     '#88a496',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
