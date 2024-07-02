import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import nextI18NextConfig from './next-i18next.config';

i18next
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: nextI18NextConfig.i18n.defaultLocale,
    supportedLngs: nextI18NextConfig.i18n.locales,
    backend: nextI18NextConfig.i18n.localePath,
  });

export default i18next;
