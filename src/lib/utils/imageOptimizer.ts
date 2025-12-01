// src/lib/utils/imageOptimizer.ts
import { useEffect, useState } from 'react';

// Утилита для предзагрузки изображений для текущей темы
export const preloadThemeImages = (theme: 'light' | 'dark') => {
  const imageMap: Record<string, Record<string, string>> = {
    ru: {
      light: '/src/assets/images/ru_light.jpg',
      dark: '/src/assets/images/ru_dark.jpg',
    },
    en: {
      light: '/src/assets/images/en_light.jpg',
      dark: '/src/assets/images/en_dark.jpg',
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

// Кастомный хук для обработки изображений с учетом темы
export const useThemedImage = (baseName: string) => {
  const [theme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('light') ? 'light' : 'dark';
    }
    return 'dark';
  });

  // Определяем путь к изображению в зависимости от темы
  const getImagePath = () => {
    if (baseName.includes('light') || baseName.includes('dark')) {
      // Если имя файла уже содержит тему, возвращаем как есть
      return baseName;
    }

    // Для специфичных изображений темы
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

// Утилита для кэширования изображений
export const cacheImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
};

// Утилита для ленивой загрузки изображений с поддержкой темы
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

// Утилита для переключения изображений при смене темы
export const switchThemeImages = (newTheme: 'light' | 'dark') => {
  // Обновляем изображения на странице при смене темы
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

  // Обновляем также фоны с изображениями
  const elementsWithBg = document.querySelectorAll('[data-theme-bg]');
  elementsWithBg.forEach((el) => {
    const themeBg = el.getAttribute(`data-${newTheme}-bg`);
    if (themeBg) {
      (el as HTMLElement).style.backgroundImage = `url(${themeBg})`;
    }
  });
};

// Утилита для получения правильного изображения в зависимости от темы
export const getThemedImageUrl = (language: string, theme: 'light' | 'dark'): string => {
  const imageMap: Record<string, Record<string, string>> = {
    ru: {
      light: '/src/assets/images/ru_light.jpg',
      dark: '/src/assets/images/ru_dark.jpg',
    },
    en: {
      light: '/src/assets/images/en_light.jpg',
      dark: '/src/assets/images/en_dark.jpg',
    },
  };

  return imageMap[language]?.[theme] || imageMap.en[theme];
};
