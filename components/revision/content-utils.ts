import { Explanation, QuestionAsset, Tip, TranslationMap } from '@/lib/types';

const getValue = (payload: unknown, keys: string[]): string | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
};

export const getLocalizedText = (
  fallback: string | undefined,
  translations: TranslationMap | undefined,
  locale: string,
  keys: string[] = ['text']
): string => {
  const translated = getValue(translations?.[locale], keys);
  if (translated) {
    return translated;
  }

  return fallback ?? '';
};

export const normalizeExplanationText = (explanation: Explanation | undefined, locale: string): string => {
  if (!explanation) {
    return '';
  }

  return getLocalizedText(explanation.text, explanation.translations, locale, ['text', 'body']);
};

export const normalizeTipText = (tip: Tip, locale: string): string => {
  const fallback = tip.text ?? tip.body ?? tip.title ?? '';
  return getLocalizedText(fallback, tip.translations, locale, ['tip', 'text', 'body', 'title']);
};

export const sortAssets = (assets: QuestionAsset[] | undefined): QuestionAsset[] => {
  return [...(assets ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};
