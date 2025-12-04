import { useState, useEffect } from 'react';

const useReducedMotion = (): boolean => {
  // Check if window is available (client-side)
  if (typeof window === 'undefined') {
    return true; // Default to reduced motion on server side
  }

  // Check if matchMedia is supported
  if (!window.matchMedia) {
    return false; // If matchMedia is not supported, don't reduce motion
  }

  // Create media query for reduced motion
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Set initial state based on media query
  const [reducedMotion, setReducedMotion] = useState<boolean>(mediaQuery.matches);

  useEffect(() => {
    // Handler for media query changes
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup event listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mediaQuery]);

  return reducedMotion;
};

export default useReducedMotion;
