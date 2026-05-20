import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        verdict: {
          safe: '#22c55e',
          suspicious: '#f59e0b',
          dangerous: '#ef4444',
        },
        asm: {
          register: '#60a5fa',
          mnemonic: '#f472b6',
          immediate: '#4ade80',
          address: '#a78bfa',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
