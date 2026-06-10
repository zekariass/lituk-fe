import { create } from 'zustand'
import { UserLanguageInfo } from '@/lib/types'

interface UserLanguageState {
  userLanguages: UserLanguageInfo[]
  isLoading: boolean
  error: string | null
  setUserLanguages: (languages: UserLanguageInfo[]) => void
  addUserLanguage: (language: UserLanguageInfo) => void
  removeUserLanguage: (id: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearUserLanguages: () => void
}

export const useUserLanguageStore = create<UserLanguageState>((set) => ({
  userLanguages: [],
  isLoading: false,
  error: null,
  
  setUserLanguages: (languages) => set({ userLanguages: languages, error: null }),
  
  addUserLanguage: (language) => set((state) => ({
    userLanguages: [...state.userLanguages, language]
  })),
  
  removeUserLanguage: (id) => set((state) => ({
    userLanguages: state.userLanguages.filter(lang => lang.id !== id)
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  clearUserLanguages: () => set({ userLanguages: [], error: null })
}))
