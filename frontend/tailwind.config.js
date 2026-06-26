/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {

      // ─── SVARAVERSE COLOR SYSTEM ───────────────────────────────────────────
      colors: {
        // Primary warm palette
        cream: {
          50:  '#FDFAF4',
          100: '#FAF5E8',
          200: '#F5EDD3',
          300: '#EDE0B8',
          400: '#E3CE96',
          500: '#D6B96E',
          DEFAULT: '#FAF5E8',
        },
        sand: {
          50:  '#FBF8F1',
          100: '#F5EDD8',
          200: '#EBD9B0',
          300: '#DEC282',
          400: '#CFA855',
          500: '#B8902E',
          600: '#9A7520',
          DEFAULT: '#EBD9B0',
        },
        beige: {
          50:  '#FEFCF8',
          100: '#FDF8EE',
          200: '#F9EFD9',
          300: '#F3E2BC',
          400: '#EBD097',
          500: '#E0BA6A',
          DEFAULT: '#F9EFD9',
        },
        brown: {
          50:  '#F7F0E8',
          100: '#ECDDC8',
          200: '#D9BB96',
          300: '#C29566',
          400: '#A97340',
          500: '#8B5A2B',
          600: '#6F4420',
          700: '#543015',
          800: '#3A1F0C',
          900: '#221108',
          DEFAULT: '#8B5A2B',
        },
        walnut: {
          50:  '#F2EAE2',
          100: '#E0CDB8',
          200: '#C8A888',
          300: '#AD835A',
          400: '#8F6335',
          500: '#6E4818',
          600: '#573A12',
          700: '#402B0D',
          800: '#2A1D08',
          900: '#160E03',
          DEFAULT: '#6E4818',
        },
        gold: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          DEFAULT: '#F59E0B',
          light: '#FDE68A',
          dark:  '#B45309',
        },
        coffee: {
          100: '#E8D5C4',
          200: '#C9A882',
          300: '#A97C52',
          400: '#7D5430',
          500: '#4E3320',
          600: '#3A2518',
          700: '#271810',
          DEFAULT: '#4E3320',
        },

        // Semantic tokens
        primary: {
          DEFAULT: '#B45309',   // gold-700 — main CTA
          hover:   '#92400E',
          light:   '#FDE68A',
          dark:    '#78350F',
        },
        surface: {
          DEFAULT: '#FAF5E8',   // cream base
          raised:  '#FDFAF4',
          sunken:  '#F5EDD3',
          overlay: 'rgba(250,245,232,0.85)',
        },
        border: {
          DEFAULT: '#EBD9B0',
          subtle:  '#F3E2BC',
          strong:  '#CFA855',
        },
        text: {
          primary:   '#2A1D08',
          secondary: '#6E4818',
          muted:     '#A97C52',
          inverse:   '#FDFAF4',
          gold:      '#B45309',
        },

        // Status colors (warm-tinted)
        success: {
          DEFAULT: '#4A7C59',
          light:   '#D1FAE5',
          dark:    '#065F46',
        },
        warning: {
          DEFAULT: '#D97706',
          light:   '#FEF3C7',
          dark:    '#92400E',
        },
        error: {
          DEFAULT: '#B91C1C',
          light:   '#FEE2E2',
          dark:    '#7F1D1D',
        },
        info: {
          DEFAULT: '#1D4ED8',
          light:   '#DBEAFE',
          dark:    '#1E3A8A',
        },
      },

      // ─── TYPOGRAPHY ────────────────────────────────────────────────────────
      fontFamily: {
        // Display: Indian-classical-inspired serif
        display: ['Playfair Display', 'Noto Serif Devanagari', 'Georgia', 'serif'],
        // Body: Clean humanist sans
        body:    ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        // UI / data
        ui:      ['DM Sans', 'Inter', 'sans-serif'],
        // Monospace
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
        // Hindi / Devanagari support
        hindi:   ['Noto Sans Devanagari', 'Hind', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs:    ['0.75rem',  { lineHeight: '1rem' }],
        sm:    ['0.875rem', { lineHeight: '1.25rem' }],
        base:  ['1rem',     { lineHeight: '1.5rem' }],
        lg:    ['1.125rem', { lineHeight: '1.75rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.75rem', letterSpacing: '-0.02em' }],
        '5xl': ['3rem',     { lineHeight: '3.5rem',  letterSpacing: '-0.02em' }],
        '6xl': ['3.75rem',  { lineHeight: '4.25rem', letterSpacing: '-0.03em' }],
        '7xl': ['4.5rem',   { lineHeight: '5rem',    letterSpacing: '-0.04em' }],
        '8xl': ['6rem',     { lineHeight: '6.5rem',  letterSpacing: '-0.04em' }],
        '9xl': ['8rem',     { lineHeight: '8.5rem',  letterSpacing: '-0.05em' }],
      },

      // ─── SPACING ───────────────────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '26':  '6.5rem',
        '30':  '7.5rem',
        '34':  '8.5rem',
        '68':  '17rem',
        '76':  '19rem',
        '84':  '21rem',
        '88':  '22rem',
        '92':  '23rem',
        '100': '25rem',
        '112': '28rem',
        '120': '30rem',
        '128': '32rem',
        '144': '36rem',
      },

      // ─── BORDER RADIUS ─────────────────────────────────────────────────────
      borderRadius: {
        'xs':   '0.25rem',
        'sm':   '0.375rem',
        DEFAULT:'0.5rem',
        'md':   '0.625rem',
        'lg':   '0.75rem',
        'xl':   '1rem',
        '2xl':  '1.25rem',
        '3xl':  '1.5rem',
        '4xl':  '2rem',
        '5xl':  '2.5rem',
        'full': '9999px',
      },

      // ─── SHADOWS ───────────────────────────────────────────────────────────
      boxShadow: {
        'xs':      '0 1px 2px 0 rgba(110,72,24,0.05)',
        'sm':      '0 1px 3px 0 rgba(110,72,24,0.1), 0 1px 2px -1px rgba(110,72,24,0.06)',
        DEFAULT:   '0 4px 6px -1px rgba(110,72,24,0.1), 0 2px 4px -2px rgba(110,72,24,0.06)',
        'md':      '0 4px 6px -1px rgba(110,72,24,0.1), 0 2px 4px -2px rgba(110,72,24,0.06)',
        'lg':      '0 10px 15px -3px rgba(110,72,24,0.1), 0 4px 6px -4px rgba(110,72,24,0.05)',
        'xl':      '0 20px 25px -5px rgba(110,72,24,0.1), 0 8px 10px -6px rgba(110,72,24,0.04)',
        '2xl':     '0 25px 50px -12px rgba(110,72,24,0.18)',
        '3xl':     '0 35px 60px -15px rgba(110,72,24,0.25)',
        'gold':    '0 0 0 3px rgba(245,158,11,0.35)',
        'gold-lg': '0 8px 32px rgba(180,83,9,0.25)',
        'warm':    '0 4px 24px rgba(139,90,43,0.15)',
        'warm-lg': '0 12px 40px rgba(139,90,43,0.2)',
        'glass':   '0 8px 32px rgba(110,72,24,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        'glow':    '0 0 20px rgba(245,158,11,0.4)',
        'inner-warm': 'inset 0 2px 4px rgba(110,72,24,0.08)',
        'none':    'none',
      },

      // ─── BACKGROUNDS & GRADIENTS ───────────────────────────────────────────
      backgroundImage: {
        // Hero gradients
        'gradient-hero':     'linear-gradient(135deg, #FDFAF4 0%, #F9EFD9 40%, #EBD9B0 100%)',
        'gradient-warm':     'linear-gradient(180deg, #FAF5E8 0%, #F5EDD3 100%)',
        'gradient-gold':     'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
        'gradient-walnut':   'linear-gradient(135deg, #6E4818 0%, #3A2518 100%)',
        'gradient-sunset':   'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #B45309 100%)',
        'gradient-premium':  'linear-gradient(135deg, #2A1D08 0%, #6E4818 50%, #B45309 100%)',
        'gradient-glass':    'linear-gradient(135deg, rgba(253,250,244,0.8) 0%, rgba(245,237,211,0.6) 100%)',
        'gradient-card':     'linear-gradient(145deg, rgba(253,250,244,0.9) 0%, rgba(235,217,176,0.4) 100%)',
        'gradient-sidebar':  'linear-gradient(180deg, #2A1D08 0%, #3A2518 40%, #4E3320 100%)',
        'gradient-radial':   'radial-gradient(ellipse at center, #FDE68A 0%, #F59E0B 50%, #B45309 100%)',

        // Texture overlays (CSS patterns simulating tanpura strings)
        'texture-strings':
          'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(180,83,9,0.03) 40px, rgba(180,83,9,0.03) 41px)',
        'texture-tabla':
          'radial-gradient(circle at 20% 50%, rgba(245,158,11,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(180,83,9,0.05) 0%, transparent 50%)',
        'texture-wave':
          'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23B45309\' fill-opacity=\'0.04\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      },

      // ─── ANIMATIONS ────────────────────────────────────────────────────────
      keyframes: {
        // Fade
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          '0%':   { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-left': {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-right': {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },

        // Scale
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'scale-up': {
          '0%':   { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },

        // Float (ambient hero animation)
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%':      { transform: 'translateY(-8px) rotate(2deg)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(-8px)' },
          '50%':      { transform: 'translateY(4px)' },
        },

        // Pulse glow
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245,158,11,0)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(245,158,11,0.2)' },
        },
        'glow-ring': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(245,158,11,0.3)' },
          '50%':      { boxShadow: '0 0 24px rgba(245,158,11,0.6)' },
        },

        // Music wave bars
        'wave-bar-1': {
          '0%, 100%': { height: '8px' },
          '50%':      { height: '32px' },
        },
        'wave-bar-2': {
          '0%, 100%': { height: '16px' },
          '50%':      { height: '48px' },
        },
        'wave-bar-3': {
          '0%, 100%': { height: '24px' },
          '50%':      { height: '56px' },
        },
        'wave-bar-4': {
          '0%, 100%': { height: '12px' },
          '50%':      { height: '40px' },
        },

        // Tanpura string vibration
        'string-vibrate': {
          '0%, 100%': { transform: 'scaleX(1)' },
          '25%':      { transform: 'scaleX(1.002) skewY(0.3deg)' },
          '75%':      { transform: 'scaleX(0.998) skewY(-0.3deg)' },
        },

        // Shimmer (skeleton loader)
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },

        // Slide in from sides
        'slide-in-left': {
          '0%':   { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',     opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        'slide-in-bottom': {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },

        // Spin (loading)
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },

        // Streak fire flicker
        'flicker': {
          '0%, 100%': { opacity: '1',    transform: 'scale(1)' },
          '33%':      { opacity: '0.85', transform: 'scale(0.97)' },
          '66%':      { opacity: '0.92', transform: 'scale(1.02)' },
        },

        // Milestone celebration bounce
        'bounce-in': {
          '0%':   { transform: 'scale(0.3)', opacity: '0' },
          '50%':  { transform: 'scale(1.05)' },
          '70%':  { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },

        // Number counter tick
        'count-up': {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },

        // Ripple
        'ripple': {
          '0%':   { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },

        // Draw SVG path (for music wave illustration)
        'draw': {
          '0%':   { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },

        // Gold shimmer sweep on premium cards
        'gold-sweep': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },

      animation: {
        'fade-in':       'fade-in 0.4s ease-out forwards',
        'fade-out':      'fade-out 0.3s ease-in forwards',
        'fade-up':       'fade-up 0.5s ease-out forwards',
        'fade-down':     'fade-down 0.5s ease-out forwards',
        'fade-left':     'fade-left 0.5s ease-out forwards',
        'fade-right':    'fade-right 0.5s ease-out forwards',
        'scale-in':      'scale-in 0.3s ease-out forwards',
        'float':         'float 4s ease-in-out infinite',
        'float-slow':    'float-slow 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 5s ease-in-out infinite',
        'pulse-gold':    'pulse-gold 2s ease-in-out infinite',
        'glow-ring':     'glow-ring 2.5s ease-in-out infinite',
        'wave-bar-1':    'wave-bar-1 0.9s ease-in-out infinite',
        'wave-bar-2':    'wave-bar-2 0.7s ease-in-out infinite 0.1s',
        'wave-bar-3':    'wave-bar-3 0.8s ease-in-out infinite 0.2s',
        'wave-bar-4':    'wave-bar-4 1.0s ease-in-out infinite 0.15s',
        'string-vibrate':'string-vibrate 0.3s ease-in-out infinite',
        'shimmer':       'shimmer 1.8s linear infinite',
        'slide-in-left': 'slide-in-left 0.4s ease-out forwards',
        'slide-in-right':'slide-in-right 0.4s ease-out forwards',
        'slide-in-bottom':'slide-in-bottom 0.4s ease-out forwards',
        'spin-slow':     'spin-slow 3s linear infinite',
        'flicker':       'flicker 1.5s ease-in-out infinite',
        'bounce-in':     'bounce-in 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) forwards',
        'ripple':        'ripple 0.6s ease-out forwards',
        'draw':          'draw 2s ease-in-out forwards',
        'gold-sweep':    'gold-sweep 3s linear infinite',
      },

      // ─── TRANSITIONS ───────────────────────────────────────────────────────
      transitionTimingFunction: {
        'bounce-in':  'cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'smooth':     'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring':     'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'premium':    'cubic-bezier(0.22, 1, 0.36, 1)',
      },

      transitionDuration: {
        '50':  '50ms',
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1000':'1000ms',
        '1500':'1500ms',
        '2000':'2000ms',
      },

      // ─── BACKDROP BLUR ─────────────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px',
      },

      // ─── Z-INDEX SCALE ─────────────────────────────────────────────────────
      zIndex: {
        '1':   '1',
        '2':   '2',
        '5':   '5',
        '60':  '60',
        '70':  '70',
        '80':  '80',
        '90':  '90',
        '100': '100',
      },

      // ─── SCREEN BREAKPOINTS ────────────────────────────────────────────────
      screens: {
        'xs':   '375px',
        'sm':   '640px',
        'md':   '768px',
        'lg':   '1024px',
        'xl':   '1280px',
        '2xl':  '1536px',
        '3xl':  '1920px',
        '4xl':  '2560px',
      },

      // ─── ASPECT RATIOS ─────────────────────────────────────────────────────
      aspectRatio: {
        'poster':    '3/4',
        'story':     '9/16',
        'square':    '1/1',
        'video':     '16/9',
        'thumbnail': '16/9',
        'album':     '1/1',
        'card':      '4/3',
      },

      // ─── GRID TEMPLATE COLUMNS ─────────────────────────────────────────────
      gridTemplateColumns: {
        'sidebar': '280px 1fr',
        'sidebar-collapsed': '72px 1fr',
        'dashboard': '280px 1fr 320px',
        'cards-2': 'repeat(2, minmax(0, 1fr))',
        'cards-3': 'repeat(3, minmax(0, 1fr))',
        'cards-4': 'repeat(4, minmax(0, 1fr))',
        'auto-fit-card': 'repeat(auto-fit, minmax(280px, 1fr))',
        'auto-fill-card': 'repeat(auto-fill, minmax(240px, 1fr))',
      },

      // ─── MAX WIDTHS ────────────────────────────────────────────────────────
      maxWidth: {
        'xs':   '20rem',
        'sm':   '24rem',
        'md':   '28rem',
        'lg':   '32rem',
        'xl':   '36rem',
        '2xl':  '42rem',
        '3xl':  '48rem',
        '4xl':  '56rem',
        '5xl':  '64rem',
        '6xl':  '72rem',
        '7xl':  '80rem',
        '8xl':  '88rem',
        'prose':'65ch',
      },
    },
  },

  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),

    // ─── CUSTOM UTILITIES ──────────────────────────────────────────────────
    function ({ addUtilities, addComponents, theme }) {

      // Glassmorphism utilities
      addUtilities({
        '.glass': {
          background: 'rgba(253, 250, 244, 0.72)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(235, 217, 176, 0.5)',
          boxShadow: '0 8px 32px rgba(110, 72, 24, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        },
        '.glass-dark': {
          background: 'rgba(42, 29, 8, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(110, 72, 24, 0.4)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
        '.glass-gold': {
          background: 'rgba(253, 230, 138, 0.25)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          bo
