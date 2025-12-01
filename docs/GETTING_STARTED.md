# Getting Started with Lumi

This document provides instructions on how to set up your development environment, install dependencies, and run the Lumi application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18 or higher. You can download it from [nodejs.org](https://nodejs.org/).
- **npm**: Comes bundled with Node.js.
- **Git**: For cloning the repository.
- **Supabase Project**: A running Supabase project with the database schema applied (see [Database Documentation](DATABASE.md)).

## 1. Clone the Repository

First, clone the Lumi repository to your local machine:

```bash
git clone <repository_url>
cd Lumi
```

## 2. Install Dependencies

Navigate to the project root directory and install the Node.js dependencies:

```bash
npm install
```

## 3. Environment Setup

Lumi requires environment variables for connecting to your Supabase project. Create a `.env.local` file in the project root directory (if it doesn't already exist) and add the following:

```
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

- Replace `YOUR_SUPABASE_URL` with your Supabase project URL.
- Replace `YOUR_SUPABASE_ANON_KEY` with your Supabase project's `anon` public key.

You can find these values in your Supabase project settings under `API`.

## 4. Database Setup

Ensure your Supabase project has the necessary tables, RLS policies, and functions applied. You can find the SQL migration script in `supabase/migrations/01_create_tables_and_policies_fixed.sql`.

**Steps to apply the schema:**

1.  Go to your Supabase project dashboard.
2.  Navigate to the "SQL Editor" section.
3.  Open `supabase/migrations/01_create_tables_and_policies_fixed.sql` from your local project.
4.  Copy the entire content of the SQL file.
5.  Paste it into the Supabase SQL Editor and run the query.

This will create the `users_profile`, `projects`, and `tasks` tables, set up RLS, and define all necessary trigger functions.

## 5. Running the Application

Once the dependencies are installed and environment variables are set, you can start the development server:

```bash
npm run dev
```

The application will typically be available at `http://localhost:5173`.

## 6. Running Tests

To run the unit and component tests:

```bash
npm test
```

To run tests in watch mode:

```bash
npm test -- --watch
```

To run tests with UI:

```bash
npm run test:ui
```

## 7. Building for Production

To create a production-ready build of the application:

```bash
npm run build
```

The build output will be located in the `dist/` directory.

## Troubleshooting

Refer to the [Troubleshooting Guide](TROUBLESHOOTING.md) for common issues and solutions.
