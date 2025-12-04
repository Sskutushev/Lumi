// src/hooks/useLazyImage.ts
import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  placeholder?: string;
}

/**
 * A hook to lazy-load images using the Intersection Observer API.
 * @param src - The source URL of the image to load.
 * @param placeholder - An optional placeholder image source (e.g., a low-quality version).
 * @returns An object containing the image source to be used and a ref for the image element.
 */
export const useLazyImage = ({ src, placeholder }: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.src = src;
            img.onload = () => {
              setImageSrc(src);
            };
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 } // Load when 10% of the image is visible
    );

    const currentRef = imageRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [src]);

  return { imageSrc, imageRef };
};
