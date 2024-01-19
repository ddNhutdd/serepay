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
import RUtranslate from "./locales/RUtranslation.json";
import TRtranslate from "./locales/TRtranslation.json";

import ARtranslate from "./locales/ARtranslation.json";
import ELtranslate from "./locales/ELtranslation.json";
import HEtranslate from "./locales/HEtranslation.json";
import HItranslate from "./locales/HItranslation.json";
import MStranslate from "./locales/MStranslation.json";
import NLtranslate from "./locales/NLtranslation.json";
import PLtranslate from "./locales/PLtranslation.json";

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
  tr: "tr",
  ru: "ru",
  nl: "nl",
  ms: "ms",
  ar: "ar",
  he: "he",
  el: "el",
  pl: "pl",
  hi: "hi",
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
  tr: "tr-TR", // Turkish, Turkey
  ru: "ru-RU", // Russian, Russia
  nl: "nl-NL", // Dutch, Netherlands
  ms: "ms-MY", // Malay, Malaysia
  ar: "ar-SA", // Arabic, Saudi Arabia (hoặc quốc gia khác nếu bạn muốn)
  he: "he-IL", // Hebrew, Israel
  el: "el-GR", // Greek, Greece
  pl: "pl-PL", // Polish, Poland
  hi: "hi-IN", // Hindi, India
};
export const availableLanguageMapper = {
  vi: "Vietnam", // Vietnamese
  en: "United States", // English
  ko: "South Korea", // Korean
  ja: "Japan", // Japanese
  zh: "China", // Chinese
  th: "Thailand", // Thai
  km: "Cambodia", // Cambodian
  lo: "Laos", // Lao
  id: "Indonesia", // Indonesian
  fr: "France", // French
  es: "Spain", // Spanish
  it: "Italy", // Italian
  de: "Germany", // German
  pt: "Portugal", // Portuguese
  tr: "Turkey", // Turkish
  ru: "Russia", // Russian
  nl: "Netherlands", // Dutch
  ms: "Malaysia", // Malay
  ar: "Saudi Arabia", // Arabic
  he: "Israel", // Hebrew
  el: "Greece", // Greek
  pl: "Poland", // Polish
  hi: "India", // Hindi
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
  ru: {
    translation: RUtranslate,
  },
  tr: {
    translation: TRtranslate,
  },
  nl: {
    translation: NLtranslate,
  },
  ms: {
    translation: MStranslate,
  },
  ar: {
    translation: ARtranslate,
  },
  he: {
    translation: HEtranslate,
  },
  el: {
    translation: ELtranslate,
  },
  pl: {
    translation: PLtranslate,
  },
  hi: {
    translation: HItranslate,
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
