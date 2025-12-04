import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyComponentProps {
  component: React.LazyExoticComponent<React.FC<any>>;
  fallback?: React.ReactNode;
  [prop: string]: any;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  component: Component,
  fallback = (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
    </div>
  ),
  ...props
}) => {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

export default LazyComponent;
