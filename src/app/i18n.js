import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import auth from "./utils/auth";

function loadLocaleMessages () {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
  const messages = {}
  locales.keys().forEach(key => {
    const matched = key.match(/([a-z0-9]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = { translation: locales(key) }
    }
  })
  return messages
}

const locale = auth.getLocale();

i18n
  .use(initReactI18next) 
  .init({
    resources: loadLocaleMessages(),
    lng: 'en', 
    fallbackLng: 'zh', 
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;