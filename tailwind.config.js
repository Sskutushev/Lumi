/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Цвета из плана
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'bg-elevated': 'var(--bg-elevated)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-disabled': 'var(--text-disabled)',
        'accent-primary': 'var(--accent-primary)',
        'accent-secondary': 'var(--accent-secondary)',
        'accent-tertiary': 'var(--accent-tertiary)',
        'accent-gradient-1': 'var(--accent-gradient-1)',
        'accent-gradient-2': 'var(--accent-gradient-2)',
        'accent-gradient-3': 'var(--accent-gradient-3)',
        'success': 'var(--success)',
        'error': 'var(--error)',
        'warning': 'var(--warning)',
        'info': 'var(--info)',
        'border': 'var(--border)',
        'border-hover': 'var(--border-hover)',
      },
      fontFamily: {
        'primary': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '4xl': 'calc(var(--radius) + 8px)',
      },
      backgroundImage: {
        'accent-gradient-1': 'var(--accent-gradient-1)',
        'accent-gradient-2': 'var(--accent-gradient-2)',
        'accent-gradient-3': 'var(--accent-gradient-3)',
      },
      boxShadow: {
        'glow': 'var(--glow-primary)',
        'glow-lg': 'var(--glow-accent)',
        'xs': 'var(--shadow-xs)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },
    },
  },
  plugins: [],
}