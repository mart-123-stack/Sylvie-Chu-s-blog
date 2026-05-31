import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'Menlo', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'var(--font-sans), system-ui, sans-serif',
            fontSize: '1.0625rem',
            lineHeight: '1.75',
            maxWidth: '65ch',
            'h1, h2, h3, h4': {
              fontFamily: 'var(--font-serif), Georgia, serif',
              fontWeight: '700',
              letterSpacing: '-0.02em',
            },
            'blockquote': {
              fontFamily: 'var(--font-serif), Georgia, serif',
              fontStyle: 'italic',
              fontWeight: '500',
              borderLeftWidth: '3px',
              borderImage: 'linear-gradient(to bottom, var(--primary), var(--primary-light)) 1',
              backgroundColor: 'rgba(56, 189, 248, 0.05)',
              borderRadius: '0 0.5rem 0.5rem 0',
              padding: '0.75rem 1.25rem',
            },
            'blockquote p:first-of-type': {
              marginTop: 0,
            },
            'blockquote p:last-of-type': {
              marginBottom: 0,
            },
            'hr': {
              border: 'none',
              height: '1px',
              background: 'linear-gradient(to right, transparent, var(--primary-light), transparent)',
              marginTop: '2.5rem',
              marginBottom: '2.5rem',
            },
            'code': {
              fontFamily: 'var(--font-mono), Menlo, monospace',
              fontSize: '0.875em',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              padding: '0.125rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '500',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          },
        },
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
        },
        accent: "var(--accent)",
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
        },
        muted: "var(--muted)",
        border: "var(--border)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;
