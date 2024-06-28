import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en.json';
import translationZH from './locales/zh.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: translationEN
      },
      zh: {
        translation: translationZH
      }
    },
    lng: "en", // 默认语言
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;