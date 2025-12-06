// src/lib/utils/imageOptimizer.ts
import { useEffect, useState } from 'react';

// Preloads images for the current theme to avoid flickering
export const preloadThemeImages = (theme: 'light' | 'dark') => {
  const imageMap: Record<string, Record<string, string>> = {
    ru: {
      light: '/images/ru_light.jpg',
      dark: '/images/ru_dark.jpg',
    },
    en: {
      light: '/images/en_light.jpg',
      dark: '/images/en_dark.jpg',
    },
  };

  Object.values(imageMap).forEach((langImages) => {
    const imgSrc = langImages[theme];
    if (imgSrc) {
      const img = new Image();
      img.src = imgSrc;
    }
  });
};

// Custom hook to handle theme-based images
export const useThemedImage = (baseName: string) => {
  const [theme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('light') ? 'light' : 'dark';
    }
    return 'dark';
  });

  // Determines the image path based on the current theme
  const getImagePath = () => {
    if (baseName.includes('light') || baseName.includes('dark')) {
      // If the filename already contains the theme, return as is
      return baseName;
    }

    // For specific theme images
    if (baseName.includes('ru')) {
      return theme === 'light'
        ? '/src/assets/images/ru_light.jpg'
        : '/src/assets/images/ru_dark.jpg';
    } else if (baseName.includes('en')) {
      return theme === 'light'
        ? '/src/assets/images/en_light.jpg'
        : '/src/assets/images/en_dark.jpg';
    }

    return baseName;
  };

  return getImagePath();
};

// Utility to cache an image
export const cacheImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
};

// Utility for lazy loading images with theme support
export const useLazyImage = (src: string, fallback?: string) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      if (fallback) {
        setImageSrc(fallback);
      }
      setIsLoading(false);
      setHasError(true);
    };
    img.src = src;
  }, [src, fallback]);

  return { imageSrc, isLoading, hasError };
};

// Utility to switch images when the theme changes
export const switchThemeImages = (newTheme: 'light' | 'dark') => {
  // Update images on the page when the theme changes
  const images = document.querySelectorAll('img[data-theme-src]');
  images.forEach((img) => {
    const themeSrc = img.getAttribute(`data-${newTheme}-src`);
    if (themeSrc) {
      const currentSrc = img.getAttribute('src');
      if (currentSrc !== themeSrc) {
        img.setAttribute('src', themeSrc);
      }
    }
  });

  // Also update background images
  const elementsWithBg = document.querySelectorAll('[data-theme-bg]');
  elementsWithBg.forEach((el) => {
    const themeBg = el.getAttribute(`data-${newTheme}-bg`);
    if (themeBg) {
      (el as HTMLElement).style.backgroundImage = `url(${themeBg})`;
    }
  });
};

// Utility to get the correct image URL based on language and theme
export const getThemedImageUrls = (
  language: string,
  theme: 'light' | 'dark'
): { desktop: string; mobile: string } => {
  const lang = language === 'ru' ? 'ru' : 'en';
  const themeKey = theme === 'dark' ? 'dark' : 'light';

  const desktop = `/images/${lang}_${themeKey}.jpg`;
  const mobile = `/images/${lang}_${themeKey}_mobile.jpg`;

  return { desktop, mobile };
};
