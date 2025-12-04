// src/components/common/SkeletonLoader.tsx
import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 5, className = 'h-16' }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className={`bg-bg-secondary animate-pulse rounded-xl ${className}`} />
    ))}
  </div>
);

export default SkeletonLoader;
