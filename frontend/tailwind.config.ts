import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      /* ── Colores accesibles para daltonismo deuteranopia/protanopia ───
       *  success → cyan   (#22D3EE)  — nunca confundible con error
       *  error   → magenta (#F472B6) — no depende del canal verde
       *  warning → ámbar  (#FBBF24) — visible para todos los tipos
       *  info    → azul   (#60A5FA)
       *  primary → naranja (#E8590C) — acento de marca
       * ────────────────────────────────────────────────────────────── */
      colors: {
        background:          '#0F0F0F',
        foreground:          '#F0EBE0',
        card:                '#1C1C1C',
        'card-foreground':   '#F0EBE0',
        muted:               '#252525',
        'muted-foreground':  '#A8A8A8',
        border:              '#383838',
        primary:             '#E8590C',
        'primary-foreground':'#FFFFFF',
        secondary:           '#2A2A2A',
        'sidebar-bg':        '#141414',
        'header-bg':         '#141414',
        /* accesibles */
        success:             '#22D3EE',
        'success-bg':        '#042A30',
        warning:             '#FBBF24',
        'warning-bg':        '#2C1F04',
        error:               '#F472B6',
        'error-bg':          '#2A0A1A',
        info:                '#60A5FA',
        'info-bg':           '#0A1628',
      },

      /* ── Fuentes escaladas para baja visión ───────────────────────
       *  Cada tamaño sube ~2px respecto al default de Tailwind.
       *  xs: 13 → sm: 15 → base: 17 → lg: 19 → xl: 21
       *  Esto afecta a TODOS los componentes sin cambiar código.
       * ────────────────────────────────────────────────────────────── */
      fontSize: {
        xs:   ['0.8125rem', { lineHeight: '1.25rem' }],   /* 13px */
        sm:   ['0.9375rem', { lineHeight: '1.5rem'  }],   /* 15px */
        base: ['1.0625rem', { lineHeight: '1.75rem' }],   /* 17px */
        lg:   ['1.1875rem', { lineHeight: '1.875rem'}],   /* 19px */
        xl:   ['1.3125rem', { lineHeight: '2rem'    }],   /* 21px */
        '2xl':['1.5625rem', { lineHeight: '2.25rem' }],   /* 25px */
        '3xl':['1.875rem',  { lineHeight: '2.5rem'  }],   /* 30px */
        '4xl':['2.25rem',   { lineHeight: '3rem'    }],   /* 36px */
      },

      borderRadius: {
        s:    '4px',
        m:    '8px',
        l:    '12px',
        pill: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
