import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Content Language Store
 * 
 * This store manages the language for DYNAMIC CONTENT ONLY (questions, categories, etc.)
 * It is completely INDEPENDENT from the i18n locale (which controls UI/static translations).
 * 
 * - i18n locale: Controls static UI text (buttons, labels, etc.)
 * - Content language: Controls dynamic content from backend (questions, explanations, tips, categories)
 * 
 * These two systems should NOT affect each other.
 */

export type ContentLanguage = string;//'en' | 'am' | 'ti';

interface ContentLanguageState {
  language: ContentLanguage;
  direction: 'ltr' | 'rtl';
  setLanguage: (language: ContentLanguage, direction?: 'ltr' | 'rtl') => void;
  clearLanguage: () => void;
}

export const useContentLanguageStore = create<ContentLanguageState>()((set) => ({
  language: '',
  direction: 'ltr',
  setLanguage: (language: ContentLanguage, direction: 'ltr' | 'rtl' = 'ltr') => 
    set({ language, direction }),
  clearLanguage: () => set({ language: '', direction: 'ltr' }),
}));
