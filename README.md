# Lumi

Lumi is a modern and minimalist to-do application designed for focus and simplicity. It provides a clean, intuitive interface for managing tasks and projects without unnecessary features. This project was built with a focus on modern web development practices, including a full-featured backend powered by Supabase.

![Lumi Screenshot](https://raw.githubusercontent.com/Sskutushev/Lumi/main/img/pet-project.jpg)

## Features

- **Clean & Minimal UI**: A user interface designed for focus and efficiency.
- **Project Organization**: Group tasks into distinct projects.
- **Task Prioritization**: Assign priorities (`low`, `medium`, `high`) to tasks.
- **Due Dates**: Set deadlines for tasks to stay on track.
- **Authentication**: Secure sign-up and sign-in with email/password, plus OAuth for Google and GitHub.
- **Real-time Functionality**: Data syncs instantly across sessions, powered by Supabase Realtime.
- **Theming**: Seamless light and dark mode support.
- **Internationalization**: Support for English and Russian.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend-as-a-Service**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Styling**: Tailwind CSS
- **UI & Animation**: Framer Motion, Radix UI, Lucide React
- **State Management**: Zustand
- **Internationalization**: `react-i18next`
- **Testing**: Vitest, React Testing Library

## Project Documentation

For a detailed overview of the project's architecture, database schema, and advanced configurations, please refer to the documentation in the `/docs` directory:

- **[Architecture Overview](./docs/ARCHITECTURE.md)**: A deep dive into the frontend architecture, state management, and API design.
- **[Database Schema](./docs/DATABASE.md)**: Detailed information on the Supabase PostgreSQL schema, RLS policies, and database functions.

## Getting Started

To run this project locally, follow these steps.

### Prerequisites

- Node.js `v18.0.0` or higher
- `npm` `v9.0.0` or higher

### 1. Clone the Repository

```bash
git clone https://github.com/Sskutushev/Lumi.git
cd Lumi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of the project and add your Supabase project credentials. You can find these in your Supabase project dashboard under `Settings > API`.

```env
# .env.local

# Required
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```
*Note: For TypeScript to recognize `import.meta.env`, ensure your `tsconfig.json` includes `"types": ["vite/client"]` or that you have a `vite-env.d.ts` file in your `src` directory.*

### 4. Set Up the Database

The database schema, including tables, policies, and functions, is defined in a migration file.

1.  Navigate to the **SQL Editor** in your Supabase project dashboard.
2.  Open the `supabase/migrations/01_create_tables_and_policies_fixed.sql` file.
3.  Copy its entire content, paste it into the SQL editor, and click **RUN**. This will set up your database.

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Deployment

This project is configured for continuous deployment on Vercel. Any pushes to the `main` branch will trigger a new deployment.

## Contact

- **Portfolio**: [https://sskutushev.site](https://sskutushev.site)
- **Telegram**: [https://t.me/Sskutushev](https://t.me/Sskutushev)
- **GitHub**: [https://github.com/Sskutushev](https://github.com/Sskutushev)
