import i18n from "i18next";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import VItranslate from "./locales/VItranslation.json";
import ENtranslate from "./locales/ENtranslation.json";
import KOtranslate from "./locales/KOtranslation.json";
import JAtranslate from "./locales/JAtranslation.json";
import ZHtranslate from "./locales/ZHtranslation.json";
import THtranslate from "./locales/THtranslation.json";
import KMtranslate from "./locales/KMtranslation.json";
import LOtranslate from "./locales/LOtranslation.json";
import IDtranslate from "./locales/IDtranslation.json";
import FRtranslate from "./locales/FRtranslation.json";
import EStranslate from "./locales/EStranslation.json";
import DEtranslate from "./locales/DEtranslation.json";
import ITtranslate from "./locales/ITtranslation.json";
import PTtranslate from "./locales/PTtranslation.json";
export const availableLanguage = {
  vi: "vi",
  en: "en",
  ko: "ko",
  ja: "ja",
  zh: "zh",
  th: "th",
  km: "km",
  lo: "lo",
  id: "id",
  fr: "fr",
  es: "es",
  it: "it",
  de: "de",
  pt: "pt",
};
export const availableLanguageCodeMapper = {
  vi: "vi-VN", // Tiếng Việt, Việt Nam
  en: "en-US", // English, United States
  ko: "ko-KR", // Korean, Republic of Korea
  ja: "ja-JP", // Japanese, Japan
  zh: "zh-CN", // Chinese, China
  th: "th-TH", // Thai, Thailand
  km: "km-KH", // Khmer, Cambodia
  lo: "lo-LA", // Lao, Lao People's Democratic Republic
  id: "id-ID", // Indonesian, Indonesia
  fr: "fr-FR", // French, France
  es: "es-ES", // Spanish, Spain
  it: "it-IT", // Italian, Italy
  de: "de-DE", // German, Germany
  pt: "pt-PT", // Portuguese, Portugal
};
export const availableLanguageMapper = {
  vi: "Vietnamese",
  en: "English",
  ko: "Korean",
  ja: "Japanese",
  zh: "Chinese",
  th: "Thai",
  km: "Cambodian",
  lo: "Lao",
  id: "Indonesian",
  fr: "French",
  es: "Spanish",
  it: "Italian",
  de: "German",
  pt: "Portuguese",
};
// the translations
const resources = {
  vi: {
    translation: VItranslate,
  },
  en: {
    translation: ENtranslate,
  },
  ko: {
    translation: KOtranslate,
  },
  ja: {
    translation: JAtranslate,
  },
  zh: {
    translation: ZHtranslate,
  },
  th: {
    translation: THtranslate,
  },
  km: {
    translation: KMtranslate,
  },
  lo: {
    translation: LOtranslate,
  },
  id: {
    translation: IDtranslate,
  },
  fr: {
    translation: FRtranslate,
  },
  es: {
    translation: EStranslate,
  },
  it: {
    translation: ITtranslate,
  },
  pt: {
    translation: PTtranslate,
  },
  de: {
    translation: DEtranslate,
  },
};

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: availableLanguage.en,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
