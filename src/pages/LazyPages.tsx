// src/pages/LazyPages.tsx
import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LazyTodoDashboard = lazy(() => import('./TodoDashboard'));
const LazyProjectView = lazy(() => import('./ProjectView'));
const LazyAuthCallback = lazy(() => import('./AuthCallback'));

const PageLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary"
  >
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin mx-auto text-accent-primary" />
      <p className="mt-4 text-text-tertiary">Loading...</p>
    </div>
  </motion.div>
);

export const LazyTodoDashboardPage = (props: any) => (
  <Suspense fallback={<PageLoader />}>
    <LazyTodoDashboard {...props} />
  </Suspense>
);

export const LazyProjectViewPage = (props: any) => (
  <Suspense fallback={<PageLoader />}>
    <LazyProjectView {...props} />
  </Suspense>
);

export const LazyAuthCallbackPage = (props: any) => (
  <Suspense fallback={<PageLoader />}>
    <LazyAuthCallback {...props} />
  </Suspense>
);
