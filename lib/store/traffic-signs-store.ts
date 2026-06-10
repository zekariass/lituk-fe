import { create } from 'zustand'

export interface TrafficSignAsset {
  url: string
  type: string
  contentType: string
  size: number
  filename: string
  alt?: string | null
  order?: number | null
  caption?: string | null
  uploadedAt: string
}

export interface TrafficSignTranslations {
  am?: {
    name?: string
    description?: string
    caption?: string
  }
  ti?: {
    name?: string
    description?: string
    caption?: string
  }
}

export interface TrafficSignCategory {
  id: number
  jurisdictionId: number
  name: string
  description: string
  asset?: {
    url: string
    type: string
    contentType: string
    size: number
    filename: string
    alt?: string | null
    caption?: string | null
    order?: number | null
    uploadedAt: string
  }
  translations: TrafficSignTranslations
  isActive: boolean
}

export interface TrafficSign {
  id: number
  categoryId: number
  description: string
  translations: TrafficSignTranslations
  signAsset: TrafficSignAsset
  additionalAssets: TrafficSignAsset[]
  realLifeAssets: TrafficSignAsset[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface TrafficSignsPage {
  content: TrafficSign[]
  page: {
    number: number
    size: number
    totalElements: number
    totalPages: number
  }
}

interface TrafficSignsState {
  categories: TrafficSignCategory[]
  signs: TrafficSign[]
  currentCategoryId: number | null
  currentSignIndex: number
  currentPage: number
  totalPages: number
  isLoading: boolean
  error: string | null
  
  setCategories: (categories: TrafficSignCategory[]) => void
  setSigns: (signs: TrafficSign[], page: number, totalPages: number) => void
  appendSigns: (signs: TrafficSign[], page: number, totalPages: number) => void
  setCurrentCategoryId: (categoryId: number) => void
  setCurrentSignIndex: (index: number) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
  getCurrentSign: () => TrafficSign | null
  hasNextSign: () => boolean
  hasPreviousSign: () => boolean
  nextSign: () => void
  previousSign: () => void
}

export const useTrafficSignsStore = create<TrafficSignsState>((set, get) => ({
  categories: [],
  signs: [],
  currentCategoryId: null,
  currentSignIndex: 0,
  currentPage: 0,
  totalPages: 0,
  isLoading: false,
  error: null,

  setCategories: (categories) => set({ categories }),
  
  setSigns: (signs, page, totalPages) => 
    set({ signs, currentPage: page, totalPages, currentSignIndex: 0 }),
  
  appendSigns: (signs, page, totalPages) => 
    set((state) => ({ 
      signs: [...state.signs, ...signs], 
      currentPage: page, 
      totalPages 
    })),
  
  setCurrentCategoryId: (categoryId) => 
    set({ currentCategoryId: categoryId, currentSignIndex: 0 }),
  
  setCurrentSignIndex: (index) => set({ currentSignIndex: index }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  reset: () => set({ 
    signs: [], 
    currentCategoryId: null, 
    currentSignIndex: 0,
    currentPage: 0,
    totalPages: 0,
    error: null 
  }),
  
  getCurrentSign: () => {
    const { signs, currentSignIndex } = get()
    return signs[currentSignIndex] || null
  },
  
  hasNextSign: () => {
    const { signs, currentSignIndex, currentPage, totalPages } = get()
    return currentSignIndex < signs.length - 1 || currentPage < totalPages - 1
  },
  
  hasPreviousSign: () => {
    const { currentSignIndex } = get()
    return currentSignIndex > 0
  },
  
  nextSign: () => {
    const { signs, currentSignIndex } = get()
    if (currentSignIndex < signs.length - 1) {
      set({ currentSignIndex: currentSignIndex + 1 })
    }
  },
  
  previousSign: () => {
    const { currentSignIndex } = get()
    if (currentSignIndex > 0) {
      set({ currentSignIndex: currentSignIndex - 1 })
    }
  },
}))
