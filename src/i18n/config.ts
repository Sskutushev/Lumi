import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Импортируем файлы переводов
import en from './locales/en.json';
import ru from './locales/ru.json';

i18n
  .use(LanguageDetector) // Автоматическое определение языка
  .use(initReactI18next) // Подключение к React
  .init({
    resources: {
      en: {
        translation: en,
      },
      ru: {
        translation: ru,
      },
    },
    fallbackLng: 'en', // Язык по умолчанию
    interpolation: {
      escapeValue: false, // Защита от XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;