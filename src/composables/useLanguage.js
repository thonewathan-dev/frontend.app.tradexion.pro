import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// Import flag images
import usaFlag from '../assets/lang-flag/usa-flag.png';
import germenyFlag from '../assets/lang-flag/germeny-flag.png';
import indiaFlag from '../assets/lang-flag/india-hindi-flag.png';
import japanFlag from '../assets/lang-flag/japan-flag.png';
import portugalFlag from '../assets/lang-flag/portugal-flag.png';
import russiaFlag from '../assets/lang-flag/russia-flag.png';
import koreaFlag from '../assets/lang-flag/sourthkorea-flag.png';
import spainFlag from '../assets/lang-flag/spin-flag.png';

export const languages = [
  { code: 'en', name: 'English', flag: usaFlag },
  { code: 'de', name: 'Deutsch', flag: germenyFlag },
  { code: 'hi', name: 'हिन्दी', flag: indiaFlag },
  { code: 'ja', name: '日本語', flag: japanFlag },
  { code: 'pt', name: 'Português', flag: portugalFlag },
  { code: 'ru', name: 'Русский', flag: russiaFlag },
  { code: 'ko', name: '한국어', flag: koreaFlag },
  { code: 'es', name: 'Español', flag: spainFlag },
];

export function useLanguage() {
  const { locale } = useI18n();
  const showLanguageMenu = ref(false);

  const currentLanguage = computed(() => locale.value);

  const getCurrentFlag = () => {
    const lang = languages.find(l => l.code === currentLanguage.value);
    return lang ? lang.flag : languages[0].flag;
  };

  const changeLanguage = (langCode) => {
    locale.value = langCode;
    localStorage.setItem('locale', langCode);
    showLanguageMenu.value = false;
  };

  return {
    languages,
    currentLanguage,
    showLanguageMenu,
    getCurrentFlag,
    changeLanguage,
  };
}
