import type { Config } from 'tailwindcss';

// Design system (ciemny motyw) wyciągnięty z Figmy — sekcja "design system".
// Lustrzane odbicie zmiennych CSS w src/index.css. Używajcie tokenów
// semantycznych (bg, surface, border, text, accent, state), nie surowych hexów.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- Tła / powierzchnie (od najciemniejszej do najjaśniejszej) ---
        bg: '#0B0D10', // app background (azure/5, Woodsmoke)
        bg2: '#0F1216', // głębsza warstwa (azure/7)
        panel: '#13161B', // panel (azure/9, Woodsmoke)
        surface: {
          DEFAULT: '#1A1E25', // karta/pole (azure/12, Shark)
          raised: '#222731', // uniesiona karta (azure/16)
          overlay: '#262C35', // overlay/hover (azure/18, Charade)
        },

        // --- Obramowania ---
        border: {
          DEFAULT: '#232832', // linia (azure/17, Ebony Clay)
          subtle: '#2A2F37', // delikatna (azure/19)
          strong: '#343B47', // mocna (azure/24, Bright Gray)
        },

        // --- Tekst ---
        text: {
          DEFAULT: '#E8EAED', // podstawowy (grey/92, Athens Gray)
          bright: '#F5F4EF', // najjaśniejszy (grey/95, Pampas)
          soft: '#C9CED6', // przygaszony (azure/81, Ghost)
          muted: '#9AA3AE', // drugorzędny (azure/64, Gray Chateau)
          dim: '#7A8490', // słaby (grey/52, Raven)
          faint: '#5F6873', // najsłabszy (grey/41, Shuttle Gray)
        },

        // --- Akcent (pomarańcz) ---
        accent: {
          DEFAULT: '#F5A524', // główny (orange/55, Buttercup)
          hover: '#D98E14', // hover/active (orange/46, Golden Bell)
          bright: '#FFB547', // jaśniejszy (orange/64, Yellow Orange)
          tint: '#FFD9A0', // jasny tint (orange/81, Cream Brulee)
          soft: '#FFE7C2', // b. jasny (orange/88, Tequila)
          subtle: '#17110A', // ciemne tło akcentu (orange/6, Eternity)
        },
        lamp: '#FFD9A0', // światło "lampy" w tle (orange/81)

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
        pill: '999px',
      },
    },
  },
  plugins: [],
} satisfies Config;
