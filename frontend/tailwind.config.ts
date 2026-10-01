import type { Config } from 'tailwindcss';

// Tokeny stylu (ciemny motyw). Odpowiadają zmiennym CSS w src/index.css.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0D10',
        panel: '#13161B',
        border: '#232832',
        surface: '#1A1E25',
        text: {
          DEFAULT: '#E8EAED',
          muted: '#9AA3AE',
          faint: '#5F6873',
        },
        lamp: '#FFD9A0',
        accent: '#F5A524',
        data: {
          text: '#4ADE80',
          bytes: '#60A5FA',
          bits: '#A78BFA',
          instructions: '#F472B6',
        },
        state: {
          success: '#4ADE80',
          warning: '#FBBF24',
          error: '#F87171',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        ui: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
