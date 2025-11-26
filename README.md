# Lumi - Modern Todo Application

A sleek, intuitive, and beautifully designed todo application that focuses on simplicity and user experience without unnecessary clutter.

## 🌟 Features

- **Clean & Minimal UI**: Designed for quick task management without distractions
- **Light/Dark Theme**: Automatic theme switching with seamless transitions
- **Multi-language Support**: English and Russian localization
- **Responsive Design**: Optimized for all device sizes (mobile, tablet, desktop)
- **Project Management**: Organize tasks into customizable projects
- **Task Prioritization**: Set priorities (low, medium, high) for your tasks
- **Deadline Tracking**: Visualize upcoming and overdue tasks
- **OAuth Authentication**: Sign in with Google or GitHub
- **Real-time Updates**: Powered by Supabase backend
- **Open Source**: Completely free to use and contribute to

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Internationalization**: i18next
- **State Management**: Zustand
- **Backend**: Supabase (Auth, Database, Real-time)
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Sskutushev/Lumi.git
cd Lumi
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Visit `http://localhost:5173` in your browser

## 📁 Project Structure

```
src/
├── assets/              # Static assets (images, icons)
├── components/          # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── landing/         # Landing page components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
├── i18n/                # Internationalization configurations
├── pages/               # Page components
├── store/               # Zustand stores
├── styles/              # Global styles
└── types/               # Type definitions
```

## 🎨 Design System

Lumi follows a modern design system with:

- **Color Scheme**: Carefully crafted light and dark themes
- **Typography**: Inter font family with proper hierarchy
- **Spacing**: Consistent 8-point grid system
- **Borders**: Smooth rounded corners with `var(--radius)` variable
- **Shadows**: Layered shadows for depth perception

## 🌍 Internationalization

The application supports both English and Russian languages. Translation keys are managed in the `src/i18n/locales/` directory.

To add a new translation:
1. Add the key-value pair to `en.json` and `ru.json`
2. Use the key with the `t` function: `{t('common.signIn')}`

## 🎯 Theming

Lumi supports light and dark themes. Themes can be switched via the theme toggle in the header or automatically based on system preference.

Custom theme variables are defined in `src/styles/globals.css` and can be customized by adjusting the CSS variables.

## 🗂️ Project Management

Users can create and manage projects to organize their tasks. Each task can belong to a specific project, allowing for better organization and filtering.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Contact

- Portfolio: [https://sskutushev.site](https://sskutushev.site)
- Telegram: [https://t.me/Sskutushev](https://t.me/Sskutushev)
- GitHub: [https://github.com/Sskutushev](https://github.com/Sskutushev)

---

Made with ❤️ using modern web technologies.