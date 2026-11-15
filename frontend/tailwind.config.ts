import type { Config } from 'tailwindcss';

// Design system "PCB": graphite neutrals, dark green-gray accent (circuit board),
// cold white lamp light. Mirrored as CSS variables in src/index.css and as plain
// values for three.js in src/theme.ts. Use semantic tokens, never raw hex.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- Backgrounds / surfaces (darkest → lightest) ---
        bg: '#09090B', // app background
        bg2: '#0E0E11', // deeper layer
        panel: '#131316', // panels
        surface: {
          DEFAULT: '#1A1A1F', // cards, inputs
          raised: '#222228', // raised cards
          overlay: '#2A2A31', // hover, overlays
        },

        // --- Borders ---
        border: {
          DEFAULT: '#26262C', // lines
          subtle: '#2E2E35', // soft lines
          strong: '#3B3B44', // strong lines
        },

        // --- Text ---
        text: {
          DEFAULT: '#ECECEF', // body
          bright: '#FAFAFA', // headings
          soft: '#CFCFD6', // softer
          muted: '#A1A1AA', // secondary
          dim: '#81818B', // weak
          faint: '#63636D', // faintest
        },

        // --- Accent: PCB green ---
        accent: {
          DEFAULT: '#26392F', // fills: buttons, active states
          hover: '#1E2E26', // pressed
          bright: '#33493D', // hover fill
          ink: '#7FA592', // accent as text, icons, borders
          on: '#F2F7F4', // text on accent fills
          subtle: '#0B1A13', // dark accent background
        },

        // --- Lamp light (cold white) ---
        lamp: {
          DEFAULT: '#C9DAF2', // light, glow
          soft: '#E6EEF8', // bulb, brightest glow
        },

        // --- Dane w symulacji (kolory kategorii) ---
        data: {
          text: '#4ADE80', // tekst/znaki (spring green/58, Shamrock)
          bytes: '#60A5FA', // bajty (azure/68, Malibu)
          bits: '#A78BFA', // bity (violet/76, Heliotrope)
          instructions: '#F472B6', // instrukcje (rose/70, Persian Pink)
        },

        // --- Stany ---
        state: {
          success: '#4ADE80', // (Shamrock)
          info: '#60A5FA', // (Malibu)
          warning: '#FBBF24', // (Lightning Yellow)
          error: '#F87171', // (Froly)
          'error-strong': '#FF4D4D', // (red/65)
        },
      },

      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'], // nagłówki / display
        ui: ['Inter', 'sans-serif'], // tekst / UI
        mono: ['"JetBrains Mono"', 'monospace'], // kod / bajty
      },

      // Skala typografii z Figmy (rozmiar + domyślny line-height).
      fontSize: {
        code: ['12px', { lineHeight: '18px' }],
        sm: ['14px', { lineHeight: '18px' }],
        base: ['16px', { lineHeight: '21px' }],
        md: ['18px', { lineHeight: '27px' }],
        lg: ['20px', { lineHeight: '30px' }],
        xl: ['24px', { lineHeight: '30px' }],
        '2xl': ['30px', { lineHeight: '38px' }],
        h2: ['48px', { lineHeight: '50px' }],
        h1: ['56px', { lineHeight: '60px' }],
        display: ['88px', { lineHeight: '92px' }],
      },

      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
      },

      letterSpacing: {
        upper: '0.84px', // wersaliki (Inter/Medium upper)
        wide2: '1.12px',
      },

      borderRadius: {
        sm: '3px',
        DEFAULT: '4px',
        md: '7px',
        lg: '15px',
        xl: '22px', // glass containers (top bar, panels)
        pill: '999px',
      },

      boxShadow: {
        edge: 'inset 0 1px 0 rgb(255 255 255 / 0.1)', // light top edge on accent fills
      },
    },
  },
  plugins: [],
} satisfies Config;
