import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LocalSettingsState {
  showOriginalAndTranslation: boolean;
  setShowOriginalAndTranslation: (value: boolean) => void;
}

export const useLocalSettingsStore = create<LocalSettingsState>()(
  persist(
    (set) => ({
      showOriginalAndTranslation: true,
      setShowOriginalAndTranslation: (value) => set({ showOriginalAndTranslation: value }),
    }),
    {
      name: 'lituk-local-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
