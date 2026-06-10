export const locales = [
  'en', 'am', 'ar', 'bg', 'bn', 'cs', 'el', 'es', 'fa', 'fr',
  'gu', 'hi', 'hu', 'it', 'ku', 'lt', 'lv', 'ne', 'pa', 'pl',
  'prs', 'ps', 'pt', 'ro', 'ru', 'sk', 'so', 'sq', 'ta', 'ti',
  'tl', 'tr', 'uk', 'ur', 'zh'
] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  am: 'Amharic',
  ar: 'Arabic',
  bg: 'Bulgarian',
  bn: 'Bengali',
  cs: 'Czech',
  el: 'Greek',
  es: 'Spanish',
  fa: 'Farsi',
  fr: 'French',
  gu: 'Gujarati',
  hi: 'Hindi',
  hu: 'Hungarian',
  it: 'Italian',
  ku: 'Kurdish',
  lt: 'Lithuanian',
  lv: 'Latvian',
  ne: 'Nepali',
  pa: 'Punjabi',
  pl: 'Polish',
  prs: 'Dari',
  ps: 'Pashto',
  pt: 'Portuguese',
  ro: 'Romanian',
  ru: 'Russian',
  sk: 'Slovak',
  so: 'Somali',
  sq: 'Albanian',
  ta: 'Tamil',
  ti: 'Tigrinya',
  tl: 'Filipino',
  tr: 'Turkish',
  uk: 'Ukrainian',
  ur: 'Urdu',
  zh: 'Chinese'
};

export const defaultLocale: Locale = 'en';
