import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import de from './locales/de.json';
import hi from './locales/hi.json';
import ja from './locales/ja.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import ko from './locales/ko.json';
import es from './locales/es.json';

const messages = {
  en,
  de,
  hi,
  ja,
  pt,
  ru,
  ko,
  es,
};

// Get saved language or default to English
const savedLocale = localStorage.getItem('locale') || 'en';

const i18n = createI18n({
  locale: savedLocale,
  fallbackLocale: 'en',
  messages,
  legacy: false,
  globalInjection: true,
});

export default i18n;
