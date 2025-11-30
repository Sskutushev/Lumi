import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 5, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div 
          key={i} 
          className="h-16 bg-bg-secondary animate-pulse rounded-xl"
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;