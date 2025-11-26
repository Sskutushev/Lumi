import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Function to update dynamic images based on language and theme
export const useDynamicImages = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Function to update image sources
    const updateImageSources = () => {
      const imageElements = document.querySelectorAll('img[data-dynamic]');
      
      imageElements.forEach(img => {
        const ruLightSrc = img.getAttribute('data-ru-light');
        const ruDarkSrc = img.getAttribute('data-ru-dark');
        const enLightSrc = img.getAttribute('data-en-light');
        const enDarkSrc = img.getAttribute('data-en-dark');
        
        if (ruLightSrc && ruDarkSrc && enLightSrc && enDarkSrc) {
          const isDark = document.documentElement.classList.contains('dark');
          const currentLang = i18n.language;
          
          let newSrc = '';
          if (currentLang === 'ru') {
            newSrc = isDark ? ruDarkSrc : ruLightSrc;
          } else {
            newSrc = isDark ? enDarkSrc : enLightSrc;
          }
          
          img.setAttribute('src', newSrc);
        }
      });
    };

    // Observer for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateImageSources();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Update images when language changes
    const handleLanguageChange = () => {
      updateImageSources();
    };

    // Initialize images
    updateImageSources();

    // Add event listeners
    document.addEventListener('languageChange', handleLanguageChange);

    // Cleanup
    return () => {
      observer.disconnect();
      document.removeEventListener('languageChange', handleLanguageChange);
    };
  }, [i18n.language]);

  return null;
};