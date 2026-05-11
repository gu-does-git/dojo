import { defineConfig, presetUno, presetIcons } from 'unocss';

export default defineConfig({
  presets: [presetUno(), presetIcons()],
  theme: {
    colors: {
      // Light mode
      light: {
        bg: '#ffffff',
        surface: '#f4f4f8',
        border: '#e2e2ec',
        text: '#0f0f13',
        muted: '#6b6b80',
      },
      // Dark mode
      dark: {
        bg: '#0f0f13',
        surface: '#1a1a24',
        border: '#2a2a38',
        text: '#e8e8f0',
        muted: '#7070a0',
      },
      // Accents
      accent: '#6366f1',
      'accent-dark': '#818cf8',
      accent2: '#8b5cf6',
      'accent2-dark': '#a78bfa',
      // Feedback
      success: '#22c55e',
      'success-dark': '#4ade80',
      error: '#ef4444',
      'error-dark': '#f87171',
    },
    fontSize: {
      xs: ['12px', '16px'],
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['18px', '28px'],
      xl: ['20px', '28px'],
      '2xl': ['24px', '32px'],
      '3xl': ['30px', '36px'],
      '4xl': ['36px', '40px'],
      '5xl': ['48px', '48px'],
    },
    spacing: {
      0: '0px',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      8: '32px',
      10: '40px',
      12: '48px',
      16: '64px',
      20: '80px',
      24: '96px',
    },
    borderRadius: {
      none: '0px',
      sm: '4px',
      base: '6px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
  },
  rules: [
    // Font families
    [
      /^font-inter$/,
      () => ({
        'font-family': 'var(--font-inter, Inter, sans-serif)',
      }),
    ],
    [
      /^font-noto$/,
      () => ({
        'font-family': 'var(--font-noto-sans-jp, Noto Sans JP, sans-serif)',
      }),
    ],
    // Dark mode toggle
    [
      /^dark:/,
      ([, body]) => {
        return {
          '.dark &': { ...body },
        };
      },
    ],
  ],
  shortcuts: {
    // Typography
    'text-xs': 'text-xs font-inter leading-tight',
    'text-sm': 'text-sm font-inter leading-normal',
    'text-base': 'text-base font-inter leading-relaxed',
    'text-lg': 'text-lg font-inter leading-relaxed',
    'text-xl': 'text-xl font-inter font-semibold leading-tight',
    'text-2xl': 'text-2xl font-inter font-semibold leading-tight',
    'text-3xl': 'text-3xl font-inter font-bold leading-tight',
    'text-4xl': 'text-4xl font-inter font-bold leading-tight',
    'text-5xl': 'text-5xl font-inter font-bold leading-tight',

    // Japanese text
    'jp-body': 'font-noto text-base',
    'jp-large': 'font-noto text-5xl',

    // Layouts
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'grid-cols-auto': 'grid auto-cols-fr',

    // Cards
    'card-base': 'rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border p-4',
    'card-lg': 'rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border p-6',

    // Buttons
    'btn-base': 'px-4 py-2 rounded-md font-medium transition',
    'btn-primary': 'btn-base bg-accent dark:bg-accent-dark text-white hover:opacity-90',
    'btn-secondary': 'btn-base bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:bg-light-border dark:hover:bg-dark-border',

    // Inputs
    'input-base': 'px-3 py-2 rounded-md border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0',

    // Text colors
    'text-primary': 'text-light-text dark:text-dark-text',
    'text-secondary': 'text-light-muted dark:text-dark-muted',

    // Background
    'bg-base': 'bg-white dark:bg-dark-bg',
  },
});
