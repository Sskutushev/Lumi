/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
        success: 'var(--success)',
        error: 'var(--error)',
        warning: 'var(--warning)',
        info: 'var(--info)',
        border: 'var(--border)',
        'border-hover': 'var(--border-hover)',
      },
      fontFamily: {
        primary: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
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
        glow: 'var(--glow-primary)',
        'glow-lg': 'var(--glow-accent)',
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },
      screens: {
        sm: '640px', // Мобильные устройства
        md: '768px', // Планшеты
        lg: '1024px', // Ноутбуки
        xl: '1280px', // Большие экраны
        '2xl': '1536px', // Очень большие экраны
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
    },
  },
  plugins: [
    // Плагин для обеспечения кроссбраузерной совместимости
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('@tailwindcss/typography'),
  ],
};
