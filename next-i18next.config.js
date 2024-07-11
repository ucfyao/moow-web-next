/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
  },
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
  localePath: './public/locales',
  detection: {
    order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
    caches: ['cookie'],
  },
};