import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '@/i18n/config'

export type StaticLocale = Locale

interface StaticContentLanguageState {
  locale: Locale
  direction: 'ltr' | 'rtl'
  setLocale: (locale: Locale, direction: 'ltr' | 'rtl') => void
}

export const useStaticContentLanguageStore = create<StaticContentLanguageState>()(
  persist(
    (set) => ({
      locale: 'en',
      direction: 'ltr',
      setLocale: (locale, direction) => set({ locale, direction }),
    }),
    {
      name: 'static-content-language-storage',
    }
  )
)
