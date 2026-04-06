/* =========================================================
   i18n.js — i18next configuration.
   - Default language: Spanish (es)
   - Auto-detects browser language via i18next-browser-languagedetector
   - Detection order: localStorage (user preference) → navigator (browser locale)
   - Falls back to Spanish if the detected language is not supported
   ========================================================= */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from './locales/es.json';
import en from './locales/en.json';

i18n
  /* Detect browser language */
  .use(LanguageDetector)
  /* Pass the i18n instance to react-i18next */
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },

    /* Spanish is the default language */
    fallbackLng: 'es',

    /* Only these two languages are supported */
    supportedLngs: ['es', 'en'],

    detection: {
      /* Check localStorage first (manual toggle), then the browser locale */
      order: ['localStorage', 'navigator', 'htmlTag'],
      /* Persist the user's choice to localStorage */
      caches: ['localStorage'],
      /* Key used in localStorage */
      lookupLocalStorage: 'bm_language',
    },

    interpolation: {
      /* React already escapes values — no need for i18next to do it too */
      escapeValue: false,
    },
  });

export default i18n;
