import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ja from './locales/ja.json';

let savedLanguage = 'ja';
try {
    savedLanguage = localStorage.getItem('language') || 'ja';
} catch (e) {
    console.warn('localStorage not available, using default language');
}

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ja: { translation: ja },
        },
        lng: savedLanguage,
        fallbackLng: 'ja',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

export default i18n;
