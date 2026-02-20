import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../public/locales/en.json';
import zh from '../public/locales/zh.json';

export const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'zh', // if you're using a language detector, do not define the lng option
    fallbackLng: 'zh',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });
