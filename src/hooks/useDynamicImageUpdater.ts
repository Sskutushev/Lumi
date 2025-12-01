import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { switchThemeImages } from '../lib/utils/imageOptimizer';

// Hook for dynamically updating images based on theme and language
export const useDynamicImageUpdater = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const updateDynamicImages = () => {
      const imgElements = document.querySelectorAll<HTMLImageElement>(
        'img[data-ru-light][data-ru-dark][data-en-light][data-en-dark]'
      );
      const isDark = document.documentElement.classList.contains('dark');
      const currentLang = i18n.language;

      imgElements.forEach((img) => {
        if (currentLang === 'ru') {
          const newSrc = isDark
            ? img.getAttribute('data-ru-dark')!
            : img.getAttribute('data-ru-light')!;
          // Плавное обновление изображения
          img.style.opacity = '0';
          setTimeout(() => {
            img.setAttribute('src', newSrc);
            img.style.opacity = '1';
          }, 150);
        } else {
          const newSrc = isDark
            ? img.getAttribute('data-en-dark')!
            : img.getAttribute('data-en-light')!;
          // Плавное обновление изображения
          img.style.opacity = '0';
          setTimeout(() => {
            img.setAttribute('src', newSrc);
            img.style.opacity = '1';
          }, 150);
        }
      });
    };

    // Update immediately
    updateDynamicImages();

    // Watch for theme changes
    const themeObserver = new MutationObserver(() => {
      const newTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
      switchThemeImages(newTheme);
      updateDynamicImages();
    });

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Watch for language changes
    const handleLanguageChange = () => {
      updateDynamicImages();
    };

    // Store current language in localStorage
    localStorage.setItem('language', i18n.language);

    i18n.on('languageChanged', handleLanguageChange);

    // Cleanup
    return () => {
      themeObserver.disconnect();
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
};
