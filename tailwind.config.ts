import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#4F46E5',
        sidebar: '#0E1220',
        bg: '#EEF0F6',
        card: '#FFFFFF',
        subtle: '#FAFBFD',
        border: '#E6E9F1',
        'text-primary': '#11141B',
        'text-secondary': '#5A6172',
        'text-muted': '#7A8198',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04)',
      },
      width: {
        sidebar: '248px',
      },
      height: {
        topbar: '66px',
      },
    },
  },
  plugins: [],
}

export default config
