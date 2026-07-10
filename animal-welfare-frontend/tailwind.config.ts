import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — Animal Welfare platform
        forest: {
          DEFAULT: '#2D6A4F',
          50:  '#f0faf4',
          100: '#d8f3e3',
          200: '#b0e5c8',
          300: '#7dcfa9',
          400: '#4db387',
          500: '#2D6A4F',
          600: '#256045',
          700: '#1e4f39',
          800: '#17402e',
          900: '#0f2d20',
          950: '#091a12',
        },
        sage: {
          DEFAULT: '#74C69D',
          50:  '#f2fbf6',
          100: '#d8f3e4',
          200: '#b2e6cb',
          300: '#74C69D',
          400: '#52af84',
          500: '#3a966b',
          600: '#2e7857',
          700: '#275f47',
          800: '#224d3a',
          900: '#1c3e2f',
        },
        cream: {
          DEFAULT: '#FFF8F0',
          50:  '#fffdf9',
          100: '#FFF8F0',
          200: '#fceedd',
          300: '#f9e0c4',
          400: '#f5ceaa',
        },
        brown: {
          DEFAULT: '#8B5E3C',
          50:  '#fdf6f0',
          100: '#f7e6d5',
          200: '#eecaad',
          300: '#e2a87e',
          400: '#d4844e',
          500: '#8B5E3C',
          600: '#7a5233',
          700: '#63432a',
          800: '#503622',
          900: '#3e2a1a',
        },
        orange: {
          DEFAULT: '#F4A261',
          50:  '#fff8f0',
          100: '#fdecd6',
          200: '#fad5a8',
          300: '#F4A261',
          400: '#f08c3e',
          500: '#e8751e',
          600: '#d06018',
          700: '#a84e14',
          800: '#863e10',
          900: '#6b310d',
        },
        dark: {
          DEFAULT: '#1B4332',
          green: '#1B4332',
          text: '#1a1a1a',
        },
        light: {
          sage: '#D8F3DC',
        },
        // shadcn/ui semantic tokens (mapped to our palette)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':        'fade-in 0.35s ease-out both',
        'slide-in':       'slide-in 0.3s ease-out',
        'fadeIn':         'fade-in 0.35s ease-out both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
